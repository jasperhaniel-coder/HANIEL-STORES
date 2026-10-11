/* =====================================================================
   HANIEL STORES - home page script

   Products are no longer written in this file. They are loaded from the
   server (/api/products), one page at a time, so the store keeps working
   when you have hundreds or thousands of products.
   ===================================================================== */

const API_BASE = "/api";
const HOME_GRID_SIZE = 20;   /* products shown in "Explore Our Products" before "Load More" */
const IMAGE_FALLBACK = "https://placehold.co/600x600/f5f5f5/777?text=No+Image";

const productCache = new Map();   /* id -> product, filled by every request */

let flashProducts = [];
let bestProducts = [];
let visibleProducts = [];
const gridState = {category: "", search: "", page: 1, total: 0};
let gridRequestId = 0;

function readStored(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

let cart = readStored("exclusiveCart").filter(item =>
    item && Number.isFinite(Number(item.id)) &&
    Number.isFinite(Number(item.price)) && Number(item.quantity) > 0
);
let wishlist = readStored("exclusiveWishlist").map(Number).filter(Number.isFinite);

/* Makes text safe to put inside HTML, so a product name can never run code. */
const esc = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[character]));

async function fetchProducts(params) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) query.set(key, value);
    });

    const response = await fetch(`${API_BASE}/products?${query}`);
    if (!response.ok) throw new Error(`Products request failed (${response.status})`);

    const data = await response.json();
    data.products.forEach(product => productCache.set(product.id, product));
    return data;
}

function setGridMessage(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) element.innerHTML = `<p class="text-muted small">${message}</p>`;
}

function showGridError(elementId) {
    setGridMessage(
        elementId,
        `We couldn't load the products. <button type="button" class="btn btn-link btn-sm p-0 align-baseline retry-products">Try again</button>`
    );
}

/* Shows or hides the "Load More" button under the product grid.
   With a small catalogue it never appears; it only shows up when there
   are more products than fit in the first page. */
function updateLoadMore() {
    const grid = document.getElementById("productGrid");
    if (!grid) return;

    let wrap = document.getElementById("loadMoreWrap");
    const hasMore = visibleProducts.length < gridState.total;

    if (!hasMore) {
        if (wrap) wrap.remove();
        return;
    }

    if (!wrap) {
        wrap = document.createElement("div");
        wrap.id = "loadMoreWrap";
        wrap.className = "text-center mt-4";
        wrap.innerHTML = `<button type="button" class="red-btn" id="loadMoreBtn">Load More</button>`;
        grid.insertAdjacentElement("afterend", wrap);
    }

    const button = document.getElementById("loadMoreBtn");
    button.disabled = false;
    button.textContent = "Load More";
}

async function loadMore() {
    const button = document.getElementById("loadMoreBtn");
    if (button) {
        button.disabled = true;
        button.textContent = "Loading...";
    }

    const requestId = gridRequestId;

    try {
        const data = await fetchProducts({
            category: gridState.category,
            search: gridState.search,
            limit: HOME_GRID_SIZE,
            page: gridState.page + 1
        });

        if (requestId !== gridRequestId) return;

        const known = new Set(visibleProducts.map(product => product.id));
        visibleProducts = visibleProducts.concat(data.products.filter(product => !known.has(product.id)));
        gridState.page += 1;
        gridState.total = data.total;
        renderProducts(visibleProducts, "productGrid");
    } catch (error) {
        console.error(error);
        showToast("We couldn't load more products. Please try again.");
    }

    updateLoadMore();
}

/* Loads the first page of "Explore Our Products" for a category and/or search. */
async function loadGrid({category = "", search = ""} = {}) {
    const requestId = ++gridRequestId;

    gridState.category = category;
    gridState.search = search;
    gridState.page = 1;

    setGridMessage("productGrid", "Loading products...");

    try {
        const data = await fetchProducts({category, search, limit: HOME_GRID_SIZE});

        if (requestId !== gridRequestId) return null;   /* a newer request took over */

        visibleProducts = data.products;
        gridState.total = data.total;
        renderProducts(visibleProducts, "productGrid");
        updateLoadMore();
        return data;
    } catch (error) {
        if (requestId !== gridRequestId) return null;
        console.error(error);
        showGridError("productGrid");
        return null;
    }
}

