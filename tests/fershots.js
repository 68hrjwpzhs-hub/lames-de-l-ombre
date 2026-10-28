const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open(); await pg.setViewportSize({ width: 1280, height: 720 });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const shots = [['engage', 230, null], ['beat', 225, 'beat'], ['lie', 225, 'lie']];
  for (const [name, d, act] of shots) {
    await pg.evaluate(([d, act]) => { T.setup(d); G.venue = 'salle'; if (act === 'beat' || act === 'lie') T.holdGuard(G.e, 'ext'); else T.stepN(60);
      if (act) { G.p.intent.act = act; T.stepUntil(() => T.ev.length, 150); T.stepN(act === 'beat' ? 4 : 6); } G.render(1 / 60); }, [d, act]);
    await pg.screenshot({ path: __dirname + '/out/fer_' + name + '.png' });
  }
  console.log(errs); await b.close();
})();
