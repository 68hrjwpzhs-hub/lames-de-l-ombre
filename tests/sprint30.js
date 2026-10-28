// 3.0 · sprint 30 : Livre III « Le Cercle de Madrid »
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(600);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => {
    const o = {}; G.frame = () => {};
    const B = STORY.filter(c => c.book === 3); o.n = B.length; o.acts = [...new Set(B.map(c => c.act))].length;
    o.venues = ['plaza', 'academia', 'alcazar'].map(k => ({ k, ok: VENUE_KEYS.includes(k) && !!LIGHTING[k] && !!GL_GRADE[k] && !!DECOR_HD[k] }));
    const S = Story.data(); S.done = {}; const i1 = STORY.findIndex(c => c.id === 'c01');
    S.done.ch10 = { stars: 1 }; o.lock0 = Story.unlocked(i1); S.done.b08 = { stars: 1 }; o.lock1 = Story.unlocked(i1) && !Story.unlocked(i1 + 1); S.done.c01 = { stars: 1 }; o.lock2 = Story.unlocked(i1 + 1);
    const c8 = STORY.find(c => c.id === 'c08'), txt = () => Story.filt(c8.outro).map(l => l.txt).join(' ') + Story.filt(c8.intro).map(l => l.txt).join(' ');
    S.choices.c02 = 'accepter'; S.choices.ch10 = 'rendre'; const a = txt(); S.choices.c02 = 'refuser'; S.choices.ch10 = 'bruler'; const bb = txt();
    o.endA = /lentement/.test(a) && /Cardinal reçoit/.test(a) && /accepté mon aide/.test(a); o.endB = /retrouvent leurs élèves|reviennent dès le lendemain/.test(bb) && /repassent les Pyrénées/.test(bb) && /refusé mon aide/.test(bb);
    const c6 = STORY.find(c => c.id === 'c06'); o.hp6 = [c6.startHp({ choices: { c02: 'accepter' } }), c6.startHp({ choices: { c02: 'refuser' } })];
    o.scenes = [];
    for (const c of B) { const i = STORY.indexOf(c); Story.play(i); Story.next(); let bub = 0, n = 0;
      while (G.state === 'scene' && n++ < 40) { if (Cine.bubble) bub++; for (let k = 0; k < 30; k++) G.step(1 / 120); Story.next(); if (!Cine.revealed()) Story.next(); if (document.querySelector('#sceneChoices button')) break; }
      o.scenes.push({ id: c.id, bub, st: G.state, venue: G.venue === (c.fights[0].venue || c.venue), boss: G.matchOpts && G.matchOpts.opp && G.matchOpts.opp.boss, offh: G.e.offhand }); Cine.end(); Story.cur = null; G.state = 'menu'; }
    G.state = 'menu'; Story.showList(); o.list = $('storyList').querySelectorAll('button.chap').length; o.heads = [...$('storyList').querySelectorAll('.eyebrow')].filter(h => /Livre III/.test(h.textContent)).length;
    o.codex = ['plazamayor', 'alcazar', 'narvaez', 'cercledefer'].every(id => CODEX.some(e => e.id === id));
    o.match = T.match('maitre', 'maitre', 300).over;
    return o;
  });
  console.log(JSON.stringify(r));
  ok('8 chapitres en 2 actes', r.n === 8 && r.acts === 2);
  ok('3 décors de Madrid : lumière, étalonnage, version haute définition', r.venues.every(v => v.ok), r.venues);
  ok('le Livre III s\'ouvre après le Livre II, chapitre après chapitre', !r.lock0 && r.lock1 && r.lock2);
  ok('fins selon la Tisserande (aide acceptée ou refusée) et le Registre', r.endA && r.endB);
  ok('l\'aide de la Tisserande change le départ des jardins', r.hp6[0] === 100 && r.hp6[1] === 85, r.hp6);
  ok('les 8 chapitres ont leur mise en scène et mènent au duel', r.scenes.every(s => s.bub > 0 && (s.st === 'round' || s.st === 'fight') && s.venue), r.scenes.map(s => s.id + ':' + s.bub + ':' + s.st));
  ok('boss : doña Elvira, le Maestre, la Tisserande (deuxième souffle et main gauche)', ['c05', 'c07', 'c08'].every(id => r.scenes.find(s => s.id === id).boss) && r.scenes.find(s => s.id === 'c08').offh === 'dague');
  ok('liste : 32 chapitres, actes du Livre III', r.list === 32 && r.heads === 2, { l: r.list, h: r.heads });
  ok('carnet du Livre III ; duel IA complet', r.codex && r.match);
  console.log(errs.length ? 'ERREURS ' + JSON.stringify(errs.slice(0, 3)) : 'aucune erreur'); ok('aucune erreur JavaScript', errs.length === 0);
  console.log(`${res.filter(Boolean).length}/${res.length} tests réussis`); await b.close();
})();
