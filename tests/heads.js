const { open } = require('./lib');
(async () => {
  const { b, pg, errs } = await open(); await pg.setViewportSize({ width: 1400, height: 500 });
  const url = await pg.evaluate(() => {
    const S = document.createElement('canvas'); S.width = 1400; S.height = 420; const g = S.getContext('2d'); g.fillStyle = '#4e4048'; g.fillRect(0, 0, 1400, 420);
    const defs = [{ style: 'renaissance', body: 'h', hairStyle: 'court', beard: 'pointed' }, { style: 'dame', body: 'f', hairStyle: 'chignon' }, { style: 'rodeur', body: 'f', hairStyle: 'long' }, { style: 'moine', body: 'h', hairStyle: 'tonsure', beard: 'full' }, { style: 'paysan', body: 'f', hairStyle: 'queue', hatType: 'aucun' }, { style: 'renaissance', body: 'h', hairStyle: 'long', beard: 'moustache', hatType: 'beret', plume: '#b2302a' }];
    defs.forEach((d, i) => { const L = lookFromAvatar(Object.assign({}, STYLE_PRESETS[d.style], d)); const f = new Fighter(true, L); f.opp = { x: 5000, state: 'idle' }; f.x = 0; f.dir = 1; f.pose = Object.assign({}, POSES.g_ext); f.feet.f.x = 36; f.feet.b.x = -34; f.J = f.joints();
      g.save(); g.translate(i * 230 + 60, 0); g.scale(3.2, 3.2); g.translate(-f.J.head[0] + 22, -f.J.head[1] + 50); drawFighter(g, f); g.restore(); });
    return S.toDataURL();
  });
  require('fs').writeFileSync('out/heads.png', Buffer.from(url.split(',')[1], 'base64')); console.log(errs); await b.close();
})();
