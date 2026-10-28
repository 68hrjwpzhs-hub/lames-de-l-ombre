// le jeu de lames : battement, prise de fer, dérobement, opposition, engagement
const { open } = require('./lib');
const fs = require('fs');
const results = []; const ok = (name, cond, detail) => { results.push({ name, pass: !!cond, detail }); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : '')); };
(async () => {
  const { b, pg, errs } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const E = (fn, arg) => pg.evaluate(fn, arg);

  const r = await E(() => {
    const o = {};
    // commandes
    const cmd = keys => { T.setup(225); T.inputOn = true; Input.keys.clear(); Input.tap = null; Input.prevHx = 0; for (const k of keys) Input.keys.add(k); T.stepN(3); Input.pressed.feint = true; T.stepN(2); const p = G.p; const s = p.state === 'attack' ? p.move.kind : p.state; Input.keys.clear(); T.inputOn = false; return s; };
    o.cmd = { neutre: cmd([]), avant: cmd(['KeyD']), bas: cmd(['KeyS']), arriere: cmd(['KeyA']) };
    o.reach = { jab: Math.round(REACH.jab), fente: Math.round(REACH.fente), beat: REACH.beat, lie: Math.round(REACH.lie) };
    const run = (n = 200) => { T.stepUntil(() => false, n); return T.types(); };
    // battement contre un adversaire en garde, puis estocade : elle passe malgré la garde maintenue
    T.setup(225); T.holdGuard(G.e, 'ext'); G.p.intent.act = 'beat'; T.stepUntil(() => T.ev.length, 100); o.beatGuard = { ev: T.types(), eState: G.e.state };
    G.p.intent.act = 'jab'; T.stepUntil(() => G.p.move && G.p.move.kind === 'jab', 60); o.beatQuick = G.p.move && G.p.move.quick; T.stepUntil(() => T.ev.length > 1, 120); o.beatThenJab = T.types();
    // sans battement, la même estocade est bloquée
    T.setup(225); T.holdGuard(G.e, 'ext'); G.p.intent.act = 'jab'; T.stepUntil(() => T.ev.length, 120); o.jabVsGuard = T.types();
    // battement hors de mesure
    T.setup(REACH.beat + 40); G.p.intent.act = 'beat'; o.beatFar = run(80);
    // battement contre un dégagement en préparation : dérobement
    T.setup(225); G.e.intent.act = 'degage'; T.stepN(4); G.p.intent.act = 'beat'; T.stepUntil(() => T.types().includes('derob') || T.types().includes('beat'), 100); o.beatVsDegage = T.types();
    // battement contre une estocade en préparation : l'attaque est battue
    T.setup(225); G.e.slow = 1.6; G.e.intent.act = 'jab'; T.stepN(1); G.p.intent.act = 'beat'; T.stepUntil(() => T.ev.length, 100); o.beatVsJabPrep = { ev: T.types(), e: G.e.state };
    // prise de fer contre garde tenue : touche
    T.setup(225); T.holdGuard(G.e, 'ext'); G.p.intent.act = 'lie'; T.stepUntil(() => T.ev.length, 150); o.lieVsGuard = { ev: T.types(), through: !!(T.ev[0] && T.ev[0].i.throughGuard) };
    // prise de fer contre parade au bon moment : parade
    T.setup(225); G.p.intent.act = 'lie'; T.stepN(1); const lw = G.p.move.wu; T.stepN(Math.round(lw * 120) - 6); G.e.intent.guard = true; T.stepUntil(() => T.ev.length, 100); o.lieVsParry = T.types();
    // prise de fer contre dégagement : dérobement, le dégagement touche
    T.setup(225); G.p.intent.act = 'lie'; T.stepN(14); G.e.intent.act = 'degage'; T.stepUntil(() => T.ev.length > 1, 150); o.lieVsDegage = T.types();
    // estocade dans une prise de fer engagée : opposition, puis la prise touche
    T.setup(225); G.e.intent.act = 'jab'; T.stepN(3); G.p.intent.act = 'lie'; T.stepUntil(() => T.ev.length > 1, 150); o.jabIntoLie = T.types();
    // contretemps : estocade avant que la prise de fer ne soit engagée
    T.setup(225); G.e.intent.act = 'jab'; T.stepN(16); G.p.intent.act = 'lie'; T.stepUntil(() => T.ev.length, 150); o.stopHitLie = { ev: T.types(), a: T.ev[0] && T.ev[0].i.a === G.e };
    // engagement des lames au repos, de près
    T.setup(230); T.stepN(60); o.engaged170 = G.engaged; T.setup(330); T.stepN(60); o.engaged300 = G.engaged;
    T.setup(230); T.stepN(60); G.p.intent.act = 'lie'; T.stepN(1); o.lieEngWu = G.p.move.wu; T.setup(330); G.p.intent.act = 'lie'; T.stepN(1); o.lieWu = G.p.move.wu;
    return o;
  });
  console.log(JSON.stringify(r.reach));
  ok('→ + Feinte : battement ; ↓ + Feinte : prise de fer ; Feinte seule ou ← : feinte', r.cmd.avant === 'beat' && r.cmd.bas === 'lie' && r.cmd.neutre === 'feint' && r.cmd.arriere === 'feint', r.cmd);
  ok('battement contre une garde tenue : la lame est chassée', r.beatGuard.ev[0] === 'beat' && r.beatGuard.eState === 'beaten', r.beatGuard);
  ok('après un battement, l\'estocade part vite et touche malgré la garde maintenue', r.beatQuick && r.beatThenJab[1] === 'hit', { quick: r.beatQuick, ev: r.beatThenJab });
  ok('sans battement, la même estocade est bloquée', r.jabVsGuard[0] === 'block', r.jabVsGuard);
  ok('battement hors de mesure : dans le vide', r.beatFar.includes('beatMiss') && !r.beatFar.includes('beat'), r.beatFar);
  ok('battement contre un dégagement : dérobement', r.beatVsDegage[0] === 'derob', r.beatVsDegage);
  ok('battement dans la préparation d\'une estocade : l\'attaque est battue', r.beatVsJabPrep.ev[0] === 'beat' && r.beatVsJabPrep.e === 'beaten', r.beatVsJabPrep);
  ok('prise de fer contre garde tenue : elle passe', r.lieVsGuard.ev[0] === 'hit' && r.lieVsGuard.through, r.lieVsGuard);
  ok('prise de fer contre parade au bon moment : parée', r.lieVsParry[0] === 'parry', r.lieVsParry);
  ok('prise de fer contre dégagement : dérobement, puis le dégagement touche', r.lieVsDegage[0] === 'derob' && r.lieVsDegage[1] === 'hit', r.lieVsDegage);
  ok('estocade dans une prise de fer engagée : opposition, puis la prise touche', r.jabIntoLie[0] === 'opposition' && r.jabIntoLie[1] === 'hit', r.jabIntoLie);
  ok('estocade avant l\'engagement de la prise : contretemps qui touche', r.stopHitLie.ev[0] === 'hit' && r.stopHitLie.a, r.stopHitLie);
  ok('fer engagé à portée d\'estocade au repos, pas hors de mesure', r.engaged170 === true && r.engaged300 === false, [r.engaged170, r.engaged300]);
  ok('fer engagé : la prise de fer part plus vite', r.lieEngWu < r.lieWu * .9, [r.lieEngWu, r.lieWu]);

  // IA : elle utilise le fer et s'y dérobe ; hiérarchie des niveaux conservée
  const ai = await E(() => {
    const agg = { beats: 0, beatOk: 0, lies: 0, derob: 0, opp: 0 }, res = {};
    for (const [a, b] of [['maitre', 'duelliste'], ['duelliste', 'debutant'], ['maitre', 'debutant']]) {
      let w = 0, n = 0;
      for (let i = 0; i < 6; i++) { const m = T.match(a, b); if (m.over) { n++; if (m.wins[0] > m.wins[1]) w++; } for (const s of [m.ps, m.es]) for (const k in agg) agg[k] += s[k] || 0; }
      res[a + '>' + b] = w + '/' + n;
    }
    return { agg, res };
  });
  console.log(JSON.stringify(ai));
  ok('l\'IA utilise le battement et la prise de fer, et se dérobe', ai.agg.beats > 0 && ai.agg.lies > 0 && ai.agg.derob > 0, ai.agg);
  ok('hiérarchie des niveaux conservée (le plus fort gagne au moins 4 matchs sur 6)', Object.values(ai.res).every(v => +v.split('/')[0] >= 4), ai.res);
  ok('aucune erreur JavaScript', errs.length === 0, errs);
  console.log(`\n${results.filter(r => r.pass).length}/${results.length} tests réussis`);
  fs.writeFileSync(__dirname + '/out/fer.json', JSON.stringify({ results, r, ai }, null, 1));
  await b.close();
})();
