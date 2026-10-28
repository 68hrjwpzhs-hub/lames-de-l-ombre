const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open(); await pg.setViewportSize({ width: 1280, height: 720 });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  await pg.evaluate(() => { G.frame = () => {}; document.querySelectorAll('.screen').forEach(s => s.hidden = true); });
  const snap = async (n, fn) => { await pg.evaluate(fn); await pg.evaluate(() => G.render(0)); await pg.screenshot({ path: 'out/' + n + '.png' }); };
  await snap('s_salle', () => { T.setup(240); G.venue = 'salle'; G.e.look = LOOKS.duelliste; G.e.intent.act = 'fente'; T.stepN(34); });
  await snap('s_ko', () => { T.setup(240); G.venue = 'nuit'; G.e.look = LOOKS.maitre; G.mode = 'duel'; G.e.hp = 5; G.p.intent.act = 'jab'; T.stepN(200); });
  await snap('s_training', () => { T.setup(240); G.venue = 'cloitre'; G.e.look = LOOKS.training; G.p.intent.guard = true; T.stepN(30); });
  console.log(errs); await b.close();
})();
