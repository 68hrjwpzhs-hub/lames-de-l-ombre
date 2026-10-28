// 3.0 : rendu WebGL contre rendu 2D, exactement la même image (simulation figée)
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(600);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const info = await pg.evaluate(() => ({ ok: GL.ok, on: GL.on }));
  for (const v of (process.argv[2] || 'nuit,auberge,eglise').split(',')) {
    await pg.evaluate((v) => { G.venuePref = v; T.setup(250); G.p.offhand = 'dague'; G.e.offhand = 'cape'; G.weather = v === 'nuit' ? 'rain' : 'clear'; G.p.intent.guard = true; T.stepN(60); G.state = 'fight'; G.frame = () => {}; G.cam = null; for (let i = 0; i < 30; i++) G.camera(.1); }, v); await pg.waitForTimeout(700);
    for (const on of [false, true]) { await pg.evaluate((on) => { GL.set(on); G.render(1 / 60); }, on); await pg.waitForTimeout(150); await pg.screenshot({ path: __dirname + `/out/gl_${v}_${on ? 'webgl' : '2d'}.png` }); }
  }
  console.log(JSON.stringify(info), errs.length ? errs : 'ok'); await b.close();
})();
