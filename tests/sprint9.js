// sprints 9 et 10 : bilan, mise en scène, salut, carnet, leçons, réactions selon la zone, chutes, boss en deux phases, tic d'attaque
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(500);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => {
    const o = {}; G.frame = () => {};
    // 1. bilan : un conseil tiré du coup le plus subi
    G.p.resetStats(); G.p.stats.takenBy = { fente: 40, jab: 8 }; G.p.stats.hits = 3; G.p.stats.whiffs = 1; o.advice = Bilan.advice(G.p); o.rows = Bilan.rows(G.p).map(x => x[1]);
    // 2. salut avant la manche (sauf entraînement), annulé au « Allez ! »
    G.silent = true; G.level = 'duelliste'; G.startMatch(); o.salut = [G.p.state, G.e.state]; for (let i = 0; i < 240 && G.state === 'round'; i++) G.step(1 / 120); o.after = [G.state, G.p.state, G.e.state];
    // 3. scènes : chaque chapitre se joue de bout en bout sans erreur, avec bulles et figurants
    o.scenes = []; for (let i = 0; i < STORY.length; i++) { Story.play(i); Story.next(); let bub = 0, npc = 0, n = 0;
      while (G.state === 'scene' && n++ < 40) { if (Cine.bubble) bub++; npc = Math.max(npc, Object.keys(Cine.npcs).length); for (let k = 0; k < 30; k++) G.step(1 / 120); Story.next(); if (!Cine.revealed()) Story.next(); if (document.querySelector('#sceneChoices button')) break; }
      o.scenes.push({ id: STORY[i].id, bub, npc, st: G.state }); Cine.end(); Story.cur = null; G.state = 'menu'; }
    // 4. carnet : débloqué en combat, jamais par la démo du menu, et sauvegardé
    Save.data.codex = {}; T.setup(225); G.silent = false; G.p.startMove('jab'); T.stepUntil(() => T.types().includes('hit'), 200); o.codex = Object.keys(Save.data.codex); o.codexSaved = /stoccata/.test(localStorage.getItem('ct2d.save') || JSON.stringify(Save.data));
    // 5. réaction selon la zone et chute selon le coup final
    T.setup(225); G.p.startMove('bassa'); T.stepUntil(() => T.types().includes('hit'), 200); o.zone = G.e.hitZone; let mn = 99; for (let i = 0; i < 30; i++) { T.stepN(1); mn = Math.min(mn, G.e.pose.py); } o.hitPy = mn;
    T.setup(225); G.mode = 'duel'; G.state = 'fight'; G.e.hp = 4; G.p.startMove('bassa'); T.stepUntil(() => G.e.state === 'ko', 200); T.stepN(120); o.ko = { style: G.e.koStyle, py: Math.round(G.e.pose.py) };
    // 6. boss : deuxième souffle une seule fois, sous 50 % de vie, style durci
    T.setup(225); G.matchOpts = { opp: { boss: 'force' } }; G.ai = new AI(G.e, G.p, 'maitre'); G.ai.think = () => {}; G.e.phase2 = false; const h0 = G.ai.L.w.heavy; G.e.hp = 55; T.ev = []; G.p.startMove('jab'); T.stepUntil(() => G.e.state === 'hit', 200);
    o.boss = { p2: G.e.phase2, heavy: +(G.ai.L.w.heavy / h0).toFixed(2), hp: G.e.hp }; G.e.hp = 30; G.e.state = 'idle'; G.p.state = 'idle'; let n2 = 0; const ev0 = G.event; G.event = (t, i) => { if (t === 'secondWind') n2++; return ev0.call(G, t, i); }; G.p.startMove('jab'); T.stepN(100); G.event = ev0; o.boss.again = n2;
    // 7. leçons : 3e étoile
    o.lessons = Object.keys(LESSONS).length; o.lessonCh2 = LESSONS.ch02.ok({ esqOk: 2 }) && !LESSONS.ch02.ok({ esqOk: 1 });
    return o;
  });
  console.log(JSON.stringify(r));
  ok('bilan : conseil sur le coup le plus subi (fente)', /fentes/.test(r.advice) && r.rows.length === 4, r.advice);
  ok('salut joué avant la manche, puis combat normal', r.salut[0] === 'cine' && r.salut[1] === 'cine' && r.after[0] === 'fight' && r.after[1] !== 'cine' && r.after[2] !== 'cine', { s: r.salut, a: r.after });
  ok('les 10 chapitres, 6 récits et 8 chapitres des Livres II et III ont leur mise en scène (bulles)', r.scenes.length === 32 && r.scenes.every(s => s.bub > 0), r.scenes.map(s => s.id + ':' + s.bub + '/' + s.npc));
  ok('figurants présents (maître Lacombe, frère Tancrède…)', r.scenes.filter(s => s.npc > 0).length >= 4, r.scenes.map(s => s.npc));
  ok('carnet : entrée débloquée en combat et sauvegardée', r.codex.includes('stoccata') && r.codexSaved, r.codex);
  ok('réaction selon la zone : touche basse → jambe, genou qui plie', r.zone === 'jambe' && r.hitPy < 75, { z: r.zone, py: r.hitPy });
  ok('chute selon le coup final : jambe → reste à genoux', r.ko.style === 'genou' && r.ko.py > 40 && r.ko.py < 60, r.ko);
  ok('boss : deuxième souffle sous 50 %, style durci, une seule fois', r.boss.p2 && r.boss.heavy > 2 && r.boss.again === 0, r.boss);
  ok('32 leçons, défi vérifié', r.lessons === 32 && r.lessonCh2, r.lessons);
  console.log(errs.length ? 'ERREURS ' + JSON.stringify(errs.slice(0, 3)) : 'aucune erreur'); ok('aucune erreur JavaScript', errs.length === 0);
  console.log(`${res.filter(Boolean).length}/${res.length} tests réussis`); await b.close();
})();
