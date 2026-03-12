import { classes } from "../content.js";
import { renderCourseCard } from "../components.js";
import { setupSiteChrome } from "../site.js";

const root = document.getElementById("page-root");

root.innerHTML = `
  <section class="page-section page-hero">
    <article class="panel panel--accent page-hero__content" data-reveal>
      <div class="panel__inner">
        <p class="eyebrow">Classes</p>
        <h1 class="page-title">Coursework that feels like live input into the projects.</h1>
        <p class="lede">
          This page is intentionally closer to an intellectual map than a transcript. The point is what each class opened up, not only that it happened.
        </p>
      </div>
    </article>
    <aside class="panel page-hero__aside" data-reveal>
      <div class="panel__inner">
        <h2 class="panel-title">Current thread</h2>
        <p class="panel-copy">
          Right now the classes fit together around perception, hardware intuition, geometry, and the discipline of making assumptions explicit.
        </p>
        <div class="summary-list">
          ${classes.areas
            .map(
              (area) => `
                <div class="summary-list__item">
                  <p class="summary-list__label">${area.label}</p>
                  <p class="summary-list__value">${area.classes.join(" / ")}</p>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    </aside>
  </section>

  <section class="page-section">
    <article class="panel" data-reveal>
      <div class="panel__inner">
        <div class="panel-title-row">
          <div>
            <p class="eyebrow">Taking now</p>
            <h2 class="panel-title">The current quarter</h2>
          </div>
        </div>
        <div class="course-grid">
          ${classes.current.map((course) => renderCourseCard(course)).join("")}
        </div>
      </div>
    </article>
  </section>

  <section class="page-section">
    <article class="panel" data-reveal>
      <div class="panel__inner">
        <div class="panel-title-row">
          <div>
            <p class="eyebrow">Selected past classes</p>
            <h2 class="panel-title">Courses that changed how I think</h2>
          </div>
        </div>
        <div class="course-grid">
          ${classes.selected.map((course) => renderCourseCard(course)).join("")}
        </div>
      </div>
    </article>
  </section>
`;

setupSiteChrome();
