// =============================== 4.0 · les signatures du cape et d'épée : décors utilisables, panache, un contre plusieurs, alliés ===============================

// ---------- jauge de panache : le beau jeu est récompensé ----------
// Parades et esquives parfaites, ripostes parfaites, objets du décor, finales : la jauge monte. Le martelage dans le vide la fait baisser.
// Pleine, la prochaine touche est une « botte de panache » (+10, ralenti) ; le panache gagné rapporte des écus en fin de duel.
const PANACHE_GAIN = { parry: 12, ripPerfect: 14, esqPerfect: 12, esquive: 5, prop: 16, dague: 6, cape: 6, rondache: 4, dominate: 8, crit: 8 };
const Panache = {
  v: [0, 0], earned: [0, 0], ready: [false, false],
  idx(f) { return f === G.p ? 0 : f === G.e ? 1 : -1; },
  add(f, n, why) {
    const i = this.idx(f); if (i < 0 || G.state !== 'fight' && G.state !== 'ko') return; const was = this.v[i];
    this.v[i] = clamp(this.v[i] + n, 0, 100); if (n > 0) this.earned[i] += n;
    if (was < 100 && this.v[i] >= 100) { this.ready[i] = true; if (!G.silent) G.say(f.isPlayer ? 'PANACHE ! Votre prochaine touche est une botte' : 'Il a du panache : méfiez-vous', [f.x, GROUND - 280], '#ffd76a', 20); if (f.isPlayer && typeof Ach !== 'undefined') Ach.hit('panache'); }
  },
  reset(full) { this.v = [0, 0]; this.ready = [false, false]; if (full) this.earned = [0, 0]; },
  init() {
    const ev = G.event; G.event = function (t, i) {
      if (i) { const P = Panache;
        if (t === 'parry' && i.d) P.add(i.d, PANACHE_GAIN.parry);
        if (t === 'riposte' && i.a && i.perfect) P.add(i.a, PANACHE_GAIN.ripPerfect);
        if (t === 'esquive' && i.d) P.add(i.d, i.perfect ? PANACHE_GAIN.esqPerfect : PANACHE_GAIN.esquive);
        if ((t === 'dague' || t === 'cape' || t === 'rondache') && i.a) P.add(i.a, PANACHE_GAIN[t]);
        if (t === 'hit' && i.crit && i.a) P.add(i.a, PANACHE_GAIN.crit);
        if (t === 'hit' && i.d && P.idx(i.d) >= 0) P.add(i.d, -6); }
      return ev.apply(this, arguments); };
    const wf = G.onWhiff; G.onWhiff = function (f) { Panache.add(f, -5); return wf.apply(this, arguments); };
    // botte de panache : la touche suivante, jauge pleine
    const dm = G.dmgFor; G.dmgFor = function (a, d, m) { let v = dm.call(this, a, d, m); const i = Panache.idx(a); if (i >= 0 && Panache.ready[i]) { Panache.ready[i] = false; Panache.v[i] = 0; v += 10; this.slowT = Math.max(this.slowT, .35); if (!this.silent) { this.say('Botte de panache !', [d.x, GROUND - 270], '#ffd76a', 26); if (typeof CutIn !== 'undefined' && CFG.cutins) CutIn.show(a, 'Botte de panache', '#ffd76a'); } if (a.isPlayer && typeof Ach !== 'undefined') Ach.hit('botte'); } return v; };
    const sr = G.startRound; G.startRound = function () { const r = sr.apply(this, arguments); Panache.reset(false); return r; };
    const sm = G.startMatch; G.startMatch = function () { Panache.reset(true); return sm.apply(this, arguments); };
    // jauge dorée sous le souffle
    const hud = G.hud; G.hud = function (g) { const r = hud.apply(this, arguments); Panache.draw(g); return r; };
    // fin de duel : prime de panache
    const ar = G.afterRound; G.afterRound = function () { const r = ar.apply(this, arguments);
      if (this.state === 'over' && !(this.matchOpts && this.matchOpts.ecole) && this.mode !== 'story' && this.mode !== 'run' && Panache.earned[0] > 0) { const bonus = Math.round(Panache.earned[0] / 10); Save.data.ecus = (Save.data.ecus || 0) + bonus; Save.persist(); const el = $('overReward'); if (el && !el.textContent.includes('Panache')) el.textContent += ` Panache du duel : +${bonus} écus.`; }
      return r; };
  },
  draw(g) {
    if (G.mode === 'training') return; const sCss = G.scale / Math.min(devicePixelRatio || 1, 2), u = clamp(1 / sCss, 1, 1.6) * (CFG.bigText ? 1.15 : 1);
    const timed = G.mode !== 'training' && G.timer < 900, cw = Math.max(timed ? 30 * u : 0, 50 * u), bw = Math.min(310, W / 2 - 64 * u - cw - 10), by = 20 * u, bh = 12 * u, sy = by + bh + 4 * u;
    for (const [f, right] of [[G.p, false], [G.e, true]]) {
      const i = right ? 1 : 0; if (f.isPlayer && f.winded) continue; const cx = right ? W - 28 * u : 28 * u, x0 = right ? cx - 22 * u - bw : cx + 22 * u, pw = bw * .24, px = right ? x0 : x0 + bw - pw, k = this.v[i] / 100;
      g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(px, sy, pw, 6 * u);
      const full = this.ready[i], pul = full ? .7 + .3 * Math.sin(G.time * 10) : 1; g.fillStyle = full ? `rgba(255,215,106,${pul})` : '#c89a3a'; g.fillRect(right ? px + pw - pw * k : px, sy, pw * k, 6 * u);
      g.strokeStyle = 'rgba(216,178,94,.8)'; g.lineWidth = 1; g.strokeRect(px, sy, pw, 6 * u);
    }
  },
};

