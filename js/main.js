(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  const navLinks = nav ? [...nav.querySelectorAll("a")] : [];
  const form = document.querySelector("#enquiry-form");
  const status = document.querySelector("#form-status");
  const contactEmail = (form && form.dataset.email ? form.dataset.email : "").trim();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const closeNav = () => {
    document.body.classList.remove("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) navLinks[0]?.focus();
    });

    navLinks.forEach((link) => link.addEventListener("click", closeNav));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  const sections = [...document.querySelectorAll("main section[id]")];
  const setCurrent = () => {
    const fromTop = window.scrollY + (header ? header.offsetHeight + 24 : 80);
    let current = sections[0]?.id;
    sections.forEach((section) => {
      if (section.offsetTop <= fromTop) current = section.id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const id = href.startsWith("#") ? href.slice(1) : "";
      if (id && id === current) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  setCurrent();
  window.addEventListener("scroll", setCurrent, { passive: true });

  if (!reduceMotion && "IntersectionObserver" in window) {
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

  if (!form) return;

  const setStatus = (message, state) => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state || "";
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const fromEmail = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !fromEmail || !message) {
      setStatus("Please complete your name, email and message so Claire has a way to reply.", "error");
      return;
    }

    if (!contactEmail) {
      setStatus("Thank you. Claire’s enquiry email is not listed on the site yet, so this message has not been sent. Please try again once her contact details appear here.", "error");
      return;
    }

    const subject = encodeURIComponent(`Counselling enquiry from ${name}`);
    const body = encodeURIComponent(
      `${message}\n\n—\n${name}\n${fromEmail}\nPreferred contact: ${String(data.get("contact-preference") || "Not specified")}`
    );
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    setStatus("Your email app should open with the enquiry ready to send.", "ok");
  });
})();