/* First load of the page: the two home sections and the main grid. */
async function loadHome() {
    const initialSearch = (new URLSearchParams(window.location.search).get("search") || "").trim().slice(0, 60);
    const requestId = ++gridRequestId;

    ["flashGrid", "bestGrid", "productGrid"].forEach(id => setGridMessage(id, "Loading products..."));

    if (initialSearch) document.getElementById("searchInput").value = initialSearch;

    try {
        const [flash, best, all] = await Promise.all([
            fetchProducts({section: "flash", limit: 5}),
            fetchProducts({section: "best", limit: 4}),
            fetchProducts({search: initialSearch, limit: HOME_GRID_SIZE})
        ]);

        flashProducts = flash.products;
        bestProducts = best.products;
        renderProducts(flashProducts, "flashGrid");
        renderProducts(bestProducts, "bestGrid");

        if (requestId !== gridRequestId) return;

        gridState.search = initialSearch;
        gridState.page = 1;
        gridState.total = all.total;
        visibleProducts = all.products;
        renderProducts(visibleProducts, "productGrid");
        updateLoadMore();

        /* Arrived from another page's search box (index.html?search=...) */
        if (initialSearch) {
            document.getElementById("products").scrollIntoView({behavior: "smooth", block: "start"});
            showToast(`${all.total} product${all.total === 1 ? "" : "s"} found.`);
        }
    } catch (error) {
        console.error(error);
        ["flashGrid", "bestGrid", "productGrid"].forEach(showGridError);
    }
}

/* If a product picture is broken, show a neutral placeholder instead. */
document.addEventListener("error", event => {
    const image = event.target;

    if (
        image && image.tagName === "IMG" &&
        image.closest(".product-card, .cart-row, #quickModal") &&
        image.dataset.fallback !== "1"
    ) {
        image.dataset.fallback = "1";
        image.src = IMAGE_FALLBACK;
    }
}, true);

const money = amount => `$${Number(amount).toLocaleString()}`;

function stars(rating) {
    const filled = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    return "★".repeat(filled) + "☆".repeat(5 - filled);
}

function productCard(product) {
    const liked = wishlist.includes(product.id);

    return `
        <article class="product-card">
            <div class="product-image">
                ${product.discount ? `<span class="discount">-${esc(product.discount)}%</span>` : ""}
                <div class="card-actions">
                    <button class="wishlist-btn" data-id="${product.id}" title="Wishlist">
                        <i class="bi ${liked ? "bi-heart-fill" : "bi-heart"}"></i>
                    </button>
                    <button class="quick-view" data-id="${product.id}" title="Quick view">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
                <img src="${esc(product.image)}" alt="${esc(product.name)}" loading="lazy">
            </div>

            <h3 class="product-name">${esc(product.name)}</h3>

            <div class="price">
                ${money(product.price)}
                ${product.oldPrice ? `<span class="old-price">${money(product.oldPrice)}</span>` : ""}
            </div>

            <div class="rating">${stars(product.rating)} <span>(${esc(product.reviews)})</span></div>

            <button class="add-cart" data-id="${product.id}">
                Add To Cart
            </button>
        </article>
    `;
}

function renderProducts(list, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.innerHTML = list.length
        ? list.map(productCard).join("")
        : `<p class="text-muted small">No products found.</p>`;
}

function showToast(message) {
    document.getElementById("toastMessage").textContent = message;
    bootstrap.Toast.getOrCreateInstance(document.getElementById("liveToast")).show();
}

