// garde qui suit la lame adverse, geste de parade ample, pointe qui rougeoie (Facile et Normal)
const { open } = require('./lib'); const fs = require('fs');
const results = []; const ok = (name, cond, detail) => { results.push({ name, pass: !!cond }); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open(); await pg.setViewportSize({ width: 1280, height: 720 });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => {
    const o = { cue: {}, track: {} };
    // 1. appuyer sur Garde au premier instant où la pointe rougeoie, ou au milieu de l'allumage : parade parfaite pour chaque coup
    const kinds = ['jab', 'fente', 'bassa', 'degage', 'circ', 'compo', 'heavy', 'lie', 'tajo', 'griffe'];
    for (const pw of ['large', 'normale']) { G.pw = pw; CFG.perfect = PARRY_PRESETS[pw];
      for (const k of kinds) for (const when of ['debut', 'milieu']) {
        const d = { jab: 225, fente: 300, bassa: 230, degage: 225, circ: 230, compo: 230, heavy: 280, lie: 240, tajo: 215, griffe: 165 }[k];
        T.setup(d); G.pw = pw; G.e.intent.act = k; let pressed = false, firstOn = -1, seen = false;
        for (let i = 0; i < 200 && !T.ev.length; i++) { const c = G.cueInfo(); if (c && c.inWin) { seen = true; if (firstOn < 0) firstOn = i; } const tgt = when === 'debut' ? firstOn : firstOn + Math.round(((c && c.win) || .1) * 120 / 2); if (!pressed && firstOn >= 0 && i >= tgt) { G.p.intent.guard = true; pressed = true; } T.stepN(1); }
        o.cue[pw + ':' + k + ':' + when] = (seen ? '' : 'pas de lueur ') + (T.types()[0] || 'rien');
      } }
    G.pw = 'normale'; CFG.perfect = PARRY_PRESETS.normale;
    // 2. la garde suit la hauteur de la pointe adverse
    for (const k of ['circ', 'jab', 'bassa', 'heavy']) { T.setup(240); T.holdGuard(G.p, 'ext'); G.e.intent.act = k; let minY = 1e9, maxY = -1e9; for (let i = 0; i < 40; i++) { T.stepN(1); if (G.e.state === 'attack' && G.e.t > G.e.move.wu * .6 && G.e.t < G.e.move.wu) { minY = Math.min(minY, G.p.J.wr[1]); maxY = Math.max(maxY, G.p.J.wr[1]); } } o.track[k] = { wristY: Math.round((minY + maxY) / 2), gline: G.p.gline }; }
    // 3. parade ample : la lame balaie un grand arc
    T.setup(225); G.e.intent.act = 'jab'; let first = -1; for (let i = 0; i < 200; i++) { if (G.cueInfo() && G.cueInfo().inWin && first < 0) { first = i; G.p.intent.guard = true; } T.stepN(1); if (T.types().includes('parry')) break; }
    o.parried = T.types().includes('parry'); let amax = -1e9, amin = 1e9; for (let i = 0; i < 40; i++) { T.stepN(1); amax = Math.max(amax, G.p.pose.a3); amin = Math.min(amin, G.p.pose.a3); } o.sweep = Math.round(amax - amin);
    // 4. difficile : pas de lueur ; l'IA garde sa propre fenêtre
    T.setup(225); G.pw = 'stricte'; G.e.intent.act = 'jab'; let drawn = false; const spy = G.parryCue.bind(G); for (let i = 0; i < 60; i++) { T.stepN(1); const c = G.cueInfo(); if (c && c.inWin && G.pw !== 'stricte') drawn = true; } o.stricteSansLueur = !drawn; G.pw = 'normale'; void spy;
    o.aiWin = CFG.perfectAI;
    return o;
  });
  console.log(JSON.stringify(r));
  const bad = Object.entries(r.cue).filter(([k, v]) => v !== 'parry');
  ok('Facile et Normal : appuyer quand la pointe rougeoie donne une parade parfaite (10 coups × 2 instants)', bad.length === 0, bad);
  ok('la garde suit la pointe adverse : plus haute contre l\'imbroccata, plus basse contre l\'estocade basse', r.track.circ.wristY < r.track.jab.wristY - 8 && r.track.bassa.wristY > r.track.jab.wristY + 8, r.track);
  ok('parade parfaite : geste ample (la lame balaie plus de 25°)', r.sweep > 25, r.sweep);
  ok('l\'IA garde sa fenêtre de parade (0,20 s), quel que soit le réglage du joueur', r.aiWin === .2, r.aiWin);
  // captures : pointe qui rougeoie
  for (const [nm, k, d] of [['cue_jab', 'jab', 225], ['cue_circ', 'circ', 230]]) {
    await pg.evaluate(([k, d]) => { G.frame = () => {}; T.setup(d); G.venue = 'eglise'; G.state = 'fight'; G.e.intent.act = k; for (let i = 0; i < 200; i++) { T.stepN(1); const c = G.cueInfo(); if (c && c.inWin) break; } T.stepN(2); G.render(1 / 60); }, [k, d]);
    await pg.screenshot({ path: `${__dirname}/out/${nm}.png` });
  }
  ok('aucune erreur JavaScript', errs.length === 0, errs);
  console.log(`\n${results.filter(r => r.pass).length}/${results.length} tests réussis`); await b.close();
})();
