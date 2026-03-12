import { currentStatus, experience, notes, projects, siteMeta } from "../content.js";
import {
  pathTo,
  renderBulletList,
  renderMiniCourseList,
  renderProjectCard,
  renderTimeline,
} from "../components.js";
import { setupSiteChrome } from "../site.js";

const root = document.getElementById("page-root");
const base = document.body.dataset.base || ".";

const featuredProjects = projects.filter((project) => project.featured).slice(0, 2);
const recentNotes = notes.slice(0, 3);

root.innerHTML = `
  <section class="page-section">
    <div class="dashboard">
      <article class="panel panel--accent hero-card" data-reveal>
        <div class="panel__inner hero-layout">
          <div class="hero-copy">
            <div>
              <p class="eyebrow">Home</p>
              <p class="kicker">${siteMeta.name}</p>
            </div>
            <h1 class="display">Engineering <em>systems</em> that connect models, motors, and measurement.</h1>
            <p class="lede">${siteMeta.intro}</p>
            <p class="panel-copy">${siteMeta.summary}</p>
            <div class="actions">
              <a class="button button--primary" href="${pathTo(base, "projects.html")}">View projects</a>
              <a class="button button--ghost" href="${pathTo(base, "notes.html")}">Read recent notes</a>
            </div>
            <div class="facts-grid">
              ${siteMeta.heroFacts
                .map(
                  (fact) => `
                    <div class="fact">
                      <p class="fact__label">${fact.label}</p>
                      <p class="fact__value">${fact.value}</p>
                    </div>
                  `
                )
                .join("")}
            </div>
          </div>
          <div class="hero-portrait">
            <img src="${pathTo(base, "assets/avatar.png")}" alt="Portrait of ${siteMeta.name}" />
            <div class="hero-portrait__badge">Currently in Stanford + Palo Alto</div>
          </div>
        </div>
      </article>

      <article class="panel status-card" data-reveal>
        <div class="panel__inner">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Current status</p>
              <h2 class="panel-title">A few live threads at once.</h2>
            </div>
          </div>
          <div class="stack-list">
            ${currentStatus.building
              .map(
                (item) => `
                  <div class="stack-list__item">
                    <h3 class="stack-list__title">${item.title}</h3>
                    <p class="stack-list__copy">${item.copy}</p>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </article>

      <article class="panel role-card" data-reveal>
        <div class="panel__inner">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Current role</p>
              <h2 class="panel-title">${currentStatus.role.title}</h2>
              <p class="meta">${currentStatus.role.organization} / ${currentStatus.role.time}</p>
            </div>
          </div>
          <p class="panel-copy">${currentStatus.role.summary}</p>
          ${renderBulletList(currentStatus.role.bullets)}
          <a class="section-link" href="${pathTo(base, "resume.html")}">Open resume</a>
        </div>
      </article>

      <article class="panel projects-card" data-reveal>
        <div class="panel__inner">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Featured projects</p>
              <h2 class="panel-title">Case studies, not gallery tiles.</h2>
            </div>
            <a class="section-link" href="${pathTo(base, "projects.html")}">All projects</a>
          </div>
          <div class="project-grid">
            ${featuredProjects
              .map((project) => renderProjectCard(project, base, { featured: true }))
              .join("")}
          </div>
        </div>
      </article>

      <article class="panel classes-card" data-reveal>
        <div class="panel__inner">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Classes snapshot</p>
              <h2 class="panel-title">Current coursework plus the classes that stuck.</h2>
            </div>
            <a class="section-link" href="${pathTo(base, "classes.html")}">Open classes page</a>
          </div>
          <div class="stack-list">
            <div class="stack-list__item">
              <h3 class="stack-list__title">Taking now</h3>
              ${renderMiniCourseList(currentStatus.currentClasses)}
            </div>
            <div class="stack-list__item">
              <h3 class="stack-list__title">Selected past classes</h3>
              ${renderMiniCourseList(currentStatus.selectedPastClasses)}
            </div>
          </div>
        </div>
      </article>

      <article class="panel notes-card" data-reveal>
        <div class="panel__inner">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Recent notes</p>
              <h2 class="panel-title">Build logs, technical notes, and small reflections.</h2>
            </div>
            <a class="section-link" href="${pathTo(base, "notes.html")}">All notes</a>
          </div>
          <div class="note-mini-list">
            ${recentNotes
              .map(
                (note) => `
                  <div class="note-mini-list__item">
                    <p class="meta">${note.kind}</p>
                    <h3 class="note-mini-list__title">${note.title}</h3>
                    <p class="note-mini-list__copy">${note.excerpt}</p>
                    <a class="section-link" href="${pathTo(base, `notes/${note.slug}.html`)}">Read note</a>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </article>

      <article class="panel experience-card" data-reveal>
        <div class="panel__inner">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Experience</p>
              <h2 class="panel-title">Compact timeline</h2>
              <p class="panel-copy">A research-heavy through line, with enough hardware and tooling work to keep the abstractions honest.</p>
            </div>
            <a class="section-link" href="${pathTo(base, "resume.html")}">Resume view</a>
          </div>
          ${renderTimeline(experience)}
        </div>
      </article>
    </div>
  </section>
`;

setupSiteChrome();
