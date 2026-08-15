/* =====================================================
   CONTACT PAGE JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  const sendMessageBtn = document.getElementById("sendMessageBtn");

  const toastElement = document.getElementById("contactToast");
  const toastMessage = document.getElementById("toastMessage");

  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  const wishlistBtn = document.getElementById("wishlistBtn");
  const cartBtn = document.getElementById("cartBtn");

  const subscribeForm = document.getElementById("subscribeForm");
  const subscribeEmail = document.getElementById("subscribeEmail");

  /* =====================================================
     TOAST FUNCTION
  ===================================================== */

  function showToast(message) {
    toastMessage.textContent = message;

    const toast = new bootstrap.Toast(toastElement, {
      delay: 3000,
    });

    toast.show();
  }

  /* =====================================================
     FORM VALIDATION
  ===================================================== */

  function showError(input, message) {
    const errorMessage = input.parentElement.querySelector(".error-message");

    input.classList.add("input-error");

    if (errorMessage) {
      errorMessage.textContent = message;
    }
  }

  function clearError(input) {
    const errorMessage = input.parentElement.querySelector(".error-message");

    input.classList.remove("input-error");

    if (errorMessage) {
      errorMessage.textContent = "";
    }
  }

  function validateName() {
    const name = document.getElementById("name");

    if (name.value.trim() === "") {
      showError(name, "Please enter your name.");
      return false;
    }

    if (name.value.trim().length < 2) {
      showError(name, "Name must contain at least 2 characters.");
      return false;
    }

    clearError(name);
    return true;
  }

  function validateEmail() {
    const email = document.getElementById("email");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.value.trim() === "") {
      showError(email, "Please enter your email.");
      return false;
    }

    if (!emailPattern.test(email.value.trim())) {
      showError(email, "Please enter a valid email address.");
      return false;
    }

    clearError(email);
    return true;
  }

  function validatePhone() {
    const phone = document.getElementById("phone");

    const phonePattern = /^[0-9+\-\s()]{7,20}$/;

    if (phone.value.trim() === "") {
      showError(phone, "Please enter your phone number.");
      return false;
    }

    if (!phonePattern.test(phone.value.trim())) {
      showError(phone, "Please enter a valid phone number.");
      return false;
    }

    clearError(phone);
    return true;
  }

  function validateMessage() {
    const message = document.getElementById("message");

    if (message.value.trim() === "") {
      showError(message, "Please enter your message.");
      return false;
    }

    if (message.value.trim().length < 10) {
      showError(message, "Message must contain at least 10 characters.");

      return false;
    }

    clearError(message);
    return true;
  }

  /* =====================================================
     LIVE VALIDATION
  ===================================================== */

  document.getElementById("name").addEventListener("input", validateName);

  document.getElementById("email").addEventListener("input", validateEmail);

  document.getElementById("phone").addEventListener("input", validatePhone);

  document.getElementById("message").addEventListener("input", validateMessage);

  /* =====================================================
     CONTACT FORM SUBMISSION
  ===================================================== */

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameValid = validateName();
    const emailValid = validateEmail();
    const phoneValid = validatePhone();
    const messageValid = validateMessage();

    if (!nameValid || !emailValid || !phoneValid || !messageValid) {
      showToast("Please correct the errors in the form.");
      return;
    }

    const originalText = sendMessageBtn.innerHTML;

    sendMessageBtn.classList.add("loading");

    sendMessageBtn.innerHTML = `
      <span>Sending...</span>
      <i class="bi bi-hourglass-split"></i>
    `;

    /*
      Simulated sending process.

      Later, this section can be connected to:
      - PHP
      - Node.js
      - Firebase
      - EmailJS
      - Formspree
      - Your own backend/API
    */

    setTimeout(() => {
      sendMessageBtn.classList.remove("loading");

      sendMessageBtn.innerHTML = originalText;

      contactForm.reset();

      document.querySelectorAll(".error-message").forEach((error) => {
        error.textContent = "";
      });

      document.querySelectorAll(".form-control").forEach((input) => {
        input.classList.remove("input-error");
      });

      showToast(
        "Your message has been sent successfully. Thank you for contacting Haniel Stores!",
      );
    }, 1500);
  });

  /* ---------SEARCH---------- */

  function performSearch() {
    const searchValue = searchInput.value.trim();

    if (searchValue === "") {
      showToast("Please enter a product to search for.");
      searchInput.focus();
      return;
    }

    /*
      Change this later to your actual shop/search page.
    */

    window.location.href = `shop.html?search=${encodeURIComponent(searchValue)}`;
  }

  searchBtn.addEventListener("click", performSearch);

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      performSearch();
    }
  });

  /* --------WISHLIST--------- */

  wishlistBtn.addEventListener("click", () => {
    showToast("Wishlist feature will be available soon.");
  });

  /* ---------CART---------*/

  cartBtn.addEventListener("click", () => {
    showToast("Your cart is currently empty.");
  });

  /* --------------SUBSCRIBE FORM--------- */

  subscribeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = subscribeEmail.value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email === "") {
      showToast("Please enter your email address.");
      subscribeEmail.focus();
      return;
    }

    if (!emailPattern.test(email)) {
      showToast("Please enter a valid email address.");
      subscribeEmail.focus();
      return;
    }

    showToast("Thank you for subscribing to Haniel Stores!");

    subscribeForm.reset();
  });

  /* -------SCROLL REVEAL-------- */

  const revealElements = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
    },
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });

  /* ---------navbar scroll effect---------- */

  const navbar = document.querySelector(".main-navbar");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 30) {
      navbar.style.boxShadow = "0 3px 15px rgba(0, 0, 0, 0.08)";
    } else {
      navbar.style.boxShadow = "none";
    }
  });
});
