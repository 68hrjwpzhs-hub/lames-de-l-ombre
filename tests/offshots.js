// captures : les trois mains gauches en garde (iPhone 13)
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(500);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  for (const [i, k] of ['dague', 'cape', 'rondache'].entries()) {
    await pg.evaluate((k) => { T.setup(240); G.p.offhand = k; G.e.offhand = ['rondache','dague','cape'][['dague','cape','rondache'].indexOf(k)]; G.p.intent.guard = true; T.stepN(40); G.state = 'fight'; }, k);
    await pg.waitForTimeout(400); await pg.screenshot({ path: __dirname + `/out/offh_${k}.png` });
  }
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
