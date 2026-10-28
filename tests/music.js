const { chromium } = require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
  const pg = await b.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file:///home/claude/ct2d/index.html'); await pg.waitForTimeout(400);
  await pg.mouse.click(5, 5); await pg.evaluate(() => Snd.init());
  const rms = async (ms) => pg.evaluate(ms => new Promise(res => { const c = Snd.ctx, an = c.createAnalyser(); an.fftSize = 2048; Music.bus.connect(an); const buf = new Float32Array(2048); let s = 0, n = 0;
    const iv = setInterval(() => { an.getFloatTimeDomainData(buf); for (const v of buf) { s += v * v; n++; } }, 50); setTimeout(() => { clearInterval(iv); res({ track: Music.track, rms: +Math.sqrt(s / n).toFixed(4), state: c.state }); }, ms); }), ms);
  await pg.waitForTimeout(1500); const menu = await rms(3000);
  await pg.evaluate(() => { G.level = 'duelliste'; G.startMatch(); }); await pg.waitForTimeout(1500); const combat = await rms(3000);
  await pg.evaluate(() => { G.round = 3; G.p.hp = 20; }); await pg.waitForTimeout(800); const intense = { ...(await rms(2000)), intensity: await pg.evaluate(() => Music.intensity) };
  await pg.evaluate(() => Music.play('victoire')); await pg.waitForTimeout(1200); const vic = await rms(1500);
  await pg.waitForTimeout(3500); const back = await pg.evaluate(() => Music.track);
  await pg.evaluate(() => { CFG.music = false; }); await pg.waitForTimeout(500); const off = await pg.evaluate(() => [Music.track, !!Music.bus]);
  console.log(JSON.stringify({ menu, combat, intense, vic, apresVictoire: back, coupee: off, errs })); await b.close();
})();
