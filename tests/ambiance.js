// le guet et la pluie
const { open } = require('./lib'); const fs = require('fs');
const results = []; const ok = (name, cond, detail) => { results.push({ name, pass: !!cond }); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open(); await pg.setViewportSize({ width: 1280, height: 720 });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => {
    const o = {};
    const fight = (venue, weather, mode = 'duel') => { G.silent = true; G.forceWeather = weather; G.venuePref = venue; G.level = 'duelliste'; G.startMatch({ mode, venue }); G.ai = { think() {} }; G.state = 'fight'; G.banner = null; T.ev = []; };
    fight('loggia', 'clear'); o.guetOutdoor = G.guet; o.timer = G.timer;
    fight('eglise', 'clear'); o.guetIndoor = G.guet;
    fight('nuit', 'clear', 'tournament'); o.guetTournament = G.guet;
    fight('loggia', 'clear'); G.timer = GUET_WARN + .05; T.stepN(12); o.warned = Ambiance.warned && G.texts.some(t => /guet/.test(t.text));
    G.p.hp = 60; G.e.hp = 80; G.timer = .01; T.stepN(3); o.endWhy = G.banner && G.banner.text; o.winner = G.roundWinner === G.e ? 'e' : 'p';
    // pluie : fentes et pas plus longs
    const lungeLen = w => { fight('cloitre', w); G.e.x = 900; G.p.x = 300; G.p.intent.act = 'fente'; T.stepN(60); return Math.round(G.p.x - 300); };
    o.lungeDry = lungeLen('clear'); o.lungeWet = lungeLen('rain');
    fight('nuit', 'rain'); o.rain = G.weather; Ambiance.nextBolt = 0; T.stepN(2); o.bolt = Ambiance.flashT > 0;
    G.forceWeather = 'clear'; return o;
  });
  console.log(JSON.stringify(r));
  ok('le guet en extérieur (duel libre), pas à l\'intérieur ni en tournoi', r.guetOutdoor && !r.guetIndoor && !r.guetTournament, [r.guetOutdoor, r.guetIndoor, r.guetTournament]);
  ok('alerte du guet à 12 s', r.warned);
  ok('le guet tranche au rapport des points de vie', r.endWhy === 'Le guet !' && r.winner === 'e', [r.endWhy, r.winner]);
  ok('pluie : la fente glisse plus loin', r.lungeWet > r.lungeDry, [r.lungeDry, r.lungeWet]);
  ok('orage la nuit : éclair', r.rain === 'rain' && r.bolt);
  for (const [nm, venue, w, t] of [['pluie_nuit', 'nuit', 'rain', 30], ['guet_toits', 'loggia', 'clear', 4], ['pluie_cour', 'cloitre', 'rain', 30]]) {
    await pg.evaluate(([venue, w, t]) => { G.silent = true; G.forceWeather = w; G.startMatch({ mode: 'duel', venue }); G.state = 'fight'; G.banner = null; G.ai = new AI(G.e, G.p, 'duelliste'); T.stepN(200); G.timer = t; if (venue === 'nuit') { Ambiance.flashT = .45; Ambiance.boltX = 300; } G.render(1 / 60); G.forceWeather = 'clear'; }, [venue, w, t]);
    await pg.screenshot({ path: `${__dirname}/out/amb_${nm}.png` });
  }
  ok('aucune erreur JavaScript', errs.length === 0, errs);
  console.log(`\n${results.filter(r => r.pass).length}/${results.length} tests réussis`); await b.close();
})();
