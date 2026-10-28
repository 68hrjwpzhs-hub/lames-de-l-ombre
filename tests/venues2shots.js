const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(500);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  for (const k of ['auberge', 'navire', 'bastion']) {
    await pg.evaluate((k) => { G.venuePref = k; T.setup(240); G.weather = 'clear'; G.p.offhand = 'dague'; G.e.offhand = 'cape'; T.stepN(30); G.state = 'fight'; }, k);
    await pg.waitForTimeout(500); await pg.screenshot({ path: __dirname + `/out/v2_${k}.png` });
  }
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
