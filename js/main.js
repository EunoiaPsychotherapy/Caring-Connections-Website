(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  const navLinks = nav ? [...nav.querySelectorAll("a")] : [];
  const brand = document.querySelector(".brand");

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setNavOpen = (open) => {
    document.documentElement.classList.toggle("nav-open", open);
    document.body.classList.toggle("nav-open", open);
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    if (toggle) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
  };

  const closeNav = () => setNavOpen(false);

  const scrollToHash = (hash) => {
    const id = (hash || "").replace(/^#/, "");
    if (!id || id === "top") {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
      return;
    }
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  };

  const goToHash = (hash) => {
    closeNav();
    const id = (hash || "").replace(/^#/, "");
    if (id && !document.getElementById(id)) return false;
    if (history.pushState) history.pushState(null, "", hash || "#top");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToHash(hash));
    });
    return true;
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = !document.body.classList.contains("nav-open");
      setNavOpen(open);
      if (open) navLinks[0]?.focus();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href") || "";
      if (href.startsWith("#")) {
        event.preventDefault();
        goToHash(href);
        return;
      }
      closeNav();
    });
  });

  brand?.addEventListener("click", (event) => {
    const href = brand.getAttribute("href") || "";
    if (!href.startsWith("#")) return;
    event.preventDefault();
    goToHash(href);
  });

  window.addEventListener("popstate", () => {
    closeNav();
    scrollToHash(location.hash || "#top");
  });

  const sections = [...document.querySelectorAll("main section[id]")];
  const setCurrent = () => {
    const fromTop = window.scrollY + (header ? header.offsetHeight + 24 : 80);
    let current = sections[0]?.id;
    sections.forEach((section) => {
      if (section.offsetTop <= fromTop) current = section.id;
    });
    const activeId = window.scrollY < 40 ? "top" : current;
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const id = href.startsWith("#") ? href.slice(1) : "";
      if (id && id === activeId) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  setCurrent();
  window.addEventListener("scroll", setCurrent, { passive: true });

  if (!prefersReducedMotion() && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }
})();
