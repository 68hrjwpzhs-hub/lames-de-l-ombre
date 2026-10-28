
// =============================== personnages : volumes ombrés ===============================
// Chaque membre est une forme galbée (largeur variable, renflement de muscle ou de manche bouffante),
// ombrée par un dégradé selon une lumière venant d'en haut à gauche, puis cernée d'un trait sombre léger.
const LIGHT = [-.55, -.83];
const _shade = new Map();
function shade(hex, k) {
  const key = hex + k; let v = _shade.get(key); if (v) return v;
  let r, g, b;
  if (hex[0] === '#') { let h = hex.slice(1); if (h.length === 3) h = h.split('').map(c => c + c).join(''); r = parseInt(h.slice(0, 2), 16); g = parseInt(h.slice(2, 4), 16); b = parseInt(h.slice(4, 6), 16); }
  else { const m = hex.match(/[\d.]+/g).map(Number); [r, g, b] = m; }
  if (k >= 0) { r += (255 - r) * k; g += (244 - g) * k; b += (228 - b) * k; } else { r += (18 - r) * -k; g += (12 - g) * -k; b += (20 - b) * -k; }
  v = `rgb(${r | 0},${g | 0},${b | 0})`; _shade.set(key, v); return v;
}
// membre effilé : de a (largeur wa) à b (largeur wb), renflements bf/bb de chaque côté au point t
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
  const W = Math.max(wa, wb) / 2 + Math.max(bf, bb), lit = nx * LIGHT[0] + ny * LIGHT[1] > 0;
  const gr = g.createLinearGradient(mx + nx * W, my + ny * W, mx - nx * W, my - ny * W);
  gr.addColorStop(0, shade(col, lit ? .22 : -.38)); gr.addColorStop(.42, col); gr.addColorStop(1, shade(col, lit ? -.38 : .12));
  g.fillStyle = gr; g.fill();
  if (o.line !== false) { g.strokeStyle = 'rgba(10,6,8,.38)'; g.lineWidth = 1; g.stroke(); }
}
// côté « arrière » du membre (pour le mollet) : +1 si la normale +n pointe vers l'arrière du combattant
const backSide = (a, b, d) => { const dx = b[0] - a[0], dy = b[1] - a[1]; return (-dy) * d < 0 ? 1 : -1; };

