const { open } = require('./lib');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone SE landscape' });
  await pg.tap('[data-v="training"]'); await pg.waitForTimeout(100); await pg.screenshot({ path: 'out/m_se.png' });
  await pg.evaluate(() => { $('help').open = true; $('help').scrollIntoView(); }); await pg.waitForTimeout(100); await pg.screenshot({ path: 'out/m_se_help.png' });
  console.log(errs); await b.close();
})();
