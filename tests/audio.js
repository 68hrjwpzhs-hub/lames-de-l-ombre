// enregistre des extraits sonores (musique, bruitages, fonds) depuis le jeu, en temps réel, et mesure leur niveau
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright'); const fs = require('fs');
const clips = (process.argv[2] || 'menu:40,combat:24,tendu:20,victoire:9,eglise:16,nuit:14').split(',');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
  const pg = await (await b.newContext()).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await pg.goto('file:///home/claude/ct2d/index.html'); await pg.waitForTimeout(800);
  await pg.evaluate(() => { Snd.init(); CFG.music = true; CFG.sfx = true; G.silent = false; const c = Snd.ctx; window.__dst = c.createMediaStreamDestination(); Snd.master.connect(window.__dst); });
  for (const cl of clips) { const [name, sec] = cl.split(':');
    await pg.evaluate(name => { Music.tension0 = Music.tension0 || Music.tension;
      if (name === 'menu' || name === 'menuseul') { G.toMenu(); Music.play('menu'); Music.tension = Music.tension0; CFG.sfx = name !== 'menuseul'; }
      else { G.level = 'duelliste'; G.venuePref = name === 'eglise' ? 'eglise' : name === 'nuit' ? 'nuit' : 'salle'; G.startMatch(); G.weather = 'clear'; G.state = 'fight'; G.banner = null; if (name === 'eglise' || name === 'nuit') G.venue = name; else G.venue = 'salle';
        Music.tension = name === 'tendu' ? () => .9 : name === 'combat' ? () => .3 : Music.tension0; if (name === 'victoire') { G.state = 'over'; Music.play('victoire'); } else Music.play('combat'); }
      const rec = new MediaRecorder(window.__dst.stream, { mimeType: 'audio/webm' }); window.__chunks = []; rec.ondataavailable = e => window.__chunks.push(e.data); rec.start(); window.__rec = rec; }, name);
    await pg.waitForTimeout(+sec * 1000);
    const b64 = await pg.evaluate(() => new Promise(ok => { window.__rec.onstop = async () => { const bl = new Blob(window.__chunks); const ab = await bl.arrayBuffer(); let s = ''; const u = new Uint8Array(ab); for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); ok(btoa(s)); }; window.__rec.stop(); }));
    fs.writeFileSync(`${__dirname}/out/son_${name}.webm`, Buffer.from(b64, 'base64')); console.log(name, 'ok');
  }
  console.log('errs', errs); await b.close();
})();
