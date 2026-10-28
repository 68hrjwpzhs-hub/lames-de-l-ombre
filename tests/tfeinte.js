const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  console.log(await pg.evaluate(() => {
    const out = {};
    for (const ex of ['feinte', 'parade', 'lourde', 'garde']) {
      G.silent = true; G.level = 'training'; G.exercise = ex; G.startMatch(); G.state = 'fight'; G.banner = null;
      const orig = Input.apply; let rel = 0;
      // joueur scripté : lève la garde 0,06 s avant l'impact estimé des vraies attaques ; contre la garde : fente lourde puis estocade
      Input.apply = (f, dt) => { const e = G.e, it = f.intent; it.dx = 0;
        if (ex === 'garde') { if (!f.busy) it.act = e.state === 'broken' ? 'jab' : 'heavy'; return; }
        it.guard = e.state === 'attack' && e.move.kind !== 'pending' && e.t >= e.move.wu - .06 && e.t < e.move.wu + .2; };
      for (let i = 0; i < 120 * 40; i++) { G.hitStop = 0; G.slowT = 0; G.step(1 / 120); }
      Input.apply = orig; out[ex] = G.ai.count + '/' + EXERCISES[ex].goal;
    }
    return JSON.stringify(out);
  }), errs); await b.close();
})();
