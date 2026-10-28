// =============================== sprint 8 : cape en tissu simulé, visages vivants, portraits en incrustation ===============================
// La cape : deux bords (bord extérieur, bord côté corps) de N points reliés entre eux, intégration de Verlet à 120 Hz.
// Elle suit les épaules avec du retard, s'envole au pas rapide et à la fente, prend le vent selon le lieu, se pose au sol.
const CLOTH_N = 7;
const CLOTH_WIND = { salle: 0, eglise: 0, cloitre: 22, nuit: 48, loggia: 70 }; // px/s² (vers la gauche de l'écran)
const Cloth = {
  anchors(f, j) { const d = f.dir, a = [j.bsh[0] - d * 2, j.bsh[1] - 3]; return [[a[0] - d * 9, a[1] + 3], [a[0] + d * 6, a[1]]]; },
  init(f, j) {
    const d = f.dir, [ao, ai] = this.anchors(f, j), a = [(ao[0] + ai[0]) / 2, (ao[1] + ai[1]) / 2], len = Math.max(66, j.gy + 30 - a[1]), seg = len / (CLOTH_N - 1), P = [];
    for (let i = 0; i < CLOTH_N; i++) P.push([a[0] - d * i * 2.4, a[1] + i * seg * .97]);
    const W = []; for (let i = 0; i < CLOTH_N; i++) W.push(15 + 19 * i / (CLOTH_N - 1));
    f.cloth = { P, pP: P.map(p => p.slice()), seg, W, d, gust: Math.random() * 9, O: [], I: [] }; this.edges(f.cloth);
  },
  // les deux bords de la cape, de part et d'autre de la ligne médiane simulée (le bord extérieur du côté du dos)
  edges(c) { const P = c.P, d = c.d, O = [], I = [];
    for (let i = 0; i < CLOTH_N; i++) { const q = P[Math.max(0, i - 1)], r = P[Math.min(CLOTH_N - 1, i + 1)], tx = r[0] - q[0], ty = r[1] - q[1], L = Math.hypot(tx, ty) || 1, nx = -ty / L * d, ny = tx / L * d, h = c.W[i] / 2;
      O.push([P[i][0] + nx * h, P[i][1] + ny * h]); I.push([P[i][0] - nx * h, P[i][1] - ny * h]); }
    c.O = O; c.I = I; },
  step(f, dt) {
    const j = f.J; if (!j || !f.look) return; const S = norm(f.look); if (!S.cape || S.style === 'rodeur') { f.cloth = null; return; }
    let c = f.cloth; const [ao, ai] = this.anchors(f, j), a = [(ao[0] + ai[0]) / 2, (ao[1] + ai[1]) / 2];
    if (!c || !c.P || c.d !== f.dir || Math.hypot(c.P[0][0] - a[0], c.P[0][1] - a[1]) > 60) { this.init(f, j); c = f.cloth; }
    const d = f.dir, t = (typeof G !== 'undefined' ? G.time : 0) + c.gust, base = CLOTH_WIND[typeof G !== 'undefined' ? G.venue : ''] || 0;
    const wind = -(base * (.7 + .3 * Math.sin(t * .9) + .25 * Math.sin(t * 2.7))) * (typeof G !== 'undefined' && G.weather === 'rain' ? 1.4 : 1);
    const dt2 = dt * dt, damp = .976, P = c.P, Q = c.pP;
    for (let i = 1; i < CLOTH_N; i++) { const p = P[i], q = Q[i], vx = (p[0] - q[0]) * damp, vy = (p[1] - q[1]) * damp, u = i / (CLOTH_N - 1); q[0] = p[0]; q[1] = p[1];
      const flap = Math.sin(t * 6.3 + i * .9) * Math.abs(wind) * .5 * u; // le vent fait onduler le bas
      p[0] += vx + wind * u * dt2; p[1] += vy + (900 + flap) * dt2; }
    P[0][0] = a[0]; P[0][1] = a[1];
    const link = (p, q, r, wa, wb) => { const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1e-6, k = (L - r) / L; p[0] += dx * k * wa; p[1] += dy * k * wa; q[0] -= dx * k * wb; q[1] -= dy * k * wb; };
    const floor = GROUND - 2, back = j.gx;
    for (let it = 0; it < 4; it++) {
      for (let i = 0; i < CLOTH_N - 1; i++) link(P[i], P[i + 1], c.seg, i === 0 ? 0 : .5, i === 0 ? 1 : .5);
      for (let i = 0; i < CLOTH_N - 2; i++) link(P[i], P[i + 2], c.seg * 1.92, i === 0 ? 0 : .15, i === 0 ? .3 : .15); // un peu de raideur
      for (let i = 1; i < CLOTH_N; i++) { const p = P[i], u = i / (CLOTH_N - 1), lim = c.W[i] / 2 - 2 + 3 * u; // le tissu reste derrière le corps et au-dessus du sol
        if ((p[0] - back) * d > -lim) p[0] = back - d * lim; if (p[1] > floor - 4) p[1] = floor - 4; const top = a[1] + i * c.seg * .2 - 3; if (p[1] < top) p[1] = top; } // jamais au-dessus des épaules
    }
    this.edges(c);
    for (const p of c.O.concat(c.I)) if (p[1] > floor) p[1] = floor;
  },
  kick(f, vx, vy) { const c = f.cloth; if (!c || !c.P) return; for (let i = 1; i < CLOTH_N; i++) { const u = i / (CLOTH_N - 1); c.pP[i][0] -= vx * u / 120; c.pP[i][1] -= vy * u / 120; } }, // élan donné à la cape (px/s)
  copy(c) { return c && { O: c.O.map(p => p.slice()), I: c.I.map(p => p.slice()), W: c.W, d: c.d }; },
  points(c) { return c ? c.O.concat(c.I) : []; },
};
// dessin de la cape simulée : silhouette lissée, dégradé, plis là où le tissu se resserre, galon à l'ourlet
function drawClothCape(g, f, j, L, C) {
  const c = f.cloth, d = f.dir, [ao, ai] = Cloth.anchors(f, j), O = c.O.map(p => p.slice()), I = c.I.map(p => p.slice());
  O[0] = ao; I[0] = ai; // le haut suit exactement les épaules (interpolées au rendu)
  const curve = P => { for (let i = 1; i < P.length - 1; i++) g.quadraticCurveTo(P[i][0], P[i][1], (P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2); g.lineTo(P[P.length - 1][0], P[P.length - 1][1]); };
  const n = CLOTH_N - 1, ho = O[n], hi = I[n], hm = [(ho[0] + hi[0]) / 2, Math.max(ho[1], hi[1]) + 5];
  g.beginPath(); g.moveTo(I[0][0], I[0][1]); g.lineTo(O[0][0], O[0][1]); curve(O);
  g.quadraticCurveTo(hm[0], Math.min(GROUND, hm[1]), hi[0], hi[1]); curve(I.slice().reverse()); g.closePath();
  const bx = Math.min(...O.map(p => p[0] * d)) * d, cg = g.createLinearGradient(bx, 0, ai[0], 0);
  cg.addColorStop(0, shade(L.cape, -.38)); cg.addColorStop(.55, shade(L.cape, -.08)); cg.addColorStop(1, shade(L.cape, .2));
  g.fillStyle = f.flash > 0 ? C(L.cape) : cg; g.fill(); g.strokeStyle = INK; g.lineWidth = INKW; g.stroke();
  if (f.flash > 0) return;
  if (Paint.lite) { g.strokeStyle = C(L.trim); g.globalAlpha = .7; g.lineWidth = 1.6; g.beginPath(); g.moveTo(ho[0], ho[1]); g.quadraticCurveTo(hm[0], Math.min(GROUND, hm[1]), hi[0], hi[1]); g.stroke(); g.globalAlpha = 1; return; } // appareil à la peine : plis omis
  g.save(); g.clip(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { // plis : plus marqués quand le tissu est resserré (largeur < largeur de repos)
    const A0 = O[i], A1 = O[i + 1], A2 = O[Math.min(n, i + 2)], cr = Math.abs((A1[0] - A0[0]) * (A2[1] - A1[1]) - (A1[1] - A0[1]) * (A2[0] - A1[0])) / ((Math.hypot(A1[0] - A0[0], A1[1] - A0[1]) * Math.hypot(A2[0] - A1[0], A2[1] - A1[1])) || 1), squeeze = clamp(cr * 2.2, 0, 1); // plis là où le tissu se courbe
    for (const tt of [.3, .62]) {
      const a0 = [lerp(O[i][0], I[i][0], tt), lerp(O[i][1], I[i][1], tt)], a1 = [lerp(O[i + 1][0], I[i + 1][0], tt + (i % 2 ? .05 : -.05)), lerp(O[i + 1][1], I[i + 1][1], tt)];
      g.strokeStyle = `rgba(0,0,0,${.12 + .32 * squeeze})`; g.lineWidth = 2.2; g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.stroke();
      g.strokeStyle = `rgba(255,240,220,${.05 + .12 * squeeze})`; g.lineWidth = 1; g.beginPath(); g.moveTo(a0[0] + d * 1.6, a0[1]); g.lineTo(a1[0] + d * 1.6, a1[1]); g.stroke();
    }
  }
  g.restore();
  g.strokeStyle = C(L.trim); g.globalAlpha = .7; g.lineWidth = 1.6; g.beginPath(); g.moveTo(ho[0], ho[1]); g.quadraticCurveTo(hm[0], Math.min(GROUND, hm[1]), hi[0], hi[1]); g.stroke(); g.globalAlpha = 1; // galon
  g.fillStyle = C(shade(L.cape, -.2)); g.beginPath(); g.ellipse((ao[0] + ai[0]) / 2, ao[1] + 1, 8, 3.2, 0, 0, 7); g.fill(); // col roulé
  g.fillStyle = C(L.trim); g.beginPath(); g.arc(ai[0], ai[1] + 1, 1.8, 0, 7); g.fill(); // agrafe
}

// ---- visage vivant : clignement, regard qui suit la lame adverse, expressions lissées ----
const Face = {
  // expression du moment : l'action d'abord, puis l'état du corps (souffle, blessure)
  of(f) {
    const st = f.state, hpk = (f.hp || 0) / (f.hpMax || 100), W = f.wounds || {};
    if (st === 'ko') return 'ko';
    if (st === 'win') return 'joie';
    if (st === 'attack' && f.move && f.move.kind !== 'pending') return 'rage';
    if (['hit', 'broken'].includes(st)) return 'pain';
    if (['parried', 'beaten', 'recoil'].includes(st)) return 'surpris';
    if (st === 'feint') return 'ruse';
    if (f.winded) return 'souffle';
    if (hpk < .3 || W.bras || W.jambe || W.torse) return st === 'guard' || st === 'block' ? 'serre' : 'blesse';
    if (st === 'guard' || st === 'block') return 'concentre';
    return 'neutre';
  },
  // sourcils [début, milieu, fin] et paupière inférieure (plissement)
  BROW: { neutre: [-5.2, -6.6, -4.8], concentre: [-5.6, -6, -4.2], rage: [-6.4, -5.6, -3.6], pain: [-4.4, -6.4, -6.6], surpris: [-6.6, -8.2, -6.4], joie: [-5.6, -7, -5.4], souffle: [-4.6, -7, -6.2], blesse: [-4.8, -6.2, -5.8], serre: [-5.8, -5.6, -3.8], ruse: [-5.4, -6.8, -4], ko: [-5, -6.2, -5.4] },
  blink(f) { if (f.state === 'ko') return 1; const per = f.isPlayer ? 3.7 : 4.9, ph = ((G.time + (f.isPlayer ? 0 : 1.7)) % per); return ph < .12 ? Math.sin(ph / .12 * Math.PI) : 0; },
  // le regard : la pupille glisse vers la pointe adverse (repère local de la tête)
  gaze(f, j) { const o = f.opp && f.opp.J; if (!o) return [0, 0]; const dx = (o.tip[0] - j.head[0]) * f.dir, dy = o.tip[1] - j.head[1], L = Math.hypot(dx, dy) || 1; return [clamp(dx / L, -.2, 1) * .45, clamp(dy / L, -1, 1) * .45]; },
  smooth(f, ex) { const tg = this.BROW[ex] || this.BROW.neutre; if (!f.browC) f.browC = tg.slice(); for (let i = 0; i < 3; i++) f.browC[i] = lerp(f.browC[i], tg[i], .3); return f.browC; },
};

// ---- portraits en incrustation : bandeau bref sur le coup critique et le coup décisif ----
const CutIn = {
  cur: null,
  show(f, label, col) { if (!CFG.cutins || G.state === 'demo') return; this.cur = { f, label, col: col || '#d8b25e', t0: performance.now(), dur: 900 }; },
  draw(g, u) {
    const c = this.cur; if (!c) return; const t = (performance.now() - c.t0) / c.dur; if (t >= 1 || !c.f.J) { this.cur = null; return; }
    const f = c.f, left = f.isPlayer, inT = clamp(t / .14, 0, 1), outT = clamp((1 - t) / .18, 0, 1), k = Math.min(inT, outT), e = 1 - Math.pow(1 - k, 3);
    const bh = 92 * u, by = 62 * u, bw = W * .46, x0 = left ? -bw * (1 - e) : W - bw * e;
    g.save(); g.globalAlpha = e;
    g.beginPath(); if (left) { g.moveTo(x0, by); g.lineTo(x0 + bw, by); g.lineTo(x0 + bw - 26 * u, by + bh); g.lineTo(x0, by + bh); } else { g.moveTo(x0 + 26 * u, by); g.lineTo(x0 + bw, by); g.lineTo(x0 + bw, by + bh); g.lineTo(x0, by + bh); } g.closePath();
    const bg = g.createLinearGradient(x0, 0, x0 + bw, 0); bg.addColorStop(left ? 0 : 1, 'rgba(10,6,8,.92)'); bg.addColorStop(left ? 1 : 0, 'rgba(40,18,14,.8)');
    g.fillStyle = bg; g.fill(); g.strokeStyle = c.col; g.lineWidth = 2 * u; g.stroke(); g.clip();
    // visage en gros plan : on redessine la tête du personnage, agrandie, avec son expression du moment
    const hs = 3 * u, hx = left ? x0 + bw * .26 : x0 + bw * .74, hy = by + bh * .74, j = f.J;
    g.save(); g.translate(hx, hy); g.scale(hs, hs); g.translate(-j.head[0] + (left ? 2 : -2) * f.dir, -j.head[1] - 2);
    try { drawHeadS(g, f, j, f.look, x => x); } catch (err) { }
    g.restore();
    g.fillStyle = c.col; g.font = `${Math.round(24 * u)}px "IM Fell English SC", Georgia, serif`; g.textAlign = left ? 'left' : 'right';
    g.fillText(c.label, left ? x0 + bw * .48 : x0 + bw * .52, by + bh * .58);
    g.restore();
  },
};
