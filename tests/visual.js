// contrôle visuel : mêmes scènes figées, captures comparées aux images de référence par tools/visual_check.py
const { open } = require('./lib'); const fs = require('fs'), path = require('path');
(async () => {
  const dir = path.join(__dirname, 'out', 'visual'); fs.mkdirSync(dir, { recursive: true });
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  await pg.evaluate(() => { Math.random = (() => { let a = 7; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })(); }); // hasard fixé
  for (const v of ['salle', 'nuit', 'auberge', 'alcazar']) {
    await pg.evaluate((v) => { G.venuePref = v; T.setup(250); G.weather = 'clear'; G.p.offhand = 'dague'; G.e.offhand = 'rondache'; T.stepN(30); G.state = 'fight'; G.frame = () => {}; G.cam = { s: 1.3, x: 480, y: 300 }; G.camera = () => G.cam; G.time = 10; }, v);
    await pg.waitForTimeout(700); await pg.evaluate(() => { G.render(0); }); await pg.screenshot({ path: path.join(dir, v + '.png') });
  }
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