function saveCart() {
    localStorage.setItem("exclusiveCart", JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function addToCart(id) {
    const product = productCache.get(id);
    if (!product) return;

    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            discount: product.discount,
            rating: product.rating,
            reviews: product.reviews,
            category: product.category,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    showToast(`${product.name} added to your cart.`);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelector(".cart-count").textContent = count;
}

function renderCart() {
    const container = document.getElementById("cartItems");
    const totalElement = document.getElementById("cartTotal");

    if (!cart.length) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-cart-x fs-1 text-muted"></i>
                <p class="mt-3 small text-muted">Your cart is empty.</p>
            </div>
        `;
        totalElement.textContent = "$0";
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-row">
            <img src="${esc(item.image)}" alt="${esc(item.name)}">
            <div>
                <h6>${esc(item.name)}</h6>
                <p>${money(item.price)} × ${esc(item.quantity)}</p>
            </div>
            <button class="remove-cart" data-id="${esc(item.id)}">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `).join("");

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalElement.textContent = money(total);
}

function toggleWishlist(id) {
    const index = wishlist.indexOf(id);

    if (index === -1) {
        wishlist.push(id);
        showToast("Added to wishlist.");
    } else {
        wishlist.splice(index, 1);
        showToast("Removed from wishlist.");
    }

    localStorage.setItem("exclusiveWishlist", JSON.stringify(wishlist));

    renderProducts(flashProducts, "flashGrid");
    renderProducts(bestProducts, "bestGrid");
    renderProducts(visibleProducts, "productGrid");
}

function quickView(id) {
    const product = productCache.get(id);
    if (!product) return;

    const html = `
        <div class="row align-items-center g-4">
            <div class="col-md-6">
                <img src="${esc(product.image)}" class="img-fluid rounded bg-light p-3" alt="${esc(product.name)}">
            </div>
            <div class="col-md-6">
                <h3>${esc(product.name)}</h3>
                <p class="text-danger fw-bold">${money(product.price)}</p>
                <p class="small text-muted">★★★★★ (${esc(product.reviews)} reviews)</p>
                <p class="small">${esc(product.description || "A quality product selected for the Exclusive collection.")}</p>
                <button class="red-btn add-from-modal" data-id="${product.id}">Add To Cart</button>
            </div>
        </div>
    `;

    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.id = "quickModal";
    modal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0">
                <div class="modal-header">
                    <h5 class="modal-title">Product Details</h5>
                    <button class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">${html}</div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    modal.addEventListener("click", e => {
        const button = e.target.closest(".add-from-modal");
        if (button) {
            addToCart(Number(button.dataset.id));
            modalInstance.hide();
        }
    });

    modal.addEventListener("hidden.bs.modal", () => modal.remove());
}

/* Event that will happen on product button */
document.addEventListener("click", e => {
    const addButton = e.target.closest(".add-cart");
    const wishlistButton = e.target.closest(".wishlist-btn");
    const quickButton = e.target.closest(".quick-view");
    const removeButton = e.target.closest(".remove-cart");
    const loadMoreButton = e.target.closest("#loadMoreBtn");
    const retryButton = e.target.closest(".retry-products");

    if (loadMoreButton) loadMore();
    if (retryButton) loadHome();
    if (addButton) addToCart(Number(addButton.dataset.id));
    if (wishlistButton) toggleWishlist(Number(wishlistButton.dataset.id));
    if (quickButton) quickView(Number(quickButton.dataset.id));
    if (removeButton) removeFromCart(Number(removeButton.dataset.id));
});

/* CART */
document.getElementById("cartBtn").addEventListener("click", () => {
    renderCart();
    bootstrap.Offcanvas.getOrCreateInstance(document.getElementById("cartCanvas")).show();
});

document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (!cart.length) {
        showToast("Your cart is empty.");
        return;
    }

    showToast("Checkout is ready for your order.");
});

/* WISHLIST */
document.getElementById("wishlistNav").addEventListener("click", () => {
    if (!wishlist.length) {
        showToast("Your wishlist is empty.");
        return;
    }

    showToast(`${wishlist.length} item${wishlist.length > 1 ? "s" : ""} in your wishlist.`);
});

