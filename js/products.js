/* =====================================================================
   HANIEL STORES - products page script

   Products come from the server (/api/products), one page at a time.
   Searching, filtering, sorting and paging all happen on the server,
   so this page stays fast no matter how many products the store has.
   ===================================================================== */

const API_URL = "/api/products";
const CATEGORIES_URL = "/api/categories";
const IMAGE_FALLBACK = "https://placehold.co/600x600/f5f5f5/777?text=No+Image";

const S = {
  shown: [], // the products on the current page
  total: 0, // how many products match the filters (all pages)
  totalPages: 1,
  page: 1,
  perPage: 12,
  search: "",
  category: "all",
  sort: "default",
};
const byId = new Map(); // every product seen so far, so "Add To Cart" can find it
let requestId = 0; // used to ignore out-of-date responses
let searchTimer;

const $ = (id) => document.getElementById(id);
const grid = $("grid"),
  loading = $("loading"),
  error = $("error"),
  empty = $("empty");

document.addEventListener("DOMContentLoaded", () => {
  readUrlFilters();
  loadCategories();
  fetchProducts();
  updateCart();
  $("productSearch").oninput = (e) => {
    S.search = e.target.value.trim();
    queueSearch();
  };
  $("navSearch").oninput = (e) => {
    $("productSearch").value = e.target.value;
    S.search = e.target.value.trim();
    queueSearch();
  };
  $("category").onchange = (e) => {
    S.category = e.target.value;
    S.page = 1;
    fetchProducts();
  };
  $("sort").onchange = (e) => {
    S.sort = e.target.value;
    S.page = 1;
    fetchProducts();
  };
  $("clear").onclick = $("emptyClear").onclick = clear;
  $("retry").onclick = fetchProducts;
  $("subscribe").onsubmit = subscribe;
  window.addEventListener("scroll", () =>
    $("top").classList.toggle("show", scrollY > 500),
  );
  $("top").onclick = () => scrollTo({ top: 0, behavior: "smooth" });
});

// Lets other pages link here with a ready-made search or category,
// for example products.html?search=camera or products.html?category=Gaming
function readUrlFilters() {
  const params = new URLSearchParams(location.search);
  const search = (params.get("search") || "").trim().slice(0, 60);
  const category = (params.get("category") || "").trim().slice(0, 80);
  if (search) {
    S.search = search;
    $("productSearch").value = $("navSearch").value = search;
  }
  if (category) S.category = category;
}

// Wait a moment after the visitor stops typing before asking the server.
function queueSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    S.page = 1;
    fetchProducts();
  }, 300);
}

async function fetchProducts() {
  const mine = ++requestId;
  loading.classList.remove("d-none");
  error.classList.add("d-none");
  empty.classList.add("d-none");
  grid.innerHTML = "";
  $("pages").innerHTML = "";
  try {
    const q = new URLSearchParams({ page: S.page, limit: S.perPage });
    if (S.search) q.set("search", S.search);
    if (S.category !== "all") q.set("category", S.category);
    if (S.sort !== "default") q.set("sort", S.sort);
    const r = await fetch(`${API_URL}?${q}`);
    if (!r.ok) throw Error("HTTP " + r.status);
    const d = await r.json();
    if (mine !== requestId) return; // a newer request has taken over
    if (!Array.isArray(d.products)) throw Error("Invalid product response");
    // We asked for a page that no longer exists: go to the last real one.
    if (!d.products.length && d.total > 0 && S.page > 1) {
      S.page = Math.max(1, d.totalPages);
      return fetchProducts();
    }
    S.shown = d.products.map(normalize);
    S.total = d.total;
    S.totalPages = d.totalPages;
    S.shown.forEach((p) => byId.set(String(p.id), p));
    loading.classList.add("d-none");
    render();
  } catch (e) {
    if (mine !== requestId) return;
    console.error(e);
    loading.classList.add("d-none");
    error.classList.remove("d-none");
    $("errorText").textContent =
      "We couldn't load the products. Please check your connection and try again.";
    $("resultCount").textContent = "Unable to load products";
  }
}

async function loadCategories() {
  try {
    const r = await fetch(CATEGORIES_URL);
    if (!r.ok) throw Error("HTTP " + r.status);
    const d = await r.json();
    $("category").innerHTML = '<option value="all">All Categories</option>';
    (d.categories || [])
      .map((c) => c.name)
      .sort((a, b) => a.localeCompare(b))
      .forEach((c) => {
        const o = document.createElement("option");
        o.value = c;
        o.textContent = c;
        $("category").appendChild(o);
      });
    const known = [...$("category").options].some((o) => o.value === S.category);
    $("category").value = known ? S.category : "all";
  } catch (e) {
    // Not fatal: the page still works with just "All Categories".
    console.error(e);
  }
}

function normalize(p) {
  return {
    id: p.id,
    name: p.name || "Unnamed Product",
    price: +p.price || 0,
    old: +(p.oldPrice ?? 0),
    image: p.image || "https://placehold.co/600x600/f5f5f5/777?text=Product",
    category: p.category || "Other",
    rating: +p.rating || 0,
    reviews: +p.reviews || 0,
    discount: +(p.discount ?? 0),
  };
}

function render() {
  $("resultCount").textContent =
    `${S.total} product${S.total === 1 ? "" : "s"} found`;
  grid.innerHTML = "";
  empty.classList.toggle("d-none", S.shown.length > 0);
  if (!S.shown.length) {
    $("pages").innerHTML = "";
    return;
  }
  S.shown.forEach((p, i) => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-3";
    col.innerHTML = card(p, i);
    grid.appendChild(col);
  });
  pages();
}

