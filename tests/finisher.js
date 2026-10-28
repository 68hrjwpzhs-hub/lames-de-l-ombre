// finales automatiques : une par héros et par type d'adversaire, seulement sur la touche qui gagne le match
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(500);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => {
    const o = {}; G.frame = () => {}; const ch0 = curHero;
    const run = (setup) => { T.setup(200); G.silent = false; G.mode = 'duel'; G.state = 'fight'; G.winsNeeded = 1; G.wins = [0, 0]; const [w, l] = setup(); l.hp = 0; G.ko(l); const k = Finisher.cur && Finisher.key(w), name = Finisher.cur && Finisher.cur.F.name;
      let n = 0; while (G.state === 'finish' && n++ < 1200) G.step(1 / 120); const st1 = G.state, ko = l.state, dis = l.disarmed; for (let i = 0; i < 900 && G.state === 'ko'; i++) G.step(1 / 120); return { k, name, st1, ko, dis, end: G.state, frames: n }; };
    // héros
    o.heroes = {}; for (const h of Object.keys(HEROES)) { curHero = () => HEROES[h]; o.heroes[h] = run(() => [G.p, G.e]); } curHero = ch0;
    // adversaires
    const foes = { drac: { arch: 'drac' }, rueda: { arch: 'destreza' }, lanterne: { sig: 'lanterne' }, horloger: { sig: 'horloger' }, garde: { name: 'Garde du Cardinal' }, generic: {} };
    o.foes = {}; for (const k in foes) o.foes[k] = run(() => { G.e.arch = foes[k].arch || null; G.e.sig = foes[k].sig || null; G.e.look = Object.assign({}, G.e.look, { name: foes[k].name || 'Spadassin' }); return [G.e, G.p]; });
    // pas de finale sur une manche non décisive, ni en entraînement
    T.setup(200); G.mode = 'duel'; G.state = 'fight'; G.winsNeeded = 2; G.wins = [0, 0]; G.e.hp = 0; G.ko(G.e); o.notDecisive = G.state;
    T.setup(200); G.mode = 'training'; G.state = 'fight'; G.winsNeeded = 1; G.wins = [0, 0]; G.e.hp = 0; G.ko(G.e); o.training = G.state;
    // passer d'un toucher
    T.setup(200); G.mode = 'duel'; G.state = 'fight'; G.winsNeeded = 1; G.wins = [0, 0]; G.e.hp = 0; G.ko(G.e); G.step(1 / 120); Finisher.skip(); o.skip = { st: G.state, dis: G.e.disarmed, ko: G.e.state };
    // option désactivée : coup de grâce habituel
    CFG.finisher = false; T.setup(200); G.mode = 'duel'; G.state = 'fight'; G.winsNeeded = 1; G.wins = [0, 0]; G.e.hp = 0; G.ko(G.e); o.off = G.state; CFG.finisher = true;
    return o;
  });
  const H = Object.values(r.heroes), F = Object.values(r.foes), all = H.concat(F);
  ok('chaque héros a sa propre finale', new Set(H.map(x => x.k)).size === H.length && new Set(H.map(x => x.name)).size === H.length, H.map(x => x.name));
  ok('chaque type d\'adversaire a la sienne', new Set(F.map(x => x.k)).size === F.length, F.map(x => x.k + ':' + x.name));
  ok('toutes les finales vont au bout : vaincu désarmé, au sol ou à genoux, fin du match', all.every(x => x.st1 === 'ko' && x.ko === 'ko' && x.dis && x.end === 'over'), all.map(x => x.k + ':' + x.st1 + '/' + x.end));
  ok('durée raisonnable (3 à 4 s)', all.every(x => x.frames >= 360 && x.frames <= 480), all.map(x => x.frames));
  ok('pas de finale sur une manche non décisive', r.notDecisive === 'ko', r.notDecisive);
  ok('pas de finale à l\'entraînement', r.training === 'fight', r.training);
  ok('un toucher passe la finale', r.skip.st === 'ko' && r.skip.dis && r.skip.ko === 'ko', r.skip);
  ok('option Finales désactivée : coup de grâce habituel', r.off === 'ko', r.off);
  console.log(errs.length ? 'ERREURS ' + JSON.stringify(errs.slice(0, 3)) : 'aucune erreur'); ok('aucune erreur JavaScript', errs.length === 0);
  console.log(`${res.filter(Boolean).length}/${res.length} tests réussis`); await b.close();
})();
