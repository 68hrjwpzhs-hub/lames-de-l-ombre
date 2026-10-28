// injecté dans la page : utilitaires de test pas à pas (sans rendu)
Input._apply = Input._apply || Input.apply; Input.apply = function (f, dt) { if (T.inputOn) Input._apply(f, dt); };
// héros neutre pour les tests mécaniques (les qualités des héros sont testées à part, avec T.realHero)
T0_realHero = curHero; curHero = () => ({ name: 'Vous', resist: 1, speed: 1, dmg: 1, dash: 1, parry: 0, passive: ['', ''], rapier: Object.assign({}, RAPIERS.garnison), look: Object.assign({}, LOOKS.player) });
window.T = { realHero: T0_realHero,
  ev: [],
  setup(dist = 220, level = 'duelliste') {
    G.silent = true; G.level = level; G.forceWeather = 'clear'; G.startMatch(); G.p.offhand = G.e.offhand = null; G.weather = 'clear'; G.guet = false; G.state = 'fight'; G.banner = null; G.mode = 'duel'; G.timer = 999;
    G.ai = { think() {}, onEvent: (t, i) => T.ev.push({ t, i, time: G.time }) };
    G.p.rapier = G.e.rapier = RAPIERS.garnison; // mécanique de référence : rapières identiques
    T.ev = []; T.inputOn = false; G.p.x = 300; G.e.x = 300 + dist; G.p.slow = 1; G.e.slow = 1;
    for (const f of [G.p, G.e]) { const x = f.x; f.reset(x); } G.side = 1;
    T.stepN(2);
  },
  stepN(n) { for (let i = 0; i < n; i++) { G.hitStop = 0; G.slowT = 0; G.step(1 / 120); if (T.each) T.each(); } },
  stepUntil(cond, max = 600) { for (let i = 0; i < max; i++) { if (cond()) return i; T.stepN(1); } return -1; },
  types() { return T.ev.map(e => e.t); },
  // garde tenue depuis longtemps sur une ligne
  holdGuard(f, line) { f.intent.guard = true; f.intent.gline = line; T.stepN(60); },
};
// chiffre la manche simulée : IA contre IA
T.match = (lp, le, maxSec = 400) => {
  G.silent = true; G.level = le; G.startMatch(); G.p.look = LOOKS.duelliste; const pa = new AI(G.p, G.e, lp); G.state = 'fight'; G.banner = null;
  const orig = Input.apply; Input.apply = (f, dt) => pa.think(dt);
  let t = 0; while (G.state !== 'over' && t < maxSec) { G.hitStop = 0; G.slowT = 0; G.step(1 / 120); t += 1 / 120; if (G.state === 'round') { G.banner.t = 99; } }
  Input.apply = orig;
  return { wins: G.wins.slice(), over: G.state === 'over', t, ps: Object.assign({}, G.p.stats), es: Object.assign({}, G.e.stats) };
};
// stratégies dégénérées jouées « par le joueur »
T.bots = {
  marteleur: (f, dt) => { const it = f.intent; it.dx = f.dist() > 200 ? f.dir : 0; it.act = 'jab'; it.guard = false; },
  fentes: (f, dt) => { const it = f.intent; it.dx = f.dist() > 320 ? f.dir : 0; it.act = 'fente'; },
  tortue: (f, dt) => { const it = f.intent; it.dx = 0; it.guard = true; it.gline = 'ext'; },
  lourdes: (f, dt) => { const it = f.intent; it.dx = f.dist() > 300 ? f.dir : 0; it.act = 'heavy'; },
  gardeMartelee: (f, dt) => { const it = f.intent; it.dx = f.dist() > 230 ? f.dir : 0; it.guard = Math.floor(G.time * 8) % 2 === 0; if (Math.random() < .02) it.act = 'jab'; },
};
T.botMatch = (bot, le, maxSec = 400) => {
  G.silent = true; G.level = le; G.startMatch(); G.p.look = LOOKS.duelliste; G.state = 'fight'; G.banner = null;
  const orig = Input.apply; Input.apply = T.bots[bot];
  let t = 0; while (G.state !== 'over' && t < maxSec) { G.hitStop = 0; G.slowT = 0; G.step(1 / 120); t += 1 / 120; if (G.state === 'round') G.banner.t = 99; }
  Input.apply = orig; return { wins: G.wins.slice(), t };
};
// joueur « humain » simulé : il voit l'attaque adverse démarrer et appuie sur Garde après son temps de réaction
T.human = (level, reactMean = .24, sec = 60) => {
  G.silent = true; G.level = level; G.startMatch(); G.state = 'fight'; G.banner = null; G.mode = 'duel'; G.timer = 999;
  const out = { parry: 0, block: 0, hit: 0, other: 0, attacks: 0 }; const seen = new Set(); let pressAt = null, releaseAt = 0;
  const oe = G.event.bind(G); G.event = (t, i) => { if (i.d === G.p && i.a === G.e && i.m && i.m.kind !== 'riposte') { if (t === 'parry') out.parry++; else if (t === 'block') out.block++; else if (t === 'hit') out.hit++; else out.other++; } oe(t, i); };
  const orig = Input.apply;
  Input.apply = (f, dt) => { const e = G.e, it = f.intent, now = G.time; it.dx = 0; it.act = null;
    if (e.state === 'attack' && e.move.kind !== 'riposte' && e.move.kind !== 'pending' && !seen.has(e.move.id)) { seen.add(e.move.id); out.attacks++; pressAt = now + Math.max(.12, reactMean + (Math.random() - .5) * .1); }
    if (pressAt !== null && now >= pressAt) { it.guard = true; releaseAt = now + .45; pressAt = null; }
    if (it.guard && now > releaseAt) it.guard = false;
    G.p.hp = 100; G.e.hp = 100; };
  for (let i = 0; i < sec * 120; i++) { G.hitStop = 0; G.slowT = 0; G.step(1 / 120); }
  Input.apply = orig; G.event = oe; return out;
};
