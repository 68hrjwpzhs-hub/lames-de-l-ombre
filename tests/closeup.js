const { open } = require('./lib');
(async () => {
  const { b, pg, errs } = await open(); await pg.setViewportSize({ width: 1400, height: 800 });
  const url = await pg.evaluate((args) => {
    G.frame = () => {};
    const S = document.createElement('canvas'); S.width = 1400; S.height = 760; const g = S.getContext('2d'); g.fillStyle = '#5a4a50'; g.fillRect(0, 0, 1400, 760);
    const items = [['player', 'g_ext', 1], ['duelliste', 'fenteA', -1], ['maitre', 'g_haute', 1], ['debutant', 'jabA', -1]];
    items.forEach(([lk, pose, dir], i) => {
      const f = new Fighter(true, LOOKS[lk]); f.opp = { x: dir > 0 ? 5000 : -5000 }; f.x = 0; f.dir = dir; f.pose = Object.assign({}, POSES[pose]);
      f.feet.f.x = f.pose.ff * dir; f.feet.b.x = f.pose.bf * dir; f.updateFeet(0); f.J = f.joints();
      g.save(); g.translate(i < 2 ? (i === 0 ? 200 : 600) : (i === 2 ? 900 : 1250), 0); g.scale(i < 2 ? 2.2 : 1.6, i < 2 ? 2.2 : 1.6); g.translate(0, -GROUND + (i < 2 ? 340 : 470)); drawFighter(g, f); g.restore();
    });
    return S.toDataURL();
  });
  require('fs').writeFileSync('out/closeup.png', Buffer.from(url.split(',')[1], 'base64')); console.log(errs); await b.close();
})();
