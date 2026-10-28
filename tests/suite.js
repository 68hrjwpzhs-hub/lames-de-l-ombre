const { open } = require('./lib');
const fs = require('fs');
const results = []; const ok = (name, cond, detail) => { results.push({ name, pass: !!cond, detail }); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : '')); };
(async () => {
  const { b, pg, errs } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const E = (fn, arg) => pg.evaluate(fn, arg);

  // ---------- 1. commandes ----------
  const cmd = await E(() => {
    const out = {};
    const run = (name, seq) => { T.setup(225); T.inputOn = true; Input.keys.clear(); Input.dirs = []; Input.tap = null; Input.prevHx = 0;
      for (const [k, v] of seq) { if (k === 'wait') T.stepN(v); else if (k === 'J') { Input.pressed.attack = true; T.stepN(1); } else if (k === 'K') { Input.pressed.feint = true; T.stepN(1); } else if (k[0] === '+') Input.keys.add(k.slice(1)); else if (k[0] === '-') Input.keys.delete(k.slice(1)); }
      T.stepN(2); const p = G.p; out[name] = p.state === 'attack' ? p.move.kind + (p.move.quick ? '(rapide)' : '') : p.state + (p.dash ? (p.dash.s > 0 ? '+' : '-') : ''); Input.keys.clear(); T.inputOn = false; };
    run('neutre', [['J']]);
    run('avant', [['+KeyD'], ['wait', 3], ['J']]);
    run('bas', [['+KeyS'], ['wait', 3], ['J']]);
    run('arriere', [['+KeyA'], ['wait', 3], ['J']]);
    run('haut', [['+KeyW'], ['wait', 3], ['J']]);
    run('Attaque maintenue', [['+KeyJ'], ['J'], ['wait', 40]]);
    run('Attaque tapée (appui bref)', [['+KeyJ'], ['J'], ['wait', 8], ['-KeyJ'], ['wait', 1]]);
    run('avant, Attaque maintenue', [['+KeyD'], ['wait', 3], ['+KeyJ'], ['J'], ['wait', 40]]);
    run('feinte', [['K']]);
    run('attaque puis feinte', [['J'], ['wait', 4], ['K']]);
    run('feinte puis attaque', [['K'], ['wait', 12], ['J']]);
    run('double avant', [['+KeyD'], ['wait', 4], ['-KeyD'], ['wait', 4], ['+KeyD'], ['wait', 2]]);
    run('double arriere', [['+KeyA'], ['wait', 4], ['-KeyA'], ['wait', 4], ['+KeyA'], ['wait', 2]]);
    // une seule garde, quelle que soit la direction
    const gl = {}; for (const [n, k] of [['neutre', null], ['haut', 'KeyW'], ['arriere', 'KeyA'], ['bas', 'KeyS']]) { T.setup(300); T.inputOn = true; Input.keys.clear(); Input.keys.add('KeyL'); if (k) Input.keys.add(k); T.stepN(20); gl[n] = G.p.state; Input.keys.clear(); T.inputOn = false; }
    out.gardes = gl; return out;
  });
  const want = { neutre: 'jab', avant: 'fente', bas: 'bassa', arriere: 'degage', haut: 'circ', 'Attaque maintenue': 'heavy', 'Attaque tapée (appui bref)': 'jab', 'avant, Attaque maintenue': 'heavy', feinte: 'feint', 'attaque puis feinte': 'compo', 'feinte puis attaque': 'jab(rapide)', 'double avant': 'dash+', 'double arriere': 'dash-' };
  for (const k in want) ok(`commande « ${k} »`, cmd[k] === want[k], cmd[k]);
  ok('une seule garde, quelle que soit la direction', Object.values(cmd.gardes).every(v => v === 'guard'), cmd.gardes);

  // ---------- 2. identité des coups : trajectoire de la pointe ----------
  const traj = await E(() => {
    const out = {};
    for (const k of ['jab', 'fente', 'bassa', 'degage', 'circ', 'compo', 'heavy']) {
      T.setup(600); G.e.x = 900; const p = G.p; p.intent.act = k; T.stepN(1); const pts = []; let t = 0;
      while (p.state === 'attack' && t < 200) { pts.push([p.J.tip[0] - p.x, GROUND - p.J.tip[1]]); T.stepN(1); t++; }
      const m = MOVES[k], ys = pts.map(q => q[1]), xs = pts.map(q => q[0]);
      out[k] = { frames: t, maxTipY: Math.round(Math.max(...ys)), minTipY: Math.round(Math.min(...ys)), maxReachX: Math.round(Math.max(...xs)), endY: Math.round(pts[Math.round(((m.wu + m.act) * 120)) - 1]?.[1] ?? 0), line: m.line, wu: m.wu, act: m.act, rec: m.rec, dmg: m.dmg, reach: Math.round(REACH[k]) };
    }
    return out;
  });
  console.table(traj);
  const sig = Object.values(traj).map(v => `${v.maxTipY}/${v.minTipY}/${v.endY}/${v.frames}`);
  ok('chaque coup a une trajectoire et une durée distinctes', new Set(sig).size === sig.length, sig);
  ok('imbroccata et fente lourde passent au-dessus de la tête (tip > 200 px)', traj.circ.maxTipY > 200 && traj.heavy.maxTipY > 220, [traj.circ.maxTipY, traj.heavy.maxTipY]);
  ok('dégagement et composée plongent sous la ligne (pointe < 100 px pendant la préparation)', traj.degage.minTipY < 100 && traj.compo.minTipY < 100, [traj.degage.minTipY, traj.compo.minTipY]);
  ok('estocade basse finit basse, imbroccata haute', traj.bassa.endY < 90 && traj.circ.endY > 125, [traj.bassa.endY, traj.circ.endY]);

  // ---------- 3. la touche suit la lame ----------
  const reach = await E(() => {
    const r = {};
    for (const k of ['jab', 'fente', 'bassa', 'heavy']) {
      const test = d => { T.setup(d); G.p.intent.act = k; T.stepN(2); T.stepUntil(() => G.p.state !== 'attack' || G.p.move.done, 300); const h = T.ev.find(e => e.t === 'hit'); return h ? 'hit' : T.types().includes('whiff') ? 'whiff' : 'none'; };
      r[k] = { inside: test(REACH[k] - 25), outside: test(REACH[k] + 25) };
    }
    // point de contact de l'estocade basse : sur la jambe / le bas du tronc
    T.setup(220); let at = null; const orig = G.hit; G.hit = function (a, d, p, i) { at = p; return orig.call(this, a, d, p, i); }; G.p.intent.act = 'bassa'; T.stepN(80); G.hit = orig; r.bassaContactY = at && Math.round(GROUND - at[1]);
    T.setup(220); at = null; G.hit = function (a, d, p, i) { at = p; return orig.call(this, a, d, p, i); }; G.p.intent.act = 'circ'; T.stepN(90); G.hit = orig; r.circContactY = at && Math.round(GROUND - at[1]);
    return r;
  });
  for (const k of ['jab', 'fente', 'bassa', 'heavy']) ok(`${k} : touche à portée, manque hors de portée`, reach[k].inside === 'hit' && reach[k].outside === 'whiff', reach[k]);
  ok('le contact est là où passe la lame (basse sur la hanche ou la jambe, imbroccata en haut du corps)', reach.bassaContactY < 100 && reach.circContactY > 115, [reach.bassaContactY, reach.circContactY]);

  // ---------- 4. jamais de traversée ----------
  const cross = await E(() => {
    let minD = 1e9, viol = 0, steps = 0;
    const acts = ['jab', 'fente', 'heavy', 'circ', 'bassa', 'degage', 'compo', 'feint'];
    for (let run = 0; run < 40; run++) {
      T.setup(120 + Math.random() * 300); if (run % 4 === 0) { G.p.x = 60; G.e.x = 200; } if (run % 4 === 1) { G.e.x = 900; G.p.x = 760; }
      for (let i = 0; i < 600; i++) {
        for (const f of [G.p, G.e]) { const it = f.intent; if (Math.random() < .05) it.act = acts[Math.floor(Math.random() * acts.length)]; if (Math.random() < .03) it.dash = Math.random() < .7 ? 1 : -1; it.dx = Math.random() < .5 ? f.dir : 0; it.guard = Math.random() < .1; }
        T.stepN(1); steps++; const d = G.e.x - G.p.x; minD = Math.min(minD, d); if (d < MINDIST - .01) viol++;
        if (G.p.state === 'ko' || G.e.state === 'ko') break;
      }
    }
    return { minD: +minD.toFixed(2), viol, steps };
  });
  ok('les combattants ne se traversent jamais (40 duels aléatoires, fentes et pas simultanés, murs)', cross.viol === 0 && cross.minD >= 104 - .01, cross);

  // ---------- 5. attaques simultanées ----------
  const simul = await E(() => {
    T.setup(230); G.p.intent.act = 'jab'; G.e.intent.act = 'jab'; T.stepN(80); const a = T.types();
    T.setup(330); G.p.intent.act = 'fente'; G.e.intent.act = 'fente'; T.stepN(100); const b = T.types();
    T.setup(230); G.p.intent.act = 'jab'; T.stepN(3); G.e.intent.act = 'heavy'; T.stepN(100); const c = T.types();
    return { egal: a, fentes: b, estocadeContreLourde: c, hp: [G.p.hp, G.e.hp] };
  });
  ok('deux estocades au même instant : coup double ou lames croisées', simul.egal.includes('double') || simul.egal.includes('clash'), simul.egal);
  ok('deux fentes simultanées : résolution unique (double ou croisé), pas deux touches séparées', (simul.fentes.includes('double') || simul.fentes.includes('clash')) && simul.fentes.filter(t => t === 'hit').length === 0, simul.fentes);
  ok('l\'estocade rapide interrompt la fente lourde qui se prépare (contretemps)', simul.estocadeContreLourde[0] === 'hit' && !simul.estocadeContreLourde.includes('break'), simul.estocadeContreLourde);

  // ---------- 6. garde unique ----------
  const cov = await E(() => {
    const out = {};
    for (const k of ['jab', 'fente', 'bassa', 'degage', 'circ', 'compo', 'heavy']) { T.setup(k === 'fente' || k === 'heavy' ? 285 : 225); T.holdGuard(G.e, 'ext'); T.ev = []; G.p.intent.act = k; T.stepUntil(() => T.ev.length > 0, 240); out[k] = T.ev[0] ? T.ev[0].t : 'none'; }
    return out;
  });
  ok('garde tenue : bloque toutes les attaques sauf la fente lourde', ['jab', 'fente', 'bassa', 'degage', 'circ', 'compo'].every(k => cov[k] === 'block'), cov);
  ok('fente lourde contre garde tenue : garde brisée', cov.heavy === 'break', cov.heavy);

  // ---------- 7. parade parfaite : précision du timing ----------
  const timing = await E(() => {
    T.setup(225); G.p.intent.act = 'jab'; let impact = null; T.stepUntil(() => { if (T.ev.length) { impact = T.ev[0].time; return true; } return false; }, 200);
    const t0 = G.time - impact; // délai entre l'ordre et le contact
    const res = {};
    // méthode directe : on connaît le nombre d'images jusqu'au contact
    T.setup(225); G.p.intent.act = 'jab'; const n = T.stepUntil(() => T.ev.length > 0, 200);
    // la garde est levée « before » secondes avant l'instant de contact (pré-roulage si avant l'ordre d'attaque)
    T.pre = (before, line = 'ext') => { const k = Math.round(before * 120); T.setup(225); if (k > n) { G.e.intent.guard = true; G.e.intent.gline = line; T.stepN(k - n); } G.p.intent.act = 'jab'; return n - k; };
    for (const before of [.30, .22, .19, .14, .10, .05, .02]) {
      const raiseAt = T.pre(before);
      for (let i = 0; i <= n + 2 && !T.ev.length; i++) { if (i === raiseAt) { G.e.intent.guard = true; G.e.intent.gline = 'ext'; } T.stepN(1); }
      res[before.toFixed(2)] = T.ev[0] ? T.ev[0].t : 'none';
      G.e.intent.guard = false;
    }
    return { framesToContact: n, res, window: CFG.perfect };
  });
  console.log('timing', timing);
  const R = timing.res;
  ok('parade parfaite dans la fenêtre (≤ 0,20 s), garde normale au-delà', R['0.19'] === 'parry' && R['0.14'] === 'parry' && R['0.10'] === 'parry' && R['0.05'] === 'parry' && R['0.02'] === 'parry' && R['0.22'] === 'block' && R['0.30'] === 'block', R);

  // ---------- 8. martèlement ----------
  const mash = await E(() => {
    T.setup(225); G.p.intent.act = 'jab'; const n = T.stepUntil(() => T.ev.length > 0, 200);
    const tryPattern = pattern => { T.setup(225); for (let i = -120; i < 0; i++) { pattern(i, n); T.stepN(1); } G.p.intent.act = 'jab'; for (let i = 0; i <= n + 2 && !T.ev.length; i++) { pattern(i, n); T.stepN(1); } const r = T.ev[0] ? T.ev[0].t : 'none'; G.e.intent.guard = false; return r; };
    return {
      relevee: tryPattern((i, n) => { G.e.intent.gline = 'ext'; G.e.intent.guard = (i >= n - 40 && i < n - 20) || i >= n - 8; }),
      mitraille: tryPattern((i, n) => { G.e.intent.gline = 'ext'; G.e.intent.guard = i >= n - 60 && (Math.floor(i / 3) % 2 === 0 || i >= n - 6); }),
      relachementLong: tryPattern((i, n) => { G.e.intent.guard = (i >= n - 90 && i < n - 60) || i >= n - 8; }),
    };
  });
  ok('garde relâchée puis relevée en moins de 0,35 s : pas de parade parfaite', mash.relevee === 'block', mash.relevee);
  ok('garde martelée : pas de parade parfaite', mash.mitraille !== 'parry', mash.mitraille);
  ok('garde relâchée assez longtemps (> 0,35 s) puis relevée au bon moment : parade parfaite', mash.relachementLong === 'parry', mash.relachementLong);

  // ---------- 9. riposte au bouton, seulement après une parade parfaite ----------
  const rip = await E(() => {
    const parryThen = (pressAt) => { // pressAt : délai d'appui après la parade (s), ou null
      T.setup(225); T.holdGuard(G.e, 'ext'); G.e.intent.guard = false; T.stepN(60); G.p.intent.act = 'jab'; T.ev = [];
      let parryT = -1, pressT = -1, hitT = -1, offer = null, noAutoRip = null;
      for (let i = 0; i < 240; i++) {
        if (G.p.state === 'attack' && G.p.t >= G.p.move.wu - .06 && !G.e.intent.guard && parryT < 0) { G.e.intent.guard = true; G.e.intent.gline = 'ext'; }
        if (parryT >= 0 && pressAt !== null && pressT < 0 && G.time - parryT >= pressAt) { G.e.intent.rip = true; pressT = G.time; }
        T.stepN(1);
        if (parryT < 0 && T.ev.some(e => e.t === 'parry')) { parryT = G.time; offer = !!G.e.ripOffer; noAutoRip = !(G.e.state === 'attack' && G.e.move.kind === 'riposte'); G.e.intent.guard = false; }
        if (parryT >= 0 && T.ev.some(e => e.t === 'hit' && e.i.a === G.e)) { hitT = G.time; break; }
      }
      const r = T.ev.find(e => e.t === 'riposte'); return { offer, noAutoRip, hit: hitT > 0, ms: hitT > 0 ? Math.round((hitT - pressT) * 1000) : null, perfect: r ? r.i.perfect : null, dmg: 100 - G.p.hp };
    };
    const o = { sans: parryThen(null), parfaite: parryThen(.17), tot: parryThen(.04), tard: parryThen(.36), hors: parryThen(.6) };
    // sans parade parfaite : le bouton ne fait rien
    T.setup(225); G.p.intent.rip = true; T.stepN(5); o.sansOffre = G.p.state;
    // garde tenue : bloque, pas d'offre de riposte
    T.setup(225); T.holdGuard(G.e, 'ext'); G.p.intent.act = 'jab'; T.stepUntil(() => T.ev.length, 150); o.blocOffre = !!G.e.ripOffer; o.bloc = T.types()[0];
    return o;
  });
  console.log(JSON.stringify(rip));
  ok('parade parfaite : le bouton Riposte est proposé, rien ne part tout seul', rip.sans.offer && rip.sans.noAutoRip && !rip.sans.hit, rip.sans);
  ok('Riposte appuyée dans la zone dorée : riposte parfaite (18) qui touche vite (< 200 ms)', rip.parfaite.hit && rip.parfaite.perfect === true && rip.parfaite.ms < 200 && rip.parfaite.dmg === 18, rip.parfaite);
  ok('Riposte trop tôt ou tard : riposte simple (12)', rip.tot.hit && rip.tot.perfect === false && rip.tot.dmg === 12 && rip.tard.hit && rip.tard.perfect === false, [rip.tot, rip.tard]);
  ok('Riposte après la fenêtre (0,45 s) ou sans parade parfaite : rien', !rip.hors.hit && rip.sansOffre !== 'attack', [rip.hors, rip.sansOffre]);
  ok('garde tenue : bloque sans proposer de riposte', rip.bloc === 'block' && !rip.blocOffre, [rip.bloc, rip.blocOffre]);

  // ---------- 10. feinte ----------
  const feint = await E(() => {
    T.setup(225); const atk0 = G.p.stats.attacks; G.p.intent.act = 'feint';
    for (let i = 0; i < 60; i++) { if (i === 10) { G.e.intent.guard = true; G.e.intent.gline = 'ext'; } T.stepN(1); }
    const r = { events: T.types(), counted: G.p.stats.attacks - atk0, feints: G.p.stats.feints };
    // feinte contre garde : l'adversaire qui a mordu ne peut plus parer parfaitement l'attaque qui suit
    T.setup(225); G.p.intent.act = 'feint'; for (let i = 0; i < 120 && !T.ev.length; i++) { if (i === 8) { G.e.intent.guard = true; } if (i === 40) G.e.intent.guard = false; if (i === 26) G.p.intent.act = 'degage'; if (i === 50) G.e.intent.guard = true; T.stepN(1); }
    r.apresMorsure = T.types();
    return r;
  });
  ok('une feinte n\'est jamais une attaque réelle (ni contact, ni parade, ni compteur)', feint.events.length === 0 && feint.counted === 0 && feint.feints === 1, feint);
  ok('feinte contre garde : la morsure empêche la parade parfaite de l\'attaque suivante', !feint.apresMorsure.includes('parry'), feint.apresMorsure);

  // ---------- 11. pression continue et cas limites ----------
  const edge = await E(() => {
    const r = {};
    // appui continu sur Attaque : une attaque par cycle, pas de doubles déclenchements
    T.setup(600); G.e.x = 900; let starts = 0, prevId = G.p.moveId; for (let i = 0; i < 240; i++) { G.p.intent.act = 'jab'; T.stepN(1); if (G.p.moveId !== prevId) { starts++; prevId = G.p.moveId; } }
    r.attaquesEn2s = starts;
    // attaque pendant une retraite
    T.setup(250); G.p.intent.dash = -1; T.stepN(10); G.p.intent.act = 'degage'; T.stepN(120); r.attaqueEnRetraite = T.types();
    // retraite défensive après une attaque touchée
    T.setup(225); T.holdGuard(G.e, 'ext'); T.ev = []; G.p.intent.act = 'jab'; T.stepUntil(() => T.ev.length, 200); let dashed = false; for (let i = 0; i < 60; i++) { G.p.intent.dash = -1; T.stepN(1); if (G.p.state === 'dash') { dashed = true; break; } } r.retraiteApresAttaque = dashed;
    // retraite impossible après une fente lourde manquée (punissable)
    T.setup(600); G.e.x = 900 + 0; G.p.intent.act = 'heavy'; T.stepUntil(() => G.p.move && G.p.move.whiffed, 300); let d2 = false; for (let i = 0; i < 40; i++) { G.p.intent.dash = -1; T.stepN(1); if (G.p.state === 'dash') d2 = true; } r.retraiteApresLourdeManquee = d2;
    // fente lourde : parade parfaite en Prima possible
    T.setup(280); G.p.intent.act = 'heavy'; const n = T.stepUntil(() => T.ev.length > 0, 300); T.setup(280); G.p.intent.act = 'heavy'; for (let i = 0; i <= n + 2 && !T.ev.length; i++) { if (i === n - 10) { G.e.intent.guard = true; G.e.intent.gline = 'haute'; } T.stepN(1); } r.lourdeContrePrimaParfaite = T.types()[0];
    // fente lourde esquivée par une retraite
    T.setup(290); G.p.intent.act = 'heavy'; for (let i = 0; i < 200; i++) { if (i === 12) G.e.intent.dash = -1; T.stepN(1); } r.lourdeEsquivee = T.types();
    return r;
  });
  ok('appui continu sur Attaque : pas de double déclenchement (≤ 5 estocades en 2 s)', edge.attaquesEn2s >= 3 && edge.attaquesEn2s <= 5, edge.attaquesEn2s);
  ok('attaque pendant une retraite : le coup part après le pas', edge.attaqueEnRetraite.length >= 1, edge.attaqueEnRetraite);
  ok('retraite défensive possible juste après une attaque', edge.retraiteApresAttaque === true);
  ok('pas de retraite après une fente lourde manquée (elle reste punissable)', edge.retraiteApresLourdeManquee === false);
  ok('fente lourde : parade parfaite en Prima au bon moment', edge.lourdeContrePrimaParfaite === 'parry', edge.lourdeContrePrimaParfaite);
  ok('fente lourde esquivée par une retraite : dans le vide', edge.lourdeEsquivee.includes('whiff') && !edge.lourdeEsquivee.includes('hit'), edge.lourdeEsquivee);

  const lat = await E(() => {
    const contactFrames = setup => { T.setup(225); setup(); return T.stepUntil(() => T.ev.length > 0, 200); };
    const direct = contactFrames(() => { G.p.intent.act = 'jab'; });
    const tap = contactFrames(() => { G.p.intent.act = 'p:jab'; G.p.intent.holdAtk = true; T.each = () => { if (G.p.move && G.p.t > .07) G.p.intent.holdAtk = false; }; });
    T.each = null;
    T.setup(600); G.e.x = 900; G.p.intent.act = 'p:jab'; G.p.intent.holdAtk = true; const heavyAt = T.stepUntil(() => G.p.move && G.p.move.kind === 'heavy', 100);
    T.setup(285); G.p.intent.act = 'p:jab'; G.p.intent.holdAtk = true; const hc = T.stepUntil(() => T.ev.length > 0, 200); const direct2 = contactFrames(() => { G.p.intent.act = 'heavy'; });
    T.setup(600); G.e.x = 900; G.p.intent.act = 'p:jab'; G.p.intent.holdAtk = true; T.stepN(10); G.p.intent.guard = true; T.stepN(3); const cancel = G.p.state;
    return { direct, tap, heavyAtMs: Math.round(heavyAt / 120 * 1000), heavyHeld: hc, heavyDirect: direct2, cancel };
  });
  ok('appui bref : aucune latence ajoutée par la détection du maintien (± 1 image)', Math.abs(lat.tap - lat.direct) <= 1, lat);
  ok('Attaque maintenue : la fente lourde part à 0,22 s et touche au même instant qu\'une lourde directe (± 2 images)', lat.heavyAtMs >= 210 && lat.heavyAtMs <= 235 && Math.abs(lat.heavyHeld - lat.heavyDirect) <= 2, lat);
  ok('la garde annule une charge', lat.cancel === 'guard', lat.cancel);
  ok('aucune erreur JavaScript', errs.length === 0, errs);
  fs.writeFileSync(__dirname + '/out/suite.json', JSON.stringify({ results, traj, cov, timing }, null, 1));
  console.log(`\n${results.filter(r => r.pass).length}/${results.length} tests réussis`);
  await b.close();
})();
