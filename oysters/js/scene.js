/* Return the Shell: tidal-flat cross-section in pencil and watercolour, drawn on a canvas.
   Exposes window.OysterScene = { init(canvas), resize(), draw(state, t), DEF } */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const mix = (a, b, t) => [Math.round(lerp(a[0], b[0], t)), Math.round(lerp(a[1], b[1], t)), Math.round(lerp(a[2], b[2], t))];
  const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  const DEF = { reef: 1, turb: .08, midden: 1, fish: 1, grass: 1, mang: 1, larvae: 0, settle: 0, ret: 0, dredge: 0, kiln: 0, sticks: 0, restore: 0, zoom: 1, fx: .5, fy: .5, dusk: 0 };

  /* ------------------------------------------------------------------ sprites */
  /* Photographs and engravings (public domain / CC0, credited on the page) loaded into canvases.
     Until a file arrives its canvas is an empty 2x2, so the scene simply draws without it. */
  let onReady = null;
  function sprite(name, tint) {
    const c = mk(2, 2), im = new Image();
    im.onload = () => {
      c.width = im.naturalWidth; c.height = im.naturalHeight;
      const g = c.getContext('2d'); g.drawImage(im, 0, 0);
      if (tint) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = tint; g.fillRect(0, 0, c.width, c.height); }
      if (onReady) onReady();
    };
    im.src = (window.OYSTER_BASE || '') + 'assets/' + name + '.png';   // pages in a subfolder set OYSTER_BASE
    return c;
  }

  function makePuff(col) {
    const s = 64, c = mk(s, s), g = c.getContext('2d'), gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, rgb(col, .9)); gr.addColorStop(.5, rgb(col, .35)); gr.addColorStop(1, rgb(col, 0));
    g.fillStyle = gr; g.fillRect(0, 0, s, s); return c;
  }

  const LIVE = ['shell_a3', 'shell_c6', 'shell_c5', 'shell_a1', 'shell_c8', 'shell_a3'];   // rough outer faces, as on a living reef
  const DEAD = ['shell_a0', 'shell_a2', 'shell_c4', 'shell_c9'];                               // bleached, as in a midden
  const INNER = ['shell_a6', 'shell_c7', 'shell_c8', 'shell_c5'];
  let SP = null;
  function buildSprites() {
    SP = {
      live: LIVE.map(n => sprite(n, 'rgba(126,140,96,.2)')), back: LIVE.map(n => sprite(n, 'rgba(84,124,136,.42)')),
      dead: DEAD.map(n => sprite(n, 'rgba(255,249,232,.38)')), inner: INNER.map(n => sprite(n, 'rgba(255,249,232,.3)')),
      trees: [sprite('mangrove1'), sprite('mangrove2')], kiln: sprite('kiln'), fish: sprite('bream'), grass: sprite('eelgrass'), cutter: sprite('cutter'), larva: sprite('larva'),
      silt: makePuff([170, 136, 84]), smoke: makePuff([96, 90, 92]), cloud: makePuff([250, 246, 236])
    };
  }

  /* ------------------------------------------------------------------ content */
  const R = rng(11);
  const reefShells = [];
  for (let i = 0; i < 200; i++) {
    const u = R(), lvl = Math.pow(R(), .8), back = i % 3 === 0;
    reefShells.push({ u, x: .46 + .48 * u, lvl, s: (back ? 1.9 : 2.3) + R() * 1.6, rot: (R() - .5) * 2.6, v: i % 6, back, rank: lvl * .8 + R() * .2, jx: (R() - .5) * 1.2 });
  }
  reefShells.sort((a, b) => (a.back === b.back ? b.lvl - a.lvl : a.back ? -1 : 1));
  const middenShells = [];
  for (let i = 0; i < 60; i++) { const u = R(), lvl = R(); middenShells.push({ u, x: .062 + .09 * u, lvl, s: 1.4 + R() * .9, rot: R() * TAU, v: i % 4, inner: i % 5 === 0, rank: lvl * .85 + R() * .15 }); }
  middenShells.sort((a, b) => b.lvl - a.lvl);
  const fishes = []; for (let i = 0; i < 12; i++) fishes.push({ x: .5 + R() * .45, d: .2 + R() * .55, sp: .12 + R() * .2, ph: R() * 7, range: .05 + R() * .08, s: 2.6 + R() * 2.4, rank: (i + .5) / 12 });
  const school = []; for (let i = 0; i < 34; i++) school.push({ ox: (R() - .5) * .09, oy: (R() - .5) * 6, ph: R() * 7 });
  const larvae = []; for (let i = 0; i < 46; i++) larvae.push({ x: .42 + R() * .52, d: .1 + R() * .65, ph: R() * 7, sp: .2 + R() * .4, r: .25 + R() * .25 });
  const blades = []; for (let i = 0; i < 48; i++) blades.push({ x: .8 + R() * 1.0, h: 5 + R() * 7, ph: R() * 7, tone: i % 3 });
  const silt = []; for (let i = 0; i < 70; i++) silt.push({ x: R() * 1.7, d: R(), ph: R() * 7, r: 4 + R() * 9 });
  const sticks = []; for (let i = 0; i < 26; i++) sticks.push({ x: .24 + .14 * (i / 25) + (R() - .5) * .006, h: 5.5 + R() * 3, lean: (R() - .5) * .22, v: i % 6 });
  const poles = []; for (let i = 0; i < 9; i++) poles.push({ x: .245 + .125 * (i / 8) + (R() - .5) * .008, h: 10 + R() * 3.5, seed: R() * 99 });
  const baskets = [.5, .595, .69, .785, .88].map((x, i) => ({ x, seed: i * 3 + 1 }));
  /* stands of red mangrove, cut from one photograph. v: which stand. drawn back to front. */
  const trees = [
    { x: .158, h: 12, v: 1, flip: false, rank: .66 },
    { x: .285, h: 10.5, v: 1, flip: true, rank: .33 },
    { x: .215, h: 17, v: 0, flip: false, rank: 0 }
  ];
  const hills = []; for (let i = 0; i < 5; i++) hills.push({ f: .6 + R() * 2.2, ph: R() * 7, a: .3 + R() * .7 });
  const dots = []; for (let i = 0; i < 260; i++) dots.push({ x: R() * 1.8, d: R() });
  const glints = []; for (let i = 0; i < 26; i++) glints.push({ x: R() * 1.8, y: R(), w: 1 + R() * 4, ph: R() * 7 });
  const clouds = []; for (let i = 0; i < 7; i++) clouds.push({ x: R() * 1.6, y: .08 + R() * .5, w: 18 + R() * 26, sp: .002 + R() * .004 });
  const bubbles = []; for (let i = 0; i < 16; i++) bubbles.push({ x: .5 + R() * .42, ph: R(), sp: .05 + R() * .06, r: .12 + R() * .2 });
  const birds = []; for (let i = 0; i < 4; i++) birds.push({ x: R(), y: .15 + R() * .4, sp: .008 + R() * .006, ph: R() * 7 });

  /* ------------------------------------------------------------------ geometry */
  let cv, ctx, W = 0, H = 0, SW = 0, surf = 0, DK = 0, U = 1, mobile = false, anchorY = .5;
  function init(canvas) { cv = canvas; ctx = cv.getContext('2d'); buildSprites(); buildPaper(); resize(); }
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), box = cv.parentElement;
    W = box.clientWidth; H = box.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mobile = W < 900;
    SW = mobile ? W : W - Math.min(560, W * .38);
    surf = H * (mobile ? .24 : .44); DK = H * (mobile ? .17 : .34); U = H * (mobile ? .0045 : .01); anchorY = mobile ? .3 : .5;
  }
  function bedY(px) {
    const n = px / SW, f = clamp((n - .12) / .8);
    let y = surf + DK * (-.14 + .2 * smooth(clamp(f / .22)) + .8 * smooth(clamp((f - .3) / .7)));
    if (n < .12) y -= (.12 - n) * DK * .35;
    return y + Math.sin(n * 23) * U * .25 + Math.sin(n * 61) * U * .1;
  }
  const X = n => n * SW;
  const reefProfile = u => (u <= 0 || u >= 1) ? 0 : Math.pow(Math.sin(Math.PI * u), .7);
  const REEF_H = 9.5;
  function img(sp, x, y, r, rot) { const k = 2 * r / Math.max(sp.width, sp.height), w = sp.width * k, h = sp.height * k; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(sp, -w / 2, -h / 2, w, h); ctx.restore(); }

  /* ------------------------------------------------------------------ pencil and wash */
  const PAPER = [246, 241, 228], LEAD = [58, 56, 62];
  let blotch = null, grain = null;
  function buildPaper() {
    // uneven pigment: a tiny noise field, stretched smooth
    const r = rng(5), small = mk(28, 28), g = small.getContext('2d');
    for (let y = 0; y < 28; y++) for (let x = 0; x < 28; x++) { const v = 232 + Math.floor(r() * 24); g.fillStyle = `rgb(${v},${v},${Math.round(v * .985)})`; g.fillRect(x, y, 1, 1); }
    blotch = small;
    // paper tooth
    const t = mk(180, 180), tg = t.getContext('2d'), d = tg.createImageData(180, 180);
    for (let i = 0; i < d.data.length; i += 4) { const v = 238 + Math.floor(r() * 18); d.data[i] = v; d.data[i + 1] = v; d.data[i + 2] = v - 3; d.data[i + 3] = 255; }
    tg.putImageData(d, 0, 0); grain = t;
  }
  const lead = a => rgb(LEAD, a);
  /* stroke the current path the way a pencil would: twice, the second pass slightly off */
  function pencil(a = .55, w = 1) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(.8, U * .14 * w);
    ctx.strokeStyle = lead(a); ctx.stroke();
    ctx.save(); ctx.translate(U * .09, -U * .07); ctx.strokeStyle = lead(a * .45); ctx.stroke(); ctx.restore();
  }
  /* fill the current path as a wash, with pigment pooled at its edge */
  function wash(col, a = 1, pool = .16) {
    ctx.fillStyle = rgb(col, a); ctx.fill();
    if (pool > 0) { ctx.save(); ctx.clip(); ctx.lineWidth = U * 1.6; ctx.strokeStyle = rgb(mix(col, [40, 40, 50], .5), pool * a); ctx.stroke(); ctx.restore(); }
  }

  /* ------------------------------------------------------------------ draw */
  function draw(st, t) {
    ctx.save();
    ctx.fillStyle = rgb(PAPER); ctx.fillRect(0, 0, W, H);
    const z = st.zoom;
    if (z > 1.001) {
      const k = clamp((z - 1) / .5);
      let px = lerp(W / 2, st.fx * SW, k), py = lerp(H * anchorY, surf + (st.fy - .4) / .6 * DK * 1.1, k);
      px = clamp(px, W / 2 / z, W - W / 2 / z);
      py = clamp(py, H * anchorY / z, H - H * (1 - anchorY) / z);
      ctx.translate(W / 2, H * anchorY); ctx.scale(z, z); ctx.translate(-px, -py);
    }
    const sy = surf + Math.sin(t * .25) * U * .4, bh = U * 2.6, top = sy - bh;
    let g;

    /* sky: a graded wash that runs out to bare paper near the horizon */
    const skyTop = mix([146, 196, 216], [164, 140, 156], st.dusk), skyLow = mix(PAPER, [244, 186, 128], st.dusk);
    g = ctx.createLinearGradient(0, top - H * .62, 0, top);
    g.addColorStop(0, rgb(skyTop)); g.addColorStop(.55, rgb(mix(skyTop, skyLow, .62))); g.addColorStop(1, rgb(skyLow));
    ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H + top);
    for (const c of clouds) {                                   // clouds: colour lifted back off the paper
      const x = ((c.x + t * c.sp) % 1.6 - .3) * W, y = top - H * .42 * c.y - U * 6;
      ctx.globalAlpha = lerp(.6, .3, st.dusk);
      ctx.drawImage(SP.cloud, x, y, c.w * U * 2.2, c.w * U * .42);
      ctx.drawImage(SP.cloud, x + c.w * U * .5, y - c.w * U * .08, c.w * U * 1.4, c.w * U * .36);
    }
    ctx.globalAlpha = 1;
    const sunX = X(.5), sunY = top - U * lerp(22, 6, st.dusk);
    ctx.beginPath(); ctx.arc(sunX, sunY, U * 3.1, 0, TAU); wash(mix([250, 226, 150], [240, 150, 90], st.dusk), .85, .12); pencil(.35);
    for (const b of birds) {
      const x = ((b.x + t * b.sp) % 1.2 - .1) * W, y = top - H * .3 * b.y - U * 8, f = Math.sin(t * 5 + b.ph) * U * .5;
      ctx.beginPath(); ctx.moveTo(x - U * 1.1, y - f); ctx.quadraticCurveTo(x - U * .4, y - U * .5, x, y); ctx.quadraticCurveTo(x + U * .4, y - U * .5, x + U * 1.1, y - f); pencil(.6);
    }

    /* far shore, two washes */
    for (let layer = 0; layer < 2; layer++) {
      ctx.beginPath(); ctx.moveTo(-W, top + 1);
      for (let x = -20; x <= W + 20; x += 8) {
        let h = 0; for (const hl of hills) h += Math.sin(x / W * TAU * hl.f * (layer ? 1 : .6) + hl.ph + layer * 2) * hl.a;
        ctx.lineTo(x, top - U * ((layer ? 3.2 : 6) + h * (layer ? 1.2 : 2)));
      }
      ctx.lineTo(W * 2, top + 1); ctx.closePath();
      wash(layer ? mix([138, 172, 144], [140, 120, 112], st.dusk) : mix([182, 208, 210], [204, 170, 158], st.dusk), layer ? .85 : .75, .14);
      pencil(layer ? .4 : .25);
    }

    /* water */
    const wTop = mix([164, 218, 210], [210, 190, 136], st.turb), wLow = mix([84, 158, 172], [150, 126, 82], st.turb);
    ctx.fillStyle = rgb(mix(wTop, PAPER, .45)); ctx.fillRect(-W, top, W * 3, bh + 1);                   // surface, seen from just above
    for (const gl of glints) {
      const x = (X(gl.x) + t * U * 1.5) % (W + 40), y = top + gl.y * bh;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + gl.w * U * 1.6, y + Math.sin(gl.ph) * U * .15); pencil(.22 + .14 * Math.sin(t * 1.2 + gl.ph), .8);
    }
    g = ctx.createLinearGradient(0, sy, 0, sy + DK * 1.1);
    g.addColorStop(0, rgb(wTop)); g.addColorStop(.5, rgb(mix(wTop, wLow, .65))); g.addColorStop(1, rgb(wLow));
    ctx.fillStyle = g; ctx.fillRect(-W, sy, W * 3, H * 3);
    for (let k = 0; k < 9; k++) {                               // loose, broken pencil lines for the body of the water
      const y = sy + U * (2.2 + k * 3.4), drift = t * U * (1.2 + (k % 3) * .5);
      for (let x = -((drift + k * 37) % (U * 34)); x < W + 20; x += U * 34) {
        const len = U * (10 + ((k * 7 + Math.floor(x / (U * 34))) % 5) * 3);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + len / 2, y + Math.sin(k + x) * U * .5, x + len, y); pencil(.13, .8);
      }
    }

    /* bed: sand wash going to umber, pencilled along the cut */
    const bedLine = () => { for (let x = 0; x <= W + 12; x += 5) ctx.lineTo(x, bedY(x)); };
    const bedPath = () => { ctx.beginPath(); ctx.moveTo(-W, H * 3); ctx.lineTo(-W, bedY(0)); bedLine(); ctx.lineTo(W * 2, bedY(W)); ctx.lineTo(W * 2, H * 3); ctx.closePath(); };
    g = ctx.createLinearGradient(0, surf - DK * .22, 0, surf + DK * 1.9);
    g.addColorStop(0, '#ecd9aa'); g.addColorStop(.16, '#dcc594'); g.addColorStop(.36, '#c4b08a'); g.addColorStop(.7, '#b0a388'); g.addColorStop(1, '#a39a86');
    bedPath(); ctx.fillStyle = g; ctx.fill();
    ctx.save(); bedPath(); ctx.clip();
    ctx.beginPath(); ctx.moveTo(-10, bedY(0)); bedLine(); ctx.lineWidth = U * 2.4; ctx.strokeStyle = 'rgba(96,72,40,.2)'; ctx.stroke();         // pooled pigment under the edge
    for (let k = 1; k <= 4; k++) {
      ctx.beginPath(); for (let x = -10; x <= W + 12; x += 10) { const y = bedY(x) + U * (k * 3.4 + Math.sin(x * .011 + k) * 1.2); x < 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      pencil(.2 - k * .03, .8);
    }
    ctx.fillStyle = lead(.3);
    for (const p of dots) { const x = X(p.x); if (x > W + 5) continue; ctx.beginPath(); ctx.arc(x, bedY(x) + U * (.6 + p.d * p.d * 12), Math.max(.6, U * .1), 0, TAU); ctx.fill(); }
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(-10, bedY(0)); bedLine(); pencil(.6, 1.1);

    /* eelgrass */
    if (st.grass > .01) {
      const sp = SP.grass;
      ctx.globalAlpha = st.grass;
      for (const b of blades) {
        const x = X(b.x); if (x > W + 40) continue;
        const h = b.h * U * 1.5 * (.35 + .65 * st.grass), w = h * .62;
        ctx.save(); ctx.translate(x, bedY(x) + U * .4); ctx.transform(1, 0, Math.sin(t * .8 + b.ph + x * .01) * .09, 1, 0, 0); ctx.scale(b.tone % 2 ? 1 : -1, 1);
        ctx.drawImage(sp, -w / 2, -h, w, h); ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    /* reef: a wash of old shell, then shell on shell */
    const rh = n => reefProfile((n - .46) / .48) * REEF_H * U;
    if (st.reef > .01) {
      const k = Math.min(1, st.reef * 1.05);
      ctx.beginPath(); ctx.moveTo(X(.46), bedY(X(.46)) + 2);
      for (let n = .46; n <= .941; n += .008) ctx.lineTo(X(n), bedY(X(n)) - rh(n) * k * .86);
      ctx.lineTo(X(.94), bedY(X(.94)) + 2); ctx.closePath();
      wash([170, 170, 150], 1, .2); pencil(.35);
    }
    for (const s of reefShells) {
      if (s.rank > st.reef) continue;
      const x = X(s.x) + s.jx * U;
      ctx.globalAlpha = clamp((st.reef - s.rank) * 14);
      img((s.back ? SP.back : SP.live)[s.v], x, bedY(x) - s.lvl * rh(s.x) - s.s * U * .2 - (s.back ? U * 1.2 : 0), s.s * U, s.rot);
    }
    ctx.globalAlpha = 1;
    if (st.reef > .3) for (const b of bubbles) {
      const k = (t * b.sp + b.ph) % 1, x = X(b.x) + Math.sin(k * 18 + b.ph * 9) * U * .6, y0 = bedY(X(b.x)) - rh(b.x) * .8, y = lerp(y0, sy, k);
      ctx.beginPath(); ctx.arc(x, y, b.r * U * (1 + k), 0, TAU); ctx.lineWidth = Math.max(.7, U * .1); ctx.strokeStyle = lead(.4 * (1 - k) * st.reef); ctx.stroke();
    }

    /* restoration: shell baskets on the bed */
    if (st.restore > .01) {
      ctx.globalAlpha = st.restore;
      for (const b of baskets) {
        const x = X(b.x), y = bedY(x) + U * .3, w = U * 6.4, h = U * 4;
        ctx.beginPath(); ctx.rect(x - w / 2, y - h, w, h); wash([232, 226, 208], .55, .2);
        for (let i = 0; i < 12; i++) img(SP[i % 3 ? 'dead' : 'inner'][(i + b.seed) % 4], x - w * .38 + (i % 5) * w * .19, y - h * .2 - Math.floor(i / 5) * h * .3, U * 1.15, i * 1.7 + b.seed);
        ctx.beginPath();
        for (let i = 1; i < 8; i++) { ctx.moveTo(x - w / 2 + w * i / 8, y - h); ctx.lineTo(x - w / 2 + w * i / 8 + U * .1, y); }
        for (let i = 1; i < 5; i++) { ctx.moveTo(x - w / 2, y - h * i / 5); ctx.lineTo(x + w / 2, y - h * i / 5 + U * .1); }
        pencil(.4, .8);
        ctx.beginPath(); ctx.rect(x - w / 2, y - h, w, h); pencil(.8, 1.5);
      }
      ctx.globalAlpha = 1;
    }

    /* dredge: the part under water */
    let boatX = 0;
    if (st.dredge > .01) {
      const ph = (t * .03) % 2, u = ph < 1 ? ph : 2 - ph, dir = ph < 1 ? 1 : -1;
      boatX = X(lerp(.62, .93, smooth(u)));
      const bx = boatX - dir * U * 11, by = bedY(bx) - rh(bx / SW) * Math.min(1, st.reef) * .3;
      for (let i = 0; i < 9; i++) { const r = U * (3 + i * 1.5 + Math.sin(t * 2 + i) * .6); ctx.globalAlpha = st.dredge * (.5 - i * .045); ctx.drawImage(SP.silt, bx - dir * i * U * 3 - r, by - r * .8 - i * U * .7, r * 2, r * 2); }
      ctx.globalAlpha = st.dredge;
      for (let i = 0; i < 5; i++) { const k = (t * .9 + i / 5) % 1; img(SP.dead[i % 4], bx - dir * (U * 2 + k * U * 7), by - U * 1 - Math.sin(k * Math.PI) * U * (3 + i), U * .8, k * 9 + i); }
      ctx.beginPath(); ctx.moveTo(boatX - dir * U * 6, sy - bh * .4); ctx.lineTo(bx + dir * U * 2.6, by - U * 2.2); pencil(.75, 1.1);
      ctx.save(); ctx.translate(bx, by); ctx.scale(dir, 1);
      ctx.beginPath(); ctx.moveTo(2.6 * U, -2.6 * U); ctx.lineTo(2.6 * U, 0); ctx.lineTo(-3.4 * U, 0); ctx.quadraticCurveTo(-4.6 * U, -1.6 * U, -2 * U, -2.8 * U); ctx.closePath();
      wash([120, 96, 72], .7, .25); pencil(.85, 1.4);
      ctx.beginPath(); for (let i = -3; i < 3; i++) { ctx.moveTo(i * U, -2.6 * U); ctx.lineTo(i * U - U * .4, 0); } pencil(.5, .8);
      ctx.restore(); ctx.globalAlpha = 1;
    }

    /* fish */
    if (st.fish > .02) {
      const cxn = .7 + Math.sin(t * .11) * .16, cyk = .35 + Math.sin(t * .17) * .12, sdir = Math.cos(t * .11) >= 0 ? 1 : -1;
      ctx.fillStyle = `rgba(78,104,112,${.5 * st.fish})`;
      for (const f of school) {
        const x = X(cxn + f.ox + Math.sin(t * .9 + f.ph) * .006), yb = bedY(x), y = lerp(sy, yb, cyk) + f.oy * U + Math.sin(t * 1.4 + f.ph) * U * .5;
        if (y > yb - U * 2) continue;
        ctx.beginPath(); ctx.ellipse(x, y, U * .9, U * .28, 0, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x - sdir * U * .8, y); ctx.lineTo(x - sdir * U * 1.5, y - U * .35); ctx.lineTo(x - sdir * U * 1.5, y + U * .35); ctx.fill();
      }
    }
    for (const f of fishes) {
      const a = clamp((st.fish - f.rank) * 14 + .5); if (a <= 0) continue;
      const ang = t * f.sp + f.ph, x = X(f.x + Math.sin(ang) * f.range), dir = Math.cos(ang) >= 0 ? 1 : -1, yb = bedY(x);
      if (yb - sy < U * 9) continue;
      const y = lerp(sy + U * 4, yb - U * 4, f.d) + Math.sin(ang * 2.3) * U;
      ctx.globalAlpha = a; ctx.save(); ctx.translate(x, y); ctx.scale(-dir, 1); ctx.rotate(Math.sin(ang * 2.3 + 1) * .06);
      ctx.drawImage(SP.fish, -f.s * U, -f.s * U * .54, f.s * U * 2, f.s * U * 1.08); ctx.restore();
    }
    ctx.globalAlpha = 1;

    /* larvae */
    let hero = null;
    if (st.larvae > .01) {
      ctx.fillStyle = `rgba(196,128,36,${.85 * st.larvae})`;
      for (const l of larvae) {
        const x = X(l.x + Math.sin(t * l.sp + l.ph) * .02), yb = bedY(x), y = lerp(sy + U * 2, yb - U * 2, l.d) + Math.cos(t * l.sp * 1.3 + l.ph) * U * 1.5;
        ctx.beginPath(); ctx.arc(x, y, l.r * U * .7, 0, TAU); ctx.fill();
      }
      const dx = X(.645 + Math.sin(t * .4) * .025), dy = sy + DK * .2 + Math.cos(t * .5) * U * 2;
      const tx = X(.68), ty = bedY(tx) - rh(.68) * Math.min(1, st.reef) - U * .4, e = smooth(st.settle);
      hero = { x: lerp(dx, tx, e), y: lerp(dy, ty, e) };
    }

    /* murk: a muddy wash over the water */
    if (st.turb > .02) {
      ctx.save(); ctx.beginPath(); ctx.rect(-W, sy, W * 3, H * 3); ctx.clip();
      ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(W * 2, sy); ctx.lineTo(W * 2, bedY(W) + 2);
      for (let x = W + 12; x >= 0; x -= 6) ctx.lineTo(x, bedY(x) + 2);
      ctx.closePath(); ctx.fillStyle = `rgba(160,128,70,${st.turb * .5})`; ctx.fill();
      for (const p of silt) {
        const x = (X(p.x) + t * U * 1.2) % (W + 80) - 40, yb = bedY(x); if (yb < sy + U * 3) continue;
        const r = p.r * U; ctx.globalAlpha = st.turb * .3;
        ctx.drawImage(SP.silt, x - r, lerp(sy, yb, p.d) - r + Math.cos(t * .3 + p.ph) * U * 2, r * 2, r * 2);
      }
      ctx.restore(); ctx.globalAlpha = 1;
    }

    /* waterline */
    ctx.beginPath();
    for (let x = X(.2); x <= W + 20; x += 6) { const y = sy + Math.sin(x * .035 + t * 1.3) * U * .22; x === X(.2) ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    pencil(.6, 1.1);

    /* mangroves */
    for (const tr of trees) {
      const a = clamp((st.mang - tr.rank) * 9 + .3); if (a <= 0) continue;
      const sp = SP.trees[tr.v], x = X(tr.x), hh = tr.h * U, ww = hh * sp.width / sp.height;
      const slope = (bedY(x + ww * .35) - bedY(x - ww * .35)) / (ww * .7);          // shear the stand so every root meets the bank
      ctx.globalAlpha = a; ctx.save(); ctx.translate(x, bedY(x) + U * .5 + Math.abs(slope) * ww * .16); ctx.transform(1, slope * .55, 0, 1, 0, 0); ctx.scale(tr.flip ? -1 : 1, 1);
      ctx.drawImage(sp, -ww / 2, -hh, ww, hh); ctx.restore();
    }
    ctx.globalAlpha = 1;
    if (st.mang < .95) for (const tr of trees) {                // stumps where mangroves were cut
      if (tr.rank < st.mang - .05) continue;
      const x = X(tr.x), y = bedY(x);
      ctx.beginPath(); ctx.rect(x - U * .5, y - U * 1.4, U, U * 1.6); wash([150, 118, 86], 1, .25); pencil(.7);
      ctx.beginPath(); ctx.ellipse(x, y - U * 1.4, U * .5, U * .2, 0, 0, TAU); wash([226, 200, 160], 1, 0); pencil(.6);
    }

    /* lime kiln: sketched from a 1919 photograph of a kiln for burning oyster shell */
    if (st.kiln > .01) {
      const sp = SP.kiln, ww = U * 14, hh = ww * sp.height / sp.width, x0 = X(.066) - ww * .5, y0 = bedY(X(.066)) + U * .9 - hh;
      const cxs = x0 + ww * .66, cys = y0 + hh * .12;                                  // top of the kiln stack
      for (let i = 0; i < 14; i++) { const k = (t * .12 + i / 14) % 1, r = U * (2 + k * 9); ctx.globalAlpha = st.kiln * .5 * (1 - k); ctx.drawImage(SP.smoke, cxs + k * U * 12 + Math.sin(i * 2 + t * .4) * U * k * 4 - r, cys - k * U * 30 - r, r * 2, r * 2); }
      ctx.globalAlpha = st.kiln; ctx.drawImage(sp, x0, y0, ww, hh);
      ctx.globalAlpha = 1;
    }

    /* midden: shell in dark soil */
    if (st.midden > .01) {
      const mk2 = Math.pow(st.midden, .6), mh = n => Math.pow(Math.max(0, Math.sin(Math.PI * (n - .06) / .095)), .7) * 5.2 * U * mk2;
      ctx.beginPath(); ctx.moveTo(X(.06), bedY(X(.06)) + 2);
      for (let n = .06; n <= .1555; n += .004) ctx.lineTo(X(n), bedY(X(n)) - mh(n));
      ctx.lineTo(X(.155), bedY(X(.155)) + 2); ctx.closePath();
      wash([156, 128, 98], 1, .25); pencil(.5);
      for (const s of middenShells) {
        if (s.rank > st.midden) continue;
        const x = X(s.x);
        ctx.globalAlpha = clamp((st.midden - s.rank) * 14);
        img((s.inner ? SP.inner : SP.dead)[s.v], x, bedY(x) - s.lvl * mh(s.x) * .96 - s.s * U * .1, s.s * U, s.rot);
      }
      ctx.globalAlpha = 1;
    }

    /* shell going back to the water */
    if (st.ret > .01) {
      for (let i = 0; i < 4; i++) {
        const k = (t * .13 + i / 4) % 1, x0 = X(.13), x1 = X(.29 + i * .05), x = lerp(x0, x1, Math.min(1, k * 1.6)), y0 = bedY(x0) - U * 6;
        let y;
        if (k < .625) { const q = k / .625; y = lerp(y0, sy, q) - Math.sin(q * Math.PI) * U * 10; }
        else { const q = (k - .625) / .375; y = lerp(sy, bedY(x1) - U, q); if (q < .25) { ctx.beginPath(); ctx.ellipse(x1, sy - bh * .3, U * (1 + q * 12), U * (.2 + q * 1.4), 0, 0, TAU); pencil(.5 * (1 - q * 4) * st.ret, .8); } }
        ctx.globalAlpha = st.ret * (k > .92 ? (1 - k) / .08 : 1);
        img(SP[i % 2 ? 'inner' : 'dead'][i], x, y, U * 1.3, k * 9 + i);
      }
      ctx.globalAlpha = 1;
    }

    /* oyster sticks cut from mangrove */
    if (st.sticks > .01) {
      ctx.globalAlpha = st.sticks; ctx.lineCap = 'round';
      for (const s of sticks) {
        const x = X(s.x), y = bedY(x), h = s.h * U, tx = x + s.lean * h;
        ctx.beginPath(); ctx.moveTo(x, y + U); ctx.lineTo(tx, y - h); ctx.lineWidth = Math.max(1.2, U * .55); ctx.strokeStyle = 'rgba(128,98,70,.9)'; ctx.stroke(); pencil(.5, .7);
        for (let i = 1; i <= 4; i++) img(SP.live[(s.v + i) % 6], lerp(x, tx, i * .2) + (i % 2 ? U * .3 : -U * .3), y - h * i * .2, U * .85, s.v + i);
      }
      ctx.globalAlpha = 1;
    }

    /* timber poles carrying shell */
    if (st.restore > .01) {
      ctx.globalAlpha = st.restore; ctx.lineCap = 'round';
      for (const p of poles) {
        const x = X(p.x), y = bedY(x), h = p.h * U, w = Math.max(1.5, U * .8);
        ctx.beginPath(); ctx.rect(x - w / 2, y - h, w, h + U); wash([190, 146, 100], 1, .3); pencil(.6, .8);
        for (let i = 0; i < 9; i++) img(SP[i % 3 ? 'dead' : 'inner'][(i + (p.seed | 0)) % 4], x + Math.sin(p.seed + i * 2.1) * U * 1.1, y - h * .5 - (i - 4) * U * .55, U * 1.05, p.seed + i);
      }
      ctx.globalAlpha = 1;
    }

    /* oyster cutter (sketched from a photograph, Moreton Bay, c. 1894) */
    if (st.dredge > .01) {
      const ph = (t * .03) % 2, dir = ph < 1 ? 1 : -1, sp = SP.cutter, ww = U * 21, hh = ww * sp.height / sp.width, y = sy - bh * .35 + Math.sin(t * 1.3) * U * .25;
      ctx.globalAlpha = st.dredge * .3; ctx.fillStyle = 'rgb(50,84,96)'; ctx.beginPath(); ctx.ellipse(boatX, sy - bh * .25, U * 9, U * .7, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = st.dredge; ctx.save(); ctx.translate(boatX, y); ctx.scale(dir, 1); ctx.rotate(Math.sin(t * 1.1) * .015);
      ctx.drawImage(sp, -ww * .42, -hh * .97, ww, hh); ctx.restore(); ctx.globalAlpha = 1;
    }

    /* magnifier on the larva we follow: W. K. Brooks's 1891 drawing of an oyster larva */
    if (hero) {
      const a = st.larvae, e = smooth(st.settle), r = U * 7, lx = hero.x - U * 12, ly = hero.y + U * 11;
      ctx.globalAlpha = a; ctx.fillStyle = 'rgb(196,128,36)'; ctx.beginPath(); ctx.arc(hero.x, hero.y, U * .45, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(hero.x, hero.y, U * 1.3, 0, TAU); pencil(.8);
      ctx.beginPath(); ctx.moveTo(hero.x - U * .9, hero.y + U * .9); ctx.lineTo(lx + r * .72, ly - r * .7); pencil(.8);
      ctx.fillStyle = '#f6e6c8'; ctx.beginPath(); ctx.arc(lx, ly, r, 0, TAU); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, r - 1, 0, TAU); ctx.clip();
      if (e < .98) { ctx.globalAlpha = a * (1 - e); ctx.drawImage(SP.larva, lx - r * 1.12, ly - r * 1.12, r * 2.24, r * 2.24); }
      if (e > .02) {
        ctx.globalAlpha = a * e; ctx.fillStyle = rgb(wTop); ctx.fillRect(lx - r, ly - r, r * 2, r * 2);
        img(SP.live[0], lx - r * .25, ly + r * .55, r * 1.2, .3); img(SP.live[1], lx + r * .75, ly + r * .5, r * .9, -.6);
        img(SP.inner[0], lx + r * .05, ly - r * .1, r * .36, -.3);
      }
      ctx.restore();
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(lx, ly, r, 0, TAU); pencil(.9, 2);
      ctx.fillStyle = '#23292c'; ctx.font = `600 ${Math.max(11, U * 1.5)}px "Libre Franklin", system-ui, sans-serif`; ctx.textAlign = 'center';
      ctx.fillText(e > .5 ? 'Spat, settled on old shell' : 'Larva (drawn 1891)', lx, ly + r + U * 2.2);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    /* the sheet itself: uneven pigment, then paper tooth */
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(blotch, 0, 0, W, H);
    ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  window.OysterScene = { init, resize, draw, DEF, set onready(f) { onReady = f; } };
})();
