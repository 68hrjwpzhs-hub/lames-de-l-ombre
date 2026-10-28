
// =============================== rendu peint : lumière, matière, atmosphère ===============================
// Les personnages sont d'abord dessinés dans un canevas à part, puis éclairés selon le décor :
// ombre propre du côté opposé à la lumière, lumière principale, contre-jour sur le bord éclairé,
// lueur des bougies et torches proches, grain de peinture. Le décor est peint en haute définition,
// adouci au loin, glacé d'une teinte et recouvert d'un grain de toile ; un vignettage unifie le tout.
const LIGHTING = {
  // from : direction vers la source principale (x vers la droite de l'écran, y vers le haut négatif)
  loggia: { from: [.75, -.45], key: '255,176,110', keyA: .13, shade: '46,18,48', shadeA: .5, rim: '255,196,130', rimA: .95, amb: '255,150,100', ambA: .06, cast: [.55, .26], castA: .2, glaze: 'rgba(120,60,40,.10)' },
  eglise: { from: [0, -1], key: '150,170,255', keyA: .14, shade: '8,6,22', shadeA: .48, rim: '170,190,255', rimA: .8, amb: '60,50,110', ambA: .1, cast: [0, .3], castA: .22, glaze: 'rgba(30,20,60,.14)' },
  salle: { from: [-.35, -.94], key: '255,246,226', keyA: .16, shade: '40,26,22', shadeA: .42, rim: '255,248,232', rimA: .7, amb: '255,220,180', ambA: .05, cast: [.18, .22], castA: .18, glaze: 'rgba(110,70,30,.08)' },
  cloitre: { from: [-.6, -.8], key: '255,250,236', keyA: .18, shade: '40,40,70', shadeA: .4, rim: '255,252,240', rimA: .75, amb: '150,180,220', ambA: .07, cast: [.5, .3], castA: .2, glaze: 'rgba(60,70,90,.06)' },
  nuit: { from: [.55, -.83], key: '170,190,255', keyA: .2, shade: '6,8,26', shadeA: .52, rim: '190,205,255', rimA: .75, amb: '40,50,120', ambA: .12, cast: [-.3, .2], castA: .22, glaze: 'rgba(20,30,70,.16)' },
};
const Paint = {
  get on() { return CFG.paint && !this.off; }, off: false, kMax: clamp(+store.get('ct2d.kmax', 2) || 2, 1, 2), good: 0, k: 1, tSum: 0, tN: 0, A: null, B: null, Sh: null, grain: null, vig: null, vigK: '',
  canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; },
  init() {
    // grain de toile et touches de pinceau (motif répété)
    const R = rng(91), n = 256, c = this.canvas(n, n), g = c.getContext('2d');
    g.fillStyle = 'rgb(128,128,128)'; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 2600; i++) { const v = R() < .5 ? 0 : 255; g.strokeStyle = `rgba(${v},${v},${v},${.03 + R() * .05})`; g.lineWidth = .6 + R() * 1.6; const x = R() * n, y = R() * n, a = -.5 + R() * .3, l = 3 + R() * 9; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    for (let y = 0; y < n; y += 2) { g.fillStyle = `rgba(0,0,0,${.025 + R() * .02})`; g.fillRect(0, y, n, 1); } // trame de la toile
    for (let x = 0; x < n; x += 2) { g.fillStyle = `rgba(255,255,255,${.015 + R() * .02})`; g.fillRect(x, 0, 1, n); }
    this.grain = c;
    const c2 = this.canvas(n, n), g2 = c2.getContext('2d'); // touches transparentes, posées sur les personnages
    for (let i = 0; i < 1400; i++) { const v = R() < .7 ? '20,12,16' : '255,246,226'; g2.strokeStyle = `rgba(${v},${.02 + R() * .045})`; g2.lineWidth = .8 + R() * 2.2; const x = R() * n, y = R() * n, a = -.9 + R() * .5, l = 4 + R() * 10; g2.beginPath(); g2.moveTo(x, y); g2.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g2.stroke(); }
    this.strokes = c2;
    const c3 = this.canvas(9, 9), g3 = c3.getContext('2d'); g3.strokeStyle = 'rgba(22,13,10,.9)'; g3.lineWidth = 1.1; g3.beginPath(); g3.moveTo(-1, 10); g3.lineTo(10, -1); g3.moveTo(-1, 1); g3.lineTo(1, -1); g3.moveTo(8, 10); g3.lineTo(10, 8); g3.stroke(); this.hatch = c3; // hachure d'encre
  },
  ensure(k) {
    const fighting = typeof G !== 'undefined' && (G.state === 'fight' || G.state === 'ko');
    if (this.bgStale && !fighting) { this.bgStale = false; for (const key in BGS) delete BGS[key]; } // décors refaits à la nouvelle définition entre deux manches, jamais en plein combat
    k = Math.round(clamp(k, 1, this.kMax) * 4) / 4;
    if (k === this.k && this.A) return; this.k = k;
    this.A = this.canvas(Math.ceil(640 * k), Math.ceil(520 * k)); this.B = this.canvas(this.A.width, this.A.height); this.Cs = this.canvas(this.A.width, this.A.height);
    this.Sh = this.canvas(Math.ceil(640 / 6), Math.ceil(520 / 6));
    if (fighting) this.bgStale = true; else for (const key in BGS) delete BGS[key];
  },
  // ---- rendu direct : le personnage est tracé directement sur l'image, éclairé par ses propres volumes ----
  // (teinte d'ambiance du lieu, modelé de chaque membre selon la lumière du lieu, liseré de contre-jour, ombre portée simple) :
  // aucune passe de composition hors écran, 3 à 4 fois moins coûteux que le rendu « cinéma » composé.
  TINT: { loggia: [[255, 150, 100], .12, .04], eglise: [[60, 50, 110], .18, .12], salle: [[255, 220, 180], .06, .02], cloitre: [[150, 180, 220], .08, .02], nuit: [[40, 50, 120], .24, .2] },
  mode: (store.get('ct2d.rmode', '') || ((typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches) ? 'direct' : 'cinema')),
  actor(g, f, venue, time) { if (!this.on) { drawFighter(g, f); return; } if (this.mode === 'direct') this.direct(g, f, venue, time); else this.fighter(g, f, venue, time); },
  direct(g, f, venue, time) {
    const Lt = LIGHTING[venue] || LIGHTING.salle, j = f.J || f.joints(), d = f.dir, T = this.TINT[venue] || this.TINT.salle, tint = { key: venue, rgb: T[0], mix: T[1], dark: T[2] };
    LIGHT[0] = Lt.from[0]; LIGHT[1] = Lt.from[1];
    // ombre portée : une longue tache douce couchée dans la direction opposée à la lumière
    if (f.state !== 'ko') { const [skx, sky] = Lt.cast, sx = (f.feet.f.x + f.feet.b.x) / 2, hgt = Math.max(60, j.gy - j.head[1] + 70), len = hgt * sky * 1.6;
      g.save(); g.globalAlpha = Lt.castA * 1.2; g.translate(sx - skx * len * .5, GROUND + 2); g.scale(1, .22); const r = Math.max(30, Math.abs(skx) * hgt * .9 + 34);
      const sg = g.createRadialGradient(0, 0, 4, 0, 0, r); sg.addColorStop(0, 'rgba(0,0,0,.55)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sg; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.restore(); }
    drawFighter(g, f, { shadowOnly: true });
    if (G.weather === 'rain' && f.state !== 'ko') { g.save(); g.globalAlpha = .14; g.transform(1, 0, 0, -.5, 0, GROUND * 1.5 + 2); RIM.a = 0; drawFighter(g, f, { bare: true, tint }); g.restore(); } // reflet sur les pavés mouillés
    drawTrail(g, f);
    const flash = f.flash > 0, exec = f.state === 'attack' && f.move && f.move.kind !== 'pending' && f.t > f.move.wu - .03 && f.t < f.move.wu + f.move.act + .04, dash = f.state === 'dash' && f.t < .18;
    if (!flash && (exec || dash) && !this.lite) { const dx = (dash ? -f.dash.s : -1) * d; RIM.a = 0; g.save(); g.globalAlpha = .16; g.translate(dx * 9, 0); drawFighter(g, f, { bare: true, tint }); g.restore(); } // sillage de mouvement
    RIM.col = `rgb(${Lt.rim})`; RIM.a = flash ? .2 : Math.min(.75, Lt.rimA * .7); RIM.gy = j.gy - 10; if (this.rich && this.strokes) { if (!this.strokePat) this.strokePat = g.createPattern(this.strokes, 'repeat'); RIM.pat = this.strokePat; } // touches peintes : seulement si l'appareil a de la marge (réglage automatique)
    const im = Depth.impact, age = im ? (performance.now() - im.t0) / 1000 : 9; if (age < .16 && Math.abs(im.x - f.x) < 160) { RIM.col = 'rgb(255,226,170)'; RIM.a = .95 * (1 - age / .16) + RIM.a * age / .16; } // l'étincelle éclaire les combattants proches
    drawFighter(g, f, { bare: true, tint });
    RIM.a = 0; RIM.gy = 0; RIM.pat = null;
    void time;
  },
  // ---- personnage éclairé ----
  fighter(g, f, venue, time) {
    const Lt = LIGHTING[venue] || LIGHTING.salle, j = f.J || f.joints(), k = this.k, d = f.dir; LIGHT[0] = Lt.from[0]; LIGHT[1] = Lt.from[1];
    // cadre autour du personnage (articulations, pointe, coiffe, cape)
    const pts = [j.head, j.tip, j.wr, j.el, j.sh, j.bwr, j.bel, j.fl.foot, j.bl.foot, j.fl.knee, j.bl.knee, [j.gx, j.gy]];
    if (f.cloth && f.cloth.O) pts.push(...Cloth.points(f.cloth)); let x0 = 1e9, x1 = -1e9, y0 = 1e9; for (const p of pts) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); }
    x0 = Math.floor(x0 - 52); x1 = Math.ceil(x1 + 52); y0 = Math.floor(y0 - 50); const y1 = GROUND + 14;
    const bw = Math.min(640, x1 - x0), bh = Math.min(520, y1 - y0); if (x1 - x0 > 640) x0 = Math.round((x0 + x1) / 2 - 320); if (y1 - y0 > 520) y0 = y1 - 520;
    const pw = Math.ceil(bw * k), ph = Math.ceil(bh * k), A = this.A.getContext('2d'), B = this.B.getContext('2d'), CsC = this.Cs.getContext('2d');
    for (const c of [A, B, CsC]) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.beginPath(); c.rect(0, 0, pw + 2, ph + 2); c.clip(); } // toutes les passes bornées à la boîte du personnage (−22 % mesuré)
    A.setTransform(1, 0, 0, 1, 0, 0); A.globalCompositeOperation = 'source-over'; A.globalAlpha = 1; A.clearRect(0, 0, pw + 2, ph + 2);
    A.setTransform(k, 0, 0, k, -x0 * k, -y0 * k); drawFighter(A, f, { bare: true });
    const Cs = this.Cs.getContext('2d'); Cs.setTransform(1, 0, 0, 1, 0, 0); Cs.globalCompositeOperation = 'copy'; Cs.drawImage(this.A, 0, 0, pw, ph, 0, 0, pw, ph); Cs.globalCompositeOperation = 'source-in'; Cs.fillStyle = INK; Cs.fillRect(0, 0, pw, ph); Cs.globalCompositeOperation = 'source-over'; // silhouette à l'encre, réutilisée
    A.setTransform(k, 0, 0, k, -x0 * k, -y0 * k);
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.max(bw, bh) * .55, fx = Lt.from[0], fy = Lt.from[1];
    const flash = f.flash > 0;
    LIGHT[0] = fx; LIGHT[1] = fy; // modelé des membres selon la lumière du décor
    // 1. ombre propre : le côté qui tourne le dos à la lumière, et le bas du corps (moins de lumière d'en haut)
    A.globalCompositeOperation = 'source-atop';
    let gr = A.createLinearGradient(cx + fx * R, cy + fy * R, cx - fx * R, cy - fy * R);
    gr.addColorStop(0, `rgba(${Lt.shade},0)`); gr.addColorStop(.45, `rgba(${Lt.shade},${Lt.shadeA * .25})`); gr.addColorStop(1, `rgba(${Lt.shade},${Lt.shadeA})`);
    A.fillStyle = gr; A.fillRect(x0, y0, bw, bh);
    gr = A.createLinearGradient(0, j.gy - 40, 0, GROUND); gr.addColorStop(0, `rgba(${Lt.amb},${Lt.ambA})`); gr.addColorStop(1, `rgba(${Lt.shade},${Lt.shadeA * .45})`);
    A.fillStyle = gr; A.fillRect(x0, y0, bw, bh);
    if (ART === 'bd') { // hachures d'encre dans les ombres (côté opposé à la lumière, et bas du corps)
    B.setTransform(1, 0, 0, 1, 0, 0); B.globalCompositeOperation = 'source-over'; B.globalAlpha = 1; B.clearRect(0, 0, pw + 2, ph + 2);
    B.fillStyle = B.createPattern(this.hatch, 'repeat'); B.fillRect(0, 0, pw, ph);
    B.setTransform(k, 0, 0, k, -x0 * k, -y0 * k); B.globalCompositeOperation = 'destination-in';
    let hg = B.createLinearGradient(cx + fx * R, cy + fy * R, cx - fx * R, cy - fy * R); hg.addColorStop(0, 'rgba(0,0,0,0)'); hg.addColorStop(.52, 'rgba(0,0,0,0)'); hg.addColorStop(.62, 'rgba(0,0,0,.85)'); hg.addColorStop(1, 'rgba(0,0,0,1)');
    B.fillStyle = hg; B.fillRect(x0, y0, bw, bh);
    B.setTransform(1, 0, 0, 1, 0, 0); B.drawImage(this.Cs, 0, 0, pw, ph, 0, 0, pw, ph);
    A.setTransform(1, 0, 0, 1, 0, 0); A.globalAlpha = flash ? .15 : .42; A.drawImage(this.B, 0, 0, pw, ph, 0, 0, pw, ph); A.globalAlpha = 1;
    A.setTransform(k, 0, 0, k, -x0 * k, -y0 * k);
    }
    // 2. lumière principale et lueurs proches : glacis lumineux posé sur la silhouette
    gr = A.createLinearGradient(cx + fx * R, cy + fy * R, cx - fx * R * .1, cy - fy * R * .1); gr.addColorStop(0, `rgba(${Lt.key},${Lt.keyA})`); gr.addColorStop(1, `rgba(${Lt.key},0)`);
    A.fillStyle = gr; A.fillRect(x0, y0, bw, bh);
    const v = VENUES[venue];
    if (v && v.lights) v.lights.forEach(([lx, ly, lr, col], i) => {
      const rr = lr * 4.2; if (Math.hypot(lx - cx, ly - cy) > rr + R * .8) return;
      const fl = .8 + .12 * Math.sin(time * 9 + i * 2.1) + .08 * Math.sin(time * 23 + i);
      const lg = A.createRadialGradient(lx, ly, 0, lx, ly, rr); lg.addColorStop(0, col.replace('A', .2 * fl)); lg.addColorStop(.5, col.replace('A', .06 * fl)); lg.addColorStop(1, col.replace('A', 0));
      A.fillStyle = lg; A.fillRect(x0, y0, bw, bh);
    });
    // 3. matière : touches de pinceau
    A.setTransform(1, 0, 0, 1, 0, 0);
    // 4. contre-jour : liseré clair sur le bord tourné vers la lumière
    B.setTransform(1, 0, 0, 1, 0, 0); B.globalCompositeOperation = 'copy'; B.globalAlpha = 1; B.drawImage(this.Cs, 0, 0, pw, ph, 0, 0, pw, ph);
    B.globalCompositeOperation = 'source-in'; B.fillStyle = `rgb(${Lt.rim})`; B.fillRect(0, 0, pw, ph);
    B.globalCompositeOperation = 'destination-out'; const t = 2.2 * k; B.drawImage(this.Cs, 0, 0, pw, ph, -fx * t, -fy * t, pw, ph);
    A.globalAlpha = Lt.rimA * (flash ? .5 : 1); A.globalCompositeOperation = 'lighter'; A.drawImage(this.B, 0, 0, pw, ph, 0, 0, pw, ph);
    A.globalAlpha = 1; A.globalCompositeOperation = 'source-over';
    // ombre portée douce (silhouette à basse définition, couchée sur le sol)
    if (f.state !== 'ko') {
      const S = this.Sh.getContext('2d'), sw = Math.ceil(bw / 6), sh = Math.ceil(bh / 6);
      S.setTransform(1, 0, 0, 1, 0, 0); S.globalCompositeOperation = 'source-over'; S.clearRect(0, 0, this.Sh.width, this.Sh.height);
      S.drawImage(this.A, 0, 0, pw, ph, 0, 0, sw, sh); S.globalCompositeOperation = 'source-in'; S.fillStyle = '#000'; S.fillRect(0, 0, sw, sh);
      const [skx, sky] = Lt.cast; g.save(); g.globalAlpha = Lt.castA;
      g.transform(1, 0, -skx, -sky, 0, GROUND * (1 + sky)); // y' = GROUND + (GROUND - y)·sky, x' = x + (GROUND - y)·skx
      g.translate(skx * GROUND, 0); g.drawImage(this.Sh, 0, 0, sw, sh, x0, y0, bw, bh); g.restore();
    }
    drawFighter(g, f, { shadowOnly: true });
    if (G.weather === 'rain' && f.state !== 'ko') { g.save(); g.globalAlpha = .17; g.transform(1, 0, 0, -.5, 0, GROUND * 1.5 + 2); g.drawImage(this.A, 0, 0, pw, ph, x0, y0, bw, bh); g.restore(); } // reflet sur les pavés mouillés
    drawTrail(g, f);
    // contour d'encre de la silhouette : trait fin côté lumière, épais côté ombre
    if (ART === 'bd') for (let i = 0; i < 4; i++) { const an = i / 4 * Math.PI * 2 + .785, ca = Math.cos(an), sa = Math.sin(an), r = 1 + 1.5 * Math.max(0, -(ca * fx + sa * fy)); g.drawImage(this.Cs, 0, 0, pw, ph, x0 + ca * r, y0 + sa * r, bw, bh); }
    if (ART !== 'bd' && !flash) { // flou de mouvement : sillage du corps pendant l'exécution d'un coup ou un pas rapide
      const exec = f.state === 'attack' && f.move && f.move.kind !== 'pending' && f.t > f.move.wu - .03 && f.t < f.move.wu + f.move.act + .04, dash = f.state === 'dash' && f.t < .18;
      if (exec || dash) { const dx = (dash ? -f.dash.s : -1) * f.dir; g.save(); g.globalAlpha = .2; g.drawImage(this.A, 0, 0, pw, ph, x0 + dx * 8, y0, bw, bh); g.globalAlpha = .09; g.drawImage(this.A, 0, 0, pw, ph, x0 + dx * 17, y0, bw, bh); g.restore(); }
    }
    g.drawImage(this.A, 0, 0, pw, ph, x0, y0, bw, bh);
    for (const c of [A, B, CsC]) c.restore();
    void d;
  },
  // si l'appareil peine (moyenne > 14 ms par image en combat), on baisse la définition, puis on revient au rendu simple
  // régulateur : moyenne du vrai temps entre deux images sur 90 images ; la définition baisse ou remonte d'un palier (0,25),
  // le rendu cinéma n'est jamais coupé ; le palier appris est gardé pour la session suivante
  measure(ms) {
    this.tSum += ms; if (++this.tN < 90) return; const avg = this.tSum / this.tN; this.tSum = 0; this.tN = 0;
    // choix du rendu des personnages : composé (cinéma) si l'appareil tient la cadence, sinon direct ; le choix est gardé pour la suite
    if (this.mode === 'cinema' && avg > 19 && this.kMax <= 1.25) { this.mode = 'direct'; store.set('ct2d.rmode', 'direct'); this.fast = 0; return; }
    if (this.mode === 'direct') { this.lite = avg > 19; this.rich = avg < 12.5; if (avg < 10.5) { if (++this.fast >= 8) { this.fast = 0; this.mode = 'cinema'; this.kMax = 1.25; store.set('ct2d.kmax', 1.25); store.set('ct2d.rmode', 'cinema'); } } else this.fast = 0; return; }
    if (avg > 19 && this.kMax > 1) { this.kMax = Math.max(1, this.kMax - .25); this.good = 0; store.set('ct2d.kmax', this.kMax); }
    else if (avg < 15.5 && this.kMax < 2) { if (++this.good >= 4) { this.good = 0; this.kMax = Math.min(2, this.kMax + .25); store.set('ct2d.kmax', this.kMax); } }
    else this.good = 0;
  },
  // ---- finition de l'image entière : vignettage et grain de toile ----
  // vignettage et grain posés en calque CSS au-dessus du canevas : le compositeur du navigateur les superpose gratuitement (une image plein écran de moins à dessiner)
  css() {
    const v = typeof document !== 'undefined' && document.getElementById('vig'); if (!v) return false;
    if (!this.cssOk) { if (!this.film) { const c = this.canvas(200, 200), fg = c.getContext('2d'), R = rng(35); for (let i = 0; i < 2600; i++) { fg.fillStyle = R() < .5 ? `rgba(0,0,0,${.18 + R() * .25})` : `rgba(255,245,230,${.12 + R() * .2})`; fg.fillRect(R() * 200, R() * 200, 1, 1); } this.film = c; }
      const c2 = this.canvas(200, 200), x = c2.getContext('2d'); x.globalAlpha = .35; x.drawImage(this.film, 0, 0);
      v.style.backgroundImage = `radial-gradient(ellipse 62% 62% at 50% 48%, rgba(10,6,8,0) 52%, rgba(10,6,8,.16) 78%, rgba(10,6,8,.52) 100%), url(${c2.toDataURL()})`; this.cssOk = true; }
    v.hidden = false; return true;
  },
  finish(g) {
    if (ART !== 'bd' && !this.noCss && this.css()) return;
    if (!this.vig) { const c = this.canvas(W, H), v = c.getContext('2d'), gr = v.createRadialGradient(W / 2, H * .46, H * .32, W / 2, H * .5, W * .62); gr.addColorStop(0, 'rgba(10,6,8,0)'); gr.addColorStop(.7, 'rgba(10,6,8,.16)'); gr.addColorStop(1, 'rgba(10,6,8,.52)'); v.fillStyle = gr; v.fillRect(0, 0, W, H); this.vig = c; }
    if (ART === 'bd') { g.drawImage(this.vig, 0, 0, W, H); return; }
    // vignettage et grain fusionnés une fois pour toutes en 4 images, tirées tour à tour (un seul dessin par image : −25 % mesuré)
    if (!this.fin) { if (!this.film) { const c = this.canvas(200, 200), fg = c.getContext('2d'), R = rng(35); for (let i = 0; i < 2600; i++) { fg.fillStyle = R() < .5 ? `rgba(0,0,0,${.18 + R() * .25})` : `rgba(255,245,230,${.12 + R() * .2})`; fg.fillRect(R() * 200, R() * 200, 1, 1); } this.film = c; }
      this.fin = [0, 1, 2, 3].map(i => { const c = this.canvas(W, H), x = c.getContext('2d'); x.drawImage(this.vig, 0, 0); x.globalAlpha = .35; x.fillStyle = x.createPattern(this.film, 'repeat'); x.translate(-[0, 71, 133, 37][i], -[0, 113, 59, 167][i]); x.fillRect(0, 0, W + 200, H + 200); return c; }); this.finI = 0; }
    this.finI = (this.finI + 1) % 8; g.drawImage(this.fin[this.finI >> 1], 0, 0, W, H);
  },
  // ---- décor : haute définition, lointain adouci, glacis, grain ----
  venue(k, key) {
    const k2 = this.k, c = this.canvas(Math.round(W * k2), Math.round(H * k2)), g = c.getContext('2d');
    g.setTransform(k2, 0, 0, k2, 0, 0); VENUES[key].draw(g);
    // lointain adouci : copie floutée (réduction puis agrandissement) fondue vers le haut
    const s = this.canvas(W / 4, H / 4), sg = s.getContext('2d'); sg.imageSmoothingQuality = 'high'; sg.drawImage(c, 0, 0, W / 4, H / 4);
    const m = this.canvas(c.width, c.height), mg = m.getContext('2d'); mg.imageSmoothingQuality = 'high'; mg.drawImage(s, 0, 0, m.width, m.height);
    mg.globalCompositeOperation = 'destination-in'; const fade = mg.createLinearGradient(0, 0, 0, m.height); fade.addColorStop(0, 'rgba(0,0,0,.32)'); fade.addColorStop(.62, 'rgba(0,0,0,.22)'); fade.addColorStop(.8, 'rgba(0,0,0,0)'); mg.fillStyle = fade; mg.fillRect(0, 0, m.width, m.height);
    g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(m, 0, 0);
    g.setTransform(k2, 0, 0, k2, 0, 0);
    // perspective atmosphérique : le fond se fond dans l'air
    const Lt = LIGHTING[key] || LIGHTING.salle; const air = g.createLinearGradient(0, 0, 0, GROUND - 30); air.addColorStop(0, `rgba(${Lt.amb},.0)`); air.addColorStop(.75, `rgba(${Lt.amb},.07)`); air.addColorStop(1, `rgba(${Lt.amb},0)`); g.fillStyle = air; g.fillRect(0, 0, W, GROUND);
    // glacis et touches de pinceau
    g.fillStyle = Lt.glaze; g.globalCompositeOperation = 'multiply'; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(160,118,60,.12)'; g.fillRect(0, 0, W, H); // vernis ambré des vieux maîtres
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = .5; g.fillStyle = g.createPattern(this.grain, 'repeat'); g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; craquelure(g, 1633);
    g.setTransform(1, 0, 0, 1, 0, 0); if (ART === 'bd') inkVenue(c); else cineVenue(c, key);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    void k; return c;
  },
};

