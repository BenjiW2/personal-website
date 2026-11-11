/* Return the Shell: scroll engine, satellite map, and the small interactive widgets. */
(function () {
  'use strict';
  const Scene = window.OysterScene;
  const stage = document.getElementById('stage'), cv = document.getElementById('scene');
  const steps = [...document.querySelectorAll('.step')];
  const eraEl = document.getElementById('era'), capEl = document.getElementById('caption');
  const progEl = document.getElementById('progress'), chEl = document.getElementById('chapters');
  const slider = document.getElementById('reefSlider'), sliderOut = document.getElementById('reefOut');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);

  // ?still=7 freezes the page on step 7 without scrolling (for screenshots and slides)
  const still = (() => { const v = new URLSearchParams(location.search).get('still'); return v !== null && steps[+v] ? +v : -1; })();

  /* ---------- step data ---------- */
  const KEYS = Object.keys(Scene.DEF);
  let prev = Object.assign({}, Scene.DEF);
  const S = steps.map(el => {            // map steps keep whatever the scene was showing before them
    const own = el.dataset.s ? JSON.parse(el.dataset.s) : null;
    if (own) prev = Object.assign({}, Scene.DEF, own);
    return prev;
  });
  const sliderIdx = steps.findIndex(el => el.dataset.slider);
  let era = '', ch = '';
  const meta = steps.map(el => {
    if ('era' in el.dataset) era = el.dataset.era; ch = el.dataset.ch || ch;
    return { era, ch, cap: el.dataset.cap || '', map: el.dataset.map ? JSON.parse(el.dataset.map) : null, places: (el.dataset.places || '').split(',').filter(Boolean) };
  });

  /* ---------- chapter buttons ---------- */
  const chapterBtns = [];
  function goTo(el) {
    const r = el.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - window.innerHeight / 2, behavior: reduced ? 'auto' : 'smooth' });
  }
  steps.forEach((el, i) => {
    if (!el.dataset.ch || i === 0) return;
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = el.dataset.ch;
    b.addEventListener('click', () => goTo(el));
    chEl.appendChild(b); chapterBtns.push({ b, name: el.dataset.ch });
  });

  /* ---------- satellite map (falls back to the illustration if it can't load) ---------- */
  const PLACES = {
    quandamooka: { at: [153.27, -27.36], name: 'Quandamooka', sub: 'Moreton Bay', big: true },
    minjerribah: { at: [153.46, -27.56], name: 'Minjerribah', sub: 'North Stradbroke Island' },
    mulgumpin: { at: [153.405, -27.17], name: 'Mulgumpin', sub: 'Moreton Island' },
    goompi: { at: [153.403, -27.499], name: 'Goompi', sub: 'Dunwich' },
    noogoon: { at: [153.233, -27.39], name: 'Noogoon', sub: 'St Helena Island' },
    brisbane: { at: [153.026, -27.47], name: 'Brisbane', sub: '' },
    river: { at: [153.165, -27.372], name: 'Brisbane River mouth', sub: '' },
    coomera: { at: [153.39, -27.865], name: 'Coomera River', sub: 'first mudworm outbreak, 1895' },
    pumicestone: { at: [153.125, -27.03], name: 'Pumicestone Passage', sub: 'shell recycling and reef trials' }
  };
  let map = null, mapOK = false; const markers = {};
  function mapPadding() {
    const w = stage.clientWidth, h = stage.clientHeight;
    return w < 900 ? { top: 70, bottom: Math.round(h * .45), left: 20, right: 20 } : { top: 70, bottom: 30, left: 30, right: Math.round(Math.min(560, w * .38)) };
  }
  if (window.maplibregl) {
    try {
      map = new maplibregl.Map({
        container: 'map', interactive: false, attributionControl: false, fadeDuration: 0,
        style: { version: 8, sources: { sat: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, maxzoom: 17 } }, layers: [{ id: 'sat', type: 'raster', source: 'sat' }] },
        center: [153.3, -27.4], zoom: 8.4
      });
      map.on('load', () => { mapOK = true; lastMapIdx = -1; dirty = true; });
      for (const k in PLACES) {
        const p = PLACES[k], el = document.createElement('div');
        el.className = 'place' + (p.big ? ' big' : '');
        el.innerHTML = '<i></i><span><b></b><small></small></span>';
        el.querySelector('b').textContent = p.name; el.querySelector('small').textContent = p.sub;
        markers[k] = el;
        new maplibregl.Marker({ element: el, anchor: 'left', offset: [-5, 0] }).setLngLat(p.at).addTo(map);
      }
    } catch (e) { map = null; }
  }
  let lastMapIdx = -1;
  function updateMap(idx) {
    const m = meta[idx].map, show = !!(m && mapOK);
    stage.classList.toggle('show-map', show);
    if (!show || idx === lastMapIdx) return;
    lastMapIdx = idx;
    for (const k in markers) markers[k].classList.toggle('on', meta[idx].places.includes(k));
    const opts = { center: m.center, zoom: m.zoom - (stage.clientWidth < 900 ? .7 : 0), pitch: m.pitch || 0, bearing: m.bearing || 0, padding: mapPadding() };
    if (reduced || still >= 0) map.jumpTo(opts); else map.flyTo(Object.assign(opts, { duration: 3200, essential: true, curve: 1.3 }));
  }

  /* ---------- scroll → state ---------- */
  if (still >= 0) { steps.forEach((el, k) => { if (k !== still) el.style.visibility = 'hidden'; }); const el = steps[still]; Object.assign(el.style, { position: 'fixed', inset: '0', minHeight: '0', zIndex: 5 }); document.getElementById('map').style.transition = 'none'; }
  let centers = [], dirty = true, activeIdx = -1;
  const cur = Object.assign({}, Scene.DEF);
  function measure() { centers = steps.map(el => { const r = el.getBoundingClientRect(); return r.top + window.scrollY + r.height / 2; }); }
  function computeState() {
    const y = window.scrollY + window.innerHeight / 2;
    let i = 0, f = 0;
    if (still >= 0) i = still;
    else {
      while (i < centers.length - 1 && y >= centers[i + 1]) i++;
      if (y > centers[i] && i < centers.length - 1) f = (y - centers[i]) / (centers[i + 1] - centers[i]);
    }
    const e = smooth(clamp((f - .25) / .5)), a = S[i], b = S[Math.min(i + 1, S.length - 1)];
    for (const k of KEYS) cur[k] = lerp(a[k], b[k], e);
    if (sliderIdx >= 0) {
      const w = smooth(clamp(1 - Math.abs(i + f - sliderIdx) * 1.6));
      if (w > 0) {
        const v = slider.value / 100;
        cur.reef = lerp(cur.reef, v, w); cur.fish = lerp(cur.fish, v, w);
        cur.turb = lerp(cur.turb, .08 + .9 * (1 - v), w); cur.grass = lerp(cur.grass, clamp(v * 1.4 - .3), w);
      }
    }
    const near = f > .5 ? Math.min(i + 1, steps.length - 1) : i;
    if (near !== activeIdx) {
      activeIdx = near;
      eraEl.textContent = meta[near].era; capEl.textContent = meta[near].cap;
      chapterBtns.forEach(c => c.b.setAttribute('aria-current', c.name === meta[near].ch ? 'true' : 'false'));
    }
    updateMap(near);
    progEl.style.transform = `scaleX(${still >= 0 ? still / (steps.length - 1) : clamp((y - centers[0]) / (centers[centers.length - 1] - centers[0]))})`;
  }

  /* ---------- loop ---------- */
  let visible = true;
  function frame(ms) {
    if (visible && (!reduced || dirty)) {
      computeState();
      if (!stage.classList.contains('show-map') || dirty) Scene.draw(cur, reduced ? 0 : ms / 1000);
      dirty = false;
    }
    requestAnimationFrame(frame);
  }
  function onResize() { Scene.resize(); measure(); dirty = true; if (map) { map.resize(); lastMapIdx = -1; } }
  window.addEventListener('scroll', () => { dirty = true; }, { passive: true });
  window.addEventListener('resize', onResize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(stage);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); dirty = true; });

  /* ---------- reef slider ---------- */
  const sliderText = v => v > 80 ? 'Full reef. Clear water, seagrass and plenty of fish.'
    : v > 50 ? 'Thinner reef. The water starts to cloud and some fish move on.'
    : v > 20 ? 'Patches of reef. Less light reaches the bed and the seagrass thins out.'
    : v > 0 ? 'A few oysters left. Murky water, little shelter, few fish.'
    : 'No reef. Nothing is filtering the water, and larvae have no shell to settle on.';
  slider.addEventListener('input', () => { sliderOut.textContent = sliderText(+slider.value); dirty = true; });
  sliderOut.textContent = sliderText(+slider.value);

  /* ---------- "ways of seeing" tabs ---------- */
  const LENS = {
    a: [['Whose view', 'The oysterers of the 1860s, as historians describe them.'],
        ['A reef is', 'A store of product, waiting to be collected.'],
        ['Success is', 'Bags sent to market this season.'],
        ['Shell is', 'Waste, or raw material for lime.'],
        ['When it fails', 'Move to the next reef, then look for a technical fix.']],
    b: [['Whose view', 'Quandamooka stewardship, as described in published sources. We are reporting it, not speaking for it.'],
        ['A reef is', 'Something people look after, and are answerable for.'],
        ['Success is', 'Oysters still plentiful for the generations that follow.'],
        ['Shell is', 'The start of the next reef. It goes back.'],
        ['Knowledge comes from', 'Watching the same places closely, over a very long time.']],
    c: [['Where they meet', 'Science can now measure what stewardship protected: hard surface for larvae, clear water, shelter for fish.'],
        ['What that looks like', 'Reef trials on Quandamooka Sea Country run with Traditional Owners, using recycled shell and tracked with DNA sampling.'],
        ['What changes', 'The question shifts from “how many can we take?” to “what does the reef need back?”']]
  };
  const panel = document.getElementById('lens-panel'), tabs = [...document.querySelectorAll('.tabs button')];
  function showLens(k) {
    panel.innerHTML = '';
    const dl = document.createElement('dl');
    for (const [dt, dd] of LENS[k]) { const w = document.createElement('div'), a = document.createElement('dt'), b = document.createElement('dd'); a.textContent = dt; b.textContent = dd; w.append(a, b); dl.append(w); }
    panel.append(dl);
    tabs.forEach(t => { const on = t.dataset.lens === k; t.setAttribute('aria-selected', on); if (on) panel.setAttribute('aria-labelledby', t.id); });
    measure(); dirty = true;
  }
  tabs.forEach(t => t.addEventListener('click', () => showLens(t.dataset.lens)));

  /* ---------- go ---------- */
  Scene.onready = () => { dirty = true; };
  Scene.init(cv);
  showLens('a');
  measure();
  window.addEventListener('load', () => {
    measure(); dirty = true;
    const j = new URLSearchParams(location.search).get('jump');          // ?jump=7 opens at step 7 (handy when rehearsing)
    if (j !== null && centers[+j] !== undefined) window.scrollTo({ top: centers[+j] - window.innerHeight / 2, behavior: 'instant' });
  });
  requestAnimationFrame(frame);
})();
