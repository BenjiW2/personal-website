import { experience, resumeData } from "../content.js";
import { renderTimeline } from "../components.js";
import { setupSiteChrome } from "../site.js";

const root = document.getElementById("page-root");

root.innerHTML = `
  <section class="page-section page-hero">
    <article class="panel panel--accent page-hero__content" data-reveal>
      <div class="panel__inner">
        <p class="eyebrow">Resume</p>
        <h1 class="page-title">A readable web resume with the same editorial system as the rest of the site.</h1>
        <p class="lede">
          This version is intentionally concise on formatting and heavier on context. It is designed to work as both a quick scan and a starting point for deeper project pages.
        </p>
      </div>
    </article>
    <aside class="panel page-hero__aside" data-reveal>
      <div class="panel__inner">
        <h2 class="panel-title">${resumeData.education.title}</h2>
        <div class="summary-list">
          ${resumeData.education.lines
            .map(
              (line, index) => `
                <div class="summary-list__item">
                  <p class="summary-list__label">${index === 0 ? "School" : index === 1 ? "Program" : "Focus"}</p>
                  <p class="summary-list__value">${line}</p>
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
            <p class="eyebrow">Experience</p>
            <h2 class="panel-title">Current and recent work</h2>
          </div>
        </div>
        ${renderTimeline(experience)}
      </div>
    </article>
  </section>

  <section class="page-section">
    <article class="panel" data-reveal>
      <div class="panel__inner">
        <div class="panel-title-row">
          <div>
            <p class="eyebrow">Skills</p>
            <h2 class="panel-title">Useful contexts and tools</h2>
          </div>
        </div>
        <div class="resume-grid">
          ${resumeData.skills
            .map(
              (skill) => `
                <article class="resume-block">
                  <h3 class="resume-block__title">${skill.title}</h3>
                  <p class="resume-block__copy">${skill.copy}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </article>
  </section>
`;

setupSiteChrome();
