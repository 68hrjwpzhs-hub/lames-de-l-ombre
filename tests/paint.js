// captures de chaque décor en plein combat (préfixe en argument)
const { open } = require('./lib'); const fs = require('fs');
const pre = process.argv[2] || 'shot', w = +(process.argv[3] || 1280), h = Math.round(w * 9 / 16);
(async () => {
  const { b, pg, errs } = await open(); await pg.setViewportSize({ width: w, height: h });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  for (const v of ['loggia', 'eglise', 'salle', 'cloitre', 'nuit']) {
    await pg.evaluate(v => { T.setup(235); G.venue = v; G.e.look = LOOKS.maitre; G.p.look = LOOKS.player; T.stepN(30); G.e.intent.guard = true; T.stepN(20); G.p.intent.act = 'jab'; T.stepN(Math.round(.2 * 120)); G.render(1 / 60); }, v);
    await pg.screenshot({ path: `${__dirname}/out/${pre}_${v}.png` });
  }
  const perf = await pg.evaluate(() => { T.setup(235); const t0 = performance.now(); for (let i = 0; i < 120; i++) { T.stepN(1); G.render(1 / 60); } return Math.round((performance.now() - t0) / 120 * 100) / 100; });
  console.log('ms/image', perf, errs); await b.close();
})();
