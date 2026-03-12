import { projects } from "../content.js";
import { renderProjectCard } from "../components.js";
import { setupSiteChrome } from "../site.js";

const root = document.getElementById("page-root");
const base = document.body.dataset.base || ".";

const featured = projects.filter((project) => project.featured);
const supporting = projects.filter((project) => !project.featured);

root.innerHTML = `
  <section class="page-section page-hero">
    <article class="panel panel--accent page-hero__content" data-reveal>
      <div class="panel__inner">
        <p class="eyebrow">Projects</p>
        <h1 class="page-title">Engineering case studies with actual constraints, process, and outcomes.</h1>
        <p class="lede">
          The goal here is not a collection of polished thumbnails. Each project is framed around the problem, the tradeoffs, and the decisions that shaped the result.
        </p>
      </div>
    </article>
    <aside class="panel page-hero__aside" data-reveal>
      <div class="panel__inner">
        <h2 class="panel-title">What I optimize for</h2>
        <div class="summary-list">
          <div class="summary-list__item">
            <p class="summary-list__label">Project type</p>
            <p class="summary-list__value">Robotics, tooling, systems, hardware-aware software</p>
          </div>
          <div class="summary-list__item">
            <p class="summary-list__label">Preferred shape</p>
            <p class="summary-list__value">Clear problem, explicit constraints, measurable iteration</p>
          </div>
          <div class="summary-list__item">
            <p class="summary-list__label">Tone</p>
            <p class="summary-list__value">Technical, calm, and honest about what actually mattered</p>
          </div>
        </div>
      </div>
    </aside>
  </section>

  <section class="page-section">
    <article class="panel" data-reveal>
      <div class="panel__inner">
        <div class="panel-title-row">
          <div>
            <p class="eyebrow">Featured</p>
            <h2 class="panel-title">Core case studies</h2>
          </div>
        </div>
        <div class="project-grid">
          ${featured.map((project) => renderProjectCard(project, base, { featured: true })).join("")}
        </div>
      </div>
    </article>
  </section>

  <section class="page-section">
    <article class="panel" data-reveal>
      <div class="panel__inner">
        <div class="panel-title-row">
          <div>
            <p class="eyebrow">Additional work</p>
            <h2 class="panel-title">Smaller projects and applied tooling</h2>
          </div>
        </div>
        <div class="project-grid">
          ${supporting.map((project) => renderProjectCard(project, base)).join("")}
        </div>
      </div>
    </article>
  </section>
`;

setupSiteChrome();
