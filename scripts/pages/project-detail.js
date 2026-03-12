import { getProjectBySlug } from "../content.js";
import {
  pathTo,
  renderBulletList,
  renderDiagram,
  renderFigureStrip,
  renderResourceLinks,
  renderStructuredBullets,
  renderSummaryList,
  renderProcessList,
} from "../components.js";
import { setupSiteChrome } from "../site.js";

const root = document.getElementById("page-root");
const slug = document.body.dataset.projectSlug;
const base = document.body.dataset.base || "..";
const project = getProjectBySlug(slug);

if (!project) {
  root.innerHTML = `
    <section class="page-section empty-state">
      <article class="panel" data-reveal>
        <div class="panel__inner">
          <p class="eyebrow">Projects</p>
          <h1 class="page-title">Project not found.</h1>
          <a class="button button--primary" href="${pathTo(base, "projects.html")}">Back to projects</a>
        </div>
      </article>
    </section>
  `;
  setupSiteChrome();
} else {
  const summary = [
    { label: "Role", value: project.role },
    { label: "Timeline", value: project.year },
    { label: "Status", value: project.status },
  ];

  root.innerHTML = `
    <section class="page-section page-hero">
      <article class="panel panel--accent page-hero__content" data-reveal>
        <div class="panel__inner">
          <p class="eyebrow">Project case study</p>
          <a class="section-link" href="${pathTo(base, "projects.html")}">Back to projects</a>
          <h1 class="page-title">${project.title}</h1>
          <p class="lede">${project.subtitle}</p>
          <p class="panel-copy">${project.overview}</p>
          ${renderFigureStrip(project.figures)}
        </div>
      </article>
      <aside class="panel page-hero__aside" data-reveal>
        <div class="panel__inner">
          <h2 class="panel-title">At a glance</h2>
          ${renderSummaryList(summary)}
          ${renderResourceLinks(project.resources, base)}
        </div>
      </aside>
    </section>

    <section class="page-section detail-grid">
      <div class="detail-grid__main">
        <article class="panel" data-reveal>
          <div class="panel__inner">
            <p class="eyebrow">Problem</p>
            <h2 class="panel-title">What this project was trying to solve</h2>
            <p class="panel-copy">${project.problem}</p>
          </div>
        </article>

        <article class="panel" data-reveal>
          <div class="panel__inner">
            <p class="eyebrow">Technical decisions</p>
            <h2 class="panel-title">The choices that shaped the build</h2>
            ${renderStructuredBullets(project.decisions)}
          </div>
        </article>

        <article class="panel" data-reveal>
          <div class="panel__inner">
            <p class="eyebrow">Process</p>
            <h2 class="panel-title">How the project moved forward</h2>
            ${renderProcessList(project.process)}
          </div>
        </article>
      </div>

      <aside class="detail-grid__side">
        <article class="panel" data-reveal>
          <div class="panel__inner">
            <p class="eyebrow">Constraints</p>
            <h2 class="panel-title">Non-negotiables</h2>
            ${renderBulletList(project.constraints)}
          </div>
        </article>

        <article class="panel" data-reveal>
          <div class="panel__inner">
            ${renderDiagram(project.diagram)}
          </div>
        </article>

        <article class="panel" data-reveal>
          <div class="panel__inner">
            <p class="eyebrow">Outcome</p>
            <h2 class="panel-title">What changed</h2>
            <p class="panel-copy">${project.outcome}</p>
          </div>
        </article>
      </aside>
    </section>
  `;

  setupSiteChrome();
}
