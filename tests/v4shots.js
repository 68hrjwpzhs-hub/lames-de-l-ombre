// captures 4.0 : décors utilisables et mêlée, joute, carte, poursuite
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', joute: true });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  await pg.evaluate(() => { G.silent = false; G.level = 'duelliste'; G.venuePref = 'auberge'; store.set('ct2d.joute', false); Melee.start(Melee.gardes(3), { mode: 'duel', venue: 'auberge' }); Save.data.allie = 'valet'; });
  await pg.waitForTimeout(2600); await pg.evaluate(() => { G.p.x = 200; }); await pg.waitForTimeout(400); await pg.screenshot({ path: __dirname + '/out/v4_melee.png' });
  await pg.evaluate(() => { G.toMenu(); store.set('ct2d.joute', true); G.startMatch({}); }); await pg.waitForTimeout(400); await pg.screenshot({ path: __dirname + '/out/v4_joute.png' });
  await pg.evaluate(() => { $('joute').hidden = true; Joute.cur = null; G.toMenu(); Carte.open('cite'); }); await pg.waitForTimeout(400); await pg.screenshot({ path: __dirname + '/out/v4_carte.png' });
  await pg.evaluate(() => { G.show(null); Chase.start({ id: 'x' }, () => { }, () => ''); }); await pg.waitForTimeout(2600); await pg.screenshot({ path: __dirname + '/out/v4_chase.png' });
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
