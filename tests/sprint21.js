// 2.0 · sprint 21 : école d'escrime
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(600);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => {
    const o = {}; G.frame = () => {}; G.silent = true;
    Save.data.ecole = null; Save.data.ecus = 100;
    Menu.open('salle'); o.btn = !!$('goEcole'); $('goEcole').click(); o.screen = !$('ecole').hidden;
    o.cantOpen = $('ecoleOpenBtn').disabled; Save.data.ecus = 500; Ecole.render(); $('ecoleOpenBtn').click(); o.opened = Ecole.data().open && Save.data.ecus === 350;
    // candidats du jour : stables dans la journée, recrutement
    const c1 = JSON.stringify(Ecole.candidates('2026-11-05')), c2 = JSON.stringify(Ecole.candidates('2026-11-05')), c3 = JSON.stringify(Ecole.candidates('2026-11-06')); o.cands = c1 === c2 && c1 !== c3;
    const rb = $('ecoleCands').querySelector('[data-act="recruit"]'); rb.click(); o.recruited = Ecole.data().eleves.length === 1 && Save.data.ecus === 310; o.again = !Ecole.recruit(Ecole.candidates()[0]);
    const e = Ecole.data().eleves[0];
    // leçons : 2 par jour, un tiers de niveau chacune
    const l0 = e.lvl; e.xp = 0; Ecole.lesson(e); Ecole.lesson(e); o.third = Ecole.lesson(e); o.lvl = [l0, e.lvl, e.xp]; e.lessons = { day: null, n: 0 }; Ecole.lesson(e); o.lvlUp = e.lvl === l0 + 1;
    // traité : les planches maîtrisées passent à l'élève et changent son IA
    Manuscrit.data().tech.fente = { n: 9 }; Manuscrit.data().tech.parry = { n: 9 }; const n = Ecole.transmit(e); o.taught = [n, e.taught.slice()]; o.again2 = Ecole.transmit(e);
    const ai0 = new AI(G.p, G.e, Ecole.level(e)), ai1 = Ecole.makeAI(e, G.p, G.e); o.aiW = [ai0.L.w.fente, ai1.L.w.fente]; o.aiP = [ai0.L.perfect || 0, ai1.L.perfect];
    // duel délégué : l'élève prend la place du joueur, piloté par son IA ; on passe → résultat
    e.lvl = 9; T.inputOn = true; Ecole.render(); $('ecoleList').querySelector('[data-act="fight"]').click(); o.fight = { st: G.state, name: G.p.look.name, bar: !$('ecoleBar').hidden, watch: document.body.classList.contains('ecole-watch'), offh: G.p.offhand === (e.offhand || null) };
    const hp0 = [G.p.hp, G.e.hp]; for (let i = 0; i < 600; i++) { G.hitStop = 0; G.slowT = 0; G.step(1 / 120); if (G.state === 'round') G.banner.t = 99; } o.moved = G.p.stats.attacks > 0 || G.p.hp !== hp0[0] || G.e.hp !== hp0[1] || (G.p.stats.blocks || 0) > 0;
    const ec0 = Save.data.ecus, rec0 = JSON.stringify(G.record); Ecole.skip(); o.after = { st: G.state, verdict: $('verdict').textContent, rew: $('overReward').textContent, again: $('again').textContent, w: e.w, l: e.l, stage: e.stage, ecus: Save.data.ecus - ec0, rec: JSON.stringify(G.record) === rec0, bar: $('ecoleBar').hidden };
    // retour à l'école ; l'avatar du joueur revient
    $('again').click(); o.back = !$('ecole').hidden && LOOKS.player.name !== e.name;
    // élève battu : au repos jusqu'à demain
    e.hurt = Ecole.today(); o.rest = !Ecole.canFight(e) && !Ecole.fight(e);
    // victoire forcée : +écus, étape suivante ; défaite : repos
    e.hurt = null; Ecole.fight(e); const st0 = e.stage, ec1 = Save.data.ecus; G.wins = [1, 0]; G.roundWinner = G.p; G.state = 'ko'; G.afterRound(); o.win = { stage: e.stage - st0, ecus: Save.data.ecus - ec1 };
    G.toMenu(); Ecole.fight(e); G.wins = [0, 1]; G.roundWinner = G.e; G.state = 'ko'; G.afterRound(); o.lose = !Ecole.canFight(e);
    G.toMenu(); Ecole.show(); o.max = ECOLE_MAX;
    return o;
  });
  console.log(JSON.stringify(r));
  ok('bouton « Mon école » dans la Salle d\'armes, écran', r.btn && r.screen);
  ok('ouvrir l\'école coûte 150 écus', r.cantOpen && r.opened);
  ok('trois candidats par jour, stables dans la journée', r.cands);
  ok('recrutement (40 écus), une seule fois par candidat', r.recruited && r.again);
  ok('leçons : 2 par jour, trois leçons font un niveau', r.third === false && r.lvlUp, r.lvl);
  ok('traité transmis : planches maîtrisées, sans doublon, l\'IA de l\'élève change', r.taught[0] === 2 && r.again2 === 0 && r.aiW[1] > r.aiW[0] && r.aiP[1] > r.aiP[0], { t: r.taught, w: r.aiW, p: r.aiP });
  ok('duel délégué : l\'élève à la place du joueur, piloté par son IA', r.fight.name !== 'Vous' && r.fight.bar && r.fight.watch && r.fight.offh && r.moved, r.fight);
  ok('« Passer » : le duel se joue, résultat et récompense, sans toucher au bilan du joueur', r.after.st === 'over' && /élève/.test(r.after.verdict) && r.after.w + r.after.l === 1 && r.after.rec && r.after.bar && r.after.again === 'Retour à l\'école', r.after);
  ok('retour à l\'école, le héros du joueur revient', r.back);
  ok('élève battu : repos jusqu\'à demain', r.rest && r.lose);
  ok('victoire : étape suivante de la Nuit de Paris, écus', r.win.stage === 1 && r.win.ecus >= 30, r.win);
  console.log(errs.length ? 'ERREURS ' + JSON.stringify(errs.slice(0, 3)) : 'aucune erreur'); ok('aucune erreur JavaScript', errs.length === 0);
  console.log(`${res.filter(Boolean).length}/${res.length} tests réussis`); await b.close();
})();
