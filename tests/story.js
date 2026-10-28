// mode Histoire : les 10 chapitres de bout en bout (scènes, choix, duels, conditions, récompenses, sauvegarde)
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(500);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(async () => {
    const o = { chapters: [], heroes: [], venues: [], foes: [] }; G.silent = true; G.frame = () => {};
    Save.data.story = null; Save.data.ecus = 0; Save.data.owned = ['heros', 'garnison']; Save.persist();
    $('goStory').click(); o.listOpen = !$('story').hidden; o.locked = document.querySelectorAll('#storyList button:disabled').length;
    const winFight = () => { for (let k = 0; k < 6 && G.state !== 'over'; k++) { T.stepUntil(() => G.state === 'fight', 900); if (G.state !== 'fight') break; o.heroes.push(Story.hero || 'libre'); o.venues.push(G.venue); o.foes.push(G.e.look.name); G.p.stats.perfect = 5; G.p.stats.beatOk = 3; G.p.stats.whiffs = 0; Story.flags.breaks = 3; Story.flags.legWound = 1; G.endRound(G.p, 'Touche'); T.stepUntil(() => G.state !== 'ko', 600); } };
    for (let i = 0; i < STORY.length; i++) {
      document.querySelectorAll('#storyList button')[i].click(); let guard = 0;
      while (Story.cur && guard++ < 200) {
        if (G.state === 'scene') { const ch = document.querySelector('#sceneChoices button'); if (ch) ch.click(); else Story.next(); }
        else if (G.state === 'round' || G.state === 'fight') winFight();
        else if (!$('storyEnd').hidden) $('seGo').click();
        else break;
      }
      o.chapters.push(STORY[i].id + ':' + (Save.data.story.done[STORY[i].id] ? Save.data.story.done[STORY[i].id].stars : 'x'));
    }
    const S = Save.data.story; o.boons = S.boons; o.equipped = S.boonEquipped; o.ending = S.ending; o.owned = Save.data.owned; o.ecus = Save.data.ecus; o.choices = S.choices;
    o.note = $('storyNote').textContent; o.listAgain = !$('story').hidden; o.unlockedAll = document.querySelectorAll('#storyList button:disabled').length === 0;
    // défaite : on peut réessayer le duel
    document.querySelectorAll('#storyList button')[2].click(); let g2 = 0; while (G.state === 'scene' && g2++ < 50) { const ch = document.querySelector('#sceneChoices button'); if (ch) ch.click(); else Story.next(); }
    T.stepUntil(() => G.state === 'fight', 900); G.endRound(G.e, 'Touche'); T.stepUntil(() => G.state !== 'ko', 600); G.endRound && 0; T.stepUntil(() => G.state === 'fight', 900); G.endRound(G.e, 'Touche'); T.stepUntil(() => G.state !== 'ko', 600);
    o.lost = { title: $('seTitle').textContent, retry: !$('seRetry').hidden, go: $('seGo').hidden }; $('seRetry').click(); o.retryState = G.state; o.retryMode = G.mode;
    $('seList') && Story.afterEnd('list'); o.back = !$('story').hidden;
    // la botte portée agit en Histoire (Run.has)
    G.mode = 'story'; S.boonEquipped = 'riposte'; o.botte = Run.has('riposte'); G.mode = 'duel'; o.botteDuel = Run.has('riposte');
    // export / import garde l'histoire
    const code = SaveIO.pack(); o.codeHasStory = SaveIO.unpack(code).save.story.done.ch10 !== undefined;
    return o;
  });
  console.log(JSON.stringify(r).slice(0, 1500));
  ok('écran Histoire : 10 chapitres, 6 récits et 8 chapitres du Livre II, 31 verrouillés au départ', r.listOpen && r.locked === 31, r.locked);
  ok('les 10 chapitres se jouent de bout en bout', r.chapters.every(c => /:\d/.test(c)), r.chapters);
  ok('héros imposés et lieux des chapitres respectés', r.heroes[0] === 'vaucelles' && r.heroes.includes('isaure') && r.heroes.includes('libre') && r.venues.includes('eglise') && r.venues.includes('loggia'), [r.heroes.slice(0, 4), r.venues.slice(0, 4)]);
  ok('adversaires signature présents', ['Don Gaspar de Lerín', 'Ombeline Vasseur', 'Le marquis de Brévannes', 'Le Chevalier d\'Écaille', 'Capitaine de Rouvray'].every(n => r.foes.includes(n)), r.foes);
  ok('récompenses : bottes secrètes, rapières, écus, fin choisie', r.boons.length >= 5 && r.owned.includes('ferrara') && r.owned.includes('tolede') && r.ecus > 500 && r.ending, { b: r.boons, o: r.owned, e: r.ecus, end: r.ending });
  ok('tous les chapitres débloqués à la fin, retour à la liste', r.unlockedAll && r.listAgain, r.note);
  ok('défaite : écran « Défaite » avec Réessayer', r.lost.title === 'Défaite' && r.lost.retry && r.lost.go && r.retryMode === 'story', r.lost);
  ok('la botte portée agit en Histoire, pas en duel libre', r.botte && !r.botteDuel);
  ok('la progression de l\'histoire part dans l\'export de sauvegarde', r.codeHasStory);
  ok('aucune erreur JavaScript', errs.length === 0, errs);
  console.log(`${res.filter(Boolean).length}/${res.length}`); await b.close();
})();
