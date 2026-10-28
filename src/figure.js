
// =============================== personnages : volumes ombrés ===============================
// Chaque membre est une forme galbée (largeur variable, renflement de muscle ou de manche bouffante),
// ombrée par un dégradé selon une lumière venant d'en haut à gauche, puis cernée d'un trait sombre léger.
const LIGHT = [-.55, -.83];
// encre de BD : contours à trait d'encre, ombres en aplats
const ART = 'cinema'; // 'cinema' : rendu peint de film · 'bd' : encrage de bande dessinée
const INK = ART === 'bd' ? 'rgba(22,13,10,.9)' : 'rgba(34,20,16,.3)'; let INKW = ART === 'bd' ? 1.3 : .9; // direction vers la lumière principale (le rendu peint la règle selon le décor)
const _shade = new Map();
const RIM = { col: '#fff', a: 0, gy: 0, pat: null }; // rendu direct : contre-jour, hauteur du bassin (ombre du bas du corps), motif de touches peintes // contre-jour du rendu direct (0 : inactif)
// teinte d'ambiance d'un lieu appliquée à toutes les couleurs d'une tenue (rendu direct), calculée une fois par tenue et par lieu
const _tint = new WeakMap();
function tintLook(L, T) {
  if (!T) return L; let m = _tint.get(L); if (!m) { m = {}; _tint.set(L, m); } if (m[T.key]) return m[T.key];
  const o = {}; for (const k in L) { const v = L[k]; o[k] = typeof v === 'string' && /^#[0-9a-f]{3,6}$/i.test(v) && k !== 'name' ? mixRGB(v, T.rgb, T.mix, T.dark) : v; } m[T.key] = o; return o;
}
function mixRGB(hex, rgb, k, dark) { let h = hex.slice(1); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const c = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); const r = c.map((v, i) => Math.round((v + (rgb[i] - v) * k) * (1 - dark))); return '#' + r.map(v => clamp(v, 0, 255).toString(16).padStart(2, '0')).join(''); }
function shade(hex, k) {
  k = Math.round(k * 50) / 50; // paliers de 2 % : invisible à l'œil, et le cache ne grossit plus sans fin
  let mp = _shade.get(hex); if (!mp) { mp = new Map(); _shade.set(hex, mp); } let v = mp.get(k); if (v) return v; // cache à deux niveaux : aucune chaîne créée par appel
  let r, g, b;
  if (hex[0] === '#') { let h = hex.slice(1); if (h.length === 3) h = h.split('').map(c => c + c).join(''); r = parseInt(h.slice(0, 2), 16); g = parseInt(h.slice(2, 4), 16); b = parseInt(h.slice(4, 6), 16); }
  else { const m = hex.match(/[\d.]+/g).map(Number); [r, g, b] = m; }
  if (k >= 0) { r += (255 - r) * k; g += (244 - g) * k; b += (228 - b) * k; } else { r += (18 - r) * -k; g += (12 - g) * -k; b += (20 - b) * -k; }
  v = `rgb(${r | 0},${g | 0},${b | 0})`; mp.set(k, v); return v;
}
// membre effilé : de a (largeur wa) à b (largeur wb), renflements bf/bb de chaque côté au point t
// modelé pictural : lumière, demi-teinte, ombre propre, reflet ; o.mat : 'cuir' (reflet spéculaire), o.folds : plis aux articulations
function limb(g, a, b, wa, wb, col, o = {}) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const t = o.t ?? .45, mx = a[0] + dx * t, my = a[1] + dy * t, wm = lerp(wa, wb, t) / 2;
  const bf = (o.bf || 0), bb = (o.bb || 0), th = Math.atan2(ny, nx);
  g.beginPath();
  g.moveTo(a[0] + nx * wa / 2, a[1] + ny * wa / 2);
  g.quadraticCurveTo(mx + nx * (wm + bf) * 1.1, my + ny * (wm + bf) * 1.1, b[0] + nx * wb / 2, b[1] + ny * wb / 2);
  g.arc(b[0], b[1], wb / 2, th, th - Math.PI, true);
  g.quadraticCurveTo(mx - nx * (wm + bb) * 1.1, my - ny * (wm + bb) * 1.1, a[0] - nx * wa / 2, a[1] - ny * wa / 2);
  g.arc(a[0], a[1], wa / 2, th + Math.PI, th, true);
  g.closePath();
  const W = Math.max(wa, wb) / 2 + Math.max(bf, bb), nl = nx * LIGHT[0] + ny * LIGHT[1], s = nl >= 0 ? 1 : -1, m = .4 + .6 * Math.min(1, Math.abs(nl) * 1.3);
  const gr = g.createLinearGradient(mx + nx * W * s, my + ny * W * s, mx - nx * W * s, my - ny * W * s); // du côté éclairé vers l'ombre
  if (RIM.gy) { const dk = Math.round(clamp((my - RIM.gy) / 110, 0, 1) * 10) * .02; if (dk > .02) col = shade(col, -dk); } // paliers : le cache des teintes reste petit // le bas du corps reçoit moins de lumière
  const Lc = shade(col, .24 * m), Dc = shade(col, -.46 * m); // trois tons francs : lumière, ton local, ombre (et un reflet au bord)
  if (ART === 'bd') { gr.addColorStop(0, Lc); gr.addColorStop(.3, Lc); gr.addColorStop(.31, col); gr.addColorStop(.6, col); gr.addColorStop(.61, Dc); gr.addColorStop(.9, Dc); gr.addColorStop(1, shade(col, -.3 * m)); }
  else { gr.addColorStop(0, shade(col, .3 * m)); gr.addColorStop(.22, shade(col, .1 * m)); gr.addColorStop(.5, col); gr.addColorStop(.8, shade(col, -.5 * m)); gr.addColorStop(1, shade(col, -.26 * m)); } // modelé continu, lumière de cinéma
  g.fillStyle = gr; g.fill();
  if (RIM.pat && W > 3.5) { g.fillStyle = RIM.pat; g.fill(); } // touches de pinceau (texture peinte calculée une fois)
  if (o.line !== false) { g.strokeStyle = INK; g.lineWidth = INKW; g.stroke(); }
  if (RIM.a > 0) { // contre-jour du rendu direct : liseré clair sur le bord tourné vers la lumière (remplace la passe de composition)
    const e = s, ew = (e > 0 ? bf : bb); g.strokeStyle = RIM.col; g.globalAlpha = RIM.a * (.35 + .65 * Math.min(1, Math.abs(nl) * 1.5)); g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(a[0] + nx * wa / 2 * e, a[1] + ny * wa / 2 * e); g.quadraticCurveTo(mx + nx * (wm + ew) * 1.1 * e, my + ny * (wm + ew) * 1.1 * e, b[0] + nx * wb / 2 * e, b[1] + ny * wb / 2 * e); g.stroke(); g.globalAlpha = 1;
  }
  if (o.mat === 'cuir') { // reflet spéculaire étroit, le long du côté éclairé
    g.strokeStyle = `rgba(255,246,226,${.22 * m})`; g.lineWidth = 1.4; g.lineCap = 'round'; const k = .28 * s;
    g.beginPath(); g.moveTo(lerp(a[0], b[0], .12) + nx * wa * k, lerp(a[1], b[1], .12) + ny * wa * k); g.quadraticCurveTo(mx + nx * (wm + (s > 0 ? bf : bb)) * 2 * k, my + ny * (wm + (s > 0 ? bf : bb)) * 2 * k, lerp(a[0], b[0], .88) + nx * wb * k, lerp(a[1], b[1], .88) + ny * wb * k); g.stroke(); g.lineCap = 'butt';
  }
  if (o.folds) { // plis de tissu : creux sombres et arêtes claires, plus serrés vers l'articulation
    for (let i = 0; i < o.folds; i++) {
      const u = .55 + i * .4 / o.folds, w = lerp(wa, wb, u) / 2, px = a[0] + dx * u, py = a[1] + dy * u, cv = (i % 2 ? 1 : -1) * 3;
      g.strokeStyle = shade(col, -.55); g.globalAlpha = .38; g.lineWidth = 1.1;
      g.beginPath(); g.moveTo(px + nx * w * .85, py + ny * w * .85); g.quadraticCurveTo(px + ux * cv, py + uy * cv, px - nx * w * .6 - ux * 2, py - ny * w * .6 - uy * 2); g.stroke();
      g.strokeStyle = shade(col, .35); g.globalAlpha = .25; g.beginPath(); g.moveTo(px + nx * w * .8 - ux * 1.6, py + ny * w * .8 - uy * 1.6); g.quadraticCurveTo(px + ux * (cv - 1.6), py + uy * (cv - 1.6), px - nx * w * .4 - ux * 3.4, py - ny * w * .4 - uy * 3.4); g.stroke();
      g.globalAlpha = 1;
    }
  }
}
// côté « arrière » du membre (pour le mollet) : +1 si la normale +n pointe vers l'arrière du combattant
const backSide = (a, b, d) => { const dx = b[0] - a[0], dy = b[1] - a[1]; return (-dy) * d < 0 ? 1 : -1; };
// chausses bouffantes à crevés (pumpkin hose) sur le haut de la cuisse
function drawHose(g, L, leg, C) {
  const { hip, knee } = leg, e = [lerp(hip[0], knee[0], .5), lerp(hip[1], knee[1], .5)];
  limb(g, hip, e, 25, 19, C(L.hose), { bf: 3, bb: 3, t: .5 });
  const dx = e[0] - hip[0], dy = e[1] - hip[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  g.strokeStyle = C(L.trim); g.lineWidth = 1.6; g.globalAlpha = .7;
  for (const k of [-.55, -.15, .25, .62]) { g.beginPath(); g.moveTo(hip[0] + nx * k * 22, hip[1] + ny * k * 22); g.quadraticCurveTo(lerp(hip[0], e[0], .5) + nx * k * 28, lerp(hip[1], e[1], .5) + ny * k * 28, e[0] + nx * k * 18, e[1] + ny * k * 18); g.stroke(); }
  g.globalAlpha = 1;
}
function drawHand(g, wr, ang, col, C, claws) {
  g.save(); g.translate(wr[0], wr[1]); g.rotate(ang);
  g.fillStyle = C(col); g.beginPath(); g.ellipse(1, 0, 6.5, 5, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = INKW; g.stroke();
  if (claws) { g.strokeStyle = C('#e8e0c8'); g.lineWidth = 1.6; g.lineCap = 'round'; for (const k of [-3, 0, 3]) { g.beginPath(); g.moveTo(6, k); g.quadraticCurveTo(11, k - .5, 12.5, k + 2.5); g.stroke(); } g.lineCap = 'butt'; }
  g.fillStyle = C(shade(col, -.25)); g.beginPath(); g.ellipse(3, 2.5, 3, 2, .4, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = .8; g.stroke(); // pouce
  g.strokeStyle = 'rgba(22,13,10,.6)'; g.lineWidth = .7; for (const k of [-2.6, -.6, 1.4]) { g.beginPath(); g.moveTo(3.5, k); g.quadraticCurveTo(6.8, k + .4, 6.6, k + 1.6); g.stroke(); } // doigts repliés sur la poignée
  g.restore();
}
function drawRapier(g, f, j, L, C) {
  const bx = j.tip[0] - j.wr[0], by = j.tip[1] - j.wr[1], bl = Math.hypot(bx, by) || 1, ux = bx / bl, uy = by / bl, nx = -uy, ny = ux, d = f.dir;
  if (f.disarmed) return Math.atan2(uy, ux); // rapière lâchée au coup de grâce (dessinée à part, au sol)
  const base = [j.wr[0] + ux * 6, j.wr[1] + uy * 6];
  // lame : large au talon, fine à la pointe, arête claire
  // acier : reflet qui glisse le long de la lame quand elle change d'angle
  const ang = Math.atan2(uy, ux), gp = clamp(.5 + .38 * Math.sin(ang * 2.6 + (f.isPlayer ? 0 : 1.3)), .08, .92), sg = g.createLinearGradient(base[0], base[1], j.tip[0], j.tip[1]);
  sg.addColorStop(0, '#59626e'); sg.addColorStop(Math.max(0, gp - .14), '#7c8896'); sg.addColorStop(gp, '#f4f8ff'); sg.addColorStop(Math.min(1, gp + .14), '#7c8896'); sg.addColorStop(1, '#4e5662');
  g.fillStyle = sg; g.beginPath(); g.moveTo(base[0] + nx * 2, base[1] + ny * 2); g.lineTo(j.tip[0] + nx * .5, j.tip[1] + ny * .5); g.lineTo(j.tip[0] - nx * .5, j.tip[1] - ny * .5); g.lineTo(base[0] - nx * 2, base[1] - ny * 2); g.closePath(); g.fill();
  g.strokeStyle = (f.rapier && f.rapier.blade) || L.blade; g.lineWidth = 1.1; g.beginPath(); g.moveTo(base[0], base[1]); g.lineTo(j.tip[0], j.tip[1]); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = .8; g.beginPath(); g.moveTo(base[0] + ux * 10 + nx, base[1] + uy * 10 + ny); g.lineTo(lerp(base[0], j.tip[0], .55) + nx * .6, lerp(base[1], j.tip[1], .55) + ny * .6); g.stroke();
  // garde : quillons, anneau, arc de jointure, pommeau
  const R = f.rapier, trim = C(R ? R.hilt : L.trim), q = [j.wr[0] + ux * 4, j.wr[1] + uy * 4];
  g.strokeStyle = trim; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(q[0] + nx * 13, q[1] + ny * 13); g.quadraticCurveTo(q[0] + nx * 6 + ux * 2, q[1] + ny * 6 + uy * 2, q[0], q[1]); g.quadraticCurveTo(q[0] - nx * 6 - ux * 2, q[1] - ny * 6 - uy * 2, q[0] - nx * 13 - ux * 3, q[1] - ny * 13 - uy * 3); g.stroke();
  g.lineWidth = 2; g.beginPath(); g.ellipse(q[0] + ux * 4, q[1] + uy * 4, 7, 4.5, Math.atan2(uy, ux) + Math.PI / 2, 0, 7); g.stroke();
  const pm = [j.wr[0] - ux * 13, j.wr[1] - uy * 13];
  g.beginPath(); g.moveTo(q[0] + nx * 12, q[1] + ny * 12); g.quadraticCurveTo(j.wr[0] + nx * 14 - ux * 6, j.wr[1] + ny * 14 - uy * 6, pm[0] + nx * 2, pm[1] + ny * 2); g.stroke();
  g.strokeStyle = '#2a1a10'; g.lineWidth = 4.5; g.beginPath(); g.moveTo(j.wr[0] - ux * 2, j.wr[1] - uy * 2); g.lineTo(pm[0] + ux * 2, pm[1] + uy * 2); g.stroke();
  g.fillStyle = trim; g.beginPath(); g.arc(pm[0], pm[1], 3.6, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.arc(pm[0] - 1, pm[1] - 1, 1.2, 0, 7); g.fill();
  g.lineCap = 'butt';
  return Math.atan2(uy, ux);
}
function drawCape(g, f, j, L, C) {
  if (!L.cape) return; if (f.cloth && f.cloth.O) return drawClothCape(g, f, j, L, C); const d = f.dir;
  const target = clamp(-f.vx * .06 + (f.state === 'attack' ? -6 : 0) + (f.state === 'dash' ? -f.dash.s * 10 : 0), -14, 16);
  f.capeS = lerp(f.capeS || 0, target, .12); const s = f.capeS + Math.sin(G.time * 1.6 + (f.isPlayer ? 0 : 2)) * 1.5;
  const a = [j.bsh[0] - d * 2, j.bsh[1] - 3];
  g.beginPath(); g.moveTo(a[0] + d * 6, a[1]); g.quadraticCurveTo(a[0] - d * (20 + s), a[1] + 30, a[0] - d * (26 + s * 1.4), j.gy + 22);
  g.quadraticCurveTo(a[0] - d * (12 + s), j.gy + 30, a[0] - d * 2, j.gy + 14); g.quadraticCurveTo(a[0] + d * 2, a[1] + 40, a[0] + d * 6, a[1]); g.closePath();
  const cg = g.createLinearGradient(a[0] - d * 30, 0, a[0] + d * 6, 0); cg.addColorStop(0, shade(L.cape, -.35)); cg.addColorStop(1, shade(L.cape, .18));
  g.fillStyle = f.flash > 0 ? C(L.cape) : cg; g.fill(); g.strokeStyle = INK; g.lineWidth = INKW; g.stroke();
  g.strokeStyle = C(L.trim); g.globalAlpha = .6; g.lineWidth = 1.5; g.beginPath(); g.moveTo(a[0] - d * (26 + s * 1.4), j.gy + 22); g.quadraticCurveTo(a[0] - d * (12 + s), j.gy + 30, a[0] - d * 2, j.gy + 14); g.stroke(); g.globalAlpha = 1;
}
// traînée de la lame pendant l'exécution
function drawTrail(g, f) {
  const tr = f.state === 'attack' && f.move.kind !== 'pending' && f.t > f.move.wu * .5 && f.t < f.move.wu + f.move.act + .1;
  if (!(tr && f.trail.length > 2)) return;
  const rgb = f.move.kind === 'riposte' ? '255,215,130' : f.move.kind === 'heavy' ? '255,236,210' : '230,240,255', al = f.move.kind === 'heavy' ? .4 : .3;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < f.trail.length - 1; i++) { const a = f.trail[i], b = f.trail[i + 1]; g.fillStyle = `rgba(${rgb},${al * (1 - i / f.trail.length)})`;
    g.beginPath(); g.moveTo(lerp(a[0], a[2], .5), lerp(a[1], a[3], .5)); g.lineTo(a[2], a[3]); g.lineTo(b[2], b[3]); g.lineTo(lerp(b[0], b[2], .5), lerp(b[1], b[3], .5)); g.closePath(); g.fill(); }
  g.restore();
}
// opts.bare : sans ombre de contact ni traînée (rendu peint) · opts.shadowOnly : l'ombre de contact seule
function drawFighter(g, f, opts = {}) {
  const j = f.J || f.joints(), L = opts.tint ? tintLook(norm(f.look), opts.tint) : f.look, S = norm(L), d = f.dir, hit = f.flash > 0;
  const C = hit ? (c => shade(c, .7)) : (c => c);
  g.save(); g.lineJoin = 'round';
  if (!opts.bare) {
  // ombre de contact
  const sx = (f.feet.f.x + f.feet.b.x) / 2, sw = 30 + Math.abs(f.feet.f.x - f.feet.b.x) * .45;
  const sg = g.createRadialGradient(sx, GROUND + 2, 4, sx, GROUND + 2, sw); sg.addColorStop(0, 'rgba(0,0,0,.45)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sg; g.save(); g.translate(sx, GROUND + 2); g.scale(1, .18); g.translate(-sx, -(GROUND + 2)); g.beginPath(); g.arc(sx, GROUND + 2, sw, 0, 7); g.fill(); g.restore();
  }
  if (opts.shadowOnly) { g.restore(); return; }
  // bras libre, cape, jambes, jupe, tronc, tête
  if (S.race === 'drac') drawTail(g, f, j, S, C);
  drawArmS(g, S, j.bsh, j.bel, j.bwr, d, C, true); drawHand(g, j.bwr, Math.atan2(j.bwr[1] - j.bel[1], j.bwr[0] - j.bel[0]), S.skin, C, S.race === 'drac');
  if (S.style !== 'rodeur') drawCape(g, f, j, S, C);
  drawLegS(g, S, j.bl, d, C, false); drawLegS(g, S, j.fl, d, C, true);
  drawSkirt(g, f, j, S, C);
  limb(g, [j.neck[0], j.neck[1] + 4], j.head, S.body === 'f' ? 8 : 9, 7.5, C(shade(S.skin, -.12)), { line: false }); // cou
  drawTorsoS(g, f, j, S, C);
  drawHeadS(g, f, j, S, C);
  if (!opts.bare) drawTrail(g, f);
  // rapière, bras armé, main sur la poignée
  const ang = f.noBlade ? Math.atan2(j.wr[1] - j.el[1], j.wr[0] - j.el[0]) : drawRapier(g, f, j, S, C);
  drawArmS(g, S, j.sh, j.el, j.wr, d, C, false);
  drawHand(g, j.wr, ang, swordHand(S), C);
  g.restore();
}
