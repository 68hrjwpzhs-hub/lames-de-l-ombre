const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  await pg.evaluate(() => { T.setup(240); G.venue = 'cloitre'; G.e.look = LOOKS.duelliste; G.p.intent.act = 'fente'; T.stepUntil(() => T.ev.length, 200); T.stepN(8); G.render(1 / 60); });
  await pg.screenshot({ path: __dirname + '/out/phone_hit.png' });
  const k = await pg.evaluate(() => ({ k: Paint.k, scale: G.scale, A: [Paint.A.width, Paint.A.height] }));
  await pg.evaluate(() => { G.toMenu(); }); await pg.waitForTimeout(400); await pg.screenshot({ path: __dirname + '/out/phone_menu.png' });
  console.log(JSON.stringify(k), errs); await b.close();
})();
