// 2.0 · sprint 19 : Défi du jour
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(500);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(async () => {
    const o = {}; G.frame = () => {};
    // même défi pour tous le même jour, défis variés d'un jour à l'autre
    const a = Defi.of('2026-11-02'), a2 = Defi.of('2026-11-02'); o.same = JSON.stringify(a) === JSON.stringify(a2);
    const rules = new Set(), venues = new Set(); let k = '2026-11-30'; for (let i = 0; i < 40; i++) { const d = Defi.of(k); rules.add(d.rule); venues.add(d.venue); k = Defi.prevKey(k); } o.rules = rules.size; o.venues = venues.size;
    o.prev = [Defi.prevKey('2026-03-01'), Defi.prevKey('2027-01-01')];
    // bouton dans l'onglet Jouer, écran avec calendrier de 14 jours
    o.btn = !!$('goDefi'); $('goDefi').click(); o.screen = !$('defi').hidden && $('menu').hidden; o.cal = $('defiCal').childElementCount; o.today = $('defiToday').textContent.length > 20;
    // un duel de défi : contrainte comptée, victoire forcée par le joueur
    Save.data.defi = null; const key = Defi.dayKey(), df = Defi.of(key); const ec0 = Save.data.ecus;
    G.silent = true; Defi.start(key); o.started = { mode: G.mode, name: G.e.look.name, venue: G.venue === df.venue, offh: G.e.offhand === df.offhand };
    o.imposed = DEFI_RULES[df.rule].offhand ? G.p.offhand === DEFI_RULES[df.rule].offhand : true;
    // on remplit les conditions de toutes les règles possibles
    Object.assign(Defi.cur.c, { parry: 0, rip: 5, esq: 5, dague: 3, blocks: 6 }); G.p.stats.taken = 10; Defi.cur.t0 = G.time;
    G.wins = [1, 0]; G.roundWinner = G.p; G.state = 'ko'; G.afterRound();
    o.over = { st: G.state, eye: $('overEye').textContent, rew: $('overReward').textContent, again: $('again').textContent };
    const D = Defi.data(); o.done = !!D.done[key]; o.ecus = Save.data.ecus - ec0; o.cosm = D.cosm.slice(); o.streak = Defi.streak(key);
    // série : hier réussi aussi → 2 ; trou → la série repart
    D.done[Defi.prevKey(key)] = { t: 50 }; o.streak2 = Defi.streak(key); D.done[Defi.prevKey(Defi.prevKey(Defi.prevKey(key)))] = { t: 50 }; o.streak3 = Defi.streak(key);
    // deuxième victoire le même jour : pas de double récompense
    const ec1 = Save.data.ecus; Defi.start(key); Object.assign(Defi.cur.c, { rip: 5, esq: 5, dague: 3, blocks: 6 }); G.wins = [1, 0]; G.roundWinner = G.p; G.state = 'ko'; G.afterRound(); o.twice = { d: Save.data.ecus - ec1, t: $('overReward').textContent };
    // défaite : défi manqué
    Defi.start(Defi.prevKey(Defi.prevKey(key))); G.wins = [0, 1]; G.roundWinner = G.e; G.state = 'ko'; G.afterRound(); o.lost = $('overReward').textContent.startsWith('Défi manqué');
    // « Revanche » ramène à l'écran du défi
    $('again').click(); o.back = !$('defi').hidden;
    // ornement porté : la plume / le pourpoint du héros changent ; écran listé
    Defi.render(); o.cosmBtns = $('defiCosm').querySelectorAll('button').length; const x = COSM.find(c => c.id === D.cosm[0]); Defi.wear(x.kind, x.id);
    o.worn = x.kind === 'plume' ? LOOKS.player.plume === x.col : x.kind === 'coat' ? LOOKS.player.coat === x.col : RAPIERS.heros.hilt === x.col;
    // la plume du Cardinal exige 7 jours
    D.cosm = COSM.filter(c => !c.streak).map(c => c.id); Defi.cur = { df: Defi.of('2030-01-10'), c: { won: true, parry: 0, rip: 9, esq: 9, taken: 0, time: 10, dague: 9, blocks: 9 }, t0: G.time }; o.noCardinal = Defi.finish(true).cosm;
    for (let i = 1; i <= 6; i++) { let kk = '2030-01-10'; for (let j = 0; j < i; j++) kk = Defi.prevKey(kk); D.done[kk] = { t: 1 }; } delete D.done['2030-01-11']; Defi.cur = { df: Defi.of('2030-01-11'), c: { won: true, parry: 0, rip: 9, esq: 9, taken: 0, time: 10, dague: 9, blocks: 9 }, t0: G.time }; G.p.stats.taken = 0; const fin = Defi.finish(true); o.cardinal = fin.cosm && fin.cosm.id; o.st8 = fin.streak;
    // carte de partage : une image dessinée, et un texte
    const c = Defi.card(); o.card = c.width === 900 && c.getContext('2d').getImageData(450, 240, 1, 1).data[3] === 255; o.text = Defi.shareText();
    // le compteur de règles en vrai combat : une riposte du joueur est comptée
    Defi.start(key); const C = Defi.cur; G.event('hit', { a: G.p, d: G.e, m: { kind: 'riposte' } }); G.event('esquive', { a: G.e, d: G.p }); G.event('parry', { a: G.e, d: G.p }); o.count = [C.c.rip, C.c.esq, C.c.parry];
    G.toMenu(); G.show('menu'); o.badge = $('goDefi').textContent;
    return o;
  });
  console.log(JSON.stringify(r));
  ok('même défi pour tous le même jour, défis variés', r.same && r.rules >= 6 && r.venues >= 4, { rules: r.rules, venues: r.venues });
  ok('calcul de la veille (fin de mois, d\'année)', r.prev[0] === '2026-02-28' && r.prev[1] === '2026-12-31', r.prev);
  ok('bouton « Défi du jour », écran avec calendrier de 14 jours', r.btn && r.screen && r.cal === 14 && r.today);
  ok('le duel du défi : adversaire, décor, main gauche imposés', r.started.mode === 'duel' && r.started.venue && r.started.offh && r.imposed, r.started);
  ok('défi relevé : écus, ornement, série, écran de fin', r.over.st === 'over' && /Défi relevé/.test(r.over.rew) && r.done && r.ecus >= 40 && r.cosm.length === 1 && r.streak === 1 && r.over.again === 'Défi du jour', r.over);
  ok('série : jours consécutifs comptés, un trou la coupe', r.streak2 === 2 && r.streak3 === 2, [r.streak2, r.streak3]);
  ok('pas de double récompense le même jour (seuls les écus du duel)', /déjà relevé/.test(r.twice.t) && r.twice.d === 50, r.twice);
  ok('défaite : défi manqué', r.lost);
  ok('« Défi du jour » ramène à l\'écran du défi', r.back);
  ok('ornement porté sur le héros', r.cosmBtns >= 1 && r.worn);
  ok('plume du Cardinal : seulement après 7 jours de suite', r.noCardinal === null && r.cardinal === 'plumeBlanche' && r.st8 >= 7, { a: r.noCardinal, b: r.cardinal, s: r.st8 });
  ok('partage : carte image et texte', r.card && /Défi du/.test(r.text), r.text);
  ok('les contraintes sont comptées en combat', r.count.join() === '1,1,1', r.count);
  ok('le bouton du menu marque le défi relevé', /✓/.test(r.badge), r.badge);
  console.log(errs.length ? 'ERREURS ' + JSON.stringify(errs.slice(0, 3)) : 'aucune erreur'); ok('aucune erreur JavaScript', errs.length === 0);
  console.log(`${res.filter(Boolean).length}/${res.length} tests réussis`); await b.close();
})();
