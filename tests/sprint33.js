// 4.0 : décors utilisables, panache, mêlée, alliés, joute, réputation, carte, poursuite, armurier, succès, NG+, photo, emplacements, son
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', joute: true });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(async () => {
    const o = {}; G.frame = () => {}; const wait = ms => new Promise(r => setTimeout(r, ms));
    // --- panache ---
    G.venuePref = 'salle'; T.setup(240); Panache.reset(true); G.event('parry', { a: G.e, d: G.p }); o.pan1 = Panache.v[0];
    for (let i = 0; i < 10; i++) G.event('parry', { a: G.e, d: G.p }); o.ready = Panache.ready[0]; o.bonus = G.dmgFor(G.p, G.e, { kind: 'jab', dmg: 8 }) - 8; o.after = [Panache.ready[0], Panache.v[0]];
    Panache.v[0] = 50; G.p.startMove('jab'); G.onWhiff(G.p); o.whiff = Panache.v[0];
    // --- décors : tabouret, lustre, table ---
    T.setup(240); Props.setup('salle'); o.props = Props.list.map(p => p.k).join(',');
    G.p.x = 175; G.e.x = 175 + 200; G.p.state = 'idle'; o.near = Props.near(G.p) && Props.near(G.p).k; T.inputOn = true; Input.keys.add('ArrowUp'); Input.pressed.feint = true; T.stepN(1); Input.keys.delete('ArrowUp'); T.inputOn = false;
    o.shot = Props.shots.length; let hitSt = null; for (let i = 0; i < 120 && !hitSt; i++) { T.stepN(1); if (G.e.state === 'hit') hitSt = G.e.state; } o.tabouret = hitSt;
    T.setup(240); Props.setup('salle'); const L = Props.list.find(p => p.k === 'lustre'); G.e.x = L.x + 10; G.p.x = L.x - 150; Props.use(G.p, L); let st2 = null; for (let i = 0; i < 200 && !st2; i++) { T.stepN(1); if (G.e.state === 'hit') st2 = G.e.state; } o.lustre = [st2, L.fallen];
    T.setup(240); Props.setup('salle'); const Tb = Props.list.find(p => p.k === 'table'); G.p.x = Tb.x; G.e.x = Tb.x - 220; T.holdGuard(G.e, 'ext'); G.p.x = Tb.x; Props.use(G.p, Tb); o.elan = !!G.p.elan; T.ev = []; G.p.startMove('jab'); T.stepUntil(() => T.types().length, 200); o.table = T.types()[0];
    // --- mêlée ---
    G.silent = true; G.level = 'duelliste'; Melee.start(Melee.gardes(3), { mode: 'duel' }); o.wait = Melee.wait.length; G.state = 'fight'; G.banner = null; G.ai = { think() {}, onEvent() {} }; G.p.hp = 70;
    G.wins = [0, 0]; G.roundWinner = G.p; G.state = 'ko'; G.afterRound(); o.next = { n: Melee.n, wait: Melee.wait.length, hp: G.p.hp, name: G.e.look.name };
    G.state = 'fight'; G.banner = null; G.ai = { think() {}, onEvent() {} }; const wf = Melee.wait[0]; wf.cool = 0; G.p.x = wf.x + (wf.x < 480 ? 60 : -60); G.p.guarding = false; const hp0 = G.p.hp; G.silent = false; G.e.x = 480; for (let i = 0; i < 120; i++) { G.hitStop = 0; G.slowT = 0; G.step(1 / 120); G.p.x = wf.x + (wf.x < 480 ? 60 : -60); } G.silent = true; o.revers = hp0 - G.p.hp;
    // --- alliés ---
    Save.data.allie = 'valet'; G.silent = false; T.setup(240); G.mode = 'duel'; G.silent = false; Allies.used = false; G.p.hp = 40; for (let i = 0; i < 120; i++) { G.hitStop = 0; Allies.step(1 / 120); } o.valet = [Allies.used, G.e.state];
    Save.data.allie = 'compagne'; T.setup(240); G.mode = 'duel'; G.silent = false; Allies.used = false; G.e.startMove('fente'); const hpc = G.p.hp; G.hit(G.e, G.p, [G.p.x, 300], { a: G.e, d: G.p, m: G.e.move }); o.compagne = [G.p.hp === hpc, G.e.state]; Save.data.allie = null; G.silent = true;
    // --- joute verbale ---
    store.set('ct2d.joute', true); G.silent = false; G.level = 'duelliste'; G.startMatch({}); o.jouteShown = !$('joute').hidden; for (let k = 0; k < 3; k++) { $('jouteOpts').querySelector('[data-k="good"]').click(); await wait(950); }
    o.jouteRes = Joute.last; o.matchAfter = G.state; G.state = 'round'; G.banner.t = 99; G.step(1 / 120); o.jouteEffect = +G.e.breath.toFixed(2); G.silent = true; store.set('ct2d.joute', false);
    // --- réputation ---
    Save.data.rep = null; Rep.add({ crainte: 70 }); o.rep = [Rep.data().crainte, Rep.title()]; T.setup(240); G.mode = 'duel'; G.state = 'round'; G.banner = { t: 99, dur: 1 }; G.e.breath = 1; G.step(1 / 120); o.crainteEffect = +G.e.breath.toFixed(2); Save.data.rep = null;
    // --- carte : quartiers, missions, mission accomplie, infiltration, allié ---
    Save.data.ecus = 1000; Carte.open('marais'); o.pins = $('crPins').childElementCount; const m1 = JSON.stringify(Carte.missions('marais', '2026-11-01')), m2 = JSON.stringify(Carte.missions('marais', '2026-11-01')); o.stable = m1 === m2; o.rumeur = Carte.rumeur('cite').length > 10;
    const M = { id: 'test-duel', q: 'marais', type: 'duel', level: 'duelliste', foe: 'Un bretteur gascon', venue: 'salle', ecus: 60 }; G.silent = true; Carte.play(M); o.mission = G.matchOpts.mission; G.wins = [1, 0]; G.roundWinner = G.p; G.state = 'ko'; const ec = Save.data.ecus; G.afterRound(); o.done = { ecus: Save.data.ecus - ec, done: !!Carte.data().done['test-duel'], again: $('again').textContent, txt: $('overReward').textContent.slice(0, 40) };
    const MI = { id: 'test-inf', q: 'louvre', type: 'infiltration', level: 'duelliste', foe: 'Un garde', venue: 'cloitre', need: 'garde', ecus: 90 }; Carte.play(MI, 'garde'); G.state = 'round'; G.banner.t = 99; G.step(1 / 120); o.infil = [G.e.state, G.e.hp, G.p.look.coat];
    Carte.open(); const hb = $('crAllies').querySelector('[data-ally="valet"]'); const e0 = Save.data.ecus; hb.click(); o.hire = [Save.data.allie, e0 - Save.data.ecus]; Save.data.allie = null;
    // --- poursuite : le joueur saute les cheminées et les trous, se baisse sous le linge ---
    let won = false; G.silent = true; Chase.start({ id: 'chase-test' }, () => { won = true; }, () => 'perdu');
    for (let i = 0; i < 120 * 30 && Chase.on; i++) { const next = Chase.obs.find(o2 => !o2.done && o2.x - Chase.scroll < 340 && o2.x - Chase.scroll > 260); Input.keys.delete('ArrowUp'); Input.keys.delete('ArrowDown'); if (next) Input.keys.add(next.k === 'linge' ? 'ArrowDown' : 'ArrowUp'); G.step(1 / 120); }
    Input.keys.clear(); o.chase = { won, hits: Chase.hits };
    Chase.start({ id: 'chase-test2' }, () => { }, () => 'perdu'); Chase.speed = 200; for (let i = 0; i < 120 * 30 && Chase.on; i++) G.step(1 / 120); o.chaseLose = $('verdict').textContent;
    // --- armurier ---
    Save.data.ecus = 1000; Save.data.equipped = 'heros'; Save.data.forge = {}; Forge.open(); $('fgList').querySelector('[data-up="trempe"]').click(); $('fgList').querySelector('[data-up="garde"]').click(); const F = Forge.of('heros'); o.forge = [F.trempe, F.garde];
    G.silent = true; G.level = 'duelliste'; G.startMatch({ noJoute: true }); o.rapier = [+(G.p.rapier.power / (RAPIERS.heros.power || 1)).toFixed(2), +(G.p.rapier.guard - (RAPIERS.heros.guard || 0)).toFixed(3)];
    // --- succès ---
    o.achTotal = ACH.length; Ach.open(); o.achScreen = $('acList').childElementCount; o.achGot = Ach.count();
    // --- nouvelle partie + ---
    const S = Story.data(); S.done.c08 = { stars: 3 }; Story.showList(); o.ngpBtn = !!$('ngpBtn'); $('ngpBtn').click(); o.ngp = [Save.data.ngp, Object.keys(Story.data().done).length];
    // --- mode photo ---
    T.setup(240); G.state = 'fight'; G.pause(); Photo.start(); o.photoOn = !$('photo').hidden && document.body.classList.contains('photo'); Photo.cam.s = 2; Photo.filter = 'gravure'; Photo.draw(); const shot = Photo.shot(); o.pshot = [shot.width > 100, shot.getContext('2d').getImageData(shot.width / 2, shot.height / 2, 1, 1).data[3]]; Photo.stop(); o.photoOff = $('photo').hidden; G.resume();
    // --- emplacements et son ---
    o.slots = $('slotBtns').childElementCount; o.rooms = ['auberge', 'navire', 'plaza', 'alcazar'].every(k => Aud.ROOMS[k]); Snd.init(); G.silent = false; AudioV4.effort(G.p); Snd.clang(true); G.silent = true;
    return o;
  });
  console.log(JSON.stringify(r));
  ok('panache : parade +12, jauge pleine → botte (+10) puis remise à zéro ; manquer coûte', r.pan1 === 12 && r.ready && r.bonus >= 10 && r.after[0] === false && r.after[1] === 0 && r.whiff === 45, { b: r.bonus, a: r.after, w: r.whiff });
  ok('décors : objets du lieu, ↑ + Feinte près du tabouret le lance et il frappe', r.props === 'tabouret,lustre,table' && r.near === 'tabouret' && r.shot === 1 && r.tabouret === 'hit', r);
  ok('décors : le lustre tombe sur l\'adversaire ; la table donne une attaque plongeante qui brise la garde', r.lustre[0] === 'hit' && r.lustre[1] && r.elan && r.table === 'break', { l: r.lustre, t: r.table });
  ok('mêlée : deux adversaires attendent, le suivant entre en gardant votre vie', r.wait === 2 && r.next.n === 2 && r.next.wait === 1 && r.next.hp >= 70 && r.next.hp <= 82, r.next);
  ok('mêlée : rester collé à un adversaire en attente coûte une touche (prévenue par « ! »)', r.revers === 6, r.revers);
  ok('alliés : le valet lance la cruche, la compagne pare une fente', r.valet[0] && r.valet[1] === 'hit' && r.compagne[0] && r.compagne[1] === 'parried', { v: r.valet, c: r.compagne });
  ok('joute verbale : écran avant le duel, 3 bonnes reparties → gagnée → adversaire troublé', r.jouteShown && r.jouteRes === 'gagnee' && r.matchAfter === 'round' && r.jouteEffect <= .55, { s: r.jouteShown, res: r.jouteRes, e: r.jouteEffect });
  ok('réputation : crainte, titre, adversaire intimidé au début', r.rep[0] === 80 && /redouté/.test(r.rep[1]) && r.crainteEffect < 1, { rep: r.rep, e: r.crainteEffect });
  ok('carte : 6 quartiers, missions du jour stables, rumeurs', r.pins === 6 && r.stable && r.rumeur);
  ok('mission accomplie : écus, réputation, retour à la carte', r.mission === 'test-duel' && r.done.ecus >= 60 && r.done.done && r.done.again === 'Carte de Paris', r.done);
  ok('infiltration : bon déguisement → l\'adversaire est surpris', r.infil[0] === 'hit' && r.infil[1] === 85 && r.infil[2] === '#8a1a1e', r.infil);
  ok('taverne : engager un allié', r.hire[0] === 'valet' && r.hire[1] === 120, r.hire);
  ok('poursuite : en sautant et en se baissant, on rattrape le fuyard ; trop lent, il s\'échappe', r.chase.won && r.chase.hits === 0 && /échappe/.test(r.chaseLose), { c: r.chase, l: r.chaseLose });
  ok('armurier : trempe et garde améliorées, appliquées en duel', r.forge[0] === 1 && r.forge[1] === 1 && r.rapier[0] === 1.04 && r.rapier[1] === .01, { f: r.forge, r: r.rapier });
  ok('succès : 30 exploits, écran, plusieurs déjà gagnés', r.achTotal === 30 && r.achScreen === 30 && r.achGot >= 10, r.achGot);
  ok('nouvelle partie + : proposée après le Livre III, histoire remise à zéro', r.ngpBtn && r.ngp[0] === 1 && r.ngp[1] === 0, r.ngp);
  ok('mode photo : cadrage, filtre, image sans HUD, retour à la pause', r.photoOn && r.pshot[0] && r.pshot[1] === 255 && r.photoOff);
  ok('3 emplacements de sauvegarde ; salles sonores des nouveaux lieux ; souffles', r.slots === 3 && r.rooms);
  console.log(errs.length ? 'ERREURS ' + JSON.stringify(errs.slice(0, 3)) : 'aucune erreur'); ok('aucune erreur JavaScript', errs.length === 0);
  // emplacement 2 : partie vierge, puis retour à la 1
  await pg.evaluate(() => { Save.data.ecus = 777; Save.persist(); Slots.use(2); }); await pg.waitForTimeout(1500); await pg.waitForFunction(() => typeof Slots !== 'undefined', null, { timeout: 20000 });
  const s2 = await pg.evaluate(() => ({ cur: Slots.cur(), ecus: Save.data.ecus })); await pg.evaluate(() => Slots.use(1)); await pg.waitForTimeout(1500); await pg.waitForFunction(() => typeof Slots !== 'undefined', null, { timeout: 20000 });
  const s1 = await pg.evaluate(() => ({ cur: Slots.cur(), ecus: Save.data.ecus }));
  ok('emplacements : partie 2 vierge, retour à la partie 1 intacte', s2.cur === 2 && s2.ecus === 60 && s1.cur === 1 && s1.ecus === 777, { s2, s1 });
  console.log(`${res.filter(Boolean).length}/${res.length} tests réussis`); await b.close();
})();
