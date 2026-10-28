// temps de contact de chaque coup (défenseur immobile, sans garde) — pour comparer avant/après
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => {
    const o = {};
    for (const k of ['jab', 'fente', 'bassa', 'degage', 'circ', 'compo', 'heavy', 'lie', 'riposte']) for (const d of [180, 230, 280, 330]) {
      T.setup(d); let tc = null, ts = null; const a = G.e; a.intent.act = k === 'riposte' ? null : k; if (k === 'riposte') { a.startMove('riposte'); }
      T.each = () => { if (tc === null && a.move && a.move.done && a.move.contact) tc = +(a.t).toFixed(3); };
      for (let i = 0; i < 160 && tc === null; i++) T.stepN(1);
      T.each = null; o[k + '@' + d] = tc === null ? '-' : tc + ':' + (T.types()[0] || '');
    }
    return o;
  });
  console.log(JSON.stringify(r)); if (errs.length) console.log(errs); await b.close();
})();
