const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  for (const r of [.20, .24, .28]) console.log('réaction', r, await pg.evaluate(r => JSON.stringify(['debutant', 'duelliste', 'maitre'].map(l => [l, T.human(l, r, 90)])), r));
  await b.close();
})();
