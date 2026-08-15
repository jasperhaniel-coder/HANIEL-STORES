document.addEventListener("DOMContentLoaded", () => {
    const toastElement = document.getElementById("authToast");
    const toastText = document.getElementById("toastText");

    function showMessage(message) {
        if (!toastElement || !toastText) {
            alert(message);
            return;
        }

        toastText.textContent = message;

        bootstrap.Toast.getOrCreateInstance(toastElement, {
            delay: 2800
        }).show();
    }

    /* =========================
       NAVBAR SEARCH
    ========================= */

    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    function performSearch() {
        if (!searchInput) return;

        const query = searchInput.value.trim();

        if (!query) {
            showMessage("Please enter something to search for.");
            searchInput.focus();
            return;
        }

        window.location.href =
            `index.html?search=${encodeURIComponent(query)}`;
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                performSearch();
            }
        });
    }


    /* =========================
       CART
    ========================= */

    const cartBtn = document.getElementById("cartBtn");

    function updateCartCount() {
        const cartCount = document.querySelector(".cart-count");

        if (!cartCount) return;

        const cart = JSON.parse(
            localStorage.getItem("hanielCart") || "[]"
        );

        cartCount.textContent = cart.length;
    }

    if (cartBtn) {
        cartBtn.addEventListener("click", () => {
            window.location.href = "cart.html";
        });
    }

    updateCartCount();


    /* =========================
       WISHLIST
    ========================= */

    const wishlistBtn =
        document.getElementById("wishlistNav") ||
        document.getElementById("wishlistBtn");

    function updateWishlistCount() {
        const wishlist = JSON.parse(
            localStorage.getItem("hanielWishlist") || "[]"
        );

        return wishlist.length;
    }

    if (wishlistBtn) {
        wishlistBtn.addEventListener("click", () => {
            const count = updateWishlistCount();

            if (count === 0) {
                showMessage("Your wishlist is empty.");
                return;
            }

            showMessage(
                `${count} item${count > 1 ? "s" : ""} in your wishlist.`
            );
        });
    }


    /* =========================
       SHOW / HIDE PASSWORD
    ========================= */

    document.querySelectorAll(".show-password").forEach(button => {
        button.addEventListener("click", () => {
            const inputId = button.dataset.target;
            const input = document.getElementById(inputId);
            const icon = button.querySelector("i");

            if (!input || !icon) return;

            if (input.type === "password") {
                input.type = "text";
                icon.classList.replace("bi-eye", "bi-eye-slash");
                button.setAttribute("aria-label", "Hide password");
            } else {
                input.type = "password";
                icon.classList.replace("bi-eye-slash", "bi-eye");
                button.setAttribute("aria-label", "Show password");
            }
        });
    });


    /* =========================
       SUBSCRIBE
    ========================= */

    document.querySelectorAll(".subscribe-form").forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();

            const input = form.querySelector("input");

            if (!input) return;

            const email = input.value.trim();

            if (!isValidEmail(email)) {
                input.classList.add("is-invalid");
                showMessage("Please enter a valid email address.");
                return;
            }

            input.classList.remove("is-invalid");
            input.value = "";

            showMessage("Thanks! You have been subscribed.");
        });
    });

    const subscribeBtn = document.getElementById("subscribeBtn");
    const subscribeEmail = document.getElementById("subscribeEmail");

    if (subscribeBtn && subscribeEmail) {
        subscribeBtn.addEventListener("click", event => {
            event.preventDefault();

            const email = subscribeEmail.value.trim();

            if (!isValidEmail(email)) {
                subscribeEmail.classList.add("is-invalid");
                showMessage("Please enter a valid email address.");
                return;
            }

            subscribeEmail.classList.remove("is-invalid");
            subscribeEmail.value = "";

            showMessage("Thanks! You have been subscribed.");
        });

        subscribeEmail.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                subscribeBtn.click();
            }
        });
    }


    /* =========================
       SIGN UP
    ========================= */

    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", event => {
            event.preventDefault();

            const name = document.getElementById("name");
            const contact = document.getElementById("signupEmail");
            const password = document.getElementById("signupPassword");

            if (!name || !contact || !password) return;

            let valid = true;

            if (name.value.trim().length < 2) {
                name.classList.add("is-invalid");
                valid = false;
            } else {
                name.classList.remove("is-invalid");
            }

            const contactValue = contact.value.trim();

            const emailValid = isValidEmail(contactValue);

            const phoneValid =
                /^[+]?[0-9\s-]{8,}$/.test(contactValue);

            if (!emailValid && !phoneValid) {
                contact.classList.add("is-invalid");
                valid = false;
            } else {
                contact.classList.remove("is-invalid");
            }

            if (password.value.length < 6) {
                password.classList.add("is-invalid");
                valid = false;
            } else {
                password.classList.remove("is-invalid");
            }

            if (!valid) {
                showMessage("Please correct the highlighted fields.");
                return;
            }

            const existingAccount = JSON.parse(
                localStorage.getItem("hanielAccount") || "null"
            );

            if (
                existingAccount &&
                existingAccount.contact.toLowerCase() ===
                contactValue.toLowerCase()
            ) {
                contact.classList.add("is-invalid");
                showMessage("An account with these details already exists.");
                return;
            }

            const button = signupForm.querySelector(".create-btn");
            const buttonText = button?.querySelector(".btn-text");
            const spinner = button?.querySelector(".spinner-border");

            if (button) button.disabled = true;
            if (buttonText) buttonText.classList.add("d-none");
            if (spinner) spinner.classList.remove("d-none");

            setTimeout(() => {
                const account = {
                    name: name.value.trim(),
                    contact: contactValue,
                    password: password.value
                };

                localStorage.setItem(
                    "hanielAccount",
                    JSON.stringify(account)
                );

                if (button) button.disabled = false;
                if (buttonText) buttonText.classList.remove("d-none");
                if (spinner) spinner.classList.add("d-none");

                showMessage("Account created successfully!");

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 900);
            }, 600);
        });
    }


    /* =========================
       GOOGLE SIGN UP
    ========================= */

    const googleSignup = document.getElementById("googleSignup");

    if (googleSignup) {
        googleSignup.addEventListener("click", () => {
            showMessage("Google sign-up is not available in this project.");
        });
    }


    /* =========================
       LOGIN
    ========================= */

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", event => {
            event.preventDefault();

            const contact = document.getElementById("loginEmail");
            const password = document.getElementById("loginPassword");

            if (!contact || !password) return;

            let valid = true;

            if (!contact.value.trim()) {
                contact.classList.add("is-invalid");
                valid = false;
            } else {
                contact.classList.remove("is-invalid");
            }

            if (!password.value) {
                password.classList.add("is-invalid");
                valid = false;
            } else {
                password.classList.remove("is-invalid");
            }

            if (!valid) {
                showMessage("Please enter your login details.");
                return;
            }

            const account = JSON.parse(
                localStorage.getItem("hanielAccount") || "null"
            );

            if (!account) {
                showMessage(
                    "No account found. Please create an account first."
                );
                return;
            }

            const enteredContact = contact.value.trim();

            if (
                enteredContact.toLowerCase() !==
                    account.contact.toLowerCase() ||
                password.value !== account.password
            ) {
                contact.classList.add("is-invalid");
                password.classList.add("is-invalid");

                showMessage("Incorrect email/phone or password.");
                return;
            }

            const button = loginForm.querySelector(".login-btn");
            const buttonText = button?.querySelector(".btn-text");
            const spinner = button?.querySelector(".spinner-border");

            if (button) button.disabled = true;
            if (buttonText) buttonText.classList.add("d-none");
            if (spinner) spinner.classList.remove("d-none");

            setTimeout(() => {
                sessionStorage.setItem("hanielLoggedIn", "true");
                sessionStorage.setItem("hanielUser", account.name);

                showMessage(`Welcome back, ${account.name}!`);

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 900);
            }, 600);
        });
    }


    /* =========================
       FORGOT PASSWORD
    ========================= */

    const forgotPassword =
        document.getElementById("forgotPassword");

    if (forgotPassword) {
        forgotPassword.addEventListener("click", () => {
            const account = JSON.parse(
                localStorage.getItem("hanielAccount") || "null"
            );

            if (!account) {
                showMessage(
                    "Please create an account first."
                );
                return;
            }

            showMessage(
                `Password reset instructions would be sent to ${account.contact}.`
            );
        });
    }


    /* =========================
       REMOVE ERROR STATE
    ========================= */

    document.querySelectorAll(".form-control").forEach(input => {
        input.addEventListener("input", () => {
            input.classList.remove("is-invalid");
        });
    });


    /* =========================
       HELPER
    ========================= */

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
});