// blessures : coups critiques (riposte parfaite, coup d'arrêt, garde brisée), effets localisés, faiblesse, désespoir, coup de grâce
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open(); await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => {
    const o = {};
    // 1. touche ordinaire : pas de blessure localisée
    T.setup(225); G.e.intent.act = 'jab'; T.stepUntil(() => T.ev.length, 200); o.plain = { ev: T.types()[0], w: Object.assign({}, G.p.wounds) };
    // 2. coup d'arrêt : le joueur touche pendant la préparation de la fente adverse
    T.setup(300); G.e.startMove('fente'); T.stepN(4); G.p.startMove('jab'); T.stepUntil(() => T.ev.length, 200); o.stop = { ev: T.types()[0], w: Object.assign({}, G.e.wounds), crit: G.p.stats.crits || 0 };
    // 3. garde brisée puis estocade : critique
    T.setup(260); T.holdGuard(G.e, 'ext'); G.p.startMove('heavy'); T.stepUntil(() => G.e.state === 'broken', 200); G.e.intent.guard = false; T.ev = []; G.p.state = 'idle'; G.p.move = null; G.p.startMove('jab'); T.stepUntil(() => T.ev.length, 200);
    o.broken = { ev: T.types()[0], w: Object.assign({}, G.e.wounds) };
    // 4. effets : jambe (marche plus lente), bras (préparation plus lente), flanc (récupération plus lente)
    T.setup(500); G.p.intent.dx = 1; T.stepN(60); const v0 = G.p.vx; T.setup(500); G.p.wounds.jambe = 1; G.p.intent.dx = 1; T.stepN(60); const v1 = G.p.vx;
    T.setup(900); G.p.startMove('jab'); const w0 = G.p.move.wu, r0 = G.p.move.rec; T.setup(900); G.p.wounds.bras = 1; G.p.wounds.torse = 1; G.p.startMove('jab'); o.fx = { walk: +(v1 / v0).toFixed(3), wu: +(G.p.move.wu / w0).toFixed(3), rec: +(G.p.move.rec / r0).toFixed(3) };
    // 5. boiterie : en marche, la jambe blessée fait plonger le bassin quand l'autre pied voyage
    const dip = w => { T.setup(500); G.p.wounds.jambe = w; let mn = 99, mx = -99; for (let i = 0; i < 200; i++) { G.p.intent.dx = 1; T.stepN(1); mn = Math.min(mn, G.p.pose.py); mx = Math.max(mx, G.p.pose.py); } return +(mx - mn).toFixed(2); }; o.limp = [dip(0), dip(1)];
    // 6. désespoir : sous 30 %, la fenêtre de parade du défenseur s'élargit
    T.setup(225); G.e.intent.act = 'jab'; let c0 = null; for (let i = 0; i < 100 && !c0; i++) { T.stepN(1); const c = G.cueInfo(); if (c) c0 = c.win; } T.setup(225); G.p.hp = 25; G.e.intent.act = 'jab'; let c1 = null; for (let i = 0; i < 100 && !c1; i++) { T.stepN(1); const c = G.cueInfo(); if (c) c1 = c.win; } o.despair = [c0, c1].map(v => v && +v.toFixed(3));
    // 7. coup de grâce : la rapière tombe et se pose à plat au sol, le vaincu tombe à genoux puis au sol
    T.setup(225); G.mode = 'duel'; G.state = 'fight'; G.e.hp = 5; G.p.startMove('jab'); T.stepUntil(() => G.e.state === 'ko', 200); const kneel = [], dis = G.e.disarmed; for (let i = 0; i < 230; i++) { T.stepN(1); if (i === 60 || i === 229) kneel.push(G.e.pose.py); } const dr = G.drops[0];
    o.ko = { disarmed: dis, drop: dr && { rest: dr.rest, y: Math.round(dr.cy), flat: Math.abs(Math.sin(dr.ang)) < .05 }, py: kneel.map(Math.round), style: G.e.koStyle };
    // 8. nouvelle manche : blessures et rapière remises à zéro
    G.p.reset(300); G.e.reset(660); o.reset = { w: Object.values(G.e.wounds).reduce((a, b) => a + b, 0), dis: G.e.disarmed, marks: G.e.marks.length };
    return o;
  });
  console.log(JSON.stringify(r));
  ok('touche ordinaire : aucune blessure localisée', r.plain.ev === 'hit' && Object.values(r.plain.w).every(v => v === 0), r.plain);
  ok('coup d\'arrêt dans la préparation adverse : blessure localisée', r.stop.ev === 'hit' && Object.values(r.stop.w).some(v => v === 1), r.stop);
  ok('touche sur garde brisée : blessure localisée', r.broken.ev === 'hit' && Object.values(r.broken.w).some(v => v === 1), r.broken);
  ok('effets mesurés : marche −12 % (jambe), préparation +8 % (bras), récupération +8 % (flanc)', Math.abs(r.fx.walk - .88) < .02 && Math.abs(r.fx.wu - 1.08) < .01 && Math.abs(r.fx.rec - 1.08) < .01, r.fx);
  ok('boiterie visible en marche (le bassin plonge davantage)', r.limp[1] > r.limp[0] + 2, r.limp);
  ok('énergie du désespoir : fenêtre de parade +0,03 s sous 30 % de vie', r.despair[0] && Math.abs(r.despair[1] - r.despair[0] - .03) < .002, r.despair);
  ok('coup de grâce : rapière lâchée qui se pose à plat, chute à genoux puis au sol', r.ko.disarmed && r.ko.drop && r.ko.drop.rest && r.ko.drop.flat && (r.ko.style === 'arriere' ? r.ko.py[0] > 60 : r.ko.style === 'genou' ? r.ko.py[1] < 65 : r.ko.py[0] < 65) && (r.ko.style === 'genou' || r.ko.py[1] < 40), r.ko);
  ok('nouvelle manche : blessures, taches et rapière remises à zéro', r.reset.w === 0 && !r.reset.dis && r.reset.marks === 0, r.reset);
  ok('aucune erreur JavaScript', errs.length === 0, errs);
  console.log(`${res.filter(Boolean).length}/${res.length}`); await b.close();
})();
