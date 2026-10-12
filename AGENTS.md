# benjiwarburton.com — design & content contract

Static HTML/CSS site, no build step. Deploys to benjiwarburton.com via GitHub
Actions on push to `main`. **Never commit or push unless Benji explicitly asks.**

Serve locally with `python3 -m http.server` from the repo root.

## Non-negotiables

Every page on this site shares one design system. Before creating a new page,
**copy an existing project page** (e.g. `projects/rgbd-streamer/index.html`) as
your boilerplate and edit it — do not write a page from scratch, do not add
per-page styles, do not introduce new fonts, colors, frameworks, or JS libraries.
All shared styles live in `styles/main.css`; if you change that file, bump the
`?v=YYYYMMDDx` cache-buster in **every** HTML file that links it.

## Design system

**Type.** Newsreader (Google Fonts, serif — body and headings) + Inter (sans —
small caps labels, metadata, small links). Copy the exact `<link>` tags from an
existing page. Content column is `.page`: max-width 640px, centered, and
everything — text, headings, figures, captions — hangs off the **left edge**.
Never center content.

**Color.** All colors are CSS custom properties on `:root` using `light-dark()`.
Light: cream paper `#f8f3e7`, ink `#221e19`. Dark: warm grey `#2a2724`, ink
`#eae6dc`. Accents (Martini Racing livery, same in both themes): red `#c22b2e`,
azure `#6fa8d2`, navy `#22346a`. Rules: red is the signature (name period,
selection, light-mode hover); blues are structure (section labels and ↗ arrows
via `--blue-text`, link underlines via `--blue-line`); **dark-mode hover is
azure, not red** (`--hover` handles this — always use `var(--hover)` for hover
states). Muted text uses `--muted`, hairline rules use `--hairline`.

**Theming.** Dual theme via `color-scheme` + `light-dark()`. Required on every
page, in this order:
1. Inline `<script>` in `<head>` **before** the stylesheet that applies
   `localStorage.theme` to `document.documentElement.dataset.theme` (prevents
   flash — copy it verbatim from an existing page).
2. Two `theme-color` metas (`#f8f3e7` light / `#2a2724` dark).
3. `.theme-toggle` button as the first child of `.page`, plus the toggle
   `<script>` at the end of `<body>` (it also re-triggers the stripe draw).

**Livery stripe.** `<div class="livery" aria-hidden="true"></div>` is the first
element in `<body>` on every page. It's a fixed vertical azure/navy/red stripe
that draws itself downward on load and redraws on theme toggle. It is the only
stripe motif on pages — do **not** add horizontal stripe bands (explicitly
rejected).

**Page anatomy** (project/blog pages): `.livery` → `.page` → `.theme-toggle` →
`<nav>` with `.backlink` ("← Benji Warburton" to `../../`) → `.project-head`
(`h1` + italic `.tagline`) → `.prose` blocks and `.section`s (each: `h2.label`
small-caps heading + `.prose`) → `.footer` (name + email). Homepage rows use
`.rows`/`.row`/`.row-main`/`.row-meta`; row logos are small **full-color** marks
(24px box, `assets/logos/*-mark.png`) — never monochrome-only (rejected), except
Apple which is a `currentColor` CSS mask by design.

**Figures** (blog pages): `figure.figure` (landscape, full column width) or
`figure.figure--tall` (portrait/GIF, capped 340px, left-aligned) with an italic
`<figcaption>`. Always `loading="lazy"` and meaningful `alt`.

## Media

Project media lives in `projects/<slug>/media/`. Photos: resize to ≤1100px wide,
JPEG quality ~82 (`sips`), keep files under ~500KB. Videos become GIFs
(`ffmpeg` palettegen/paletteuse, ~320px wide, 7–9fps, crop dead space, target
under ~3MB). Never commit raw camera files. `pngquant` for PNGs.

## Voice

First person, casual, dry, funny — like a good project blog, not documentation.
Short sentences. Jokes are welcome; corporate polish is not. Facts must be real:
pull from Benji's resume (`assets/resume.pdf`) or ask — never invent roles,
dates, links, or technical claims. It's "Resume" (no accents). No mentions of
self-driving for the Taylor-Dunn truck.

## Verifying changes

Test both themes (toggle + OS preference) and mobile before calling anything
done. Note: headless Chrome clamps windows to 500px minimum width — to test a
true 390px viewport, load the page inside a 390px-wide `<iframe>` served from
the same origin. Check that nothing overflows horizontally and the stripe never
touches text (it hides below 900px).
