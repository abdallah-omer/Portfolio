(() => {
  const projects = window.PORTFOLIO_PROJECTS || [];
  const grid = document.getElementById("projectGrid");
  const modal = document.getElementById("projectModal");
  const modalBody = document.getElementById("modalBody");
  const nav = document.getElementById("siteNav");
  const toggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const encodePath = (path) =>
    path
      .split("/")
      .map((part, index) => (index === 0 ? part : encodeURIComponent(part)))
      .join("/");

  const filters = [
    { id: "all", label: "All work" },
    { id: "Islamic", label: "Islamic" },
    { id: "Education", label: "Education" },
    { id: "Work", label: "Work" },
    { id: "Volunteer", label: "Volunteer" },
    { id: "Humanitarian", label: "Humanitarian" },
  ];

  let activeFilter = "all";

  function matchesFilter(project) {
    if (activeFilter === "all") return true;
    return project.category.toLowerCase().includes(activeFilter.toLowerCase());
  }

  function renderFilters() {
    const toolbar = document.getElementById("workFilters");
    if (!toolbar) return;
    toolbar.innerHTML = filters
      .map(
        (f) =>
          `<button type="button" class="filter-btn${
            f.id === activeFilter ? " is-active" : ""
          }" data-filter="${f.id}">${f.label}</button>`
      )
      .join("");

    toolbar.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeFilter = btn.getAttribute("data-filter");
        renderFilters();
        renderProjects();
      });
    });
  }

  function renderProjects() {
    if (!grid) return;
    const list = projects.filter(matchesFilter);
    grid.innerHTML = list
      .map((project, index) => {
        const icon = encodePath(project.icon);
        const tone = (index % 5) + 1;
        const num = String(index + 1).padStart(2, "0");
        return `
          <article class="project-card tone-${tone} reveal" data-id="${project.id}" style="transition-delay:${(index % 6) * 40}ms">
            <div class="project-stage" aria-hidden="true">
              <span class="project-orb project-orb-a"></span>
              <span class="project-orb project-orb-b"></span>
              <span class="project-orbit"></span>
              <span class="project-index">${num}</span>
              <img class="project-icon" src="${icon}" alt="" loading="lazy" />
            </div>
            <div class="project-body">
              <div class="project-category">${project.category}</div>
              <h3>${project.title}</h3>
              <div class="title-ar">${project.titleAr}</div>
              <div class="project-actions">
                <button type="button" class="project-btn project-btn-details" data-details="${project.id}">
                  View details
                </button>
                <a
                  class="project-btn project-btn-store"
                  href="${project.store}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  App Store ↗
                </a>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    grid.querySelectorAll("[data-details]").forEach((btn) => {
      btn.addEventListener("click", () => openModal(btn.getAttribute("data-details")));
    });

    observeReveals();
  }

  function openModal(id) {
    const project = projects.find((p) => p.id === id);
    if (!project || !modal || !modalBody) return;

    const screens = [project.splash, ...project.screens];
    modalBody.innerHTML = `
      <div class="modal-top">
        <div class="modal-brand">
          <img src="${encodePath(project.icon)}" alt="${project.title} icon" />
          <div>
            <h3>${project.title}</h3>
            <p>${project.titleAr} · ${project.category}</p>
          </div>
        </div>
        <p class="modal-desc">${project.desc}</p>
        <div class="modal-actions">
          <a class="btn btn-primary" href="${project.store}" target="_blank" rel="noopener noreferrer">
            Open on App Store ↗
          </a>
        </div>
      </div>
      <div class="gallery">
        ${screens
          .map(
            (src) => `
          <figure>
            <img src="${encodePath(src)}" alt="${project.title} screenshot" loading="lazy" />
          </figure>`
          )
          .join("")}
      </div>
    `;

    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
  }

  modal?.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  toggle?.addEventListener("click", () => {
    const open = mobileNav?.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  mobileNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("scroll", () => {
    nav?.classList.toggle("is-scrolled", window.scrollY > 12);
  });

  const sections = ["about", "work", "contact"];
  const navLinks = document.querySelectorAll(".nav-links a, .mobile-nav a");

  function updateActiveNav() {
    let current = "";
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top <= 120) current = id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("is-active", href === `#${current}`);
    });
  }

  window.addEventListener("scroll", updateActiveNav);

  function observeReveals() {
    const items = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      if (inView) {
        el.classList.add("is-visible");
      } else {
        io.observe(el);
      }
    });
  }

  const form = document.getElementById("contactForm");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const message = document.getElementById("message")?.value.trim();
    const note = document.getElementById("formStatus");

    if (!name || !email || !message) {
      if (note) {
        note.textContent = "Please fill in name, email, and message.";
        note.style.color = "var(--danger)";
      }
      return;
    }

    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${
        document.getElementById("phone")?.value.trim() || "-"
      }\n\n${message}`
    );
    window.location.href = `mailto:abdallah.android2014@gmail.com?subject=${subject}&body=${body}`;
    if (note) {
      note.textContent = "Opening your email client…";
      note.style.color = "var(--accent)";
    }
  });

  renderFilters();
  renderProjects();
  observeReveals();
  updateActiveNav();
})();
