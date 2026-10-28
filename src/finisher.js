// =============================== finale automatique : quand un duel est gagné, le vainqueur conclut par un enchaînement chorégraphié ===============================
// Pas de touche en plus : la touche décisive du match lance la finale de son personnage (désarmement, pointe à la gorge, salut).
// L'esprit de l'édit : on domine, on ne tue pas. Touchez l'écran pour passer.
const FIN = {
  // chaque finale : pistes du vainqueur (w) et du vaincu (l) en [temps, pose], événements, déplacements, chute finale du vaincu
  vaucelles: { name: 'La Morsure du Vieux Loup', dur: 3.5, end: 'genou',
    w: [[.25, 'beatW'], [.42, 'beatA'], [.75, 'fenteC'], [1.05, 'fenteA'], [2.3, 'fenteA'], [2.7, 'fenteR'], [3.05, 'salutDown'], [3.5, 'stand']],
    l: [[.42, 'clash'], [.55, 'beaten'], [1.05, 'hit'], [1.7, 'kneel'], [3.5, 'kneel']],
    ev: [[.42, 'clang'], [.48, 'disarm'], [1.05, 'throat'], [1.7, 'shake']], mv: [[.75, 1.05, 'w', 38]] },
  isaure: { name: 'Le Fil de l\'Aiguille', dur: 3.5, end: 'arriere',
    w: [[.12, 'dgDip'], [.27, 'dgA'], [.42, 'dgDip'], [.57, 'dgA'], [.72, 'dgDip'], [.87, 'dgA'], [1.25, 'jabA'], [2.4, 'jabA'], [2.75, 'salutUp'], [3.1, 'salutDown'], [3.5, 'stand']],
    l: [[.27, 'beaten'], [.57, 'clash'], [.87, 'beaten'], [1.25, 'hit'], [2.4, 'stumble']],
    ev: [[.27, 'nick'], [.57, 'nick'], [.6, 'disarm'], [.87, 'nick'], [1.25, 'throat']], mv: [[1, 1.25, 'w', 30]] },
  bastien: { name: 'Le Coup de dés', dur: 3.6, end: 'genou',
    w: [[.2, 'esqSotto'], [.55, 'esqSotto'], [.8, 'cA'], [1.4, 'stand'], [1.9, 'bowG'], [3, 'bowG'], [3.6, 'stand']],
    l: [[.3, 'jabA'], [.8, 'parried'], [1.4, 'stumble'], [2.1, 'kneel'], [3.6, 'kneel']],
    ev: [[.2, 'ghost'], [.8, 'clang'], [.82, 'disarmUp'], [2.1, 'shake']], mv: [[.2, .55, 'w', 26]] },
  alvaro: { name: 'Le Cercle parfait', dur: 3.6, end: 'genou', circle: true,
    w: [[.3, 'diestro'], [.7, 'lieW'], [1.0, 'lieA'], [1.6, 'lieA'], [1.9, 'jabA'], [2.7, 'jabA'], [3.1, 'diestro'], [3.6, 'stand']],
    l: [[1.0, 'beaten'], [1.6, 'beaten'], [1.9, 'hit'], [2.4, 'kneel'], [3.6, 'kneel']],
    ev: [[1.0, 'clang'], [1.55, 'disarm'], [1.9, 'throat']], mv: [[.2, .7, 'w', -16], [.7, 1.0, 'w', 30]] },
  corvin: { name: 'Le Pas de l\'Ombre', dur: 3.3, end: 'chute',
    w: [[.12, 'dashF'], [.45, 'dashF'], [.6, 'jabA'], [1.4, 'stand'], [1.9, 'nodO'], [3.3, 'stand']],
    l: [[.5, 'hit'], [1.0, 'stumble'], [3.3, 'stumble']],
    ev: [[.12, 'ghost'], [.22, 'ghost'], [.32, 'ghost'], [.5, 'nick'], [.55, 'disarm'], [1.0, 'fall']], mv: [[.12, .45, 'w', 'through']] },
  mathurin: { name: 'Brise-Garde', dur: 3.4, end: 'arriere',
    w: [[.3, 'shoulder'], [.7, 'tajoW'], [.95, 'tajoA'], [1.7, 'stand'], [2.2, 'shoulder'], [3.4, 'shoulder']],
    l: [[.95, 'broken'], [1.5, 'stumble']],
    ev: [[.95, 'smash'], [.98, 'disarm'], [1.5, 'fall']], mv: [[.6, .95, 'w', 24]] },
  // adversaires : chacun sa signature quand c'est lui qui gagne
  drac: { name: 'Le Festin du drac', dur: 3.3, end: 'arriere',
    w: [[.3, 'clawW'], [.55, 'clawA'], [.85, 'clawW'], [1.1, 'clawA'], [1.8, 'roar'], [2.8, 'roar'], [3.3, 'stand']],
    l: [[.55, 'broken'], [1.1, 'hit'], [1.6, 'stumble']],
    ev: [[.55, 'smash'], [.6, 'disarm'], [1.1, 'nick'], [1.8, 'shake']], mv: [[.3, .55, 'w', 22]] },
  rueda: { name: 'La Rueda', dur: 3.4, end: 'genou', circle: true,
    w: [[.3, 'esqVolte'], [.6, 'tajoW'], [.85, 'tajoA'], [1.2, 'lieA'], [2.2, 'lieA'], [2.6, 'diestro'], [3.4, 'stand']],
    l: [[.85, 'clash'], [1.2, 'beaten'], [1.8, 'kneel'], [3.4, 'kneel']],
    ev: [[.85, 'clang'], [.9, 'disarm'], [1.2, 'throat']], mv: [[.3, .6, 'w', -20], [.6, .85, 'w', 34]] },
  lanterne: { name: 'Éblouissement', dur: 3.3, end: 'genou',
    w: [[.3, 'lantern'], [.8, 'lantern'], [1.1, 'dgA'], [2.2, 'dgA'], [2.6, 'salutUp'], [3.3, 'stand']],
    l: [[.5, 'dazzle'], [1.1, 'hit'], [1.7, 'kneel'], [3.3, 'kneel']],
    ev: [[.5, 'flash'], [1.1, 'nick'], [1.15, 'disarm'], [1.3, 'throat']], mv: [[.9, 1.1, 'w', 30]] },
  horloger: { name: 'Minuit sonne', dur: 3.5, end: 'chute',
    w: [[.2, 'stand'], [1.1, 'stand'], [1.3, 'jabC'], [1.45, 'jabA'], [2.6, 'jabA'], [3.0, 'nodO'], [3.5, 'stand']],
    l: [[1.0, 'jabW'], [1.45, 'hit'], [2.0, 'stumble']],
    ev: [[.3, 'tick'], [.6, 'tick'], [.9, 'tick'], [1.2, 'midnight'], [1.45, 'throat'], [1.5, 'disarmUp'], [2.0, 'fall']], mv: [[1.3, 1.45, 'w', 34]], clock: true },
  garde: { name: 'Pour Son Éminence', dur: 3.2, end: 'arriere',
    w: [[.25, 'beatW'], [.42, 'beatA'], [.75, 'pommel'], [1.0, 'pommel'], [1.6, 'stand'], [2.1, 'salutUp'], [2.6, 'salutDown'], [3.2, 'stand']],
    l: [[.42, 'beaten'], [.8, 'hit'], [1.3, 'stumble']],
    ev: [[.42, 'clang'], [.46, 'disarm'], [.8, 'shake']], mv: [[.55, .8, 'w', 40]] },
  generic: { name: 'Désarmement', dur: 3.4, end: 'genou',
    w: [[.25, 'beatW'], [.42, 'beatA'], [.62, 'cW'], [.8, 'cA'], [1.15, 'jabA'], [2.1, 'jabA'], [2.5, 'triumph'], [3.0, 'triumph'], [3.4, 'stand']],
    l: [[.42, 'clash'], [.55, 'beaten'], [.8, 'parried'], [1.15, 'hit'], [1.7, 'kneel'], [3.4, 'kneel']],
    ev: [[.42, 'clang'], [.8, 'clang'], [.84, 'disarmUp'], [1.15, 'throat'], [1.7, 'shake']], mv: [[.95, 1.15, 'w', 30]] },
};
const FIN_X = {
  bowG: () => addPose(POSES.bow, { b1: 120, b2: 150 }), nodO: () => addPose(POSES.stand, { head: -18, torso: 6 }),
  roar: () => addPose(POSES.triumph, { head: 16, torso: -10, b1: 150, b2: 170 }),                       // le drac rugit, bras écartés
  lantern: () => addPose(POSES.stand, { b1: 70, b2: 95 }),                                                 // la main libre lève la lanterne
  dazzle: () => addPose(POSES.hit, { head: -20, b1: 100, b2: 140, torso: -14 }),                           // ébloui, le bras devant les yeux
  pommel: () => P({ px: 18, py: 82, torso: 16, head: -4, a1: 20, a2: 160, a3: 170, b1: -100, b2: -92, ff: 60, bf: -34, tw: 10 }), // coup de pommeau, lame retournée
};
const FIN_POSE = k => FIN_X[k] ? FIN_X[k]() : POSES[k] || POSES.g_ext;
const Finisher = {
  cur: null,
  // la touche décisive : finale si le match est gagné (Histoire, duel libre, tournois, Nuit de Paris)
  wants(winner, loser) {
    if (!CFG.finisher || G.silent || G.mode === 'training' || G.state !== 'fight' || !winner.J || !loser.J) return false;
    if (G.mode === 'run') return true; const i = winner.isPlayer ? 0 : 1; return G.wins[i] + 1 >= (G.winsNeeded || 2);
  },
  key(f) {
    if (f.isPlayer) { const k = typeof Cine !== 'undefined' && Cine.heroKey(); return FIN[k] ? k : 'generic'; }
    const n = (f.look && f.look.name) || ''; return f.arch === 'destreza' ? 'rueda' : f.arch === 'drac' ? 'drac' : f.sig === 'lanterne' ? 'lanterne' : f.sig === 'horloger' ? 'horloger' : /garde|rouvray|lieutenant|mousquetaire|capitaine/i.test(n) ? 'garde' : 'generic';
  },
  start(w, l) {
    const F = FIN[this.key(w)], d = w.dir;
    this.cur = { F, w, l, t: 0, fired: {}, x0: { w: w.x, l: l.x }, dir: { w: w.dir, l: l.dir }, mv: F.mv.map(m => ({ m: m[3] === 'through' ? [m[0], m[1], m[2], Math.abs(w.x - l.x) + 120] : m, done: 0 })) };
    const track = (f, list) => { const B = normPose(Object.assign({}, f.pose)); return [[0, B]].concat(list.map(([t, k]) => [t, FIN_POSE(k)])); };
    w.playTrack(track(w, F.w), F.dur + 1); l.playTrack(track(l, F.l), F.dur + 1); w.guarding = l.guarding = false;
    w.ghosts = []; this.gap = Math.abs(w.x - l.x);
    G.state = 'finish'; G.banner = null; G.slowT = 0; G.hitStop = .08; G.roundWinner = w;
    CutIn.show(w, F.name, w.isPlayer ? '#e8c46a' : '#d07060'); Snd.clang(true); $('touch').hidden = true;
    void d;
  },
  step(dt) {
    const c = this.cur; if (!c) return; c.t += dt; const { F, w, l } = c;
    for (const o of c.mv) { const [t0, t1, who, dx] = o.m, f = who === 'w' ? w : l; if (c.t < t0 || o.done >= 1) continue; const u = clamp((c.t - t0) / (t1 - t0), 0, 1), e = outC(u), step = (e - o.done) * dx; o.done = e;
      let s = step; if (dx > 0 && dx < 200) s = Math.min(step, Math.max(0, Math.abs(w.x - l.x) - 95)); f.x = clamp(f.x + c.dir[who] * s, 40, W - 40); } // direction fixée au départ (on peut traverser)
    if (F.circle) c.circ = Math.min(1, c.t / .8);
    for (const [t, ev] of F.ev) { const id = t + ev; if (c.t >= t && !c.fired[id]) { c.fired[id] = true; this.fire(ev, c); } }
    if (w.state === 'cine' || c.t < F.dur) { /* la piste se joue */ }
    if (c.t >= F.dur) this.finish();
  },
  fire(ev, c) {
    const { w, l } = c, wj = w.J, lj = l.J; if (!wj || !lj) return;
    const mid = [lerp(wj.tip[0], lj.wr[0], .5), lerp(wj.tip[1], lj.wr[1], .5)];
    switch (ev) {
      case 'clang': G.spark(mid, 22, '#fff3c8'); G.ring(mid, '#ffd27a', 180, .3); Snd.clang(true); G.shake = Math.max(G.shake, 4); Depth.hitFx(mid, 'parry'); G.slowT = Math.max(G.slowT, .15); break;
      case 'nick': G.spark(lj.el, 8, '#ffe6c0'); Snd.tick(); Depth.hitFx(lj.el, 'block'); break;
      case 'smash': G.spark(mid, 30, '#ffb070'); G.ring(mid, '#ffb070', 220); Snd.crack(); G.shake = 10; Depth.hitFx(mid, 'break'); Depth.kick(l.x, 8, w.dir); G.slowT = Math.max(G.slowT, .25); break;
      case 'throat': G.ring(lj.neck, '#f6ead0', 120, .4); Snd.ding(); G.slowT = Math.max(G.slowT, .35); G.zoom = Math.max(G.zoom, .08); break;
      case 'shake': G.shake = Math.max(G.shake, 3); Depth.kick(l.x, 5, -l.dir); break;
      case 'ghost': w.ghosts.unshift({ J: w.J, t: G.time }); if (w.ghosts.length > 4) w.ghosts.pop(); Snd.whiff && Snd.whiff(); break;
      case 'fall': break;
      case 'midnight': G.ring(wj.head, '#f6ead0', 260, .6); G.ring(wj.head, '#d8b25e', 160, .5); Snd.bell(); G.slowT = Math.max(G.slowT, .3); c.clockT = G.time; break;
      case 'tick': Snd.tick(); G.ring(wj.head, '#e6dcc4', 60, .25); break;
      case 'flash': G.flash = .35; Snd.ding(); break;
      case 'disarm': case 'disarmUp': if (!l.hatOff && norm(l.look).hatType && norm(l.look).hatType !== 'aucun' && norm(l.look).hatType !== 'capuche') { l.hatOff = true; (G.hats || (G.hats = [])).push({ x: lj.head[0], y: lj.head[1] - 12, vx: -l.dir * 70, vy: -260, a: 0, va: -l.dir * 9, col: norm(l.look).hat || '#1a1a1a', rest: false }); } // le chapeau vole
        if (!l.disarmed) { const J = lj; l.disarmed = true; const up = ev === 'disarmUp';
        G.drops.push({ f: l, cx: (J.wr[0] + J.tip[0]) / 2, cy: (J.wr[1] + J.tip[1]) / 2, L: Math.hypot(J.tip[0] - J.wr[0], J.tip[1] - J.wr[1]), ang: Math.atan2(J.tip[1] - J.wr[1], J.tip[0] - J.wr[0]), vx: -l.dir * (up ? 30 : 90), vy: up ? -420 : -160, va: l.dir * (up ? 14 : 8), rest: false }); } break;
    }
  },
  skip() { const c = this.cur; if (!c) return; for (const [t, ev] of c.F.ev) { const id = t + ev; if (!c.fired[id] && /disarm/.test(ev)) { c.fired[id] = true; this.fire(ev, c); } } this.finish(); },
  // fin : le vaincu tombe (ou reste à genoux), la manche se conclut comme d'habitude
  finish() {
    const c = this.cur; if (!c) return; this.cur = null; const { F, w, l } = c;
    l.koStyle = F.end; l.setState('ko'); l.t = F.end === 'genou' ? 1 : 0; w.setState('win');
    if (!l.disarmed && l.J) this.fire('disarm', { w, l });
    G.state = 'ko'; G.koT = .4; G.banner = { text: 'Victoire', sub: w.isPlayer ? 'Vous remportez le duel' : `${w.look.name} remporte le duel`, t: 0, dur: 2 };
  },
  cam() { const c = this.cur; if (!c) return null; const { w, l } = c; return { x: (w.x + l.x) / 2, s: 1.45 }; },
  // le cercle de la destreza, tracé au sol sous Álvaro ; le cadran de « Minuit sonne »
  drawWorld(g) {
    const c = this.cur; if (c && c.F.clock && c.w.J) { const t = c.t, hx = c.w.J.head[0], hy = c.w.J.head[1] - 70, a = Math.min(1, t / .3) * Math.max(0, Math.min(1, (2.2 - t) / .4)); if (a > 0) { g.save(); g.globalAlpha = a * .85; g.strokeStyle = '#e8d8b0'; g.lineWidth = 2; g.beginPath(); g.arc(hx, hy, 26, 0, 7); g.stroke(); for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(hx + Math.cos(an) * 21, hy + Math.sin(an) * 21); g.lineTo(hx + Math.cos(an) * 25, hy + Math.sin(an) * 25); g.stroke(); } const hand = -Math.PI / 2 - Math.PI / 6 * Math.max(0, 3 - Math.floor(t / .3)); g.lineWidth = 3; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + Math.cos(hand) * 20, hy + Math.sin(hand) * 20); g.stroke(); g.lineWidth = 2; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx, hy - 14); g.stroke(); g.restore(); } } if (!c || !c.circ) return; const x = (c.w.x + c.l.x) / 2, r = 120 * c.circ;
    g.save(); g.strokeStyle = `rgba(232,196,106,${.6 * c.circ})`; g.lineWidth = 2; g.beginPath(); g.ellipse(x, GROUND + 4, r, r * .16, 0, 0, Math.PI * 2 * c.circ); g.stroke();
    g.lineWidth = 1; g.beginPath(); g.moveTo(x - r, GROUND + 4); g.lineTo(x + r, GROUND + 4); g.stroke(); g.restore();
  },
};
