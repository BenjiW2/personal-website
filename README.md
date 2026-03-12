# Personal Website

Static multipage personal website with shared data and reusable rendering modules.

## Structure

- `index.html`, `projects.html`, `classes.html`, `notes.html`, `about.html`, `resume.html`
- `projects/` and `notes/` for case-study and note detail pages
- `scripts/content.js` for the site content model
- `scripts/components.js` for reusable UI renderers
- `scripts/pages/` for page-specific assembly
- `styles/site.css` for the shared visual system

## Local preview

Run a static server from the repository root, for example:

```bash
python3 -m http.server 8000
```
