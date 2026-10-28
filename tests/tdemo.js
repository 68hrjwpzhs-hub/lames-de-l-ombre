const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  // démonstration : chaque séquence (vitesse réelle) doit produire l'événement qu'elle illustre
  const demo = await pg.evaluate(() => {
    const log = []; G.silent = true; Demo.start(); const origEv = Demo.onEvent; Demo.onEvent = (t, i) => log.push([Demo.i, Demo.pass, t, (i.a && i.a.isPlayer) ? 'J' : 'A', i.m ? i.m.kind : '']);
    let n = 0; while (G.state === 'demo' && n < 120 * 80) { G.hitStop = 0; G.slowT = 0; G.step(1 / 120); n++; }
    const by = {}; for (const [i, pass, t, w, k] of log) if (pass === 1) (by[Demo.steps[i].title] = by[Demo.steps[i].title] || []).push(`${t}:${w}:${k}`);
    return { finished: G.state === 'menu', by };
  });
  console.log(JSON.stringify(demo, null, 1));
  // entraînement : chaque exercice 40 s avec un « joueur » piloté par l'IA maître
  const tr = await pg.evaluate(() => {
    const out = {};
    for (const ex in EXERCISES) {
      G.silent = true; G.level = 'training'; G.exercise = ex; G.startMatch(); G.state = 'fight'; G.banner = null;
      const pa = new AI(G.p, G.e, 'maitre'); const orig = Input.apply; Input.apply = (f, dt) => pa.think(dt);
      const hints = new Set(); for (let i = 0; i < 120 * 40; i++) { G.hitStop = 0; G.slowT = 0; G.step(1 / 120); if (G.ai.hint) hints.add(G.ai.hint.replace(/[0-9,]+ (s|ms)/g, '# $1')); }
      Input.apply = orig; out[ex] = { count: G.ai.count, goal: EXERCISES[ex].goal, hints: [...hints].slice(0, 4), hp: [G.p.hp, G.e.hp], state: G.state };
    }
    return out;
  });
  console.log(JSON.stringify(tr, null, 1));
  console.log('errs', errs); await b.close();
})();
