// 2.0 · sprint 23 : anglais, sous-titres, daltonien, mouvements réduits
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(600);
  const fr = await pg.evaluate(() => ({ lang: I18N.lang, play: $('goStory').textContent, row: !!$('langRow'), a11y: !!$('a11yOpts') }));
  await pg.evaluate(() => store.set('ct2d.lang', 'en')); await pg.reload(); await pg.waitForTimeout(900);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(async () => {
    const o = { lang: I18N.lang, htmlLang: document.documentElement.lang };
    o.menu = [$('goStory').textContent, $('goRun').textContent, $('go').textContent, $('goDefi').textContent, [...document.querySelectorAll('#menu .mtabs button')].map(b => b.textContent).join('|')];
    o.tr = ['Manche 2', 'Parade !', 'Riposte parfaite !', 'Victoire : +50 écus.', 'Chapitre 3 · Rouge contre Bleu', 'Garde relâchée 0,12 s avant la touche : tenez-la jusqu\'au contact.', 'Défi relevé ! +40 écus · série 2 jours · nouvel ornement : Plume dorée'].map(s => I18N.tr(s));
    // texte dessiné sur le canevas : passe par la traduction
    const c = document.createElement('canvas').getContext('2d'); let drawn = ''; const P = CanvasRenderingContext2D.prototype; o.measure = c.measureText('Parade !').width > 0;
    // une scène d'histoire en anglais
    G.frame = () => {}; Story.play(0); Story.endTitle(); await new Promise(r => setTimeout(r, 50)); o.scene = $('sceneText').textContent; o.eye = $('sceneEye').textContent; Cine.end(); Story.cur = null; G.state = 'menu'; G.show('menu');
    // tour des écrans : textes encore en français
    const frWords = /\b(le|la|les|des|une|du|vous|votre|pour|avec|dans|sur|est|sont|et)\b|[éèêàùç]/i, left = new Set();
    const scan = id => { const el = $(id); if (!el) return; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const t = n.data.trim(); if (t.length > 2 && frWords.test(t) && !/^(Álvaro|Isaure|Hugues|Bastien|Corvin|Mathurin|Vaucelles|Dom|Maître Lacombe)/.test(t)) left.add(t.slice(0, 80)); } };
    let total = 0; const count = id => { const el = $(id); if (!el) return; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (n.data.trim().length > 2) total++; };
    for (const k of ['jouer', 'salle', 'biblio', 'options']) { Menu.open(k); await new Promise(r => setTimeout(r, 20)); scan('menu'); count('menu'); }
    Story.showList(); await new Promise(r => setTimeout(r, 20)); scan('story'); count('story'); Defi.open(); await new Promise(r => setTimeout(r, 20)); scan('defi'); count('defi'); Save.data.ecus = 999; Ecole.show(); await new Promise(r => setTimeout(r, 20)); scan('ecole'); count('ecole');
    $('goCodex').click(); await new Promise(r => setTimeout(r, 20)); scan('codex'); count('codex'); G.show('menu');
    o.left = [...left]; o.total = total;
    // accessibilité : options, sous-titres, daltonien, mouvements réduits
    o.a11yBtns = ['optCap', 'optCvd', 'optCalm'].every(id => !!$(id));
    A11y.set('captions', true); G.state = 'fight'; G.silent = false; Snd.bell(); Snd.crack(); o.caps = [...$('captions').children].map(d => d.textContent); G.silent = true; G.state = 'menu';
    A11y.set('cvd', true); o.cvd = CFG.cvd; A11y.set('cvd', false);
    A11y.set('calm', true); G.shake = 9; G.zoom = .2; G.flash = .5; try { G.render(0.016); } catch (e) { o.renderErr = e.message; } o.calm = [G.shake, G.zoom <= .01, G.flash <= .05]; A11y.set('calm', false);
    return o;
  });
  console.log(JSON.stringify(Object.assign({}, r, { left: r.left.length })));
  console.log('Restent en français (' + r.left.length + ') :\n  ' + r.left.slice(0, 40).join('\n  '));
  ok('français par défaut, choix de langue et accessibilité dans les options', fr.lang === 'fr' && fr.play === 'Histoire' && fr.row && fr.a11y);
  ok('anglais : menu traduit, page en anglais', r.lang === 'en' && r.htmlLang === 'en' && r.menu[0] === 'Story' && r.menu[2] === 'Free duel' && /Daily challenge/.test(r.menu[3]) && r.menu[4] === 'Play|Fencing hall|Library|Options', r.menu);
  ok('textes composés traduits (manches, gains, chapitres, conseils)', r.tr[0] === 'Round 2' && r.tr[1] === 'Parry!' && /Victory: \+50 crowns/.test(r.tr[3]) && /Chapter 3/.test(r.tr[4]) && /Red against Blue/.test(r.tr[4]) && /Guard released/.test(r.tr[5]) && /Challenge met! \+40 crowns/.test(r.tr[6]) && /Golden plume/.test(r.tr[6]), r.tr);
  ok('histoire en anglais (réplique et titre)', /Paris, 1633\. Duelling/.test(r.scene) && /Chapter 1/.test(r.eye), [r.scene, r.eye]);
  ok('écrans parcourus : moins de 5 % de textes restés en français', r.left.length / r.total < .05, { reste: r.left.length, total: r.total });
  ok('sous-titres des sons importants (traduits)', r.caps.length === 2 && /Bell|Crack/.test(r.caps.join()), r.caps);
  ok('mode daltonien et mouvements réduits', r.a11yBtns && r.cvd === true && r.calm[0] === 0 && r.calm[1] && r.calm[2] && !r.renderErr, r.calm);
  console.log(errs.length ? 'ERREURS ' + JSON.stringify(errs.slice(0, 3)) : 'aucune erreur'); ok('aucune erreur JavaScript', errs.length === 0);
  console.log(`${res.filter(Boolean).length}/${res.length} tests réussis`); await b.close();
})();
