/* =========================================================
   Moh. Jevon Attaillah — Personal Hub
   Cosmic theme interactivity (Vanilla JS)
   ========================================================= */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Navbar: transparent → solid on scroll ---------- */
  const nav = document.querySelector("[data-nav]");
  function handleNavShadow() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
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

  /* ---------- 3. Active section indicator ---------- */
  const sections = document.querySelectorAll("main [id], header[id]");
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

  /* ---------- 4. Scroll-triggered reveal (fade-in / slide-up / zoom-in) ---------- */
  const animatedEls = document.querySelectorAll("[data-animate]");
  if (animatedEls.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      animatedEls.forEach((el) => revealObserver.observe(el));
    } else {
      animatedEls.forEach((el) => el.classList.add("is-visible"));
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

  /* ---------- 8. Typing animation (rotating profession) ---------- */
  const typeEl = document.querySelector("[data-typing]");
  if (typeEl) {
    let roles = [];
    try { roles = JSON.parse(typeEl.dataset.typing); } catch (e) { roles = []; }

    if (roles.length && !reduceMotion) {
      let roleIndex = 0;
      let charIndex = 0;
      let deleting = false;

      function tick() {
        const current = roles[roleIndex];

        if (!deleting) {
          charIndex++;
          typeEl.textContent = current.slice(0, charIndex);
          if (charIndex === current.length) {
            deleting = true;
            return setTimeout(tick, 1600); // pause at full word
          }
          return setTimeout(tick, 75);
        } else {
          charIndex--;
          typeEl.textContent = current.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            return setTimeout(tick, 400); // pause before next word
          }
          return setTimeout(tick, 40);
        }
      }
      tick();
    } else if (roles.length) {
      typeEl.textContent = roles[0];
    }
  }

  /* ---------- 9. Manual skills slider (prev/next buttons) ---------- */
  const skillsData = [
    { icon: "fa-brands fa-php", label: "PHP" },
    { icon: "fa-brands fa-laravel", label: "Laravel" },
    { icon: "fa-solid fa-file-code", label: "Blade" },
    { icon: "fa-solid fa-diagram-project", label: "MVC" },
    { icon: "fa-solid fa-database", label: "MySQL" },
    { icon: "fa-brands fa-linux", label: "Linux" },
    { icon: "fa-solid fa-server", label: "Nginx" },
    { icon: "fa-solid fa-database", label: "MariaDB" },
    { icon: "fa-solid fa-desktop", label: "VirtualBox" },
    { icon: "fa-brands fa-figma", label: "Figma" },
    { icon: "fa-solid fa-bug", label: "Burp Suite" },
    { icon: "fa-solid fa-network-wired", label: "Web Proxy" },
  ];

  const skillsTrack = document.querySelector("[data-skills-track]");
  const skillsViewport = document.querySelector("[data-skills-viewport]");
  const skillsPrevBtn = document.querySelector("[data-skills-prev]");
  const skillsNextBtn = document.querySelector("[data-skills-next]");

  if (skillsTrack && skillsViewport) {
    skillsTrack.innerHTML = skillsData
      .map(
        (s) => `
        <div class="skill-pill">
          <i class="${s.icon}"></i>
          <span>${s.label}</span>
        </div>`
      )
      .join("");

    function updateSkillsNavState() {
      if (!skillsPrevBtn || !skillsNextBtn) return;
      const maxScroll = skillsViewport.scrollWidth - skillsViewport.clientWidth - 2;
      skillsPrevBtn.disabled = skillsViewport.scrollLeft <= 2;
      skillsNextBtn.disabled = skillsViewport.scrollLeft >= maxScroll;
    }

    function scrollSkillsBy(direction) {
      const step = Math.min(skillsViewport.clientWidth * 0.7, 420);
      skillsViewport.scrollBy({ left: direction * step, behavior: "smooth" });
    }

    if (skillsPrevBtn) skillsPrevBtn.addEventListener("click", () => scrollSkillsBy(-1));
    if (skillsNextBtn) skillsNextBtn.addEventListener("click", () => scrollSkillsBy(1));
    skillsViewport.addEventListener("scroll", updateSkillsNavState, { passive: true });
    window.addEventListener("resize", updateSkillsNavState);
    updateSkillsNavState();
  }

  /* ---------- 10. Portfolio tabs ---------- */
  const tabButtons = document.querySelectorAll("[data-tab-btn]");
  const tabPanels = document.querySelectorAll("[data-tab-panel]");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tabBtn;
      tabButtons.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });
      tabPanels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.tabPanel === target);
      });
    });
  });

  /* ---------- 11. Copy email + toast feedback ---------- */
  const toastStack = document.querySelector("[data-toast-stack]");
  function showToast(message, icon) {
    if (!toastStack) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid ${icon || "fa-circle-check"}"></i><span>${message}</span>`;
    toastStack.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }

  document.querySelectorAll("[data-copy-email]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const email = el.dataset.copyEmail;
      if (!email || !navigator.clipboard) return;
      e.preventDefault();
      navigator.clipboard.writeText(email).then(() => {
        showToast("Email disalin ke clipboard", "fa-clipboard-check");
      });
    });
  });

  /* ---------- 12. Contact form → opens visitor's email app (mailto) ---------- */
  const CONTACT_EMAIL = "mohjevonattaillah@gmail.com";
  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const firstName = contactForm.querySelector("[name='first_name']").value.trim();
      const lastName = contactForm.querySelector("[name='last_name']").value.trim();
      const email = contactForm.querySelector("[name='email']").value.trim();
      const message = contactForm.querySelector("[name='message']").value.trim();

      const subject = `Pesan dari Portofolio — ${firstName} ${lastName}`.trim();
      const body =
        `Nama: ${firstName} ${lastName}\n` +
        `Email: ${email}\n\n` +
        `Pesan:\n${message}`;

      const mailtoUrl =
        `mailto:${CONTACT_EMAIL}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      showToast("Membuka aplikasi email Anda...", "fa-paper-plane");
      window.location.href = mailtoUrl;

      contactForm.reset();
    });
  }

  /* ---------- 13. Newsletter form (client-side only) ---------- */
  const newsletterForm = document.querySelector("[data-newsletter-form]");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Berhasil subscribe newsletter!", "fa-circle-check");
      newsletterForm.reset();
    });
  }

  /* ---------- 14. Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();