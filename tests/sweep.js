const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const bot = process.argv[2], N = +process.argv[3];
  const variants = JSON.parse(process.argv[4]);
  for (const v of variants) {
    const r = await pg.evaluate(([bot, N, v]) => { const base = JSON.parse(JSON.stringify(LEVELS.duelliste)); Object.assign(LEVELS.duelliste, v); let w = 0, rr = [0, 0]; for (let i = 0; i < N; i++) { const m = T.botMatch(bot, 'duelliste'); if (m.wins[0] > m.wins[1]) w++; rr[0] += m.wins[0]; rr[1] += m.wins[1]; } LEVELS.duelliste = base; return `bot ${w}/${N} manches ${rr}`; }, [bot, N, v]);
    console.log(JSON.stringify(v), r);
  }
  await b.close();
})();
