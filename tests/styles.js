const { open } = require('./lib');
(async () => {
  const { b, pg, errs } = await open(); await pg.setViewportSize({ width: 1500, height: 900 });
  const url = await pg.evaluate(() => {
    G.frame = () => {};
    const items = [];
    for (const st of Object.keys(STYLE_PRESETS)) for (const body of ['h', 'f']) items.push(lookFromAvatar(Object.assign({}, STYLE_PRESETS[st], { style: st, body, hairStyle: body === 'f' ? (st === 'dame' ? 'chignon' : 'long') : st === 'moine' ? 'tonsure' : 'court', beard: st === 'moine' ? 'full' : 'pointed', name: st + body })));
    const cw = 300, ch = 300, cols = 5, S = document.createElement('canvas'); S.width = cw * cols; S.height = ch * 2; const g = S.getContext('2d'); g.fillStyle = '#4e4048'; g.fillRect(0, 0, S.width, S.height);
    items.forEach((L, i) => { const f = new Fighter(true, L); f.opp = { x: 5000, state: 'idle' }; f.x = 0; f.dir = 1; f.pose = Object.assign({}, POSES[i % 3 === 0 ? 'g_ext' : i % 3 === 1 ? 'jabA' : 'fenteA']);
      f.feet.f.x = f.pose.ff; f.feet.b.x = f.pose.bf; f.updateFeet(0); f.J = f.joints();
      const c = i % 2 === 0 ? Math.floor(i / 2) : Math.floor(i / 2), r = i % 2;
      g.save(); g.translate(c * cw + 70, r * ch - GROUND + 285); g.scale(1.05, 1.05); drawFighter(g, f); g.restore(); g.fillStyle = '#fff'; g.font = '15px sans-serif'; g.fillText(L.name, c * cw + 8, r * ch + 18); });
    return S.toDataURL();
  });
  require('fs').writeFileSync('out/styles.png', Buffer.from(url.split(',')[1], 'base64')); console.log(errs); await b.close();
})();
