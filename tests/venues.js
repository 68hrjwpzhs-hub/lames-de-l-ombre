const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open(); await pg.setViewportSize({ width: 960, height: 540 });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  for (const k of await pg.evaluate(() => VENUE_KEYS)) {
    await pg.evaluate(k => { G.frame = () => {}; document.querySelectorAll('.screen').forEach(s => s.hidden = true); T.setup(250); G.venue = k; G.p.intent.guard = true; G.e.intent.act = 'fente'; T.stepN(36); G.render(0); }, k);
    await pg.screenshot({ path: `out/v_${k}.png` });
  }
  console.log(errs); await b.close();
})();
