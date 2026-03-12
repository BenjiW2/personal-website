import { notes } from "../content.js";
import { renderNoteCard } from "../components.js";
import { setupSiteChrome } from "../site.js";

const root = document.getElementById("page-root");
const base = document.body.dataset.base || ".";

root.innerHTML = `
  <section class="page-section page-hero">
    <article class="panel panel--accent page-hero__content" data-reveal>
      <div class="panel__inner">
        <p class="eyebrow">Notes</p>
        <h1 class="page-title">Short build logs, technical notes, and the ideas worth keeping around.</h1>
        <p class="lede">
          The writing here is meant to stay close to the work: short on performance, long on observations that might still matter in six months.
        </p>
      </div>
    </article>
    <aside class="panel page-hero__aside" data-reveal>
      <div class="panel__inner">
        <h2 class="panel-title">What shows up here</h2>
        <div class="summary-list">
          <div class="summary-list__item">
            <p class="summary-list__label">Build logs</p>
            <p class="summary-list__value">What changed in a project and why</p>
          </div>
          <div class="summary-list__item">
            <p class="summary-list__label">Technical notes</p>
            <p class="summary-list__value">Small observations about systems, performance, and tooling</p>
          </div>
          <div class="summary-list__item">
            <p class="summary-list__label">Field notes</p>
            <p class="summary-list__value">Reflections that came directly out of building</p>
          </div>
        </div>
      </div>
    </aside>
  </section>

  <section class="page-section">
    <article class="panel" data-reveal>
      <div class="panel__inner">
        <div class="note-grid">
          ${notes.map((note) => renderNoteCard(note, base)).join("")}
        </div>
      </div>
    </article>
  </section>
`;

setupSiteChrome();