/* SEARCH */
async function performSearch() {
    const query = document.getElementById("searchInput").value.trim();

    document.getElementById("products").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    const data = await loadGrid({search: query});
    if (!data) return;

    showToast(
        query
            ? `${data.total} product${data.total === 1 ? "" : "s"} found.`
            : "Showing all products."
    );
}

document.getElementById("searchBtn").addEventListener("click", performSearch);

document.getElementById("searchInput").addEventListener("keydown", e => {
    if (e.key === "Enter") performSearch();
});

/* CATEGORY FILTER */
document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
        document.querySelectorAll(".category-card").forEach(item => item.classList.remove("active"));
        card.classList.add("active");

        const category = card.dataset.category;

        loadGrid({category});

        document.getElementById("products").scrollIntoView({
            behavior: "smooth"
        });
    });
});

/* SHOW MORE*/
document.getElementById("viewAllProducts").addEventListener("click", async () => {
    const data = await loadGrid();
    if (!data) return;

    showToast(
        visibleProducts.length < data.total
            ? "Showing products. Use Load More to see the rest."
            : "All products are now displayed."
    );
});

document.getElementById("viewAllFlash").addEventListener("click", () => {
    document.getElementById("products").scrollIntoView({behavior: "smooth"});
});

document.getElementById("bestSellingBtn").addEventListener("click", () => {
    gridRequestId++;   /* cancel any product request still in flight */
    visibleProducts = bestProducts;
    gridState.total = bestProducts.length;
    renderProducts(visibleProducts, "productGrid");
    updateLoadMore();
    document.getElementById("products").scrollIntoView({behavior: "smooth"});
});

/* SLIDER-LIKE HORIZONTAL BUTTONS */
document.querySelectorAll("[data-scroll]").forEach(button => {
    button.addEventListener("click", () => {
        const target = document.querySelector(button.dataset.scroll);
        if (target) {
            target.scrollBy({
                left: Number(button.dataset.direction) * 260,
                behavior: "smooth"
            });
        }
    });
});

/* COUNTDOWN */
let saleEnd = Date.now() + (3 * 24 * 60 * 60 * 1000) + (23 * 60 * 60 * 1000);

function updateCountdown() {
    let difference = saleEnd - Date.now();

    if (difference <= 0) {
        saleEnd = Date.now() + (24 * 60 * 60 * 1000);
        difference = saleEnd - Date.now();
    }

    const days = Math.floor(difference / 86400000);
    const hours = Math.floor((difference % 86400000) / 3600000);
    const minutes = Math.floor((difference % 3600000) / 60000);
    const seconds = Math.floor((difference % 60000) / 1000);

    document.getElementById("days").textContent = String(days).padStart(2, "0");
    document.getElementById("hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* PROMO BUTTON */
document.getElementById("buyNow").addEventListener("click", () => {
    document.getElementById("products").scrollIntoView({behavior: "smooth"});
    showToast("Showing products available for the promotion.");
});

/* NEWSLETTER */
document.getElementById("subscribeBtn").addEventListener("click", () => {
    const email = document.getElementById("subscribeEmail").value.trim();

    if (!email || !email.includes("@")) {
        showToast("Please enter a valid email address.");
        return;
    }

    document.getElementById("subscribeEmail").value = "";
    showToast("Thanks! You have been subscribed.");
});

/* BACK TO TOP */
const backTop = document.getElementById("backTop");

window.addEventListener("scroll", () => {
    backTop.classList.toggle("show", window.scrollY > 500);
});

backTop.addEventListener("click", () => {
    window.scrollTo({top: 0, behavior: "smooth"});
});

/* REVEAL ANIMATION */
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        }
    });
}, {threshold: 0.08});

document.querySelectorAll(".reveal").forEach(section => observer.observe(section));

/* INITIAL RENDER */
updateCartCount();
renderCart();
loadHome();
