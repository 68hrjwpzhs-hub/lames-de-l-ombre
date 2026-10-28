// =============================== profondeur des décors et effets de combat (sprint 7) ===============================
// Décor en trois plans : le fond (murs, ciel, ville) glisse moins vite que le sol quand la caméra bouge (parallaxe),
// un premier plan sombre et flou passe devant aux bords, et la vie de chaque lieu s'anime (fumées, oiseaux, reflets, passants, vouivres).
const FLOOR_Y = 430;
const FG_KIT = { // premier plan : silhouettes sombres aux deux bords, propres à chaque lieu
  salle: (g) => { // rideau de velours à gauche, poteau d'exercice à droite
    g.fillStyle = '#2a0e10'; g.beginPath(); g.moveTo(-40, 0); g.lineTo(70, 0); g.bezierCurveTo(40, 120, 70, 230, 30, 330); g.bezierCurveTo(10, 360, -20, 360, -40, 340); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(120,40,40,.6)'; g.lineWidth = 3; for (const x of [5, 25, 45]) { g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x - 10, 140, x + 10, 230, x - 12, 330); g.stroke(); }
    g.fillStyle = '#1c120c'; g.fillRect(930, 300, 34, 240); g.fillRect(906, 330, 80, 10); g.fillRect(912, 520, 70, 20); },
  eglise: (g) => { // pilier de pierre à gauche, grand chandelier à droite
    g.fillStyle = '#16121a'; g.fillRect(-30, 0, 78, H); g.fillStyle = '#1e1822'; g.fillRect(-36, 300, 92, 18); g.fillRect(-36, 500, 92, 40);
    g.fillStyle = '#18120e'; g.fillRect(926, 330, 8, 210); g.fillRect(898, 330, 64, 6); for (const x of [902, 930, 958]) { g.fillRect(x - 2, 312, 6, 20); g.fillStyle = '#e8dcc4'; g.fillRect(x - 1, 296, 4, 16); g.fillStyle = '#18120e'; } },
  cloitre: (g) => { // oranger en caisse à gauche, pilier d'arcade à droite
    g.fillStyle = '#1e2414'; g.beginPath(); g.arc(38, 370, 62, 0, 7); g.fill(); g.beginPath(); g.arc(78, 400, 44, 0, 7); g.fill(); g.fillStyle = '#2a1c10'; g.fillRect(28, 420, 20, 60); g.fillStyle = '#3a2614'; g.fillRect(-4, 470, 88, 70);
    g.fillStyle = '#c87a20'; for (const [x, y] of [[20, 350], [60, 380], [44, 330], [90, 395]]) { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
    g.fillStyle = '#2a2622'; g.fillRect(918, 0, 80, H); g.fillStyle = '#34302a'; g.fillRect(910, 250, 96, 16); },
  nuit: (g) => { // réverbère à gauche, borne et cordage à droite
    g.fillStyle = '#0e0e16'; g.fillRect(30, 240, 7, 300); g.fillRect(18, 236, 34, 6); g.fillRect(22, 214, 26, 24); g.fillStyle = '#ffc870'; g.fillRect(27, 219, 16, 15);
    g.fillStyle = '#12121c'; g.beginPath(); g.ellipse(940, 500, 26, 40, 0, Math.PI, 0); g.fill(); g.fillRect(914, 500, 52, 40); g.strokeStyle = '#2a2420'; g.lineWidth = 4; g.beginPath(); g.moveTo(914, 486); g.quadraticCurveTo(860, 520, 800, 500); g.stroke(); },
  loggia: (g) => { // souche de cheminée à gauche, pot à feu sur la balustrade à droite
    g.fillStyle = '#2a1416'; g.fillRect(-14, 280, 92, 260); g.fillStyle = '#3a1c1c'; g.fillRect(-20, 272, 104, 14); g.fillStyle = '#1a0c0e'; g.fillRect(8, 252, 18, 24); g.fillRect(40, 256, 18, 20);
    g.fillStyle = '#2c1c18'; g.fillRect(912, 470, 80, 70); g.beginPath(); g.moveTo(924, 470); g.quadraticCurveTo(952, 420, 980, 470); g.fill(); },
};
const Depth = {
  F: .8, on: true, floorC: new WeakMap(), fgC: {}, wyv: null, birds: null, walkers: null,
  floor(bg) { // le sol seul (fondu vers le haut), posé par-dessus le fond décalé
    let c = this.floorC.get(bg); if (c) return c; const k = bg.width / W, y0 = Math.floor((FLOOR_Y - 34) * k);
    c = mkCanvas(bg.width, bg.height - y0); const x = c.getContext('2d'); x.drawImage(bg, 0, y0, bg.width, bg.height - y0, 0, 0, bg.width, bg.height - y0);
    x.globalCompositeOperation = 'destination-in'; const gr = x.createLinearGradient(0, 0, 0, 40 * k); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, '#000'); x.fillStyle = gr; x.fillRect(0, 0, bg.width, bg.height - y0);
    c.y0 = FLOOR_Y - 34; this.floorC.set(bg, c); return c;
  },
  fg(v) { // premier plan, flou et sombre, une fois par lieu
    if (this.fgC[v]) return this.fgC[v]; const k = 1.25, c = mkCanvas(W * k, H * k), x = c.getContext('2d'); x.scale(k, k);
    x.filter = 'blur(3px)'; (FG_KIT[v] || (() => { }))(x); x.filter = 'none'; return this.fgC[v] = c;
  },
  shift(cam, f) { return [(cam.x - W / 2) * (1 - f), (cam.y - H / 2) * (1 - f) * .5]; },
  // fond (parallaxe) + vie du lieu + lumières, puis le sol au premier plan du décor
  drawBack(g, v, cam, t) {
    const bg = venueCanvas(v); if (!this.on) { g.drawImage(bg, 0, 0, W, H); drawVenueLights(g, v, t); return; }
    const [dx, dy] = this.shift(cam, this.F);
    g.save(); g.translate(dx + W / 2, dy + H / 2); g.scale(1.02, 1.02); g.translate(-W / 2, -H / 2); g.drawImage(bg, 0, 0, W, H); this.life(g, v, t); drawVenueLights(g, v, t); g.restore();
    const fl = this.floor(bg); g.drawImage(fl, 0, 0, fl.width, fl.height, 0, fl.y0, W, H - fl.y0);
  },
  drawFront(g, v, cam) { if (!this.on || !FG_KIT[v]) return; const [dx, dy] = this.shift(cam, 1.32), c = this.fg(v); g.save(); g.globalAlpha = .9; g.drawImage(c, 0, 0, c.width, c.height, dx, dy, W, H); g.restore(); },
  // vie du lieu : quelques éléments animés, dessinés à faible coût
  life(g, v, t) {
    const R = rng(7), puff = (x0, y0, col, a) => { for (let i = 0; i < 6; i++) { const ph = (t * .12 + i / 6) % 1, r = 6 + ph * 20; g.globalAlpha = a * (1 - ph) * Math.min(1, ph * 6); g.fillStyle = col; g.beginPath(); g.arc(x0 + Math.sin(t * .6 + i) * 5 + ph * 30, y0 - ph * 95, r, 0, 7); g.fill(); } g.globalAlpha = 1; };
    const birds = (n, y, sp, col) => { for (let i = 0; i < n; i++) { const x = ((t * sp + i * 137) % (W + 200)) - 100, yy = y + Math.sin(t * 1.3 + i * 2) * 10 + i * 7, w = Math.sin(t * 9 + i) * 3; g.strokeStyle = col; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - 6, yy - w); g.lineTo(x, yy); g.lineTo(x + 6, yy - w); g.stroke(); } };
    const wyv = (period, y, s, col, rim) => { const ph = (t % period) / 12; if (ph > 1) return; if (ph > .2 && ph < .8 && G.state === 'fight') Codex.unlock('vouivres'); const dir = Math.floor(t / period) % 2 ? 1 : -1, x = dir > 0 ? -80 + ph * (W + 160) : W + 80 - ph * (W + 160); wyvern(g, x, y + Math.sin(ph * 9) * 12, s, dir, (Math.sin(t * 5) + 1) / 2, col, rim); };
    if (v === 'loggia') { puff(140, 296, 'rgb(220,190,180)', .16); puff(520, 312, 'rgb(220,190,180)', .14); puff(830, 296, 'rgb(230,190,170)', .1); birds(4, 150, 34, 'rgba(40,24,36,.55)'); wyv(38, 120, .5, '#3a2030', 'rgba(255,190,140,.5)');
      for (let i = 0; i < 14; i++) { const x = 650 + R() * 240, y = 334 + R() * 9, a = .25 + .25 * Math.sin(t * 3 + i * 1.7); g.fillStyle = `rgba(255,236,200,${a})`; g.fillRect(x + Math.sin(t + i) * 3, y, 6 + R() * 10, .8); } }
    else if (v === 'nuit') { for (let i = 0; i < 22; i++) { const y = 336 + R() * 56, w = 8 + R() * 26, a = (.15 + .4 * (Math.sin(t * 2.2 + i * 2.3) + 1) / 2) * (1 - Math.abs(y - 345) / 80); g.fillStyle = `rgba(210,220,255,${a})`; g.fillRect(760 - w / 2 + Math.sin(t * .8 + i) * 18, y, w, 1.2); }
      wyv(44, 90, .45, '#0a0c18', 'rgba(200,210,255,.4)'); const m = g.createLinearGradient(0, 360, 0, 430); m.addColorStop(0, 'rgba(120,130,170,0)'); m.addColorStop(.5, `rgba(120,130,170,${.07 + .03 * Math.sin(t * .4)})`); m.addColorStop(1, 'rgba(120,130,170,0)'); g.fillStyle = m; g.fillRect(0, 360, W, 70); }
    else if (v === 'cloitre') { birds(5, 120, 26, 'rgba(60,60,70,.6)'); if (!this.walkR) this.walkR = rng(99);
      for (let i = 0; i < 2; i++) { const sp = 18 + i * 7, x = ((t * sp + i * 420) % (W + 120)) - 60, dir = i ? -1 : 1, xx = dir > 0 ? x : W - x; g.save(); g.globalAlpha = .7; g.translate(0, Math.abs(Math.sin(t * 4 + i)) * -1.5); person(g, xx, 404, 30, i ? 'dame' : 'bourgeois', rng(5 + i), { dir }); g.restore(); } }
    else if (v === 'eglise') { for (let i = 0; i < 3; i++) { const x = ((t * (6 + i * 3) + i * 300) % (W + 300)) - 150; const gr = g.createRadialGradient(x, 230 + i * 40, 0, x, 230 + i * 40, 160); gr.addColorStop(0, `rgba(200,190,220,${.06 + .02 * Math.sin(t + i)})`); gr.addColorStop(1, 'rgba(200,190,220,0)'); g.fillStyle = gr; g.fillRect(x - 160, 70 + i * 40, 320, 320); } }
    else if (v === 'salle') { const a = .05 + .04 * Math.sin(t * .25); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,240,210,${a})`; g.beginPath(); g.moveTo(150, 60); g.lineTo(250, 60); g.lineTo(420, 430); g.lineTo(260, 430); g.closePath(); g.fill(); g.restore(); }
  },
  // ---- effets de combat ----
  impact: null,
  hitFx(at, kind) { this.impact = { x: at[0], y: at[1], t0: performance.now(), kind }; }, // image d'impact (temps réel : indépendante du ralenti)
  drawImpact(g) {
    const I = this.impact; if (!I) return; const age = (performance.now() - I.t0) / 1000; if (age > .14) { this.impact = null; return; }
    const u = age / .14, strong = I.kind !== 'block', col = I.kind === 'parry' ? '255,236,170' : I.kind === 'break' ? '255,190,140' : I.kind === 'block' ? '220,235,255' : '255,220,200';
    g.save(); if (age < .045 && strong) { g.fillStyle = 'rgba(8,4,8,.45)'; g.fillRect(-40, -40, W + 80, H + 80); } // image d'impact : un instant le monde s'assombrit
    g.globalCompositeOperation = 'lighter'; glow(g, I.x, I.y, 70 + u * 60, `rgba(${col},A)`, (1 - u) * (strong ? .9 : .5));
    g.strokeStyle = `rgba(${col},${(1 - u) * .85})`; g.lineWidth = 2; const n = strong ? 14 : 8, r0 = 14 + u * 30, r1 = 50 + u * 90;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + (i % 2) * .2, rr = r1 * (i % 3 ? .7 : 1); g.beginPath(); g.moveTo(I.x + Math.cos(a) * r0, I.y + Math.sin(a) * r0); g.lineTo(I.x + Math.cos(a) * rr, I.y + Math.sin(a) * rr); g.stroke(); }
    g.restore();
  },
  // reflet qui glisse le long des lames au repos, de temps en temps
  glint(g, f, t) {
    if (!f.J || f.state === 'ko' || f.disarmed) return; const per = 2.6, ph = ((t + (f.isPlayer ? 0 : 1.3)) % per) / .32; if (ph > 1) return;
    const j = f.J, x = lerp(j.wr[0], j.tip[0], .15 + ph * .8), y = lerp(j.wr[1], j.tip[1], .15 + ph * .8), a = Math.sin(ph * Math.PI);
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(255,255,255,${.85 * a})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + 6, y); g.moveTo(x, y - 6); g.lineTo(x, y + 6); g.stroke(); glow(g, x, y, 8, 'rgba(255,255,240,A)', .7 * a); g.restore();
  },
  // poussière soulevée par une fente qui se pose, ou une réception de pas rapide
  dust: [],
  kick(x, n, dir) { for (let i = 0; i < n; i++) this.dust.push({ x: x + rand(-8, 8), y: GROUND - 2, vx: rand(10, 70) * dir + rand(-20, 20), vy: rand(-40, -10), r: rand(4, 9), life: rand(.45, .8), max: .8 }); },
  stepDust(dt) { this.dust = this.dust.filter(p => (p.life -= dt) > 0); for (const p of this.dust) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .94; p.vy *= .95; p.r += 18 * dt; } },
  drawDust(g, v) { if (Paint.lite) return; const col = v === 'nuit' ? '120,120,150' : v === 'eglise' ? '150,140,140' : '170,150,120'; for (const p of this.dust) { g.fillStyle = `rgba(${col},${.28 * p.life / p.max})`; g.beginPath(); g.ellipse(p.x, p.y, p.r * 1.4, p.r * .7, 0, 0, 7); g.fill(); } },
  watch(f) { // déclenche la poussière quand la fente se pose, ou à la fin d'un pas rapide
    const m = f.move, key = f.state === 'attack' && m && m.lunge > 50 ? 'L' + m.id : f.state === 'dash' ? 'D' + f.dash.dur + f.t.toFixed(0) : null;
    if (f.state === 'attack' && m && m.lunge > 50 && f.t >= m.wu + m.act * .5 && f.dustId !== m.id) { f.dustId = m.id; this.kick(f.feet.f.x, 7, f.dir); }
    if (f.state === 'dash' && f.t >= f.dash.dur * .85 && f.dustDash !== f.dash) { f.dustDash = f.dash; this.kick((f.feet.f.x + f.feet.b.x) / 2, 4, -f.dir * f.dash.s); }
    void key;
  },
};
