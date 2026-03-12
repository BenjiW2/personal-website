import { getNoteBySlug } from "../content.js";
import { formatDate, pathTo, renderBulletList } from "../components.js";
import { setupSiteChrome } from "../site.js";

const root = document.getElementById("page-root");
const slug = document.body.dataset.noteSlug;
const base = document.body.dataset.base || "..";
const note = getNoteBySlug(slug);

if (!note) {
  root.innerHTML = `
    <section class="page-section empty-state">
      <article class="panel" data-reveal>
        <div class="panel__inner">
          <p class="eyebrow">Notes</p>
          <h1 class="page-title">Note not found.</h1>
          <a class="button button--primary" href="${pathTo(base, "notes.html")}">Back to notes</a>
        </div>
      </article>
    </section>
  `;
  setupSiteChrome();
} else {
  root.innerHTML = `
    <section class="page-section page-hero">
      <article class="panel panel--accent page-hero__content" data-reveal>
        <div class="panel__inner">
          <p class="eyebrow">${note.kind}</p>
          <a class="section-link" href="${pathTo(base, "notes.html")}">Back to notes</a>
          <h1 class="page-title">${note.title}</h1>
          <p class="meta">${formatDate(note.date)}</p>
          <p class="lede">${note.summary}</p>
        </div>
      </article>
      <aside class="panel page-hero__aside" data-reveal>
        <div class="panel__inner">
          <h2 class="panel-title">Quick takeaways</h2>
          ${renderBulletList(note.takeaways)}
        </div>
      </aside>
    </section>

    <section class="page-section detail-grid">
      <div class="detail-grid__main">
        ${note.sections
          .map(
            (section) => `
              <article class="panel" data-reveal>
                <div class="panel__inner note-body">
                  <p class="eyebrow">${section.title}</p>
                  ${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
                </div>
              </article>
            `
          )
          .join("")}
      </div>
      <aside class="detail-grid__side">
        <article class="panel" data-reveal>
          <div class="panel__inner">
            <p class="eyebrow">Tags</p>
            <h2 class="panel-title">Where this note lives</h2>
            <div class="chips">
              ${note.tags.map((tag) => `<span class="chip">${tag}</span>`).join("")}
            </div>
          </div>
        </article>
      </aside>
    </section>
  `;

  setupSiteChrome();
}
