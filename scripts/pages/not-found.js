import { pathTo } from "../components.js";
import { setupSiteChrome } from "../site.js";

const root = document.getElementById("page-root");
const base = document.body.dataset.base || ".";

root.innerHTML = `
  <section class="page-section empty-state">
    <article class="panel panel--accent" data-reveal>
      <div class="panel__inner">
        <p class="eyebrow">404</p>
        <h1 class="page-title">That page does not exist.</h1>
        <p class="lede">The site is organized as a small editorial grid, so the quickest recovery path is usually to jump back home.</p>
        <div class="actions">
          <a class="button button--primary" href="${pathTo(base, "index.html")}">Go home</a>
          <a class="button button--ghost" href="${pathTo(base, "projects.html")}">Browse projects</a>
        </div>
      </div>
    </article>
  </section>
`;

setupSiteChrome();