// ---------- décors utilisables : tabouret, tonneau, table, lustre ----------
// ↑ + Feinte près d'un objet (bouton Y à la manette) : on s'en sert. L'adversaire aussi, parfois.
const PROP_KINDS = {
  tabouret: { name: 'tabouret', act: 'renverser le tabouret', range: 280, stun: .5, dmg: 3 },
  tonneau: { name: 'tonneau', act: 'faire rouler le tonneau', range: 360, stun: .75, dmg: 4 },
  table: { name: 'table', act: 'sauter sur la table', elan: true },
  lustre: { name: 'lustre', act: 'trancher la corde du lustre', fall: true, stun: .8, dmg: 10 },
};
const VENUE_PROPS = {
  salle: [['tabouret', 170], ['lustre', 480], ['table', 800]], auberge: [['tabouret', 170], ['lustre', 480], ['table', 790]], eglise: [['lustre', 480], ['tabouret', 150]],
  loggia: [['tonneau', 160]], cloitre: [['tabouret', 150], ['tonneau', 820]], nuit: [['tonneau', 150], ['lustre', 866]], navire: [['tonneau', 140], ['lustre', 480], ['tonneau', 830]],
  bastion: [['tonneau', 150], ['tonneau', 820]], plaza: [['tonneau', 150], ['table', 800]], academia: [['tabouret', 150], ['lustre', 480]], alcazar: [['tabouret', 150], ['tonneau', 820]],
};
const Props = {
  list: [], shots: [], hint: null,
  setup(v) { this.list = (VENUE_PROPS[v] || []).map(([k, x]) => ({ k, x, used: false, y: k === 'lustre' ? 150 : GROUND, vy: 0, fallen: false })); this.shots = []; },
  near(f) { if (!f || G.state !== 'fight') return null; let best = null, bd = 64; for (const p of this.list) { if (p.used) continue; const d = Math.abs(p.x - f.x); if (d < bd) { bd = d; best = p; } } return best; },
  busy(f) { return ['attack', 'hit', 'broken', 'parried', 'stumble', 'ko', 'esquive', 'clash', 'recoil'].includes(f.state); },
  use(f, p = this.near(f)) {
    if (!p || p.used || this.busy(f)) return false; const K = PROP_KINDS[p.k], foe = f.opp; p.used = true; Panache.add(f, PANACHE_GAIN.prop);
    if (f.isPlayer && typeof Ach !== 'undefined') Ach.hit('prop_' + p.k);
    if (K.fall) { p.vy = 40; p.falling = true; Snd.tick(); G.say('La corde cède !', [p.x, 120], '#e6dcc4', 18); return true; }
    if (K.elan) { f.elan = G.time; f.setState('idle'); f.jumpT = G.time; Snd.dash(); G.say('Sur la table !', [f.x, GROUND - 250], '#ffd27a', 20); return true; }
    this.shots.push({ k: p.k, x: p.x, y: GROUND - 14, vx: Math.sign(foe.x - p.x || f.dir) * (p.k === 'tonneau' ? 420 : 560), vy: p.k === 'tabouret' ? -260 : 0, by: f, a: 0, life: 1.6 });
    Snd.swish(1.2); G.say(p.k === 'tonneau' ? 'Le tonneau roule !' : 'Le tabouret vole !', [p.x, GROUND - 150], '#ffd27a', 18); return true;
  },
  stun(d, K, by) { if (!d || d.state === 'ko' || d.state === 'esquive') return false; d.hp = Math.max(1, d.hp - K.dmg); d.setState('hit', K.stun); d.kb = Math.sign(d.x - (by ? by.x : d.x - d.dir)) * 160; d.flash = .1; G.spark([d.x, GROUND - 120], 14, '#ffe6c0'); Snd.hit(true); G.shake = Math.max(G.shake, 6); G.event('propHit', { a: by, d }); return true; },
  step(dt) {
    for (const p of this.list) if (p.falling) { p.vy += 1600 * dt; p.y += p.vy * dt; if (p.y >= GROUND - 20) { p.y = GROUND - 20; p.falling = false; p.fallen = true; G.shake = Math.max(G.shake, 8); Snd.crack(); for (const f of [G.p, G.e]) if (Math.abs(f.x - p.x) < 72) this.stun(f, PROP_KINDS.lustre, null); } }
    for (const s of this.shots) { s.life -= dt; s.x += s.vx * dt; if (s.vy || s.y < GROUND - 14) { s.vy += 1400 * dt; s.y = Math.min(GROUND - 14, s.y + s.vy * dt); } s.a += dt * 12 * Math.sign(s.vx);
      const tgt = s.by && s.by.opp; if (tgt && !s.hit && Math.abs(tgt.x - s.x) < 44) { s.hit = true; s.life = Math.min(s.life, .25); this.stun(tgt, PROP_KINDS[s.k], s.by); } }
    this.shots = this.shots.filter(s => s.life > 0 && s.x > -60 && s.x < W + 60);
    // l'adversaire se sert du décor, de temps en temps, quand il y a un objet sous la main
    const e = G.e; if (G.state === 'fight' && !G.silent && !(G.ai instanceof Coach)) { const p = this.near(e); if (p && !this.busy(e) && Math.random() < dt * .6 && Math.abs(e.x - G.p.x) < (PROP_KINDS[p.k].range || 300)) this.use(e, p); }
  },
  draw(g) {
    for (const p of this.list) {
      g.save(); g.translate(p.x, p.y); g.lineJoin = 'round';
      if (p.k === 'lustre') {
        if (!p.fallen && !p.falling) { g.strokeStyle = '#2a2018'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -p.y); g.lineTo(0, -12); g.stroke(); }
        g.strokeStyle = '#3a3028'; g.lineWidth = 4; g.beginPath(); g.ellipse(0, 0, 42, 9, 0, 0, 7); g.stroke(); g.lineWidth = 1.6; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(0, -12); g.lineTo(s * 38, -2); g.stroke(); }
        if (!p.fallen) for (const x of [-34, -12, 12, 34]) { g.fillStyle = '#f2ecdc'; g.fillRect(x - 2, -16, 4, 12); glow(g, x, -20, 22, 'rgba(255,190,100,A)', .5); g.fillStyle = '#ffd070'; g.beginPath(); g.ellipse(x, -20, 2, 4, 0, 0, 7); g.fill(); }
      } else if (!p.used || p.k === 'table') {
        if (p.k === 'tabouret') { g.fillStyle = '#5a3a20'; g.fillRect(-16, -34, 32, 7); g.strokeStyle = '#3a2414'; g.lineWidth = 4; g.beginPath(); g.moveTo(-12, -27); g.lineTo(-16, 0); g.moveTo(12, -27); g.lineTo(16, 0); g.stroke(); }
        if (p.k === 'tonneau') { g.fillStyle = '#6a4424'; g.beginPath(); g.ellipse(0, -26, 20, 27, 0, 0, 7); g.fill(); g.strokeStyle = '#2a2018'; g.lineWidth = 3; for (const dy of [-42, -26, -10]) { g.beginPath(); g.ellipse(0, dy, 19, 3, 0, 0, Math.PI); g.stroke(); } }
        if (p.k === 'table') { g.fillStyle = '#5a3a20'; g.fillRect(-46, -44, 92, 9); g.fillStyle = 'rgba(255,220,170,.25)'; g.fillRect(-46, -44, 92, 2); g.fillStyle = '#3a2414'; g.fillRect(-40, -35, 7, 35); g.fillRect(33, -35, 7, 35); }
      }
      g.restore();
    }
    for (const s of this.shots) { g.save(); g.translate(s.x, s.y); g.rotate(s.a); if (s.k === 'tonneau') { g.fillStyle = '#6a4424'; g.beginPath(); g.arc(0, 0, 16, 0, 7); g.fill(); g.strokeStyle = '#2a2018'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 11, 0, 7); g.stroke(); } else { g.fillStyle = '#5a3a20'; g.fillRect(-16, -4, 32, 7); g.strokeStyle = '#3a2414'; g.lineWidth = 4; g.beginPath(); g.moveTo(-12, 3); g.lineTo(-16, 22); g.moveTo(12, 3); g.lineTo(16, 22); g.stroke(); } g.restore(); }
    // indication contextuelle au-dessus de l'objet
    const p = this.near(G.p); this.hint = p; if (p && !G.silent && G.state === 'fight') { g.save(); g.font = '800 13px "Alegreya Sans", sans-serif'; g.textAlign = 'center'; const t = (Input.usingTouch ? '↑ + Feinte' : '↑ + K') + ' : ' + PROP_KINDS[p.k].act; const w = g.measureText(t).width + 14; g.fillStyle = 'rgba(10,8,10,.72)'; g.fillRect(p.x - w / 2, GROUND - 200, w, 20); g.fillStyle = '#ffd27a'; g.fillText(t, p.x, GROUND - 186); g.restore(); }
  },
  init() {
    const sr = G.startRound; G.startRound = function () { const r = sr.apply(this, arguments); Props.setup(this.venue); return r; };
    const ap = Input.apply; Input.apply = function (f, dt) { if (f === G.p && Input.pressed.feint && G.state === 'fight') { const D = Input.dirNum(f.dir); if (D.y < 0 && Props.near(f) && Props.use(f)) Input.pressed.feint = false; } return ap.apply(this, arguments); };
    // élan de la table : l'attaque suivante plonge et passe la garde tenue
    const rs = G.resolve; G.resolve = function (a, d, at) { if (a.elan && this.time - a.elan < 2.2 && d.guarding && a.move && a.move.kind !== 'riposte') { const early = this.time - d.pressT, win = (d.isPlayer ? CFG.perfect : CFG.perfectAI); if (!(d.perfectOk && early <= win)) { a.elan = null; a.move.done = true; a.move.contact = true; this.say('Attaque plongeante !', [d.x, GROUND - 250], '#ffd27a', 22); return this.breakGuard(a, d, [d.x, GROUND - 140], { a, d, m: a.move }); } } if (a.elan && a.move && a.move.kind !== 'pending') a.elan = null; return rs.apply(this, arguments); };
    const st = G.step; G.step = function (dt) { const r = st.apply(this, arguments); if (this.state === 'fight' || this.state === 'ko') Props.step(dt); return r; };
  },
};

