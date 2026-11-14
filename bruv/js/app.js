(function () {
  'use strict';
  const cfg = window.BRUV_CONFIG || {};
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const HABITATS = ['Mangrove', 'Seagrass', 'Coral Reef'];
  const HAB_COL = { All: ['#6c757d', '#ffffff'], Mangrove: ['#b8322a', '#ffffff'], Seagrass: ['#2f9e68', '#ffffff'], 'Coral Reef': ['#f47c96', '#3d0f1a'] };
  const PALETTE = ['#1f6f8b', '#e07b39', '#6a4c93', '#2f9e68', '#b8322a', '#c9a227', '#4f6d7a', '#f47c96', '#8c564b', '#17becf'];

  const SPECIES = window.SPECIES || [];
  const SP = Object.fromEntries(SPECIES.map(s => [s.id, s]));
  const thumb = s => s.img.replace('species/', 'species/thumb/');
  const photo = (s, cls, src) => s.img ? `<img src="${esc(src)}" class="${cls} ${s.fit ? 'fit-whole' : ''}" alt="${esc(s.common)}" loading="lazy" data-show="${s.id}">`
    : `<div class="${cls} sp-nophoto" data-show="${s.id}">No photo</div>`;

  let setup = { sites: [], videos: [], assignments: [] };
  let siteBy = {}, videoBy = {};
  let subs = [], others = [];
  let otherCounts = {};
  let lastLoaded = null;

  // ---------------------------------------------------------------- helpers
  function toast(msg, kind = 'success', ms = 4500) {
    const d = document.createElement('div');
    d.className = `alert alert-${kind} shadow-sm mb-0 py-2`;
    d.innerHTML = msg;
    $('toast-area').appendChild(d);
    setTimeout(() => d.remove(), ms);
  }
  const store = {
    get(k) { try { return localStorage.getItem('bruv_' + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('bruv_' + k, v); } catch (e) {} }
  };
  const habStyle = h => { const c = HAB_COL[h] || ['#888', '#fff']; return `--hab:${c[0]};--hab-text:${c[1]}`; };
  const habBadge = h => h ? `<span class="hab-badge" style="${habStyle(h)}">${esc(h)}</span>` : '';
  function options(sel, items, placeholder, keep = true) {
    const prev = sel.value;
    sel.innerHTML = (placeholder != null ? `<option value="">${esc(placeholder)}</option>` : '') +
      items.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');
    if (keep && [...sel.options].some(o => o.value === prev)) sel.value = prev;
  }
  const uniq = a => [...new Set(a)];
  const videoMeta = vid => {
    const v = videoBy[vid] || {}; const s = siteBy[v.station] || {};
    return { video_id: vid, label: v.label || vid, station: v.station || '', habitat: s.habitat || '', site: s.site || '', drop_id: v.drop_id || vid, url: v.url || '' };
  };

  function pills(container, name, onChange) {
    container.innerHTML = ['All', ...HABITATS].map(h =>
      `<label class="hab-pill" style="${habStyle(h)}"><input type="radio" name="${name}" value="${esc(h)}" ${h === 'All' ? 'checked' : ''}>${esc(h)}</label>`).join('');
    container.addEventListener('change', onChange);
  }
  const pillVal = name => (document.querySelector(`input[name="${name}"]:checked`) || {}).value || 'All';
  function setPill(name, v) { const r = document.querySelector(`input[name="${name}"][value="${CSS.escape(v)}"]`); if (r) r.checked = true; }

  // ---------------------------------------------------------------- stats
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  function quantile(a, q) {
    const s = [...a].sort((x, y) => x - y); const p = (s.length - 1) * q; const lo = Math.floor(p), hi = Math.ceil(p);
    return s[lo] + (s[hi] - s[lo]) * (p - lo);
  }
  const median = a => quantile(a, 0.5);
  const se = a => a.length > 1 ? Math.sqrt(a.reduce((x, y) => x + (y - mean(a)) ** 2, 0) / (a.length - 1) / a.length) : 0;
  const round = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

  // ---------------------------------------------------------------- loading
  async function loadSetup() {
    setup = await DB.loadSetup();
    siteBy = Object.fromEntries(setup.sites.map(s => [s.station, s]));
    videoBy = Object.fromEntries(setup.videos.map(v => [v.video_id, v]));
  }
  async function loadData() {
    const [s, o] = await Promise.all([DB.loadSubmissions(), DB.loadOther()]);
    subs = s; others = o; lastLoaded = new Date();
  }
  async function refreshAll(full) {
    try {
      if (full) await loadSetup();
      await loadData();
      $('load-error').classList.add('d-none');
    } catch (e) {
      $('load-error').textContent = 'Could not reach the database: ' + e.message + ' (retrying automatically)';
      $('load-error').classList.remove('d-none');
      return;
    }
    if (full) { renderSites(); renderPickers(); renderAsgSelectors(); }
    renderAsg(); renderOtherSugg(); renderWho(); renderSpShow(); renderVisible();
  }

  // ---------------------------------------------------------------- Sites
  let map = null, mapLayer = null;
  function renderSites() {
    const html = HABITATS.map(h => {
      const st = setup.sites.filter(s => s.habitat === h);
      if (!st.length) return '';
      return `<div class="card mb-3"><div class="card-header">${habBadge(h)} <span class="ms-1">${st.length} station${st.length > 1 ? 's' : ''}</span></div>
        <div class="card-body p-0"><div class="table-responsive"><table class="table table-sm mb-0 align-middle"><thead><tr><th>Station</th><th>Site</th><th>Depth (m)</th><th>Videos</th><th>Notes</th></tr></thead><tbody>
        ${st.map(s => `<tr><td class="fw-semibold">${esc(s.station)}</td><td>${esc(s.site)}</td><td>${s.depth_m ?? ''}</td>
          <td>${setup.videos.filter(v => v.station === s.station).length}</td><td class="small">${esc(s.description)}</td></tr>`).join('')}
        </tbody></table></div></div></div>`;
    }).join('');
    $('sites_ui').innerHTML = html || '<p class="text-body-secondary">No stations have been added yet.</p>';
    const pts = setup.sites.filter(s => s.lat != null && s.lon != null && !isNaN(s.lat));
    $('map').classList.toggle('d-none', !pts.length || !window.L);
  }
  function drawMap() {
    const pts = setup.sites.filter(s => s.lat != null && s.lon != null && !isNaN(s.lat));
    if (!pts.length || !window.L) return;
    if (!map) {
      map = L.map('map');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    }
    if (mapLayer) mapLayer.remove();
    mapLayer = L.featureGroup(pts.map(s => L.circleMarker([s.lat, s.lon], { radius: 8, color: '#fff', weight: 2, fillColor: (HAB_COL[s.habitat] || ['#888'])[0], fillOpacity: .95 })
      .bindPopup(`<strong>${esc(s.station)}</strong><br>${esc(s.site)}<br>${esc(s.habitat)}`))).addTo(map);
    map.invalidateSize();
    map.fitBounds(mapLayer.getBounds().pad(0.2), { maxZoom: 14 });
  }

  // ---------------------------------------------------------------- ID guide
  function renderGuide() {
    $('guide_cards').innerHTML = SPECIES.map(s => `
      <div class="card guide-card" data-id="${s.id}" data-habitats="${esc(s.habitats.join('|'))}" data-search="${esc((s.common + ' ' + s.sci + ' ' + s.family).toLowerCase())}">
        ${photo(s, 'guide-photo card-img-top', s.img)}
        <div class="card-body">
          <h6 class="mb-0">${esc(s.common)}</h6>
          <div class="small fst-italic text-body-secondary">${esc(s.sci)}</div>
          <div class="small mb-2">${esc(s.family)}</div>
          <div class="d-flex flex-wrap gap-1 mb-2">${s.habitats.map(habBadge).join('')}</div>
          ${s.features ? `<div class="guide-features">${esc(s.features)}</div>` : ''}
        </div>
      </div>`).join('');
  }
  function filterGuide() {
    const h = pillVal('guide_hab'), q = $('guide_search').value.toLowerCase().trim();
    document.querySelectorAll('.guide-card').forEach(c => {
      const ok = (h === 'All' || c.dataset.habitats.split('|').includes(h)) && (!q || c.dataset.search.includes(q));
      c.classList.toggle('d-none', !ok);
    });
  }
  function showSpecies(id) {
    const s = SP[id]; if (!s) return;
    $('sp_modal_title').innerHTML = `${esc(s.common)} <small class="fst-italic text-body-secondary">${esc(s.sci)}</small>`;
    $('sp_modal_body').innerHTML = `${s.img ? `<img src="${esc(s.img)}" alt="${esc(s.common)}" class="img-fluid rounded mb-3 w-100" style="max-height:60vh;object-fit:contain">` : ''}
      <div class="mb-2"><strong>Family:</strong> ${esc(s.family)} &nbsp; ${s.habitats.map(habBadge).join(' ')}</div>
      <div class="guide-features">${s.features ? esc(s.features) : '<span class="text-body-secondary">No ID notes added for this species yet.</span>'}</div>`;
    bootstrap.Modal.getOrCreateInstance($('sp_modal')).show();
  }

  // ---------------------------------------------------------------- Assignments
  function renderAsgSelectors() {
    const groups = uniq(setup.assignments.map(a => a.group_name));
    options($('asg_group'), groups.map(g => [g, g]), 'Choose your group');
    if (!$('asg_group').value && store.get('asg_group') && groups.includes(store.get('asg_group'))) $('asg_group').value = store.get('asg_group');
    renderAsgPairs();
  }
  function renderAsgPairs() {
    const g = $('asg_group').value;
    options($('asg_pair'), uniq(setup.assignments.filter(a => a.group_name === g).map(a => a.pair_name)).map(p => [p, p]), 'All pairs');
  }
  function renderAsg() {
    const g = $('asg_group').value, p = $('asg_pair').value;
    if (!setup.assignments.length) { $('asg_ui').innerHTML = '<p class="text-body-secondary">No assignments have been added yet.</p>'; return; }
    if (!g) { $('asg_ui').innerHTML = '<p class="text-body-secondary">Choose your group to see its videos.</p>'; return; }
    const rows = setup.assignments.filter(a => a.group_name === g && (!p || a.pair_name === p));
    const doneN = vid => subs.filter(s => s.video_id === vid).length;
    const nDone = rows.filter(a => doneN(a.video_id) > 0).length;
    $('asg_ui').innerHTML = `<p class="small mb-2">${nDone} of ${rows.length} videos done.</p>
      <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Pair</th><th>Video</th><th>Habitat</th><th>Station</th><th>Status</th><th></th></tr></thead><tbody>
      ${rows.map(a => { const m = videoMeta(a.video_id); const n = doneN(a.video_id); return `<tr class="${n ? 'table-success' : ''}">
        <td>${esc(a.pair_name)}</td><td>${esc(m.label)}</td><td>${habBadge(m.habitat)}</td><td>${esc(m.station)}</td>
        <td>${n ? `&#10004; Done <span class="text-body-secondary small">(${n} entr${n > 1 ? 'ies' : 'y'})</span>` : '<span class="text-body-secondary">Not yet</span>'}</td>
        <td><button class="btn btn-sm btn-outline-primary" data-goto-video="${esc(a.video_id)}">Enter data</button></td></tr>`; }).join('')}
      </tbody></table></div>`;
  }

  // ---------------------------------------------------------------- Enter data
  function renderPickers() {
    const habs = HABITATS.filter(h => setup.sites.some(s => s.habitat === h));
    options($('pick_hab'), habs.map(h => [h, h]), 'Choose a habitat');
    renderStations();
  }
  function renderStations() {
    const h = $('pick_hab').value;
    const st = setup.sites.filter(s => s.habitat === h);
    options($('pick_station'), st.map(s => [s.station, s.station + (s.site ? ' (' + s.site + ')' : '')]), h ? 'Choose a station' : 'Choose a habitat first');
    renderVideos();
  }
  function renderVideos() {
    const st = $('pick_station').value;
    const vids = setup.videos.filter(v => v.station === st);
    const s = siteBy[st];
    $('site_note').innerHTML = s ? [s.site && `<strong>${esc(s.site)}</strong>`, s.depth_m != null && `${s.depth_m} m deep`, s.description && esc(s.description)].filter(Boolean).join(' · ') : '';
    const me = $('student').value.trim();
    options($('video'), vids.map(v => [v.video_id, (v.label || v.video_id) + (me && subs.some(x => x.student === me && x.video_id === v.video_id) ? '  ✓ submitted' : '')]),
      st ? (vids.length ? 'Choose a video at this station' : 'No videos at this station yet') : 'Choose a station first');
    renderVideoInfo();
  }
  function embed(url) {
    if (!url || /example\.com/.test(url)) return `<div class="video-placeholder">No video link has been added for this video yet.</div>`;
    let m;
    if ((m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/))) return `<iframe class="video-frame" src="https://www.youtube-nocookie.com/embed/${m[1]}?rel=0" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    if ((m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/))) return `<iframe class="video-frame" src="https://drive.google.com/file/d/${m[1]}/preview" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    if ((m = url.match(/vimeo\.com\/(\d+)/))) return `<iframe class="video-frame" src="https://player.vimeo.com/video/${m[1]}" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return `<video class="video-frame" src="${esc(url)}" controls preload="metadata" playsinline></video>`;
    return `<iframe class="video-frame" src="${esc(url)}" allow="fullscreen" allowfullscreen></iframe>`;
  }
  function renderVideoInfo() {
    const vid = $('video').value;
    if (!vid) { $('video_info').innerHTML = ''; return; }
    const v = videoBy[vid] || {};
    const n = subs.filter(s => s.video_id === vid).length;
    $('video_info').innerHTML = embed(v.url) +
      `<div class="d-flex flex-wrap justify-content-between gap-2 mt-2 small">
        ${v.url && !/example\.com/.test(v.url) ? `<a href="${esc(v.url)}" target="_blank" rel="noopener">Open video in a new tab &#8599;</a>` : '<span></span>'}
        <span class="text-body-secondary">${n} entr${n === 1 ? 'y' : 'ies'} so far for this video</span></div>
      ${v.notes ? `<div class="small text-body-secondary mt-1">${esc(v.notes)}</div>` : ''}`;
  }
  function onVideoChosen() {
    renderVideoInfo();
    const m = videoMeta($('video').value);
    if (m.habitat) { setPill('entry_hab', m.habitat); filterTiles(); }
    loadPrevious();
  }
  function loadPrevious() {
    const me = $('student').value.trim(), vid = $('video').value;
    const prev = me && vid && subs.find(s => s.student === me && s.video_id === vid);
    if (!prev) return;
    setCounts(prev.counts || {}); otherCounts = { ...(prev.other || {}) }; $('notes').value = prev.notes || '';
    renderOtherList(); renderSummary(); filterTiles();
    toast('Loaded your earlier entry for this video. Submitting again replaces it.', 'info');
  }

  function renderTiles() {
    $('sp_grid').innerHTML = SPECIES.map(s => `
      <div class="sp-tile" data-id="${s.id}" data-habitats="${esc(s.habitats.join('|'))}" data-search="${esc((s.common + ' ' + s.sci + ' ' + s.family).toLowerCase())}">
        <button type="button" class="sp-thumb-btn" title="Show ID features" data-show="${s.id}">${photo(s, 'sp-thumb', thumb(s))}</button>
        <div class="sp-name">${esc(s.common)}</div>
        <div class="sp-sci"><em>${esc(s.sci)}</em></div>
        <input type="number" class="form-control form-control-sm sp-n" data-id="${s.id}" value="0" min="0" step="1" inputmode="numeric" aria-label="MaxN ${esc(s.common)}">
      </div>`).join('');
  }
  function getCounts() {
    const c = {};
    document.querySelectorAll('.sp-n').forEach(i => { const n = Math.floor(+i.value); if (n > 0) c[i.dataset.id] = Math.min(n, 100000); });
    return c;
  }
  function setCounts(c) {
    document.querySelectorAll('.sp-n').forEach(i => { i.value = c[i.dataset.id] || 0; i.closest('.sp-tile').classList.toggle('has-count', (c[i.dataset.id] || 0) > 0); });
  }
  function filterTiles() {
    const h = pillVal('entry_hab'), q = $('entry_search').value.toLowerCase().trim(), only = $('entry_only').checked;
    document.querySelectorAll('.sp-tile').forEach(t => {
      const n = +t.querySelector('.sp-n').value || 0;
      t.classList.toggle('has-count', n > 0);
      const ok = (h === 'All' || t.dataset.habitats.split('|').includes(h)) && (!q || t.dataset.search.includes(q)) && (!only || n > 0);
      t.classList.toggle('d-none', !ok);
    });
  }
  function renderSummary() {
    const c = getCounts();
    const items = [...Object.entries(c).map(([id, n]) => [SP[id].common, n]), ...Object.entries(otherCounts).map(([k, n]) => [k + ' (other)', n])];
    const warn = [];
    if (!$('student').value.trim()) warn.push('Add your name or group.');
    if (!$('video').value) warn.push('Choose a video.');
    $('entry_summary').innerHTML =
      (items.length ? `<div class="small mb-1"><strong>${items.length} species</strong>, total MaxN ${items.reduce((a, [, n]) => a + n, 0)}:</div>
        <div class="d-flex flex-wrap gap-1 mb-1">${items.map(([k, n]) => `<span class="badge text-bg-light border">${esc(k)}: ${n}</span>`).join('')}</div>`
        : '<div class="small text-body-secondary mb-1">No species entered yet (that\'s fine if you saw none).</div>') +
      (warn.length ? `<div class="small text-danger">${warn.join(' ')}</div>` : '');
  }

  // Other species
  function renderOtherList() {
    const e = Object.entries(otherCounts);
    $('other_list').innerHTML = e.length ? `<ul class="list-unstyled small mb-2">${e.map(([k, n]) =>
      `<li class="d-flex align-items-center gap-2"><span>${esc(k)}: <strong>${n}</strong></span><button type="button" class="btn btn-link btn-sm p-0 text-danger" data-other-remove="${esc(k)}">remove</button></li>`).join('')}</ul>` : '';
  }
  function renderOtherSugg() {
    const q = $('other_name').value.toLowerCase().trim();
    const list = others.filter(o => !o.hidden && !(o.name in otherCounts) && (!q || o.name.toLowerCase().includes(q))).slice(0, 15);
    $('other_sugg').innerHTML = list.map(o => `<span class="chip"><button type="button" data-sugg="${esc(o.name)}">${esc(o.name)}</button></span>`).join('');
  }
  async function addOther() {
    const name = $('other_name').value.trim().replace(/\s+/g, ' ');
    const n = Math.floor(+$('other_n').value);
    if (!name) { toast('Type a species name first.', 'warning'); return; }
    const lc = name.toLowerCase();
    const g = SPECIES.find(s => s.common.toLowerCase() === lc || s.sci.toLowerCase() === lc);
    if (g) {
      $('entry_search').value = g.common; setPill('entry_hab', 'All'); filterTiles();
      toast(`<strong>${esc(g.common)}</strong> is already in the ID guide. Enter its MaxN on its tile.`, 'info');
      return;
    }
    const existing = Object.keys(otherCounts).find(k => k.toLowerCase() === lc) || others.find(o => o.name.toLowerCase() === lc)?.name || name;
    if (!(n > 0)) delete otherCounts[existing]; else otherCounts[existing] = Math.min(n, 100000);
    $('other_name').value = ''; $('other_n').value = 1;
    renderOtherList(); renderSummary(); renderOtherSugg();
    if (n > 0) {
      DB.addOther(existing).catch(() => {});
    }
  }

  async function submit() {
    const student = $('student').value.trim(), vid = $('video').value;
    if (!student) { toast('Type your name or group first.', 'warning'); $('student').focus(); return; }
    if (!vid) { toast('Choose a video first.', 'warning'); return; }
    const pending = $('other_name').value.trim();
    if (pending && !confirm(`"${pending}" is typed in Other species but not added. Submit without it?`)) return;
    const counts = getCounts();
    if (!Object.keys(counts).length && !Object.keys(otherCounts).length && !confirm('No species entered. Submit this video as "nothing seen"?')) return;
    const btn = $('submit'); btn.disabled = true; btn.textContent = 'Submitting…';
    try {
      const replaced = subs.some(s => s.student === student && s.video_id === vid);
      await DB.saveSubmission({ student, video_id: vid, counts, other: { ...otherCounts }, notes: $('notes').value.trim() });
      toast(`<strong>Submitted!</strong> ${esc(videoMeta(vid).label)}${replaced ? ' (replaced your earlier entry)' : ''}. Pick your next video.`);
      setCounts({}); otherCounts = {}; $('notes').value = ''; $('video').value = '';
      $('entry_search').value = ''; $('entry_only').checked = false;
      renderOtherList(); renderVideoInfo(); filterTiles();
      await loadData().catch(() => {});
      renderVideos(); renderSummary(); renderAsg(); renderWho();
    } catch (e) {
      toast('Could not submit: ' + esc(e.message) + '. Your counts are still here, so try again.', 'danger', 8000);
    } finally { btn.disabled = false; btn.textContent = 'Submit'; }
  }

  // ---------------------------------------------------------------- analysis
  const keyLabel = k => k.startsWith('g:') ? (SP[k.slice(2)] || {}).common || k.slice(2) : k.slice(2) + ' (other)';
  function units() {
    const who = $('who').value || 'Everyone', stat = document.querySelector('input[name=stat]:checked').value, unit = document.querySelector('input[name=unit]:checked').value;
    const f = subs.filter(s => videoBy[s.video_id] && (who === 'Everyone' || s.student === who));
    const byVid = {};
    f.forEach(s => (byVid[s.video_id] = byVid[s.video_id] || []).push(s));
    const avg = stat === 'mean' ? mean : median;
    let rows = Object.entries(byVid).map(([vid, ss]) => {
      const keys = uniq(ss.flatMap(s => [...Object.keys(s.counts || {}).map(k => 'g:' + k), ...Object.keys(s.other || {}).map(k => 'o:' + k)]));
      const vals = {};
      keys.forEach(k => { const v = avg(ss.map(s => +((k.startsWith('g:') ? (s.counts || {})[k.slice(2)] : (s.other || {})[k.slice(2)]) || 0))); if (v > 0) vals[k] = v; });
      return { ...videoMeta(vid), unit: vid, n_entries: ss.length, n_videos: 1, vals };
    });
    if (unit === 'drop') {
      const byDrop = {};
      rows.forEach(r => (byDrop[r.drop_id] = byDrop[r.drop_id] || []).push(r));
      rows = Object.entries(byDrop).map(([d, rs]) => {
        const vals = {};
        rs.forEach(r => Object.entries(r.vals).forEach(([k, v]) => { vals[k] = Math.max(vals[k] || 0, v); }));
        return { ...rs[0], unit: d, label: d, video_id: rs.map(r => r.video_id).join(' + '), n_entries: rs.reduce((a, r) => a + r.n_entries, 0), n_videos: rs.length, vals };
      });
    }
    rows.forEach(r => { r.richness = Object.keys(r.vals).length; r.total = round(Object.values(r.vals).reduce((a, b) => a + b, 0)); });
    return { rows, stat, unit };
  }
  const groupOf = (r, by) => by ? (r[by] || '(unknown)') : 'All videos';
  function groupOrder(rows, by) {
    const g = uniq(rows.map(r => groupOf(r, by)));
    if (by === 'habitat') return HABITATS.filter(h => g.includes(h)).concat(g.filter(x => !HABITATS.includes(x)));
    return g.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }
  const colorOf = (g, i, by) => by === 'habitat' && HAB_COL[g] ? HAB_COL[g][0] : PALETTE[i % PALETTE.length];

  function baseLayout(extra) {
    const cs = getComputedStyle(document.body);
    return Object.assign({
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: cs.color, family: cs.fontFamily, size: 13 },
      margin: { l: 60, r: 20, t: 40, b: 60 }, showlegend: false,
      xaxis: { gridcolor: 'rgba(128,128,128,.2)', zerolinecolor: 'rgba(128,128,128,.4)', automargin: true },
      yaxis: { gridcolor: 'rgba(128,128,128,.2)', zerolinecolor: 'rgba(128,128,128,.4)', automargin: true, rangemode: 'tozero' }
    }, extra);
  }
  const PCFG = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d'] };
  function emptyPlot(el, msg) { Plotly.purge(el); el.innerHTML = `<div class="text-body-secondary p-4">${msg}</div>`; }

  function plotPerUnit(el, field, ytitle) {
    if (!window.Plotly) { el.textContent = 'Charts could not load (no internet?).'; return; }
    const by = $('compare_by').value, { rows, unit } = units();
    if (!rows.length) return emptyPlot(el, 'No entries yet. Graphs appear once videos have been submitted.');
    el.innerHTML = '';
    const groups = groupOrder(rows, by);
    const traces = groups.map((g, i) => {
      const rs = rows.filter(r => groupOf(r, by) === g);
      return { type: 'box', name: `${g} (n=${rs.length})`, y: rs.map(r => r[field]), text: rs.map(r => r.label), boxpoints: 'all', jitter: 0.4, pointpos: 0,
        marker: { color: colorOf(g, i, by), size: 8, opacity: .8 }, line: { color: colorOf(g, i, by) }, fillcolor: 'rgba(0,0,0,0)',
        hovertemplate: `%{text}<br>${ytitle}: %{y}<extra>${esc(g)}</extra>` };
    });
    Plotly.react(el, traces, baseLayout({ title: { text: `${ytitle} per ${unit}`, x: 0 }, yaxis: { ...baseLayout().yaxis, title: ytitle } }), PCFG);
  }
  function selectedKeys(rows) {
    const sel = [...$('sp_show').selectedOptions].map(o => o.value);
    const all = uniq(rows.flatMap(r => Object.keys(r.vals)));
    return sel.length ? sel.filter(k => all.includes(k) || true) : all;
  }
  function plotSpecies(el) {
    if (!window.Plotly) return;
    const by = $('compare_by').value, { rows, stat, unit } = units();
    if (!rows.length) return emptyPlot(el, 'No entries yet.');
    el.innerHTML = '';
    const groups = groupOrder(rows, by), keys = selectedKeys(rows);
    if (!keys.length) return emptyPlot(el, 'No species recorded yet.');
    const summ = (rs, k) => { const v = rs.map(r => r.vals[k] || 0); return stat === 'mean' ? { c: mean(v), lo: se(v), hi: se(v) } : { c: median(v), lo: median(v) - quantile(v, .25), hi: quantile(v, .75) - median(v) }; };
    const overall = Object.fromEntries(keys.map(k => [k, summ(rows, k).c + mean(rows.map(r => r.vals[k] || 0)) / 1e6]));
    const order = [...keys].sort((a, b) => overall[a] - overall[b]);
    const traces = groups.map((g, i) => {
      const rs = rows.filter(r => groupOf(r, by) === g);
      const s = order.map(k => summ(rs, k));
      return { type: 'bar', orientation: 'h', name: g, y: order.map(keyLabel), x: s.map(v => round(v.c)),
        error_x: { type: 'data', symmetric: false, array: s.map(v => round(v.hi)), arrayminus: s.map(v => round(v.lo)), color: 'rgba(128,128,128,.8)', thickness: 1.2 },
        marker: { color: colorOf(g, i, by) }, hovertemplate: `%{y}: %{x}<extra>${esc(g)}</extra>` };
    });
    const h = Math.max(480, 110 + order.length * (10 + 12 * groups.length));
    el.style.height = h + 'px';
    Plotly.react(el, traces, baseLayout({ height: h, barmode: 'group', showlegend: groups.length > 1, legend: { orientation: 'h', y: 1.02, yanchor: 'bottom', x: 0 },
      title: { text: `MaxN per ${unit} (${stat === 'mean' ? 'mean ± SE' : 'median, IQR'})`, x: 0, y: .99, yanchor: 'top' },
      margin: { l: 10, r: 20, t: 70, b: 50 }, xaxis: { ...baseLayout().xaxis, title: 'MaxN', rangemode: 'tozero' }, yaxis: { automargin: true } }), PCFG);
  }
  function plotOccurrence(el) {
    if (!window.Plotly) return;
    const by = $('compare_by').value, { rows, unit } = units();
    if (!rows.length) return emptyPlot(el, 'No entries yet.');
    el.innerHTML = '';
    const groups = groupOrder(rows, by), keys = selectedKeys(rows);
    if (!keys.length) return emptyPlot(el, 'No species recorded yet.');
    const occ = (rs, k) => 100 * rs.filter(r => (r.vals[k] || 0) > 0).length / rs.length;
    const order = [...keys].sort((a, b) => occ(rows, a) - occ(rows, b));
    const traces = groups.map((g, i) => {
      const rs = rows.filter(r => groupOf(r, by) === g);
      return { type: 'bar', orientation: 'h', name: `${g} (n=${rs.length})`, y: order.map(keyLabel), x: order.map(k => round(occ(rs, k), 1)),
        marker: { color: colorOf(g, i, by) }, hovertemplate: `%{y}: %{x}% of ${unit}s<extra>${esc(g)}</extra>` };
    });
    const h = Math.max(480, 110 + order.length * (10 + 12 * groups.length));
    el.style.height = h + 'px';
    Plotly.react(el, traces, baseLayout({ height: h, barmode: 'group', showlegend: groups.length > 1, legend: { orientation: 'h', y: 1.02, yanchor: 'bottom', x: 0 },
      title: { text: `% of ${unit}s where each species was seen`, x: 0, y: .99, yanchor: 'top' },
      margin: { l: 10, r: 20, t: 70, b: 50 }, xaxis: { ...baseLayout().xaxis, title: '% occurrence', range: [0, 100] }, yaxis: { automargin: true } }), PCFG);
  }
  function renderWho() {
    const names = uniq(subs.map(s => s.student)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    options($('who'), [['Everyone', 'Everyone'], ...names.map(n => [n, n])], null);
    $('n_submissions').textContent = `${subs.length} submission${subs.length === 1 ? '' : 's'} from ${names.length} group${names.length === 1 ? '' : 's'}` +
      (lastLoaded ? ` · updated ${lastLoaded.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : '');
  }
  function renderSpShow() {
    const sel = new Set([...$('sp_show').selectedOptions].map(o => o.value));
    const seen = uniq(subs.flatMap(s => [...Object.keys(s.counts || {}).map(k => 'g:' + k), ...Object.keys(s.other || {}).map(k => 'o:' + k)]));
    const keys = uniq([...SPECIES.map(s => 'g:' + s.id), ...seen]).filter(k => seen.includes(k) || sel.has(k)).sort((a, b) => keyLabel(a).localeCompare(keyLabel(b)));
    $('sp_show').innerHTML = keys.map(k => `<option value="${esc(k)}" ${sel.has(k) ? 'selected' : ''}>${esc(keyLabel(k))}</option>`).join('');
  }
  function renderDropCoverage() {
    if (document.querySelector('input[name=unit]:checked').value !== 'drop') { $('drop_coverage').innerHTML = ''; return; }
    const done = new Set(subs.map(s => s.video_id));
    const drops = {};
    setup.videos.forEach(v => { const d = v.drop_id || v.video_id; (drops[d] = drops[d] || []).push(v.video_id); });
    const partial = Object.entries(drops).filter(([, vs]) => vs.length > 1 && vs.some(v => done.has(v)) && !vs.every(v => done.has(v)));
    $('drop_coverage').innerHTML = partial.length ? `<div class="alert alert-warning py-1 px-2 mb-0"><strong>Partly watched drops</strong> (MaxN may be low):<br>${partial.map(([d, vs]) => `${esc(d)}: ${vs.filter(v => done.has(v)).length} of ${vs.length} videos`).join('<br>')}</div>` : '';
  }

  // ---------------------------------------------------------------- Data tables
  function entryRows() {
    const out = [];
    subs.forEach(s => {
      const m = videoMeta(s.video_id);
      const base = { updated_at: s.updated_at, student: s.student, video_id: s.video_id, habitat: m.habitat, site: m.site, station: m.station, drop_id: m.drop_id };
      const c = Object.entries(s.counts || {}), o = Object.entries(s.other || {});
      c.forEach(([id, n]) => out.push({ ...base, species: (SP[id] || {}).common || id, scientific: (SP[id] || {}).sci || '', family: (SP[id] || {}).family || '', source: 'guide', maxn: n, notes: s.notes || '' }));
      o.forEach(([k, n]) => out.push({ ...base, species: k, scientific: '', family: '', source: 'other', maxn: n, notes: s.notes || '' }));
      if (!c.length && !o.length) out.push({ ...base, species: '(none seen)', scientific: '', family: '', source: '', maxn: 0, notes: s.notes || '' });
    });
    return out.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
  }
  function unitRows() {
    const { rows, unit } = units();
    const keys = uniq(rows.flatMap(r => Object.keys(r.vals))).sort((a, b) => keyLabel(a).localeCompare(keyLabel(b)));
    return rows.map(r => {
      const o = { [unit]: r.unit, videos: r.video_id, habitat: r.habitat, site: r.site, station: r.station, entries: r.n_entries, richness: r.richness, total_maxn: r.total };
      keys.forEach(k => { o[keyLabel(k)] = round(r.vals[k] || 0); });
      return o;
    });
  }
  const sortState = {};
  function renderTable(elId, rows, filterId = 'table_filter') {
    const el = $(elId);
    if (!rows.length) { el.innerHTML = '<p class="text-body-secondary p-2">No entries yet.</p>'; return; }
    const cols = Object.keys(rows[0]);
    const ss = sortState[elId];
    if (ss) rows = [...rows].sort((a, b) => { const x = a[ss.c], y = b[ss.c]; const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''), undefined, { numeric: true }); return ss.d * r; });
    const q = $(filterId).value.toLowerCase().trim();
    if (q) rows = rows.filter(r => cols.some(c => String(r[c] ?? '').toLowerCase().includes(q)));
    const fmt = (c, v) => c === 'updated_at' && v ? new Date(v).toLocaleString() : v;
    el.innerHTML = `<table class="table table-sm table-striped table-hover mb-0"><thead><tr>${cols.map(c => `<th data-sort="${esc(c)}">${esc(c)}${ss && ss.c === c ? (ss.d > 0 ? ' ▲' : ' ▼') : ''}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr>${cols.map(c => `<td>${esc(fmt(c, r[c]))}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <div class="small text-body-secondary p-1">${rows.length} rows</div>`;
    el.querySelectorAll('th[data-sort]').forEach(th => th.onclick = () => {
      const c = th.dataset.sort; sortState[elId] = { c, d: ss && ss.c === c ? -ss.d : 1 }; renderVisible();
    });
  }
  function csv(rows) {
    if (!rows.length) return '';
    const cols = uniq(rows.flatMap(r => Object.keys(r)));
    const q = v => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    return [cols.map(q).join(','), ...rows.map(r => cols.map(c => q(r[c])).join(','))].join('\r\n');
  }
  function download(name, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // ---------------------------------------------------------------- Live database tab (read-only)
  const seenIds = new Set(); let dbFirst = true;
  function dbTables() {
    const subRows = [...subs].sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at))).map(s => {
      const m = videoMeta(s.video_id);
      return { id: s.id, updated_at: s.updated_at, student: s.student, video_id: s.video_id, habitat: m.habitat, station: m.station, drop: m.drop_id,
        species: Object.entries(s.counts || {}).map(([k, n]) => `${(SP[k] || {}).common || k} ${n}`).join('; '),
        other_species: Object.entries(s.other || {}).map(([k, n]) => `${k} ${n}`).join('; '), notes: s.notes || '' };
    });
    return {
      db_submissions: subRows,
      db_videos: setup.videos.map(v => ({ video_id: v.video_id, station: v.station, habitat: (siteBy[v.station] || {}).habitat || '', drop_id: v.drop_id, label: v.label,
        entries: subs.filter(s => s.video_id === v.video_id).length, url: v.url })),
      db_assignments: setup.assignments.map(a => ({ group_name: a.group_name, pair_name: a.pair_name, video_id: a.video_id, done: subs.some(s => s.video_id === a.video_id) ? 'yes' : '' })),
      db_sites: setup.sites.map(s => ({ station: s.station, habitat: s.habitat, site: s.site, lat: s.lat ?? '', lon: s.lon ?? '', depth_m: s.depth_m ?? '', videos: setup.videos.filter(v => v.station === s.station).length })),
      db_other: others.filter(o => !o.hidden).map(o => ({ name: o.name, times_recorded: subs.filter(s => (s.other || {})[o.name] > 0).length }))
    };
  }
  function renderDb() {
    const t = dbTables();
    $('db_counts').innerHTML = `<strong>${subs.length}</strong> submissions · <strong>${uniq(subs.map(s => s.student)).length}</strong> groups · <strong>${uniq(subs.map(s => s.video_id)).length}</strong> of ${setup.videos.length} videos watched`;
    $('db_status').innerHTML = `<span class="text-success">&#9679;</span> Live · updated ${lastLoaded ? lastLoaded.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '…'}`;
    for (const id of Object.keys(t)) if (visible(id.replace('db_', 'dbp_'))) renderTable(id, t[id], 'db_filter');
    const fresh = subs.filter(s => !seenIds.has(String(s.id)));
    fresh.forEach(s => seenIds.add(String(s.id)));
    if (!dbFirst && fresh.length) {
      const ids = new Set(fresh.map(s => String(s.id)));
      document.querySelectorAll('#db_submissions tbody tr').forEach(tr => { if (ids.has(tr.firstElementChild.textContent)) tr.classList.add('row-new'); });
    }
    dbFirst = false;
  }

  // ---------------------------------------------------------------- render what is on screen
  const visible = id => { const e = $(id); return e && e.classList.contains('active'); };
  function renderVisible() {
    if (visible('t-graphs')) {
      renderDropCoverage();
      if (visible('g-rich')) plotPerUnit($('p_richness'), 'richness', 'Species richness');
      if (visible('g-total')) plotPerUnit($('p_total'), 'total', 'Total MaxN');
      if (visible('g-species')) plotSpecies($('p_species'));
      if (visible('g-occ')) plotOccurrence($('p_occurrence'));
    }
    if (visible('t-data')) {
      if (visible('d-entries')) renderTable('entries_table', entryRows());
      if (visible('d-videos')) renderTable('videos_table', unitRows());
    }
    if (visible('t-db')) renderDb();
  }

  // ---------------------------------------------------------------- wiring
  function wire() {
    document.addEventListener('shown.bs.tab', e => {
      const t = e.target.getAttribute('href');
      if (t === '#t-sites') drawMap();
      renderVisible();
      const nav = $('nav'); if (nav.classList.contains('show') && e.target.closest('#nav')) bootstrap.Collapse.getOrCreateInstance(nav).hide();
    });
    document.addEventListener('click', e => {
      const sh = e.target.closest('[data-show]'); if (sh) { showSpecies(sh.dataset.show); return; }
      const go = e.target.closest('[data-goto-video]'); if (go) { gotoVideo(go.dataset.gotoVideo); return; }
      const rm = e.target.closest('[data-other-remove]'); if (rm) { delete otherCounts[rm.dataset.otherRemove]; renderOtherList(); renderSummary(); renderOtherSugg(); return; }
      const sg = e.target.closest('[data-sugg]'); if (sg) { $('other_name').value = sg.dataset.sugg; $('other_n').focus(); $('other_n').select(); return; }
    });
    pills(document.querySelector('[data-hab-group="guide_hab"]'), 'guide_hab', filterGuide);
    pills(document.querySelector('[data-hab-group="entry_hab"]'), 'entry_hab', filterTiles);
    $('guide_search').addEventListener('input', filterGuide);
    $('entry_search').addEventListener('input', filterTiles);
    $('entry_only').addEventListener('change', filterTiles);
    $('sp_grid').addEventListener('input', e => { if (e.target.classList.contains('sp-n')) { e.target.closest('.sp-tile').classList.toggle('has-count', +e.target.value > 0); renderSummary(); } });
    $('sp_grid').addEventListener('change', e => { if (e.target.classList.contains('sp-n') && (+e.target.value < 0 || isNaN(+e.target.value))) { e.target.value = 0; renderSummary(); } });
    document.addEventListener('wheel', e => { if (e.target.matches && e.target.matches('input[type=number]') && document.activeElement === e.target) e.target.blur(); }, { passive: true });

    $('student').value = store.get('student') || '';
    $('student').addEventListener('change', () => { store.set('student', $('student').value.trim()); renderVideos(); renderSummary(); loadPrevious(); });
    $('pick_hab').addEventListener('change', () => { renderStations(); if ($('pick_hab').value) { setPill('entry_hab', $('pick_hab').value); filterTiles(); } });
    $('pick_station').addEventListener('change', renderVideos);
    $('video').addEventListener('change', () => { onVideoChosen(); renderSummary(); });
    $('other_add').addEventListener('click', addOther);
    $('other_name').addEventListener('input', renderOtherSugg);
    $('other_name').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addOther(); } });
    $('other_n').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addOther(); } });
    $('submit').addEventListener('click', submit);

    $('asg_group').addEventListener('change', () => { store.set('asg_group', $('asg_group').value); renderAsgPairs(); renderAsg(); });
    $('asg_pair').addEventListener('change', renderAsg);

    ['compare_by', 'who', 'sp_show'].forEach(id => $(id).addEventListener('change', renderVisible));
    document.querySelectorAll('input[name=stat], input[name=unit]').forEach(r => r.addEventListener('change', renderVisible));
    $('sp_clear').addEventListener('click', e => { e.preventDefault(); [...$('sp_show').options].forEach(o => o.selected = false); renderVisible(); });
    $('refresh').addEventListener('click', async () => { $('refresh').disabled = true; await refreshAll(true); $('refresh').disabled = false; });
    $('table_filter').addEventListener('input', renderVisible);
    $('db_filter').addEventListener('input', renderVisible);
    $('dl_entries').addEventListener('click', () => download('bruv_entries.csv', csv(entryRows())));
    $('dl_videos').addEventListener('click', () => { const u = document.querySelector('input[name=unit]:checked').value; download(`bruv_per_${u}_maxn.csv`, csv(unitRows())); });
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => { document.documentElement.setAttribute('data-bs-theme', e.matches ? 'dark' : 'light'); renderVisible(); });
  }
  function gotoVideo(vid) {
    const m = videoMeta(vid);
    $('pick_hab').value = m.habitat; renderStations();
    $('pick_station').value = m.station; renderVideos();
    $('video').value = vid; onVideoChosen(); renderSummary();
    bootstrap.Tab.getOrCreateInstance(document.querySelector('a[href="#t-entry"]')).show();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------------------------------------------------------------- start
  async function start() {
    document.title = cfg.title || document.title;
    $('site-title').textContent = cfg.title || 'BRUV Workshop';
    if (cfg.partnerLogo) { $('partner-logo').src = cfg.partnerLogo; $('partner-logo').classList.remove('d-none'); }
    if (DB.mode === 'local') $('mode-banner').classList.remove('d-none');
    renderGuide(); renderTiles(); wire(); renderSummary();
    await refreshAll(true);
    renderSummary();
    // Poll for everyone else's entries; spread clients out so 40 people don't hit the DB in lockstep.
    const every = Math.max(5, +cfg.refreshSeconds || 20) * 1000;
    setTimeout(function tick() {
      if (document.visibilityState === 'visible') refreshAll(false);
      const ms = visible('t-db') ? Math.min(every, 8000) : every;
      setTimeout(tick, ms * (0.85 + Math.random() * 0.3));
    }, every * Math.random());
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshAll(false); });
  }
  start();
})();
