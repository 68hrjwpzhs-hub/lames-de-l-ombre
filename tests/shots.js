const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open(); await pg.setViewportSize({ width: 1280, height: 720 });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const snap = async (name, fn, arg) => { await pg.evaluate(fn, arg); await pg.evaluate(() => { G.render(0); }); await pg.screenshot({ path: 'out/' + name + '.png' }); };
  await pg.evaluate(() => { G.frame = () => {}; document.querySelectorAll('.screen').forEach(s => s.hidden = true); });
  // 1. menace dedans, joueur en Quarta au bon moment
  await snap('h_quarta', () => { T.setup(230); G.silent = false; G.level = 'duelliste'; G.e.look = LOOKS.duelliste; G.p.intent.guard = true; G.p.intent.gline = 'int'; T.stepN(70); G.e.intent.act = 'degage'; T.stepN(20); });
  await snap('h_parade', () => { T.setup(225); G.e.look = LOOKS.maitre; T.ev = []; G.e.intent.act = 'jab'; for (let i = 0; i < 80; i++) { if (G.e.state === 'attack' && G.e.t >= G.e.move.wu - .06) { G.p.intent.guard = true; G.p.intent.gline = 'ext'; } T.stepN(1); if (T.ev.some(e => e.t === 'parry')) break; } T.stepN(3); });
  await snap('h_riposte', () => { T.stepN(10); });
  await snap('h_imbroccata', () => { T.setup(230); G.e.look = LOOKS.duelliste; T.holdGuard(G.e, 'basse'); G.p.intent.act = 'circ'; T.stepN(30); });
  await snap('h_brisee', () => { T.setup(285); G.e.look = LOOKS.duelliste; T.holdGuard(G.e, 'ext'); G.p.intent.act = 'heavy'; T.stepUntil(() => G.e.state === 'broken', 200); T.stepN(4); });
  await snap('h_training', () => { G.silent = true; G.level = 'training'; G.exercise = 'lignes'; G.startMatch(); G.state = 'fight'; G.banner = null; G.p.intent.guard = true; G.p.intent.gline = 'ext'; for (let i = 0; i < 120 * 6; i++) { G.hitStop = 0; G.slowT = 0; G.step(1 / 120); } });
  await snap('h_demo', () => { Demo.start(); for (let i = 0; i < 120 * 1.2; i++) { G.step(1 / 120); } for (let k = 0; k < 6; k++) Demo.next(); for (let i = 0; i < 120 * .9; i++) G.step(1 / 120); });
  console.log(errs); await b.close();
})();
