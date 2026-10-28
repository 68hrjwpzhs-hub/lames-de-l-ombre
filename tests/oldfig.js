window.line = function (g, a, b, w, col) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
window.drawFighter = function (g, f) {
  const j = f.joints(), L = f.look, d = f.dir;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  // ombre au sol
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(f.x + f.pose.px * d * .5, GROUND + 2, 58, 9, 0, 0, Math.PI * 2); g.fill();
  const hit = f.flash > 0;
  // bras libre (derrière)
  line(g, j.bsh, j.bel, 12, L.coat2); line(g, j.bel, j.bwr, 10, L.coat2); g.fillStyle = L.skin; g.beginPath(); g.arc(j.bwr[0], j.bwr[1], 5, 0, 7); g.fill();
  // cape (derrière)
  if (L.cape) { g.fillStyle = L.cape; g.beginPath(); g.moveTo(j.neck[0] - d * 6, j.neck[1] + 4); g.quadraticCurveTo(j.neck[0] - d * 30, j.gy - 20, j.gx - d * 34, j.gy + 6); g.lineTo(j.gx - d * 8, j.gy - 4); g.closePath(); g.fill(); }
  // jambe arrière
  line(g, j.bl.hip, j.bl.knee, 15, L.hose); line(g, j.bl.knee, j.bl.foot, 12, L.boot); line(g, j.bl.foot, [j.bl.foot[0] + d * 14, j.bl.foot[1]], 8, L.boot);
  // jambe avant
  line(g, j.fl.hip, j.fl.knee, 16, L.hose); line(g, j.fl.knee, j.fl.foot, 12, L.boot); line(g, j.fl.foot, [j.fl.foot[0] + d * 16, j.fl.foot[1]], 8, L.boot);
  g.fillStyle = L.trim; g.beginPath(); g.arc(j.fl.knee[0], j.fl.knee[1], 4, 0, 7); g.fill();
  // culotte bouffante + pourpoint
  g.fillStyle = L.hose; g.beginPath(); g.ellipse(j.gx, j.gy + 2, 20, 15, 0, 0, 7); g.fill();
  const tor = f.pose.torso * DEG, ux = Math.sin(tor) * d, uy = -Math.cos(tor), px = -uy * d, py = ux * d;
  const body = (w0, w1) => { g.beginPath(); g.moveTo(j.gx + px * w0 * d, j.gy + py * w0 * d); g.lineTo(j.neck[0] + px * w1 * d, j.neck[1] + py * w1 * d); g.lineTo(j.neck[0] - px * w1 * d, j.neck[1] - py * w1 * d); g.lineTo(j.gx - px * w0 * d, j.gy - py * w0 * d); g.closePath(); g.fill(); };
  g.fillStyle = hit ? '#fff' : L.coat; body(15, 19);
  g.fillStyle = L.coat2; g.beginPath(); g.moveTo(j.gx - px * 15, j.gy - py * 15 + 2); g.lineTo(j.gx + px * 15, j.gy + py * 15 + 2); g.lineTo(j.gx + ux * 18, j.gy + 14); g.closePath(); g.fill(); // pointe du pourpoint
  g.strokeStyle = L.trim; g.lineWidth = 2; g.beginPath(); g.moveTo(j.gx + ux * 6, j.gy + uy * 6); g.lineTo(j.neck[0], j.neck[1] + 6); g.stroke();
  for (let i = 1; i < 5; i++) { g.fillStyle = L.trim; g.beginPath(); g.arc(lerp(j.gx, j.neck[0], i / 5), lerp(j.gy, j.neck[1], i / 5), 1.6, 0, 7); g.fill(); }
  g.fillStyle = L.trim; g.fillRect(j.gx - 14, j.gy - 2, 28, 4); // ceinture
  // collerette
  g.fillStyle = '#f2ecdc'; g.beginPath(); g.ellipse(j.neck[0], j.neck[1] + 2, 12, 5, tor * d, 0, 7); g.fill();
  // tête
  g.fillStyle = L.skin; g.beginPath(); g.arc(j.head[0], j.head[1], 11, 0, 7); g.fill();
  g.fillStyle = L.hair; g.beginPath(); g.arc(j.head[0] - d * 2, j.head[1] - 2, 11, Math.PI * (d > 0 ? .8 : -.2), Math.PI * (d > 0 ? 1.9 : .9) + (d > 0 ? 0 : Math.PI)); g.fill();
  if (L.beard === 'pointed') { g.fillStyle = L.hair; g.beginPath(); g.moveTo(j.head[0] + d * 3, j.head[1] + 7); g.lineTo(j.head[0] + d * 9, j.head[1] + 7); g.lineTo(j.head[0] + d * 5, j.head[1] + 18); g.fill(); }
  if (L.beard === 'full') { g.fillStyle = L.hair; g.beginPath(); g.ellipse(j.head[0] + d * 4, j.head[1] + 9, 8, 8, 0, 0, 7); g.fill(); }
  if (L.beard !== 'none') line(g, [j.head[0] + d * 2, j.head[1] + 4], [j.head[0] + d * 12, j.head[1] + 1], 2.4, L.hair);
  g.fillStyle = '#1a1210'; g.beginPath(); g.arc(j.head[0] + d * 6, j.head[1] - 2, 1.5, 0, 7); g.fill();
  if (L.hat) { // chapeau à large bord, plume
    g.fillStyle = L.hat; g.beginPath(); g.ellipse(j.head[0], j.head[1] - 9, 21, 4.5, -d * .12, 0, 7); g.fill(); g.beginPath(); g.ellipse(j.head[0] - d, j.head[1] - 15, 10, 9, 0, Math.PI, 0); g.fill();
    g.fillStyle = L.trim; g.fillRect(j.head[0] - 10, j.head[1] - 13, 20, 2.5);
    if (L.plume) { g.strokeStyle = L.plume; g.lineWidth = 5; g.beginPath(); g.moveTo(j.head[0] + d * 4, j.head[1] - 15); g.quadraticCurveTo(j.head[0] - d * 18, j.head[1] - 34, j.head[0] - d * 34, j.head[1] - 20); g.stroke(); }
  }
  // traînée de la lame
  if (['attack', 'heavy', 'riposte'].includes(f.state) && f.trail.length > 2) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < f.trail.length - 1; i++) { const a = f.trail[i], b = f.trail[i + 1]; g.fillStyle = `rgba(${f.state === 'riposte' ? '255,215,130' : '230,240,255'},${.32 * (1 - i / f.trail.length)})`;
      g.beginPath(); g.moveTo(lerp(a[0], a[2], .5), lerp(a[1], a[3], .5)); g.lineTo(a[2], a[3]); g.lineTo(b[2], b[3]); g.lineTo(lerp(b[0], b[2], .5), lerp(b[1], b[3], .5)); g.closePath(); g.fill(); }
    g.restore();
  }
  // rapière : lame fine + garde à coquille et anneaux
  line(g, j.wr, j.tip, 3.2, '#59616b'); line(g, j.wr, j.tip, 1.6, L.blade);
  const bx = (j.tip[0] - j.wr[0]) / 112, by = (j.tip[1] - j.wr[1]) / 112;
  line(g, [j.wr[0] - by * 12, j.wr[1] + bx * 12], [j.wr[0] + by * 12, j.wr[1] - bx * 12], 3, L.trim);
  g.strokeStyle = L.trim; g.lineWidth = 2; g.beginPath(); g.arc(j.wr[0] + bx * 4, j.wr[1] + by * 4, 7, 0, 7); g.stroke();
  line(g, [j.wr[0] - bx * 10, j.wr[1] - by * 10], j.wr, 4, '#2a1d14'); g.fillStyle = L.trim; g.beginPath(); g.arc(j.wr[0] - bx * 11, j.wr[1] - by * 11, 3, 0, 7); g.fill();
  // bras armé (devant)
  line(g, j.sh, j.el, 13, hit ? '#fff' : L.coat); line(g, j.el, j.wr, 11, L.coat); g.fillStyle = '#f2ecdc'; g.beginPath(); g.arc(lerp(j.el[0], j.wr[0], .82), lerp(j.el[1], j.wr[1], .82), 6, 0, 7); g.fill();
  g.fillStyle = '#5a3a22'; g.beginPath(); g.arc(j.wr[0], j.wr[1], 5.5, 0, 7); g.fill();
  g.restore();
}
