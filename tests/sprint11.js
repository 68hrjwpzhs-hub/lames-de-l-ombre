// sprints 11 et 12 : rendu direct (fluidité), réglage automatique, calque CSS, réactivité ; liement des lames, domination, reprise en arrière, sons d'acier
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(600);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => { GL.set(false); // mesures du rendu 2D seul (le moteur WebGL a ses propres tests)
    const o = {}; G.frame = () => {};
    // 1. rendu par défaut sur écran tactile : direct ; temps de rendu
    o.mode0 = Paint.mode; T.setup(230); G.venue = 'salle'; for (let i = 0; i < 30; i++) G.render(1 / 60);
    let t = performance.now(); for (let i = 0; i < 120; i++) { G.step(1 / 120); G.render(1 / 60); } o.directMs = +((performance.now() - t) / 120).toFixed(2);
    Paint.mode = 'cinema'; for (let i = 0; i < 30; i++) G.render(1 / 60); t = performance.now(); for (let i = 0; i < 120; i++) { G.step(1 / 120); G.render(1 / 60); } o.cinemaMs = +((performance.now() - t) / 120).toFixed(2);
    // 2. régulateur : cinéma trop lent → direct ; direct très rapide longtemps → essai du cinéma
    Paint.kMax = 1.25; Paint.tSum = 0; Paint.tN = 0; for (let i = 0; i < 90; i++) Paint.measure(24); o.toDirect = Paint.mode;
    Paint.fast = 0; for (let w = 0; w < 8; w++) for (let i = 0; i < 90; i++) Paint.measure(8); o.toCinema = Paint.mode;
    Paint.mode = 'direct'; for (let i = 0; i < 90; i++) Paint.measure(25); o.lite = Paint.lite; Paint.lite = false; store.set('ct2d.rmode', 'direct');
    // 3. vignettage en calque CSS
    G.render(1 / 60); o.vig = !$('vig').hidden && /radial-gradient/.test($('vig').style.backgroundImage);
    // 4. réactivité : l'appui sur Attaque démarre le geste au pas de simulation suivant
    T.setup(400); T.inputOn = true; Input.pressed.attack = true; Input.btn.attack = true; let n = 0; while (G.p.state !== 'attack' && n++ < 10) G.step(1 / 120); o.latSteps = n; Input.btn.attack = false; T.inputOn = false;
    // 5. liement : trouver la distance où les fers s'engagent, puis pousser
    let dEng = null; for (const dd of [200, 210, 220, 230, 190, 240, 180]) { T.setup(dd); T.stepN(80); if (G.engaged) { dEng = dd; break; } } o.dEng = dEng;
    let sc = 0; const s0 = Snd.scrape; Snd.scrape = v => { sc++; }; T.ev = [];
    if (dEng) { for (let i = 0; i < 180 && !T.types().includes('dominate'); i++) { G.p.intent.dx = 1; T.stepN(1); } }
    Snd.scrape = s0; o.dom = { ev: T.types().includes('dominate'), eDom: G.time - (G.e.dominatedT || -9) < 1, pQuick: G.time - (G.p.lastBeatT || -9) < 1, scrapes: sc };
    if (dEng) { G.p.intent.dx = 0; G.e.startMove('jab'); o.domWu = +(G.e.move.wu / (MOVES.jab.wu * G.e.slow * (G.e.rapier ? G.e.rapier.speed : 1))).toFixed(2); }
    // 6. reprise en arrière après une fente : récupération plus courte
    const fenteDur = back => { T.setup(500); G.p.startMove('fente'); let k = 0; while (G.p.state === 'attack' && k++ < 400) { G.p.intent.dx = back && G.p.t > G.p.move.wu + G.p.move.act + .08 ? -1 : 0; T.stepN(1); } return k; };
    o.fente = { normal: fenteDur(false), arriere: fenteDur(true) };
    // 7. l'IA pousse au fer (Maître)
    let pushes = 0; for (let k = 0; k < 20; k++) { T.setup(dEng || 220); const ai = new AI(G.e, G.p, 'maitre'); G.ai = ai; ai.L.aggr = 0; for (let i = 0; i < 120; i++) { T.stepN(1); ai.think(1 / 120); if (G.e.engaged && G.e.intent.dx * G.e.dir > .3) { pushes++; break; } } }
    o.aiPush = pushes;
    // 8. la rapière qui tombe sonne sur le sol
    let cl = 0; const c0 = Snd.clatter; Snd.clatter = () => cl++; T.setup(225); G.mode = 'duel'; G.state = 'fight'; CFG.finisher = false; G.e.hp = 4; G.p.startMove('jab'); T.stepUntil(() => G.e.state === 'ko', 200); T.stepN(200); Snd.clatter = c0; CFG.finisher = true; o.clatter = cl;
    return o;
  });
  console.log(JSON.stringify(r));
  ok('écran tactile : rendu direct par défaut', r.mode0 === 'direct', r.mode0);
  ok('rendu direct au moins 2 fois plus rapide que le rendu composé (côté script)', r.directMs * 2 <= r.cinemaMs, { direct: r.directMs, cinema: r.cinemaMs });
  ok('régulateur : composé trop lent → direct ; direct très rapide → essai du composé ; direct lent → allégé', r.toDirect === 'direct' && r.toCinema === 'cinema' && r.lite, { a: r.toDirect, b: r.toCinema, lite: r.lite });
  ok('vignettage et grain en calque CSS', r.vig);
  ok('réactivité : le geste part au pas de simulation suivant (≤ 8,3 ms)', r.latSteps <= 1, r.latSteps);
  ok('fer engagé trouvé', r.dEng !== null, r.dEng);
  ok('liement : pousser domine le fer (bruit d\'acier, lame adverse ralentie, la vôtre vive)', r.dom.ev && r.dom.eDom && r.dom.pQuick && r.dom.scrapes > 0, r.dom);
  ok('fer dominé : son coup suivant part 20 % plus lentement', r.domWu >= 1.15, r.domWu);
  ok('reprise en arrière : retour en garde plus court', r.fente.arriere < r.fente.normal, r.fente);
  ok('l\'IA pousse au fer', r.aiPush >= 3, r.aiPush);
  ok('la rapière tombée sonne sur le sol', r.clatter >= 1, r.clatter);
  console.log(errs.length ? 'ERREURS ' + JSON.stringify(errs.slice(0, 3)) : 'aucune erreur'); ok('aucune erreur JavaScript', errs.length === 0);
  console.log(`${res.filter(Boolean).length}/${res.length} tests réussis`); await b.close();
})();
