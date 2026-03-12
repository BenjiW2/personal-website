import { navigation, siteMeta } from "./content.js";

export function pathTo(base, path) {
  if (!path) {
    return base;
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("mailto:") ||
    path.startsWith("#")
  ) {
    return path;
  }

  return `${base}/${path}`;
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateString}T12:00:00`));
}

export function renderHeader({ base, activePage }) {
  const links = navigation
    .map((item) => {
      const isActive = item.id === activePage;
      return `
        <a
          class="site-nav__link"
          href="${pathTo(base, item.path)}"
          ${isActive ? 'aria-current="page"' : ""}
        >
          ${item.label}
        </a>
      `;
    })
    .join("");

  return `
    <div class="page-width site-header__inner">
      <a class="brand" href="${pathTo(base, "index.html")}">
        <span class="brand__name">${siteMeta.name}</span>
        <span class="brand__meta">${siteMeta.shortRole} / ${siteMeta.location}</span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        ${links}
      </nav>
    </div>
  `;
}

export function renderFooter({ base }) {
  return `
    <div class="footer__inner">
      <p>${siteMeta.footerNote}</p>
      <div class="footer__links">
        <a href="${siteMeta.email}">Email</a>
        <a href="${pathTo(base, "projects.html")}">Projects</a>
        <a href="${pathTo(base, "notes.html")}">Notes</a>
        <a href="${pathTo(base, "resume.html")}">Resume</a>
      </div>
    </div>
  `;
}

export function renderChips(items) {
  return `
    <div class="chips" aria-label="Tags">
      ${items.map((item) => `<span class="chip">${item}</span>`).join("")}
    </div>
  `;
}

export function renderMiniCourseList(items) {
  return `
    <div class="course-mini-list">
      ${items
        .map(
          (item) => `
            <div class="course-mini-list__item">
              <div class="course-mini-list__row">
                <p class="course-mini-list__title">${item.code}</p>
                ${item.when ? `<p class="meta">${item.when}</p>` : ""}
              </div>
              <p class="stack-list__copy"><strong>${item.title}</strong></p>
              <p class="course-mini-list__copy">${item.blurb ?? item.why}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

export function renderProjectCard(project, base, options = {}) {
  const href = pathTo(base, `projects/${project.slug}.html`);
  const emphasisClass = options.featured ? " panel--accent" : "";

  return `
    <article class="project-card${emphasisClass}">
      <div class="project-card__top">
        <div>
          <p class="project-card__meta">
            <span>${project.role}</span>
            <span>${project.year}</span>
            <span>${project.status}</span>
          </p>
          <h3 class="panel-title">${project.title}</h3>
          <p class="project-card__summary">${project.summary}</p>
        </div>
        <a class="section-link" href="${href}">Case study</a>
      </div>
      <div class="project-glance">
        ${project.metrics
          .map(
            (metric) => `
              <div class="metric">
                <p class="metric__label">${metric.label}</p>
                <p class="metric__value">${metric.value}</p>
              </div>
            `
          )
          .join("")}
      </div>
      ${renderChips(project.tags)}
    </article>
  `;
}

export function renderNoteCard(note, base) {
  return `
    <article class="note-card">
      <div class="note-card__top">
        <div>
          <p class="note-card__meta">
            <span>${note.kind}</span>
            <span>${formatDate(note.date)}</span>
          </p>
          <h3 class="panel-title">${note.title}</h3>
          <p class="note-card__summary">${note.excerpt}</p>
        </div>
        <a class="section-link" href="${pathTo(base, `notes/${note.slug}.html`)}">Open note</a>
      </div>
      ${renderChips(note.tags)}
    </article>
  `;
}

export function renderCourseCard(course) {
  return `
    <article class="course-card">
      <div class="course-card__top">
        <div>
          <p class="meta">${course.term}</p>
          <h3 class="panel-title">${course.code}: ${course.title}</h3>
          <p class="course-card__summary">${course.about}</p>
        </div>
      </div>
      <div class="course-card__detail">
        <div class="course-card__detail-item">
          <p class="course-card__detail-label">Why it mattered</p>
          <p class="course-card__detail-value">${course.why}</p>
        </div>
        <div class="course-card__detail-item">
          <p class="course-card__detail-label">Project / takeaway</p>
          <p class="course-card__detail-value">${course.takeaway ?? course.artifact}</p>
        </div>
      </div>
    </article>
  `;
}

export function renderTimeline(items) {
  return `
    <div class="timeline">
      ${items
        .map(
          (item) => `
            <article class="timeline__item">
              <p class="timeline__meta">${item.period}</p>
              <h3 class="timeline__title">${item.role}</h3>
              <p class="stack-list__copy"><strong>${item.org}</strong></p>
              <p class="timeline__copy">${item.copy}</p>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

export function renderValueList(items) {
  return `
    <div class="value-list">
      ${items
        .map(
          (item) => `
            <div class="value-list__item">
              <p class="value-list__label">${item.label}</p>
              <p class="value-list__value">${item.value}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

export function renderBulletList(items) {
  return `
    <ul class="bullet-list">
      ${items.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  `;
}

export function renderStructuredBullets(items) {
  return `
    <ul class="bullet-list">
      ${items
        .map(
          (item) => `<li><strong>${item.title}.</strong> ${item.copy}</li>`
        )
        .join("")}
    </ul>
  `;
}

export function renderProcessList(steps) {
  return `
    <div class="process-list">
      ${steps
        .map(
          (step) => `
            <article class="process-step">
              <h3 class="process-step__title">${step.title}</h3>
              <p class="process-step__copy">${step.copy}</p>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

export function renderDiagram(diagram) {
  return `
    <div class="diagram">
      <div class="panel-title-row">
        <div>
          <p class="eyebrow">Diagram</p>
          <h2 class="panel-title">${diagram.title}</h2>
        </div>
      </div>
      <div class="diagram__grid">
        ${diagram.columns
          .map(
            (column) => `
              <article class="diagram-column">
                <p class="diagram-column__label">${column.label}</p>
                <div class="diagram-column__items">
                  ${column.items
                    .map((item) => `<div class="diagram-chip">${item}</div>`)
                    .join("")}
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

export function renderFigureStrip(figures) {
  return `
    <div class="figure-strip">
      ${figures
        .map(
          (figure) => `
            <article class="figure">
              <p class="figure__label">${figure.label}</p>
              <h3 class="figure__title">${figure.title}</h3>
              <p class="figure__copy">${figure.copy}</p>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

export function renderResourceLinks(items, base) {
  return `
    <div class="resource-links">
      ${items
        .map((item) => {
          const content = item.href
            ? `<a class="section-link" href="${pathTo(base, item.href)}">${item.copy}</a>`
            : `<p class="resource-links__copy">${item.copy}</p>`;

          return `
            <div class="resource-links__item">
              <p class="resource-links__title">${item.title}</p>
              ${content}
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

export function renderSummaryList(items) {
  return `
    <div class="summary-list">
      ${items
        .map(
          (item) => `
            <div class="summary-list__item">
              <p class="summary-list__label">${item.label}</p>
              <p class="summary-list__value">${item.value}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}
