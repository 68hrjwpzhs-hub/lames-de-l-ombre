// atelier des décors, étape 1 : chaque décor du jeu est dessiné en 1920×1080 (deux fois la définition de référence) → tools/decors/raw/*.png
// usage : node tools/decors_render.js   (il faut Playwright ; le jeu doit être construit : sh build.sh)
const { open } = require('../tests/lib'); const fs = require('fs'), path = require('path');
(async () => {
  const { b, pg, errs } = await open({ viewport: { width: 1280, height: 720 } }); await pg.waitForTimeout(800);
  const keys = await pg.evaluate(() => (window.DECOR_HD_OFF = true, VENUE_KEYS.slice()));
  for (const k of keys) {
    const data = await pg.evaluate((k) => { const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; const g = c.getContext('2d'); g.setTransform(2, 0, 0, 2, 0, 0); (VENUES[k].draw0 || VENUES[k].draw)(g); return c.toDataURL('image/png'); }, k);
    fs.writeFileSync(path.join(__dirname, 'decors', 'raw', k + '.png'), Buffer.from(data.split(',')[1], 'base64')); console.log('décor', k);
  }
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
