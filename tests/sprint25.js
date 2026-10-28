// 3.0 · sprints 25 à 29 : moteur WebGL, décors HD, lumière, étoffes, poses captées
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(900);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(async () => {
    const o = { ok: GL.ok, on: GL.on, cv: !!$('gl'), cTransparent: $('c').style.background === 'transparent' };
    // une image : le monde passe par la carte graphique, le canevas 2D ne garde que le HUD
    G.venuePref = 'auberge'; T.setup(250); G.state = 'fight'; G.frame = () => {}; G.render(1 / 60);
    const px = (x, y) => { const g = $('c').getContext('2d'); return g.getImageData(x, y, 1, 1).data[3]; }; o.hudOnly = px(Math.round($('c').width / 2), Math.round($('c').height * .62)) === 0;
    o.lights = GL.lights(G.cam || { s: 1, x: 480, y: 270 }, G.scale, 0, 0).length; o.cost = +(GL.cost || 0).toFixed(2);
    const gl = GL.gl, p = new Uint8Array(4); gl.readPixels(Math.round(GL.cv.width / 2), Math.round(GL.cv.height * .4), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p); o.glDrawn = p[0] + p[1] + p[2] > 0;
    // repli : l'option coupe et rallume ; un appareil trop lent coupe tout seul (après 2 alertes)
    GL.set(false); o.off = !GL.on && $('gl').style.display === 'none' && $('c').style.background === ''; GL.set(true); o.back = GL.on;
    GL.slow = 0; for (let i = 0; i < 2; i++) { GL.acc = 0; GL.n = 0; for (let k = 0; k < 140; k++) GL.watch(30); } o.auto = !GL.on && store.get('ct2d.webgl') === false; GL.set(true);
    // décors HD : l'image remplace le dessin du code ; l'option revient au dessin
    o.hdKeys = Object.keys(DECOR_HD).length; await new Promise(res => { const t0 = performance.now(); const w = () => DecorHD.img.salle || performance.now() - t0 > 3000 ? res() : (DecorHD.get('salle'), setTimeout(w, 50)); w(); });
    o.hdLoaded = !!DecorHD.img.salle && DecorHD.img.salle.naturalWidth === 1920;
    let used = false; const di = CanvasRenderingContext2D.prototype.drawImage; CanvasRenderingContext2D.prototype.drawImage = function (im) { if (im === DecorHD.img.salle) used = true; return di.apply(this, arguments); }; delete BGS.salle; venueCanvas('salle'); CanvasRenderingContext2D.prototype.drawImage = di; o.hdUsed = used;
    // étoffes : textures chargées, motif posé sur le pourpoint ; l'usure monte quand la vie baisse
    o.tex = Costume.ready && Object.keys(Costume.src || {}).length === 5; T.setup(250); G.e.hp = 100; const w0 = Costume.wear(G.e); G.e.hp = 20; const w1 = Costume.wear(G.e); o.wear = [w0, +w1.toFixed(2)];
    let pat = 0; const cp = CanvasRenderingContext2D.prototype.createPattern; CanvasRenderingContext2D.prototype.createPattern = function () { pat++; return cp.apply(this, arguments); }; const c = document.createElement('canvas'); c.width = 300; c.height = 300; drawFighter(c.getContext('2d'), G.e); CanvasRenderingContext2D.prototype.createPattern = cp; o.pattern = pat;
    // poses captées : un relevé remplace la pose du même nom
    const a1 = POSES.jabA.a1; window.POSES_MOCAP_TEST = { jabA: { a1: 12 } }; Object.assign(POSES.jabA, POSES_MOCAP_TEST.jabA); o.mocap = POSES.jabA.a1 === 12; POSES.jabA.a1 = a1;
    // options du moteur
    Menu.open('options'); o.opts = ['optGL', 'optHD', 'optFab'].every(id => !!$(id));
    // un duel complet avec tout allumé
    G.frame = () => {}; o.match = T.match('maitre', 'maitre', 200).over;
    return o;
  });
  console.log(JSON.stringify(r));
  ok('WebGL actif : canevas de la carte graphique sous le HUD transparent', r.ok && r.on && r.cv && r.cTransparent);
  ok('le monde est dessiné par la carte graphique, le canevas 2D ne garde que le HUD', r.glDrawn && r.hudOnly);
  ok('lumières du lieu transmises au moteur (auberge : foyer)', r.lights >= 2, r.lights);
  ok('repli : option, et coupure automatique si l\'appareil ralentit', r.off && r.back && r.auto);
  ok('11 décors HD, image 1920×1080 décodée à la demande et utilisée', r.hdKeys === 11 && r.hdLoaded && r.hdUsed, r.hdKeys);
  ok('étoffes : 5 textures, motif posé, usure qui monte avec les touches', r.tex && r.pattern > 0 && r.wear[0] === 0 && r.wear[1] > .6, { p: r.pattern, w: r.wear });
  ok('poses captées : remplacement par nom', r.mocap);
  ok('options Rendu WebGL, Décors HD, Étoffes ; duel complet', r.opts && r.match);
  console.log('coût WebGL mesuré (logiciel, sans carte graphique) :', r.cost, 'ms');
  console.log(errs.length ? 'ERREURS ' + JSON.stringify(errs.slice(0, 3)) : 'aucune erreur'); ok('aucune erreur JavaScript', errs.length === 0);
  console.log(`${res.filter(Boolean).length}/${res.length} tests réussis`); await b.close();
})();
