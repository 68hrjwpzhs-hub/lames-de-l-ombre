const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const N = +(process.argv[2] || 12);
  const pairs = JSON.parse(process.argv[3] || '[["maitre","duelliste"],["duelliste","debutant"],["maitre","debutant"],["duelliste","duelliste"]]');
  for (const [a, c] of pairs) {
    const r = await pg.evaluate(([a, c, N]) => {
      let wa = 0, rounds = [0, 0], tsum = 0; const agg = { [a]: {}, [c]: {} }; let notOver = 0;
      const add = (o, s) => { for (const k in s) o[k] = (o[k] || 0) + s[k]; };
      for (let i = 0; i < N; i++) { const m = T.match(a, c); if (!m.over) notOver++; if (m.wins[0] > m.wins[1]) wa++; rounds[0] += m.wins[0]; rounds[1] += m.wins[1]; tsum += m.t; add(agg[a] === agg[c] ? (agg.A = agg.A || {}) : agg[a], m.ps); add(agg[a] === agg[c] ? (agg.B = agg.B || {}) : agg[c], m.es); }
      return { wa, N, rounds, avgT: +(tsum / N).toFixed(1), notOver, agg };
    }, [a, c, N]);
    console.log(`${a} vs ${c}: ${r.wa}/${r.N} victoires pour ${a}, manches ${r.rounds}, durée moy. ${r.avgT}s, non terminés ${r.notOver}`);
    const fmt = s => { const per = k => ((s[k] || 0) / r.N).toFixed(1); return `att ${per('attacks')} touches ${per('hits')} parfaites ${per('perfect')} vide ${per('whiffs')} gardes ${per('blocks')} feintes ${per('feints')} | ${['jab','fente','bassa','degage','circ','compo','heavy'].map(k => k + ':' + per('k_' + k)).join(' ')} | pas+ ${per('dashF')} pas- ${per('dashB')}`; };
    for (const k in r.agg) console.log('   ', k.padEnd(10), fmt(r.agg[k]));
  }
  console.log('errs', errs); await b.close();
})();