// ---------- un contre plusieurs ----------
// Les adversaires attendent leur tour en tournant au bord de la scène ; on les affronte un par un, sans regagner toute sa vie.
// Rester collé à l'un d'eux est dangereux : il frappe (un « ! » prévient).
const Melee = {
  q: [], wait: [], n: 0, total: 0, danger: {},
  active() { return !!(G.matchOpts && G.matchOpts.melee); },
  start(foes, opts = {}) { const o = Object.assign({}, opts, { melee: foes.slice(1), opp: foes[0], wins: 1 }); this.total = foes.length; this.n = 1; G.startMatch(o); },
  spawn() {
    this.wait = (G.matchOpts.melee || []).map((o, k) => { const f = new Fighter(false, Object.assign({}, o.look, { name: o.name })); f.opp = G.p; f.rapier = RAPIERS[o.rapier] || RAPIERS.garnison; f.offhand = o.offhand || null; f.reset(k % 2 ? 70 : 890); f.home = f.x; f.cool = 1.5 + k; return f; });
  },
  step(dt) {
    if (!this.active()) return; const p = G.p;
    for (const f of this.wait) {
      G.clearIntent(f); const want = f.home + Math.sin(G.time * .7 + f.home) * 26; f.intent.dx = Math.abs(f.x - want) > 8 ? Math.sign(want - f.x) * f.dir * .5 : 0; f.update(dt);
      f.cool -= dt; const d = Math.abs(f.x - p.x);
      if (G.state === 'fight' && d < 120 && f.cool <= 0 && !f.warn && p.state !== 'ko') { f.warn = G.time; G.say('!', [f.x, GROUND - 250], '#ff7a5a', 30); }
      if (f.warn && G.time - f.warn > .55) { f.warn = null; f.cool = 3.5; if (Math.abs(f.x - p.x) < 140 && p.state !== 'esquive' && p.state !== 'ko') { if (p.guarding) { G.say('Paré !', [p.x, GROUND - 230], '#e6eef6', 18); Snd.clang(false); } else { p.hp = Math.max(1, p.hp - 6); p.setState('hit', .3); p.kb = Math.sign(p.x - f.x) * 140; G.say('Pris à revers !', [p.x, GROUND - 240], '#f0a48c', 20); Snd.hit(false); } } }
    }
  },
  draw(g) { if (!this.active()) return; for (const f of this.wait) { if (!f.J) continue; Paint.actor(g, f, G.venue, G.time); } },
  next() {
    const G0 = G, o = G0.matchOpts.melee.shift(); this.wait.shift(); const hp = G0.p.hp, br = G0.p.breath; this.n++;
    G0.matchOpts.opp = o; G0.e.look = Object.assign({}, o.look, { name: o.name }); G0.e.rapier = RAPIERS[o.rapier] || RAPIERS.garnison; G0.e.offhand = o.offhand || null; G0.e.arch = o.arch || null;
    G0.ai = new AI(G0.e, G0.p, o.level || 'duelliste', o.tweak); G0.wins = [0, 0];
    G0.startRound(); G0.p.hp = G0.p.hpShow = Math.min(100, hp + 12); G0.p.breath = Math.max(br, .6); G0.e.reset(800);
    G0.banner = { text: 'Au suivant !', sub: `${o.name} · ${this.n}/${this.total}`, t: 0, dur: 1.3 };
    for (const f of this.wait) f.cool = 2.5;
  },
  init() {
    const sm = G.startMatch; G.startMatch = function (opts = {}) { const r = sm.apply(this, arguments); if (opts && opts.melee) Melee.spawn(); else Melee.wait = []; return r; };
    const ar = G.afterRound; G.afterRound = function () { if (Melee.active() && this.roundWinner === this.p && this.matchOpts.melee.length) return Melee.next(); return ar.apply(this, arguments); };
    const st = G.step; G.step = function (dt) { const r = st.apply(this, arguments); Melee.step(dt); return r; };
  },
  // trois gardes du Cardinal, de force croissante (menu « Un contre trois »)
  gardes(n = 3) { const L = (c, b) => ({ name: c, level: b, rapier: b === 'maitre' ? 'solingen' : 'tolede', look: mk(b, { coat: '#8a1a1e', coat2: '#5a0e12', trim: '#d8b25e', cape: '#5a0e12', plume: '#e8e4da' }), offhand: null, tweak: { slow: b === 'maitre' ? 1.5 : 1.65 } });
    return [L('Garde du Cardinal', 'duelliste'), L('Garde du Cardinal', 'duelliste'), L('Sergent des gardes', 'maitre'), L('Lieutenant des gardes', 'maitre')].slice(0, n); },
};

