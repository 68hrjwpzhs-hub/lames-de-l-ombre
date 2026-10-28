const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  await pg.evaluate(() => { G.toMenu(); }); await pg.waitForTimeout(300); await pg.screenshot({ path: __dirname + '/out/run_menu.png' });
  await pg.evaluate(() => { Run.showIntro(); }); await pg.waitForTimeout(200); await pg.screenshot({ path: __dirname + '/out/run_intro.png' });
  await pg.evaluate(() => { Run.start(); Run.cur.stage = 2; Run.cur.hp = 46; Run.cur.boons = ['lynx', 'botte']; Run.cur.grades = ['S', 'A']; Run.cur.ecus = 55; G.lastGrade = { g: 'A' }; Run.lastGain = 25; Run.cur.offer = ['poigne', 'sangfroid', 'souffle']; G.state = 'over'; Run.render(); G.show('run'); });
  await pg.waitForTimeout(200); await pg.screenshot({ path: __dirname + '/out/run_offer.png' });
  // coup de grâce
  await pg.evaluate(() => { T.setup(225); G.venue = 'eglise'; G.e.hp = 5; G.p.intent.act = 'jab'; T.stepUntil(() => G.e.state === 'ko', 200); G.cine = 1.2; G.zoom = .15; G.render(1 / 60); });
  await pg.screenshot({ path: __dirname + '/out/run_grace.png' });
  console.log(errs); await b.close();
})();
