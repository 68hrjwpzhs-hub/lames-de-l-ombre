// export / import de la partie, compteur de performance
const { open } = require('./lib');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(500);
  const r = await pg.evaluate(async () => {
    const o = {}; Save.data.ecus = 777; Save.data.owned.push('tolede'); Save.data.victories = 12; Save.data.duels = 20; Save.persist(); store.set('ct2d.record', { w: 9, l: 3 });
    const code = SaveIO.pack(); o.len = code.length; o.prefix = code.slice(0, 5);
    Save.data.ecus = 5; Save.data.owned = ['heros', 'garnison']; Save.persist();
    // l'écran : ouvrir, coller, importer (deux temps), puis vérifier
    $('optSave').click(); o.screen = !$('savebox').hidden; $('saveCode').value = '  ' + code + '\n'; $('saveImport').click(); o.step1 = $('saveImport').textContent; o.notYet = Save.data.ecus; $('saveImport').click();
    o.after = { ecus: Save.data.ecus, owned: Save.data.owned.includes('tolede'), rec: store.get('ct2d.record').w, backup: !!store.get('ct2d.save.backup') };
    // code abîmé et code étranger
    $('saveCode').value = code.slice(0, -3) + 'zzz'; $('saveImport').click(); o.bad = $('saveInfo').textContent; $('saveCode').value = 'bonjour'; $('saveImport').click(); o.alien = $('saveInfo').textContent;
    // accents et caractères spéciaux
    Save.data.avatar = { name: 'Hugues « l\'Œil » de Vaucelles' }; const c2 = SaveIO.pack(); o.unicode = SaveIO.unpack(c2).save.avatar.name;
    $('saveBack').click(); o.back = !$('menu').hidden;
    // compteur de performance
    $('optPerf').click(); await new Promise(r => setTimeout(r, 900)); o.perf = !!document.getElementById('perfBox') && !document.getElementById('perfBox').hidden; o.perfText = document.querySelector('#perfBox pre').textContent.split('\n')[0]; $('optPerf').click();
    return o;
  });
  console.log(JSON.stringify(r));
  ok('le code commence par LDO1 et reste court', r.prefix === 'LDO1.' && r.len < 8000, r.len);
  ok('import en deux temps (aperçu, puis confirmation)', r.screen && /Confirmer/.test(r.step1) && r.notYet === 5, r.step1);
  ok('la partie importée revient à l\'identique (écus, rapières, bilan) et l\'ancienne est gardée', r.after.ecus === 777 && r.after.owned && r.after.rec === 9 && r.after.backup, r.after);
  ok('code abîmé ou étranger refusé avec un message clair', /abîmé/.test(r.bad) && /LDO1/.test(r.alien), [r.bad, r.alien]);
  ok('accents conservés', r.unicode === 'Hugues « l\'Œil » de Vaucelles', r.unicode);
  ok('retour au menu', r.back);
  ok('compteur de performance affiché et mis à jour', r.perf && /i\/s/.test(r.perfText), r.perfText);
  ok('aucune erreur JavaScript', errs.length === 0, errs);
  console.log(`${res.filter(Boolean).length}/${res.length}`); await b.close();
})();
