const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, ctx, pg, errs } = await open();
  await pg.evaluate(() => { localStorage.clear(); }); await pg.reload(); await pg.waitForTimeout(500);
  const R = {};
  R.debut = await pg.evaluate(() => ({ ecus: Save.data.ecus, owned: Save.data.owned, mode: Save.mode, purse: $('purse').textContent }));
  await pg.click('#goTour'); await pg.waitForTimeout(100); await pg.screenshot({ path: 'out/c_tournois.png' });
  R.verrous = await pg.evaluate(() => [...document.querySelectorAll('#tourList .item')].map(i => i.classList.contains('locked')));
  await pg.click('[data-join="0"]'); await pg.waitForTimeout(100); await pg.screenshot({ path: 'out/c_bracket.png' });
  // trois duels du tournoi, le joueur étant piloté par l'IA Maître
  const bouts = [];
  for (let k = 0; k < 3; k++) {
    await pg.click('#brGo'); await pg.waitForTimeout(50);
    const r = await pg.evaluate(() => { const pa = new AI(G.p, G.e, 'maitre'); const orig = Input.apply; Input.apply = (f, dt) => pa.think(dt); G.silent = true;
      let t = 0; while (G.state !== 'over' && t < 400) { G.hitStop = 0; G.slowT = 0; G.step(1 / 120); t += 1 / 120; if (G.state === 'round') G.banner.t = 99; }
      Input.apply = orig; G.silent = false; return { adv: G.e.look.name, venue: G.venue, eRapier: G.e.rapier.name, wins: G.wins.slice(), reward: $('overReward').textContent, btn: $('again').textContent, action: G.overAction }; });
    bouts.push(r); await pg.screenshot({ path: `out/c_over${k}.png` });
    await pg.click('#again'); await pg.waitForTimeout(100);
    if (r.action !== 'bracket') break;
  }
  R.bouts = bouts;
  R.apres = await pg.evaluate(() => ({ ecus: Save.data.ecus, won: Save.data.won, tour: Save.data.tour, jour: Save.data.market.day, ecran: ['tourney', 'bracket', 'menu'].find(id => !$(id).hidden), verrous: [...document.querySelectorAll('#tourList .item')].map(i => i.classList.contains('locked')) }));
  // marché : acheter la moins chère disponible, équiper, vendre
  await pg.click('#tourBack'); await pg.evaluate(() => Menu.open('salle')); await pg.click('#goMarket'); await pg.waitForTimeout(100); await pg.screenshot({ path: 'out/c_marche.png', fullPage: true });
  R.marche = await pg.evaluate(() => {
    const avail = RAPIER_IDS.filter(id => RAPIERS[id].base && Save.data.market.stock[id] && Market.price(id) <= Save.data.ecus).sort((a, b) => Market.price(a) - Market.price(b));
    if (!avail.length) return { achat: null, ecus: Save.data.ecus };
    const id = avail[0], p = Market.price(id), before = Save.data.ecus; document.querySelector(`[data-buy="${id}"]`).click();
    const afterBuy = { id, prix: p, ecus: Save.data.ecus, equipee: Save.data.equipped, depense: before - Save.data.ecus };
    document.querySelector('[data-eq="garnison"]').click(); const sellP = Market.sell(id); document.querySelector(`[data-sell="${id}"]`).click();
    return { ...afterBuy, revente: sellP, ecusFinal: Save.data.ecus, possede: Save.data.owned };
  });
  // la rapière équipée est bien celle du combattant en duel
  R.equipeEnDuel = await pg.evaluate(() => { const id = RAPIER_IDS.find(i => i !== 'garnison'); Save.data.owned.push(id); Save.data.equipped = id; Save.persist(); G.level = 'duelliste'; G.silent = true; G.startMatch(); const r = [G.p.rapier.name, G.p.joints().tip[0] - G.p.joints().wr[0]]; G.toMenu(); return r; });
  // persistance : rechargement
  const before = await pg.evaluate(() => JSON.stringify({ e: Save.data.ecus, w: Save.data.won, o: Save.data.owned, eq: Save.data.equipped, d: Save.data.market.day }));
  await pg.reload(); await pg.waitForTimeout(500);
  const after = await pg.evaluate(() => JSON.stringify({ e: Save.data.ecus, w: Save.data.won, o: Save.data.owned, eq: Save.data.equipped, d: Save.data.market.day }));
  R.persistance = before === after ? 'identique après rechargement' : { before, after };
  R.errs = errs; console.log(JSON.stringify(R, null, 1)); await b.close();
})();
