// captures 2.0 : défi, école, options, combat en anglais
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(600);
  await pg.evaluate(() => { Save.data.ecus = 600; Ecole.open(); Ecole.recruit(Ecole.candidates()[0]); Ecole.recruit(Ecole.candidates()[1]); Defi.open(); }); await pg.waitForTimeout(300); await pg.screenshot({ path: __dirname + '/out/v2_defi.png' });
  await pg.evaluate(() => Ecole.show()); await pg.waitForTimeout(300); await pg.screenshot({ path: __dirname + '/out/v2_ecole.png' });
  await pg.evaluate(() => { G.show('menu'); Menu.open('options'); }); await pg.waitForTimeout(300); await pg.screenshot({ path: __dirname + '/out/v2_options.png' });
  await pg.evaluate(() => store.set('ct2d.lang', 'en')); await pg.reload(); await pg.waitForTimeout(900);
  await pg.screenshot({ path: __dirname + '/out/v2_menu_en.png' });
  await pg.evaluate(() => { G.venuePref = 'navire'; G.level = 'maitre'; G.startMatch(); }); await pg.waitForTimeout(1200); await pg.screenshot({ path: __dirname + '/out/v2_fight_en.png' });
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