// ---- décor façon case de BD : aplats de couleur, encrage des contours, hachures dans les ombres ----
function inkVenue(c) {
  const w = c.width, h = c.height, g = c.getContext('2d'); let im;
  try { im = g.getImageData(0, 0, w, h); } catch (e) { return; }
  const d = im.data, n = w * h, L = new Float32Array(n);
  for (let i = 0, p = 0; i < n; i++, p += 4) L[i] = (d[p] * .3 + d[p + 1] * .59 + d[p + 2] * .11) / 255;
  // luminance adoucie (deux passes de flou en boîte) pour n'encrer que les vrais contours
  const B = new Float32Array(n), T = new Float32Array(n), r = Math.max(1, Math.round(w / 960));
  for (let y = 0; y < h; y++) { let acc = 0; const o = y * w; for (let x = -r; x <= r; x++) acc += L[o + clamp(x, 0, w - 1)]; for (let x = 0; x < w; x++) { T[o + x] = acc / (2 * r + 1); acc += L[o + Math.min(w - 1, x + r + 1)] - L[o + Math.max(0, x - r)]; } }
  for (let x = 0; x < w; x++) { let acc = 0; for (let y = -r; y <= r; y++) acc += T[clamp(y, 0, h - 1) * w + x]; for (let y = 0; y < h; y++) { B[y * w + x] = acc / (2 * r + 1); acc += T[Math.min(h - 1, y + r + 1) * w + x] - T[Math.max(0, y - r) * w + x]; } }
  const hs = Math.max(5, Math.round(6 * w / 960)), ink = [22, 13, 10];
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x, p = i * 4;
    const gx = B[i - w + 1] + 2 * B[i + 1] + B[i + w + 1] - B[i - w - 1] - 2 * B[i - 1] - B[i + w - 1];
    const gy = B[i + w - 1] + 2 * B[i + w] + B[i + w + 1] - B[i - w - 1] - 2 * B[i - w] - B[i - w + 1];
    const e = Math.sqrt(gx * gx + gy * gy);
    // aplats : on rapproche chaque couleur de paliers francs
    for (let k = 0; k < 3; k++) { const v = d[p + k], q = Math.round(v / 36) * 36; d[p + k] = v * .55 + q * .45; }
    let a = clamp((e - .11) / .16, 0, 1) * .85; // encre des contours
    const l = B[i];
    if (l < .3 && (x + y) % hs === 0) a = Math.max(a, (.3 - l) / .3 * .55); // hachures dans les ombres
    if (l < .16 && (x - y + 9999 * hs) % hs === 0) a = Math.max(a, (.16 - l) / .16 * .5); // contre-hachures dans les noirs
    if (a > 0) { d[p] = d[p] * (1 - a) + ink[0] * a; d[p + 1] = d[p + 1] * (1 - a) + ink[1] * a; d[p + 2] = d[p + 2] * (1 - a) + ink[2] * a; }
  }
  g.putImageData(im, 0, 0);
}

