// relecture du dernier échange et souffle
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(500);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => { const o = {};
    const why = setup => { T.setup(225); G.mode = 'duel'; G.state = 'fight'; setup(); T.stepUntil(() => T.types().includes('hit'), 300); return Replay.last && Replay.last.why; };
    o.noGuard = why(() => { T.stepN(60); G.e.intent.act = 'jab'; });
    o.stop = why(() => { T.stepN(60); G.e.startMove('jab'); T.stepN(6); G.p.startMove('fente'); });
    o.lie = why(() => { T.holdGuard(G.p, 'ext'); G.e.intent.act = 'lie'; });
    // relecture : l'état est figé, les images défilent, puis la partie reprend
    why(() => { T.stepN(80); G.e.intent.act = 'jab'; }); const t0 = G.time, x0 = G.p.x; Replay.start(); o.state = G.state; o.frames = Replay.cur && Replay.cur.frames.length;
    for (let i = 0; i < 40; i++) { Replay.update(1 / 60); if (G.state === 'replay') Replay.render(1 / 60); } o.idx = Replay.cur && Math.round(Replay.cur.i); o.frozen = G.time === t0 && G.p.x === x0;
    for (let i = 0; i < 2000 && G.state === 'replay'; i++) Replay.update(1 / 60); o.back = G.state;
    // souffle : cinq estocades d'affilée essoufflent ; à distance, il revient
    T.setup(900); for (let i = 0; i < 5; i++) { G.p.startMove('jab'); T.stepUntil(() => G.p.state !== 'attack', 200); } o.breath5 = +G.p.breath.toFixed(2); o.winded = G.p.winded; G.p.startMove('jab'); o.wuWinded = +G.p.move.wu.toFixed(3);
    T.stepN(120 * 3); o.breath3s = +G.p.breath.toFixed(2);
    // acculé : dos au mur, pas de retraite rapide
    T.setup(200); G.p.x = 60; G.e.x = 300; T.stepN(5); o.cornered = G.p.cornered; o.canDashBack = G.p.canDash(-1);
    return o; });
  console.log(JSON.stringify(r));
  ok('explication : pas de garde', /Pas de garde/.test(r.noGuard), r.noGuard);
  ok('explication : contre-temps pendant votre préparation', /Contre-temps/.test(r.stop || ''), r.stop);
  ok('explication : prise de fer à travers la garde', /Prise de fer/.test(r.lie || ''), r.lie);
  ok('relecture : la partie est figée, les images défilent au ralenti, puis tout reprend', r.state === 'replay' && r.frames >= 30 && r.idx > 5 && r.frozen && r.back === 'fight', { st: r.state, fr: r.frames, idx: r.idx, frozen: r.frozen, back: r.back });
  ok('souffle : 5 estocades d\'affilée essoufflent, la préparation ralentit', r.winded && r.breath5 < .3 && r.wuWinded > .17 * 1.1, { b: r.breath5, wu: r.wuWinded });
  ok('souffle : revient à distance (plus des deux tiers en 3 s)', r.breath3s > .7, r.breath3s);
  ok('acculé : plus de retraite rapide dos au mur', r.cornered && !r.canDashBack, r);
  ok('aucune erreur JavaScript', errs.length === 0, errs);
  console.log(`${res.filter(Boolean).length}/${res.length}`); await b.close();
})();