function drawLeg(g, L, leg, d, C, front) {
  const { hip, knee, foot } = leg;
  const s = backSide(knee, foot, d), stock = L.stock || shade(L.hose, .28);
  // cuisse (bas de chausse), mollet galbé, botte à revers
  limb(g, hip, knee, 16, 11.5, C(stock), { bf: 1.5, bb: 1.5 });
  const top = [lerp(knee[0], foot[0], .12), lerp(knee[1], foot[1], .12)];
  limb(g, knee, foot, 12, 8, C(stock), s > 0 ? { bf: 3.2, t: .3 } : { bb: 3.2, t: .3 });
  limb(g, top, foot, 13.5, 10, C(L.boot), s > 0 ? { bf: 2.4, t: .3 } : { bb: 2.4, t: .3 });
  const kx = (top[0] - knee[0]), ky = (top[1] - knee[1]), kl = Math.hypot(kx, ky) || 1, px = -ky / kl, py = kx / kl;
  g.fillStyle = C(shade(L.boot, .12)); g.beginPath(); g.moveTo(knee[0] + px * 10, knee[1] + py * 10 - 2); g.lineTo(knee[0] - px * 10, knee[1] - py * 10 - 2); g.lineTo(top[0] - px * 7.5, top[1] - py * 7.5); g.lineTo(top[0] + px * 7.5, top[1] + py * 7.5); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(10,6,8,.4)'; g.lineWidth = 1; g.stroke();
  // pied : talon, semelle, pointe vers l'avant (le pied arrière, tourné en dehors, paraît plus court)
  const Lf = front ? 21 : 14, ax = foot[0], ay = foot[1];
  g.fillStyle = C(L.boot); g.beginPath(); g.moveTo(ax - d * 6, ay - 5); g.lineTo(ax - d * 7.5, ay + 4.5); g.lineTo(ax + d * (Lf - 2), ay + 4.5); g.quadraticCurveTo(ax + d * (Lf + 2), ay + 3, ax + d * (Lf - 3), ay - 1); g.lineTo(ax + d * 4, ay - 5); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(10,6,8,.45)'; g.stroke();
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(Math.min(ax - d * 7.5, ax + d * (Lf - 2)), ay + 3, Math.abs(d * (Lf + 5.5)), 2); // semelle
  g.fillStyle = C(shade(L.boot, -.4)); g.fillRect(ax - d * 7.5 - (d > 0 ? 0 : 4), ay + .5, 4, 4); // talon
}
// chausses bouffantes à crevés (pumpkin hose) sur le haut de la cuisse
function drawHose(g, L, leg, C) {
  const { hip, knee } = leg, e = [lerp(hip[0], knee[0], .5), lerp(hip[1], knee[1], .5)];
  limb(g, hip, e, 25, 19, C(L.hose), { bf: 3, bb: 3, t: .5 });
  const dx = e[0] - hip[0], dy = e[1] - hip[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  g.strokeStyle = C(L.trim); g.lineWidth = 1.6; g.globalAlpha = .7;
  for (const k of [-.55, -.15, .25, .62]) { g.beginPath(); g.moveTo(hip[0] + nx * k * 22, hip[1] + ny * k * 22); g.quadraticCurveTo(lerp(hip[0], e[0], .5) + nx * k * 28, lerp(hip[1], e[1], .5) + ny * k * 28, e[0] + nx * k * 18, e[1] + ny * k * 18); g.stroke(); }
  g.globalAlpha = 1;
}
function drawArm(g, L, sh, el, wr, d, C, back) {
  const coat = back ? shade(L.coat, -.25) : L.coat;
  limb(g, sh, el, 15, 10.5, C(coat), { bf: 3.5, bb: 3.5, t: .35 });                 // manche bouffante
  const dx = el[0] - sh[0], dy = el[1] - sh[1], l = Math.hypot(dx, dy) || 1;
  g.strokeStyle = C(L.trim); g.lineWidth = 1.4; g.globalAlpha = .75; // crevés de la manche
  for (const k of [-.3, .3]) { g.beginPath(); g.moveTo(sh[0] + dx * .15 - dy / l * k * 12, sh[1] + dy * .15 + dx / l * k * 12); g.lineTo(sh[0] + dx * .6 - dy / l * k * 10, sh[1] + dy * .6 + dx / l * k * 10); g.stroke(); }
  g.globalAlpha = 1;
  limb(g, el, wr, 10, 8, C(back ? shade(L.coat2, -.2) : L.coat2), { bf: .8 });
  const c0 = [lerp(el[0], wr[0], .8), lerp(el[1], wr[1], .8)]; limb(g, c0, wr, 10.5, 10, C('#efe7d4'), { line: true }); // poignet de dentelle
}
function drawHand(g, wr, ang, col, C) {
  g.save(); g.translate(wr[0], wr[1]); g.rotate(ang);
  g.fillStyle = C(col); g.beginPath(); g.ellipse(1, 0, 6.5, 5, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(10,6,8,.45)'; g.lineWidth = 1; g.stroke();
  g.fillStyle = C(shade(col, -.25)); g.beginPath(); g.ellipse(3, 2.5, 3, 2, .4, 0, 7); g.fill(); // pouce
  g.restore();
}
function drawRapier(g, f, j, L, C) {
  const bx = j.tip[0] - j.wr[0], by = j.tip[1] - j.wr[1], bl = Math.hypot(bx, by) || 1, ux = bx / bl, uy = by / bl, nx = -uy, ny = ux, d = f.dir;
  const base = [j.wr[0] + ux * 6, j.wr[1] + uy * 6];
  // lame : large au talon, fine à la pointe, arête claire
  g.fillStyle = '#6a7480'; g.beginPath(); g.moveTo(base[0] + nx * 2, base[1] + ny * 2); g.lineTo(j.tip[0] + nx * .5, j.tip[1] + ny * .5); g.lineTo(j.tip[0] - nx * .5, j.tip[1] - ny * .5); g.lineTo(base[0] - nx * 2, base[1] - ny * 2); g.closePath(); g.fill();
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
function drawHead(g, f, j, L, C) {
  const d = f.dir, tilt = (f.pose.torso + f.pose.head) * DEG;
  g.save(); g.translate(j.head[0], j.head[1]); g.rotate(tilt * d); g.scale(d, 1);
  const skin = C(L.skin);
  // visage de profil
  g.beginPath(); g.moveTo(-8, -8); g.quadraticCurveTo(0, -13, 7.5, -7.5); g.quadraticCurveTo(9.8, -4, 9.6, -1.5); g.lineTo(13.2, 3.4); g.quadraticCurveTo(12.6, 4.8, 10.6, 4.8);
  g.quadraticCurveTo(11.4, 6, 10.4, 7.3); g.quadraticCurveTo(11.2, 8.4, 10.2, 9.4); g.quadraticCurveTo(10.4, 12.2, 7.5, 13); g.quadraticCurveTo(3, 13.6, 0, 10.5); g.lineTo(-6, 7.5); g.quadraticCurveTo(-11, 2, -8, -8); g.closePath();
  const gr = g.createLinearGradient(-10, -10, 12, 12); gr.addColorStop(0, shade(L.skin, .12)); gr.addColorStop(.6, L.skin); gr.addColorStop(1, shade(L.skin, -.3));
  g.fillStyle = f.flash > 0 ? skin : gr; g.fill(); g.strokeStyle = 'rgba(40,20,14,.5)'; g.lineWidth = 1; g.stroke();
  g.fillStyle = C(shade(L.skin, -.18)); g.beginPath(); g.ellipse(-1.5, 1.5, 2.6, 3.6, .2, 0, 7); g.fill(); // oreille
  g.fillStyle = '#f4efe6'; g.beginPath(); g.ellipse(6.4, -2.2, 2.1, 1.2, 0, 0, 7); g.fill(); g.fillStyle = '#1a1210'; g.beginPath(); g.arc(7.1, -2.2, .95, 0, 7); g.fill(); // œil
  g.strokeStyle = C(L.hair); g.lineWidth = 1.6; g.beginPath(); g.moveTo(3.8, -5); g.quadraticCurveTo(6.5, -6.4, 9.2, -4.6); g.stroke(); // sourcil
  g.strokeStyle = 'rgba(80,40,30,.6)'; g.lineWidth = .8; g.beginPath(); g.moveTo(8.6, 7.4); g.lineTo(10.4, 7.3); g.stroke(); // bouche
  // cheveux : masse à l'arrière, mèche sur la nuque
  g.fillStyle = C(L.hair); g.beginPath(); g.moveTo(6, -8.5); g.quadraticCurveTo(-1, -14, -9, -7); g.quadraticCurveTo(-12.5, 1, -8.5, 8.5); g.quadraticCurveTo(-5, 6, -3.5, 2); g.quadraticCurveTo(-2, -4, 6, -8.5); g.closePath(); g.fill();
  // barbe et moustache
  const hair = C(L.hair);
  if (L.beard !== 'none') { g.fillStyle = hair; g.beginPath(); g.moveTo(10.6, 5.1); g.quadraticCurveTo(8, 4.6, 5.5, 6.5); g.quadraticCurveTo(8, 5.8, 9.6, 6.6); g.closePath(); g.fill(); g.strokeStyle = hair; g.lineWidth = 1.2; g.beginPath(); g.moveTo(6, 6.2); g.quadraticCurveTo(4, 6.5, 3.5, 4.6); g.stroke(); }
  if (L.beard === 'pointed') { g.fillStyle = hair; g.beginPath(); g.moveTo(10, 9.6); g.quadraticCurveTo(10.6, 13, 9.2, 19); g.quadraticCurveTo(7, 14, 6, 12.6); g.quadraticCurveTo(8.5, 12.6, 10, 9.6); g.fill(); }
  if (L.beard === 'full') { g.fillStyle = hair; g.beginPath(); g.moveTo(10.3, 8.6); g.quadraticCurveTo(11.5, 15, 7.5, 18.5); g.quadraticCurveTo(1, 18, -2, 9.5); g.quadraticCurveTo(-.5, 6, 2, 6.5); g.quadraticCurveTo(5, 10.5, 8.6, 9.4); g.closePath(); g.fill(); }
  // chapeau : bord large, calotte, ruban, plume
  if (L.hat) {
    const hat = C(L.hat);
    if (L.plume) { const pg = g.createLinearGradient(0, -24, -36, -10); pg.addColorStop(0, C(L.plume)); pg.addColorStop(1, C(shade(L.plume, -.25)));
      g.fillStyle = pg; g.beginPath(); g.moveTo(4, -20); g.quadraticCurveTo(-12, -40, -36, -24); g.quadraticCurveTo(-30, -20, -24, -21); g.quadraticCurveTo(-14, -30, 1, -17); g.closePath(); g.fill();
      g.strokeStyle = C(shade(L.plume, -.35)); g.lineWidth = .8; for (let k = 0; k < 6; k++) { const t = k / 6, x = lerp(2, -30, t), y = -20 - Math.sin(t * Math.PI) * 9; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 4, y + 4); g.stroke(); } }
    g.fillStyle = hat; g.beginPath(); g.moveTo(-9, -11); g.quadraticCurveTo(-10, -23, 0, -24); g.quadraticCurveTo(10, -23, 9.5, -11); g.closePath(); g.fill();
    g.fillStyle = C(L.trim); g.fillRect(-9.6, -14.5, 19.2, 2.8);
    const bg = g.createLinearGradient(0, -14, 0, -6); bg.addColorStop(0, shade(L.hat, .2)); bg.addColorStop(1, shade(L.hat, -.3));
    g.fillStyle = f.flash > 0 ? hat : bg; g.beginPath(); g.ellipse(1, -10.5, 23, 4.6, -.1, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 1; g.stroke();
  }
  g.restore();
}
function drawTorso(g, f, j, L, C) {
  const d = f.dir, tor = f.pose.torso * DEG;
  g.save(); g.translate(j.gx, j.gy); g.rotate(tor * d); g.scale(d, 1);
  // basques (jupe courte du pourpoint)
  g.fillStyle = C(L.coat2); g.beginPath(); g.moveTo(-15, -6); g.lineTo(14, -6); g.lineTo(19, 11); g.lineTo(-19, 11); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; for (const x of [-9, 0, 9]) { g.beginPath(); g.moveTo(x, -4); g.lineTo(x * 1.25, 11); g.stroke(); }
  // pourpoint matelassé (ventre « en cosse de pois »)
  g.beginPath(); g.moveTo(-13, -4); g.lineTo(12, -4); g.quadraticCurveTo(19, -16, 17, -34); g.quadraticCurveTo(16, -48, 9, -55); g.lineTo(5, -59); g.lineTo(-6, -59); g.quadraticCurveTo(-16, -55, -16, -44); g.quadraticCurveTo(-17, -20, -13, -4); g.closePath();
  const tg = g.createLinearGradient(-17 * d, 0, 19 * d, 0); tg.addColorStop(0, shade(L.coat, d > 0 ? .2 : -.4)); tg.addColorStop(.5, L.coat); tg.addColorStop(1, shade(L.coat, d > 0 ? -.4 : .2));
  g.fillStyle = f.flash > 0 ? C(L.coat) : tg; g.fill(); g.strokeStyle = 'rgba(10,6,8,.45)'; g.stroke();
  // piqûres du matelassage, boutons, ceinture
  g.strokeStyle = 'rgba(0,0,0,.18)'; for (let y = -50; y < -6; y += 8) { g.beginPath(); g.moveTo(-14, y); g.quadraticCurveTo(2, y + 3, 16, y - 1); g.stroke(); }
  g.fillStyle = C(L.trim); for (let k = 0; k < 7; k++) { const y = -10 - k * 6.5, x = 15.5 - Math.abs(y + 30) * .06; g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); }
  g.fillStyle = C(shade(L.trim, -.3)); g.fillRect(-14, -7, 28, 4); g.fillStyle = C(L.trim); g.fillRect(9, -8, 5, 6);
  // épaulette roulée
  g.fillStyle = C(shade(L.coat, -.15)); g.beginPath(); g.ellipse(4, -51, 9, 5, -.3, 0, 7); g.fill();
  // fraise
  g.fillStyle = C('#f2ecdc'); g.beginPath(); g.ellipse(1, -59, 13, 5.5, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(120,110,95,.6)'; g.lineWidth = .8; for (let k = -11; k <= 11; k += 3) { g.beginPath(); g.moveTo(k, -63); g.lineTo(k * .9, -55); g.stroke(); }
  g.restore();
}
function drawCape(g, f, j, L, C) {
  if (!L.cape) return; const d = f.dir;
  const target = clamp(-f.vx * .06 + (f.state === 'attack' ? -6 : 0) + (f.state === 'dash' ? -f.dash.s * 10 : 0), -14, 16);
  f.capeS = lerp(f.capeS || 0, target, .12); const s = f.capeS + Math.sin(G.time * 1.6 + (f.isPlayer ? 0 : 2)) * 1.5;
  const a = [j.bsh[0] - d * 2, j.bsh[1] - 3];
  g.beginPath(); g.moveTo(a[0] + d * 6, a[1]); g.quadraticCurveTo(a[0] - d * (20 + s), a[1] + 30, a[0] - d * (26 + s * 1.4), j.gy + 22);
  g.quadraticCurveTo(a[0] - d * (12 + s), j.gy + 30, a[0] - d * 2, j.gy + 14); g.quadraticCurveTo(a[0] + d * 2, a[1] + 40, a[0] + d * 6, a[1]); g.closePath();
  const cg = g.createLinearGradient(a[0] - d * 30, 0, a[0] + d * 6, 0); cg.addColorStop(0, shade(L.cape, -.35)); cg.addColorStop(1, shade(L.cape, .18));
  g.fillStyle = f.flash > 0 ? C(L.cape) : cg; g.fill(); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 1; g.stroke();
  g.strokeStyle = C(L.trim); g.globalAlpha = .6; g.lineWidth = 1.5; g.beginPath(); g.moveTo(a[0] - d * (26 + s * 1.4), j.gy + 22); g.quadraticCurveTo(a[0] - d * (12 + s), j.gy + 30, a[0] - d * 2, j.gy + 14); g.stroke(); g.globalAlpha = 1;
}
function drawFighter(g, f) {
  const j = f.J || f.joints(), L = f.look, d = f.dir, hit = f.flash > 0;
  const C = hit ? (c => shade(c, .7)) : (c => c);
  g.save(); g.lineJoin = 'round';
  // ombre de contact
  const sx = (f.feet.f.x + f.feet.b.x) / 2, sw = 30 + Math.abs(f.feet.f.x - f.feet.b.x) * .45;
  const sg = g.createRadialGradient(sx, GROUND + 2, 4, sx, GROUND + 2, sw); sg.addColorStop(0, 'rgba(0,0,0,.45)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sg; g.save(); g.translate(sx, GROUND + 2); g.scale(1, .18); g.translate(-sx, -(GROUND + 2)); g.beginPath(); g.arc(sx, GROUND + 2, sw, 0, 7); g.fill(); g.restore();
  // bras libre, cape, jambes, chausses, tronc
  drawArm(g, L, j.bsh, j.bel, j.bwr, d, C, true); drawHand(g, j.bwr, Math.atan2(j.bwr[1] - j.bel[1], j.bwr[0] - j.bel[0]), L.skin, C);
  drawCape(g, f, j, L, C);
  drawLeg(g, L, j.bl, d, C, false); drawHose(g, L, j.bl, C);
  drawLeg(g, L, j.fl, d, C, true); drawHose(g, L, j.fl, C);
  limb(g, [j.neck[0], j.neck[1] + 4], j.head, 9, 8, C(shade(L.skin, -.12)), { line: false }); // cou
  drawTorso(g, f, j, L, C);
  drawHead(g, f, j, L, C);
  // traînée de la lame
  const tr = f.state === 'attack' && f.move.kind !== 'pending' && f.t > f.move.wu * .5 && f.t < f.move.wu + f.move.act + .1;
  if (tr && f.trail.length > 2) {
    const rgb = f.move.kind === 'riposte' ? '255,215,130' : f.move.kind === 'heavy' ? '255,236,210' : '230,240,255', al = f.move.kind === 'heavy' ? .4 : .3;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < f.trail.length - 1; i++) { const a = f.trail[i], b = f.trail[i + 1]; g.fillStyle = `rgba(${rgb},${al * (1 - i / f.trail.length)})`;
      g.beginPath(); g.moveTo(lerp(a[0], a[2], .5), lerp(a[1], a[3], .5)); g.lineTo(a[2], a[3]); g.lineTo(b[2], b[3]); g.lineTo(lerp(b[0], b[2], .5), lerp(b[1], b[3], .5)); g.closePath(); g.fill(); }
    g.restore();
  }
  // rapière, bras armé, main gantée sur la poignée
  const ang = drawRapier(g, f, j, L, C);
  drawArm(g, L, j.sh, j.el, j.wr, d, C, false);
  drawHand(g, j.wr, ang, L.glove || '#6a4a2e', C);
  g.restore();
}