// ---- décor de cinéma : profondeur de champ (le fond se brouille, le sol des duellistes reste net) et étalonnage ----
function cineVenue(c, key) {
  const w = c.width, h = c.height, g = c.getContext('2d');
  const s = mkCanvas(w / 6, h / 6), sg = s.getContext('2d'); sg.imageSmoothingQuality = 'high'; sg.drawImage(c, 0, 0, s.width, s.height);
  const s2 = mkCanvas(w / 3, h / 3), s2g = s2.getContext('2d'); s2g.imageSmoothingQuality = 'high'; s2g.drawImage(s, 0, 0, s2.width, s2.height);
  const m = mkCanvas(w, h), mg = m.getContext('2d'); mg.imageSmoothingQuality = 'high'; mg.drawImage(s2, 0, 0, w, h);
  mg.globalCompositeOperation = 'destination-in'; const f = mg.createLinearGradient(0, 0, 0, h); f.addColorStop(0, 'rgba(0,0,0,.7)'); f.addColorStop(.55, 'rgba(0,0,0,.6)'); f.addColorStop(.74, 'rgba(0,0,0,.15)'); f.addColorStop(.8, 'rgba(0,0,0,0)'); f.addColorStop(.95, 'rgba(0,0,0,0)'); f.addColorStop(1, 'rgba(0,0,0,.3)');
  mg.fillStyle = f; mg.fillRect(0, 0, w, h); g.drawImage(m, 0, 0);
  // étalonnage : ombres froides, hautes lumières chaudes, contraste un peu relevé
  g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgb(226,232,238)'; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'screen'; g.fillStyle = 'rgba(255,170,100,.05)'; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over'; void key;
}
// ---- particules d'atmosphère : poussière dans la lumière, encens, braises des lanternes, pluie de pollen ----
const ATMOS = { salle: ['255,240,210', 60, -6, 1], eglise: ['190,190,255', 50, -4, 1], nuit: ['255,160,70', 34, -22, 2], loggia: ['255,200,150', 40, -5, 1], cloitre: ['255,250,220', 30, 4, 1] };
Paint.atmos = function (g, venue, t) {
  const a = ATMOS[venue]; if (!a) return; const [col, n, vy, kind] = a;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const h1 = hash1(i * 3.7 + 1), h2 = hash1(i * 5.3 + 2), h3 = hash1(i * 7.1 + 3), sp = .4 + h3;
    let x = (h1 * W + Math.sin(t * .4 * sp + i) * 30 + t * 6 * (h2 - .5)) % W; if (x < 0) x += W;
    let y = ((h2 * H + t * vy * sp) % H + H) % H; if (kind === 2) y = 300 - ((t * 18 * sp + h2 * 200) % 200) + Math.sin(t * 2 + i) * 4; // braises qui montent des lanternes
    if (kind === 2) x = (i % 2 ? 126 : 866) + Math.sin(t * 1.3 + i) * 18 * sp + (h1 - .5) * 30;
    const tw = .5 + .5 * Math.sin(t * 2.3 * sp + i * 1.7), r = kind === 2 ? 1.6 : 1 + h3 * 1.4, al = (kind === 2 ? .7 : .35) * tw;
    const q = g.createRadialGradient(x, y, 0, x, y, r * 3); q.addColorStop(0, `rgba(${col},${al})`); q.addColorStop(1, `rgba(${col},0)`); g.fillStyle = q; g.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  }
  g.restore();
};
