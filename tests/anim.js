// animations et biomécanique : 12 vérifications (voir le rapport « Optimisation des animations »)
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => {
    const o = {}, KINDS = ['jab', 'fente', 'bassa', 'degage', 'circ', 'compo', 'heavy', 'riposte', 'beat', 'lie', 'tajo', 'griffe'];
    const segPt = (a, b2, c, r) => segDist(a, b2, c, c).d < r;
    // joue un coup seul (adversaire hors de portée, immobile) et relève chaque pas de 1/120 s
    const play = (k, d = 900, pre) => { T.setup(d); const f = G.p; if (pre) pre(f); else f.startMove(k); const fr = []; for (let i = 0; i < 160 && (f.state === 'attack' || i < 2); i++) { T.stepN(1); const J = f.J, p = f.pose; fr.push({ t: f.t, st: f.state, ph: f.phase && f.move ? f.phase() : null, wr: J.wr.slice(), tip: J.tip.slice(), head: J.head.slice(), neck: J.neck.slice(), gx: J.gx, gy: J.gy, el: p.a2 - p.a1, wrist: p.a3 - p.a2, a3: p.a3, bz: p.bz, ff: f.feet.f.x, bf: f.feet.b.x, x: f.x, fl: f.feet.f.lift, bl: f.feet.b.lift }); } return fr; };
    // 1. continuité de la pointe : aucun saut (déplacement de la pointe par pas de simulation)
    o.jump = {}; for (const k of KINDS) { const fr = play(k); let m = 0; for (let i = 1; i < fr.length; i++) m = Math.max(m, Math.hypot(fr[i].tip[0] - fr[i - 1].tip[0], fr[i].tip[1] - fr[i - 1].tip[1])); o.jump[k] = Math.round(m); }
    // 2. limites articulaires : coude jamais retourné, poignet borné, sur tous les coups et toutes les réactions
    o.limits = { el: [999, -999], wr: [999, -999] }; const lim = fr => fr.forEach(q => { o.limits.el[0] = Math.min(o.limits.el[0], q.el); o.limits.el[1] = Math.max(o.limits.el[1], q.el); o.limits.wr[0] = Math.min(o.limits.wr[0], q.wrist); o.limits.wr[1] = Math.max(o.limits.wr[1], q.wrist); });
    for (const k of KINDS) lim(play(k));
    for (const [s, d] of [['parried', .8], ['broken', .78], ['hit', .5], ['clash', .34], ['beaten', .38]]) { T.setup(900); G.p.setState(s, d); const fr = []; for (let i = 0; i < 110; i++) { T.stepN(1); const p = G.p.pose; fr.push({ el: p.a2 - p.a1, wrist: p.a3 - p.a2 }); } lim(fr); }
    o.limits.el = o.limits.el.map(Math.round); o.limits.wr = o.limits.wr.map(Math.round);
    // 3. la lame ne traverse jamais le corps de son propre combattant (tronc et tête), hors garde de la main
    o.self = {}; for (const k of KINDS) { const fr = play(k); let n = 0; for (const q of fr) { const L = Math.hypot(q.tip[0] - q.wr[0], q.tip[1] - q.wr[1]); if (L < 20) continue; const u0 = 18 / L, a = [q.wr[0] + (q.tip[0] - q.wr[0]) * u0, q.wr[1] + (q.tip[1] - q.wr[1]) * u0];
      if (segDist(a, q.tip, [q.gx, q.gy + 6], q.neck).d < 12 || segDist(a, q.tip, q.head, q.head).d < 10) n++; } o.self[k] = n; }
    // 4. fente lourde : tour complet de la pointe au-dessus de la tête, puis coup final ; contact seulement après le moulinet
    { const fr = play('heavy'); const m0 = G.p; let sweep = 0, prev = null, above = 0, nCircle = 0, outOfPlane = 0, maxBz = 0;
      for (const q of fr) { const dx = (q.tip[0] - q.wr[0]) * 1, dy = q.tip[1] - q.wr[1]; // direction 3D de la lame (bz : sortie du plan)
        const L = 112, c = Math.cos(q.bz * Math.PI / 180), v = [Math.cos(q.a3 * Math.PI / 180) * c, Math.sin(q.bz * Math.PI / 180)];
        if (Math.abs(q.bz) > 1) { nCircle++; const ang = Math.atan2(v[1], v[0]); if (prev !== null) { let d = ang - prev; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; sweep += d; } prev = ang; if (q.wr[1] < q.head[1] - 10 && q.tip[1] < q.head[1]) above++; }
        maxBz = Math.max(maxBz, Math.abs(q.bz)); }
      o.heavy = { sweepDeg: Math.round(Math.abs(sweep) * 180 / Math.PI), circleFrames: nCircle, handAboveHead: above, maxBz: Math.round(maxBz) };
      // contact : jamais pendant le moulinet (lame hors du plan) ; au contact la lame descend de l'avant
      T.setup(230); let at = null, bzAt = null, a3At = null; G.p.startMove('heavy'); for (let i = 0; i < 100 && !T.ev.length; i++) { T.stepN(1); if (G.p.move && G.p.move.contact && at === null) { at = G.p.t; bzAt = G.p.pose.bz; a3At = G.p.pose.a3; } }
      o.heavyContact = { t: at && +at.toFixed(3), bz: bzAt && Math.round(bzAt), a3: a3At && Math.round(a3At), ev: T.types()[0] };
      // la garde tenue est brisée
      T.setup(260); T.holdGuard(G.e, 'ext'); G.p.startMove('heavy'); for (let i = 0; i < 100 && !T.ev.length; i++) T.stepN(1); o.heavyBreaks = T.types()[0]; }
    // 5. phases distinctes de chaque attaque : anticipation (recul / compression) avant l'exécution, poursuite puis retour en garde
    o.phases = {}; for (const k of ['jab', 'fente', 'bassa', 'degage', 'circ', 'heavy', 'riposte']) { const fr = play(k); const x0 = fr[0].tip[0]; const pre = fr.filter(q => q.ph === 'prep'); const minPre = Math.min(...pre.map(q => q.tip[0])), ex = fr.filter(q => q.ph === 'exec'); const last = fr[fr.length - 1];
      o.phases[k] = { anticipation: k === 'riposte' ? 'n/a' : Math.round(x0 - minPre), exec: ex.length, recovered: last.st !== 'attack', ends: Math.round(G.p.pose.a3) }; }
    // 6. pieds : aucun glissement en garde ni au repos (3 s), les pas sont de vrais pas (pied levé pendant qu'il voyage)
    { T.setup(260); let dF = 0, dB = 0; const f0 = G.p.feet.f.x, b0 = G.p.feet.b.x; for (let i = 0; i < 360; i++) { T.stepN(1); dF = Math.max(dF, Math.abs(G.p.feet.f.x - f0)); dB = Math.max(dB, Math.abs(G.p.feet.b.x - b0)); } o.idleDrift = [+dF.toFixed(2), +dB.toFixed(2)];
      T.setup(330); let slide = 0, lifted = 0, prevF = G.p.feet.f.x, prevB = G.p.feet.b.x; for (let i = 0; i < 120; i++) { G.p.intent.dx = i < 60 ? 1 : -1; const wasF = !!G.p.feet.f.st, wasB = !!G.p.feet.b.st; T.stepN(1); const F = G.p.feet; const mf = Math.abs(F.f.x - prevF), mb = Math.abs(F.b.x - prevB); if ((mf > .3 && !F.f.st && !wasF) || (mb > .3 && !F.b.st && !wasB)) slide++; if (F.f.lift > 1 || F.b.lift > 1) lifted++; prevF = F.f.x; prevB = F.b.x; } o.walk = { slideSteps: slide, liftedSteps: lifted }; }
    // 7. indépendance au rythme d'images : même simulation à 30, 60, 120 et 144 im/s (fente lourde manquée + marche)
    { const R0 = G.render, RAF = window.requestAnimationFrame; G.render = () => { }; window.requestAnimationFrame = () => 0; const out = {};
      for (const fps of [30, 60, 120, 144]) { T.setup(700); G.time = 0; G.last = 0; G.acc = 0; G.p.startMove('heavy'); let n = 0, snap = null; const st0 = G.step; G.step = function (dt) { st0.call(G, dt); n++; if (n === 150) snap = { x: +G.p.x.toFixed(3), tip: G.p.J.tip.map(v => +v.toFixed(3)), a3: +G.p.pose.a3.toFixed(3), st: G.p.state }; }; let now = 0; while (n < 200) { now += 1000 / fps; G.frame(now); } G.step = st0; out[fps] = snap; }
      G.render = R0; window.requestAnimationFrame = RAF; o.fps = out; }
    // 8. durées : chaque coup dure exactement wu + act + rec (en temps de simulation), même en préparation ralentie
    o.dur = {}; for (const k of ['jab', 'fente', 'heavy']) { const fr = play(k); const M = MOVES[k]; o.dur[k] = [+(fr.length / 120).toFixed(3), +(M.wu + M.act + M.rec + M.whiff).toFixed(3)]; }
    // 9. interruption propre : fente lourde interrompue au milieu du moulinet (touchée, parée, garde brisée) → aucune rotation parasite
    o.interrupt = {}; for (const [s, d] of [['hit', .5], ['parried', .8], ['clash', .34]]) { T.setup(900); G.p.startMove('heavy'); T.stepN(26); const a0 = G.p.pose.a3; G.p.setState(s, d); let maxStep = 0, prevA = G.p.pose.a3, prevTip = G.p.J.tip.slice(), maxTip = 0; for (let i = 0; i < 100; i++) { T.stepN(1); maxStep = Math.max(maxStep, Math.abs(G.p.pose.a3 - prevA)); prevA = G.p.pose.a3; maxTip = Math.max(maxTip, Math.hypot(G.p.J.tip[0] - prevTip[0], G.p.J.tip[1] - prevTip[1])); prevTip = G.p.J.tip.slice(); } o.interrupt[s] = { a3from: Math.round(a0), maxDegPerStep: +maxStep.toFixed(1), maxTipPerStep: Math.round(maxTip), bz: Math.round(G.p.pose.bz), back: G.p.state }; }
    // 10. réactions dynamiques : le déséquilibre et la garde brisée bougent (pas des poses figées) et reviennent en garde
    o.react = {}; for (const [s, d] of [['parried', .8], ['broken', .78], ['hit', .5]]) { T.setup(900); G.p.setState(s, d); const py = [], tor = []; for (let i = 0; i < Math.round(d * 120) + 30; i++) { T.stepN(1); py.push(G.p.pose.py); tor.push(G.p.pose.torso); } o.react[s] = { pyRange: +(Math.max(...py) - Math.min(...py)).toFixed(1), torsoRange: +(Math.max(...tor) - Math.min(...tor)).toFixed(1), end: G.p.state }; }
    // 11. réactivité : un appui bref reste une estocade, maintenu → fente lourde ; Feinte pendant l'estocade → attaque composée
    { T.setup(900); const it = G.p.intent; it.holdAtk = true; G.p.startPending('jab'); T.stepN(8); it.holdAtk = false; T.stepN(2); const k1 = G.p.move && G.p.move.kind; T.setup(900); it.holdAtk = true; G.p.intent.holdAtk = true; G.p.startPending('jab'); T.stepN(30); const k2 = G.p.move && G.p.move.kind; o.react2 = { tap: k1, hold: k2 }; }
    // 12. pause : rien ne bouge
    { T.setup(500); G.p.startMove('heavy'); T.stepN(20); const RAF = window.requestAnimationFrame, R0 = G.render; window.requestAnimationFrame = () => 0; G.render = () => { }; const t0 = G.p.t, a0 = G.p.pose.a3; G.state = 'pause'; let now = G.last; for (let i = 0; i < 30; i++) { now += 16.7; G.frame(now); } o.pause = { dt: G.p.t - t0, da: G.p.pose.a3 - a0 }; G.state = 'fight'; window.requestAnimationFrame = RAF; G.render = R0; }
    // coût : animate + pieds + articulations, par combattant et par pas
    { T.setup(260); const f = G.p; f.startMove('heavy'); const t0 = performance.now(); for (let i = 0; i < 4000; i++) { f.animate(1 / 120); f.updateFeet(1 / 120); f.joints(); } o.costUs = +((performance.now() - t0) / 4000 * 1000).toFixed(2); }
    return o;
  });
  console.log(JSON.stringify(r));
  ok('1. continuité : la pointe ne saute jamais (estocs ≤ 40 px, coups de taille ≤ 60 px par pas de 1/120 s)', Object.entries(r.jump).every(([k, v]) => v <= (k === 'tajo' || k === 'heavy' ? 60 : 40)), r.jump);
  ok('2. limites articulaires : coude jamais retourné ni hyper-tendu, poignet borné', r.limits.el[0] >= -40 && r.limits.el[1] <= 165 && r.limits.wr[0] >= -125 && r.limits.wr[1] <= 125, r.limits);
  ok('3. la lame ne traverse jamais le tronc ni la tête de son porteur', Object.values(r.self).every(v => v === 0), r.self);
  ok('4a. fente lourde : la pointe fait un tour complet (≥ 330°) hors du plan, main au-dessus de la tête', r.heavy.sweepDeg >= 330 && r.heavy.handAboveHead >= r.heavy.circleFrames * .8 && r.heavy.maxBz >= 50, r.heavy);
  ok('4b. fente lourde : le contact vient du coup final (lame dans le plan, qui descend de l\'avant), pas du moulinet', r.heavyContact.t && Math.abs(r.heavyContact.bz) < 5 && r.heavyContact.a3 < 90 && r.heavyContact.ev === 'hit', r.heavyContact);
  ok('4c. fente lourde : brise toujours la garde tenue', r.heavyBreaks === 'break', r.heavyBreaks);
  ok('5. chaque attaque : anticipation (la pointe recule d\'abord), exécution, retour en garde', Object.entries(r.phases).every(([k, v]) => (v.anticipation === 'n/a' || v.anticipation >= 3) && v.exec >= 6 && v.recovered), r.phases);
  ok('6a. au repos et en garde, les pieds ne glissent pas', r.idleDrift[0] === 0 && r.idleDrift[1] === 0, r.idleDrift);
  ok('6b. en marche, un pied ne bouge que pendant un pas (levé), jamais en glissant', r.walk.slideSteps === 0 && r.walk.liftedSteps > 10, r.walk);
  const f = Object.values(r.fps); ok('7. même résultat à 30, 60, 120 et 144 images/s', f.every(v => v.x === f[0].x && v.tip[0] === f[0].tip[0] && v.tip[1] === f[0].tip[1] && v.a3 === f[0].a3), r.fps);
  ok('8. durées : un coup manqué dure wu + act + rec + pénalité, en temps de jeu', Object.values(r.dur).every(([a, e]) => Math.abs(a - e) < .02), r.dur);
  ok('9. interruption du moulinet : retour propre (pas de tour à rebours, lame ramenée dans le plan)', Object.values(r.interrupt).every(v => v.maxDegPerStep <= 12.6 && v.maxTipPerStep <= 32 && Math.abs(v.bz) < 2), r.interrupt);
  ok('10. réactions vivantes : déséquilibre, garde brisée, touche bougent puis reviennent en garde', Object.values(r.react).every(v => (v.pyRange > 2 || v.torsoRange > 4) && v.end === 'idle'), r.react);
  ok('11. réactivité : appui bref → estocade, maintenu → fente lourde', r.react2.tap === 'jab' && r.react2.hold === 'heavy', r.react2);
  ok('12. pause : la simulation et les poses sont figées', r.pause.dt === 0 && r.pause.da === 0, r.pause);
  ok('coût de l\'animation < 15 µs par combattant et par pas (PC de test)', r.costUs < 15, r.costUs);
  ok('aucune erreur JavaScript', errs.length === 0, errs);
  console.log(`${res.filter(Boolean).length}/${res.length}`); await b.close();
})();
