const { open } = require('./lib');
(async () => {
  const { b, pg, errs } = await open();
  await pg.setViewportSize({ width: 1600, height: 1000 });
  const names = process.argv[2] ? process.argv[2].split(',') : ['g_ext','g_haute','g_int','g_basse','jabW','jabA','fenteW','fenteA','bassaW','bassaA','dgDip','dgW','dgA','cR','cW','cA','cmT','cmDip','hWind','hMid','hEnd','feintJab','parried','broken'];
  await pg.evaluate((names) => {
    G.state = 'gallery'; G.frame = () => {}; const cols = 6, cw = 320, ch = 300, rows = Math.ceil(names.length / cols);
    const c = document.getElementById('c'); c.width = cols * cw; c.height = rows * ch; c.style.width = c.width / 1.2 + 'px'; c.style.height = c.height / 1.2 + 'px';
    const g = c.getContext('2d'); g.fillStyle = '#4a3a40'; g.fillRect(0, 0, c.width, c.height);
    names.forEach((n, i) => {
      const f = new Fighter(true, LOOKS.player); f.opp = { x: 2000 }; f.x = 80; f.dir = 1; f.pose = Object.assign({}, POSES[n]);
      f.feet.f.x = f.x + f.pose.ff; f.feet.b.x = f.x + f.pose.bf; f.updateFeet(0); f.J = f.joints();
      g.save(); g.translate((i % cols) * cw, Math.floor(i / cols) * ch - 200); g.strokeStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.moveTo(0, GROUND); g.lineTo(cw, GROUND); g.stroke();
      drawFighter(g, f); g.fillStyle = '#fff'; g.font = '18px sans-serif'; g.fillText(n, 10, 230); g.restore();
    });
    document.querySelectorAll('.screen').forEach(s => s.hidden = true);
  }, names);
  await pg.waitForTimeout(200); await pg.locator('#c').screenshot({ path: 'out/gallery.png' });
  console.log(errs); await b.close();
})();
