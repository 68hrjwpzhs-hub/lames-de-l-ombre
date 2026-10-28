const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  for (const [pl, rap] of [['duelliste', 'garnison'], ['duelliste', 'pappenheimer'], ['maitre', 'garnison'], ['maitre', 'venitienne']]) {
    const r = await pg.evaluate(([pl, rap]) => TOURNAMENTS.map(t => t.bouts.map(bt => { let w = 0; for (let i = 0; i < 4; i++) {
      Save.data.equipped = rap; G.silent = true; G.startMatch({ mode: 'tournament', opp: bt, venue: t.venue }); G.mode = 'duel'; G.p.look = LOOKS.duelliste;
      const pa = new AI(G.p, G.e, pl); const orig = Input.apply; Input.apply = (f, dt) => pa.think(dt); let tt = 0;
      while (G.state !== 'over' && tt < 400) { G.hitStop = 0; G.slowT = 0; G.step(1 / 120); tt += 1 / 120; if (G.state === 'round') G.banner.t = 99; }
      Input.apply = orig; if (G.wins[0] > G.wins[1]) w++; } return w; }).join('/')).join('  '), [pl, rap]);
    console.log(`joueur ${pl} + ${rap} :`, r);
  }
  await b.close();
})();
