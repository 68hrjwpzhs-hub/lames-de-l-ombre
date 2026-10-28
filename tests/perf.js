const { open } = require('./lib');
(async () => {
  const { b, ctx, pg, errs } = await open({ device: 'iPhone 13 landscape' });
  const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await pg.tap('#go'); await pg.waitForFunction('G.state==="fight"', null, { timeout: 8000 });
  const r = await pg.evaluate(() => new Promise(res => { const ts = []; const of = G.render.bind(G), os = G.step.bind(G); let st = 0, rt = 0, n = 0;
    G.step = dt => { const t = performance.now(); os(dt); st += performance.now() - t; }; G.render = x => { const t = performance.now(); of(x); rt += performance.now() - t; n++; };
    let last = performance.now(); const loop = now => { ts.push(now - last); last = now; if (ts.length < 300) requestAnimationFrame(loop); else res({ frames: n, avgFrame: (ts.reduce((a, b) => a + b) / ts.length).toFixed(1), p95: ts.slice().sort((a, b) => a - b)[Math.floor(ts.length * .95)].toFixed(1), renderMs: (rt / n).toFixed(2), stepMsPerFrame: (st / n).toFixed(2) }); }; requestAnimationFrame(loop); }));
  console.log('CPU ×4', JSON.stringify(r), errs); await b.close();
})();
