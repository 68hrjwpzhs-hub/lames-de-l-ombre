
// =============================== outils de peinture des décors ===============================
// Les décors sont peints une seule fois (puis mis en cache) : on peut donc y passer du temps.
// Toutes les coordonnées sont celles de la scène (960 × 540) ; le contexte est déjà mis à l'échelle.
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const VP = [480, 300]; // point de fuite
const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
const rgba = (c, a) => `rgba(${c},${a})`;
function glow(g, x, y, r, col, a = 1) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col.replace('A', a)); gr.addColorStop(1, col.replace('A', 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
// ---- bruit de valeur et fbm (textures de pierre, d'enduit, de nuages) ----
function makeNoise(seed) {
  const R = rng(seed), perm = new Uint8Array(512), val = new Float32Array(256);
  for (let i = 0; i < 256; i++) { perm[i] = i; val[i] = R(); }
  for (let i = 255; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
  const h = (i, j) => val[perm[(perm[i & 255] + j) & 255]];
  return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
}
function fbm(n, x, y, oct = 4) { let s = 0, a = .5, f = 1, t = 0; for (let i = 0; i < oct; i++) { s += a * n(x * f, y * f); t += a; f *= 2.03; a *= .5; } return s / t; }
// calque de bruit : chaque point reçoit une couleur selon la valeur de bruit (fonction col(v, x, y) → [r, g, b, a] ou null)
function noiseLayer(g, x, y, w, h, o) {
  const res = o.res || 3, cw = Math.ceil(w / res), ch = Math.ceil(h / res), c = mkCanvas(cw, ch), cx = c.getContext('2d'), im = cx.createImageData(cw, ch), d = im.data;
  const n = makeNoise(o.seed || 1), cell = o.cell || 40, oct = o.oct || 4, sx = o.sx || 1, sy = o.sy || 1;
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
    const px = x + i * res, py = y + j * res, v = fbm(n, px / cell * sx, py / cell * sy, oct), r = o.col(v, px, py); if (!r) continue;
    const k = (j * cw + i) * 4; d[k] = r[0]; d[k + 1] = r[1]; d[k + 2] = r[2]; d[k + 3] = r[3] * 255;
  }
  cx.putImageData(im, 0, 0); g.save(); g.imageSmoothingEnabled = true; if (o.comp) g.globalCompositeOperation = o.comp; g.globalAlpha = o.alpha ?? 1; g.drawImage(c, x, y, w, h); g.restore();
}
// grain sale (crasse, patine) posé par-dessus une zone
function grime(g, x, y, w, h, seed, a = .35, dark = '30,22,18', cell = 30) {
  noiseLayer(g, x, y, w, h, { seed, cell, oct: 5, res: 3, col: v => v > .52 ? [...dark.split(',').map(Number), (v - .52) * 2.2 * a] : null });
}
// ---- pinceau doux : dessin réduit puis agrandi (flou bon marché, partout disponible) ----
function soft(g, blur, fn, alpha = 1, comp = 'source-over') {
  const f = Math.max(1, blur), c = mkCanvas(W / f, H / f), s = c.getContext('2d'); s.scale(1 / f, 1 / f); fn(s);
  g.save(); g.globalAlpha = alpha; g.globalCompositeOperation = comp; g.imageSmoothingEnabled = true; g.drawImage(c, 0, 0, W, H); g.restore();
}
// coups de pinceau : petites touches orientées dans une zone
function strokes(g, x, y, w, h, n, cols, R, o = {}) {
  const ang = o.ang ?? 0, len = o.len ?? 8, wid = o.wid ?? 1.5, a = o.a ?? .12;
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const px = x + R() * w, py = y + R() * h, an = ang + (R() - .5) * (o.jit ?? .5), l = len * (.5 + R()); g.strokeStyle = rgba(cols[Math.floor(R() * cols.length)], a * (.5 + R())); g.lineWidth = wid * (.5 + R());
    g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(an) * l, py + Math.sin(an) * l); g.stroke(); }
  g.restore();
}
// ---- ciel et nuages peints ----
function skyGrad(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([t, c]) => gr.addColorStop(t, c)); g.fillStyle = gr; g.fillRect(0, y0, W, y1 - y0); }
// banc de nuages : une masse cohérente de bosses aplaties, dessous plat et sombre, bords éclairés du côté de la lumière (lx, ly)
function cloudBank(g, R, cx, cy, w, h, body, lit, shadow, lx, ly, n = 26) {
  const blobs = []; n = Math.round(n * 1.8);
  for (let i = 0; i < n; i++) { const u = R(), e = 1 - Math.pow(Math.abs(u - .5) * 2, 1.6); blobs.push([cx + (u - .5) * w, cy - R() * h * .55 * e, h * (.32 + .5 * e) * (.7 + R() * .5)]); }
  const fade = c => c.replace(/[\d.]+\)$/, '0)');
  const pass = (blur, fn, comp) => soft(g, blur, s => { s.save(); s.beginPath(); s.rect(cx - w, cy - h * 2.5, w * 2, h * 2.5 + h * .55); s.clip(); for (const b of blobs) fn(s, ...b); s.restore(); }, 1, comp);
  pass(3, (s, x, y, r) => { s.save(); s.translate(x, y); s.scale(1.7, 1); const q = s.createRadialGradient(0, 0, 0, 0, 0, r); q.addColorStop(0, body); q.addColorStop(.75, body.replace(/[\d.]+\)$/, '.5)')); q.addColorStop(1, fade(body)); s.fillStyle = q; s.beginPath(); s.arc(0, 0, r, 0, 7); s.fill(); s.restore(); });
  pass(3, (s, x, y, r) => { const yy = y + r * .45; s.save(); s.translate(x, yy); s.scale(1.8, .7); const q = s.createRadialGradient(0, 0, 0, 0, 0, r); q.addColorStop(0, shadow); q.addColorStop(1, fade(shadow)); s.fillStyle = q; s.beginPath(); s.arc(0, 0, r, 0, 7); s.fill(); s.restore(); });
  pass(2, (s, x, y, r) => { const dx = lx - x, dy = ly - y, l = Math.hypot(dx, dy) || 1, hx = x + dx / l * r * .55, hy = y + dy / l * r * .45 - r * .15; s.save(); s.translate(hx, hy); s.scale(1.6, 1); const q = s.createRadialGradient(0, 0, 0, 0, 0, r * .55); q.addColorStop(0, lit); q.addColorStop(1, fade(lit)); s.fillStyle = q; s.beginPath(); s.arc(0, 0, r * .55, 0, 7); s.fill(); s.restore(); });
}
// ---- maçonnerie : pierres de taille ombrées, joints, épaufrures, coulures ----
function masonry(g, x, y, w, h, bw, bh, base, R, o = {}) {
  const [r0, g0, b0] = base; g.fillStyle = `rgb(${r0 * .62 | 0},${g0 * .6 | 0},${b0 * .58 | 0})`; g.fillRect(x, y, w, h); // mortier
  const gap = o.gap ?? 1.4;
  for (let row = 0, yy = y; yy < y + h; row++, yy += bh) {
    const off = (row % 2) * bw * .5 - R() * bw * .2;
    for (let xx = x - bw + off; xx < x + w; xx += bw * (.75 + R() * .5)) {
      const ww = bw * (.7 + R() * .45), v = .86 + R() * .26, warm = (R() - .5) * 14;
      const bx = Math.max(x, xx + gap), bx1 = Math.min(x + w, xx + ww - gap), by = yy + gap, by1 = Math.min(y + h, yy + bh - gap); if (bx1 <= bx || by1 <= by) continue;
      const gr = g.createLinearGradient(0, by, 0, by1); gr.addColorStop(0, `rgb(${Math.min(255, r0 * v * 1.08 + warm) | 0},${Math.min(255, g0 * v * 1.07) | 0},${Math.min(255, b0 * v * 1.05 - warm * .5) | 0})`); gr.addColorStop(1, `rgb(${r0 * v * .9 + warm | 0},${g0 * v * .9 | 0},${b0 * v * .88 | 0})`);
      g.fillStyle = gr; g.fillRect(bx, by, bx1 - bx, by1 - by);
      g.fillStyle = 'rgba(255,248,230,.13)'; g.fillRect(bx, by, bx1 - bx, 1); // arête éclairée
      g.fillStyle = 'rgba(20,12,10,.22)'; g.fillRect(bx, by1 - 1.2, bx1 - bx, 1.2);
      if (R() < .22) { g.fillStyle = 'rgba(20,12,10,.25)'; const cx0 = bx + R() * (bx1 - bx), cy0 = by + R() * (by1 - by); g.beginPath(); g.ellipse(cx0, cy0, 1 + R() * 3, 1 + R() * 2, R() * 3, 0, 7); g.fill(); } // épaufrure
    }
  }
  if (o.grime !== false) grime(g, x, y, w, h, Math.floor(R() * 999), o.grimeA ?? .4);
  if (o.streaks) { g.save(); for (let i = 0; i < o.streaks; i++) { const sx = x + R() * w, sl = h * (.2 + R() * .6), gr = g.createLinearGradient(0, y, 0, y + sl); gr.addColorStop(0, 'rgba(30,24,20,.22)'); gr.addColorStop(1, 'rgba(30,24,20,0)'); g.fillStyle = gr; g.fillRect(sx, y, 2 + R() * 6, sl); } g.restore(); }
}
// enduit / plâtre irrégulier
function plaster(g, x, y, w, h, base, seed, a = .5) {
  g.fillStyle = `rgb(${base})`; g.fillRect(x, y, w, h);
  const b = base.split(',').map(Number);
  noiseLayer(g, x, y, w, h, { seed, cell: 60, oct: 5, res: 4, col: v => [b[0] * (.7 + v * .5), b[1] * (.7 + v * .5), b[2] * (.68 + v * .5), a] });
}
// bois veiné (planches verticales ou horizontales)
function woodPanel(g, x, y, w, h, base, R, vertical = true) {
  const b = base.split(',').map(Number); g.fillStyle = `rgb(${base})`; g.fillRect(x, y, w, h);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  for (let i = 0; i < (vertical ? w : h) / 2.2; i++) { const t = R(); g.strokeStyle = `rgba(${b[0] * .55 | 0},${b[1] * .5 | 0},${b[2] * .45 | 0},${.12 + R() * .2})`; g.lineWidth = .5 + R() * 1.2; g.beginPath();
    if (vertical) { const px = x + t * w; g.moveTo(px, y); g.bezierCurveTo(px + (R() - .5) * 6, y + h * .3, px + (R() - .5) * 6, y + h * .7, px + (R() - .5) * 3, y + h); }
    else { const py = y + t * h; g.moveTo(x, py); g.bezierCurveTo(x + w * .3, py + (R() - .5) * 4, x + w * .7, py + (R() - .5) * 4, x + w, py + (R() - .5) * 2); }
    g.stroke(); }
  g.restore();
}
// ---- sols en perspective ----
function perspFloor(g, y0, cols, rows, colA, colB, opts = {}) {
  const yAt = r => y0 + (H - y0) * Math.pow(r / rows, 1.35);
  const xAt = (i, y) => VP[0] + (i * (opts.w || 60)) * ((y - VP[1]) / (y0 - VP[1]));
  const R = rng(opts.seed || 5);
  for (let r = 0; r < rows; r++) {
    const ya = yAt(r), yb = yAt(r + 1);
    for (let i = -cols; i < cols; i++) {
      const base = opts.planks ? ((i * 7 + r * 3) % 5 === 0 ? colB : colA) : ((i + r) % 2 === 0 ? colA : colB);
      g.fillStyle = base; g.beginPath(); g.moveTo(xAt(i, ya), ya); g.lineTo(xAt(i + 1, ya), ya); g.lineTo(xAt(i + 1, yb), yb); g.lineTo(xAt(i, yb), yb); g.closePath(); g.fill();
      if (opts.vary) { g.fillStyle = `rgba(${R() < .5 ? '255,245,225' : '20,14,10'},${R() * opts.vary})`; g.fill(); }
    }
    if (opts.lines) { g.strokeStyle = opts.lines; g.lineWidth = 1; g.beginPath(); g.moveTo(0, ya); g.lineTo(W, ya); g.stroke(); }
  }
  if (opts.lines) for (let i = -cols; i <= cols; i++) { g.strokeStyle = opts.lines; g.beginPath(); g.moveTo(xAt(i, y0), y0); g.lineTo(xAt(i, H), H); g.stroke(); }
}
// pavés irréguliers en perspective
function cobbles(g, y0, R, base, o = {}) {
  const b = base.split(',').map(Number); g.fillStyle = `rgb(${b.map(v => v * .55 | 0)})`; g.fillRect(0, y0, W, H - y0);
  for (let row = 0; ; row++) {
    const t = row / 16, y = y0 + (H - y0) * Math.pow(t, 1.3); if (y > H + 6) break; const s = .3 + t * 1.3, sh = 4.5 * s + 1;
    for (let x = -20 + R() * 10; x < W + 20;) {
      const sw = 13 * s * (.75 + R() * .6), v = .8 + R() * .32, c = b.map(q => Math.min(255, q * v) | 0), jy = (R() - .5) * sh * .3;
      const gr = g.createLinearGradient(0, y - sh * .5, 0, y + sh * .5); gr.addColorStop(0, `rgb(${c.map(q => Math.min(255, q * 1.15) | 0)})`); gr.addColorStop(1, `rgb(${c.map(q => q * .82 | 0)})`);
      g.fillStyle = gr; g.beginPath(); g.ellipse(x + sw / 2, y + jy, sw * .47, sh * .5, (R() - .5) * .12, 0, 7); g.fill();
      if (o.wet && R() < .3) { g.fillStyle = `rgba(${o.wet},${.12 + R() * .2})`; g.beginPath(); g.ellipse(x + sw * .4, y + jy - sh * .2, sw * .18, sh * .12, 0, 0, 7); g.fill(); }
      x += sw * (1.02 + R() * .08);
    }
  }
  grime(g, 0, y0, W, H - y0, 444, .35);
}
// ---- fenêtres, arcs ----
function lancet(g, x, y, w, h) { g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w * .5); g.quadraticCurveTo(x, y, x + w / 2, y - w * .35); g.quadraticCurveTo(x + w, y, x + w, y + w * .5); g.lineTo(x + w, y + h); g.closePath(); }
function roundWin(g, x, y, w, h) { g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); }
// fenêtre à petits carreaux sertis de plomb, éclairée ou non
function leaded(g, x, y, w, h, lit, R, o = {}) {
  const col = lit ? (o.litCol || '255,196,110') : (o.darkCol || '40,44,60');
  const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, rgba(col, lit ? .95 : .9)); gr.addColorStop(1, rgba(lit ? '200,120,50' : '20,22,34', .95)); g.fillStyle = gr;
  if (o.arch) roundWin(g, x, y, w, h); else g.beginPath(), g.rect(x, y, w, h); g.fill();
  g.save(); g.clip();
  for (let i = 0; i < 30; i++) { g.fillStyle = rgba(lit ? '255,240,200' : '150,170,210', R() * (lit ? .18 : .08)); g.fillRect(x + R() * w, y + R() * h, w / 4, h / 6); } // verre inégal
  g.strokeStyle = lit ? 'rgba(60,30,10,.7)' : 'rgba(10,10,16,.7)'; g.lineWidth = .7; const p = o.pane || 6;
  for (let k = -h; k < w + h; k += p) { g.beginPath(); g.moveTo(x + k, y); g.lineTo(x + k + h * .6, y + h); g.moveTo(x + k, y); g.lineTo(x + k - h * .6, y + h); g.stroke(); }
  g.restore();
  g.strokeStyle = o.frame || '#2a1e18'; g.lineWidth = o.frameW || 2; if (o.arch) roundWin(g, x, y, w, h); else g.beginPath(), g.rect(x, y, w, h); g.stroke();
  if (o.mullion !== false) { g.beginPath(); g.moveTo(x + w / 2, y + (o.arch ? w / 2 : 0)); g.lineTo(x + w / 2, y + h); g.moveTo(x, y + h * .42); g.lineTo(x + w, y + h * .42); g.stroke(); }
  if (lit && o.glow !== false) glow(g, x + w / 2, y + h / 2, Math.max(w, h) * 1.1, 'rgba(255,180,90,A)', .16);
}
function rays(g, pts, col) { g.save(); g.globalCompositeOperation = 'lighter'; for (const [x0, x1, y0, x2, x3, y1, a] of pts) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, col.replace('A', a)); gr.addColorStop(1, col.replace('A', 0)); g.fillStyle = gr; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.lineTo(x3, y1); g.lineTo(x2, y1); g.closePath(); g.fill(); } g.restore(); }
function candle(g, x, y, h = 26) {
  const cg = g.createLinearGradient(x - 3, 0, x + 3, 0); cg.addColorStop(0, '#d8c8a4'); cg.addColorStop(.5, '#f4ead2'); cg.addColorStop(1, '#b8a888'); g.fillStyle = cg; g.fillRect(x - 3, y - h, 6, h);
  g.fillStyle = 'rgba(240,230,205,.9)'; g.beginPath(); g.ellipse(x - 2.5, y - h + 5, 1.2, 4, 0, 0, 7); g.fill(); // coulure de cire
  glow(g, x, y - h - 6, 22, 'rgba(255,190,100,A)', .45);
  g.fillStyle = '#ffb24a'; g.beginPath(); g.ellipse(x, y - h - 6, 2.8, 6.5, 0, 0, 7); g.fill(); g.fillStyle = '#fff6d8'; g.beginPath(); g.ellipse(x, y - h - 5, 1.3, 3.2, 0, 0, 7); g.fill();
}
// ---- héraldique du Cardinal : d'argent à trois chevrons de gueules, timbré du chapeau rouge à houppes ----
function richelieuArms(g, x, y, s, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (o.hat !== false) { // chapeau de cardinal et cordons à quinze houppes de chaque côté
    g.fillStyle = '#9a1418'; g.beginPath(); g.ellipse(0, -46, 26, 5, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(0, -51, 12, 7, 0, Math.PI, 0); g.fill();
    g.fillStyle = 'rgba(255,200,180,.25)'; g.beginPath(); g.ellipse(-4, -54, 6, 2.5, 0, 0, 7); g.fill();
    g.strokeStyle = '#9a1418'; g.lineWidth = 1.2;
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 18, -44); g.bezierCurveTo(sd * 30, -30, sd * 26, -10, sd * 24, 6); g.stroke();
      let row = 1; for (let k = 0; k < 15; k++) { /* houppes : 1, 2, 3, 4, 5 */ } for (let r = 0; r < 5; r++) for (let c = 0; c <= r; c++) { const tx = sd * (22 + (c - r / 2) * 5 + r * 1.2), ty = -30 + r * 8; g.fillStyle = '#b01c20'; g.beginPath(); g.moveTo(tx, ty - 2); g.lineTo(tx - 2, ty + 3); g.lineTo(tx + 2, ty + 3); g.closePath(); g.fill(); } void row; }
  }
  // écu
  g.beginPath(); g.moveTo(-16, -38); g.lineTo(16, -38); g.lineTo(16, -6); g.quadraticCurveTo(16, 10, 0, 18); g.quadraticCurveTo(-16, 10, -16, -6); g.closePath();
  const sg = g.createLinearGradient(-16, -38, 16, 18); sg.addColorStop(0, '#f4f0e6'); sg.addColorStop(1, '#bdb6a8'); g.fillStyle = sg; g.fill();
  g.save(); g.clip(); g.fillStyle = '#b01c20';
  for (const cy of [-26, -12, 2]) { g.beginPath(); g.moveTo(-18, cy + 10); g.lineTo(0, cy); g.lineTo(18, cy + 10); g.lineTo(18, cy + 16); g.lineTo(0, cy + 6); g.lineTo(-18, cy + 16); g.closePath(); g.fill(); }
  g.restore(); g.strokeStyle = '#c8a050'; g.lineWidth = 2; g.beginPath(); g.moveTo(-16, -38); g.lineTo(16, -38); g.lineTo(16, -6); g.quadraticCurveTo(16, 10, 0, 18); g.quadraticCurveTo(-16, 10, -16, -6); g.closePath(); g.stroke();
  g.restore();
}
// bannière suspendue, plis verticaux, frange d'or, motif central (fonction)
function banner(g, x, y, w, h, col, R, motif) {
  const c = col.split(',').map(Number);
  g.save(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.lineTo(x + w, y + h - 14); g.lineTo(x + w / 2, y + h); g.lineTo(x, y + h - 14); g.closePath();
  const gr = g.createLinearGradient(x, 0, x + w, 0); const folds = 5;
  for (let i = 0; i <= folds * 2; i++) { const t = i / (folds * 2), k = i % 2 ? .62 : 1.08; gr.addColorStop(t, `rgb(${c.map(v => Math.min(255, v * k) | 0)})`); }
  g.fillStyle = gr; g.fill(); g.clip();
  const vg = g.createLinearGradient(0, y, 0, y + h); vg.addColorStop(0, 'rgba(0,0,0,.35)'); vg.addColorStop(.25, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.25)'); g.fillStyle = vg; g.fillRect(x, y, w, h);
  if (motif) motif(g, x + w / 2, y + h * .48);
  g.restore();
  g.strokeStyle = '#c8a050'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + h - 14); g.lineTo(x + w / 2, y + h); g.lineTo(x + w, y + h - 14); g.stroke();
  g.strokeStyle = 'rgba(200,160,80,.8)'; g.lineWidth = 1; for (let i = 0; i <= 12; i++) { const t = i / 12, px = x + t * w, py = y + h - 14 + (t < .5 ? t : 1 - t) * 28; g.beginPath(); g.moveTo(px, py); g.lineTo(px, py + 5); g.stroke(); }
  g.fillStyle = '#3a2418'; g.fillRect(x - 6, y - 4, w + 12, 5); g.fillStyle = '#c8a050'; g.beginPath(); g.arc(x - 6, y - 1.5, 3, 0, 7); g.arc(x + w + 6, y - 1.5, 3, 0, 7); g.fill();
  void R;
}
// ---- vouivre en vol (silhouette peinte, liseré de lumière) ----
function wyvern(g, x, y, s, dir, flap, col, rim, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * dir, s);
  const wingUp = -38 - flap * 30, wingTip = [8 - flap * 6, wingUp - 22];
  const body = () => {
    g.beginPath();
    g.moveTo(60, -16); g.quadraticCurveTo(68, -17, 72, -13); g.lineTo(66, -11); g.quadraticCurveTo(60, -9, 54, -10); // tête et mâchoire
    g.quadraticCurveTo(40, -6, 24, -4); g.quadraticCurveTo(10, 8, -16, 4); // cou et ventre
    g.quadraticCurveTo(-46, 6, -70, 18); g.quadraticCurveTo(-86, 26, -98, 22); g.lineTo(-106, 28); g.lineTo(-104, 18); g.lineTo(-110, 14); g.lineTo(-98, 17); // queue et fer de lance
    g.quadraticCurveTo(-82, 18, -66, 10); g.quadraticCurveTo(-40, -2, -18, -8); g.quadraticCurveTo(6, -14, 22, -12); g.quadraticCurveTo(42, -16, 54, -20); g.quadraticCurveTo(58, -26, 50, -30); g.lineTo(60, -22); // nuque et cornes
    g.closePath();
  };
  const wing = (k) => { // aile de chauve-souris : bras, doigts, membrane festonnée
    const tip = [wingTip[0] * k, wingTip[1] * k], el = [-6, wingUp * .55 * k];
    g.beginPath(); g.moveTo(6, -10); g.lineTo(el[0], el[1]); g.lineTo(tip[0], tip[1]);
    const f1 = [-36, wingUp * .4 * k - 4], f2 = [-52, wingUp * .1 * k + 2];
    g.quadraticCurveTo(-20, wingUp * .6 * k, f1[0], f1[1]); g.quadraticCurveTo(-36, wingUp * .2 * k, f2[0], f2[1]); g.quadraticCurveTo(-34, -2, -20, -4); g.closePath();
    return [el, tip, f1, f2];
  };
  g.fillStyle = o.far || col; g.globalAlpha = .9; const back = wing(.72); g.fill(); g.globalAlpha = 1;
  g.fillStyle = col; body(); g.fill();
  if (o.rider) { g.beginPath(); g.ellipse(4, -16, 6, 8, -.2, 0, 7); g.fill(); g.beginPath(); g.arc(6, -27, 4, 0, 7); g.fill(); g.beginPath(); g.ellipse(6, -30, 7, 2, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(0, -18); g.quadraticCurveTo(-14, -14, -20, -6); g.lineTo(-2, -12); g.fill(); } // cavalier et cape
  g.beginPath(); g.moveTo(-8, 4); g.lineTo(-14, 16); g.lineTo(-8, 18); g.lineTo(-4, 6); g.fill(); // patte repliée
  const front = wing(1); g.fill();
  g.strokeStyle = rim; g.lineWidth = 1.4 / s; g.lineCap = 'round'; // os des ailes et liseré
  g.beginPath(); g.moveTo(6, -10); g.lineTo(front[0][0], front[0][1]); g.lineTo(front[1][0], front[1][1]); g.moveTo(front[0][0], front[0][1]); g.lineTo(front[2][0], front[2][1]); g.moveTo(front[0][0], front[0][1]); g.lineTo(front[3][0], front[3][1]); g.stroke();
  g.lineWidth = 1 / s; g.beginPath(); g.moveTo(54, -20); g.quadraticCurveTo(42, -16, 22, -12); g.quadraticCurveTo(6, -14, -18, -8); g.quadraticCurveTo(-40, -2, -66, 10); g.stroke();
  if (o.eye) { g.fillStyle = o.eye; g.beginPath(); g.arc(62, -15, 1.4, 0, 7); g.fill(); }
  void back; g.restore();
}
// ---- silhouettes humaines d'arrière-plan ----
// type : 'garde' (casaque rouge à croix blanche et hallebarde), 'bourgeois', 'dame', 'moine', 'porteur' (torche)
function person(g, x, y, h, type, R, o = {}) {
  const s = h / 60, dir = o.dir ?? 1, col = o.col || { garde: '#8a1a1e', bourgeois: '#3a3036', dame: '#4a2a3a', moine: '#3a2e24', porteur: '#4a3a2a' }[type] || '#333';
  g.save(); g.translate(x, y); g.scale(s * dir, s); const shadeC = o.shade || 'rgba(0,0,0,.25)';
  g.fillStyle = o.leg || '#1e1a1c'; g.fillRect(-5, -22, 4, 22); g.fillRect(2, -22, 4, 22); // jambes
  g.fillStyle = col; g.beginPath();
  if (type === 'dame' || type === 'moine') { g.moveTo(-6, -44); g.lineTo(6, -44); g.quadraticCurveTo(12, -20, 14, 0); g.lineTo(-14, 0); g.quadraticCurveTo(-12, -20, -6, -44); }
  else { g.moveTo(-7, -46); g.lineTo(7, -46); g.lineTo(9, -20); g.lineTo(-9, -20); }
  g.closePath(); g.fill();
  if (type === 'garde') { g.fillStyle = '#e8e4da'; g.fillRect(-1.2, -42, 2.4, 18); g.fillRect(-6, -36, 12, 2.4); } // croix
  g.fillStyle = shadeC; g.fillRect(0, -46, 9, 26);
  g.fillStyle = col; g.fillRect(-10, -44, 4, 18); g.fillRect(7, -44, 4, 18); // bras
  g.fillStyle = o.skin || '#c89a78'; g.beginPath(); g.arc(0, -51, 5, 0, 7); g.fill(); // tête
  g.fillStyle = '#1a1416'; if (type === 'moine') { g.beginPath(); g.arc(0, -52, 6, Math.PI * .9, Math.PI * 2.1); g.fill(); } else if (type !== 'dame') { g.beginPath(); g.ellipse(0, -55, 9, 2, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(0, -57, 4.5, 3.5, 0, Math.PI, 0); g.fill(); } else { g.beginPath(); g.arc(-1, -53, 5.5, Math.PI, 0); g.fill(); }
  if (type === 'garde') { g.strokeStyle = '#4a3a2a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(12, 0); g.lineTo(12, -78); g.stroke(); g.fillStyle = '#a8b0b8'; g.beginPath(); g.moveTo(12, -78); g.lineTo(18, -70); g.lineTo(12, -66); g.lineTo(6, -70); g.closePath(); g.fill(); g.fillRect(12, -72, 7, 2); }
  if (type === 'porteur') { g.strokeStyle = '#3a2a1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(10, -30); g.lineTo(14, -58); g.stroke(); glow(g, 14, -62, 26, 'rgba(255,170,70,A)', .7); g.fillStyle = '#ffc060'; g.beginPath(); g.ellipse(14, -62, 3, 6, 0, 0, 7); g.fill(); }
  if (o.cape) { g.fillStyle = o.cape; g.beginPath(); g.moveTo(-7, -46); g.quadraticCurveTo(-14, -26, -12, -12); g.lineTo(-4, -16); g.quadraticCurveTo(-4, -32, -1, -46); g.closePath(); g.fill(); }
  g.restore(); void R;
}
// ombre douce posée au sol sous un objet
function groundShadow(g, x, y, rx, ry, a = .35) { g.save(); g.translate(x, y); g.scale(1, ry / rx); const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, `rgba(10,6,8,${a})`); gr.addColorStop(1, 'rgba(10,6,8,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, 7); g.fill(); g.restore(); }
// râtelier d'armes
function rapierRack(g, x, y, n, col) {
  const wg = g.createLinearGradient(0, y, 0, y + 128); wg.addColorStop(0, '#5a3820'); wg.addColorStop(1, '#3a2414');
  g.fillStyle = wg; g.fillRect(x - 6, y, n * 22 + 12, 8); g.fillRect(x - 6, y + 112, n * 22 + 12, 8); g.fillRect(x - 6, y, 6, 128); g.fillRect(x + n * 22, y, 6, 128);
  for (let i = 0; i < n; i++) { const bx = x + 11 + i * 22; const bg = g.createLinearGradient(bx - 1, 0, bx + 1, 0); bg.addColorStop(0, '#8a96a2'); bg.addColorStop(.5, '#eef4fa'); bg.addColorStop(1, '#6a7480'); g.strokeStyle = bg; g.lineWidth = 1.8; g.beginPath(); g.moveTo(bx, y + 30); g.lineTo(bx, y + 118); g.stroke();
    g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.arc(bx, y + 26, 6, 0, Math.PI); g.stroke(); g.beginPath(); g.moveTo(bx - 8, y + 26); g.lineTo(bx + 8, y + 26); g.stroke(); g.fillStyle = '#2a1a10'; g.fillRect(bx - 2, y + 8, 4, 16); g.fillStyle = col; g.beginPath(); g.arc(bx, y + 7, 3, 0, 7); g.fill(); }
}
// cadre doré d'un tableau, avec une scène peinte (fonction)
function paintingFrame(g, x, y, w, h, scene) {
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + 4, y + 5, w, h);
  const fg = g.createLinearGradient(x, y, x + w, y + h); fg.addColorStop(0, '#e8c070'); fg.addColorStop(.5, '#8a6020'); fg.addColorStop(1, '#c89a48'); g.fillStyle = fg; g.fillRect(x, y, w, h);
  g.fillStyle = '#3a2810'; g.fillRect(x + 6, y + 6, w - 12, h - 12);
  g.save(); g.beginPath(); g.rect(x + 8, y + 8, w - 16, h - 16); g.clip(); scene(g, x + 8, y + 8, w - 16, h - 16);
  const vg = g.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.max(w, h) * .7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(30,18,6,.55)'); g.fillStyle = vg; g.fillRect(x, y, w, h); // vernis jauni
  g.restore();
}
// craquelure du vernis : fin réseau de fissures, à peine visible
function craquelure(g, seed) {
  const R = rng(seed); g.save(); g.lineWidth = .5; g.strokeStyle = 'rgba(30,18,10,.07)';
  for (let i = 0; i < 260; i++) { let x = R() * W, y = R() * H, a = R() * 7; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { a += (R() - .5) * 1.6; x += Math.cos(a) * (6 + R() * 10); y += Math.sin(a) * (6 + R() * 10); g.lineTo(x, y); } g.stroke(); }
  g.restore();
}
