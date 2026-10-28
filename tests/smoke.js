const { open } = require('./lib');
(async () => {
  const { b, pg, errs } = await open();
  console.log('REACH', await pg.evaluate(() => JSON.stringify(REACH)));
  await pg.screenshot({ path: 'out/s_menu.png' });
  await pg.click('#go'); await pg.waitForFunction('G.state==="fight"', null, { timeout: 5000 });
  await pg.waitForTimeout(3000); await pg.screenshot({ path: 'out/s_fight.png' });
  console.log(await pg.evaluate(() => [G.p.x, G.e.x, G.p.state, G.e.state, G.p.hp, G.e.hp]));
  console.log('errs', errs); await b.close();
})();
