const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open(); await pg.setViewportSize({ width: 960, height: 540 });
  await pg.screenshot({ path: 'out/f_menu.png' });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  await pg.evaluate(() => { G.frame = () => {}; document.querySelectorAll('.screen').forEach(s => s.hidden = true); });
  const snap = async (n, fn) => { await pg.evaluate(fn); await pg.evaluate(() => G.render(0)); await pg.screenshot({ path: 'out/' + n + '.png' }); };
  await snap('f_charge', () => { T.setup(285); G.venue = 'eglise'; G.e.look = LOOKS.maitre; G.e.intent.guard = true; G.p.intent.act = 'p:jab'; G.p.intent.holdAtk = true; T.stepN(70); T.stepN(16); });
  await snap('f_brisee', () => { T.stepUntil(() => G.e.state === 'broken', 120); T.stepN(5); });
  await snap('f_parade', () => { T.setup(225); G.venue = 'salle'; G.e.look = LOOKS.duelliste; G.e.intent.act = 'jab'; for (let i = 0; i < 80; i++) { if (G.e.state === 'attack' && G.e.move.kind === 'jab' && G.e.t >= G.e.move.wu - .06) G.p.intent.guard = true; T.stepN(1); if (T.ev.some(e => e.t === 'parry')) break; } T.stepN(4); });
  console.log(errs); await b.close();
})();
