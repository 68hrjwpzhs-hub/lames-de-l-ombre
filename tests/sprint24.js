// 2.0 · sprint 24 : sauvegarde complète (réglages 2.0 compris), version, robustesse (duels IA contre IA sur les nouveaux décors)
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(600);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(() => {
    const o = { ver: GAME_VERSION, verLine: $('verLine').textContent };
    // export : défi, école, main gauche, réglages 2.0 ; import sur une partie vierge
    Save.data.defi = { done: { '2026-10-28': { t: 50 } }, streak: 1, best: 3, cosm: ['plumeOr'], wear: { plume: 'plumeOr' } }; Save.data.ecole = { open: true, rep: 7, eleves: [{ id: 'x', name: 'Test', lvl: 5 }], hired: {} }; Save.data.offh = { vaucelles: 'dague' };
    store.set('ct2d.v2opts', { gestures: true, cues: false, slowDuel: true }); store.set('ct2d.a11y2', { captions: true, cvd: true, calm: false });
    const code = SaveIO.pack(); localStorage.removeItem('ct2d.v2opts'); localStorage.removeItem('ct2d.a11y2'); Save.data = Save.fresh();
    SaveIO.apply(SaveIO.unpack(code)); o.restored = { defi: Save.data.defi.best, ecole: Save.data.ecole.rep, offh: Save.data.offh.vaucelles, v2: store.get('ct2d.v2opts', {}).slowDuel, a11y: store.get('ct2d.a11y2', {}).cvd, slowNow: Controls.opt.slowDuel, cvdNow: CFG.cvd };
    // un vieux code 1.x (sans réglages 2.0) s'importe toujours
    const old = SaveIO.pack().replace(/^LDO1\./, ''); const j = JSON.parse(SaveIO.b64d(old.split('.')[0])); delete j.extra; const p = SaveIO.b64e(JSON.stringify(j)); let okOld = true; try { SaveIO.apply(SaveIO.unpack('LDO1.' + p + '.' + SaveIO.crc(p))); } catch (e) { okOld = e.message; } o.old = okOld;
    // duels IA contre IA sur les trois nouveaux décors, mains gauches comprises : ils vont au bout
    o.matches = []; for (const v of ['auberge', 'navire', 'bastion']) { G.venuePref = v; const m = T.match('maitre', 'maitre', 300); o.matches.push({ v, over: m.over, venue: G.venue, t: Math.round(m.t) }); }
    return o;
  });
  console.log(JSON.stringify(r));
  ok('version 4.0.0 affichée', r.ver === '4.0.0' && /4\.0\.0/.test(r.verLine), r.verLine);
  ok('export / import : défi, école, main gauche et réglages 2.0', r.restored.defi === 3 && r.restored.ecole === 7 && r.restored.offh === 'dague' && r.restored.v2 === true && r.restored.a11y === true && r.restored.slowNow === true && r.restored.cvdNow === true, r.restored);
  ok('un code de sauvegarde 1.x s\'importe toujours', r.old === true, r.old);
  ok('duels IA contre IA complets sur auberge, navire, bastion', r.matches.every(m => m.over && m.venue === m.v), r.matches);
  console.log(errs.length ? 'ERREURS ' + JSON.stringify(errs.slice(0, 3)) : 'aucune erreur'); ok('aucune erreur JavaScript', errs.length === 0);
  console.log(`${res.filter(Boolean).length}/${res.length} tests réussis`); await b.close();
})();
