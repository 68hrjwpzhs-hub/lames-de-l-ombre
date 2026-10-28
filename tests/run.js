// Nuit de Paris : une nuit complète jouée par l'IA, effets des avantages, notes
const { open } = require('./lib'); const fs = require('fs');
const results = []; const ok = (name, cond, detail) => { results.push({ name, pass: !!cond }); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open();
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const nights = await pg.evaluate(() => {
    const out = [];
    for (let n = 0; n < 8; n++) {
      G.silent = true; const e0 = Save.data.ecus; Run.showIntro(); Run.go();
      let pa = new AI(G.p, G.e, 'maitre'); G.p.slow = 1; const orig = Input.apply; Input.apply = (f, dt) => pa.think(dt);
      const log = []; let guard = 0, lastStage = -1;
      while (guard++ < 120 * 900) {
        G.hitStop = 0; G.slowT = 0; if (G.state === 'round') G.banner.t = 99;
        if (G.state === 'over') {
          const r = Run.cur; if (r.over) break;
          if (r.offer) { log.push({ stage: r.stage, hp: r.hp, offer: r.offer.slice(), grade: r.grades[r.grades.length - 1] }); Run.choose(r.offer[0]); }
          Run.go(); pa = new AI(G.p, G.e, 'maitre'); G.p.slow = Run.has('vive') ? .88 : 1;
          if (G.mode === 'run' && G.p.hp !== Run.cur.hp) log.push({ hpMismatch: [G.p.hp, Run.cur.hp] });
          continue;
        }
        G.step(1 / 120);
      }
      Input.apply = orig; const r = Run.cur;
      out.push({ won: r.won, stage: r.stage, boons: r.boons, grades: r.grades, total: r.total, ecusDelta: Save.data.ecus - e0, log: log.slice(0, 3), state: G.state, runVisible: !$('run').hidden });
    }
    return out;
  });
  console.log(JSON.stringify(nights.map(n => ({ won: n.won, stage: n.stage, boons: n.boons, grades: n.grades.join(''), total: n.total, d: n.ecusDelta }))));
  ok('chaque nuit se termine sur l\'écran de la nuit, écus crédités', nights.every(n => n.runVisible && n.total === n.ecusDelta && n.total >= 0), nights.map(n => [n.total, n.ecusDelta]));
  ok('la vie est reportée d\'un duel à l\'autre', nights.every(n => !n.log.some(l => l.hpMismatch)));
  ok('trois avantages proposés, distincts', nights.every(n => n.log.every(l => !l.offer || (l.offer.length === 3 && new Set(l.offer).size === 3))), nights[0].log);
  ok('une note par duel joué', nights.every(n => n.grades.length === Math.min(7, n.stage + (n.won ? 0 : 1))), nights.map(n => [n.grades.length, n.stage, n.won]));
  ok('l\'IA maître va au-delà du premier duel', nights.some(n => n.stage >= 2), nights.map(n => n.stage));
  const fx = await pg.evaluate(() => {
    const o = {}; G.silent = true;
    const setRun = boons => { Run.cur = { stage: 0, hp: 100, boons, ecus: 0, grades: [], tiers: RUN_TIERS.map(t => ({ foe: t.foes[0], venue: t.venues[0], boss: !!t.boss })), offer: null, over: false }; };
    setRun([]); T.setup(225); G.mode = 'run'; G.p.firstHit = true; G.p.intent.act = 'jab'; T.stepUntil(() => T.ev.length, 120); o.base = 100 - G.e.hp;
    setRun(['poigne']); T.setup(225); G.mode = 'run'; G.p.firstHit = true; G.p.intent.act = 'jab'; T.stepUntil(() => T.ev.length, 120); o.poigne = 100 - G.e.hp;
    setRun(['botte']); T.setup(225); G.mode = 'run'; G.p.firstHit = false; G.p.intent.act = 'jab'; T.stepUntil(() => T.ev.length, 120); o.botte = 100 - G.e.hp;
    setRun(['buffle']); T.setup(225); G.mode = 'run'; G.e.intent.act = 'jab'; T.stepUntil(() => T.ev.length, 120); o.buffle = 100 - G.p.hp;
    setRun([]); T.setup(225); G.mode = 'run'; G.e.intent.act = 'jab'; T.stepUntil(() => T.ev.length, 120); o.noBuffle = 100 - G.p.hp;
    setRun(['pied']); T.setup(300); G.mode = 'run'; const x0 = G.p.x; G.p.intent.dash = -1; T.stepN(60); o.dashPied = Math.round(x0 - G.p.x);
    setRun([]); T.setup(300); G.mode = 'run'; const x1 = G.p.x; G.p.intent.dash = -1; T.stepN(60); o.dash = Math.round(x1 - G.p.x);
    o.grades = [duelGrade({ perfect: 4, ripostes: 3, hits: 3 }, 0, true).g, duelGrade({ hits: 3 }, 60, true).g, duelGrade({ perfect: 9 }, 0, false).g];
    G.mode = 'duel'; return o;
  });
  console.log(JSON.stringify(fx));
  ok('Poigne de fer : +15 %', fx.poigne > fx.base, [fx.base, fx.poigne]);
  ok('Botte secrète : première touche doublée', fx.botte >= fx.base * 2 - 1, [fx.base, fx.botte]);
  ok('Cuir de buffle : moins de dégâts reçus', fx.buffle < fx.noBuffle, [fx.noBuffle, fx.buffle]);
  ok('Pied léger : retraite plus longue', fx.dashPied > fx.dash, [fx.dash, fx.dashPied]);
  ok('notes : S pour un duel brillant, C pour une défaite', fx.grades[0] === 'S' && fx.grades[2] === 'C', fx.grades);
  ok('aucune erreur JavaScript', errs.length === 0, errs);
  console.log(`\n${results.filter(r => r.pass).length}/${results.length} tests réussis`);
  await b.close();
})();
