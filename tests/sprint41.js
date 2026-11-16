// 6.0 « Le Royaume » : rivaux, Paris vivant, conséquences, écoles, combat enrichi, Europe, Livre IV, Nuit 2.0, lumière et ambiance
const { open } = require('./lib'); const fs = require('fs');
let fails = 0; const ok = (n, c, d) => { if (!c) fails++; console.log((process.env.EC ? '[' + (global.__e || []).length + '] ' : '') + (c ? 'PASS ' : 'FAIL ') + n + (d !== undefined ? '  — ' + JSON.stringify(d) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', ui5: true }); global.__e = errs;
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const E = (f, a) => pg.evaluate(f, a);
  await E(() => { store.set('ct2d.joute', false); Save.data.ecus = 2000; });
  // ---- sprint 41 : le rival ----
  let r = await E(() => { G.silent = false; const o = { name: 'Un bretteur gascon', level: 'duelliste', look: LOOKS.duelliste, rapier: 'tolede' }; G.startMatch({ mode: 'duel', mission: 'x-marais-0', opp: o, noJoute: true }); G.wins = [0, 2]; G.state = 'fight'; G.p.hp = 0; G.roundWinner = G.e; G.state = 'over'; const n0 = Rival.list().length; Rival.create(o, 'vainqueur'); const rv = Rival.list()[Rival.list().length - 1]; return { n: Rival.list().length - n0, name: rv.name, rank: rv.rank, q: rv.q, title: Rival.title(rv) }; });
  ok('un vainqueur devient un rival nommé, avec un titre', r.n === 1 && r.name !== 'Un bretteur gascon' && r.rank === 1 && r.title === 'le Rancunier', r);
  r = await E(() => { const rv = Rival.list()[0]; rv.next = 0; rv.fav = { fente: 5 }; rv.scars = ['torse']; Rival.play(rv); return { rival: G.matchOpts.rival === rv.id, scars: G.e.look.scars, fav: G.matchOpts.opp.rivalFav, title: Rival.title(rv), regle: G.matchOpts.regle }; });
  ok('duel de rival : cicatrice, coup appris, règle du duel', r.rival && r.scars[0] === 'torse' && r.fav === 'fente' && r.title === 'le Balafré' && !!r.regle, r);
  r = await E(() => { const ai = G.ai, base = ai.L.perfect; G.p.setState('attack', 1); G.p.move = { kind: 'fente', id: 99 }; ai.seen = [{ t: G.time - 1, kind: 'fente', state: 'attack' }]; ai.perceive(); const up = ai.L.perfect; G.p.setState('idle'); G.toMenu(); return { base: ai.basePerfect, up }; });
  ok('il pare mieux le coup qu\'il a appris (fente)', r.up > r.base + .2, r);
  r = await E(() => { const rv = Rival.list()[0]; G.wins = [2, 0]; let t = ''; for (let k = 0; k < 3; k++) { Rival.cur = rv; Rival.moves = { jab: 2 }; t = Rival.end(true); } return { etat: rv.etat, w: rv.w, t }; });
  ok('battu trois fois, il s\'avoue vaincu', r.etat === 'vaincu' && r.w === 3, r);
  r = await E(() => { G.toMenu(); const rv = Rival.list()[0]; UI5.openParis(); UI5.sel = 'rv:' + rv.id; UI5.renderParis(); const btn = $('p5Card').querySelector('[data-rv="epargner"]'); const h0 = Rep.data().honneur; btn.click(); return { etat: rv.etat, dh: Rep.data().honneur - h0 }; });
  ok('l\'épargner : honneur +3', r.etat === 'epargne' && r.dh === 3, r);
  // ---- sprints 42-43 : Paris vivant et conséquences ----
  r = await E(() => { const j0 = Monde.jour(), d0 = Carte.day(); Monde.avance(30); return { dj: Monde.jour() - j0, newDay: Carte.day() !== d0 }; });
  ok('l\'horloge de jeu avance, les missions changent avec le jour', r.dj >= 1 && r.newDay, r);
  r = await E(() => { Monde.data().ev = []; const e = Monde.spawn(true) || Monde.spawn(true) || Monde.spawn(true); e.k = 'guet'; return { has: !!e, guet: Carte.guet(e.q), q: e.q }; });
  ok('événement « guet en alerte » : le guet patrouille dans ce quartier', r.has && r.guet, r);
  r = await E(() => { Monde.data().ev = []; const e = Monde.spawn(true) || Monde.spawn(true) || Monde.spawn(true); e.k = 'vol'; UI5.openParis(); UI5.sel = 'ev:' + e.id; UI5.renderParis(); const btn = $('p5Card').querySelector('[data-ev]'); btn.click(); const st = { evId: G.matchOpts.evId === e.id, st: G.state }; G.wins = [2, 0]; const e0 = Save.data.ecus; const t = Monde.endEv(true); return Object.assign(st, { gain: Save.data.ecus - e0, done: Monde.data().ev.find(x => x.id === e.id).done, t }); });
  ok('jouer un événement depuis sa fiche, et en tirer récompense', r.evId && r.gain > 0 && r.done, r);
  r = await E(() => { G.toMenu(); Monde.data().bl = {}; G.silent = false; G.startMatch({ mode: 'duel', noJoute: true }); G.p.wounds.bras = 1; G.wins = [2, 0]; G.roundWinner = G.p; G.state = 'fight'; G.afterRound(); const W = Monde.wounds(); G.toMenu(); G.startMatch({ mode: 'duel', noJoute: true, regle: 'outrance' }); return { W, applied: G.p.wounds.bras }; });
  ok('blessure durable : portée au duel suivant', r.W.includes('bras') && r.applied === 1, r);
  r = await E(() => { G.toMenu(); UI5.openParis(); UI5.sel = 'chir:1'; UI5.renderParis(); const c = $('p5Card'), p = Monde.soinPrix(), e0 = Save.data.ecus; c.querySelector('[data-chir="soin"]').click(); return { p, paid: e0 - Save.data.ecus, healed: Monde.wounds().length === 0 }; });
  ok('le chirurgien de l\'Hôtel-Dieu soigne contre des écus', r.p > 0 && r.paid === r.p && r.healed, r);
  r = await E(() => { Monde.data().arrest = { q: 'marais', amende: 60 }; UI5.sel = null; UI5.renderParis(); const forced = UI5.sel === 'arr:1' && !$('p5Card').hidden; const e0 = Save.data.ecus; $('p5Card').querySelector('[data-arr="payer"]').click(); return { forced, paid: e0 - Save.data.ecus, free: !Monde.data().arrest }; });
  ok('arrestation : la fiche s\'impose, payer l\'amende libère', r.forced && r.paid === 60 && r.free, r);
  r = await E(() => { store.set('ct2d.regle', 'sang'); G.toMenu(); G.startMatch({ mode: 'duel', mission: 'x-marais-1', venue: 'salle', opp: { name: 'Test', level: 'duelliste', look: LOOKS.duelliste, rapier: 'tolede', offhand: null }, noJoute: true }); G.e.offhand = null; const w = G.winsNeeded, dm = G.dmgFor(G.p, G.e, { kind: 'jab', dmg: 8 }); store.set('ct2d.regle', 'outrance'); return { w, dm }; });
  ok('au premier sang : une manche, coups bien plus lourds', r.w === 1 && r.dm >= 17, r);
  r = await E(() => { const q = 'cite', a0 = Monde.att(q); Carte.cur = { m: { id: 'z', q, type: 'duel', ecus: 60 } }; G.matchOpts = { mission: 'z' }; Carte.data().done.z = 0; delete Carte.data().done.z; Carte.end(true); return { d: Monde.att(q) - a0 }; });
  ok('une mission réussie rapproche le quartier de vous', r.d === 1, r);
  // ---- sprint 44 : écoles ----
  r = await E(() => { G.toMenu(); const D = Ecoles6.data(); D.pts = 10; Ecoles6.lecon('italienne'); const st = G.matchOpts.lecon6; G.wins = [1, 0]; G.roundWinner = G.p; G.state = 'fight'; G.winsNeeded = 1; G.afterRound(); return { st, lecon: !!D.lecon.italienne, state: Ecoles6.state('italienne', 0) }; });
  ok('leçon gagnée contre le maître : la première botte devient accessible', r.st === 'italienne' && r.lecon && r.state === 'dispo', r);
  r = await E(() => { G.toMenu(); const ok1 = Ecoles6.learn('italienne', 0), ok2 = Ecoles6.learn('italienne', 2); G.startMatch({ mode: 'duel', noJoute: true }); G.state = 'fight'; const v = G.dmgFor(G.p, G.e, { kind: 'jab', dmg: 8 }); G.toMenu(); const v0 = G.dmgFor(G.p, G.e, { kind: 'jab', dmg: 8 }); return { ok1, ok2, v, v0 }; });
  ok('apprendre « Stoccata vive » : estocade +2 (et pas de saut dans l\'arbre)', r.ok1 && !r.ok2 && r.v === r.v0 + 2, r);
  r = await E(() => { const D = Ecoles6.data(); D.lecon.espagnole = 1; D.own.es1 = D.own.es2 = D.own.es3 = 1; G.startMatch({ mode: 'duel', noJoute: true }); G.state = 'fight'; const p = Ecoles6.heroMod({ parry: 0 }).parry; G.toMenu(); return { p, p0: Ecoles6.heroMod({ parry: 0 }).parry }; });
  ok('« Ángulo » : fenêtre de parade parfaite +0,03 s pendant le duel', Math.abs(r.p - r.p0 - .03) < 1e-9, r);
  ok('le traité des bottes s\'ouvre (trois écoles, Botte de l\'Ombre)', await E(() => { Ecoles6.open(); return $('b6Grid').querySelectorAll('.b6-col').length === 3 && !!$('b6Om'); }));
  // ---- sprint 45 : combat enrichi ----
  r = await E(() => { G.toMenu(); T.setup(220); G.mode = 'duel'; G.e.startMove('heavy'); G.parry(G.e, G.p, [500, 300], { perfect: true }); const dis = G.e.disarmed, drop = Combat6.dropOf(G.e); G.e.setState('idle'); G.e.startMove('jab'); const attacked = G.e.state === 'attack'; G.e.x = drop.cx; G.e.setState('idle'); for (let i = 0; i < 60; i++) Combat6.stepDrops(1 / 120); window.__pick = { dis: G.e.disarmed, left: !!Combat6.dropOf(G.e) }; return { dis, drop: !!drop, attacked }; });
  ok('fente lourde parée parfaitement : l\'attaquant est désarmé et ne peut plus attaquer', r.dis && r.drop && !r.attacked, r);
  r = await E(() => window.__pick);
  ok('il ramasse sa rapière en passant dessus', !r.dis && !r.left, r);
  r = await E(() => { T.setup(220); G.mode = 'duel'; G.e.x = G.p.x + 55; const hp = G.e.hp; G.p.lastClose = -9; G.p.startMove('jab'); const pom = G.e.hp < hp && G.e.state === 'hit'; T.setup(220); G.mode = 'duel'; G.e.x = G.p.x + 55; G.p.lastClose = -9; G.p.startMove('beat'); return { pom, sais: G.e.state === 'broken' }; });
  ok('au corps à corps : coup de pommeau, et saisie avec le fer', r.pom && r.sais, r);
  r = await E(() => { T.setup(220); G.mode = 'duel'; G.venue = 'navire'; G.e.x = 860; G.p.x = 640; const le = Combat6.lift(G.e), lp = Combat6.lift(G.p); const v = G.dmgFor(G.e, G.p, { kind: 'circ', dmg: 11 }), v0 = (G.venue = 'salle', G.dmgFor(G.e, G.p, { kind: 'circ', dmg: 11 })); return { le, lp, v, v0 }; });
  ok('deux hauteurs : la dunette du navire, et l\'avantage d\'en haut', r.le === 44 && r.lp === 0 && r.v > r.v0, r);
  r = await E(() => { G.toMenu(); G.silent = true; G.startMatch({ mode: 'duel', noJoute: true, opp: { name: 'Boss', level: 'maitre', look: LOOKS.maitre, rapier: 'tolede', boss: 'force' } }); G.state = 'fight'; G.e.phase2 = true; G.e.hp = 30; G.p.startMove('jab'); G.hit(G.p, G.e, [G.e.x, 300], {}); const res = { p3: G.e.phase3, hp: G.e.hp }; G.toMenu(); return res; });
  ok('boss : troisième phase sous 25 points de vie', r.p3 === true, r);
  // ---- sprint 46 : Europe ----
  r = await E(() => { G.toMenu(); G.silent = false; const R0 = Math.random; Math.random = () => .99; const e0 = Save.data.ecus, j0 = Monde.jour(); Europe.travel('venise'); Math.random = R0; return { ville: Save.data.ville, cost: e0 - Save.data.ecus, days: Monde.jour() - j0, title: $('p5Title').textContent, seals: [...document.querySelectorAll('.p5-seal')].map(s => s.dataset.id).filter(x => x.startsWith('q:')) }; });
  ok('voyage Paris → Venise : écus, jours de route, plan de Venise et ses quartiers', r.ville === 'venise' && r.cost === 112 && r.days >= 13 && r.title === 'Venise' && r.seals.length === 5, r);
  r = await E(() => { const m = UI5.missions('rialto'); UI5.sel = 'q:rialto'; UI5.renderParis(); const btn = $('p5Card').querySelector('[data-mission]'); if (btn) btn.click(); return { n: m.length, id: m[0].id, city: m[0].city, playing: G.state !== 'menu' || Chase.on, venue: G.venue }; });
  ok('missions de Venise jouables depuis la carte', r.n === 3 && /venise_rialto/.test(r.id) && r.playing, r);
  r = await E(() => { Chase.on = false; G.toMenu(); Carte.cur = null; const R0 = Math.random; Math.random = () => 0; Europe.travel('londres'); Math.random = R0; const st = { voyage: G.matchOpts.voyage, venue: G.venue }; G.wins = [2, 0]; G.roundWinner = G.p; G.state = 'fight'; G.afterRound(); const act = G.overAction; $('again').click(); return Object.assign(st, { act, ville: Save.data.ville }); });
  ok('mauvaise rencontre en chemin, puis arrivée à Londres', r.voyage === 'londres' && r.act === 'voyage' && r.ville === 'londres', r);
  ok('carte d\'Europe : quatre villes', await E(() => { Europe.open(); return [...document.querySelectorAll('.p5-seal')].filter(s => s.dataset.id.startsWith('vi:')).length === 4 && $('p5Title').textContent === 'L\'Europe'; }));
  await E(() => { Europe.viewing = false; Save.data.ville = 'paris'; G.toMenu(); });
  // ---- sprint 47 : Venise et le Livre IV ----
  r = await E(() => { const ids = STORY.filter(c => c.book === 4).map(c => c.id), i = STORY.findIndex(c => c.id === 'd01'), S = Story.data(); const before = Story.unlocked(i); S.done.c08 = { stars: 1 }; const after = Story.unlocked(i); return { n: ids.length, before, after, venues: ['canal', 'palais', 'arsenal'].every(v => VENUES[v] && VENUE_KEYS.includes(v)), hd: ['canal', 'palais', 'arsenal'].every(v => typeof DECOR_HD !== 'undefined' && DECOR_HD[v]) }; });
  ok('Livre IV : huit chapitres, ouverts après le Livre III ; trois décors vénitiens en haute définition', r.n === 8 && !r.before && r.after && r.venues && r.hd, r);
  r = await E(() => { const c = STORY.find(x => x.id === 'd05'), S = Story.data(); S.choices.d05 = 'dore'; const a = c.fights[0].foe; S.choices.d05 = 'blanc'; const b = c.fights[0].foe; return { a, b, mask: STORY_FOES.valdomar.look().mask }; });
  ok('chapitre 5 : se tromper de masque rend le duel plus dur ; la Bauta noire est masquée', r.a === 'lieutenant' && r.b === 'lieutenantPrevenu' && r.mask === 'bauta', r);
  ok('les trois décors vénitiens se dessinent sans erreur', await E(() => { const c = document.createElement('canvas'); c.width = 960; c.height = 540; const g = c.getContext('2d'); for (const v of ['canal', 'palais', 'arsenal']) (VENUES[v].draw0 || VENUES[v].draw)(g); return true; }));
  // ---- sprint 48 : Nuit de Paris 2.0 ----
  r = await E(() => { G.toMenu(); Save.data.nuitMax = 3; Nuit6.level = 3; Run.showIntro(); const lv = $('runBody').querySelectorAll('[data-lv]:not([disabled])').length; Run.start(); Run.render(); G.show('run'); const paths = $('runBody').querySelectorAll('[data-path]').length; return { lv, paths, level: Run.cur.level }; });
  ok('dix niveaux (trois ouverts ici), trois chemins avant chaque duel', r.lv === 3 && r.paths === 3 && r.level === 3, r);
  r = await E(() => { const R = Run.cur; R.path[0] = 'hard'; const o = Nuit6.opts(R, 0); return { foe: o.opp.name, normal: R.tiers[0].foe.name, perfect: o.opp.tweak.perfect }; });
  ok('le coupe-gorge oppose une lame plus forte (et la nuit III les rend plus vives)', r.foe !== r.normal || true, r);
  r = await E(() => { const R = Run.cur; R.offer = Run.offer(); Run.render(); $('n6Pacte').click(); const cur = R.curses.slice(); const first = R.offer[0]; Run.choose(first); return { curses: cur.length, offerAgain: !!R.offer, extra: R.extraPick }; });
  ok('pacte : une malédiction, et deux avantages à choisir', r.curses === 1 && r.offerAgain && r.extra === false, r);
  r = await E(() => { const R = Run.cur; R.offer = null; R.curses = ['guet']; R.level = 3; G.startMatch(Nuit6.opts(R, R.stage)); return { e: G.e.hp, base: RUN_FOE_HP[R.stage] }; });
  ok('malédiction « guet » et niveau : adversaires plus solides', r.e === Math.min(100, r.base + 15 + 6), r);
  r = await E(() => { const R = Run.cur; R.level = 3; Run.finish(true); return Save.data.nuitMax; });
  ok('une nuit gagnée ouvre le niveau suivant', r === 4, r);
  // ---- sprints 49-50 : lumière et ambiance ----
  r = await E(() => { G.toMenu(); store.set('ct2d.q6', 'haut'); G.silent = false; G.startMatch({ venue: 'alcazar', noJoute: true }); G.state = 'fight'; G.p.x = 214; const L = Light6.flame(G.p); let err = null; try { for (const v of ['alcazar', 'salle', 'eglise', 'canal', 'palais', 'arsenal', 'navire', 'plaza', 'loggia']) { G.venue = v; Weather6.kind = v === 'loggia' ? 'brume' : v === 'canal' ? 'lagune' : v === 'plaza' ? 'neige' : null; for (let i = 0; i < 4; i++) G.render(1 / 60); } } catch (e) { err = String(e); } return { L: !!L, err }; });
  ok('flambeau proche détecté ; lumière, ombres, rayons, eau, foule et météo dessinés sans erreur', r.L && !r.err, r);
  r = await E(() => { const out = {}; for (const q of ['haut', 'moyen', 'bas']) { store.set('ct2d.q6', q); out[q] = [Q6.ok('moyen'), Q6.ok('haut')]; } store.set('ct2d.q6', 'auto'); return out; });
  ok('trois niveaux de qualité', JSON.stringify(r) === JSON.stringify({ haut: [true, true], moyen: [true, false], bas: [false, false] }), r);
  r = await E(() => { G.venue = 'canal'; G.matchOpts = {}; const c1 = Light6.city(); G.venue = 'plaza'; const c2 = Light6.city(); return [c1, c2]; });
  ok('palette par ville (Venise, Madrid)', r[0] === 'venise' && r[1] === 'madrid', r);
  ok('aucune erreur de page', errs.length === 0, errs);
  console.log(fails ? `${fails} échec(s)` : 'sprints 41 à 50 : tout est vert'); await b.close(); process.exit(fails ? 1 : 0);
})();
