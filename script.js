/* =========================================================
   Moh. Jevon Attaillah — Personal Hub
   Shared interactivity
   ========================================================= */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Sticky nav shadow on scroll ---------- */
  const nav = document.querySelector("[data-nav]");
  function handleNavShadow() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  /* ---------- 2. Mobile menu toggle ---------- */
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 3. Active section highlighting ---------- */
  const sections = document.querySelectorAll("main [id], body > div > section[id]");
  const navLinks = document.querySelectorAll(".nav-link[href^='#']");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
              link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------- 4. Scroll-triggered reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
              const delay = entry.target.dataset.revealDelay || 0;
              setTimeout(() => entry.target.classList.add("is-visible"), Number(delay));
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  }

  /* ---------- 5. Scroll progress bar ---------- */
  const progressBar = document.querySelector("[data-scroll-progress]");
  function handleProgress() {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }

  /* ---------- 6. Back to top ---------- */
  const backToTop = document.querySelector("[data-back-to-top]");
  function handleBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle("is-visible", window.scrollY > 480);
  }
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* Combine scroll listeners for performance */
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleNavShadow();
        handleProgress();
        handleBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 7. Cursor spotlight on .spot cards ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".spot").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        card.style.setProperty("--my", `${e.clientY - rect.top}px`);
      });
    });
  }

  /* ---------- 8. Role rotator in hero ---------- */
  const roleEl = document.querySelector("[data-role-rotator]");
  if (roleEl) {
    let roles = [];
    try {
      roles = JSON.parse(roleEl.dataset.roleRotator);
    } catch (e) {
      roles = [];
    }
    if (roles.length > 1 && !reduceMotion) {
      let idx = 0;
      setInterval(() => {
        idx = (idx + 1) % roles.length;
        roleEl.classList.remove("role-word");
        void roleEl.offsetWidth; // restart animation
        roleEl.textContent = roles[idx];
        roleEl.classList.add("role-word");
      }, 2600);
    }
  }

  /* ---------- 9. Copy email + toast feedback ---------- */
  const toastStack = document.querySelector("[data-toast-stack]");
  function showToast(message, icon) {
    if (!toastStack) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid ${icon || "fa-circle-check"}"></i><span>${message}</span>`;
    toastStack.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  document.querySelectorAll("[data-copy-email]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const email = el.dataset.copyEmail;
      if (!email || !navigator.clipboard) return;
      e.preventDefault();
      navigator.clipboard
        .writeText(email)
        .then(() => showToast("Email disalin ke clipboard", "fa-circle-check"))
        .catch(() => {
          window.location.href = `mailto:${email}`;
        });
    });
  });

  /* ---------- 10. Smooth-scroll offset for sticky nav (in-page anchors) ---------- */
  document.querySelectorAll("a[href^='#']:not([href='#'])").forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = document.querySelector("[data-nav]")?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
      history.pushState(null, "", `#${targetId}`);
    });
  });

  /* ---------- 11. Current year in footer ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();