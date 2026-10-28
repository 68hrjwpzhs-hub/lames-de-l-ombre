// 3.0 : étoffes et usure, gros plan
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(800);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  for (const [name, setup] of [['neuf', 'G.e.hp = 100; G.p.hp = 100;'], ['use', 'G.e.hp = 25; G.p.hp = 40; G.e.marks.push({ z: "torse", s: 1, seed: 2 });']]) {
    await pg.evaluate((setup) => { G.venuePref = 'salle'; T.setup(240); G.e.look = Object.assign({}, LOOKS.duelliste, { style: 'dame', body: 'f', hairStyle: 'chignon', beard: 'none', coat: '#5a1a3a', coat2: '#2a0e1e' }); eval(setup); G.p.intent.guard = true; T.stepN(40); G.state = 'fight'; G.frame = () => {}; G.cam = { s: 1.5, x: 480, y: 330 }; G.camera = () => G.cam; G.render(1 / 60); }, setup);
    await pg.waitForTimeout(600); await pg.evaluate(() => G.render(1 / 60)); await pg.screenshot({ path: __dirname + `/out/cost_${name}.png`, clip: { x: 230, y: 100, width: 400, height: 260 } });
  }
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
