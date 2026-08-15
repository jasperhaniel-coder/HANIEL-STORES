const products = [
    {
        id: 1, name: "HAVIT HV-G92 Gamepad", price: 120, oldPrice: 160,
        discount: "-40%", rating: 5, reviews: 88, category: "Gaming",
        image: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 2, name: "AK-900 Wired Keyboard", price: 960, oldPrice: 1160,
        discount: "-35%", rating: 4, reviews: 75, category: "Computers",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 3, name: "IPS LCD Gaming Monitor", price: 370, oldPrice: 400,
        discount: "-30%", rating: 5, reviews: 99, category: "Computers",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 4, name: "S-Series Comfort Chair", price: 375, oldPrice: 400,
        discount: "-25%", rating: 4, reviews: 99, category: "Home",
        image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 5, name: "S-Series Comfort Chair", price: 375, oldPrice: 400,
        discount: "-25%", rating: 4, reviews: 99, category: "Home",
        image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 6, name: "The north coat", price: 260, oldPrice: 360,
        discount: "", rating: 5, reviews: 65, category: "Women's Fashion",
        image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 7, name: "Gucci duffle bag", price: 960, oldPrice: 1160,
        discount: "", rating: 4, reviews: 65, category: "Women's Fashion",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 8, name: "RGB liquid CPU Cooler", price: 160, oldPrice: 170,
        discount: "", rating: 4, reviews: 65, category: "Computers",
        image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 9, name: "Small BookShelf", price: 360, oldPrice: 400,
        discount: "", rating: 5, reviews: 65, category: "Home",
        image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 10, name: "Breed Dry Dog Food", price: 100, oldPrice: null,
        discount: "", rating: 4, reviews: 35, category: "Groceries & Pets",
        image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 11, name: "CANON EOS DSLR Camera", price: 360, oldPrice: null,
        discount: "", rating: 4, reviews: 95, category: "Camera",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 12, name: "ASUS FHD Gaming Laptop", price: 700, oldPrice: null,
        discount: "", rating: 5, reviews: 325, category: "Computers",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 13, name: "Curology Product Set", price: 500, oldPrice: null,
        discount: "", rating: 5, reviews: 145, category: "Health & Beauty",
        image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 14, name: "Kids Electric Car", price: 960, oldPrice: 1000,
        discount: "-10%", rating: 5, reviews: 65, category: "Baby's & Toys",
        image: "https://images.https://i5.walmartimages.com/seo/VIBESPARK-24-Volt-Kids-Ride-Toys-2-Seater-4WD-Ride-Cars-Remote-Control-7AH-Battery-Powered-Ride-Electric-Truck-Car-Power-Car-Wheels-W-Bluetooth-Music_3771468d-f146-4447-8954-330b2faec941.dd92652daed2ff1ab6ac3727f9962b85.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFFunsplash.com/photo-1594784055418-4c7a5b9fba9e?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 15, name: "Jr. Zoom Soccer Cleats", price: 1160, oldPrice: 1200,
        discount: "", rating: 5, reviews: 35, category: "Sports & Outdoor",
        image: "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 16, name: "GP11 Shooter USB Gamepad", price: 660, oldPrice: 700,
        discount: "-15%", rating: 4, reviews: 55, category: "Gaming",
        image: "https://images.unsplash.com/photo-1592840496694-26c035b52b754?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 17, name: "Quilted Satin Jacket", price: 660, oldPrice: null,
        discount: "", rating: 4, reviews: 55, category: "Men's Fashion",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80"
    }
];

const flashProducts = products.slice(0, 5);
const bestProducts = products.slice(5, 9);
let visibleProducts = [...products];
let cart = JSON.parse(localStorage.getItem("exclusiveCart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("exclusiveWishlist") || "[]");

const money = amount => `$${amount.toLocaleString()}`;

function stars(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function productCard(product) {
    const liked = wishlist.includes(product.id);

    return `
        <article class="product-card">
            <div class="product-image">
                ${product.discount ? `<span class="discount">${product.discount}</span>` : ""}
                <div class="card-actions">
                    <button class="wishlist-btn" data-id="${product.id}" title="Wishlist">
                        <i class="bi ${liked ? "bi-heart-fill" : "bi-heart"}"></i>
                    </button>
                    <button class="quick-view" data-id="${product.id}" title="Quick view">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>

            <h3 class="product-name">${product.name}</h3>

            <div class="price">
                ${money(product.price)}
                ${product.oldPrice ? `<span class="old-price">${money(product.oldPrice)}</span>` : ""}
            </div>

            <div class="rating">${stars(product.rating)} <span>(${product.reviews})</span></div>

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
    const product = products.find(item => item.id === id);
    if (!product) return;

    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({...product, quantity: 1});
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
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h6>${item.name}</h6>
                <p>${money(item.price)} × ${item.quantity}</p>
            </div>
            <button class="remove-cart" data-id="${item.id}">
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
    const product = products.find(item => item.id === id);
    if (!product) return;

    const html = `
        <div class="row align-items-center g-4">
            <div class="col-md-6">
                <img src="${product.image}" class="img-fluid rounded bg-light p-3" alt="${product.name}">
            </div>
            <div class="col-md-6">
                <h3>${product.name}</h3>
                <p class="text-danger fw-bold">${money(product.price)}</p>
                <p class="small text-muted">★★★★★ (${product.reviews} reviews)</p>
                <p class="small">A quality product selected for the Exclusive collection.</p>
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

    const names = wishlist
        .map(id => products.find(product => product.id === id)?.name)
        .filter(Boolean);

    showToast(`${names.length} item${names.length > 1 ? "s" : ""} in your wishlist.`);
});

/* SEARCH */
function performSearch() {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();

    if (!query) {
        visibleProducts = [...products];
    } else {
        visibleProducts = products.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );
    }

    renderProducts(visibleProducts, "productGrid");

    document.getElementById("products").scrollIntoView({
        behavior: "smooth",
        block: "start"  
    });

    showToast(
        query
            ? `${visibleProducts.length} product${visibleProducts.length === 1 ? "" : "s"} found.`
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

        if (category === "Camera") {
            visibleProducts = products.filter(item => item.category === "Camera");
        } else {
            visibleProducts = products.filter(item => item.category === category);
        }

        renderProducts(visibleProducts, "productGrid");

        document.getElementById("products").scrollIntoView({
            behavior: "smooth"
        });
    });
});

/* SHOW MORE*/
document.getElementById("viewAllProducts").addEventListener("click", () => {
    visibleProducts = [...products];
    renderProducts(visibleProducts, "productGrid");
    showToast("All products are now displayed.");
});

document.getElementById("viewAllFlash").addEventListener("click", () => {
    document.getElementById("products").scrollIntoView({behavior: "smooth"});
});

document.getElementById("bestSellingBtn").addEventListener("click", () => {
    visibleProducts = bestProducts;
    renderProducts(visibleProducts, "productGrid");
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
renderProducts(flashProducts, "flashGrid");
renderProducts(bestProducts, "bestGrid");
renderProducts(products, "productGrid");
updateCartCount();
renderCart();
