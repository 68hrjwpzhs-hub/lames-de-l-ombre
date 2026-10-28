const { chromium } = require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await (await b.newContext({ viewport: { width: 1200, height: 600 } })).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await pg.goto('http://127.0.0.1:8765/' + (process.argv[2] || 'peek.html')); await pg.waitForFunction(() => window.done, null, { timeout: 60000 }).catch(e => errs.push('timeout'));
  await pg.screenshot({ path: __dirname + '/out/' + (process.argv[3] || 'peek') + '.png' }); console.log(errs.join('\n')); await b.close(); })();
