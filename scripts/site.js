import { renderFooter, renderHeader } from "./components.js";

export function setupSiteChrome() {
  const base = document.body.dataset.base || ".";
  const page = document.body.dataset.page || "home";
  const header = document.querySelector("[data-site-header]");
  const footer = document.querySelector("[data-site-footer]");

  if (header) {
    header.innerHTML = renderHeader({ base, activePage: page });
  }

  if (footer) {
    footer.innerHTML = renderFooter({ base });
  }

  setupReveal();
}

function setupReveal() {
  const elements = Array.from(document.querySelectorAll("[data-reveal]"));

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  elements.forEach((element) => {
    const rect = element.getBoundingClientRect();

    if (rect.top < window.innerHeight * 0.92) {
      element.classList.add("is-visible");
    }
  });

  document.documentElement.classList.add("enhance-motion");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  elements.forEach((element) => {
    if (!element.classList.contains("is-visible")) {
      observer.observe(element);
    }
  });
}
