// 2.0 · sprint 20 : Livre II (8 chapitres, 3 décors, 2 boss, fins selon les choix)
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(600);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => {
    const o = {}; G.frame = () => {};
    const B = STORY.filter(c => c.book === 2); o.n = B.length; o.acts = [...new Set(B.map(c => c.act))].length;
    // décors : peints sans erreur, non vides, dans la liste des décors
    o.venues = ['auberge', 'navire', 'bastion'].map(k => { const c = document.createElement('canvas'); c.width = W; c.height = H; VENUES[k].draw(c.getContext('2d')); const d = c.getContext('2d').getImageData(0, 0, W, H).data; let s = 0; for (let i = 0; i < d.length; i += 4000) s += d[i] + d[i + 1] + d[i + 2]; return { k, s, inKeys: VENUE_KEYS.includes(k), light: !!LIGHTING[k] }; });
    o.venueBtns = [...document.querySelectorAll('#venues button')].map(b => b.dataset.v).filter(v => ['auberge', 'navire', 'bastion'].includes(v)).length;
    // verrouillage : le Livre II s'ouvre après Notre-Dame, puis chapitre par chapitre
    const S = Story.data(); S.done = {}; const i1 = STORY.findIndex(c => c.id === 'b01'), i2 = i1 + 1;
    o.lock0 = Story.unlocked(i1); S.done.ch10 = { stars: 1 }; o.lock1 = Story.unlocked(i1) && !Story.unlocked(i2); S.done.b01 = { stars: 2 }; o.lock2 = Story.unlocked(i2);
    // les fins dépendent du choix de Notre-Dame et de la Saunière
    const c8 = STORY.find(c => c.id === 'b08'); S.choices.ch10 = 'rendre'; S.choices.b03 = 'livrer'; const fr = Story.filt(c8.outro).map(l => l.txt).join(' '); S.choices.ch10 = 'bruler'; S.choices.b03 = 'marchander'; const fb = Story.filt(c8.outro).map(l => l.txt).join(' ');
    o.endR = /faveur/.test(fr) && !/libres pour de bon/.test(fr) && !/Saunière|sel sera pour moi/.test(fr); o.endB = /libres pour de bon/.test(fb) && /sel sera pour moi/.test(fb);
    const c7 = STORY.find(c => c.id === 'b07'); o.hp7 = [c7.startHp({ choices: { b03: 'marchander' } }), c7.startHp({ choices: { b03: 'livrer' } })];
    // chaque chapitre se joue en scène de bout en bout, avec bulles
    o.scenes = [];
    for (const c of B) { const i = STORY.indexOf(c); Story.play(i); Story.next(); let bub = 0, n = 0;
      while (G.state === 'scene' && n++ < 40) { if (Cine.bubble) bub++; for (let k = 0; k < 30; k++) G.step(1 / 120); Story.next(); if (!Cine.revealed()) Story.next(); if (document.querySelector('#sceneChoices button')) break; }
      o.scenes.push({ id: c.id, bub, st: G.state, venue: G.venue === c.venue || G.venue === (c.fights[0].venue || c.venue), boss: G.matchOpts && G.matchOpts.opp && G.matchOpts.opp.boss, offh: G.e.offhand, hp: G.p.hp });
      Cine.end(); Story.cur = null; G.state = 'menu'; }
    // fin de chapitre et récompenses : on gagne b03, le choix est demandé à la fin
    Save.data.ecus = 0; const i3 = STORY.findIndex(c => c.id === 'b03'); Story.play(i3); Story.skip(); o.inFight = G.state; G.wins = [2, 0]; Story.onFightEnd(true); Story.afterEnd('go'); Story.skip(); o.ask = document.querySelectorAll('#sceneChoices button').length; document.querySelector('#sceneChoices button').click(); o.choice = S.choices.b03; o.done3 = !!S.done.b03; o.ecus = Save.data.ecus;
    // liste des chapitres : 24 entrées, actes du Livre II
    G.state = 'menu'; Story.cur = null; Story.showList(); o.list = $('storyList').querySelectorAll('button.chap').length; o.heads = [...$('storyList').querySelectorAll('.eyebrow')].map(h => h.textContent).filter(t => /Livre II ·/.test(t)).length;
    o.codex = ['gabelle', 'poste', 'digue', 'princesel'].every(id => CODEX.some(e => e.id === id)); o.lessons = Object.keys(LESSONS).filter(k => /^b0/.test(k)).length;
    return o;
  });
  console.log(JSON.stringify(r));
  ok('8 chapitres en 2 actes', r.n === 8 && r.acts === 2);
  ok('3 nouveaux décors peints, dans le jeu et le menu', r.venues.every(v => v.s > 5000 && v.inKeys && v.light) && r.venueBtns === 3, r.venues.map(v => v.k + ':' + v.s));
  ok('le Livre II s\'ouvre après Notre-Dame, chapitre après chapitre', !r.lock0 && r.lock1 && r.lock2);
  ok('deux fins selon le Registre (rendu / brûlé), la Saunière revient si épargnée', r.endR && r.endB);
  ok('la Saunière épargnée : on arrive frais à la digue', r.hp7[0] === 100 && r.hp7[1] === 80, r.hp7);
  ok('les 8 chapitres ont leur mise en scène et mènent au duel', r.scenes.every(s => s.bub > 0 && (s.st === 'round' || s.st === 'fight') && s.venue), r.scenes.map(s => s.id + ':' + s.bub + ':' + s.st));
  ok('2 boss (Corsaire, Prince de Sel) avec deuxième souffle et main gauche', r.scenes.find(s => s.id === 'b05').boss === 'feinte' && r.scenes.find(s => s.id === 'b08').boss === 'temps' && r.scenes.find(s => s.id === 'b05').offh === 'dague' && r.scenes.find(s => s.id === 'b08').offh === 'rondache');
  ok('fin de chapitre : choix demandé, sauvegardé, récompense', (r.inFight === 'round' || r.inFight === 'fight') && r.ask === 2 && r.choice === 'marchander' && r.done3 && r.ecus >= 130, { a: r.ask, c: r.choice, e: r.ecus });
  ok('liste : 32 chapitres, actes du Livre II', r.list === 32 && r.heads === 2, { l: r.list, h: r.heads });
  ok('carnet et leçons du Livre II', r.codex && r.lessons === 8);
  console.log(errs.length ? 'ERREURS ' + JSON.stringify(errs.slice(0, 3)) : 'aucune erreur'); ok('aucune erreur JavaScript', errs.length === 0);
  console.log(`${res.filter(Boolean).length}/${res.length} tests réussis`); await b.close();
})();
