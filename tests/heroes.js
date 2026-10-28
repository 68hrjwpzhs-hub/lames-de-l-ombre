// héros jouables : qualités de chacun, écran de choix, sauvegarde
const { open } = require('./lib'); const fs = require('fs');
const results = []; const ok = (name, cond, detail) => { results.push({ name, pass: !!cond }); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  for (const dev of [null, 'iPhone 13 landscape']) {
    const { b, pg, errs } = await open(dev ? { device: dev } : {}); if (!dev) await pg.setViewportSize({ width: 1280, height: 720 });
    await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
    if (!dev) {
      const r = await pg.evaluate(() => {
        curHero = T.realHero; const o = {};
        const as = id => { Save.data.hero = id; Save.data.equipped = 'heros'; applyAvatar(); };
        const setup = (d, id) => { as(id); T.setup(d); G.p.rapier = RAPIERS.heros; G.p.slow = curHero().speed; G.p.arch = curHero().arch || null; };
        const taken = id => { setup(225, id); G.e.rapier = RAPIERS.garnison; G.e.intent.act = 'jab'; T.stepUntil(() => T.ev.length, 150); return 100 - G.p.hp; };
        const dealt = (id, act, d = 225) => { setup(d, id); G.p.intent.act = act; T.stepUntil(() => T.ev.length, 150); return { dmg: 100 - G.e.hp, hp: G.p.hp }; };
        o.taken = Object.fromEntries(HERO_IDS.map(id => [id, taken(id)]));
        o.dealt = Object.fromEntries(HERO_IDS.map(id => [id, dealt(id, 'jab').dmg]));
        o.wu = Object.fromEntries(HERO_IDS.map(id => { setup(600, id); G.e.x = 900; G.p.intent.act = 'jab'; T.stepN(2); return [id, +G.p.move.wu.toFixed(3)]; }));
        // Bastien : la touche le soigne
        setup(225, 'bastien'); G.p.hp = 50; G.p.intent.act = 'jab'; T.stepUntil(() => T.ev.length, 150); o.bastienHp = G.p.hp;
        // Corvin : première touche de la manche plus forte
        setup(225, 'corvin'); G.p.intent.act = 'jab'; T.stepUntil(() => T.ev.length, 150); const c1 = 100 - G.e.hp; T.stepN(100); G.e.hp = 100; T.ev = []; G.p.intent.act = 'jab'; T.stepUntil(() => T.ev.length, 150); o.corvin = [c1, 100 - G.e.hp];
        // Mathurin : garde brisée coûteuse, lourde plus forte
        const brk = id => { setup(280, id); T.holdGuard(G.e, 'ext'); G.p.intent.act = 'heavy'; T.stepUntil(() => T.ev.length, 200); return [T.types()[0], 100 - G.e.hp]; };
        o.brkM = brk('mathurin'); o.brkB = brk('bastien');
        // Isaure : riposte +6
        const rip = id => { setup(225, id); G.e.intent.act = 'jab'; let pr = -1; for (let i = 0; i < 200; i++) { if (G.e.state === 'attack' && G.e.t >= G.e.move.wu - .05 && !G.p.intent.guard) G.p.intent.guard = true; T.stepN(1); if (pr < 0 && G.p.ripOffer) { pr = i; } if (pr >= 0 && i === pr + 22) { G.p.intent.guard = false; G.p.intent.rip = true; } if (T.ev.some(e => e.t === 'hit' && e.i.a === G.p)) break; } return 100 - G.e.hp; };
        o.ripI = rip('isaure'); o.ripB = rip('bastien');
        // Vaucelles : parade parfaite soigne
        setup(225, 'vaucelles'); G.p.hp = 60; G.e.intent.act = 'jab'; for (let i = 0; i < 200; i++) { if (G.e.state === 'attack' && G.e.t >= G.e.move.wu - .05) G.p.intent.guard = true; T.stepN(1); if (T.types().includes('parry')) break; } o.vauHp = G.p.hp;
        // Álvaro : allonge et posture
        o.len = { alvaro: RAPIERS.heros.len }; setup(300, 'alvaro'); T.stepN(60); o.alvaroArch = G.p.arch; o.alvaroTip = Math.round(G.p.J.tip[0] - G.p.x);
        setup(300, 'bastien'); T.stepN(60); o.bastienTip = Math.round(G.p.J.tip[0] - G.p.x);
        // écran de choix, sauvegarde et nom
        G.toMenu(); $('goChar').click(); o.ecran = !$('creator').hidden; o.nbHeros = $('heroList').querySelectorAll('[data-h]').length;
        $('heroList').querySelector('[data-h="isaure"]').click(); $('crSave').click(); o.choisi = Save.data.hero; o.nom = LOOKS.player.name; o.bourse = $('purse').textContent; o.lame = RAPIERS[Save.data.equipped].name;
        o.titre = document.title + ' / ' + document.querySelector('#menu h1').textContent;
        // ancienne sauvegarde : rapière de garnison équipée → lame du héros
        Save.data = Object.assign(Save.fresh(), { owned: ['garnison', 'tolede'], equipped: 'garnison', heroMig: undefined, hero: undefined }); Save.migrate(); o.migr = [Save.data.equipped, Save.data.owned.join(','), Save.data.hero];
        return o;
      });
      console.log(JSON.stringify(r));
      ok('Vaucelles encaisse le moins, Corvin et Isaure le plus', r.taken.vaucelles < r.taken.bastien && r.taken.corvin > r.taken.bastien && r.taken.isaure > r.taken.bastien, r.taken);
      ok('Corvin et Mathurin frappent plus fort que Bastien', r.dealt.corvin > r.dealt.bastien && r.dealt.mathurin > r.dealt.bastien, r.dealt);
      ok('Isaure est la plus vive, Mathurin le plus lent', r.wu.isaure === Math.min(...Object.values(r.wu)) && r.wu.mathurin === Math.max(...Object.values(r.wu)), r.wu);
      ok('Bastien se soigne en touchant', r.bastienHp > 50, r.bastienHp);
      ok('Corvin : première touche de la manche plus forte', r.corvin[0] > r.corvin[1], r.corvin);
      ok('Mathurin : garde brisée plus coûteuse', r.brkM[0] === 'break' && r.brkM[1] > r.brkB[1], [r.brkM, r.brkB]);
      ok('Isaure : riposte +6 (malgré une lame plus légère, sa riposte est la plus forte)', r.ripI > r.ripB, [r.ripI, r.ripB]);
      ok('Vaucelles : parade parfaite qui soigne', r.vauHp > 60, r.vauHp);
      ok('Álvaro : lame la plus longue, bras tendu (destreza)', r.alvaroArch === 'destreza' && r.alvaroTip > r.bastienTip, [r.alvaroTip, r.bastienTip]);
      ok('écran Héros : 6 héros, choix sauvegardé, nom et lame du héros', r.ecran && r.nbHeros === 6 && r.choisi === 'isaure' && r.nom === 'Isaure de Mirande' && /Isaure/.test(r.bourse) && r.lame === 'L\'Aiguille', [r.nbHeros, r.choisi, r.nom, r.lame]);
      ok('titre : Les Lames de l\'Ombre', /Lames de l'Ombre/.test(r.titre), r.titre);
      ok('ancienne sauvegarde migrée vers la lame du héros', r.migr[0] === 'heros' && r.migr[1].startsWith('heros') && r.migr[2] === 'vaucelles', r.migr);
    }
    await pg.evaluate(() => { curHero = T.realHero; G.toMenu(); Save.data.hero = 'alvaro'; Creator.open(); });
    await pg.waitForTimeout(300); await pg.screenshot({ path: `${__dirname}/out/heros_${dev ? 'iphone' : 'pc'}.png` });
    ok(`aucune erreur JavaScript (${dev || 'PC'})`, errs.length === 0, errs);
    await b.close();
  }
  console.log(`\n${results.filter(r => r.pass).length}/${results.length} tests réussis`);
})();
