/* Return the Shell: illustrated tidal-flat cross-section, drawn on a canvas.
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
  function blob(g, pts, sc, ox, oy) {
    const n = pts.length; g.beginPath();
    for (let i = 0; i <= n; i++) {
      const p = pts[i % n], q = pts[(i + 1) % n];
      const mx = (p[0] + q[0]) / 2 * sc + ox, my = (p[1] + q[1]) / 2 * sc + oy;
      if (i === 0) g.moveTo(mx, my); else g.quadraticCurveTo(p[0] * sc + ox, p[1] * sc + oy, mx, my);
    }
    g.closePath();
  }
  function makeShell(seed, base, kind) {
    const s = 96, c = mk(s, s), g = c.getContext('2d'), r = rng(seed * 7919 + 13);
    const n = 26, pts = [], p0 = r() * 7, p1 = r() * 7, p2 = r() * 7;
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU;
      let rad = .37 + .06 * Math.cos(a);
      rad *= 1 + .09 * Math.sin(a * 3 + p0) + .05 * Math.sin(a * 7 + p1) + .035 * Math.sin(a * 13 + p2);
      pts.push([Math.cos(a) * rad * s * 1.12, Math.sin(a) * rad * s * .84]);
    }
    g.translate(s / 2, s / 2);
    const lite = mix(base, [255, 255, 250], .45), dark = mix(base, [30, 36, 34], .55);
    const gr = g.createRadialGradient(-s * .14, -s * .1, s * .03, 0, 0, s * .52);
    if (kind === 'inner') { gr.addColorStop(0, '#fbfaf6'); gr.addColorStop(.45, '#e7e2ec'); gr.addColorStop(.8, '#cdd8d6'); gr.addColorStop(1, rgb(mix(base, [90, 90, 90], .4))); }
    else { gr.addColorStop(0, rgb(lite)); gr.addColorStop(.55, rgb(base)); gr.addColorStop(1, rgb(dark)); }
    blob(g, pts, 1, 0, 0); g.fillStyle = gr; g.fill();
    g.save(); blob(g, pts, 1, 0, 0); g.clip();
    if (kind === 'inner') {
      g.fillStyle = 'rgba(96,70,110,.4)'; g.beginPath(); g.ellipse(s * .1, s * .03, s * .09, s * .07, .4, 0, TAU); g.fill();
      const sh = g.createRadialGradient(-s * .1, s * .08, 0, -s * .1, s * .08, s * .3);
      sh.addColorStop(0, 'rgba(255,190,210,.28)'); sh.addColorStop(1, 'rgba(160,220,220,0)');
      g.fillStyle = sh; g.fillRect(-s / 2, -s / 2, s, s);
    } else {
      if (kind === 'live') {
        const ax = (r() - .5) * s * .4, ay = (r() - .5) * s * .3;
        const al = g.createRadialGradient(ax, ay, 0, ax, ay, s * .26);
        al.addColorStop(0, 'rgba(84,122,72,.38)'); al.addColorStop(1, 'rgba(84,122,72,0)');
        g.fillStyle = al; g.fillRect(-s / 2, -s / 2, s, s);
      }
      for (let k = 1; k <= 6; k++) {
        const sc = 1 - k * .135, ox = -k * s * .03;
        blob(g, pts, sc, ox, 0); g.strokeStyle = rgb(dark, .36); g.lineWidth = 1.6; g.stroke();
        blob(g, pts, sc, ox + 1.2, 1.2); g.strokeStyle = rgb(lite, .24); g.lineWidth = 1; g.stroke();
      }
      g.strokeStyle = rgb(dark, .12); g.lineWidth = 1;
      for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + p0; g.beginPath(); g.moveTo(-s * .2, 0); g.lineTo(Math.cos(a) * s * .5, Math.sin(a) * s * .4); g.stroke(); }
      for (let i = 0; i < 46; i++) {
        g.fillStyle = r() > .5 ? rgb(dark, .28) : rgb(lite, .3);
        g.beginPath(); g.arc((r() - .5) * s * .8, (r() - .5) * s * .6, .5 + r() * 1.2, 0, TAU); g.fill();
      }
    }
    g.restore();
    blob(g, pts, 1, 0, 0); g.strokeStyle = rgb(dark, kind === 'inner' ? .5 : .75); g.lineWidth = 2; g.stroke();
    return c;
  }
  function dim(src, col) {
    const c = mk(src.width, src.height), g = c.getContext('2d');
    g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height);
    return c;
  }
  function makeTree(seed) {
    const w = 260, h = 320, c = mk(w, h), g = c.getContext('2d'), r = rng(seed * 331 + 5);
    const bx = w / 2, by = h - 30, lean = (r() - .5) * 40;
    g.lineCap = 'round';
    // prop roots
    for (let i = 0; i < 13; i++) {
      const side = i % 2 ? 1 : -1, reach = 14 + r() * 82, sy = by - 46 - r() * 62;
      g.strokeStyle = i % 3 ? '#3b3027' : '#4b3d31'; g.lineWidth = 2.5 + r() * 3;
      g.beginPath(); g.moveTo(bx + lean * .1, sy); g.quadraticCurveTo(bx + side * reach * .9, sy - 8 + r() * 14, bx + side * reach, by + 24); g.stroke();
    }
    // trunk + branches
    g.strokeStyle = '#3f3329'; g.lineWidth = 9;
    g.beginPath(); g.moveTo(bx, by - 40); g.quadraticCurveTo(bx + lean * .2, by - 120, bx + lean, by - 180); g.stroke();
    const tops = [];
    for (let i = 0; i < 5; i++) {
      const tx = bx + lean + (i - 2) * 30 + (r() - .5) * 16, ty = by - 205 - r() * 46;
      g.lineWidth = 4; g.beginPath(); g.moveTo(bx + lean * .7, by - 150); g.quadraticCurveTo(bx + lean + (i - 2) * 12, by - 185, tx, ty); g.stroke();
      tops.push([tx, ty]);
    }
    tops.push([bx + lean, by - 190], [bx + lean - 42, by - 178], [bx + lean + 44, by - 180]);
    // leaves
    const tones = ['#24503a', '#2f6a49', '#3c8256', '#5b9c62', '#7fb46c'];
    for (let pass = 0; pass < 3; pass++) {
      for (const [cx, cy] of tops) {
        for (let i = 0; i < 46; i++) {
          const a = r() * TAU, d = Math.sqrt(r()) * 34, lx = cx + Math.cos(a) * d * 1.25, ly = cy + Math.sin(a) * d * .8 - pass * 5;
          const tone = clamp(Math.floor(pass + (cy + 20 - ly) / 22 + r() * 1.2), 0, 4);
          g.fillStyle = tones[tone];
          g.save(); g.translate(lx, ly); g.rotate(r() * TAU); g.beginPath(); g.ellipse(0, 0, 5.2, 2.3, 0, 0, TAU); g.fill(); g.restore();
        }
      }
    }
    return { c, ox: bx, oy: by };
  }
  function makeFish() {
    const w = 140, h = 70, c = mk(w, h), g = c.getContext('2d');
    g.translate(w / 2, h / 2);
    const gr = g.createLinearGradient(0, -22, 0, 22);
    gr.addColorStop(0, '#5f7672'); gr.addColorStop(.45, '#c5d4cf'); gr.addColorStop(1, '#f1f5f0');
    g.fillStyle = '#7d918b';
    g.beginPath(); g.moveTo(-34, 0); g.lineTo(-62, -20); g.quadraticCurveTo(-52, 0, -62, 20); g.closePath(); g.fill();           // tail
    g.beginPath(); g.moveTo(-18, -17); g.quadraticCurveTo(4, -34, 26, -14); g.closePath(); g.fill();                              // dorsal
    g.beginPath(); g.moveTo(-6, 16); g.quadraticCurveTo(2, 28, 12, 16); g.closePath(); g.fill();                                  // anal
    g.fillStyle = gr; g.beginPath(); g.moveTo(52, 2); g.quadraticCurveTo(30, -26, -6, -21); g.quadraticCurveTo(-30, -14, -40, 0);
    g.quadraticCurveTo(-28, 16, -4, 21); g.quadraticCurveTo(32, 22, 52, 2); g.fill();
    g.strokeStyle = 'rgba(40,60,58,.22)'; g.lineWidth = 1;
    for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(-24 + i * 11, 0, 15, -.9, .9); g.stroke(); }
    g.fillStyle = '#12201f'; g.beginPath(); g.arc(36, -5, 3.4, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(37, -6, 1.1, 0, TAU); g.fill();
    return c;
  }
  function makePuff(col) {
    const s = 64, c = mk(s, s), g = c.getContext('2d'), gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, rgb(col, .9)); gr.addColorStop(.5, rgb(col, .35)); gr.addColorStop(1, rgb(col, 0));
    g.fillStyle = gr; g.fillRect(0, 0, s, s); return c;
  }

  const LIVE_P = [[172, 172, 152], [142, 150, 140], [190, 182, 164], [152, 144, 156], [124, 132, 124], [160, 166, 170]];
  const DEAD_P = [[236, 232, 218], [222, 216, 198], [244, 241, 230], [212, 205, 186]];
  let SP = null;
  function buildSprites() {
    SP = { live: [], back: [], dead: [], inner: [], trees: [], fish: makeFish(), silt: makePuff([196, 170, 118]), smoke: makePuff([58, 52, 52]), glow: makePuff([255, 240, 190]), cloud: makePuff([255, 250, 240]) };
    LIVE_P.forEach((p, i) => { const s = makeShell(i + 1, p, 'live'); SP.live.push(s); SP.back.push(dim(s, 'rgba(14,40,50,.5)')); });
    DEAD_P.forEach((p, i) => { SP.dead.push(makeShell(i + 20, p, 'dead')); SP.inner.push(makeShell(i + 40, p, 'inner')); });
    for (let i = 0; i < 3; i++) SP.trees.push(makeTree(i + 1));
  }

  /* ------------------------------------------------------------------ content */
  const R = rng(11);
  const reefShells = [];
  for (let i = 0; i < 330; i++) {
    const u = R(), lvl = Math.pow(R(), .8), back = i % 3 === 0;
    reefShells.push({ u, x: .46 + .48 * u, lvl, s: (back ? 1.5 : 1.9) + R() * 1.7, rot: (R() - .5) * 2.6, v: i % 6, back, rank: lvl * .8 + R() * .2, jx: (R() - .5) * 1.2 });
  }
  reefShells.sort((a, b) => (a.back === b.back ? b.lvl - a.lvl : a.back ? -1 : 1));
  const middenShells = [];
  for (let i = 0; i < 190; i++) { const u = R(), lvl = R(); middenShells.push({ u, x: .07 + .085 * u, lvl, s: .9 + R() * .9, rot: R() * TAU, v: i % 4, inner: i % 5 === 0, rank: lvl * .85 + R() * .15 }); }
  middenShells.sort((a, b) => b.lvl - a.lvl);
  const fishes = []; for (let i = 0; i < 12; i++) fishes.push({ x: .5 + R() * .45, d: .2 + R() * .55, sp: .12 + R() * .2, ph: R() * 7, range: .05 + R() * .08, s: 2.6 + R() * 2.4, rank: (i + .5) / 12 });
  const school = []; for (let i = 0; i < 34; i++) school.push({ ox: (R() - .5) * .09, oy: (R() - .5) * 6, ph: R() * 7 });
  const larvae = []; for (let i = 0; i < 46; i++) larvae.push({ x: .42 + R() * .52, d: .1 + R() * .65, ph: R() * 7, sp: .2 + R() * .4, r: .25 + R() * .25 });
  const blades = []; for (let i = 0; i < 150; i++) blades.push({ x: .8 + R() * 1.0, h: 3.5 + R() * 6, ph: R() * 7, tone: i % 3 });
  const silt = []; for (let i = 0; i < 70; i++) silt.push({ x: R() * 1.7, d: R(), ph: R() * 7, r: 4 + R() * 9 });
  const grit = []; for (let i = 0; i < 420; i++) grit.push({ x: R() * 1.8, d: R(), r: .15 + R() * .4, light: R() > .55 });
  const sticks = []; for (let i = 0; i < 26; i++) sticks.push({ x: .24 + .14 * (i / 25) + (R() - .5) * .006, h: 5.5 + R() * 3, lean: (R() - .5) * .22, v: i % 6 });
  const poles = []; for (let i = 0; i < 9; i++) poles.push({ x: .245 + .125 * (i / 8) + (R() - .5) * .008, h: 10 + R() * 3.5, seed: R() * 99 });
  const baskets = [.5, .595, .69, .785, .88].map((x, i) => ({ x, seed: i * 3 + 1 }));
  const trees = []; for (let i = 0; i < 8; i++) trees.push({ x: .152 + .0125 * i + (R() - .5) * .005, h: 15 + R() * 8, v: i % 3, flip: R() > .5, rank: [0, 4, 2, 6, 1, 5, 3, 7][i] / 8 });
  const hills = []; for (let i = 0; i < 5; i++) hills.push({ f: .6 + R() * 2.2, ph: R() * 7, a: .3 + R() * .7 });
  const glints = []; for (let i = 0; i < 60; i++) glints.push({ x: R() * 1.8, y: R(), w: 1 + R() * 4, ph: R() * 7 });
  const clouds = []; for (let i = 0; i < 7; i++) clouds.push({ x: R() * 1.6, y: .08 + R() * .5, w: 18 + R() * 26, sp: .002 + R() * .004 });
  const bubbles = []; for (let i = 0; i < 16; i++) bubbles.push({ x: .5 + R() * .42, ph: R(), sp: .05 + R() * .06, r: .12 + R() * .2 });
  const birds = []; for (let i = 0; i < 4; i++) birds.push({ x: R(), y: .15 + R() * .4, sp: .008 + R() * .006, ph: R() * 7 });

  /* ------------------------------------------------------------------ geometry */
  let cv, ctx, W = 0, H = 0, SW = 0, surf = 0, DK = 0, U = 1, mobile = false, anchorY = .5;
  function init(canvas) { cv = canvas; ctx = cv.getContext('2d'); buildSprites(); resize(); }
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
  function img(sp, x, y, r, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(sp, -r, -r, r * 2, r * 2); ctx.restore(); }

  /* ------------------------------------------------------------------ draw */
  function draw(st, t) {
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    const z = st.zoom;
    if (z > 1.001) {
      const k = clamp((z - 1) / .5);
      let px = lerp(W / 2, st.fx * SW, k), py = lerp(H * anchorY, surf + (st.fy - .4) / .6 * DK * 1.1, k);
      px = clamp(px, W / 2 / z, W - W / 2 / z);
      py = clamp(py, H * anchorY / z, H - H * (1 - anchorY) / z);
      ctx.translate(W / 2, H * anchorY); ctx.scale(z, z); ctx.translate(-px, -py);
    }
    const sy = surf + Math.sin(t * .25) * U * .4, bh = U * 2.6, top = sy - bh;
    const clear = 1 - st.turb;

    /* sky */
    const skyTop = mix([24, 62, 84], [44, 36, 46], st.dusk), skyMid = mix([92, 152, 160], [150, 96, 84], st.dusk), skyLow = mix([226, 224, 190], [236, 168, 110], st.dusk);
    let g = ctx.createLinearGradient(0, top - H * .6, 0, top);
    g.addColorStop(0, rgb(skyTop)); g.addColorStop(.62, rgb(skyMid)); g.addColorStop(1, rgb(skyLow));
    ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H + top);
    // sun
    const sunX = X(.5), sunY = top - U * lerp(22, 5, st.dusk);
    g = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, U * 34);
    g.addColorStop(0, rgb(mix([255, 250, 225], [255, 190, 120], st.dusk), .85)); g.addColorStop(.12, rgb(mix([255, 244, 205], [255, 160, 96], st.dusk), .4)); g.addColorStop(1, 'rgba(255,220,160,0)');
    ctx.fillStyle = g; ctx.fillRect(sunX - U * 34, sunY - U * 34, U * 68, U * 68);
    // clouds
    for (const c of clouds) {
      const x = ((c.x + t * c.sp) % 1.6 - .3) * W, y = top - H * .42 * c.y - U * 6;
      ctx.globalAlpha = lerp(.34, .2, st.dusk);
      ctx.drawImage(SP.cloud, x, y, c.w * U * 2.2, c.w * U * .42);
      ctx.drawImage(SP.cloud, x + c.w * U * .5, y - c.w * U * .08, c.w * U * 1.4, c.w * U * .36);
    }
    ctx.globalAlpha = 1;
    // birds
    ctx.strokeStyle = 'rgba(20,34,40,.55)'; ctx.lineWidth = Math.max(1, U * .16); ctx.lineCap = 'round';
    for (const b of birds) {
      const x = ((b.x + t * b.sp) % 1.2 - .1) * W, y = top - H * .3 * b.y - U * 8, f = Math.sin(t * 5 + b.ph) * U * .5;
      ctx.beginPath(); ctx.moveTo(x - U * 1.1, y - f); ctx.quadraticCurveTo(x - U * .4, y - U * .5, x, y); ctx.quadraticCurveTo(x + U * .4, y - U * .5, x + U * 1.1, y - f); ctx.stroke();
    }

    /* far dunes, two layers */
    for (let layer = 0; layer < 2; layer++) {
      ctx.beginPath(); ctx.moveTo(-W, top);
      for (let x = -20; x <= W + 20; x += 8) {
        let h = 0; for (const hl of hills) h += Math.sin(x / W * TAU * hl.f * (layer ? 1 : .6) + hl.ph + layer * 2) * hl.a;
        ctx.lineTo(x, top - U * ((layer ? 3.2 : 6) + h * (layer ? 1.2 : 2)));
      }
      ctx.lineTo(W * 2, top); ctx.closePath();
      ctx.fillStyle = layer ? rgb(mix([46, 92, 84], [70, 60, 60], st.dusk)) : rgb(mix([96, 146, 148], [150, 110, 100], st.dusk));
      ctx.fill();
    }

    /* water surface, seen from just above */
    const wTop = mix([70, 168, 160], [136, 124, 82], st.turb), wLow = mix([10, 52, 70], [56, 50, 34], st.turb);
    g = ctx.createLinearGradient(0, top, 0, sy);
    g.addColorStop(0, rgb(mix(skyLow, wTop, .35))); g.addColorStop(1, rgb(mix(wTop, [255, 255, 255], .12)));
    ctx.fillStyle = g; ctx.fillRect(-W, top, W * 3, bh + 1);
    ctx.fillStyle = rgb(mix([46, 92, 84], [70, 60, 60], st.dusk), .28); ctx.fillRect(-W, top, W * 3, bh * .35);
    for (const gl of glints) {
      const x = X(gl.x) % (W + 40), a = Math.max(0, Math.sin(t * 1.6 + gl.ph));
      ctx.fillStyle = `rgba(255,255,245,${a * .55})`; ctx.fillRect(x, top + gl.y * bh, gl.w * U, Math.max(1, U * .14));
    }
    // sun path on the surface
    g = ctx.createLinearGradient(sunX - U * 14, 0, sunX + U * 14, 0);
    g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(.5, `rgba(255,240,200,${lerp(.35, .5, st.dusk)})`); g.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = g; ctx.fillRect(sunX - U * 14, top, U * 28, bh);

    /* water, cut face */
    g = ctx.createLinearGradient(0, sy, 0, sy + DK * 1.25);
    g.addColorStop(0, rgb(wTop)); g.addColorStop(.35, rgb(mix(wTop, wLow, .6))); g.addColorStop(1, rgb(wLow));
    ctx.fillStyle = g; ctx.fillRect(-W, sy, W * 3, H * 3);
    // god rays
    if (clear > .05) {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i++) {
        const x0 = X(.24 + i * .13) + Math.sin(t * .17 + i * 1.7) * U * 3, w = U * (3 + (i % 3) * 2.2), a = .11 * clear * (.6 + .4 * Math.sin(t * .5 + i));
        g = ctx.createLinearGradient(0, sy, 0, sy + DK * 1.05);
        g.addColorStop(0, `rgba(190,255,235,${a})`); g.addColorStop(1, 'rgba(190,255,235,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, sy); ctx.lineTo(x0 + w, sy); ctx.lineTo(x0 + w * 2.2 - U * 16, sy + DK * 1.05); ctx.lineTo(x0 - U * 16 - w, sy + DK * 1.05); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    /* bed: cut earth with strata and grit */
    const bedPath = () => { ctx.beginPath(); ctx.moveTo(-W, H * 3); ctx.lineTo(-W, bedY(0)); for (let x = 0; x <= W + 12; x += 5) ctx.lineTo(x, bedY(x)); ctx.lineTo(W * 2, bedY(W)); ctx.lineTo(W * 2, H * 3); ctx.closePath(); };
    g = ctx.createLinearGradient(0, surf - DK * .22, 0, surf + DK * 1.7);
    g.addColorStop(0, '#c2ae84'); g.addColorStop(.13, '#978a6a'); g.addColorStop(.26, '#5f5f4e'); g.addColorStop(.6, '#3a403c'); g.addColorStop(1, '#1b2424');
    bedPath(); ctx.fillStyle = g; ctx.fill();
    ctx.save(); bedPath(); ctx.clip();
    for (let k = 1; k <= 4; k++) {
      ctx.beginPath(); for (let x = -10; x <= W + 12; x += 10) { const y = bedY(x) + U * (k * 3.2 + Math.sin(x * .011 + k) * 1.2); x < 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.strokeStyle = `rgba(0,0,0,${.14 - k * .02})`; ctx.lineWidth = U * (.5 + k * .25); ctx.stroke();
    }
    for (const p of grit) {
      const x = X(p.x); if (x > W + 5) continue;
      ctx.fillStyle = p.light ? 'rgba(232,224,200,.26)' : 'rgba(10,14,14,.3)';
      ctx.beginPath(); ctx.arc(x, bedY(x) + U * (.4 + p.d * p.d * 16), p.r * U, 0, TAU); ctx.fill();
    }
    ctx.restore();
    // lit edge of the bed
    ctx.beginPath(); for (let x = 0; x <= W + 12; x += 5) x ? ctx.lineTo(x, bedY(x)) : ctx.moveTo(x, bedY(x));
    ctx.strokeStyle = 'rgba(255,244,214,.22)'; ctx.lineWidth = Math.max(1, U * .22); ctx.stroke();
    // caustics
    if (clear > .1) {
      ctx.globalCompositeOperation = 'lighter';
      for (let x = X(.2); x <= W; x += 6) {
        const yb = bedY(x); if (yb < sy + U * 2) continue;
        const b = Math.pow(Math.max(0, Math.sin(x * .045 + t * .9) * Math.sin(x * .019 - t * .6 + 2)), 2);
        if (b < .02) continue;
        ctx.fillStyle = `rgba(200,255,230,${b * .3 * clear})`; ctx.fillRect(x, yb - U * .2, 6, U * 1.1);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    /* seagrass */
    if (st.grass > .01) {
      const tones = ['#3f8a58', '#58a468', '#2e6e4a'];
      ctx.lineCap = 'round';
      for (const b of blades) {
        const x = X(b.x); if (x > W + 20) continue;
        const y0 = bedY(x), sway = Math.sin(t * .8 + b.ph + x * .01) * U * 1.6, h = b.h * U * (.35 + .65 * st.grass);
        ctx.globalAlpha = st.grass; ctx.strokeStyle = tones[b.tone]; ctx.lineWidth = Math.max(1, U * .42);
        ctx.beginPath(); ctx.moveTo(x, y0 + 1); ctx.quadraticCurveTo(x + sway * .2, y0 - h * .6, x + sway, y0 - h); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    /* reef: rubble base, then shell on shell */
    const rh = n => reefProfile((n - .46) / .48) * REEF_H * U;
    if (st.reef > .01) {
      const k = Math.min(1, st.reef * 1.05);
      ctx.beginPath(); ctx.moveTo(X(.46), bedY(X(.46)) + 2);
      for (let n = .46; n <= .941; n += .008) ctx.lineTo(X(n), bedY(X(n)) - rh(n) * k * .86);
      ctx.lineTo(X(.94), bedY(X(.94)) + 2); ctx.closePath();
      g = ctx.createLinearGradient(0, sy, 0, sy + DK); g.addColorStop(0, '#6b6f64'); g.addColorStop(1, '#2f3531');
      ctx.fillStyle = g; ctx.fill();
    }
    for (const s of reefShells) {
      if (s.rank > st.reef) continue;
      const x = X(s.x) + s.jx * U;
      ctx.globalAlpha = clamp((st.reef - s.rank) * 14);
      img((s.back ? SP.back : SP.live)[s.v], x, bedY(x) - s.lvl * rh(s.x) - s.s * U * .2 - (s.back ? U * 1.2 : 0), s.s * U, s.rot);
    }
    ctx.globalAlpha = 1;
    // breathing bubbles
    if (st.reef > .3) for (const b of bubbles) {
      const k = (t * b.sp + b.ph) % 1, x = X(b.x) + Math.sin(k * 18 + b.ph * 9) * U * .6, y0 = bedY(X(b.x)) - rh(b.x) * .8, y = lerp(y0, sy, k);
      ctx.strokeStyle = `rgba(230,255,250,${.5 * (1 - k) * st.reef})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, b.r * U * (1 + k), 0, TAU); ctx.stroke();
    }

    /* restoration: shell baskets on the bed */
    if (st.restore > .01) {
      ctx.globalAlpha = st.restore;
      for (const b of baskets) {
        const x = X(b.x), y = bedY(x) + U * .3, w = U * 6.4, h = U * 4;
        ctx.fillStyle = 'rgba(20,28,28,.35)'; ctx.fillRect(x - w / 2, y - h, w, h);
        for (let i = 0; i < 12; i++) img(SP[i % 3 ? 'dead' : 'inner'][(i + b.seed) % 4], x - w * .38 + (i % 5) * w * .19, y - h * .2 - Math.floor(i / 5) * h * .3, U * 1.15, i * 1.7 + b.seed);
        ctx.strokeStyle = 'rgba(208,220,216,.75)'; ctx.lineWidth = Math.max(1, U * .14);
        ctx.beginPath();
        for (let i = 0; i <= 8; i++) { ctx.moveTo(x - w / 2 + w * i / 8, y - h); ctx.lineTo(x - w / 2 + w * i / 8, y); }
        for (let i = 0; i <= 5; i++) { ctx.moveTo(x - w / 2, y - h * i / 5); ctx.lineTo(x + w / 2, y - h * i / 5); }
        ctx.stroke();
        ctx.strokeStyle = '#dfe8e4'; ctx.lineWidth = Math.max(1.2, U * .3); ctx.strokeRect(x - w / 2, y - h, w, h);
      }
      ctx.globalAlpha = 1;
    }

    /* dredge: the part under water */
    let boatX = 0;
    if (st.dredge > .01) {
      const ph = (t * .03) % 2, u = ph < 1 ? ph : 2 - ph, dir = ph < 1 ? 1 : -1;
      boatX = X(lerp(.62, .93, smooth(u)));
      const bx = boatX - dir * U * 11, by = bedY(bx) - rh(bx / SW) * Math.min(1, st.reef) * .3;
      ctx.globalAlpha = st.dredge;
      for (let i = 0; i < 9; i++) { const r = U * (3 + i * 1.5 + Math.sin(t * 2 + i) * .6); ctx.globalAlpha = st.dredge * (.5 - i * .045); ctx.drawImage(SP.silt, bx - dir * i * U * 3 - r, by - r * .8 - i * U * .7, r * 2, r * 2); }
      ctx.globalAlpha = st.dredge;
      for (let i = 0; i < 5; i++) { const k = (t * .9 + i / 5) % 1; img(SP.dead[i % 4], bx - dir * (U * 2 + k * U * 7), by - U * 1 - Math.sin(k * Math.PI) * U * (3 + i), U * .8, k * 9 + i); }
      ctx.strokeStyle = '#1e1a17'; ctx.lineWidth = Math.max(1, U * .22);
      ctx.beginPath(); ctx.moveTo(boatX - dir * U * 6, sy - bh * .4); ctx.lineTo(bx + dir * U * 2.6, by - U * 2.2); ctx.stroke();
      ctx.save(); ctx.translate(bx, by); ctx.scale(dir, 1);
      ctx.fillStyle = 'rgba(30,26,22,.5)'; ctx.beginPath(); ctx.moveTo(2.6 * U, -2.6 * U); ctx.lineTo(2.6 * U, 0); ctx.lineTo(-3.4 * U, 0); ctx.quadraticCurveTo(-4.6 * U, -1.6 * U, -2 * U, -2.8 * U); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#2a2420'; ctx.lineWidth = Math.max(1.2, U * .34); ctx.stroke();
      ctx.lineWidth = Math.max(1, U * .12); ctx.beginPath(); for (let i = -3; i < 3; i++) { ctx.moveTo(i * U, -2.6 * U); ctx.lineTo(i * U - U * .4, 0); } ctx.stroke();
      ctx.restore(); ctx.globalAlpha = 1;
    }

    /* fish */
    if (st.fish > .02) {
      const cxn = .7 + Math.sin(t * .11) * .16, cyk = .35 + Math.sin(t * .17) * .12, sdir = Math.cos(t * .11) >= 0 ? 1 : -1;
      ctx.fillStyle = `rgba(214,232,228,${.8 * st.fish})`;
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
      ctx.globalAlpha = a; ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); ctx.rotate(Math.sin(ang * 2.3 + 1) * .08);
      ctx.drawImage(SP.fish, -f.s * U, -f.s * U * .5, f.s * U * 2, f.s * U); ctx.restore();
    }
    ctx.globalAlpha = 1;

    /* larvae */
    let hero = null;
    if (st.larvae > .01) {
      ctx.globalCompositeOperation = 'lighter';
      for (const l of larvae) {
        const x = X(l.x + Math.sin(t * l.sp + l.ph) * .02), yb = bedY(x), y = lerp(sy + U * 2, yb - U * 2, l.d) + Math.cos(t * l.sp * 1.3 + l.ph) * U * 1.5, r = l.r * U * 3;
        ctx.globalAlpha = .8 * st.larvae; ctx.drawImage(SP.glow, x - r, y - r, r * 2, r * 2);
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      const dx = X(.645 + Math.sin(t * .4) * .025), dy = sy + DK * .2 + Math.cos(t * .5) * U * 2;
      const tx = X(.68), ty = bedY(tx) - rh(.68) * Math.min(1, st.reef) - U * .4, e = smooth(st.settle);
      hero = { x: lerp(dx, tx, e), y: lerp(dy, ty, e) };
    }

    /* murk */
    if (st.turb > .02) {
      ctx.save(); ctx.beginPath(); ctx.rect(-W, sy, W * 3, H * 3); ctx.clip();
      ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(W * 2, sy); ctx.lineTo(W * 2, bedY(W) + 2);
      for (let x = W + 12; x >= 0; x -= 6) ctx.lineTo(x, bedY(x) + 2);
      ctx.closePath(); ctx.fillStyle = `rgba(122,104,62,${st.turb * .62})`; ctx.fill();
      for (const p of silt) {
        const x = (X(p.x) + t * U * 1.2) % (W + 80) - 40, yb = bedY(x); if (yb < sy + U * 3) continue;
        const r = p.r * U; ctx.globalAlpha = st.turb * .22;
        ctx.drawImage(SP.silt, x - r, lerp(sy, yb, p.d) - r + Math.cos(t * .3 + p.ph) * U * 2, r * 2, r * 2);
      }
      ctx.restore(); ctx.globalAlpha = 1;
    }
    // depth fog toward the right-hand deep
    g = ctx.createLinearGradient(X(.7), 0, W + U * 20, 0);
    g.addColorStop(0, rgb(wLow, 0)); g.addColorStop(1, rgb(wLow, .45));
    ctx.save(); ctx.beginPath(); ctx.rect(-W, sy, W * 3, H * 3); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(X(.7), sy, W * 2, H * 2); ctx.restore();

    /* waterline */
    ctx.beginPath();
    for (let x = X(.2); x <= W + 20; x += 6) { const y = sy + Math.sin(x * .035 + t * 1.3) * U * .22; x === X(.2) ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.strokeStyle = 'rgba(240,255,250,.6)'; ctx.lineWidth = Math.max(1, U * .2); ctx.stroke();

    /* mangroves */
    for (const tr of trees) {
      const a = clamp((st.mang - tr.rank) * 9 + .3); if (a <= 0) continue;
      const x = X(tr.x), y = bedY(x), sp = SP.trees[tr.v], sc = tr.h * U / 220;
      ctx.globalAlpha = a; ctx.save(); ctx.translate(x, y); ctx.scale(tr.flip ? -sc : sc, sc); ctx.drawImage(sp.c, -sp.ox, -sp.oy); ctx.restore();
    }
    ctx.globalAlpha = 1;
    // stumps where mangroves were cut
    if (st.mang < .95) for (const tr of trees) {
      if (tr.rank < st.mang - .05) continue;
      const x = X(tr.x), y = bedY(x);
      ctx.fillStyle = '#4a3b2e'; ctx.fillRect(x - U * .5, y - U * 1.4, U, U * 1.6);
      ctx.fillStyle = '#b89a72'; ctx.beginPath(); ctx.ellipse(x, y - U * 1.4, U * .5, U * .2, 0, 0, TAU); ctx.fill();
    }

    /* lime kiln */
    if (st.kiln > .01) {
      const x = X(.04), y = bedY(x) + U * .6;
      ctx.globalAlpha = st.kiln;
      for (let i = 0; i < 14; i++) { const k = (t * .12 + i / 14) % 1, r = U * (2 + k * 9); ctx.globalAlpha = st.kiln * .55 * (1 - k); ctx.drawImage(SP.smoke, x + k * U * 12 + Math.sin(i * 2 + t * .4) * U * k * 4 - r, y - U * 10 - k * U * 34 - r, r * 2, r * 2); }
      ctx.globalAlpha = st.kiln;
      g = ctx.createLinearGradient(x - U * 4, 0, x + U * 4, 0); g.addColorStop(0, '#8a8177'); g.addColorStop(1, '#4e4741');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - U * 4.4, y); ctx.lineTo(x - U * 3.4, y - U * 6); ctx.quadraticCurveTo(x, y - U * 11, x + U * 3.4, y - U * 6); ctx.lineTo(x + U * 4.4, y); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(20,16,14,.35)'; ctx.lineWidth = Math.max(1, U * .1);
      for (let r = 0; r < 9; r++) { const yy = y - r * U * 1.1; ctx.beginPath(); ctx.moveTo(x - U * 5, yy); ctx.lineTo(x + U * 5, yy); for (let c = -4; c < 5; c++) { ctx.moveTo(x + (c + (r % 2) * .5) * U * 1.6, yy); ctx.lineTo(x + (c + (r % 2) * .5) * U * 1.6, yy - U * 1.1); } ctx.stroke(); }
      ctx.restore();
      const fl = .8 + .2 * Math.sin(t * 7);
      ctx.fillStyle = '#1c1512'; ctx.beginPath(); ctx.arc(x, y - U * .1, U * 1.9, Math.PI, 0); ctx.fill();
      ctx.fillStyle = `rgba(255,150,60,${fl})`; ctx.beginPath(); ctx.arc(x, y - U * .1, U * 1.4, Math.PI, 0); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = st.kiln * .6 * fl; ctx.drawImage(SP.glow, x - U * 8, y - U * 8, U * 16, U * 14); ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    /* midden: shell in dark soil */
    if (st.midden > .01) {
      const mk2 = Math.pow(st.midden, .6), mh = n => Math.pow(Math.max(0, Math.sin(Math.PI * (n - .07) / .085)), .7) * 8.5 * U * mk2;
      ctx.beginPath(); ctx.moveTo(X(.07), bedY(X(.07)) + 2);
      for (let n = .07; n <= .1555; n += .004) ctx.lineTo(X(n), bedY(X(n)) - mh(n));
      ctx.lineTo(X(.155), bedY(X(.155)) + 2); ctx.closePath();
      g = ctx.createLinearGradient(0, surf - DK * .32, 0, surf); g.addColorStop(0, '#7c6a52'); g.addColorStop(1, '#4d4236');
      ctx.fillStyle = g; ctx.fill();
      for (const s of middenShells) {
        if (s.rank > st.midden) continue;
        const x = X(s.x);
        ctx.globalAlpha = clamp((st.midden - s.rank) * 14);
        img((s.inner ? SP.inner : SP.dead)[s.v], x, bedY(x) - s.lvl * mh(s.x) * .96 - s.s * U * .1, s.s * U, s.rot);
      }
      ctx.globalAlpha = 1;
      if (st.midden > .5) {
        ctx.strokeStyle = `rgba(120,150,90,${(st.midden - .5) * 2})`; ctx.lineWidth = Math.max(1, U * .16);
        for (let i = 0; i < 26; i++) { const n = .08 + i * .0026, x = X(n), y = bedY(x) - mh(n); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(i * 3 + t) * U * .5, y - U * (1 + (i % 3) * .5)); ctx.stroke(); }
      }
    }

    /* shell going back to the water */
    if (st.ret > .01) {
      for (let i = 0; i < 4; i++) {
        const k = (t * .13 + i / 4) % 1, x0 = X(.13), x1 = X(.29 + i * .05), x = lerp(x0, x1, Math.min(1, k * 1.6)), y0 = bedY(x0) - U * 6;
        let y;
        if (k < .625) { const q = k / .625; y = lerp(y0, sy, q) - Math.sin(q * Math.PI) * U * 10; }
        else { const q = (k - .625) / .375; y = lerp(sy, bedY(x1) - U, q); if (q < .25) { ctx.strokeStyle = `rgba(240,255,250,${(1 - q * 4) * st.ret})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x1, sy - bh * .3, U * (1 + q * 12), U * (.2 + q * 1.4), 0, 0, TAU); ctx.stroke(); } }
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
        ctx.strokeStyle = '#3d3127'; ctx.lineWidth = Math.max(1, U * .5); ctx.beginPath(); ctx.moveTo(x, y + U); ctx.lineTo(tx, y - h); ctx.stroke();
        for (let i = 1; i <= 4; i++) img(SP.live[(s.v + i) % 6], lerp(x, tx, i * .2) + (i % 2 ? U * .3 : -U * .3), y - h * i * .2, U * .85, s.v + i);
      }
      ctx.globalAlpha = 1;
    }

    /* timber poles carrying shell */
    if (st.restore > .01) {
      ctx.globalAlpha = st.restore; ctx.lineCap = 'round';
      for (const p of poles) {
        const x = X(p.x), y = bedY(x), h = p.h * U;
        g = ctx.createLinearGradient(x - U * .4, 0, x + U * .4, 0); g.addColorStop(0, '#a47c52'); g.addColorStop(1, '#5f452c');
        ctx.strokeStyle = g; ctx.lineWidth = Math.max(1.5, U * .8); ctx.beginPath(); ctx.moveTo(x, y + U); ctx.lineTo(x, y - h); ctx.stroke();
        for (let i = 0; i < 9; i++) img(SP[i % 3 ? 'dead' : 'inner'][(i + (p.seed | 0)) % 4], x + Math.sin(p.seed + i * 2.1) * U * 1.1, y - h * .5 - (i - 4) * U * .55, U * 1.05, p.seed + i);
      }
      ctx.globalAlpha = 1;
    }

    /* dredge boat */
    if (st.dredge > .01) {
      const ph = (t * .03) % 2, dir = ph < 1 ? 1 : -1, x = boatX, y = sy - bh * .45 + Math.sin(t * 1.3) * U * .3;
      ctx.globalAlpha = st.dredge * .3; ctx.fillStyle = '#0c1c22'; ctx.beginPath(); ctx.ellipse(x, sy - bh * .25, U * 10, U * .7, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = st.dredge; ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); ctx.rotate(Math.sin(t * 1.1) * .02);
      ctx.fillStyle = '#ded3b6'; ctx.beginPath(); ctx.moveTo(-U * .2, -U * 15.5); ctx.quadraticCurveTo(-U * 7, -U * 8, -U * 8.6, -U * 3.2); ctx.lineTo(-U * .2, -U * 3.2); ctx.closePath(); ctx.fill();   // mainsail
      ctx.fillStyle = '#cdbf9f'; ctx.beginPath(); ctx.moveTo(U * .4, -U * 15); ctx.lineTo(U * 9.4, -U * 2.6); ctx.lineTo(U * .4, -U * 3.4); ctx.closePath(); ctx.fill();                                  // jib
      ctx.strokeStyle = '#2b211a'; ctx.lineWidth = Math.max(1, U * .36); ctx.beginPath(); ctx.moveTo(0, -U * 2); ctx.lineTo(0, -U * 16.5); ctx.moveTo(0, -U * 3.2); ctx.lineTo(-U * 9, -U * 3.2); ctx.stroke();
      g = ctx.createLinearGradient(0, -U * 2.4, 0, U * 1.4); g.addColorStop(0, '#5a4130'); g.addColorStop(1, '#2a1e17');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-U * 9, -U * 2.4); ctx.lineTo(U * 10.5, -U * 2.6); ctx.quadraticCurveTo(U * 8.6, U * 1.2, U * 6, U * 1.3); ctx.lineTo(-U * 7, U * 1.3); ctx.quadraticCurveTo(-U * 8.8, U * .6, -U * 9, -U * 2.4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(235,225,200,.5)'; ctx.lineWidth = Math.max(1, U * .16); ctx.beginPath(); ctx.moveTo(-U * 8.9, -U * 1.5); ctx.lineTo(U * 10, -U * 1.7); ctx.stroke();
      for (let i = 0; i < 7; i++) img(SP.live[i % 6], -U * 6 + i * U * 1.1, -U * 2.9 - (i % 2) * U * .5, U * .9, i);
      ctx.restore(); ctx.globalAlpha = 1;
    }

    /* magnifier on the larva we follow */
    if (hero) {
      const a = st.larvae, e = smooth(st.settle), r = U * 7, lx = hero.x - U * 12, ly = hero.y + U * 11;
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.drawImage(SP.glow, hero.x - U * 2, hero.y - U * 2, U * 4, U * 4); ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `rgba(255,246,214,${.85 * a})`; ctx.lineWidth = Math.max(1, U * .16);
      ctx.beginPath(); ctx.arc(hero.x, hero.y, U * (1.3 + .25 * Math.sin(t * 3)), 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hero.x - U * .9, hero.y - U * .9); ctx.lineTo(lx + r * .72, ly - r * .7); ctx.stroke();
      ctx.globalAlpha = a; ctx.fillStyle = 'rgba(6,26,34,.86)'; ctx.beginPath(); ctx.arc(lx, ly, r, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(238,242,238,.9)'; ctx.lineWidth = Math.max(1.2, U * .28); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, r - 1, 0, TAU); ctx.clip();
      if (e < .98) {            // swimming larva: two tiny valves and a ring of beating hairs
        ctx.globalAlpha = a * (1 - e); ctx.save(); ctx.translate(lx, ly + r * .08); ctx.rotate(Math.sin(t * .8) * .15);
        ctx.strokeStyle = 'rgba(255,240,200,.9)'; ctx.lineWidth = Math.max(1, U * .14);
        for (let i = 0; i < 26; i++) { const an = Math.PI + i / 25 * Math.PI, w = Math.sin(t * 9 + i * .7) * .25; ctx.beginPath(); ctx.moveTo(Math.cos(an) * r * .42, -r * .16 + Math.sin(an) * r * .2); ctx.lineTo(Math.cos(an + w) * r * .62, -r * .16 + Math.sin(an + w) * r * .44); ctx.stroke(); }
        ctx.fillStyle = 'rgba(250,214,150,.55)'; ctx.beginPath(); ctx.ellipse(0, -r * .16, r * .42, r * .13, 0, 0, TAU); ctx.fill();
        const sg = ctx.createRadialGradient(-r * .1, r * .05, 0, 0, r * .1, r * .5); sg.addColorStop(0, 'rgba(255,236,190,.95)'); sg.addColorStop(1, 'rgba(206,150,90,.85)');
        ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(-r * .44, -r * .12); ctx.lineTo(r * .44, -r * .12); ctx.quadraticCurveTo(r * .5, r * .5, 0, r * .52); ctx.quadraticCurveTo(-r * .5, r * .5, -r * .44, -r * .12); ctx.fill();
        ctx.strokeStyle = 'rgba(120,80,40,.5)'; ctx.beginPath(); ctx.arc(0, r * .02, r * .3, .3, Math.PI - .3); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -r * .02, r * .42, .4, Math.PI - .4); ctx.stroke();
        ctx.fillStyle = 'rgba(60,30,20,.7)'; ctx.beginPath(); ctx.arc(r * .12, r * .12, r * .05, 0, TAU); ctx.fill();
        ctx.restore();
      }
      if (e > .02) {            // settled spat on old shell
        ctx.globalAlpha = a * e;
        img(SP.live[1], lx - r * .2, ly + r * .75, r * 1.25, .2); img(SP.live[3], lx + r * .7, ly + r * .65, r * .9, -.6);
        img(SP.inner[0], lx, ly + r * .02, r * .42, -.3);
      }
      ctx.restore();
      ctx.globalAlpha = a; ctx.fillStyle = '#eef2ee'; ctx.font = `500 ${Math.max(10, U * 1.5)}px "IBM Plex Mono", ui-monospace, monospace`; ctx.textAlign = 'center';
      ctx.fillText(e > .5 ? 'SPAT' : 'LARVA', lx, ly - r - U * .9);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  window.OysterScene = { init, resize, draw, DEF };
})();
