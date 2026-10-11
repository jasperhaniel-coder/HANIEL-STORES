// GET /api/categories
//
// Returns the categories that currently have products, for the filter on
// products.html. Add ?all=1 to include empty categories too.
//
// Response: { categories: [{ id, name, slug, count }] }

const { getPublicClient } = require("../lib/supabase");
const { sendJson, sendError, one } = require("../lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "Method not allowed.");
  }

  try {
    const includeEmpty = one((req.query || {}).all) === "1";

    let query = getPublicClient()
      .from("category_counts")
      .select("id, name, slug, product_count")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (!includeEmpty) query = query.gt("product_count", 0);

    const { data, error } = await query;
    if (error) throw error;

    sendJson(
      res, 200,
      {
        categories: data.map((row) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          count: row.product_count,
        })),
      },
      "public, max-age=0, s-maxage=300, stale-while-revalidate=600"
    );
  } catch (err) {
    console.error("GET /api/categories failed:", err);
    sendError(res, 500, "We couldn't load the categories right now. Please try again.");
  }
};
