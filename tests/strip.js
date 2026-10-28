// planches d'images : chaque ligne = un coup, 8 vignettes réparties sur sa durée
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open(); await pg.setViewportSize({ width: 960, height: 540 });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const rows = JSON.parse(process.argv[2] || '[["jab",230,null],["fente",320,null],["bassa",230,"haute"],["degage",230,"ext"],["circ",230,"basse"],["compo",230,"ext"],["heavy",290,"ext"]]');
  const url = await pg.evaluate((rows) => {
    const cw = 300, ch = 230, cols = 8, S = document.createElement('canvas'); S.width = cw * cols; S.height = ch * rows.length; const sg = S.getContext('2d');
    G.frame = () => {}; document.querySelectorAll('.screen').forEach(s => s.hidden = true);
    rows.forEach(([k, d, gl], r) => {
      T.setup(d); if (gl) T.holdGuard(G.e, gl); G.p.intent.act = k === 'walk' || k === 'dashF' || k === 'dashB' ? null : k; T.stepN(1);
      const total = k === 'walk' ? 100 : k.startsWith('dash') ? 40 : Math.round(((G.p.move ? G.p.move.wu + G.p.move.act + G.p.move.rec : .3) + .1) * 120);
      if (k === 'dashF') G.p.intent.dash = 1; if (k === 'dashB') G.p.intent.dash = -1;
      for (let c = 0; c < cols; c++) {
        const target = Math.round(c * total / (cols - 1));
        while ((T._f || 0) < target) { if (k === 'walk') G.p.intent.dx = 1; T.stepN(1); T._f = (T._f || 0) + 1; }
        G.render(0); const sc = G.scale; const cx = (G.p.x + G.e.x) / 2;
        sg.drawImage(G.cv, (cx - 260) * sc, (GROUND - 300) * sc, 520 * sc, 398 * sc, c * cw, r * ch, cw, ch);
        sg.fillStyle = '#fff'; sg.font = '14px sans-serif'; sg.fillText(`${k} ${(target / 120).toFixed(2)}s ${G.p.state}`, c * cw + 6, r * ch + 16);
      }
      T._f = 0;
    });
    return S.toDataURL('image/png');
  }, rows);
  fs.writeFileSync(__dirname + '/out/' + (process.argv[3] || 'strip') + '.png', Buffer.from(url.split(',')[1], 'base64'));
  console.log(errs); await b.close();
})();
