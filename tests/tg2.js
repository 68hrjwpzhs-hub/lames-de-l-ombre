const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  console.log(await pg.evaluate(() => {
    const r = [];
    for (const k of ['jab', 'heavy', 'fente', 'bassa']) for (const d of [110, 130, 160, 200, 230]) { T.setup(d); G.p.intent.act = k; T.stepN(2); T.stepUntil(() => G.p.state !== 'attack' || G.p.move.done, 300); r.push(`${k}@${d}:${T.types().join(',') || 'none'}`); }
    return r.join('  ');
  })); await b.close();
})();