// ---------- alliés : le valet et la compagne d'armes (engagés à la taverne, sur la carte de Paris) ----------
const ALLIES = {
  valet: { name: 'Guillot, le valet', desc: 'Quand vous êtes en mauvaise passe, il lance une cruche à la tête de l\'adversaire (une fois par manche).', cost: 120 },
  compagne: { name: 'Jacinthe, compagne d\'armes', desc: 'Une fois par manche, elle pare pour vous une fente ou une fente lourde qui allait vous toucher.', cost: 220 },
};
const Allies = {
  used: false, pot: null,
  cur() { const k = Save.data && Save.data.allie; return ALLIES[k] ? k : null; },
  allowed() { return G.mode !== 'training' && G.mode !== 'story' && !(G.matchOpts && G.matchOpts.ecole) && !G.silent; },
  step(dt) {
    const k = this.cur(); if (!k || !this.allowed() || G.state !== 'fight') return; const p = G.p, e = G.e;
    if (k === 'valet' && !this.used && p.hp < 45 && e.state !== 'ko') { this.used = true; this.pot = { x: 40, y: GROUND - 120, t: 0, tx: e.x, ty: GROUND - 150 }; G.say('Guillot, la cruche !', [60, GROUND - 230], '#ffd27a', 18); }
    if (this.pot) { const P = this.pot; P.t += dt / .55; if (P.t >= 1) { this.pot = null; if (e.state !== 'ko') { Props.stun(e, { dmg: 3, stun: .55 }, p); G.say('La cruche !', [e.x, GROUND - 260], '#ffd27a', 20); if (typeof Ach !== 'undefined') Ach.hit('valet'); } } }
  },
  draw(g) {
    const k = this.cur(); if (!k || !this.allowed()) return; g.save(); const R = rng(5); person(g, 30, GROUND, 52, k === 'valet' ? 'porteur' : 'dame', R, { col: k === 'valet' ? '#5a4a2a' : '#4a2a3a' }); g.restore();
    if (this.pot) { const P = this.pot, u = P.t, x = lerp(P.x, P.tx, u), y = lerp(P.y, P.ty, u) - Math.sin(u * Math.PI) * 120; g.save(); g.translate(x, y); g.rotate(u * 12); g.fillStyle = '#9a6a3a'; g.beginPath(); g.ellipse(0, 0, 9, 12, 0, 0, 7); g.fill(); g.fillStyle = '#7a4a2a'; g.fillRect(-4, -15, 8, 5); g.restore(); }
  },
  init() {
    const sr = G.startRound; G.startRound = function () { const r = sr.apply(this, arguments); Allies.used = false; Allies.pot = null; return r; };
    const st = G.step; G.step = function (dt) { const r = st.apply(this, arguments); Allies.step(dt); return r; };
    // la compagne pare une fente qui allait toucher
    const hit = G.hit; G.hit = function (a, d, at, info) { if (d === this.p && Allies.cur() === 'compagne' && Allies.allowed() && !Allies.used && a.move && ['fente', 'heavy'].includes(a.move.kind)) { Allies.used = true; a.setState('parried', .6); a.kb = -a.dir * 90; this.spark([d.x + d.dir * 30, GROUND - 140], 22, '#fff3c8'); Snd.clang(true); this.say('Jacinthe pare pour vous !', [d.x, GROUND - 250], '#ffd76a', 20); d.ripOffer = { t0: this.time, end: this.time + RIP_WIN }; if (typeof Ach !== 'undefined') Ach.hit('compagne'); return; } return hit.apply(this, arguments); };
  },
};

// dessins dans le monde (avant les duellistes) : objets, adversaires en attente, allié
const V4World = { init() { const fd = Finisher.drawWorld.bind(Finisher); Finisher.drawWorld = function (g) { if (G.state === 'fight' || G.state === 'ko' || G.state === 'round' || G.state === 'pause' || G.state === 'finish') { Allies.draw(g); Melee.draw(g); Props.draw(g); } return fd(g); }; } };
