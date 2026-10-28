const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const N = +(process.argv[2] || 6);
  for (const bot of ['marteleur', 'fentes', 'tortue', 'lourdes', 'gardeMartelee']) {
    const line = await pg.evaluate(([bot, N]) => ['debutant', 'duelliste', 'maitre'].map(l => { let w = 0, r = [0, 0]; for (let i = 0; i < N; i++) { const m = T.botMatch(bot, l); if (m.wins[0] > m.wins[1]) w++; r[0] += m.wins[0]; r[1] += m.wins[1]; } return `${l}: bot ${w}/${N} (manches ${r[0]}-${r[1]})`; }).join(' · '), [bot, N]);
    console.log(bot.padEnd(14), line);
  }
  console.log('errs', errs); await b.close();
})();
