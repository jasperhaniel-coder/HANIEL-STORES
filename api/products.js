// GET /api/products
//
// Returns products one page at a time, so the shop stays fast whether you
// have 17 products or 17,000.
//
// Optional query parameters:
//   page      page number, starting at 1                (default 1)
//   limit     products per page, 1-50                   (default 12)
//   category  category name or slug, e.g. Gaming
//   search    text matched against product and category names
//   sort      default | price-low | price-high | name-a | name-z | rating | newest
//   section   flash | best   (the home-page sections)
//   ids       comma-separated product ids, e.g. 1,2,3   (max 50)
//
// Response:
//   { products: [...], page, limit, total, totalPages }

const { getPublicClient } = require("../lib/supabase");
const { sendJson, sendError, one, clampInt, cleanSearch } = require("../lib/http");

const COLUMNS = `
  id, slug, name, description, price, old_price, discount_percent,
  rating, reviews_count, image_url, gallery,
  track_inventory, stock_quantity, is_flash_sale, is_best_selling,
  categories!inner ( name, slug )
`;

// How each sort option orders the results. "id" is always the last
// tie-breaker so pages never repeat or skip a product.
const SORTS = {
  default: [["id", true]],
  "price-low": [["price", true], ["id", true]],
  "price-high": [["price", false], ["id", true]],
  "name-a": [["name", true], ["id", true]],
  "name-z": [["name", false], ["id", true]],
  rating: [["rating", false], ["reviews_count", false], ["id", true]],
  newest: [["created_at", false], ["id", false]],
};

// Categories rarely change, so remember them for a minute instead of
// asking the database on every request.
let categoryCache = { at: 0, list: [] };

async function getCategories(client, { force = false } = {}) {
  if (!force && Date.now() - categoryCache.at < 60_000) return categoryCache.list;

  const { data, error } = await client
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true);

  if (error) throw error;

  categoryCache = { at: Date.now(), list: data };
  return data;
}

function toProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || "",
    price: Number(row.price),
    oldPrice: row.old_price == null ? null : Number(row.old_price),
    discount: row.discount_percent ?? null,
    rating: Number(row.rating),
    reviews: row.reviews_count,
    image: row.image_url,
    gallery: row.gallery || [],
    category: row.categories?.name ?? "Other",
    categorySlug: row.categories?.slug ?? null,
    inStock: !row.track_inventory || row.stock_quantity > 0,
    isFlashSale: row.is_flash_sale,
    isBestSelling: row.is_best_selling,
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "Method not allowed.");
  }

  try {
    const params = req.query || {};
    const client = getPublicClient();

    const limit = clampInt(params.limit, 1, 50, 12);
    const page = clampInt(params.page, 1, 100000, 1);
    const sortKey = SORTS[one(params.sort)] ? one(params.sort) : "default";
    const section = one(params.section);
    const search = cleanSearch(params.search ?? params.q);
    const categoryText = String(one(params.category) ?? "").trim().slice(0, 80);

    const ids = String(one(params.ids) ?? "")
      .split(",")
      .map((value) => Number.parseInt(value, 10))
      .filter((value) => Number.isInteger(value) && value > 0)
      .slice(0, 50);

    let categories = await getCategories(client);

    // Work out the category filters first (in memory - there are only a few).
    let categoryId = null;
    if (categoryText && categoryText.toLowerCase() !== "all") {
      const wanted = categoryText.toLowerCase();
      const findCategory = () =>
        categories.find((c) => c.slug === wanted || c.name.toLowerCase() === wanted);

      let match = findCategory();

      // Not found? You may have just added it. Look again once (at most every
      // 5 seconds) before deciding it doesn't exist.
      if (!match && Date.now() - categoryCache.at > 5_000) {
        categories = await getCategories(client, { force: true });
        match = findCategory();
      }

      if (!match) {
        // Unknown category: that's not an error, it simply has no products.
        return sendJson(
          res, 200,
          { products: [], page: 1, limit, total: 0, totalPages: 0 },
          "public, s-maxage=60, stale-while-revalidate=300"
        );
      }
      categoryId = match.id;
    }

    const searchCategoryIds = search
      ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())).map((c) => c.id)
      : [];

    // The same filters are used for the product query and, if needed, a
    // count-only query, so build them in one place.
    const applyFilters = (query) => {
      query = query.eq("is_active", true);

      if (ids.length) query = query.in("id", ids);
      if (section === "flash") query = query.eq("is_flash_sale", true);
      if (section === "best") query = query.eq("is_best_selling", true);
      if (categoryId) query = query.eq("category_id", categoryId);

      if (search) {
        const pattern = `%${search}%`;
        query = searchCategoryIds.length
          ? query.or(`name.ilike."${pattern}",category_id.in.(${searchCategoryIds.join(",")})`)
          : query.ilike("name", pattern);
      }

      return query;
    };

    const from = ids.length ? 0 : (page - 1) * limit;
    const to = ids.length ? ids.length - 1 : from + limit - 1;

    let query = applyFilters(client.from("products").select(COLUMNS, { count: "exact" }));
    SORTS[sortKey].forEach(([column, ascending]) => {
      query = query.order(column, { ascending });
    });
    query = query.range(from, to);

    const { data, error, count } = await query;

    // Asking for a page past the end: answer with an empty page and the
    // real total, so the page can show the right thing.
    if (error && error.code === "PGRST103") {
      const { count: total, error: countError } = await applyFilters(
        client.from("products").select("id, categories!inner ( id )", { count: "exact", head: true })
      );
      if (countError) throw countError;

      return sendJson(
        res, 200,
        { products: [], page, limit, total: total || 0, totalPages: Math.ceil((total || 0) / limit) },
        "public, s-maxage=60, stale-while-revalidate=300"
      );
    }

    if (error) throw error;

    const total = count || 0;

    sendJson(
      res, 200,
      {
        products: data.map(toProduct),
        page,
        limit,
        total,
        totalPages: ids.length ? 1 : Math.ceil(total / limit),
      },
      // Browsers don't keep it; Vercel's network keeps it for 60 seconds.
      "public, max-age=0, s-maxage=60, stale-while-revalidate=300"
    );
  } catch (err) {
    // The real reason goes to the server log only - never to the visitor.
    console.error("GET /api/products failed:", err);
    sendError(res, 500, "We couldn't load the products right now. Please try again.");
  }
};
