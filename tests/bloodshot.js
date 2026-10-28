const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open(); await pg.setViewportSize({ width: 1280, height: 720 });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  await pg.evaluate(() => { G.frame = () => {}; document.querySelectorAll('.screen').forEach(s => s.hidden = true); });
  const snap = async (n, fn) => { await pg.evaluate(fn); await pg.evaluate(() => G.render(0)); await pg.screenshot({ path: 'out/' + n + '.png' }); };
  await snap('b_lourde', () => { T.setup(290); G.venue = 'cloitre'; G.p.intent.act = 'heavy'; T.stepUntil(() => T.ev.length > 0, 200); T.stepN(9); });
  await snap('b_ko', () => { T.setup(240); G.venue = 'eglise'; G.e.look = LOOKS.maitre; G.e.hp = 10; G.p.intent.act = 'fente'; T.stepUntil(() => G.e.state === 'ko', 200); T.stepN(170); });
  const r = await pg.evaluate(() => { T.setup(240); CFG.blood = false; G.p.intent.act = 'heavy'; T.stepN(120); const n = G.blood.length + G.stains.length; CFG.blood = true; return n; });
  console.log('sans sang :', r, errs); await b.close();
})();
