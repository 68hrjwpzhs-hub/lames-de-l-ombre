const { open } = require('./lib');
(async () => {
  for (const dev of [null, 'iPhone 13 landscape']) {
    const { b, pg, errs } = await open(dev ? { device: dev } : {}); if (!dev) await pg.setViewportSize({ width: 1280, height: 760 });
    await pg.evaluate(() => localStorage.clear()); await pg.reload(); await pg.waitForTimeout(400);
    await pg.evaluate(() => Menu.open('salle')); await pg.click('#goChar'); await pg.waitForTimeout(300);
    await pg.fill('#crName', 'Isabella della Rovere');
    await pg.click('[data-k="style"][data-v="dame"]'); await pg.click('[data-k="hairStyle"][data-v="queue"]'); await pg.click('[data-k="coat"][data-v="#1d4a3e"]'); await pg.click('[data-k="hatType"][data-v="beret"]'); await pg.click('[data-k="plume"][data-v="#b2302a"]');
    await pg.waitForTimeout(300); await pg.screenshot({ path: `out/cr_${dev ? 'iphone' : 'pc'}.png` });
    await pg.click('#crSave'); await pg.waitForTimeout(200);
    const r = await pg.evaluate(() => ({ menu: !$('menu').hidden, purse: $('purse').textContent.slice(0, 40), look: [LOOKS.player.name, LOOKS.player.style, LOOKS.player.body, LOOKS.player.hairStyle, LOOKS.player.hatType], pLook: G.p.look === LOOKS.player }));
    await pg.reload(); await pg.waitForTimeout(400);
    r.apresRechargement = await pg.evaluate(() => [LOOKS.player.name, LOOKS.player.style, LOOKS.player.coat]);
    await pg.evaluate(() => { G.level = 'duelliste'; G.startMatch(); G.silent = true; }); await pg.waitForTimeout(2200); await pg.screenshot({ path: `out/cr_fight_${dev ? 'iphone' : 'pc'}.png` });
    console.log(dev || 'pc', JSON.stringify(r), errs); await b.close();
  }
})();
