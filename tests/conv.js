// conversion FBX (Mixamo) -> glTF JSON dans Chromium
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const pg = await (await b.newContext()).newPage(); pg.on('pageerror', e => console.log('ERR', e.message)); pg.on('console', m => m.type() === 'error' && console.log('CERR', m.text().slice(0, 200)));
  await pg.goto('http://127.0.0.1:8765/conv.html'); await pg.waitForFunction(() => window.ready);
  for (const n of process.argv.slice(2)) { const info = await pg.evaluate(([n, k, t]) => window.convert(n, +t, k), [n, process.env.KEEP || null, process.env.TEX || 1024]); console.log(n, JSON.stringify(info)); const s = await pg.evaluate(() => window.out); fs.writeFileSync(`/home/claude/three3d/pub/models/mx_${n}${process.env.SUF || ''}.json`, s); }
  await b.close(); })();
