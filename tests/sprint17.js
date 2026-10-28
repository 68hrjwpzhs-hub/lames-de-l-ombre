// 2.0 · sprint 17 : main gauche (dague, cape, rondache)
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(500);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => {
    const o = {}; G.frame = () => {};
    // parade parfaite : on lève la garde juste avant l'impact
    const parryVs = (k) => { T.setup(225); G.p.offhand = k; const h0 = G.e.hp; G.e.intent.act = 'jab'; T.stepUntil(() => G.e.state === 'attack' && G.e.t >= G.e.move.wu - .06, 200); T.inputOn = false; G.p.intent.guard = true; G.p.guarding = true; G.p.pressT = G.time; G.p.perfectOk = true; T.stepUntil(() => T.types().length, 120); return { ev: T.types()[0], dmg: h0 - G.e.hp, end: G.p.ripOffer ? +(G.p.ripOffer.end - G.p.ripOffer.t0).toFixed(2) : 0 }; };
    o.parNone = parryVs(null); o.parDague = parryVs('dague');
    // cape : esquive réussie → l'attaque perdue récupère plus lentement ; touches -10 %
    const dodgeRec = (k) => { T.setup(225); G.p.offhand = k; G.e.intent.act = 'jab'; T.stepUntil(() => G.e.state === 'attack' && G.e.t >= G.e.move.wu - .08, 200); G.p.intent.esq = true; T.stepUntil(() => T.types().includes('esquive'), 120); let n = 0; T.stepUntil(() => { n++; return G.e.state !== 'attack'; }, 400); return n; };
    o.recNone = dodgeRec(null); o.recCape = dodgeRec('cape');
    T.setup(225); G.p.offhand = 'cape'; o.capeDmg = G.dmgFor(G.e, G.p, { kind: 'jab', dmg: 10 });
    // rondache : la fente lourde ne brise pas la garde la première fois, la deuxième si
    const heavyOn = () => { G.e.intent.act = 'heavy'; G.p.intent.guard = true; G.p.guarding = true; G.p.perfectOk = false; G.p.pressT = -9; T.ev = []; T.stepUntil(() => T.types().some(t => t === 'block' || t === 'break' || t === 'hit'), 300); const t = T.types().find(t => t === 'block' || t === 'break' || t === 'hit'); T.stepN(150); G.p.state = 'idle'; G.e.state = 'idle'; return t; };
    T.setup(225); G.p.offhand = 'rondache'; G.p.breath = 1; o.rond1 = heavyOn(); G.p.breath = 1; G.e.x = G.p.x + 225; o.rond2 = heavyOn();
    T.setup(225); G.p.offhand = null; o.rondNone = heavyOn();
    // rondache : garde tenue, moitié moins de souffle
    const blockCost = (k) => { T.setup(225); G.p.offhand = k; G.p.breath = .5; G.e.startMove('jab'); G.block(G.e, G.p, [G.p.x, 300], { a: G.e, d: G.p, m: G.e.move }); return +(.5 - G.p.breath).toFixed(3); };
    o.costNone = blockCost(null); o.costRond = blockCost('rondache');
    // pose : la main gauche avance en garde, et se dessine
    T.setup(225); G.p.offhand = null; T.stepN(2); const w0 = G.p.J.bwr[0]; G.p.offhand = 'dague'; T.stepN(2); const w1 = G.p.J.bwr[0]; o.armFwd = (w1 - w0) * G.p.dir;
    const c = document.createElement('canvas'); c.width = 300; c.height = 300; const g = c.getContext('2d'); let drew = 0; for (const k of OFFH_KEYS) { G.p.offhand = k; g.clearRect(0, 0, 300, 300); g.save(); g.translate(150 - G.p.x, 150 - (GROUND - 120)); drawFighter(g, G.p); g.restore(); drew++; } o.drew = drew;
    // salle d'armes : choix sauvegardé, héros par défaut
    Menu.open('salle'); o.ui = $('offhRow') ? $('offhRow').childElementCount : 0; Save.data.hero = 'isaure'; Save.data.offh = {}; o.defIsaure = Offhand.ofPlayer(); $('offhRow').querySelector('[data-v="cape"]').click(); o.chosen = Offhand.ofPlayer(); o.saved = Save.data.offh.isaure;
    Save.data.hero = 'alvaro'; o.defAlvaro = Offhand.ofPlayer(); Save.data.hero = 'vaucelles';
    // l'adversaire reçoit une main gauche selon le niveau ; l'IA en tient compte
    G.silent = true; G.level = 'maitre'; const seen = {}; for (let i = 0; i < 40; i++) { G.startMatch(); seen[G.e.offhand || 'aucune'] = 1; } o.foeKinds = Object.keys(seen).sort();
    G.level = 'debutant'; G.startMatch(); o.debutant = G.e.offhand;
    // match IA contre IA avec mains gauches : pas d'erreur, il finit
    G.level = 'duelliste'; const m = T.match('duelliste', 'duelliste', 200); o.match = m.over;
    o.codex = CODEX.some(e => e.id === 'maingauche');
    return o;
  });
  console.log(JSON.stringify(r));
  ok('dague : parade parfaite → coup de main gauche (5) et riposte offerte plus longtemps', r.parNone.ev === 'parry' && r.parDague.ev === 'parry' && r.parDague.dmg === 5 && r.parNone.dmg === 0 && r.parDague.end > r.parNone.end, { n: r.parNone, d: r.parDague });
  ok('cape : l\'esquive emmêle la lame (récupération plus longue)', r.recCape > r.recNone + 25, { sans: r.recNone, cape: r.recCape });
  ok('cape : touches -10 %', r.capeDmg === 9, r.capeDmg);
  ok('rondache : tient une fente lourde par manche, pas deux', r.rond1 === 'block' && r.rond2 === 'break' && r.rondNone === 'break', { r1: r.rond1, r2: r.rond2, sans: r.rondNone });
  ok('rondache : garde tenue à moitié prix', r.costNone > 0 && Math.abs(r.costRond - r.costNone / 2) < .005, { sans: r.costNone, rond: r.costRond });
  ok('main gauche tenue en avant en garde et dessinée (3 armes)', r.armFwd > 8 && r.drew === 3, r.armFwd);
  ok('salle d\'armes : choix par héros sauvegardé, préférences par défaut', r.ui === 4 && r.defIsaure === 'dague' && r.chosen === 'cape' && r.saved === 'cape' && r.defAlvaro === null);
  ok('adversaires : mains gauches variées au niveau maître, aucune au niveau débutant', r.foeKinds.length >= 3 && r.debutant === null, r.foeKinds);
  ok('duel IA contre IA complet avec mains gauches', r.match);
  ok('carnet : entrée « La main gauche »', r.codex);
  console.log(errs.length ? 'ERREURS ' + JSON.stringify(errs.slice(0, 3)) : 'aucune erreur'); ok('aucune erreur JavaScript', errs.length === 0);
  console.log(`${res.filter(Boolean).length}/${res.length} tests réussis`); await b.close();
})();
