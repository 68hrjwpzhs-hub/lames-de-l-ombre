// Playwright : celui du projet (npm i -D playwright) ou, à défaut, celui de l'environnement de développement d'origine
const fs = require('fs'), path = require('path');
const { chromium, devices } = (() => { try { return require('playwright'); } catch (e) { return require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright'); } })();
const EXE = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
exports.devices = devices;
exports.open = async (opts = {}) => {
  const b = await chromium.launch(EXE ? { executablePath: EXE } : {});
  const ctx = await b.newContext(opts.device ? { ...devices[opts.device] } : { viewport: { width: 1280, height: 720 } });
  const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message)); pg.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts/.test(m.text())) errs.push(m.text()); });
  await pg.goto('file://' + (opts.file || path.join(__dirname, '..', 'index.html'))); await pg.waitForFunction(() => typeof G !== 'undefined' && G.p && typeof V2 !== 'undefined', null, { timeout: 20000 }).catch(() => { }); await pg.waitForTimeout(600);
  if (!opts.joute) await pg.evaluate(() => { try { store.set('ct2d.joute', false); } catch (e) { } }); // la joute verbale (4.0) a ses propres tests
  return { b, ctx, pg, errs };
};
