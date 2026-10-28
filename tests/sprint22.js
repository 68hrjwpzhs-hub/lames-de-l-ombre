// 2.0 · sprint 22 : gestes, manette, signaux sonores, duel lent
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(600);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => {
    const o = {}; const realFrame = G.frame; G.frame = () => {};
    // options : trois boutons, sauvegardées
    Menu.open('options'); o.btns = ['optGest', 'optCues', 'optSlow'].every(id => !!$(id)); $('optGest').click(); $('optCues').click(); o.saved = JSON.stringify(store.get('ct2d.v2opts', {}));
    // gestes : glisser vers l'adversaire = fente ; vers le bas = esquive ; vers le haut = imbroccata ; un petit glissé ne fait rien
    T.setup(300); T.inputOn = true; o.sw = [Controls.readSwipe(90, 5, 150), Controls.readSwipe(-90, 5, 150), Controls.readSwipe(3, 80, 150), Controls.readSwipe(0, -80, 150), Controls.readSwipe(20, 10, 100), Controls.readSwipe(90, 0, 900)];
    Controls.gesture = null; Controls.readSwipe(90, 5, 150); T.stepN(1); o.fente = G.p.state === 'attack' ? G.p.move.kind : G.p.intent.act;
    T.setup(300); T.inputOn = true; Controls.readSwipe(0, 90, 150); T.stepN(1); o.esq = G.p.state;
    Controls.opt.gestures = false; T.setup(300); T.inputOn = true; o.off = Controls.readSwipe(90, 0, 100); Controls.opt.gestures = true;
    // manette simulée : stick à droite → avance ; A → attaque ; B → esquive ; gâchette → garde
    let btn = Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), axes = [0, 0, 0, 0];
    navigator.getGamepads = () => [{ connected: true, id: 'Manette de test (STANDARD GAMEPAD)', buttons: btn, axes }];
    T.setup(400); T.inputOn = true; axes[0] = 1; const x0 = G.p.x; T.stepN(40); o.padMove = G.p.x - x0; axes[0] = 0;
    btn[0] = { pressed: true, value: 1 }; T.stepN(1); o.padAtk = G.p.state; btn[0] = { pressed: false, value: 0 }; T.stepN(80);
    T.setup(400); T.inputOn = true; btn[6] = { pressed: true, value: 1 }; T.stepN(3); o.padGuard = G.p.guarding || G.p.intent.guard; btn[6] = { pressed: false, value: 0 }; T.stepN(3);
    btn[1] = { pressed: true, value: 1 }; T.stepN(1); o.padEsq = G.p.state; btn[1] = { pressed: false, value: 0 }; T.stepN(80);
    G.state = 'fight'; btn[9] = { pressed: true, value: 1 }; Controls.pollPad(); o.padPause = G.state; btn[9] = { pressed: false, value: 0 }; Controls.pollPad(); G.resume();
    navigator.getGamepads = () => []; Controls.pollPad(); o.padClean = !Input.keys.has('ArrowRight') && !Input.keys.has('KeyJ');
    // signaux : une note par attaque adverse selon la ligne
    T.setup(300); G.silent = false; const tones = []; const t0 = Snd.tone; Snd.tone = function (f) { tones.push(Math.round(f)); }; G.e.startMove('circ'); G.e.state = 'idle'; G.e.startMove('bassa'); G.e.state = 'idle'; G.e.startMove('heavy'); G.p.startMove('jab'); Snd.tone = t0; G.silent = true; o.tones = tones;
    // duel lent : le combat avance à 65 %
    Controls.set('slowDuel', true); G.silent = true; G.level = 'duelliste'; G.startMatch(); o.ts = G.timeScale; G.state = 'fight'; G.banner = null; G.hitStop = 0; G.slowT = 0; G.acc = 0; G.last = 1000; const T0 = G.time; realFrame.call(G, 2000 / 1); /* 0,1 s max */ o.adv = +(G.time - T0).toFixed(3);
    Controls.set('slowDuel', false); G.startMatch(); G.state = 'fight'; G.banner = null; G.hitStop = 0; G.slowT = 0; G.acc = 0; G.last = 1000; const T1 = G.time; realFrame.call(G, 2000); o.adv1 = +(G.time - T1).toFixed(3); G.toMenu(); o.tsMenu = G.timeScale;
    return o;
  });
  console.log(JSON.stringify(r));
  ok('options Gestes, Signaux sonores, Duel lent, sauvegardées', r.btns && /"gestures":true/.test(r.saved) && /"cues":true/.test(r.saved));
  ok('gestes : vers l\'adversaire fente, bas esquive, haut imbroccata ; rien pour un glissé court, lent ou vers l\'arrière', JSON.stringify(r.sw) === JSON.stringify(['fente', null, 'esq', 'circ', null, null]), r.sw);
  ok('le geste déclenche le coup', (r.fente === 'fente' || r.fente === 'p:fente' || r.fente === 'pending') && r.esq === 'esquive', { f: r.fente, e: r.esq });
  ok('gestes désactivés : rien', r.off === null);
  ok('manette : avancer, attaquer, garde, esquive, pause, et nettoyage', r.padMove > 20 && r.padAtk === 'attack' && r.padGuard && r.padEsq === 'esquive' && r.padPause === 'pause' && r.padClean, { m: r.padMove, a: r.padAtk, g: r.padGuard, e: r.padEsq, p: r.padPause });
  ok('signaux sonores : haute aiguë, basse grave, lourde doublée, rien pour le joueur', r.tones.length === 4 && r.tones[0] > r.tones[1] && r.tones[3] === r.tones[2] / 2, r.tones);
  ok('duel lent : le combat avance à 65 %, retour à 100 % au menu', r.ts === .65 && Math.abs(r.adv / r.adv1 - .65) < .1 && r.tsMenu === 1, { lent: r.adv, normal: r.adv1 });
  console.log(errs.length ? 'ERREURS ' + JSON.stringify(errs.slice(0, 3)) : 'aucune erreur'); ok('aucune erreur JavaScript', errs.length === 0);
  console.log(`${res.filter(Boolean).length}/${res.length} tests réussis`); await b.close();
})();