function readWishlist() {
  try {
    const w = JSON.parse(localStorage.getItem("exclusiveWishlist") || "[]");
    return Array.isArray(w) ? w : [];
  } catch {
    return [];
  }
}

function card(p, i) {
  const discount =
    p.discount ||
    (p.old > p.price ? Math.round(((p.old - p.price) / p.old) * 100) : 0);
  const old =
    p.old > p.price ? `<span class="old">$${money(p.old)}</span>` : "";
  const wished = readWishlist().some((x) => String(x) === String(p.id));
  return `<div class="product-card" style="animation-delay:${i * 45}ms">
 <div class="product-image-wrap">${discount ? `<span class="discount">-${esc(discount)}%</span>` : ""}
 <div class="actions"><button class="action wish${wished ? " active" : ""}" data-id="${esc(p.id)}"><i class="bi bi-heart"></i></button><button class="action view" data-id="${esc(p.id)}"><i class="bi bi-eye"></i></button></div>
 <img class="product-image" loading="lazy" src="${esc(p.image)}" alt="${esc(p.name)}" onerror="this.onerror=null;this.src='${IMAGE_FALLBACK}'"></div>
 <h3 class="name" title="${esc(p.name)}">${esc(p.name)}</h3>
 <div><span class="price">$${money(p.price)}</span>${old}</div>
 <div class="rating">${stars(p.rating)} <span>(${esc(p.reviews)})</span></div>
 <button class="add" data-id="${esc(p.id)}"><i class="bi bi-cart-plus"></i> Add To Cart</button>
 </div>`;
}

grid.addEventListener("click", (e) => {
  const add = e.target.closest(".add"),
    wish = e.target.closest(".wish"),
    view = e.target.closest(".view");
  if (add) addCart(add.dataset.id);
  if (wish) wishlist(wish);
  if (view) toast("Product ID: " + view.dataset.id);
});

function addCart(id) {
  const p = byId.get(String(id));
  if (!p) return;
  let c = JSON.parse(localStorage.getItem("exclusiveCart") || "[]");
  const x = c.find((x) => String(x.id) === String(id));
  if (x) x.quantity++;
  else
    c.push({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      quantity: 1,
    });
  localStorage.setItem("exclusiveCart", JSON.stringify(c));
  updateCart();
  toast(p.name + " added to cart", "success");
}

function updateCart() {
  const c = JSON.parse(localStorage.getItem("exclusiveCart") || "[]");
  $("cartCount").textContent = c.reduce((n, x) => n + (+x.quantity || 0), 0);
}

function wishlist(b) {
  let w = readWishlist(),
    id = Number(b.dataset.id);
  if (w.some((x) => String(x) === String(id))) {
    w = w.filter((x) => String(x) !== String(id));
    b.classList.remove("active");
    toast("Removed from wishlist");
  } else {
    w.push(id);
    b.classList.add("active");
    toast("Added to wishlist", "success");
  }
  localStorage.setItem("exclusiveWishlist", JSON.stringify(w));
}

// Shows page numbers. With a few pages it lists them all; with many it
// shows the first, the last, and the pages around the current one.
function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = [
    ...new Set([1, total, current - 1, current, current + 1]),
  ]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out = [];
  keep.forEach((n, i) => {
    if (i && n - keep[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

function pages() {
  const ul = $("pages"),
    total = S.totalPages;
  ul.innerHTML = "";
  if (total < 2) return;
  pageNumbers(S.page, total).forEach((item) => {
    const li = document.createElement("li");
    if (item === "…") {
      li.className = "page-item disabled";
      li.innerHTML = `<span class="page-link">…</span>`;
    } else {
      li.className = "page-item " + (item === S.page ? "active" : "");
      li.innerHTML = `<button class="page-link">${item}</button>`;
      li.onclick = () => {
        if (item === S.page) return;
        S.page = item;
        fetchProducts();
        scrollTo({ top: 0, behavior: "smooth" });
      };
    }
    ul.appendChild(li);
  });
}

function clear() {
  clearTimeout(searchTimer);
  S.search = "";
  S.category = "all";
  S.sort = "default";
  S.page = 1;
  $("productSearch").value = $("navSearch").value = "";
  $("category").value = "all";
  $("sort").value = "default";
  fetchProducts();
}
function subscribe(e) {
  e.preventDefault();
  const v = $("email").value.trim();
  if (!v.includes("@")) return toast("Enter a valid email", "error");
  localStorage.setItem("exclusiveSubscriber", v);
  e.target.reset();
  toast("Thanks for subscribing!", "success");
}
function stars(n) {
  let s = "";
  for (let i = 1; i <= 5; i++)
    s +=
      n >= i
        ? "<i class='bi bi-star-fill'></i>"
        : n >= i - 0.5
          ? "<i class='bi bi-star-half'></i>"
          : "<i class='bi bi-star'></i>";
  return s;
}
function money(n) {
  return Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function esc(v) {
  return String(v)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function toast(msg, type = "info") {
  const el = document.createElement("div");
  el.className = `toast align-items-center border-0 text-bg-${type === "success" ? "success" : type === "error" ? "danger" : "dark"}`;
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${esc(msg)}</div><button class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  $("toasts").appendChild(el);
  const t = new bootstrap.Toast(el, { delay: 2500 });
  t.show();
  el.addEventListener("hidden.bs.toast", () => el.remove());
}
