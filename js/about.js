document.addEventListener("DOMContentLoaded", () => {
  /* ------TOAST HELPE------- */
  const toast = document.getElementById("aboutToast");
  const toastMessage = document.getElementById("toastMessage");

  function showToast(message) {
    toastMessage.textContent = message;
    bootstrap.Toast.getOrCreateInstance(toast, {
      delay: 2600,
    }).show();
  }

  /* ------SCROLL REVEAL-------- */
  const revealItems = document.querySelectorAll(".reveal");

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

  revealItems.forEach((item) => revealObserver.observe(item));

  /* -------STAT COUNTERS------- */
  const counters = document.querySelectorAll("[data-target]");
  let countersStarted = false;

  function startCounters() {
    if (countersStarted) return;

    countersStarted = true;

    counters.forEach((counter) => {
      const target = Number(counter.dataset.target);
      const duration = 1300;
      const startTime = performance.now();

      function update(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);

        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(target * eased);

        counter.textContent =
          value >= 1000
            ? `${(value / 1000).toFixed(value >= 10000 ? 1 : 1)}k`
            : value;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          counter.textContent =
            target >= 1000 ? `${(target / 1000).toFixed(1)}k` : target;
        }
      }

      requestAnimationFrame(update);
    });
  }

  const statsSection = document.querySelector(".stats-section");

  const counterObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        startCounters();
        counterObserver.disconnect();
      }
    },
    {
      threshold: 0.35,
    },
  );

  counterObserver.observe(statsSection);

  /* ------CAROUSEL-------- */
  const teamTrack = document.getElementById("teamTrack");
  const dots = document.querySelectorAll(".dot");

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      if (window.innerWidth <= 575) {
        const card =
          teamTrack.children[Math.min(index, teamTrack.children.length - 1)];

        card.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      } else {
        // On desktop, the dots act as a subtle active-state control.
        dots.forEach((item) => item.classList.remove("active"));
        dot.classList.add("active");
      }
    });
  });

  /* ------HEADER SEARCH------- */
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  function doSearch() {
    const value = searchInput.value.trim();

    if (!value) {
      showToast("Type a product name to search.");
      searchInput.focus();
      return;
    }

    window.location.href = `index.html?search=${encodeURIComponent(value)}`;
  }

  searchBtn.addEventListener("click", doSearch);

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      doSearch();
    }
  });

  /* ---------HEADER ICONS-------- */
  document.getElementById("wishlistBtn").addEventListener("click", () => {
    showToast("Your wishlist is ready.");
  });

  document.getElementById("cartBtn").addEventListener("click", () => {
    showToast("Your cart is currently empty.");
  });

  /* --------NEWSLETTER------- */
  const subscribeForm = document.getElementById("subscribeForm");
  const subscribeEmail = document.getElementById("subscribeEmail");

  subscribeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = subscribeEmail.value.trim();

    if (!email || !email.includes("@") || !email.includes(".")) {
      subscribeEmail.classList.add("border-danger");
      showToast("Please enter a valid email address.");
      return;
    }

    subscribeEmail.classList.remove("border-danger");
    subscribeEmail.value = "";

    showToast("Thanks! You have been subscribed.");
  });

  /* ---------ACTIVE NAVIGATION-------- */
  const currentPage = window.location.pathname.split("/").pop().toLowerCase();

  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");

    if (href && href.toLowerCase() === currentPage) {
      link.classList.add("active");
    }
  });
});
