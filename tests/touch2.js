const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  await pg.tap('#go'); await pg.waitForFunction('G.state==="fight"', null, { timeout: 6000 });
  const r = await pg.evaluate(async () => {
    G.ai.think = () => { G.e.intent.dx = 0; }; Input.apply = Input._apply; T.inputOn = true; G.p.x = 300; G.e.x = 700;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const ev = (el, type, id, x, y) => el.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, bubbles: true, cancelable: true, isPrimary: id === 5 }));
    const zone = $('stickZone'), zr = zone.getBoundingClientRect(), sx = zr.left + 110, sy = zr.bottom - 100;
    const c = id => { const q = $(id).getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; };
    const out = {};
    ev(zone, 'pointerdown', 5, sx, sy); ev(zone, 'pointermove', 5, sx - 50, sy); await wait(80);
    const [gx, gy] = c('bGuard'); ev($('bGuard'), 'pointerdown', 6, gx, gy); await wait(100); out.garde = G.p.state + ':' + G.p.gline;
    ev($('bGuard'), 'pointerup', 6, gx, gy); await wait(100); out.apresRelachement = G.p.state; out.stickToujoursTenu = Input.stick.id === 5;
    ev(zone, 'pointermove', 5, sx + 50, sy); await wait(150); const x0 = G.p.x;
    const [fx, fy] = c('bFeint'); ev($('bFeint'), 'pointerdown', 7, fx, fy); await wait(30); out.feinte = G.p.state; ev($('bFeint'), 'pointerup', 7, fx, fy);
    await wait(500); out.avanceApresFeinte = Math.round(G.p.x - x0);
    // appui long sur Attaque : une seule attaque
    const id0 = G.p.moveId; const [ax, ay] = c('bAtk'); ev($('bAtk'), 'pointerdown', 8, ax, ay); await wait(900); out.appuiLongAttaques = G.p.moveId - id0; ev($('bAtk'), 'pointerup', 8, ax, ay);
    // stick vers l'avant + tap Attaque (deux doigts) → fente ; même chose maintenue → fente lourde
    await wait(900); G.p.x = 300; G.e.x = 620; G.p.reset(300); G.e.reset(620); ev(zone, 'pointermove', 5, sx + 50, sy); await wait(60);
    ev($('bAtk'), 'pointerdown', 10, ax, ay); await wait(60); ev($('bAtk'), 'pointerup', 10, ax, ay); await wait(40); out.avantTap = G.p.move ? G.p.move.kind : G.p.state;
    await wait(1200); G.p.x = 300; G.e.x = 600; ev(zone, 'pointermove', 5, sx, sy); await wait(30);
    ev($('bAtk'), 'pointerdown', 11, ax, ay); await wait(320); out.maintenu = G.p.move ? G.p.move.kind : G.p.state; ev($('bAtk'), 'pointerup', 11, ax, ay);
    // perte de capture (notification iOS, etc.) : la garde se relâche proprement
    ev($('bGuard'), 'pointerdown', 9, gx, gy); await wait(60); $('bGuard').dispatchEvent(new PointerEvent('lostpointercapture', { pointerId: 9, bubbles: true })); await wait(60); out.garderPerdueRelachee = Input.btn.guard === false;
    ev(zone, 'pointerup', 5, sx + 50, sy); await wait(50); out.stickRelache = Input.stick.id === null;
    return out;
  });
  console.log(JSON.stringify(r), errs); await pg.screenshot({ path: 'out/t_iphone13_v2.png' }); await b.close();
})();
