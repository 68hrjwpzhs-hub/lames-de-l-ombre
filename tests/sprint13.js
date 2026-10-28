// sprints 13 à 16 : manuscrit, menu, HUD, pause, bouche, tics, histoire, récits, visages, chapeau, accessibilité, initiation, cache des teintes
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(600);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => {
    const o = {}; G.frame = () => {};
    // menu en onglets, accueil
    o.tabs = [...document.querySelectorAll('#menu .mtabs button')].map(b => b.textContent); o.welcome = !!document.querySelector('#menu .welcome');
    Menu.open('biblio'); o.biblio = !$('goManus').closest('.mpanel').hidden && $('goStory').closest('.mpanel').hidden;
    // manuscrit : réussites comptées en duel, planche maîtrisée, page d'adversaire, surnom
    Save.data.manus = null; T.setup(225); G.silent = false; G.mode = 'duel'; for (let i = 0; i < 3; i++) { T.ev = []; G.e.hp = 100; G.p.startMove('jab'); T.stepUntil(() => T.types().includes('hit'), 200); T.stepN(60); }
    o.jab = Manuscrit.data().tech.jab; o.mastered = Manuscrit.mastered('jab'); o.nick = Manuscrit.nickname();
    G.matchOpts = { opp: { name: 'Ser Test' } }; G.e.look = Object.assign({}, G.e.look, { name: 'Ser Test' }); Manuscrit.onMatchEnd(true); o.foe = Manuscrit.data().foes['Ser Test'];
    Manuscrit.show(); Manuscrit.page('tech', MAN_TECH[0]); o.plate = !!$('manusPlate').getContext('2d').getImageData(320, 200, 1, 1).data[3]; o.train = !$('manusTrain').hidden; G.show(null);
    // HUD : l'annonce du carnet attend la fin du bandeau
    Codex.toastQ = [{ e: { title: 'Essai' }, t0: 0 }]; G.banner = { text: 'Manche 1', t: 0, dur: 2 }; Codex.draw(G.g, 1); o.toastWait = Codex.toastQ[0].t0 === 0; G.banner = null; Codex.draw(G.g, 1); o.toastGo = Codex.toastQ[0].t0 > 0; Codex.toastQ = [];
    // pause : leçon, relecture, liste des coups
    T.setup(225); G.state = 'fight'; G.mode = 'duel'; G.pause(); o.pauseMoves = $('pauseMovesList').childElementCount > 5; G.resume();
    // tics de caractère et bouche qui parle
    G.startMatch(); o.idle = [G.p.idleStyle, G.e.idleStyle]; Story.play(0); Story.next(); Story.next(); for (let i = 0; i < 20; i++) G.step(1 / 120); o.talk = [G.p, G.e, ...Object.values(Cine.npcs)].some(f => f.talking); Cine.end(); Story.cur = null; G.state = 'menu';
    // histoire : répliques ajoutées, choix qui pèsent, récits
    o.ch1 = STORY[0].intro.length; const S = Story.data(); S.choices.ch05 = 'epargner'; o.omb = Story.filt(STORY.find(c => c.id === 'ch09').intro).some(l => l.who === 'ombeline');
    S.choices.ch05 = 'livrer'; o.noOmb = !Story.filt(STORY.find(c => c.id === 'ch09').intro).some(l => l.who === 'ombeline');
    o.side = STORY.filter(c => c.side).length; const iSide = STORY.findIndex(c => c.side); o.sideLocked = !Story.unlocked(iSide); S.done.ch10 = { stars: 1 }; o.sideOpen = Story.unlocked(iSide);
    o.lore = ['larochelle', 'dupes', 'pommedepin', 'trahoir', 'ombre6'].every(id => CODEX.some(e => e.id === id));
    // visages, chapeau qui vole à la finale
    o.faces = { v: HEROES.vaucelles.look.age, vs: HEROES.vaucelles.look.scar, a: HEROES.alvaro.look.nose };
    T.setup(200); G.silent = false; G.mode = 'duel'; G.state = 'fight'; G.winsNeeded = 1; G.wins = [0, 0]; G.e.hp = 0; G.ko(G.e); for (let i = 0; i < 300 && G.state === 'finish'; i++) G.step(1 / 120); o.hat = { off: G.e.hatOff, flying: (G.hats || []).length };
    // accessibilité
    CFG.bigText = CFG.bigBtn = CFG.cueShape = true; G.a11y(); o.a11y = ['bigtext', 'bigbtn', 'cueshape'].every(c => document.body.classList.contains(c)); CFG.bigText = CFG.bigBtn = CFG.cueShape = false; G.a11y();
    // initiation : cinq étapes déclenchées par les bons gestes
    G.level = 'training'; G.exercise = 'initiation'; G.silent = true; G.startMatch(); G.state = 'fight'; const C = G.ai; o.initEx = C.ex;
    C.onEvent('hit', { a: G.p, d: G.e, m: { kind: 'jab' } }); C.onEvent('parry', { a: G.e, d: G.p }); C.onEvent('hit', { a: G.p, d: G.e, m: { kind: 'riposte' } }); C.onEvent('esquive', { a: G.e, d: G.p }); G.p.stats.dashF = 1; C.onEvent('hit', { a: G.p, d: G.e, m: { kind: 'jab' } });
    o.initCount = C.count; o.initDone = store.get('ct2d.initDone', 0);
    // cache des teintes borné
    const n0 = [..._shade.values()].reduce((a, m) => a + m.size, 0); for (let i = 0; i < 2000; i++) shade('#7a1a24', Math.random() * .5); o.shadeGrow = [..._shade.values()].reduce((a, m) => a + m.size, 0) - n0;
    return o;
  });
  console.log(JSON.stringify(r));
  ok('menu en quatre onglets, accueil du premier lancement', r.tabs.length === 4 && r.welcome && r.biblio, r.tabs);
  ok('manuscrit : 3 estocades réussies → planche maîtrisée', r.jab && r.jab.n >= 3 && r.mastered, r.jab);
  ok('manuscrit : surnom, page d\'adversaire, planche dessinée, bouton s\'entraîner', !!r.nick && r.foe && r.foe.w === 1 && r.plate && r.train, { nick: r.nick, foe: r.foe && r.foe.w });
  ok('HUD : l\'annonce attend la fin du bandeau', r.toastWait && r.toastGo);
  ok('pause : liste des coups', r.pauseMoves);
  ok('tics de caractère et bouche qui parle', r.idle.every(Boolean) && r.talk, { idle: r.idle, talk: r.talk });
  ok('histoire : répliques ajoutées, Ombeline revient seulement si épargnée', r.ch1 >= 10 && r.omb && r.noOmb, { ch1: r.ch1 });
  ok('6 récits, ouverts après le chapitre 10, et leur lore', r.side === 6 && r.sideLocked && r.sideOpen && r.lore, r.side);
  ok('visages : âge, balafre, nez', r.faces.v === 'vieux' && r.faces.vs && r.faces.a > 1, r.faces);
  ok('finale : le chapeau du vaincu s\'envole', r.hat.off && r.hat.flying >= 1, r.hat);
  ok('accessibilité : texte plus grand, gros boutons, signal visible', r.a11y);
  ok('initiation : cinq gestes, puis terminée', r.initEx === 'initiation' && r.initCount === 5 && r.initDone, { c: r.initCount });
  ok('cache des teintes borné (plus de fuite)', r.shadeGrow <= 30, r.shadeGrow);
  console.log(errs.length ? 'ERREURS ' + JSON.stringify(errs.slice(0, 3)) : 'aucune erreur'); ok('aucune erreur JavaScript', errs.length === 0);
  console.log(`${res.filter(Boolean).length}/${res.length} tests réussis`); await b.close();
})();
