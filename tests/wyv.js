const { chromium } = require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto('http://127.0.0.1:8765/test3d.html'); await pg.waitForFunction(() => window.R3D && R3D.bodiesReady, null, { timeout: 60000 });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  await pg.evaluate(() => { T.setup(235); G.venue = process_v = 'cloitre'; G.state = 'fight'; G.render(1 / 60); });
  await pg.waitForFunction(() => R3D.venue === 'cloitre', null, { timeout: 60000 }); await pg.waitForTimeout(500);
  await pg.evaluate(() => { window.R3D_DEBUGCAM = cam => { cam.position.set(0, 1.5, 8); cam.clearViewOffset(); cam.fov = 60; cam.updateProjectionMatrix(); cam.lookAt(0, 7, -16); }; R3D.t = 3; G.render(1 / 60); });
  await pg.screenshot({ path: __dirname + '/out/wyv.png', timeout: 180000 }); await b.close(); })();
