document.addEventListener("DOMContentLoaded", () => {

    const toastElement = document.getElementById("cartToast");
    const toastMessage = document.getElementById("toastMessage");

    function showToast(message) {
        toastMessage.textContent = message;

        bootstrap.Toast.getOrCreateInstance(toastElement, {
            delay: 2400
        }).show();
    }


    /* -------CART CALCULATIONS------- */

    const cartItems = document.getElementById("cartItems");
    const subtotalDisplay = document.getElementById("cartSubtotal");
    const totalDisplay = document.getElementById("cartTotal");

    let discount = 0;


    function getRows() {
        return [...document.querySelectorAll(".cart-row")];
    }


    function calculateCart() {

        let subtotal = 0;

        getRows().forEach(row => {

            const price = Number(row.dataset.price);
            const quantityInput = row.querySelector(".quantity");
            const quantity = Math.max(
                0,
                Number(quantityInput.value) || 0
            );

            quantityInput.value = quantity;

            const itemSubtotal = price * quantity;

            row.querySelector(".subtotal").textContent =
                `$${itemSubtotal.toLocaleString()}`;

            subtotal += itemSubtotal;
        });


        if (getRows().length === 0) {
            subtotal = 0;
        }

        const total = Math.max(0, subtotal - discount);

        subtotalDisplay.textContent =
            `$${subtotal.toLocaleString()}`;

        totalDisplay.textContent =
            `$${total.toLocaleString()}`;

        updateCartBadge();

        return {
            subtotal,
            total
        };
    }


    function updateCartBadge() {

        const count = getRows().reduce((sum, row) => {
            return sum + Number(row.querySelector(".quantity").value || 0);
        }, 0);

        const badge = document.querySelector(".cart-icon .header-badge");

        badge.textContent = count;
        badge.style.display = count > 0 ? "flex" : "none";
    }


    /* ----------QUANTITY CHANGES--------- */

    cartItems.addEventListener("input", event => {

        if (!event.target.classList.contains("quantity")) {
            return;
        }

        if (event.target.value < 0) {
            event.target.value = 0;
        }

        calculateCart();
    });


    /* --------REMOVE PRODUCT--------- */

    cartItems.addEventListener("click", event => {

        const removeButton =
            event.target.closest(".remove-product");

        if (!removeButton) {
            return;
        }

        const row = removeButton.closest(".cart-row");

        row.style.opacity = "0";
        row.style.transform = "translateX(25px)";

        setTimeout(() => {

            row.remove();

            calculateCart();

            if (getRows().length === 0) {
                showEmptyCart();
            }

            showToast("Product removed from cart.");

        }, 220);
    });


    function showEmptyCart() {

        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="bi bi-cart-x"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart and they will appear here.</p>
                <a href="index.html" class="outline-btn">
                    Continue Shopping
                </a>
            </div>
        `;
    }


    /* -------UPDATE CART---------- */

    document.getElementById("updateCartBtn")
        .addEventListener("click", () => {

            calculateCart();

            const cart = getRows().map(row => ({
                product: row.dataset.product,
                quantity: Number(row.querySelector(".quantity").value)
            }));

            localStorage.setItem(
                "exclusiveCart",
                JSON.stringify(cart)
            );

            showToast("Your cart has been updated.");
        });


    /* --------COUPON------------ */

    document.getElementById("couponForm")
        .addEventListener("submit", event => {

            event.preventDefault();

            const input = document.getElementById("couponInput");
            const message = document.getElementById("couponMessage");

            const code = input.value.trim().toUpperCase();

            message.className = "coupon-message";

            if (!code) {
                message.textContent = "Enter a coupon code first.";
                message.classList.add("error");
                return;
            }


            // Demo coupon codes for the assignment.
            const coupons = {
                "EXCLUSIVE10": 0.10,
                "SAVE10": 0.10,
                "WELCOME10": 0.10
            };


            if (!coupons[code]) {

                discount = 0;

                message.textContent =
                    "Invalid coupon code.";

                message.classList.add("error");

                calculateCart();
                return;
            }


            const subtotal = getRows().reduce((sum, row) => {
                return sum +
                    Number(row.dataset.price) *
                    Number(row.querySelector(".quantity").value || 0);
            }, 0);


            discount = Math.round(
                subtotal * coupons[code]
            );


            message.textContent =
                `Coupon applied. You saved $${discount}.`;

            message.classList.add("success");

            calculateCart();

            showToast("Coupon applied successfully.");
        });


    /* -------------CHECKOUT------------- */

    document.getElementById("checkoutBtn")
        .addEventListener("click", () => {

            const { total } = calculateCart();

            if (getRows().length === 0 || total <= 0) {
                showToast("Your cart is empty.");
                return;
            }

            showToast(
                `Checkout started. Total: $${total.toLocaleString()}`
            );

            setTimeout(() => {
                window.location.href = "checkout.html";
            }, 900);
        });


    /* -----------SEARCH--------- */

    document.getElementById("searchForm")
        .addEventListener("submit", event => {

            event.preventDefault();

            const input =
                document.getElementById("searchInput");

            const term = input.value.trim();

            if (!term) {
                showToast("Please enter a product to search.");
                input.focus();
                return;
            }

            window.location.href =
                `index.html?search=${encodeURIComponent(term)}`;
        });


    /* -----------HEADER BUTTONS----------- */

    document.getElementById("wishlistBtn")
        .addEventListener("click", () => {
            showToast("You have 4 products in your wishlist.");
        });


    document.getElementById("cartBtn")
        .addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });


    /* -----------NEWSLETTER--------- */

    document.getElementById("subscribeForm")
        .addEventListener("submit", event => {

            event.preventDefault();

            const input =
                document.getElementById("subscribeEmail");

            const email = input.value.trim();

            const valid =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

            if (!valid) {
                showToast("Please enter a valid email address.");
                input.focus();
                return;
            }

            localStorage.setItem(
                "exclusiveSubscriber",
                email
            );

            input.value = "";

            showToast("Thanks! You are now subscribed.");
        });


    /* Initial calculation */
    calculateCart();

});
