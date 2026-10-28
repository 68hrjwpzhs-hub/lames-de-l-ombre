// nouveaux adversaires : spadassin de la destreza et drac
const { open } = require('./lib'); const fs = require('fs');
const results = []; const ok = (name, cond, detail) => { results.push({ name, pass: !!cond }); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open(); await pg.setViewportSize({ width: 1280, height: 720 });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => {
    const o = { reach: { tajo: Math.round(REACH.tajo), griffe: Math.round(REACH.griffe), jab: Math.round(REACH.jab) } };
    T.setup(165); G.e.arch = 'drac'; T.holdGuard(G.p, 'ext'); G.e.intent.act = 'griffe'; T.stepUntil(() => T.ev.length, 150); o.griffeVsGuard = T.types();
    T.setup(165); G.e.arch = 'drac'; G.e.intent.act = 'griffe'; T.stepUntil(() => T.ev.length, 150); o.griffeHit = T.types();
    T.setup(REACH.griffe + 30); G.e.intent.act = 'griffe'; T.stepN(120); o.griffeFar = T.types();
    T.setup(225); G.e.intent.act = 'tajo'; T.stepUntil(() => T.ev.length, 150); o.tajo = T.types();
    T.setup(225); T.holdGuard(G.p, 'ext'); G.e.intent.act = 'tajo'; T.stepUntil(() => T.ev.length, 150); o.tajoGuard = T.types();
    T.setup(225); G.e.arch = 'drac'; G.p.intent.act = 'jab'; T.stepUntil(() => T.ev.length, 150); o.dracDmg = 100 - G.e.hp; T.setup(225); G.e.arch = null; G.p.intent.act = 'jab'; T.stepUntil(() => T.ev.length, 150); o.humanDmg = 100 - G.e.hp;
    // matchs : un « joueur » IA maître à pleine vitesse contre chaque archétype (niveau duelliste)
    const vs = (arch, look) => { let w = 0, n = 0, used = {}; for (let i = 0; i < 6; i++) { G.silent = true; G.startMatch({ mode: 'duel', opp: { name: 'X', level: 'duelliste', arch, rapier: 'tolede', look } }); G.state = 'fight'; G.banner = null;
        const pa = new AI(G.p, G.e, 'maitre'); G.p.slow = 1; const orig = Input.apply; Input.apply = (f, dt) => pa.think(dt); let t = 0;
        while (G.state !== 'over' && t < 400) { G.hitStop = 0; G.slowT = 0; G.step(1 / 120); t += 1 / 120; if (G.state === 'round') G.banner.t = 99; }
        Input.apply = orig; n++; if (G.wins[0] > G.wins[1]) w++; for (const k of ['tajo', 'griffe', 'lie', 'beat']) used[k] = (used[k] || 0) + (G.e.stats['k_' + k] || 0); used.derob = (used.derob || 0) + (G.e.stats.derob || 0); }
      G.toMenu(); return { w: w + '/' + n, used }; };
    o.vsDestreza = vs('destreza', LOOKS.duelliste); o.vsDrac = vs('drac', Object.assign({}, LOOKS.debutant, { race: 'drac', skin: '#6f8a5a', hatType: 'aucun' })); o.vsPlain = vs(null, LOOKS.duelliste);
    return o;
  });
  console.log(JSON.stringify(r));
  ok('griffes contre garde tenue : garde brisée', r.griffeVsGuard[0] === 'break', r.griffeVsGuard);
  ok('griffes : touche de près, rien de loin', r.griffeHit[0] === 'hit' && !r.griffeFar.includes('hit'), [r.griffeHit, r.griffeFar]);
  ok('tajo : touche, et se bloque en garde', r.tajo[0] === 'hit' && r.tajoGuard[0] === 'block', [r.tajo, r.tajoGuard]);
  ok('écailles du drac : dégâts réduits', r.dracDmg < r.humanDmg, [r.dracDmg, r.humanDmg]);
  ok('l\'Espagnol utilise tajo et prise de fer ; le drac ses griffes', r.vsDestreza.used.tajo > 0 && r.vsDestreza.used.lie > 0 && r.vsDrac.used.griffe > 0, [r.vsDestreza.used, r.vsDrac.used]);
  // captures
  for (const [nm, arch, look, venue] of [['drac', 'drac', 'drac', 'nuit'], ['destreza', 'destreza', 'esp', 'salle']]) {
    await pg.evaluate(([arch, look, venue]) => { T.setup(240); G.venue = venue; G.e.arch = arch; G.e.look = look === 'drac' ? Object.assign({}, LOOKS.maitre, { name: 'Le Chevalier d\'Écaille', race: 'drac', skin: '#4f7a62', hairStyle: 'chauve', beard: 'none', hatType: 'aucun', plume: null, coat: '#1e3a2e', coat2: '#10241c', hose: '#10241c', trim: '#7ad0a0', cape: '#0e1a14' }) : Object.assign({}, LOOKS.maitre, { name: 'Diestro', trim: '#c8a050', plume: '#b2302a', beard: 'pointed' });
      T.stepN(40); G.e.intent.act = arch === 'drac' ? 'griffe' : 'tajo'; T.stepN(arch === 'drac' ? 30 : 26); G.render(1 / 60); }, [arch, look, venue]);
    await pg.screenshot({ path: `${__dirname}/out/foe_${nm}.png` });
  }
  ok('aucune erreur JavaScript', errs.length === 0, errs);
  console.log(`\n${results.filter(r => r.pass).length}/${results.length} tests réussis`); await b.close();
})();
