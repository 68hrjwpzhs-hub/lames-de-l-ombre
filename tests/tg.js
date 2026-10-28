const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  console.log(await pg.evaluate(() => {
    G.silent = true; G.level = 'training'; G.exercise = 'garde'; G.startMatch(); G.state = 'fight'; G.banner = null; const log = [];
    const oe = G.event.bind(G); G.event = (t, i) => { log.push(`${G.time.toFixed(2)} ${t} ${i.a ? (i.a.isPlayer ? 'J' : 'M') : ''} ${i.m ? i.m.kind : ''} d=${Math.round(G.e.x - G.p.x)}`); oe(t, i); };
    Input.apply = (f, dt) => { const e = G.e, it = f.intent; it.dx = Math.abs(e.x - f.x) > 300 ? f.dir : 0; if (!f.busy) it.act = e.state === 'broken' ? 'jab' : 'heavy'; };
    for (let i = 0; i < 120 * 12; i++) { G.hitStop = 0; G.slowT = 0; G.step(1 / 120); }
    return log.join('\n');
  })); await b.close();
})();
