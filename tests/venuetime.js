const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open(process.argv[2] ? { device: 'iPhone 13 landscape' } : {});
  console.log(await pg.evaluate(() => { const o = {}; for (const k of VENUE_KEYS) { delete BGS[k]; const t0 = performance.now(); venueCanvas(k); o[k] = Math.round(performance.now() - t0); } return JSON.stringify({ k: Paint.k, ms: o }); }), errs);
  await b.close();
})();
