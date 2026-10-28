
// =============================== jeu ===============================
const G = {
  time: 0, state: 'menu', mode: 'duel', level: 'duelliste', exercise: 'parade', round: 1, wins: [0, 0], timer: 60, banner: null,
  hitStop: 0, slowT: 0, shake: 0, zoom: 0, sparks: [], rings: [], texts: [], sfxs: [], blood: [], stains: [], flash: 0, silent: false, side: 1,
  record: store.get('ct2d.record', { w: 0, l: 0 }),
  init() {
    this.cv = $('c'); this.g = this.cv.getContext('2d'); computeReach();
    const st = store.get('ct2d.settings', {}); if (st.pw && PARRY_PRESETS[st.pw]) { this.pw = st.pw; CFG.perfect = PARRY_PRESETS[st.pw]; } else { this.pw = 'normale'; CFG.perfect = PARRY_PRESETS.normale; } setRipZone(this.pw);
    CFG.music = st.music !== false; CFG.sfx = st.sfx !== false; CFG.blood = st.blood !== false; CFG.paint = st.paint !== false; CFG.breath = st.breath !== false; CFG.cutins = st.cutins !== false; CFG.finisher = st.finisher !== false; CFG.bigText = !!st.bigText; CFG.bigBtn = !!st.bigBtn; CFG.cueShape = !!st.cueShape; this.a11y(); this.venuePref = st.venue && (st.venue === 'aleatoire' || VENUES[st.venue]) ? st.venue : 'aleatoire'; this.venue = 'loggia'; if (st.level) this.level = st.level; if (st.ex && EXERCISES[st.ex]) this.exercise = st.ex;
    this.p = new Fighter(true, LOOKS.player); this.e = new Fighter(false, LOOKS.duelliste); this.p.opp = this.e; this.e.opp = this.p;
    this.p.reset(300); this.e.reset(660);
    this.ai = new AI(this.e, this.p, 'duelliste'); this.demoAI = new AI(this.p, this.e, 'duelliste');
    this.resize(); addEventListener('resize', () => this.resize());
    Paint.init(); Input.init(); this.ui(); Perf.init(); PWA.init(); Replay.init(); Career.init(); Codex.init(); Manuscrit.init(); Menu.init(); Run.init(); Story.init(); V2.init(); Creator.init(); Music.init(); Music.play('menu'); this.last = performance.now(); this.acc = 0;
    requestAnimationFrame(t => this.frame(t));
  },
  resize() {
    const sw = innerWidth, sh = innerHeight, s = Math.min(sw / W, sh / H), dpr = Math.min(devicePixelRatio || 1, 2);
    this.cv.style.width = W * s + 'px'; this.cv.style.height = H * s + 'px'; { const v = $('vig'); if (v) { v.style.width = W * s + 'px'; v.style.height = H * s + 'px'; } } this.cv.width = Math.round(W * s * dpr); this.cv.height = Math.round(H * s * dpr);
    this.scale = s * dpr; $('rotate').hidden = !(Input.touch && sh > sw);
  },
  saveSettings() { store.set('ct2d.settings', { breath: CFG.breath, lefty: !!this.lefty, pw: this.pw, music: CFG.music, sfx: CFG.sfx, blood: CFG.blood, paint: CFG.paint, cutins: CFG.cutins, finisher: CFG.finisher, bigText: CFG.bigText, bigBtn: CFG.bigBtn, cueShape: CFG.cueShape, venue: this.venuePref, level: this.level, ex: this.exercise }); },
  ui() {
    const sel = (box, v) => box.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x.dataset.v === v));
    $('lvls').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { this.level = b.dataset.v; sel($('lvls'), this.level); $('exBox').hidden = this.level !== 'training'; Snd.init(); Snd.step(); this.saveSettings(); }));
    sel($('lvls'), this.level); $('exBox').hidden = this.level !== 'training';
    const exs = $('exs'); for (const k in EXERCISES) { const b = document.createElement('button'); b.className = 'opt small'; b.dataset.v = k; b.textContent = EXERCISES[k].name; exs.appendChild(b);
      b.addEventListener('click', () => { this.exercise = k; sel(exs, k); $('exDesc').textContent = EXERCISES[k].desc; this.saveSettings(); }); }
    sel(exs, this.exercise); $('exDesc').textContent = EXERCISES[this.exercise].desc;
    $('pw').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { this.pw = b.dataset.v; CFG.perfect = PARRY_PRESETS[this.pw]; setRipZone(this.pw); sel($('pw'), this.pw); this.saveSettings(); }));
    sel($('pw'), this.pw);
    { const b = $('optLefty'), st = store.get('ct2d.settings', {}); this.lefty = !!st.lefty; document.body.classList.toggle('lefty', this.lefty); b.setAttribute('aria-pressed', this.lefty);
      b.addEventListener('click', () => { this.lefty = !this.lefty; document.body.classList.toggle('lefty', this.lefty); b.setAttribute('aria-pressed', this.lefty); Snd.init(); this.saveSettings(); }); } // mode gaucher : commandes en miroir
    for (const [id, k] of [['optMusic', 'music'], ['optSfx', 'sfx'], ['optBlood', 'blood'], ['optPaint', 'paint'], ['optBreath', 'breath'], ['optCutin', 'cutins'], ['optFin', 'finisher'], ['optText', 'bigText'], ['optBig', 'bigBtn'], ['optCue', 'cueShape']]) { const b = $(id); b.setAttribute('aria-pressed', CFG[k]); b.addEventListener('click', () => { CFG[k] = !CFG[k]; b.setAttribute('aria-pressed', CFG[k]); Snd.init(); this.a11y(); if (k === 'blood' && !CFG.blood) { this.blood = []; this.stains = []; } if (k === 'paint') { Paint.off = false; Paint.kMax = 2; for (const v in BGS) delete BGS[v]; } this.saveSettings(); }); }
    const vb = $('venues'); for (const k of ['aleatoire', ...VENUE_KEYS]) { const b = document.createElement('button'); b.className = 'opt small'; b.dataset.v = k; b.textContent = k === 'aleatoire' ? 'Aléatoire' : VENUES[k].name; vb.appendChild(b);
      b.addEventListener('click', () => { this.venuePref = k; sel(vb, k); if (k !== 'aleatoire') this.venue = k; this.saveSettings(); }); }
    sel(vb, this.venuePref); if (this.venuePref !== 'aleatoire') this.venue = this.venuePref;
    $('go').addEventListener('click', () => this.startMatch());
    $('demo').addEventListener('click', () => Demo.start());
    $('demoQuit').addEventListener('click', () => Demo.stop());
    $('demoNext').addEventListener('click', () => Demo.next());
    $('again').addEventListener('click', () => { if (this.overAction === 'bracket') Career.showBracket(); else if (this.overAction === 'tourneys') Career.showTourneys(); else this.startMatch(this.matchOpts); });
    $('overMenu').addEventListener('click', () => this.toMenu());
    $('resume').addEventListener('click', () => this.resume());
    $('quit').addEventListener('click', () => this.toMenu());
    $('bPause').addEventListener('click', () => this.pause());
    if (Input.touch) $('kbHelp').hidden = true;
    this.showRecord();
  },
  showRecord() { $('record').textContent = `Palmarès : ${this.record.w} victoire${this.record.w > 1 ? 's' : ''} · ${this.record.l} défaite${this.record.l > 1 ? 's' : ''}`; },
  show(id) { if (id) Ambiance.stop(); ['menu', 'pause', 'over', 'tourney', 'market', 'bracket', 'creator', 'run', 'savebox', 'story', 'storyEnd', 'codex', 'manus'].forEach(s => $(s).hidden = s !== id); $('touch').hidden = !(Input.touch && (this.state === 'fight' || this.state === 'round')); $('demoBar').hidden = this.state !== 'demo'; },
  startMatch(opts = {}) {
    if (opts instanceof Event) opts = {};
    Snd.init(); this.wins = [0, 0]; this.round = 1; this.matchOpts = opts; this.overAction = null; this.winsNeeded = opts.wins || 2; this.endWhy = null;
    this.mode = opts.mode || (this.level === 'training' ? 'training' : 'duel'); this.fixedVenue = opts.venue || null;
    this.p.slow = (Run.has('vive') ? .88 : 1) * curHero().speed; this.demoAI = null; this.p.resetStats(); this.e.resetStats();
    const o = opts.opp; this.e.phase2 = false; this.favKind = null; this.e.arch = (o && o.arch) || null; this.e.sig = (o && o.sig) || null; this.p.arch = curHero().arch || null;
    this.e.look = o ? Object.assign({}, o.look, { name: o.name }) : LOOKS[this.level];
    applyAvatar(); this.p.rapier = RAPIERS[Save.data.equipped] || RAPIERS.heros; this.e.rapier = RAPIERS[o ? o.rapier : LEVEL_RAPIER[this.level]];
    this.ai = this.mode === 'training' ? new Coach(this.e, this.p, this.exercise) : new AI(this.e, this.p, o ? o.level : this.level, o && Object.assign({}, o.tweak, o.arch ? { arch: o.arch } : {}));
    this.blood = []; this.stains = []; this.drops = []; this.hats = [];
    Music.play('combat');
    this.startRound();
  },
  pickVenue() { if (this.fixedVenue) { this.venue = this.fixedVenue; return; } if (this.venuePref !== 'aleatoire') { this.venue = this.venuePref; return; } const others = VENUE_KEYS.filter(k => k !== this.venue); this.venue = pick(others); },
  startRound() {
    Replay.rec = []; Replay.last = null; if ($('bReplay')) $('bReplay').hidden = true;
    if (!this.hintSeen) { this.hintSeen = true; const n = store.get('ct2d.fights', 0) + 1; store.set('ct2d.fights', n); const h = $('stickHint'); if (h) h.hidden = n > 3; } // l'aide « pas rapide » ne s'affiche qu'aux trois premiers duels
    this.pickVenue(); venueCanvas(this.venue); const amb = Ambiance.setup();
    this.p.reset(300); this.e.reset(660); this.side = 1; this.timer = amb.timer; this.sparks = []; this.texts = []; this.sfxs = []; this.rings = []; this.blood = []; this.stains = [];
    if (this.ai.reset) this.ai.reset();
    this.p.firstHit = false; this.p.firstHitR = false; this.cine = 0;
    if (this.mode === 'run') { this.p.hp = this.p.hpShow = Run.cur.hp; this.e.hp = this.e.hpShow = RUN_FOE_HP[Run.cur.stage]; }
    if (this.mode === 'story' && this.matchOpts.hp != null && this.round === 1) { this.p.hp = this.p.hpShow = this.matchOpts.hp; }
    const rt = this.mode === 'run' ? Run.cur.tiers[Run.cur.stage] : null;
    this.state = 'round'; this.banner = { text: this.mode === 'training' ? EXERCISES[this.exercise].name : rt ? (rt.boss ? 'Dernier duel' : `Duel ${Run.cur.stage + 1}`) : `Manche ${this.round}`, sub: this.mode === 'training' ? 'Entraînement' : rt ? this.e.look.name + (amb.sub ? ' · ' + amb.sub : '') : amb.sub || 'En garde…', t: 0, dur: 1.6 };
    Snd.bell(); this.show(null);
    this.p.idleStyle = Cine.salutOf(this.p); this.e.idleStyle = Cine.salutOf(this.e);
    if (this.mode !== 'training') { geste(this.p, Cine.salutOf(this.p)); geste(this.e, Cine.salutOf(this.e)); } // le salut avant chaque manche
  },
  toMenu() {
    this.state = 'menu'; this.mode = 'duel'; this.timeScale = 1; this.e.arch = null; this.e.sig = null; this.storyGuet = false; this.winsNeeded = 2; $('scene').hidden = true; this.weather = 'clear'; this.guet = false; Ambiance.stop(); this.fixedVenue = null; this.p.rapier = this.e.rapier = RAPIERS.garnison; Music.play('menu'); Career.refresh(); this.p.reset(300); this.e.reset(660); this.drops = []; this.hats = []; this.e.look = LOOKS.duelliste; this.p.slow = 1;
    this.demoAI = new AI(this.p, this.e, 'duelliste'); this.ai = new AI(this.e, this.p, 'maitre'); this.pickVenue(); this.show('menu'); this.showRecord();
  },
  pause() { if (this.state === 'replay') { Replay.stop(); return; } if (this.state !== 'fight') return; this.state = 'pause'; this.show('pause');
    const L = this.mode === 'story' && Story.cur && LESSONS[Story.cur.c.id], pl = $('pauseLesson'); if (pl) { pl.hidden = !L; if (L) pl.textContent = `Leçon · ${L.name} : ${L.tip} Défi : ${L.label}.`; }
    const pr = $('pauseReplay'); if (pr) { pr.hidden = !Replay.last; pr.onclick = () => { this.resume(); Replay.start(); }; }
    const ml = $('pauseMovesList'), src = document.querySelector('#help .moves'); if (ml && src && !ml.childElementCount) ml.innerHTML = src.innerHTML;
  },
  resume() { this.state = 'fight'; this.show(null); Snd.rain(this.weather === 'rain'); },

  // ---- boucle à pas fixe (120 Hz) ----
  frame(now) {
    requestAnimationFrame(t => this.frame(t));
    const rdt = Math.min(.1, (now - this.last) / 1000); this.last = now;
    if (this.state === 'replay') { Replay.update(rdt); if (this.state === 'replay') { Replay.render(rdt); return; } }
    if (this.state !== 'pause') {
      let scale = (this.state === 'demo' ? Demo.speed() : 1) * (this.state === 'fight' || this.state === 'round' ? (this.timeScale || 1) : 1); // duel lent
      if (this.hitStop > 0) { this.hitStop -= rdt; scale *= .08; } else if (this.slowT > 0) { this.slowT -= rdt; scale *= .4; }
      this.acc += rdt * scale; let n = 0;
      while (this.acc >= 1 / 120 && n++ < 12) { this.acc -= 1 / 120; this.step(1 / 120); }
      this.nSteps = Math.min(n, 12);
    }
    const r0 = performance.now(); this.render(rdt); const cpu = performance.now() - r0;
    if (this.state === 'fight' && Paint.on) Paint.measure(rdt * 1000); if (typeof GL !== 'undefined') GL.watch(rdt * 1000); // le régulateur juge le vrai temps entre deux images
    Perf.sample(rdt * 1000, cpu, this.state === 'pause' ? 2 : (this.nSteps || 0));
  },
  simulate(sec) { const s = this.silent; this.silent = true; for (let i = 0; i < sec * 120; i++) { this.hitStop = 0; this.slowT = 0; this.step(1 / 120); if (this.state === 'over') break; } this.silent = s; },
  clearIntent(f) { const it = f.intent; it.dx = 0; it.guard = false; it.act = null; it.dash = 0; it.holdAtk = false; it.rip = false; },
  step(dt) {
    this.time += dt; const p = this.p, e = this.e;
    if (this.state === 'fight') Replay.record();
    Story.step(); Codex.step(); Manuscrit.step(); if (this.state === 'fight') this.tells();
    for (const h of this.hats || (this.hats = [])) if (!h.rest) { h.vy += 900 * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.a += h.va * dt; if (h.y > GROUND - 3) { h.y = GROUND - 3; h.vy *= -.25; h.vx *= .5; h.va *= .4; if (Math.abs(h.vy) < 30) { h.rest = true; h.a = 0; } } }
    for (const r of this.drops || (this.drops = [])) if (!r.rest) { // rapière lâchée : chute, rebond sur le sol, puis à plat
      r.vy += 900 * dt; r.cx += r.vx * dt; r.cy += r.vy * dt; r.ang += r.va * dt;
      const ey = Math.abs(Math.sin(r.ang)) * r.L / 2, gy = GROUND - 3;
      if (r.cy + ey > gy) { r.cy = gy - ey; if (r.vy > 60) { if (!r.bounced) { r.bounced = true; Snd.clatter(); } else Snd.tick(); } r.vy = -r.vy * .28; r.vx *= .6; r.va = r.va * .4 + (Math.cos(r.ang) * Math.sin(r.ang) > 0 ? -2.5 : 2.5); if (Math.abs(r.vy) < 25 && Math.abs(Math.sin(r.ang)) < .06) { r.rest = true; r.vy = 0; } }
      if (r.cy + ey >= gy - .5 && Math.abs(r.vy) < 40) { const tgt = Math.round(r.ang / Math.PI) * Math.PI; r.ang += (tgt - r.ang) * Math.min(1, dt * 8); r.va *= .8; r.vx *= .9; if (Math.abs(r.ang - tgt) < .01) r.rest = true; } }
    if (this.state === 'menu') { this.demoAI.think(dt); this.ai.think(dt); }
    else if (this.state === 'fight') { for (const f of [p, e]) if (f.state === 'cine') f.setState('idle'); Input.apply(p, dt); this.ai.think(dt); if (this.mode !== 'training') { this.timer -= dt; if (this.timer <= 0) Ambiance.timeUp(); } }
    else if (this.state === 'demo') Demo.step(dt);
    else if (this.state === 'finish') { this.clearIntent(p); this.clearIntent(e); Finisher.step(dt); }
    else { this.clearIntent(p); this.clearIntent(e); if (this.state === 'scene') Cine.step(dt); if (this.state === 'round') { this.banner.t += dt; if (this.banner.t >= this.banner.dur) { this.state = 'fight'; this.banner = { text: 'Allez !', t: 0, dur: .7 }; Snd.clang(false); for (const f of [p, e]) if (f.state === 'cine') f.setState('idle'); } } }
    Ambiance.step(dt);
    p.update(dt); e.update(dt); if (this.state === 'scene') Cine.fixFacing();
    this.contacts();
    this.spacing();
    for (const f of [p, e]) f.hpShow = f.hpShow > f.hp ? Math.max(f.hp, f.hpShow - dt * 40) : f.hp;
    
    if (this.mode === 'training' || this.state === 'demo') for (const f of [p, e]) if (f.hp < 30 && !f.busy) { f.hp = 100; f.hpShow = 100; }
    if (this.banner && this.state !== 'round') { this.banner.t += dt; if (this.banner.t > this.banner.dur) this.banner = null; }
    if (this.state === 'menu' && (p.state === 'ko' || e.state === 'ko')) { this.koT = (this.koT || 0) + dt; if (this.koT > 2.5) { this.koT = 0; p.reset(300); e.reset(660); this.drops = []; this.hats = []; } }
    for (const f of [p, e]) if (f.winT !== null && this.time - f.winT > .6 && f.opp.state === 'ko' && !f.busy) { f.setState('win'); f.winT = null; }
    if (this.state === 'ko') { this.koT += dt; if (this.koT > 2.4) this.afterRound(); }
    Depth.stepDust(dt); Depth.watch(p); Depth.watch(e);
    this.sparks = this.sparks.filter(s => (s.life -= dt) > 0); for (const s of this.sparks) { s.vy += 900 * dt; s.x += s.vx * dt; s.y += s.vy * dt; }
    this.rings = this.rings.filter(r => (r.life -= dt) > 0); for (const r of this.rings) r.r += r.v * dt;
    this.texts = this.texts.filter(t => (t.life -= dt) > 0); for (const t of this.texts) t.y -= 26 * dt;
    this.sfxs = this.sfxs.filter(t => (t.life -= dt) > 0);
    // sang : gouttes balistiques qui laissent des taches au sol
    for (const b of this.blood) { b.vy += 900 * dt; b.x += b.vx * dt; b.y += b.vy * dt; if (b.y >= b.floor) { b.dead = true; if (this.stains.length < 90) this.stains.push({ x: b.x, y: b.floor, rx: b.r * rand(1.8, 3.6), ry: b.r * rand(.5, .9), a: .8 }); } }
    this.blood = this.blood.filter(b => !b.dead);
    for (const s of this.stains) { if (s.grow && s.rx < s.max) { s.rx += dt * 14; s.ry = s.rx * .22; } s.a -= dt * .012; }
    this.stains = this.stains.filter(s => s.a > 0);
  },
  // gouttes de sang projetées dans le sens du coup (touches sévères seulement)
  bleed(at, dir, n, force = 1) {
    if (!CFG.blood) return;
    for (let i = 0; i < n; i++) this.blood.push({ x: at[0] + rand(-3, 3), y: at[1] + rand(-3, 3), vx: dir * rand(60, 280) * force + rand(-50, 50), vy: -rand(40, 300) * force, r: rand(1.2, 3.4), floor: GROUND + rand(-4, 26) });
  },
  // ---- les corps ne se traversent jamais : distance minimale, ordre gauche/droite conservé, murs ----
  spacing() {
    if (this.state === 'scene' || this.state === 'finish') return; // en scène et pendant la finale, les acteurs se croisent librement
    const p = this.p, e = this.e, s = this.side;
    let d = (e.x - p.x) * s;
    if (d < MINDIST) { const over = MINDIST - d; // celui qui avance (attaque, pas en avant) cède davantage
      const pushP = p.state === 'attack' || (p.state === 'dash' && p.dash.s > 0) ? .7 : e.state === 'attack' || (e.state === 'dash' && e.dash.s > 0) ? .3 : .5;
      p.x -= s * over * pushP; e.x += s * over * (1 - pushP); }
    const lo = this.state === 'scene' ? -200 : 50, hi = this.state === 'scene' ? W + 200 : W - 50; // en scène, on entre et on sort du cadre
    p.x = clamp(p.x, lo, hi); e.x = clamp(e.x, lo, hi);
    d = (e.x - p.x) * s;
    if (d < MINDIST) { // coincé contre un mur : on repousse l'autre
      if (s > 0) { if (p.x <= lo + .01) e.x = p.x + MINDIST; else p.x = e.x - MINDIST; }
      else { if (e.x <= lo + .01) p.x = e.x + MINDIST; else e.x = p.x - MINDIST; }
    }
  },
  // ---- contacts : la lame dessinée (de la pointe au premier tiers, balayée depuis l'image précédente) contre les zones du corps ----
  contacts() {
    const ev = [], p = this.p, e = this.e;
    this.engagement();
    for (const a of [p, e]) if (a.state === 'attack' && a.move.kind === 'beat' && !a.move.done && a.t >= a.move.wu + a.move.act * .5) this.beatCheck(a);
    for (const a of [p, e]) {
      if (a.state !== 'attack') continue; const m = a.move;
      if (!m.dmg) continue; // le battement ne touche que la lame
      if (m.done || a.t < m.wu || a.t > m.wu + m.act + .05) continue; // la pointe finit son extension pendant les premières images de récupération
      const d = a.opp; if (d.state === 'ko' || m.dodged) continue;
      if (d.state === 'esquive' && d.t >= ESQ.a && d.t <= ESQ.b && a.dist() <= (REACH[m.kind] || REACH.jab) + 25) { this.dodge(a, d, a.J.tip); continue; } // la lame part pendant l'esquive, à portée : elle passe là où le corps n'est plus
      if (Math.abs(a.pose.bz || 0) > 40) continue; // lame hors du plan (moulinet au-dessus de la tête) : elle passe au-dessus, elle ne peut pas toucher
      // estoc : la lame à partir du premier cinquième ; fente lourde (coup de taille) : toute la lame, y compris son milieu balayé
      const MM = MOVES[m.kind], claw = (J0) => { const dx = J0.bwr[0] - J0.bel[0], dy = J0.bwr[1] - J0.bel[1], l = Math.hypot(dx, dy) || 1; return { wr: J0.bel, tip: [J0.bwr[0] + dx / l * 14, J0.bwr[1] + dy / l * 14] }; };
      const j = MM.claw ? claw(a.J) : a.J, pj = MM.claw ? claw(a.prevJ || a.J) : (a.prevJ || j), u = m.kind === 'heavy' || MM.cut ? .05 : MM.claw ? .3 : .2;
      const base = [lerp(j.wr[0], j.tip[0], u), lerp(j.wr[1], j.tip[1], u)];
      const mid = [lerp(j.wr[0], j.tip[0], .55), lerp(j.wr[1], j.tip[1], .55)], pmid = [lerp(pj.wr[0], pj.tip[0], .55), lerp(pj.wr[1], pj.tip[1], .55)];
      let best = null;
      for (const [c1, c2, r] of d.hurt()) {
        const s1 = segDist(base, j.tip, c1, c2), s2 = segDist(pj.tip, j.tip, c1, c2), s3 = segDist(pmid, mid, c1, c2);
        let s = s1.d < s2.d ? s1 : s2; if (s3.d < s.d) s = s3;
        if (s.d <= r && (!best || s.d < best.d)) best = s;
      }
      if (best && d.state === 'esquive' && d.t >= ESQ.a && d.t <= ESQ.b) { this.dodge(a, d, best.p); continue; } // la lame passe là où le corps n'est plus
      if (best) ev.push({ a, d, at: best.p });
    }
    if (ev.length === 2) {
      const li = ev.findIndex(v => v.a.move.kind === 'lie');
      const ok = li >= 0 && ev[1 - li].a.move.kind !== 'lie' && (STRAIGHT.includes(ev[1 - li].a.move.kind) || DEROB.includes(ev[1 - li].a.move.kind));
      if (!ok) return this.doubleHit(ev);
      // une prise de fer contre une attaque : l'une domine l'autre (opposition ou dérobement), pas de coup double
      const lie = ev[li], other = ev[1 - li], order = DEROB.includes(other.a.move.kind) ? [lie, other] : [other, lie];
      for (const v of order) if (v.a.state === 'attack' && !v.a.move.done) this.resolve(v.a, v.d, v.at);
      return;
    }
    if (ev.length === 0 && p.state === 'attack' && e.state === 'attack' && p.phase() === 'exec' && e.phase() === 'exec' && !p.move.done && !e.move.done && p.move.dmg && e.move.dmg) {
      const c = segDist(p.J.wr, p.J.tip, e.J.wr, e.J.tip); if (c.d < 5) return this.clash(c.p);
    }
    for (const v of ev) if (v.a.state === 'attack' && !v.a.move.done) this.resolve(v.a, v.d, v.at);
  },
  resolve(a, d, at) {
    const m = a.move, M = MOVES[m.kind], now = this.time; m.done = true; m.contact = true;
    // prise de fer contre dérobement : la pointe adverse passe sous la lame, la prise ne trouve rien
    if (m.kind === 'lie' && d.state === 'attack' && DEROB.includes(d.move.kind)) return this.derob(a, d, 'Dérobement !');
    // attaque directe contre une prise de fer engagée : l'opposition la dévie
    if (STRAIGHT.includes(m.kind) && d.state === 'attack' && d.move.kind === 'lie' && !d.move.done && d.t > d.move.wu * .5) {
      a.setState('clash', .34); a.kb = -a.dir * 110; d.stats.opp = (d.stats.opp || 0) + 1;
      const bp = segDist(d.J.wr, d.J.tip, a.J.tip, a.J.tip).p; this.spark(bp, 18, '#fff0c8'); this.ring(bp, '#e6dcc4', 160, .25); Snd.clang(false); this.shake = 4; this.hitStop = .04;
      this.say('Opposition !', [bp[0], bp[1] - 30], '#e6dcc4', 22); this.event('opposition', { a, d }); return;
    }
    if (m.kind === 'lie' && d.guarding && now - (d.lastLiedT || -9) >= BEAT_WARY) { // la prise de fer domine la lame en garde et file jusqu'au corps ; seule la parade au bon moment la défait
      const win = (d.isPlayer ? CFG.perfect : CFG.perfectAI) * M.pw + (d.isPlayer && Input.usingTouch ? CFG.touchBonus : 0) + (d.rapier ? d.rapier.guard : 0) + (d.isPlayer && Run.has('lynx') ? .05 : 0) + (heroOf(d) ? heroOf(d).parry : 0) + (d.hp < 30 ? DESPAIR : 0);
      const early = now - d.pressT, perfect = d.perfectOk && early <= win, bp = segDist(d.J.wr, d.J.tip, a.J.tip, a.J.tip).p;
      if (perfect) return this.parry(a, d, bp, { a, d, m, early, win, perfect, mashed: false });
      d.lastLiedT = now; this.spark(bp, 12, '#fff0c8'); Snd.tick(); this.say('Prise de fer !', [bp[0], bp[1] - 34], '#ffd27a', 22);
      return this.hit(a, d, at, { a, d, m, early, win, throughGuard: true });
    }
    if (d.guarding) {
      // une seule garde : tenue elle bloque, levée au bon moment elle pare et riposte ; seule la fente lourde la brise
      const win = (d.isPlayer ? CFG.perfect : CFG.perfectAI) * M.pw + (d.isPlayer && Input.usingTouch ? CFG.touchBonus : 0) + (d.rapier ? d.rapier.guard : 0) + (d.isPlayer && Run.has('lynx') ? .05 : 0) + (heroOf(d) ? heroOf(d).parry : 0) + (d.hp < 30 ? DESPAIR : 0);
      const early = now - d.pressT, perfect = m.kind !== 'riposte' && d.perfectOk && early <= win;
      const bp = segDist(d.J.wr, d.J.tip, a.J.tip, a.J.tip).p;
      const info = { a, d, m, early, win, perfect, mashed: !d.perfectOk && early <= win };
      if (perfect) return this.parry(a, d, bp, info);
      if (M.breaks) return this.breakGuard(a, d, bp, info);
      return this.block(a, d, bp, info);
    }
    return this.hit(a, d, at, { a, d, m, early: now - d.pressT, noGuard: true });
  },
  // esquive réussie : l'attaque est perdue (elle finira dans le vide), l'esquiveur gagne le contre (bouton Attaque doré)
  dodge(a, d, at) {
    const m = a.move, E = d.esq, perfect = d.t - ESQ.a <= ESQ.perfect; m.dodged = true; if (perfect) d.stats.esqPerfect = (d.stats.esqPerfect || 0) + 1; E.dodged = m.id; E.perfect = perfect;
    d.ripOffer = { t0: this.time, end: this.time + RIP_WIN, esq: true }; d.stats.esqOk = (d.stats.esqOk || 0) + 1;
    Depth.kick(d.feet.b.x, 6, -d.dir); Snd.swish(1.5);
    if (perfect) { this.slowT = Math.max(this.slowT, .12); this.zoom = Math.max(this.zoom, .04); Snd.ding(); }
    this.say(perfect ? 'Esquive parfaite !' : 'Esquive !', [d.x, GROUND - 236], perfect ? '#ffd76a' : '#e6eef6', perfect ? 24 : 20);
    this.event('esquive', { a, d, m, perfect });
  },
  // dégâts d'une touche, avantages de la Nuit de Paris compris
  dmgFor(a, d, m) {
    let v = m.dmg;
    const ha = heroOf(a), hd = heroOf(d);
    if (ha) { v *= ha.dmg; if (m.kind === 'riposte' && ha.ripBonus) v += ha.ripBonus; if (m.kind === 'heavy' && ha.heavyMul) v *= ha.heavyMul; if (ha.firstHit && !a.firstHitR) { v *= ha.firstHit; this.say('Coup de l\'ombre', [d.x, GROUND - 262], '#c9d6e2', 18); } a.firstHitR = true; }
    if (hd) v *= hd.resist;
    if (a.isPlayer) { if (m.kind === 'riposte' && Run.has('riposte')) v += 6; if (Run.has('poigne')) v *= 1.15; if (Run.has('botte') && !a.firstHit) { v *= 2; this.say('Botte secrète !', [d.x, GROUND - 250], '#ffd27a', 22); } a.firstHit = true; }
    else if (Run.has('buffle')) v *= .85;
    if (d.arch === 'drac') v *= .82; // les écailles amortissent
    return Math.round(v);
  },
  parry(a, d, bp, info) {
    Depth.hitFx(bp, 'parry');
    if (d.isPlayer && Run.has('sangfroid')) d.hp = Math.min(100, d.hp + 5);
    if (heroOf(d) && heroOf(d).parryHeal) d.hp = Math.min(100, d.hp + heroOf(d).parryHeal);
    const m = a.move; a.parriedLow = m.line === 'basse'; a.setState('parried', m.kind === 'heavy' ? .8 : .62); a.kb = -a.dir * 70; d.stats.perfect++;
    this.spark(bp, 30, '#fff3c8'); this.ring(bp, '#fff3c8', 260); this.ring(bp, '#ffd27a', 150, .45);
    Snd.clang(true); this.hitStop = .05; this.slowT = .16; this.flash = .18; this.shake = 6; this.zoom = .05; this.flare = { x: bp[0], y: bp[1], t: this.time };
    d.sweep = { t0: this.time, dur: .32, amp: 60, dir: m.line === 'basse' ? -1 : 1 }; // parade ample
    this.say('Parade !', [bp[0], bp[1] - 30], '#fff3c8', 28); this.sfx('CLANG !', bp, '#ffd84a', 36);
    d.ripOffer = { t0: this.time, end: this.time + RIP_WIN }; // le bouton Attaque devient Riposte : à vous de frapper, idéalement dans la zone dorée
    this.event('parry', info);
  },
  block(a, d, bp, info) {
    if (CFG.breath && d.breath < .08) { this.say('À bout de souffle : la garde cède !', [d.x, GROUND - 250], '#f0a48c', 18); return this.breakGuard(a, d, bp, info); } // garde tenue sans souffle
    d.spend('block'); Depth.hitFx(bp, 'block');
    // garde tenue : la lame adverse est chassée (l'attaquant recule, ouvert 0,22 s) ; une attaque juste après part plus vite
    d.setState('block', .12); d.kb = a.dir * 110; d.stats.blocks++; d.lastBlockT = this.time; d.sweep = { t0: this.time, dur: .22, amp: 26, dir: a.move.line === 'basse' ? -1 : 1 };
    const lunge = a.move.lunge > 60; a.setState('recoil', lunge ? .4 : .22); a.kb = -a.dir * 120;
    this.spark(bp, 20, '#ffd9a0'); this.ring(bp, '#ffd9a0', 170, .22); this.sfx('TCHING', bp, '#cfe4ff', 26); Snd.clang(false); Snd.tick(); this.shake = 5; this.hitStop = .05; this.flash = .06;
    if (d.isPlayer) this.say(info.mashed ? 'Garde martelée' : 'Garde !', [d.x, GROUND - 228], '#e6eef6', 20);
    this.event('block', info);
  },
  breakGuard(a, d, bp, info) {
    Depth.hitFx(bp, 'break'); a.stats.gbreaks = (a.stats.gbreaks || 0) + 1;
    d.guarding = false; d.setState('broken', .78); d.hp = Math.max(1, d.hp - 4 - (heroOf(a) && heroOf(a).breakDmg || 0)); d.kb = a.dir * 60;
    this.spark(bp, 26, '#ffb070'); this.ring(bp, '#ffb070', 200); Snd.crack(); this.shake = 9; this.hitStop = .07; this.zoom = .04;
    this.say('Garde brisée', [d.x, GROUND - 222], '#f0b37c', 22); this.sfx('KRAK !', bp, '#ffb84a', 38);
    this.event('break', info);
  },
  // taches de sang sur le costume, à l'endroit de la blessure (elles suivent le corps)
  drawMarks(g, f) {
    if (!CFG.blood || !f.marks || !f.marks.length || !f.J) return; const j = f.J, d = f.dir;
    for (const mk of f.marks) {
      const p = mk.z === 'bras' ? [lerp(j.sh[0], j.el[0], .55), lerp(j.sh[1], j.el[1], .55)] : mk.z === 'jambe' ? [lerp(j.fl.hip[0], j.fl.knee[0], .55), lerp(j.fl.hip[1], j.fl.knee[1], .55)] : [lerp(j.neck[0], j.gx, .5) + d * 7, lerp(j.neck[1], j.gy, .5) + Math.sin(mk.seed) * 6];
      const r = 4 + 5 * mk.s; if (mk.z === 'torse' && mk.s >= 1) { g.save(); g.strokeStyle = 'rgba(240,232,214,.85)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(p[0] - 7, p[1] - 5); g.lineTo(p[0] + 6, p[1] + 4); g.stroke(); g.strokeStyle = 'rgba(30,20,16,.7)'; g.lineWidth = .8; g.stroke(); g.restore(); } // pourpoint fendu : la chemise apparaît
      g.save(); g.globalAlpha = .82;
      const gr = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], r); gr.addColorStop(0, 'rgba(92,6,12,.95)'); gr.addColorStop(.6, 'rgba(120,12,16,.7)'); gr.addColorStop(1, 'rgba(120,12,16,0)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(p[0], p[1], r, r * .8, mk.seed, 0, 7); g.fill();
      g.beginPath(); g.ellipse(p[0] + Math.cos(mk.seed) * r * .5, p[1] + r * .6, r * .35, r * .7, 0, 0, 7); g.fill(); g.restore(); } // coulure
  },
  // coup critique : il ne doit rien au hasard. Riposte parfaite, coup d'arrêt (touche pendant la préparation adverse)
  // ou touche sur une garde brisée : la blessure est localisée (bras armé, jambe avant, flanc) et se voit jusqu'à la fin de la manche.
  woundZone(d, at) {
    const j = d.J; if (!j) return 'torse';
    const leg = Math.min(segDist(j.fl.hip, j.fl.knee, at, at).d, segDist(j.fl.knee, j.fl.foot, at, at).d), arm = segDist(j.sh, j.el, at, at).d;
    return leg < 13 ? 'jambe' : arm < 10 ? 'bras' : 'torse';
  },
  critOf(a, d, m) {
    if (m.kind === 'riposte' && m.perfect) return 'Riposte parfaite';
    if (d.state === 'broken') return 'Garde brisée';
    if (d.state === 'attack' && d.move && (d.move.kind === 'pending' || d.phase() === 'prep')) return 'Coup d\'arrêt';
    return null;
  },
  hit(a, d, at, info) {
    const m = a.move, heavy = m.kind === 'heavy', dmg = this.dmgFor(a, d, m), crit = this.critOf(a, d, m);
    const before = { state: d.state, move: d.move && { kind: d.move.kind, whiffed: d.move.whiffed }, phase: d.move ? d.phase() : null, dashS: d.dash ? d.dash.s : 0, winded: d.winded };
    if (crit && d.hp - dmg > 0) { const z = this.woundZone(d, at); d.wounds[z] = 1; d.marks.push({ z, s: 1, seed: Math.random() * 6 }); info.crit = crit; info.zone = z; a.stats.crits = (a.stats.crits || 0) + 1; if (crit === 'Coup d\'arrêt') a.stats.stopHits = (a.stats.stopHits || 0) + 1;
      this.say(`${crit} : blessure ${z === 'bras' ? 'au bras' : z === 'jambe' ? 'à la jambe' : 'au flanc'} !`, [d.x, GROUND - 250], '#ff9a7a', 20); CutIn.show(a, crit, '#ffb27a'); this.slowT = Math.max(this.slowT, .22); }
    else if (dmg >= 10 && d.marks.length < 4) d.marks.push({ z: this.woundZone(d, at), s: .55, seed: Math.random() * 6 }); // touche franche : le sang marque le costume
    d.hp = Math.max(0, d.hp - dmg); d.stats.taken = (d.stats.taken || 0) + dmg; d.stats.takenBy = d.stats.takenBy || {}; d.stats.takenBy[m.kind] = (d.stats.takenBy[m.kind] || 0) + dmg; d.flash = .12; a.stats.hits++;
    if (heroOf(a) && heroOf(a).healOnHit) a.hp = Math.min(100, a.hp + heroOf(a).healOnHit);
    if (dmg >= 12 || d.hp <= 30) this.bleed(at, a.dir, Math.round(m.dmg * (heavy ? 2.2 : 1.4)), heavy ? 1.25 : 1); else this.bleed(at, a.dir, 3, .6);
    d.guarding = false; d.setState('hit', heavy ? .5 : .34); d.kb = a.dir * (heavy ? 230 : 140);
    this.spark(at, heavy ? 18 : 10, '#ffe6c0'); this.ring(at, '#ff8a70', 120, .2);
    this.sfx(m.kind === 'riposte' ? 'SHLAK !' : heavy ? 'TCHAAK !' : 'TCHAK !', at, m.kind === 'riposte' ? '#ff9a3a' : '#ff5a3a', heavy || m.kind === 'riposte' ? 38 : 30);
    Snd.hit(heavy || m.kind === 'riposte'); this.hitStop = heavy ? .09 : .05; this.shake = heavy ? 10 : 5; if (heavy || m.kind === 'riposte') this.zoom = .035;
    if (m.kind === 'riposte') { this.say('Touché !', [at[0], at[1] - 26], '#ffd27a', 26); this.zoom = .04; }
    else if (d.isPlayer && info.cov === 0) this.say(`Ligne ouverte : ${LINE_NAME[m.line]}`, [d.x, GROUND - 222], '#f0a48c', 16);
    this.event('hit', info); Replay.onHit(a, d, m, info, before); Depth.hitFx(at, 'hit');
    d.hitZone = this.woundZone(d, at); if (d.hp <= 0) { d.koStyle = d.hitZone === 'jambe' ? 'genou' : d.hitZone === 'bras' ? 'arriere' : 'chute'; this.ko(d); }
    else if (d === this.e && !d.phase2 && d.hp <= 50 && this.matchOpts && this.matchOpts.opp && this.matchOpts.opp.boss) this.secondWind(d);
  },
  doubleHit(ev) {
    for (const { a, d, at } of ev) { a.move.done = true; a.move.contact = true; const dm = Math.round(this.dmgFor(a, d, a.move) * .6); d.stats.taken = (d.stats.taken || 0) + dm; d.hp = Math.max(0, d.hp - dm); d.flash = .12; this.spark(at, 10, '#ffe6c0'); }
    for (const { d } of ev) { d.setState('hit', .34); d.kb = -d.dir * 150; }
    Snd.hit(true); Snd.clang(false); this.hitStop = .08; this.shake = 8; this.zoom = .03;
    this.say('Coup double', [(this.p.x + this.e.x) / 2, GROUND - 240], '#f0b37c', 26);
    this.event('double', { ev });
    for (const { d } of ev) if (d.hp <= 0) this.ko(d);
  },
  clash(at) {
    for (const f of [this.p, this.e]) { f.move.done = true; f.move.contact = true; f.setState('clash', .26); f.kb = -f.dir * 90; }
    this.spark(at, 16, '#fff0c8'); Snd.clang(false); this.shake = 4; this.hitStop = .04;
    this.say('Lames croisées', [at[0], at[1] - 30], '#e6dcc4', 18); this.event('clash', {});
  },
  // ---- le fer ----
  // contact de lames au repos : l'engagement (la pointe sent la lame adverse)
  engagement() {
    const p = this.p, e = this.e, FR = ['idle', 'walk', 'guard'];
    let on = false, at = null;
    if (p.J && e.J && FR.includes(p.state) && FR.includes(e.state)) { const c = segDist([lerp(p.J.wr[0], p.J.tip[0], .3), lerp(p.J.wr[1], p.J.tip[1], .3)], p.J.tip, [lerp(e.J.wr[0], e.J.tip[0], .3), lerp(e.J.wr[1], e.J.tip[1], .3)], e.J.tip); on = c.d < 14 && Math.abs(e.x - p.x) <= REACH.jab + 10; at = c.p; }
    if (on && !this.engaged) { Snd.tick(); this.spark(at, 4, '#fff6dc'); this.ferCtl = 0; }
    this.engaged = on; this.engageAt = at; p.engaged = e.engaged = on;
    // le liement : fer contre fer, les lames glissent l'une sur l'autre ; celui qui pousse (→ maintenu) prend le fer
    if (on) {
      const tip = p.J.tip[0] - e.J.tip[0], tipY = p.J.tip[1] - e.J.tip[1], v = this.lastTipRel ? Math.hypot(tip - this.lastTipRel[0], tipY - this.lastTipRel[1]) : 0; this.lastTipRel = [tip, tipY];
      if (v > .5 && this.time - (this.scrapeT || -9) > .1) { this.scrapeT = this.time; Snd.scrape(Math.min(1, v / 3)); if (Math.random() < .5) this.spark(at, 2, '#fff2cc'); }
      const push = f => (f.state === 'walk' || f.state === 'idle' || f.state === 'guard') && f.intent.dx * f.dir > .3 ? 1 : 0, dp = push(p) - push(e);
      this.ferCtl = (this.ferCtl || 0) * Math.exp(-.6 / 120) + dp * 1.6 / 120;
      if (dp !== 0 && this.time - (this.pushFxT || -9) > .18) { this.pushFxT = this.time; this.spark(at, 3, '#ffe6b0'); Snd.scrape(.8); }
      if (Math.abs(this.ferCtl) >= 1) this.dominate(this.ferCtl > 0 ? p : e, at);
    } else { this.lastTipRel = null; this.ferCtl = 0; }
  },
  // fer dominé : la lame adverse est chassée de côté, son prochain coup part plus lentement, le vôtre aussitôt
  dominate(a, at) {
    const d = a.opp; this.ferCtl = 0; a.lastBeatT = this.time; d.dominatedT = this.time; d.sweep = { t0: this.time, dur: .3, amp: 34, dir: -1 };
    a.stats.dominate = (a.stats.dominate || 0) + 1; Snd.clang(false); Snd.scrape(1); this.spark(at, 12, '#ffe6b0'); this.ring(at, '#ffd27a', 120, .22); this.shake = Math.max(this.shake, 2);
    this.say(a.isPlayer ? 'Fer dominé !' : 'Il domine votre fer', [at[0], at[1] - 34], a.isPlayer ? '#ffd27a' : '#f0a48c', 20); this.event('dominate', { a, d });

  },
  // le battement frappe la lame adverse : il la chasse si elle est libre ou en préparation ; un dégagement s'y dérobe
  beatCheck(a) {
    const m = a.move, d = a.opp, dist = a.dist(); m.done = true;
    const wh = why => { m.whiffed = true; m.rec += MOVES.beat.whiff; m.keys[m.keys.length - 1][0] += MOVES.beat.whiff; a.stats.whiffs++; Snd.whiff(); this.say(why, [a.J.tip[0], a.J.tip[1] - 14], '#8f8778', 15); this.event('beatMiss', { a, d, why }); };
    if (this.time - (d.lastBeatenT || -9) < BEAT_WARY && !(d.state === 'attack' && d.phase() === 'prep')) return this.derob(a, d, 'Le fer cède !'); // on ne bat pas deux fois de suite la même lame : elle s'attend au battement
    if (dist > REACH.beat || ['hit', 'parried', 'beaten', 'broken', 'ko', 'dash', 'clash', 'recoil', 'win'].includes(d.state)) return wh('Battement dans le vide');
    if (d.state === 'attack') {
      const dm = d.move, ph = d.phase();
      if (DEROB.includes(dm.kind) && ph !== 'rec') return this.derob(a, d, 'Dérobement !');
      if (ph === 'prep' && dm.kind !== 'heavy' && dm.kind !== 'riposte') { dm.done = true; return this.beaten(a, d, 'Attaque battue !'); }
      if (ph === 'rec') return this.beaten(a, d, 'Battement !');
      return wh('Trop tard');
    }
    return this.beaten(a, d, 'Battement !');
  },
  beaten(a, d, txt) {
    const m = a.move; m.contact = true; m.beatOk = true; a.lastBeatT = a.lastBeatOkT = this.time; a.stats.beatOk = (a.stats.beatOk || 0) + 1;
    d.guarding = false; d.setState('beaten', BEAT_DUR + (a.isPlayer && Run.has('etourdir') ? .15 : 0)); d.lastBeatenT = this.time; d.kb = a.dir * 40;
    const bp = [lerp(d.J.wr[0], d.J.tip[0], .55), lerp(d.J.wr[1], d.J.tip[1], .55)];
    this.spark(bp, 14, '#fff3c8'); this.ring(bp, '#ffe2a0', 140, .2); Snd.clang(false); Snd.beatTac(); this.hitStop = .035; this.shake = 3;
    this.say(txt, [bp[0], bp[1] - 30], '#ffd27a', 20); this.sfx('TAC !', bp, '#ffe28a', 26); this.event('beat', { a, d });
  },
  // boss : à mi-vie, il change de garde (une fois par match) et son style se durcit
  secondWind(d) {
    d.phase2 = true; const kind = this.matchOpts.opp.boss, L = this.ai && this.ai.L; this.slowT = Math.max(this.slowT, .5); this.shake = Math.max(this.shake, 5);
    const T = { fer: ['Il change de garde : il cherche votre fer', { fer: .25, derob: .2 }], force: ['Deuxième souffle : il force la garde', { aggr: .15 }], temps: ['Il change de garde : il attend votre attaque', { stopHit: .25, bait: .15 }], griffe: ['Les écailles s\'embrasent', { aggr: .15 }], feinte: ['Il change de rythme : méfiez-vous des feintes', { feint: .25 }] }[kind] || ['Deuxième souffle !', { aggr: .1 }];
    if (L) { for (const k in T[1]) L[k] = clamp((L[k] || 0) + T[1][k], 0, 1); if (kind === 'force' && L.w) L.w = Object.assign({}, L.w, { heavy: (L.w.heavy || 0) * 2.5 + .5 }); if (kind === 'griffe') { if (L.w) L.w = Object.assign({}, L.w, { griffe: (L.w.griffe || 0) * 1.8 }); d.slow *= .9; } }
    CutIn.show(d, 'Deuxième souffle', '#e05a4a'); this.say(T[0], [d.x, GROUND - 260], '#f0a48c', 20); Snd.bell(); this.event('secondWind', { d, kind });
  },
  // le tic : un appel du pied (poussière, petit bruit) avant le coup favori de l'adversaire
  tells() {
    const e = this.e, L = this.ai && this.ai.L; if (!L || !L.w || e.state !== 'attack' || !e.move || e.move.kind === 'pending' || e.tellId === e.move.id || e.t > .03) return;
    if (!this.favKind) { let best = null; for (const k in L.w) if (!best || L.w[k] > L.w[best]) best = k; this.favKind = best; }
    e.tellId = e.move.id; if (e.move.kind === this.favKind && this.mode !== 'training') { Depth.kick(e.feet.f.x, 3, e.dir); Snd.tick(); }
  },
  derob(a, d, txt) { // a manque la lame de d
    const m = a.move; m.done = true; m.whiffed = true; const wh = MOVES[m.kind].whiff || .15; m.rec += wh; m.keys[m.keys.length - 1][0] += wh;
    d.stats.derob = (d.stats.derob || 0) + 1; Snd.whiff(); this.say(txt, [d.x, GROUND - 236], '#9fd6ff', 22); this.event('derob', { a, d });
  },
  onWhiff(a) {
    a.stats.whiffs++; Snd.whiff();
    if (!MOVES[a.move.kind].light || a.isPlayer) this.say('Dans le vide', [a.J.tip[0], a.J.tip[1] - 14], '#8f8778', 14);
    this.event('whiff', { a });
  },
  event(type, info) { if (this.ai && this.ai.onEvent) this.ai.onEvent(type, info); if (this.state === 'demo') Demo.onEvent(type, info); },
  ko(loser) {
    if (this.mode === 'training' || this.state === 'demo') { loser.hp = 1; return; }
    if (Finisher.wants(loser.opp, loser)) { loser.opp.winT = this.time; return Finisher.start(loser.opp, loser); } // match gagné : la finale du vainqueur
    loser.setState('ko'); const winner = loser.opp; CutIn.show(winner, winner.isPlayer ? 'Touché !' : 'Vaincu…', winner.isPlayer ? '#e8c46a' : '#d07060'); this.slowT = 1.1; this.hitStop = .14; this.flash = .3;
    if (loser.J) { const J = loser.J; loser.disarmed = true; this.drops.push({ f: loser, cx: (J.wr[0] + J.tip[0]) / 2, cy: (J.wr[1] + J.tip[1]) / 2, L: Math.hypot(J.tip[0] - J.wr[0], J.tip[1] - J.wr[1]), ang: Math.atan2(J.tip[1] - J.wr[1], J.tip[0] - J.wr[0]), vx: -loser.dir * 60, vy: -140, va: loser.dir * 7, rest: false }); } // la rapière tombe de la main
    // coup de grâce : ralenti, gros plan sur la touche, bandes de cinéma
    if (loser.J && winner.J) { this.koFocus = [lerp(loser.J.neck[0], winner.J.tip[0], .5), lerp(loser.J.neck[1], winner.J.tip[1], .5)]; this.zoom = .17; this.cine = 1.8; this.say('Coup de grâce', [this.koFocus[0], this.koFocus[1] - 60], '#f6ead0', 30); Snd.clang(true); }
    if (CFG.blood && loser.J) { this.bleed(loser.J.neck, winner.dir, 26, 1.1); this.stains.push({ x: loser.x - loser.dir * 60, y: GROUND + 6, rx: 4, ry: 1, a: .9, grow: true, max: 50 }); }
    if (this.state === 'fight') { this.state = 'ko'; this.koT = 0; this.banner = { text: 'Touche !', sub: winner.isPlayer ? 'Vous remportez la manche' : `${winner.look.name} remporte la manche`, t: this.cine > 0 ? -.55 : 0, dur: 2.2 }; this.roundWinner = winner; }
    winner.winT = this.time;
  },
  endRound(winner, why) { if (this.state !== 'fight') return; this.endWhy = why; this.state = 'ko'; this.koT = 0; this.roundWinner = winner; this.banner = { text: why, sub: winner.isPlayer ? 'Vous remportez la manche' : `${winner.look.name} remporte la manche`, t: 0, dur: 2.2 }; winner.setState('win'); },
  afterRound() {
    const i = this.roundWinner.isPlayer ? 0 : 1; this.wins[i]++;
    if (this.mode === 'run') { this.state = 'over'; if (i === 0) { Snd.fanfare(true); Music.play('victoire'); } Run.onDuelEnd(i === 0); return; }
    if (this.mode === 'story' && this.wins[i] >= this.winsNeeded) { this.state = 'over'; Story.onFightEnd(i === 0); return; }
    if (this.wins[i] >= (this.winsNeeded || 2)) {
      const won = i === 0; this.state = 'over'; if (this.p.look === LOOKS.player) { if (won) this.record.w++; else this.record.l++; store.set('ct2d.record', this.record); } Snd.fanfare(won); Music.play(won ? 'victoire' : 'defaite');
      $('verdict').textContent = won ? 'Victoire' : 'Défaite'; $('overEye').textContent = `${this.e.look.name} · ${this.wins[0]} – ${this.wins[1]}`;
      $('overReward').textContent = Career.onMatchEnd(won, this.p.stats); Codex.onMatchEnd(won); Manuscrit.onMatchEnd(won);
      $('again').textContent = this.overAction === 'bracket' ? 'Duel suivant' : this.overAction === 'tourneys' ? 'Tournois' : 'Revanche';
      const gr = duelGrade(this.p.stats, (this.p.stats.taken || 0) / Math.max(1, this.wins[0] + this.wins[1]) , won); this.lastGrade = gr; $('overGrade').textContent = gr.g; $('overGrade').dataset.g = gr.g;
      const s = this.p.stats; $('overStats').textContent = `Touches ${s.hits} · dans le vide ${s.whiffs} · gardes ${s.blocks} · feintes ${s.feints} · fentes lourdes ${s.heavy}`;
      Bilan.show(this.p, this.e);
      this.show('over'); return;
    }
    this.round++; this.startRound();
  },
  spark(at, n, col) { for (let i = 0; i < n; i++) { const a = rand(0, Math.PI * 2), s = rand(80, 420); this.sparks.push({ x: at[0], y: at[1], vx: Math.cos(a) * s, vy: Math.sin(a) * s - 140, life: rand(.15, .4), col }); } },
  ring(at, col, v, life = .32) { this.rings.push({ x: at[0], y: at[1], r: 4, v, life, max: life, col }); },
  // onomatopée de BD : lettrage gras cerné d'encre, sur une étoile d'impact, qui jaillit puis s'efface
  sfx(text, at, col = '#ffd84a', size = 34) { if (this.silent || ART !== 'bd') return; this.sfxs.push({ text, x: clamp(at[0], 80, W - 80), y: at[1] - 18, life: .7, max: .7, col, size, rot: (Math.random() - .5) * .35, seed: Math.random() * 99 }); },
  drawSfx(g) {
    for (const t of this.sfxs) {
      const age = t.max - t.life, pop = age < .08 ? .6 + age / .08 * .6 : 1.2 - Math.min(.2, (age - .08) * .6), a = clamp(t.life / .25, 0, 1);
      g.save(); g.translate(t.x, t.y); g.rotate(t.rot); g.scale(pop, pop); g.globalAlpha = a;
      const R = rng(Math.floor(t.seed * 1000)), n = 14, w = t.size * t.text.length * .34 + 18, h = t.size * .9;
      g.beginPath(); for (let i = 0; i <= n * 2; i++) { const an = i / (n * 2) * Math.PI * 2, r = i % 2 ? .62 : 1 + R() * .25; g.lineTo(Math.cos(an) * w * r, Math.sin(an) * h * r); } g.closePath();
      g.fillStyle = 'rgba(255,250,232,.92)'; g.fill(); g.strokeStyle = INK; g.lineWidth = 2.4; g.stroke();
      g.font = `italic 900 ${t.size}px "Alegreya Sans", Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      g.strokeStyle = INK; g.lineWidth = 7; g.strokeText(t.text, 0, 2); g.fillStyle = t.col; g.fillText(t.text, 0, 2);
      g.fillStyle = 'rgba(255,255,255,.45)'; g.fillText(t.text, -1, 0); g.fillStyle = t.col; g.globalAlpha = a * .7; g.fillText(t.text, 0, 3);
      g.restore();
    }
    g.textBaseline = 'alphabetic';
  },
  say(text, at, col, size = 22) { this.texts.push({ text, x: clamp(at[0], 90, W - 90), y: at[1] - 10, life: .95, col, size }); },

  // ---- dessin ----
  render(rdt) {
    const g = this.g; g.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    this.shake *= Math.exp(-12 * rdt); this.cine = Math.max(0, (this.cine || 0) - rdt); this.zoom *= Math.exp(-(this.cine > .4 ? .5 : 7) * rdt); if (this.cine <= 0) this.koFocus = null;
    // tremblement lissé (bruit sinusoïdal) au lieu d'un tirage au hasard à chaque image : il secoue au lieu de vibrer
    const tt = performance.now() / 1000, sh = this.shake, sx = sh * (.32 * Math.sin(tt * 61) + .2 * Math.sin(tt * 37 + 1.3)), sy = sh * (.3 * Math.sin(tt * 53 + .7) + .18 * Math.sin(tt * 29)), rot = sh * .0012 * Math.sin(tt * 43); this.shakeX = sx; this.shakeY = sy;
    const cam = this.camera(rdt);
    g.save(); g.translate(sx, sy);
    g.translate(W / 2, H / 2); if (rot) g.rotate(rot); g.scale(cam.s, cam.s); g.translate(-cam.x, -cam.y);
    if (Paint.on) Paint.ensure(this.scale * CAM_REF); Depth.drawBack(g, this.venue, cam, this.time);
    Ambiance.back(g, this.time);
    if (this.zoom > .001) { const cx = this.koFocus ? this.koFocus[0] : (this.p.x + this.e.x) / 2, cy = this.koFocus ? this.koFocus[1] : GROUND - 120; g.translate(cx, cy); g.scale(1 + this.zoom, 1 + this.zoom); g.translate(-cx, -cy); }
    for (const s of this.stains) { g.globalAlpha = clamp(s.a, 0, 1); g.fillStyle = '#5a0a0e'; g.beginPath(); g.ellipse(s.x, s.y, s.rx, s.ry, 0, 0, 7); g.fill(); g.fillStyle = '#7a1014'; g.beginPath(); g.ellipse(s.x - s.rx * .15, s.y - s.ry * .15, s.rx * .6, s.ry * .55, 0, 0, 7); g.fill(); }
    g.globalAlpha = 1;
    // interpolation : on dessine entre l'avant-dernier et le dernier pas de simulation (120 Hz), selon le temps déjà accumulé,
    // pour que chaque image soit au bon instant même quand l'écran et la simulation ne tombent pas juste (ralentis compris)
    const al = clamp((this.acc || 0) * 120, 0, 1), saved = [];
    for (const f of [this.p, this.e]) if (f.J && f.prevJ && al < .999) { saved.push([f, f.J]); f.J = lerpJ(f.prevJ, f.J, al); }
    Depth.drawDust(g, this.venue); Cine.drawWorld(g, this.venue, this.time); Finisher.drawWorld(g);
    const order = [this.p, this.e].sort((a, b) => (a.state === 'ko') - (b.state === 'ko'));
    for (const f of order) { if (f.phase2 && f.J && f.state !== 'ko') glow(g, f.J.neck[0], (f.J.neck[1] + f.J.gy) / 2, 95, 'rgba(225,70,45,A)', .16 + .07 * Math.sin(this.time * 5)); this.drawGhosts(g, f); Paint.actor(g, f, this.venue, this.time); }
    for (const h of this.hats || []) { g.save(); g.translate(h.x, h.y); g.rotate(h.a); g.fillStyle = h.col; g.beginPath(); g.ellipse(0, 0, 22, 4.5, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(0, -5, 10, 6, 0, Math.PI, 0); g.fill(); g.restore(); } // chapeaux tombés
    for (const f of order) this.drawMarks(g, f);
    Story.drawSig(g); for (const f of order) Depth.glint(g, f, this.time);
    for (const r of this.drops || []) { const ux = Math.cos(r.ang) * r.L / 2, uy = Math.sin(r.ang) * r.L / 2, F = r.f, fake = { dir: F.dir, rapier: F.rapier, isPlayer: F.isPlayer, disarmed: false };
      drawRapier(g, fake, { wr: [r.cx - ux, r.cy - uy], tip: [r.cx + ux, r.cy + uy] }, norm(F.look), c => c); }
    if (Paint.on && ART !== 'bd') Paint.atmos(g, this.venue, this.time);
    Depth.drawFront(g, this.venue, cam);
    this.parryCue(g); this.guardWorld && this.guardWorld(g);
    for (const [f, J] of saved) f.J = J;
    Ambiance.front(g, this.time);
    for (const b of this.blood) { g.fillStyle = '#8e0c12'; g.beginPath(); g.ellipse(b.x, b.y, b.r, b.r * (1 + Math.min(1.5, Math.abs(b.vy) / 400)), Math.atan2(b.vy, b.vx) - Math.PI / 2, 0, 7); g.fill(); }
    const tint = VENUES[this.venue].tint; if (tint) { g.fillStyle = tint; g.fillRect(-20, -20, W + 40, H + 40); }
    g.globalCompositeOperation = 'lighter';
    g.lineCap = 'round'; for (const s of this.sparks) { const a = clamp(s.life * 3, 0, 1); g.strokeStyle = s.col; g.globalAlpha = a; g.lineWidth = 2.2; g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(s.x - s.vx * .025, s.y - s.vy * .025); g.stroke(); g.globalAlpha = a * .35; g.lineWidth = 6; g.stroke(); } g.lineCap = 'butt'; // étincelles en traits lumineux
    for (const r of this.rings) { g.strokeStyle = r.col; g.globalAlpha = clamp(r.life / r.max, 0, 1) * .8; g.lineWidth = 2.5; g.beginPath(); g.arc(r.x, r.y, r.r, 0, 7); g.stroke(); }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    for (const t of this.texts) { g.font = `700 ${t.size}px "IM Fell English SC", Georgia, serif`; g.textAlign = 'center'; g.globalAlpha = clamp(t.life * 2.2, 0, 1); g.fillStyle = 'rgba(0,0,0,.65)'; g.fillText(t.text, t.x + 2, t.y + 2); g.fillStyle = t.col; g.fillText(t.text, t.x, t.y); g.globalAlpha = 1; }
    this.drawSfx(g);
    if (this.flare && this.time - this.flare.t < .35) { // reflet d'objectif : trait anamorphique sur l'étincelle de la parade
      const u = (this.time - this.flare.t) / .35, a = (1 - u) * .7, fx = this.flare.x, fy = this.flare.y; g.save(); g.globalCompositeOperation = 'lighter';
      const lg = g.createLinearGradient(fx - 260, 0, fx + 260, 0); lg.addColorStop(0, 'rgba(255,220,170,0)'); lg.addColorStop(.5, `rgba(255,236,200,${a})`); lg.addColorStop(1, 'rgba(255,220,170,0)'); g.fillStyle = lg; g.fillRect(fx - 260, fy - 1.5, 520, 3);
      glow(g, fx, fy, 60 * (1 - u * .5), 'rgba(255,230,190,A)', a * .8); g.restore(); }
    Depth.drawImpact(g);
    g.restore();
    if (typeof GL !== 'undefined' && GL.on && GL.capture(this.cv, cam)) { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.cv.width, this.cv.height); g.setTransform(this.scale, 0, 0, this.scale, 0, 0); } // 3.0 : le monde part à la carte graphique, le canevas 2D ne garde que le HUD
    else if (Paint.on) Paint.finish(g); else if (Paint.cssOk) $('vig').hidden = true;
    if (this.cine > 0) { const u = Math.min(1, this.cine / .3, (1.8 - this.cine) / .2), bh = 46 * clamp(u, 0, 1); g.fillStyle = '#000'; g.fillRect(0, 0, W, bh); g.fillRect(0, H - bh, W, bh); }
    if (this.flash > 0) { this.flash -= rdt; g.fillStyle = `rgba(255,248,230,${clamp(this.flash, 0, .3)})`; g.fillRect(0, 0, W, H); }
    if (this.state === 'menu') { g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(0, 0, W, H); }
    else if (this.state === 'scene') { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, 0, W, H); }
    else if (this.state === 'demo') { const C0 = this.cam || { s: 1, x: W / 2, y: H / 2 }; g.save(); g.translate(W / 2, H / 2); g.scale(C0.s, C0.s); g.translate(-C0.x, -C0.y); this.guardMarks(g); g.restore(); Demo.draw(g); }
    else this.hud(g);
    if (Cine.bubble || Cine.title || Codex.toastQ.length || Story.lesson) { g.save(); g.setTransform(this.scale, 0, 0, this.scale, 0, 0); const uu = clamp(1 / (this.scale / Math.min(devicePixelRatio || 1, 2)), 1, 1.6); Cine.drawScreen(g, cam, uu); Codex.draw(g, uu); Story.drawLesson(g, uu); g.restore(); }
    if (CutIn.cur && (this.state === 'fight' || this.state === 'ko' || this.state === 'finish')) { g.save(); g.setTransform(this.scale, 0, 0, this.scale, 0, 0); CutIn.draw(g, clamp(1 / (this.scale / Math.min(devicePixelRatio || 1, 2)), 1, 1.6)); g.restore(); }
  },
  // silhouettes fantômes de l'esquive : les dernières positions du corps, qui s'effacent
  drawGhosts(g, f) {
    if (!f.ghosts || !f.ghosts.length || (Paint.lite && f.ghosts.length > 1 && G.state !== 'finish')) { if (f.ghosts && Paint.lite) f.ghosts.length = Math.min(f.ghosts.length, 1); if (!f.ghosts || !f.ghosts.length) return; } const now = this.time;
    for (let i = f.ghosts.length - 1; i >= 0; i--) { const gh = f.ghosts[i], age = now - gh.t; if (age > .3) { f.ghosts.splice(i, 1); continue; } if (i === 0 && f.state === 'esquive' && f.t < ESQ.b) continue;
      const px = Object.create(f); px.J = gh.J; px.cloth = null; px.flash = 0; px.ghosts = null;
      g.save(); g.globalAlpha = .26 * (1 - age / .3); try { drawFighter(g, px, { bare: true }); } catch (e) { } g.restore(); }
  },
  // caméra : cadre les duellistes de près (plus près quand ils sont proches), sans sortir du décor
  camera(rdt) {
    const p = this.p, e = this.e, d = Math.abs(p.x - e.x), menu = this.state === 'menu';
    const sc = (this.state === 'scene' && Cine.cam) || (this.state === 'finish' && Finisher.cam()), s = sc ? sc.s : menu ? 1.18 : clamp(640 / (d + 330), 1.14, CAM_MAX), x = clamp(sc ? sc.x : (p.x + e.x) / 2, W / (2 * s), W - W / (2 * s)), y = clamp(GROUND - H * .4 / s, H / (2 * s), H - H / (2 * s));
    const c = this.cam || (this.cam = { s, x, y }), a = 1 - Math.exp(-4.5 * Math.min(rdt, .1));
    c.s += (s - c.s) * a; c.x += (x - c.x) * a * 1.4; c.y += (y - c.y) * a;
    c.x = clamp(c.x, W / (2 * c.s), W - W / (2 * c.s)); c.y = clamp(c.y, H / (2 * c.s), H - H / (2 * c.s));
    return c;
  },
  // fenêtre de parade parfaite prévue pour l'attaque adverse en cours (contact estimé au début de l'exécution)
  cueInfo() {
    const a = this.e, d = this.p; if (a.state !== 'attack' || !a.move || a.move.kind === 'pending' || !a.move.dmg || a.move.done) return null;
    const m = a.move, M = MOVES[m.kind], frac = m.kind === 'heavy' ? .75 : m.kind === 'griffe' ? .72 : m.kind === 'tajo' ? .4 : m.kind === 'circ' ? .37 : m.kind === 'fente' ? clamp(.27 + ((m.d0 || 300) - 300) * .004, .15, .85) : m.kind === 'compo' || m.kind === 'lie' ? .12 : .29, tc = m.wu + m.act * frac, win = CFG.perfect * M.pw + (Input.usingTouch ? CFG.touchBonus : 0) + (d.rapier ? d.rapier.guard : 0) + (Run.has('lynx') ? .05 : 0) + curHero().parry + (d.hp < 30 ? DESPAIR : 0), rem = tc - a.t;
    if (rem > win + .14 || rem < -.03) return null;
    return { M, rem, win, inWin: rem <= win * .88 };
  },
  // facile et normal : la pointe adverse rougeoie quand appuyer sur Garde donnerait une parade parfaite
  parryCue(g) {
    if (this.pw === 'stricte' || (this.state !== 'fight' && this.state !== 'demo')) return;
    const c = this.cueInfo(); if (!c) return; const a = this.e, M = c.M, inWin = c.inWin, rem = c.rem, win = c.win, k = inWin ? 1 : 1 - (rem - win) / .14, J = M.claw ? { tip: a.J.bwr } : a.J, p = J.tip, pulse = .75 + .25 * Math.sin(this.time * 40);
    g.save(); g.globalCompositeOperation = 'lighter';
    const r = (inWin ? 30 : 16) * (inWin ? pulse : 1), q = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], r); const CC = CFG.cvd ? ['90,200,255', '40,150,255', '0,120,255', '90,210,255'] : ['255,80,60', '255,40,30', '255,0,0', '255,90,70']; // mode daltonien : bleu clair
    q.addColorStop(0, `rgba(${CC[0]},${.95 * k})`); q.addColorStop(.35, `rgba(${CC[1]},${.55 * k})`); q.addColorStop(1, `rgba(${CC[2]},0)`);
    g.fillStyle = q; g.beginPath(); g.arc(p[0], p[1], r, 0, 7); g.fill();
    if (CFG.cueShape && inWin && a.J) { const hx = a.J.head[0], hy = a.J.head[1] - 46; g.globalCompositeOperation = 'source-over'; g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 3; g.beginPath(); g.moveTo(hx, hy - 16); g.lineTo(hx + 13, hy); g.lineTo(hx, hy + 16); g.lineTo(hx - 13, hy); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#111'; g.font = '900 20px sans-serif'; g.textAlign = 'center'; g.fillText('!', hx, hy + 7); g.globalCompositeOperation = 'lighter'; } // signal de forme (lisible sans les couleurs)
    if (!M.claw && inWin) { g.strokeStyle = `rgba(${CC[3]},${.7 * pulse})`; g.lineWidth = 2.4; g.beginPath(); g.moveTo(lerp(a.J.wr[0], p[0], .72), lerp(a.J.wr[1], p[1], .72)); g.lineTo(p[0], p[1]); g.stroke(); }
    g.restore();
  },
  // garde : petit écu au-dessus du combattant ; cercle clair pendant la fenêtre de parade parfaite (joueur)
  guardMarks(g) {
    for (const f of [this.p, this.e]) {
      if (!(f.state === 'guard' || f.state === 'block')) continue;
      const j = f.J, cx = j.head[0], cy = j.head[1] - 40;
      g.fillStyle = f.state === 'block' ? '#ffd9a0' : '#c9d6e2'; g.globalAlpha = .9;
      g.beginPath(); g.moveTo(cx - 8, cy - 8); g.lineTo(cx + 8, cy - 8); g.lineTo(cx + 8, cy); g.quadraticCurveTo(cx + 7, cy + 7, cx, cy + 11); g.quadraticCurveTo(cx - 7, cy + 7, cx - 8, cy); g.closePath(); g.fill(); g.globalAlpha = 1;
      if (f.isPlayer && f.perfectOk && this.time - f.pressT <= CFG.perfect) { g.strokeStyle = '#fff3c8'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy + 1, 17, 0, 7); g.stroke(); }
    }
  },
  // ---- HUD : dimensionné en points d'écran (lisible quelle que soit la réduction de l'image sur iPhone) ----
  // vie et blason de chaque duelliste, sceaux de manche, blessures ; au centre le chrono (seulement si le temps compte) et la mesure
  // accessibilité : texte plus grand, gros boutons
  a11y() { document.body.classList.toggle('bigtext', !!CFG.bigText); document.body.classList.toggle('bigbtn', !!CFG.bigBtn); document.body.classList.toggle('cueshape', !!CFG.cueShape); },
  hud(g) {
    const p = this.p, e = this.e, sCss = this.scale / Math.min(devicePixelRatio || 1, 2), u = clamp(1 / sCss, 1, 1.6) * (CFG.bigText ? 1.15 : 1), F = (w, px) => `${w} ${Math.round(px * u)}px "Alegreya Sans", sans-serif`;
    const tb = g.createLinearGradient(0, 0, 0, 78 * u); tb.addColorStop(0, 'rgba(8,6,10,.62)'); tb.addColorStop(1, 'rgba(8,6,10,0)'); g.fillStyle = tb; g.fillRect(0, 0, W, 78 * u);
    const timed = this.mode !== 'training' && this.timer < 900, cw = Math.max(timed ? 30 * u : 0, 50 * u), bw = Math.min(310, W / 2 - 64 * u - cw - 10);
    const side = (f, right) => {
      const cx = right ? W - 28 * u : 28 * u, cy = 28 * u, L = norm(f.look), x0 = right ? cx - 22 * u - bw : cx + 22 * u;
      // blason : écu aux couleurs du duelliste, initiale
      g.save(); g.translate(cx, cy); g.scale(u, u); g.beginPath(); g.moveTo(-14, -15); g.lineTo(14, -15); g.lineTo(14, 2); g.quadraticCurveTo(12, 13, 0, 18); g.quadraticCurveTo(-12, 13, -14, 2); g.closePath();
      g.fillStyle = L.coat || '#444'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#d8b25e'; g.stroke(); g.fillStyle = '#f4ead2'; g.font = '700 15px "IM Fell English SC", Georgia, serif'; g.textAlign = 'center'; g.fillText((f.isPlayer && typeof curHero === 'function' ? curHero().name : f.look.name || '?').replace(/^(Dom|Ser|Maestro|Don|le|la)\s+/i, '').charAt(0).toUpperCase(), 0, 6); g.restore();
      // nom
      g.font = F(800, 12.5); g.textAlign = right ? 'right' : 'left'; g.fillStyle = 'rgba(0,0,0,.7)'; const nm = (f.isPlayer && typeof curHero === 'function' ? curHero().name : f.look.name || '').toUpperCase();
      g.fillText(nm, (right ? x0 + bw : x0) + 1, 15 * u + 1); g.fillStyle = '#efe4c8'; g.fillText(nm, right ? x0 + bw : x0, 15 * u);
      // vie : traînée claire qui rattrape la vraie valeur
      const by = 20 * u, bh = 12 * u, w1 = bw * clamp(f.hpShow, 0, 100) / 100, w2 = bw * clamp(f.hp, 0, 100) / 100;
      g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x0 - 2, by - 2, bw + 4, bh + 4); g.fillStyle = '#f2d9a6'; g.fillRect(right ? x0 + bw - w1 : x0, by, w1, bh);
      const gr = g.createLinearGradient(0, by, 0, by + bh); gr.addColorStop(0, f.hp < 30 ? '#ff5a3a' : '#d8473a'); gr.addColorStop(1, '#8d2219'); g.fillStyle = gr; g.fillRect(right ? x0 + bw - w2 : x0, by, w2, bh);
      g.strokeStyle = '#d8b25e'; g.lineWidth = 1.5; g.strokeRect(x0 - 2, by - 2, bw + 4, bh + 4);
      // souffle (sous la vie)
      if (f.breath !== undefined && CFG.breath) { const sy = by + bh + 4 * u, sw = bw * .72, w3 = sw * clamp(f.breath, 0, 1); const low = f.winded, pul = low ? .55 + .45 * Math.abs(Math.sin(this.time * 7)) : 1; g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(right ? x0 + bw - sw : x0, sy, sw, 6 * u); g.globalAlpha = pul; g.fillStyle = low ? '#e8a060' : '#9cc4d8'; g.fillRect(right ? x0 + bw - w3 : x0, sy, w3, 6 * u); g.globalAlpha = 1;
        if (low && f.isPlayer) { g.font = `800 ${Math.round(9.5 * u)}px "Alegreya Sans", sans-serif`; g.textAlign = right ? 'right' : 'left'; g.fillStyle = `rgba(232,160,96,${pul})`; g.fillText('À BOUT DE SOUFFLE', right ? x0 + bw - sw - 6 * u : x0 + sw + 6 * u, sy + 6 * u); } }
      // sceaux de manche (cire rouge) et blessures
      let ix = right ? x0 + bw - 7 * u : x0 + 7 * u; const iy = by + bh + 17 * u, step = (right ? -1 : 1);
      if (this.mode !== 'training') { const wi = right ? 1 : 0; for (let k = 0; k < 2; k++) { g.beginPath(); g.arc(ix, iy, 7 * u, 0, 7); g.fillStyle = this.wins[wi] > k ? '#a8202a' : 'rgba(0,0,0,.5)'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = this.wins[wi] > k ? '#e8b0a0' : 'rgba(216,178,94,.7)'; g.stroke(); if (this.wins[wi] > k) { g.fillStyle = 'rgba(255,220,200,.6)'; g.beginPath(); g.arc(ix - 2 * u, iy - 2 * u, 2 * u, 0, 7); g.fill(); } ix += step * 18 * u; } ix += step * 4 * u; }
      g.font = F(800, 10.5); for (const z of ['bras', 'jambe', 'torse']) if (f.wounds && f.wounds[z]) { const t = z === 'torse' ? 'FLANC' : z.toUpperCase(), tw = g.measureText(t).width + 10 * u, xx = right ? ix - tw : ix; g.fillStyle = 'rgba(120,12,16,.85)'; g.fillRect(xx, iy - 7 * u, tw, 14 * u); g.fillStyle = '#ffe2d6'; g.textAlign = 'left'; g.fillText(t, xx + 5 * u, iy + 4 * u); ix += step * (tw + 4 * u); }
    };
    side(p, false); side(e, true);
    // chrono : médaillon, seulement si le temps compte (guet, chrono de manche)
    g.textAlign = 'center';
    if (timed) { const warn = this.timer <= 10 || (this.guet && this.timer <= GUET_WARN), r = 22 * u, cy = 27 * u;
      g.beginPath(); g.arc(W / 2, cy, r, 0, 7); g.fillStyle = 'rgba(10,8,10,.7)'; g.fill(); g.lineWidth = 2; g.strokeStyle = warn ? `rgba(255,${120 + 60 * Math.sin(this.time * 10) | 0},100,1)` : '#d8b25e'; g.stroke();
      g.font = `700 ${Math.round(21 * u)}px "Alegreya Sans", sans-serif`; g.fillStyle = warn ? '#ffb09a' : '#efe4c8'; g.fillText(Math.max(0, Math.ceil(this.timer)), W / 2, cy + 7 * u);
      if (this.guet) { g.font = F(800, 9); g.fillStyle = warn ? '#ff9a7a' : 'rgba(239,228,200,.75)'; g.fillText('GUET', W / 2, cy + r + 10 * u); } }
    // mesure : quatre segments ; le nom de la distance n'apparaît que 1,2 s après chaque changement
    const bd = band(Math.abs(e.x - p.x)), bands = ['engage', 'estoc', 'menace', 'hors'], my = timed ? 64 * u : 26 * u, sw = 20 * u, gap = 4 * u, x0 = W / 2 - (4 * sw + 3 * gap) / 2;
    if (bd !== this.bandNow) { this.bandNow = bd; this.bandT = this.time; }
    bands.forEach((b, i) => { g.fillStyle = b === bd ? '#d8b25e' : 'rgba(239,228,200,.28)'; g.fillRect(x0 + i * (sw + gap), my, sw, 5 * u); });
    if (this.time - (this.bandT || 0) < 1.2) { const a = clamp((1.2 - (this.time - this.bandT)) / .3, 0, 1), t = BAND_NAME[bd].toUpperCase(); g.globalAlpha = a; g.font = F(800, 11); const tw = g.measureText(t).width + 12 * u;
      g.fillStyle = 'rgba(8,6,10,.7)'; g.fillRect(W / 2 - tw / 2, my + 9 * u, tw, 16 * u); g.fillStyle = '#efe4c8'; g.fillText(t, W / 2, my + 21 * u); g.globalAlpha = 1; }
    const C0 = this.cam || { s: 1, x: W / 2, y: H / 2 }; g.save(); g.translate(W / 2, H / 2); g.scale(C0.s, C0.s); g.translate(-C0.x, -C0.y); // ce qui suit les duellistes : dans le repère de la caméra
    this.guardMarks(g);
    if (this.engaged && this.engageAt) { const q = this.engageAt, k = .6 + .4 * Math.sin(this.time * 14); g.globalAlpha = k; g.fillStyle = '#fff6dc'; g.beginPath(); g.arc(q[0], q[1], 3, 0, 7); g.fill(); g.globalAlpha = 1; } // fer engagé : l'étincelle sur les lames suffit
    // signal de parade et riposte sur les boutons (redondance : on ne dépend pas que de la couleur de la pointe)
    const cue = this.pw !== 'stricte' && this.cueInfo(), bg = $('bGuard'), ba = $('bAtk'), offer = p.ripOffer && this.time <= p.ripOffer.end;
    if (bg) bg.classList.toggle('cue', !!(cue && cue.inWin)); if (ba) ba.classList.toggle('rip', !!offer);
    if (cue && cue.inWin && this.cueTick !== e.move.id) { this.cueTick = e.move.id; Snd.tone(2350, .05, .035, 'sine'); } // tic : c'est le moment de parer (signal sonore en plus de la lueur)
    // offre de riposte : anneau de timing au-dessus du joueur (fenêtre de parade Large ou Normale)
    if (offer) { const el = this.time - p.ripOffer.t0, j = p.J, cx = j.head[0], cy = j.head[1] - 46, inZ = el >= RIP_PERFECT[0] && el <= RIP_PERFECT[1];
      if (!Input.usingTouch) { g.textAlign = 'center'; g.font = '800 17px "Alegreya Sans", sans-serif'; g.fillStyle = 'rgba(0,0,0,.6)'; g.fillText('J → RIPOSTE', cx + 1, cy - 30); g.fillStyle = inZ ? '#ffd76a' : '#f6ead0'; g.fillText('J → RIPOSTE', cx, cy - 31); }
      const ring = $('ripRing'); if (ring) { const mid0 = (RIP_PERFECT[0] + RIP_PERFECT[1]) / 2, sc = el <= mid0 ? lerp(1.5, 1, el / mid0) : 1 - (el - mid0) / (RIP_WIN - mid0) * .6; ring.style.transform = `scale(${sc.toFixed(3)})`; ring.style.display = this.pw === 'stricte' ? 'none' : ''; }
      if (ba) ba.classList.toggle('gold', inZ);
      if (this.pw !== 'stricte') { const rT = 20, mid = (RIP_PERFECT[0] + RIP_PERFECT[1]) / 2, r2 = el <= mid ? lerp(60, rT, el / mid) : rT * (1 - (el - mid) / (RIP_WIN - mid));
        g.lineWidth = 3; g.strokeStyle = inZ ? 'rgba(255,215,106,.95)' : 'rgba(255,215,106,.4)'; g.beginPath(); g.arc(cx, cy, rT, 0, 7); g.stroke(); if (inZ) { g.fillStyle = 'rgba(255,215,106,.25)'; g.fill(); }
        g.lineWidth = 2; g.strokeStyle = 'rgba(246,234,208,.9)'; g.beginPath(); g.arc(cx, cy, Math.max(2, r2), 0, 7); g.stroke(); } }
    else if (ba) ba.classList.remove('gold');
    // charge de la fente lourde : arc autour du bouton Attaque (tactile) et au-dessus de la tête
    for (const f of [p, e]) if (f.state === 'attack' && f.move.kind === 'pending' && f.t > .06) {
      const uu = clamp(f.t / HOLD_HEAVY, 0, 1), cx = f.J.head[0], cy = f.J.head[1] - 40;
      g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, 13, 0, 7); g.stroke();
      g.strokeStyle = '#f0b37c'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 13, -Math.PI / 2, -Math.PI / 2 + uu * Math.PI * 2); g.stroke();
      if (f.isPlayer && ba) ba.style.setProperty('--charge', (uu * 360).toFixed(0) + 'deg');
    }
    if (ba && !(p.state === 'attack' && p.move && p.move.kind === 'pending')) ba.style.setProperty('--charge', '0deg');
    g.restore();
    if (this.mode === 'training' && this.ai.drawPanel) this.ai.drawPanel(g);
    if (this.banner) { const b = this.banner, a = clamp(Math.min(b.t / .15, (b.dur - b.t) / .25), 0, 1);
      g.globalAlpha = a; g.textAlign = 'center'; g.font = '60px "IM Fell English SC", Georgia, serif'; g.fillStyle = 'rgba(0,0,0,.6)'; g.fillText(b.text, W / 2 + 3, 213); g.fillStyle = '#f6ead0'; g.fillText(b.text, W / 2, 210);
      if (b.sub) { g.font = '22px "Alegreya Sans", sans-serif'; g.fillStyle = '#d8b25e'; g.fillText(b.sub, W / 2, 246); } g.globalAlpha = 1; }
  },
};
