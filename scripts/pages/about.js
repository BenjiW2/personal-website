import { aboutPage, experience, siteMeta } from "../content.js";
import { renderTimeline } from "../components.js";
import { setupSiteChrome } from "../site.js";

const root = document.getElementById("page-root");
const base = document.body.dataset.base || ".";

root.innerHTML = `
  <section class="page-section about-grid">
    <article class="panel panel--accent about-photo" data-reveal>
      <img src="${base}/assets/avatar.png" alt="Portrait of ${siteMeta.name}" />
    </article>

    <div class="about-copy">
      <article class="panel" data-reveal>
        <div class="panel__inner">
          <p class="eyebrow">About</p>
          <h1 class="page-title">Technical work with a hardware-aware center of gravity.</h1>
          <div class="text-block">
            ${aboutPage.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
          </div>
        </div>
      </article>

      <article class="panel" data-reveal>
        <div class="panel__inner">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Working style</p>
              <h2 class="panel-title">Three principles I keep returning to</h2>
            </div>
          </div>
          <div class="principle-grid">
            ${aboutPage.principles
              .map(
                (principle) => `
                  <article class="principle">
                    <h3 class="principle__title">${principle.title}</h3>
                    <p class="principle__copy">${principle.copy}</p>
                  </article>
                `
              )
              .join("")}
          </div>
        </div>
      </article>

      <article class="panel" data-reveal>
        <div class="panel__inner">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Timeline</p>
              <h2 class="panel-title">Recent roles and context</h2>
            </div>
          </div>
          ${renderTimeline(experience)}
        </div>
      </article>
    </div>
  </section>
`;

setupSiteChrome();
