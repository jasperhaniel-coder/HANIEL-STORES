document.addEventListener("DOMContentLoaded", () => {
  const toastElement = document.getElementById("siteToast");
  const toastMessage = document.getElementById("toastMessage");

  function showToast(message) {
    toastMessage.textContent = message;

    bootstrap.Toast.getOrCreateInstance(toastElement, {
      delay: 2500,
    }).show();
  }

  /* ---------SEARCH------- */

  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const search = searchInput.value.trim();

    if (!search) {
      showToast("Please enter something to search.");
      searchInput.focus();
      return;
    }
    
    window.location.href = `index.html?search=${encodeURIComponent(search)}`;
  });

  /* --------HEADER ICONS------- */

  document.getElementById("wishlistBtn").addEventListener("click", () => {
    showToast("Your wishlist is currently empty.");
  });

  document.getElementById("cartBtn").addEventListener("click", () => {
    showToast("Your shopping cart is currently empty.");
  });

  /* -------SUBSCRIBE----- */

  const subscribeForm = document.getElementById("subscribeForm");
  const subscribeEmail = document.getElementById("subscribeEmail");

  subscribeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = subscribeEmail.value.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!validEmail) {
      subscribeEmail.classList.add("border-danger");
      showToast("Please enter a valid email address.");
      return;
    }

    subscribeEmail.classList.remove("border-danger");

    localStorage.setItem("exclusiveSubscriber", email);

    subscribeEmail.value = "";

    showToast("Thanks! You have been subscribed.");
  });

  /* -------HOME BUTTON INTERACTION------- */

  const homeButton = document.querySelector(".home-btn");

  homeButton.addEventListener("click", (event) => {
    event.currentTarget.classList.add("clicked");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 100);
  });
});
