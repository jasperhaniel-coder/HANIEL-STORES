
const API_URL = "https://jsonplaceholder.typicode.com/albums";

const S = {
  all: [],
  shown: [],
  page: 1,
  perPage: 12,
  search: "",
  category: "all",
  sort: "default",
};
const $ = (id) => document.getElementById(id);
const grid = $("grid"),
  loading = $("loading"),
  error = $("error"),
  empty = $("empty");

document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  updateCart();
  $("productSearch").oninput = (e) => {
    S.search = e.target.value.toLowerCase().trim();
    S.page = 1;
    filter();
  };
  $("navSearch").oninput = (e) => {
    $("productSearch").value = e.target.value;
    S.search = e.target.value.toLowerCase().trim();
    S.page = 1;
    filter();
  };
  $("category").onchange = (e) => {
    S.category = e.target.value;
    S.page = 1;
    filter();
  };
  $("sort").onchange = (e) => {
    S.sort = e.target.value;
    S.page = 1;
    filter();
  };
  $("clear").onclick = $("emptyClear").onclick = clear;
  $("retry").onclick = fetchProducts;
  $("subscribe").onsubmit = subscribe;
  window.addEventListener("scroll", () =>
    $("top").classList.toggle("show", scrollY > 500),
  );
  $("top").onclick = () => scrollTo({ top: 0, behavior: "smooth" });
});

async function fetchProducts() {
  loading.classList.remove("d-none");
  error.classList.add("d-none");
  grid.innerHTML = "";
  try {
    const r = await fetch(API_URL);
    if (!r.ok) throw Error("HTTP " + r.status);
    const d = await r.json();
    const arr = Array.isArray(d) ? d : d.products || d.data || d.results || [];
    if (!Array.isArray(arr)) throw Error("Invalid product response");
    S.all = arr.map(normalize);
    buildCategories();
    filter();
    loading.classList.add("d-none");
  } catch (e) {
    console.error(e);
    loading.classList.add("d-none");
    error.classList.remove("d-none");
    $("errorText").textContent =
      "Update API_URL in js/products.js to your backend endpoint.";
    $("resultCount").textContent = "Unable to load products";
  }
}

function normalize(p) {
  return {
    id: p.id ?? p._id ?? crypto.randomUUID(),
    name: p.name ?? p.title ?? p.productName ?? "Unnamed Product",
    price: +(p.price ?? p.currentPrice ?? 0),
    old: +(p.oldPrice ?? p.originalPrice ?? p.compareAtPrice ?? 0),
    image:
      p.image ??
      p.imageUrl ??
      p.thumbnail ??
      p.images?.[0] ??
      "https://placehold.co/600x600/f5f5f5/777?text=Product",
    category: p.category?.name ?? p.category ?? p.categoryName ?? "Other",
    rating: +(p.rating ?? p.ratings ?? 0),
    reviews: +(p.reviews ?? p.reviewCount ?? 0),
    discount: +(p.discount ?? 0),
  };
}

function buildCategories() {
  $("category").innerHTML = '<option value="all">All Categories</option>';
  [...new Set(S.all.map((p) => p.category))].sort().forEach((c) => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    $("category").appendChild(o);
  });
}

function filter() {
  let a = [...S.all];
  if (S.search)
    a = a.filter((p) =>
      (p.name + " " + p.category).toLowerCase().includes(S.search),
    );
  if (S.category !== "all") a = a.filter((p) => p.category === S.category);
  if (S.sort === "price-low") a.sort((x, y) => x.price - y.price);
  if (S.sort === "price-high") a.sort((x, y) => y.price - x.price);
  if (S.sort === "name-a") a.sort((x, y) => x.name.localeCompare(y.name));
  if (S.sort === "name-z") a.sort((x, y) => y.name.localeCompare(x.name));
  if (S.sort === "rating") a.sort((x, y) => y.rating - x.rating);
  S.shown = a;
  render();
}

function render() {
  $("resultCount").textContent =
    `${S.shown.length} product${S.shown.length === 1 ? "" : "s"} found`;
  grid.innerHTML = "";
  empty.classList.toggle("d-none", S.shown.length > 0);
  if (!S.shown.length) {
    $("pages").innerHTML = "";
    return;
  }
  const start = (S.page - 1) * S.perPage;
  S.shown.slice(start, start + S.perPage).forEach((p, i) => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-3";
    col.innerHTML = card(p, i);
    grid.appendChild(col);
  });
  pages();
}

function card(p, i) {
  const discount =
    p.discount ||
    (p.old > p.price ? Math.round(((p.old - p.price) / p.old) * 100) : 0);
  const old =
    p.old > p.price ? `<span class="old">$${money(p.old)}</span>` : "";
  return `<div class="product-card" style="animation-delay:${i * 45}ms">
 <div class="product-image-wrap">${discount ? `<span class="discount">-${discount}%</span>` : ""}
 <div class="actions"><button class="action wish" data-id="${esc(p.id)}"><i class="bi bi-heart"></i></button><button class="action view" data-id="${esc(p.id)}"><i class="bi bi-eye"></i></button></div>
 <img class="product-image" loading="lazy" src="${esc(p.image)}" alt="${esc(p.name)}" onerror="this.src='https://placehold.co/600x600/f5f5f5/777?text=No+Image'"></div>
 <h3 class="name" title="${esc(p.name)}">${esc(p.name)}</h3>
 <div><span class="price">$${money(p.price)}</span>${old}</div>
 <div class="rating">${stars(p.rating)} <span>(${p.reviews})</span></div>
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
  const p = S.all.find((x) => String(x.id) === String(id));
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
  let w = JSON.parse(localStorage.getItem("exclusiveWishlist") || "[]"),
    id = b.dataset.id;
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

function pages() {
  const ul = $("pages"),
    total = Math.ceil(S.shown.length / S.perPage);
  ul.innerHTML = "";
  if (total < 2) return;
  for (let i = 1; i <= total; i++) {
    const li = document.createElement("li");
    li.className = "page-item " + (i === S.page ? "active" : "");
    li.innerHTML = `<button class="page-link">${i}</button>`;
    li.onclick = () => {
      S.page = i;
      render();
      scrollTo({ top: 0, behavior: "smooth" });
    };
    ul.appendChild(li);
  }
}

function clear() {
  S.search = "";
  S.category = "all";
  S.sort = "default";
  S.page = 1;
  $("productSearch").value = $("navSearch").value = "";
  $("category").value = "all";
  $("sort").value = "default";
  filter();
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
