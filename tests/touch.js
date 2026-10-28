const { open, devices } = require('./lib'); const fs = require('fs');
const DEVS = ['iPhone 13 landscape', 'iPhone SE landscape', 'iPhone 14 Pro Max landscape', 'iPhone 12 Mini landscape', 'iPad Mini landscape'].filter(d => devices[d]);
(async () => {
  const all = [];
  for (const dev of DEVS) {
    const { b, ctx, pg, errs } = await open({ device: dev });
    await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
    const R = { dev, vp: pg.viewportSize() };
    const cdp = await ctx.newCDPSession(pg);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y, id]) => ({ x, y, id })) });
    const center = async sel => { const r = await pg.locator(sel).boundingBox(); return [r.x + r.width / 2, r.y + r.height / 2]; };
    await pg.tap('#go'); await pg.waitForFunction('G.state==="fight"', null, { timeout: 6000 });
    await pg.evaluate(() => { G.ai.think = () => { G.e.intent.dx = 0; }; Input.apply = Input._apply; T.inputOn = true; });
    // disposition : boutons dans l'écran, sans chevauchement, assez grands, hors HUD
    R.layout = await pg.evaluate(() => {
      const ids = ['bAtk', 'bGuard', 'bFeint', 'bPause'], vw = innerWidth, vh = innerHeight; const rs = ids.map(i => [i, document.getElementById(i).getBoundingClientRect()]);
      const cv = document.getElementById('c').getBoundingClientRect(), s = cv.width / 960, hudBottom = cv.top + 112 * s;
      const issues = [];
      for (const [i, r] of rs) { if (r.left < 0 || r.top < 0 || r.right > vw || r.bottom > vh) issues.push(i + ' hors écran'); if (r.top < hudBottom) issues.push(i + ' sur le HUD'); if (Math.min(r.width, r.height) < (i === 'bPause' ? 30 : 44)) issues.push(i + ' trop petit'); }
      for (let a = 0; a < rs.length; a++) for (let c = a + 1; c < rs.length; c++) { const A = rs[a][1], B = rs[c][1]; if (A.left < B.right && B.left < A.right && A.top < B.bottom && B.top < A.bottom) issues.push(rs[a][0] + '×' + rs[c][0]); }
      // le chrono (centre haut du canevas) n'est caché par aucun bouton
      const tx = cv.left + cv.width / 2, ty = cv.top + 40 * s; for (const [i, r] of rs) if (tx > r.left && tx < r.right && ty > r.top && ty < r.bottom) issues.push(i + ' cache le chrono');
      return { issues, sizes: Object.fromEntries(rs.map(([i, r]) => [i, Math.round(r.width)])), canvas: [Math.round(cv.width), Math.round(cv.height)] };
    });
    const [ax, ay] = await center('#bAtk'), [gx, gy] = await center('#bGuard'), [fx, fy] = await center('#bFeint');
    const z = await pg.locator('#stickZone').boundingBox(); const sx = z.x + 110, sy = z.y + z.height - 110;
    const reset = d => pg.evaluate(d => { G.p.x = 300; G.e.x = 300 + d; for (const f of [G.p, G.e]) f.reset(f.x); G.p.hp = G.e.hp = 100; G.time += 1; Input.dirs = []; Input.tap = null; }, d);
    const st = () => pg.evaluate(() => G.p.state === 'attack' ? G.p.move.kind : G.p.state === 'guard' ? 'guard' : G.p.state + (G.p.dash ? (G.p.dash.s > 0 ? '+' : '-') : ''));
    // tap attaque
    await reset(230); await touch('touchStart', [[ax, ay, 1]]); await pg.waitForTimeout(50); R.tapAtk = await st(); await touch('touchEnd', []); await pg.waitForTimeout(700);
    // stick tenu en avant + attaque (deux doigts) → fente
    await reset(330); await touch('touchStart', [[sx, sy, 0]]); await touch('touchMove', [[sx + 50, sy, 0]]); await pg.waitForTimeout(120);
    await touch('touchMove', [[sx + 50, sy, 0], [ax, ay, 1]]); await pg.waitForTimeout(50); R.avantAtk = await st(); await touch('touchMove', [[sx + 50, sy, 0]]); await pg.waitForTimeout(40); await touch('touchEnd', []); await pg.waitForTimeout(900);
    // stick arrière + garde maintenue → Quarta ; puis haut → Prima ; bas → Bassa ; garde tenue 1 s sans perte
    await reset(300); await touch('touchStart', [[sx, sy, 0]]); await touch('touchMove', [[sx - 50, sy, 0]]); await pg.waitForTimeout(60);
    await touch('touchMove', [[sx - 50, sy, 0], [gx, gy, 2]]); await pg.waitForTimeout(80); R.arriereGarde = await st();
    await touch('touchMove', [[sx, sy - 50, 0], [gx, gy, 2]]); await pg.waitForTimeout(80); R.hautGarde = await st();
    await touch('touchMove', [[sx, sy + 50, 0], [gx, gy, 2]]); await pg.waitForTimeout(80); R.basGarde = await st();
    await touch('touchMove', [[sx, sy, 0], [gx, gy, 2]]); await pg.waitForTimeout(1000); R.gardeTenue1s = await st();
    await touch('touchMove', [[sx, sy, 0]]); await pg.waitForTimeout(80); R.gardeRelachee = await st(); await touch('touchEnd', []);
    // double poussée vers l'arrière → retraite
    await reset(300); await pg.waitForTimeout(100); await touch('touchStart', [[sx, sy, 0]]); await touch('touchMove', [[sx - 50, sy, 0]]); await pg.waitForTimeout(60); await touch('touchMove', [[sx, sy, 0]]); await pg.waitForTimeout(60); await touch('touchMove', [[sx - 50, sy, 0]]); await pg.waitForTimeout(40); R.doublePoussee = await st(); await touch('touchEnd', []); await pg.waitForTimeout(400);
    // Attaque maintenue au doigt → fente lourde ; tap bref → estocade
    await reset(290); await touch('touchStart', [[ax, ay, 1]]); await pg.waitForTimeout(330); R.maintien = await st(); await touch('touchEnd', []); await pg.waitForTimeout(1300);
    await reset(230); await touch('touchStart', [[ax, ay, 1]]); await pg.waitForTimeout(60); await touch('touchEnd', []); await pg.waitForTimeout(30); R.tapBref = await st(); await pg.waitForTimeout(800);
    // rafale de 8 taps rapides : pas de double déclenchement
    await reset(600); const id0 = await pg.evaluate(() => G.p.moveId);
    for (let i = 0; i < 8; i++) { await touch('touchStart', [[ax, ay, 1]]); await pg.waitForTimeout(15); await touch('touchEnd', []); await pg.waitForTimeout(35); }
    await pg.waitForTimeout(500); R.rafale8 = (await pg.evaluate(() => G.p.moveId)) - id0;
    // en marchant (stick tenu) : tap Feinte → feinte, le doigt du stick n'est pas perdu
    await reset(400); await touch('touchStart', [[sx, sy, 0]]); await touch('touchMove', [[sx + 30, sy, 0]]); await pg.waitForTimeout(150); const x0 = await pg.evaluate(() => G.p.x);
    await touch('touchMove', [[sx + 30, sy, 0], [fx, fy, 3]]); await pg.waitForTimeout(40); R.feinteEnMarchant = await st(); await touch('touchMove', [[sx + 30, sy, 0]]); await pg.waitForTimeout(400);
    R.marcheApres = (await pg.evaluate(() => G.p.x)) - x0 > 20 ? 'avance' : 'bloqué'; await touch('touchEnd', []);
    // défilement / zoom bloqués
    R.scroll = await pg.evaluate(() => [scrollX, scrollY, visualViewport ? visualViewport.scale : 1]);
    await pg.screenshot({ path: `out/t_${dev.replace(/ /g, '_')}.png` });
    // pause
    const [px, py] = await center('#bPause'); await pg.tap('#bPause'); await pg.waitForTimeout(100); R.pause = await pg.evaluate(() => G.state);
    R.errs = errs; all.push(R); console.log(JSON.stringify(R)); await b.close();
  }
  fs.writeFileSync(__dirname + '/out/touch.json', JSON.stringify(all, null, 1));
})();
