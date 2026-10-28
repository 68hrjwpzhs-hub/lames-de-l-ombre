
// ---- tenues : gentilhomme, rôdeur, paysan, moine, dame d'épée ; corps d'homme ou de femme ----
const STYLE_NAMES = { renaissance: 'Gentilhomme', rodeur: 'Rôdeur', paysan: 'Paysan', moine: 'Moine', dame: 'Dame d\'épée' };
function norm(L) { // valeurs par défaut pour les anciennes tenues
  if (L._n) return L._n;
  const n = Object.assign({ style: 'renaissance', body: 'h', hairStyle: 'court', hatType: L.hat ? 'feutre' : 'aucun', stock: shade(L.hose, .28) }, L);
  if (n.body === 'f') n.beard = 'none';
  Object.defineProperty(L, '_n', { value: n, enumerable: false, configurable: true });
  return n;
}
// point le long de la jambe (hanche → genou → pied), k de 0 à 1
function legAt(leg, k) { return k < .5 ? [lerp(leg.hip[0], leg.knee[0], k * 2), lerp(leg.hip[1], leg.knee[1], k * 2)] : [lerp(leg.knee[0], leg.foot[0], k * 2 - 1), lerp(leg.knee[1], leg.foot[1], k * 2 - 1)]; }
function drawFoot(g, L, ax, ay, d, front, C, type) {
  if (type === 'sandale') {
    const Lf = front ? 19 : 13; g.fillStyle = C(L.skin); g.beginPath(); g.moveTo(ax - d * 5, ay - 4); g.lineTo(ax - d * 6, ay + 3.5); g.lineTo(ax + d * (Lf - 2), ay + 3.5); g.quadraticCurveTo(ax + d * Lf, ay + 1, ax + d * (Lf - 5), ay - 1); g.lineTo(ax + d * 3, ay - 4); g.closePath(); g.fill();
    g.fillStyle = C('#4a3020'); g.fillRect(Math.min(ax - d * 6, ax + d * (Lf - 1)), ay + 3, Math.abs(d * (Lf + 5)), 2.5);
    g.strokeStyle = C('#4a3020'); g.lineWidth = 1.6; g.beginPath(); g.moveTo(ax - d * 2, ay - 3); g.lineTo(ax + d * 6, ay + 3); g.moveTo(ax + d * 6, ay - 1); g.lineTo(ax + d * 10, ay + 3); g.stroke(); return;
  }
  const Lf = front ? 21 : 14, low = type === 'soulier';
  g.fillStyle = C(L.boot); g.beginPath(); g.moveTo(ax - d * 6, ay - (low ? 3 : 5)); g.lineTo(ax - d * 7.5, ay + 4.5); g.lineTo(ax + d * (Lf - 2), ay + 4.5); g.quadraticCurveTo(ax + d * (Lf + 2), ay + 3, ax + d * (Lf - 3), ay - 1); g.lineTo(ax + d * 4, ay - (low ? 2 : 5)); g.closePath(); g.fill();
  g.strokeStyle = INK; g.lineWidth = INKW; g.stroke();
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(Math.min(ax - d * 7.5, ax + d * (Lf - 2)), ay + 3, Math.abs(d * (Lf + 5.5)), 2);
}
function bootTop(g, a, b, w, col, C) { // revers de botte
  const kx = b[0] - a[0], ky = b[1] - a[1], kl = Math.hypot(kx, ky) || 1, px = -ky / kl, py = kx / kl;
  g.fillStyle = C(shade(col, .12)); g.beginPath(); g.moveTo(a[0] + px * w, a[1] + py * w - 2); g.lineTo(a[0] - px * w, a[1] - py * w - 2); g.lineTo(b[0] - px * (w - 2.5), b[1] - py * (w - 2.5)); g.lineTo(b[0] + px * (w - 2.5), b[1] + py * (w - 2.5)); g.closePath(); g.fill();
  g.strokeStyle = INK; g.lineWidth = INKW; g.stroke();
}
function drawLegS(g, L, leg, d, C, front) {
  const S = norm(L), { hip, knee, foot } = leg, s = backSide(knee, foot, d), calf = s > 0 ? { bf: 3.2, t: .3 } : { bb: 3.2, t: .3 }, wf = S.body === 'f' ? .9 : 1;
  switch (S.style) {
    case 'rodeur': { // braies de cuir et hautes bottes cavalières
      limb(g, hip, knee, 16 * wf, 12 * wf, C(S.coat2), { bf: 1.5, bb: 1.5, folds: 2 });
      const up = [lerp(knee[0], hip[0], .22), lerp(knee[1], hip[1], .22)];
      limb(g, up, knee, 15 * wf, 13 * wf, C(S.boot), { mat: 'cuir' }); limb(g, knee, foot, 13.5 * wf, 10, C(S.boot), Object.assign({ mat: 'cuir' }, calf)); bootTop(g, up, [lerp(up[0], knee[0], .35), lerp(up[1], knee[1], .35)], 10, S.boot, C);
      drawFoot(g, S, foot[0], foot[1], d, front, C, 'botte'); break;
    }
    case 'paysan': { // culotte au genou, bas, souliers
      limb(g, knee, foot, 11 * wf, 7.5, C(S.stock), calf);
      limb(g, hip, knee, 18 * wf, 14 * wf, C(S.hose), { bf: 2.5, bb: 2.5, folds: 2 });
      const kb = [lerp(knee[0], hip[0], .08), lerp(knee[1], hip[1], .08)]; limb(g, kb, knee, 14, 13, C(shade(S.hose, -.25)));
      drawFoot(g, S, foot[0], foot[1], d, front, C, 'soulier'); break;
    }
    case 'moine': limb(g, knee, foot, 10 * wf, 7, C(S.skin), calf); drawFoot(g, S, foot[0], foot[1], d, front, C, 'sandale'); break;
    default: { // gentilhomme et dame : bas, botte à revers
      limb(g, hip, knee, 16 * wf, 11.5 * wf, C(S.stock), { bf: 1.5, bb: 1.5 });
      const top = [lerp(knee[0], foot[0], .12), lerp(knee[1], foot[1], .12)];
      limb(g, knee, foot, 12 * wf, 8, C(S.stock), calf); limb(g, top, foot, 13.5 * wf, 10, C(S.boot), s > 0 ? { bf: 2.4, t: .3, mat: 'cuir' } : { bb: 2.4, t: .3, mat: 'cuir' });
      bootTop(g, knee, top, 10, S.boot, C); drawFoot(g, S, foot[0], foot[1], d, front, C, 'botte');
      if (S.style === 'renaissance') drawHose(g, S, leg, C);
    }
  }
}
// jupe : robe de moine, jupe de dame, pans de tunique ou de pourpoint de cuir
function drawSkirt(g, f, j, L, C) {
  const S = norm(L), d = f.dir, k = { moine: .96, dame: .74, paysan: .4, rodeur: .34 }[S.style]; if (!k) return;
  const tor = f.pose.torso * DEG, wx = (x, y) => [j.gx + (x * Math.cos(tor) - y * Math.sin(tor) * 0) * d + Math.sin(tor) * -y * d * 0, j.gy + y];
  const wb = [j.gx - d * 15 * (S.body === 'f' ? .85 : 1), j.gy - 6], wfr = [j.gx + d * 14, j.gy - 6];
  let hb = legAt(j.bl, k), hf = legAt(j.fl, k); hb = [hb[0] - d * 10, hb[1] + 2]; hf = [hf[0] + d * 10, hf[1] + 2];
  const mid = (hb[0] + hf[0]) / 2; if ((hf[0] - hb[0]) * d < 34) { hb[0] = mid - d * 17; hf[0] = mid + d * 17; }
  const col = S.style === 'rodeur' ? S.coat : S.style === 'paysan' ? S.coat : S.style === 'dame' ? S.coat2 : S.coat;
  g.beginPath(); g.moveTo(wb[0], wb[1]); g.quadraticCurveTo(lerp(wb[0], hb[0], .5) - d * 4, lerp(wb[1], hb[1], .5), hb[0], hb[1]);
  if (S.style === 'rodeur') { const sm = [mid, lerp(hb[1], j.gy, .45)]; g.lineTo(lerp(hb[0], mid, .8), hb[1] + 1); g.lineTo(sm[0], sm[1]); g.lineTo(lerp(hf[0], mid, .8), hf[1] + 1); } // fente du pan
  else g.quadraticCurveTo(mid, Math.max(hb[1], hf[1]) + 7, hf[0], hf[1]);
  g.lineTo(hf[0], hf[1]); g.quadraticCurveTo(lerp(wfr[0], hf[0], .5) + d * 4, lerp(wfr[1], hf[1], .5), wfr[0], wfr[1]); g.closePath();
  const sg = g.createLinearGradient(hb[0], 0, hf[0], 0); sg.addColorStop(0, shade(col, d > 0 ? .15 : -.35)); sg.addColorStop(.5, col); sg.addColorStop(1, shade(col, d > 0 ? -.35 : .15));
  g.fillStyle = f.flash > 0 ? C(col) : sg; g.fill(); g.strokeStyle = INK; g.lineWidth = INKW; g.stroke();
  g.strokeStyle = 'rgba(0,0,0,.22)'; for (const u of [.3, .55, .78]) { g.beginPath(); g.moveTo(lerp(wb[0], wfr[0], u), j.gy - 4); g.quadraticCurveTo(lerp(hb[0], hf[0], u) + d * 3, lerp(j.gy, hb[1], .6), lerp(hb[0], hf[0], u), lerp(hb[1], hf[1], u) + 2); g.stroke(); }
  if (S.style === 'dame' || S.style === 'moine') { g.strokeStyle = C(S.trim); g.lineWidth = 2; g.globalAlpha = .7; g.beginPath(); g.moveTo(hb[0], hb[1] - 2); g.quadraticCurveTo(mid, Math.max(hb[1], hf[1]) + 4, hf[0], hf[1] - 2); g.stroke(); g.globalAlpha = 1; }
  if (S.style === 'moine') { g.fillStyle = C(S.coat2); g.beginPath(); g.moveTo(j.gx + d * 9, j.gy - 6); g.lineTo(j.gx + d * 15, j.gy - 6); g.lineTo(lerp(j.gx, hf[0], .55) + d * 8, lerp(j.gy, hf[1], .85)); g.lineTo(lerp(j.gx, hf[0], .55) + d * 1, lerp(j.gy, hf[1], .85)); g.closePath(); g.fill(); } // scapulaire
  void wx;
}
function drawArmS(g, L, sh, el, wr, d, C, back) {
  const S = norm(L), wf = S.body === 'f' ? .88 : 1, dk = back ? -.25 : 0, col = c => C(dk ? shade(c, dk) : c);
  switch (S.style) {
    case 'rodeur': {
      limb(g, sh, el, 13 * wf, 10 * wf, col(S.coat), { bf: 1.5, bb: 1.5, folds: 2, mat: 'cuir' }); limb(g, el, wr, 10 * wf, 8 * wf, col(S.coat2), { bf: .8, folds: 2 });
      const b0 = [lerp(el[0], wr[0], .35), lerp(el[1], wr[1], .35)], b1 = [lerp(el[0], wr[0], .9), lerp(el[1], wr[1], .9)]; limb(g, b0, b1, 11 * wf, 10.5 * wf, col(S.boot), { mat: 'cuir' }); // brassard de cuir
      break;
    }
    case 'paysan': {
      limb(g, sh, el, 14 * wf, 11 * wf, col(S.coat), { bf: 2.5, bb: 2.5, folds: 3 });
      const r = [lerp(el[0], sh[0], .12), lerp(el[1], sh[1], .12)]; limb(g, r, el, 13 * wf, 12 * wf, col(shade(S.coat, -.15))); // manche retroussée
      limb(g, el, wr, 9 * wf, 7 * wf, col(S.skin), { bf: 1 }); break;
    }
    case 'moine': limb(g, sh, el, 15 * wf, 14 * wf, col(S.coat), { bf: 2, bb: 2, folds: 2 }); limb(g, el, wr, 13 * wf, 22 * wf, col(S.coat), { bb: 1, folds: 2 }); break; // manche évasée
    default: {
      const puff = S.style === 'dame' ? 2.5 : 3.5;
      limb(g, sh, el, 15 * wf, 10.5 * wf, col(S.coat), { bf: puff, bb: puff, t: .35, folds: 2 });
      const dx = el[0] - sh[0], dy = el[1] - sh[1], l = Math.hypot(dx, dy) || 1;
      g.strokeStyle = C(S.trim); g.lineWidth = 1.4; g.globalAlpha = .75;
      for (const k of [-.3, .3]) { g.beginPath(); g.moveTo(sh[0] + dx * .15 - dy / l * k * 12, sh[1] + dy * .15 + dx / l * k * 12); g.lineTo(sh[0] + dx * .6 - dy / l * k * 10, sh[1] + dy * .6 + dx / l * k * 10); g.stroke(); }
      g.globalAlpha = 1;
      limb(g, el, wr, 10 * wf, 8 * wf, col(S.coat2), { bf: .8, folds: 2 });
      { const ex = wr[0] - el[0], ey = wr[1] - el[1], el2 = Math.hypot(ex, ey) || 1, qx = -ey / el2, qy = ex / el2; g.strokeStyle = C(S.trim); g.lineWidth = 1.2; g.globalAlpha = .8; // galons brodés au poignet
        for (const u of [.62, .7]) { const px = el[0] + ex * u, py = el[1] + ey * u, w = 5.2 * wf; g.beginPath(); g.moveTo(px + qx * w, py + qy * w); g.lineTo(px - qx * w, py - qy * w); g.stroke(); } g.globalAlpha = 1; }
      const c0 = [lerp(el[0], wr[0], .8), lerp(el[1], wr[1], .8)]; limb(g, c0, wr, 10.5 * wf, 10 * wf, C('#efe7d4'));
    }
  }
}
function swordHand(S) { return S.style === 'paysan' || S.style === 'moine' ? S.skin : S.style === 'rodeur' ? shade(S.boot, .1) : (S.glove || '#6a4a2e'); }
// tronc dans le repère du buste (x vers l'avant)
function torsoPath(g, S, wider = 0) {
  if (S.body === 'f') { g.beginPath(); g.moveTo(-11 - wider, -4); g.lineTo(10 + wider, -4); g.quadraticCurveTo(13 + wider, -14, 12 + wider, -25); g.quadraticCurveTo(20 + wider, -31, 16 + wider, -42); g.quadraticCurveTo(14, -51, 8, -55); g.lineTo(4, -59); g.lineTo(-5, -59); g.quadraticCurveTo(-14 - wider, -55, -14 - wider, -44); g.quadraticCurveTo(-13 - wider, -22, -11 - wider, -4); g.closePath(); return; }
  g.beginPath(); g.moveTo(-13 - wider, -4); g.lineTo(12 + wider, -4); g.quadraticCurveTo(19 + wider, -16, 17 + wider, -34); g.quadraticCurveTo(16 + wider, -48, 9, -55); g.lineTo(5, -59); g.lineTo(-6, -59); g.quadraticCurveTo(-16 - wider, -55, -16 - wider, -44); g.quadraticCurveTo(-17 - wider, -20, -13 - wider, -4); g.closePath();
}
function fillTorso(g, f, S, col, C, d) { // repère du buste déjà retourné selon d : la lumière y vient de LIGHT[0]·d
  const sd = LIGHT[0] * d >= 0 ? 1 : -1, m = .45 + .55 * Math.min(1, Math.abs(LIGHT[0]) * 1.4), x0 = 18 * sd, x1 = -16 * sd;
  const tg = g.createLinearGradient(x0, -40, x1, -20); const Lt2 = shade(col, .24 * m), Dt = shade(col, -.45 * m); if (ART === 'bd') { tg.addColorStop(0, Lt2); tg.addColorStop(.3, Lt2); tg.addColorStop(.31, col); tg.addColorStop(.62, col); tg.addColorStop(.63, Dt); tg.addColorStop(.92, Dt); tg.addColorStop(1, shade(col, -.28 * m)); } else { tg.addColorStop(0, shade(col, .28 * m)); tg.addColorStop(.25, shade(col, .08 * m)); tg.addColorStop(.55, col); tg.addColorStop(.85, Dt); tg.addColorStop(1, shade(col, -.25 * m)); }
  g.fillStyle = f.flash > 0 ? C(col) : tg; g.fill();
  if (f.flash <= 0) { const vg = g.createLinearGradient(0, -60, 0, 0); vg.addColorStop(0, 'rgba(255,246,226,.1)'); vg.addColorStop(.5, 'rgba(255,246,226,0)'); vg.addColorStop(1, 'rgba(20,10,16,.22)'); g.fillStyle = vg; g.fill(); } g.strokeStyle = INK; g.lineWidth = INKW; g.stroke(); }
function drawTorsoS(g, f, j, L, C) {
  const S = norm(L), d = f.dir, tor = f.pose.torso * DEG;
  g.save(); g.translate(j.gx, j.gy); g.rotate(tor * d); g.scale(d, 1);
  const ruff = () => { g.fillStyle = C('#f2ecdc'); g.beginPath(); g.ellipse(1, -59, 13, 5.5, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(120,110,95,.6)'; g.lineWidth = .8; for (let k = -11; k <= 11; k += 3) { g.beginPath(); g.moveTo(k, -63); g.lineTo(k * .9, -55); g.stroke(); } };
  switch (S.style) {
    case 'rodeur': {
      torsoPath(g, S); fillTorso(g, f, S, S.coat, C, d);
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(14, -6); g.quadraticCurveTo(17, -30, 10, -54); g.stroke(); // couture
      g.strokeStyle = C(S.trim); g.lineWidth = 1.2; for (let y = -46; y < -14; y += 6) { g.beginPath(); g.moveTo(11, y); g.lineTo(16, y + 4); g.moveTo(16, y); g.lineTo(11, y + 4); g.stroke(); } // laçage
      g.fillStyle = C(shade(S.boot, -.1)); g.fillRect(-16, -9, 33, 6); g.fillStyle = C(S.trim); g.fillRect(10, -10, 6, 8); g.fillStyle = C(S.boot); g.beginPath(); g.ellipse(-14, -2, 6, 7, 0, 0, 7); g.fill(); // ceinturon, boucle, bourse
      g.fillStyle = C(S.coat2); g.beginPath(); g.ellipse(0, -58, 12, 6, 0, 0, 7); g.fill(); // foulard
      // mantelet sur les épaules
      g.fillStyle = C(shade(S.cape || S.coat2, -.1)); g.beginPath(); g.moveTo(-17, -57); g.quadraticCurveTo(0, -64, 13, -55); g.quadraticCurveTo(18, -44, 12, -36); g.quadraticCurveTo(-2, -40, -18, -36); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.4)'; g.stroke();
      break;
    }
    case 'paysan': {
      torsoPath(g, S, 2); fillTorso(g, f, S, S.coat, C, d); // chemise ample
      g.strokeStyle = 'rgba(0,0,0,.16)'; for (const [a, b] of [[-8, -40], [2, -30], [-4, -20], [8, -44]]) { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo(a + 6, b + 4, a + 3, b + 12); g.stroke(); }
      g.fillStyle = C(S.coat2); g.beginPath(); g.moveTo(-12, -6); g.lineTo(-14, -48); g.lineTo(-6, -54); g.lineTo(-2, -8); g.closePath(); g.fill(); // gilet (dos)
      g.beginPath(); g.moveTo(9, -6); g.lineTo(12, -48); g.lineTo(16, -40); g.lineTo(16, -8); g.closePath(); g.fill(); // gilet (devant)
      g.fillStyle = C(S.skin); g.beginPath(); g.moveTo(2, -59); g.lineTo(9, -57); g.lineTo(6, -49); g.closePath(); g.fill(); // col ouvert
      g.strokeStyle = C('#b89a68'); g.lineWidth = 2.5; g.beginPath(); g.moveTo(-14, -6); g.quadraticCurveTo(0, -3, 15, -6); g.stroke(); g.beginPath(); g.moveTo(14, -5); g.lineTo(17, 4); g.stroke(); // ceinture de corde
      break;
    }
    case 'moine': {
      g.fillStyle = C(shade(S.coat, -.2)); g.beginPath(); g.ellipse(-9, -56, 12, 8, -.3, 0, 7); g.fill(); // capuchon rabattu
      torsoPath(g, S, 3); fillTorso(g, f, S, S.coat, C, d);
      g.fillStyle = C(S.coat2); g.beginPath(); g.moveTo(9, -57); g.lineTo(15, -52); g.lineTo(17, -6); g.lineTo(10, -6); g.closePath(); g.fill(); // scapulaire
      g.strokeStyle = C('#d8ccb0'); g.lineWidth = 2.6; g.beginPath(); g.moveTo(-16, -7); g.quadraticCurveTo(0, -3, 17, -7); g.stroke(); g.lineWidth = 1.8; g.beginPath(); g.moveTo(15, -6); g.quadraticCurveTo(19, 6, 16, 22); g.moveTo(13, -6); g.quadraticCurveTo(15, 8, 12, 18); g.stroke(); // cordelière
      g.fillStyle = C('#d8ccb0'); for (const y of [4, 12]) { g.beginPath(); g.arc(17.5, y, 1.8, 0, 7); g.fill(); }
      g.fillStyle = C(shade(S.coat, -.1)); g.beginPath(); g.ellipse(2, -59, 12, 5, 0, 0, 7); g.fill(); // col
      break;
    }
    case 'dame': {
      torsoPath(g, S); fillTorso(g, f, S, S.coat, C, d);
      g.fillStyle = C(S.trim); g.beginPath(); g.moveTo(8, -48); g.lineTo(16, -46); g.lineTo(15, -6); g.lineTo(18, 6); g.lineTo(9, -6); g.closePath(); g.fill(); // busc / pièce d'estomac
      g.strokeStyle = C(shade(S.trim, -.45)); g.lineWidth = .9; for (let y = -42; y < -8; y += 5) { g.beginPath(); g.moveTo(10, y); g.lineTo(15, y + 3); g.moveTo(15, y); g.lineTo(10, y + 3); g.stroke(); } // laçage
      g.fillStyle = C(S.skin); g.beginPath(); g.moveTo(-4, -58); g.lineTo(5, -59); g.lineTo(15, -50); g.lineTo(9, -47); g.lineTo(-3, -51); g.closePath(); g.fill(); // décolleté carré
      g.strokeStyle = C('#f2ecdc'); g.lineWidth = 1.6; g.beginPath(); g.moveTo(-3, -51); g.lineTo(9, -47); g.lineTo(15, -50); g.stroke(); // chemise
      g.fillStyle = C(shade(S.coat, -.15)); g.beginPath(); g.ellipse(3, -51, 8, 4.5, -.3, 0, 7); g.fill();
      break;
    }
    default: {
      g.fillStyle = C(S.coat2); g.beginPath(); g.moveTo(-15, -6); g.lineTo(14, -6); g.lineTo(19, 11); g.lineTo(-19, 11); g.closePath(); g.fill(); // basques
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; for (const x of [-9, 0, 9]) { g.beginPath(); g.moveTo(x, -4); g.lineTo(x * 1.25, 11); g.stroke(); }
      torsoPath(g, S); fillTorso(g, f, S, S.coat, C, d);
      g.strokeStyle = 'rgba(0,0,0,.18)'; for (let y = -50; y < -6; y += 8) { g.beginPath(); g.moveTo(-14, y); g.quadraticCurveTo(2, y + 3, 16, y - 1); g.stroke(); }
      g.strokeStyle = C(S.trim); g.lineWidth = 1; g.globalAlpha = .6; g.setLineDash([1.6, 2.2]); g.beginPath(); g.moveTo(11, -52); g.quadraticCurveTo(17.5, -32, 13, -9); g.moveTo(-14, -9); g.lineTo(14, -9); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; // broderie au point de chaînette le long du devant
      g.fillStyle = C(S.trim); for (let k = 0; k < 7; k++) { const y = -10 - k * 6.5, x = (S.body === 'f' ? 13 : 15.5) - Math.abs(y + 30) * .06; g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); }
      g.fillStyle = C(shade(S.trim, -.3)); g.fillRect(-14, -7, 28, 4); g.fillStyle = C(S.trim); g.fillRect(9, -8, 5, 6);
      g.fillStyle = C(shade(S.coat, -.15)); g.beginPath(); g.ellipse(4, -51, 9, 5, -.3, 0, 7); g.fill();
      ruff();
    }
  }
  g.restore();
}
// ---- tête : visage d'homme ou de femme, coiffures, coiffes ----
function drawHeadS(g, f, j, L, C) {
  const S = norm(L), d = f.dir, tilt = (f.pose.torso + f.pose.head) * DEG, fem = S.body === 'f', hair = C(S.hair);
  g.save(); g.translate(j.head[0], j.head[1]); g.rotate(tilt * d); g.scale(d, 1);
  if (S.race === 'drac') { drawDracHead(g, f, S, C); g.restore(); return; }
  // cheveux longs et queue derrière la tête
  if (S.hairStyle === 'long') { g.fillStyle = hair; g.beginPath(); g.moveTo(-3, -9); g.quadraticCurveTo(-15, -4, -13, 10); g.quadraticCurveTo(-12, 20, -4, 24); g.quadraticCurveTo(-6, 14, -2, 8); g.closePath(); g.fill(); }
  if (S.hairStyle === 'queue') { g.strokeStyle = hair; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(-9, 2); g.quadraticCurveTo(-17, 10, -14, 24); g.stroke(); g.lineCap = 'butt'; g.fillStyle = C(S.trim); g.fillRect(-12, 1, 4, 4); }
  // visage
  const skin = C(S.skin);
  g.beginPath(); g.moveTo(-8, -8); g.quadraticCurveTo(0, -13, 7.5, -7.5); g.quadraticCurveTo(9.8, -4, 9.6, -1.5);
  if (fem) { g.lineTo(12.2, 3); g.quadraticCurveTo(11.8, 4.4, 10.4, 4.6); g.quadraticCurveTo(11.2, 6, 10.3, 7.2); g.quadraticCurveTo(11, 8.3, 9.9, 9.2); g.quadraticCurveTo(9.6, 11.6, 6.8, 12.2); g.quadraticCurveTo(3, 12.6, 0, 10); }
  else { const nz = S.nose || 0; g.lineTo(13.2 + nz, 3.4 + nz * .3); g.quadraticCurveTo(12.6 + nz, 4.8 + nz * .2, 10.6, 4.8); g.quadraticCurveTo(11.4, 6, 10.4, 7.3); g.quadraticCurveTo(11.2, 8.4, 10.2, 9.4); g.quadraticCurveTo(10.4, 12.2, 7.5, 13); g.quadraticCurveTo(3, 13.6, 0, 10.5); }
  g.lineTo(-6, 7.5); g.quadraticCurveTo(-11, 2, -8, -8); g.closePath();
  const gr = g.createLinearGradient(-10, -10, 12, 12); gr.addColorStop(0, shade(S.skin, .12)); gr.addColorStop(.6, S.skin); gr.addColorStop(1, shade(S.skin, -.3));
  g.fillStyle = f.flash > 0 ? skin : gr; g.fill(); g.strokeStyle = INK; g.lineWidth = INKW; g.stroke();
  if (f.flash <= 0) { // modelé du visage : orbite, pommette, ombre sous le nez et sous la mâchoire
    const rs = (x, y, r, c, a) => { const q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, c.replace('A', a)); q.addColorStop(1, c.replace('A', 0)); g.fillStyle = q; g.fillRect(x - r, y - r, r * 2, r * 2); };
    g.save(); g.clip(); rs(6.4, -2.6, 4.2, 'rgba(70,30,26,A)', .32); rs(6.5, 4.2, 4.8, 'rgba(200,80,70,A)', fem ? .26 : .16); rs(4, 12, 7, 'rgba(60,24,20,A)', .3); rs(-4, -4, 8, 'rgba(255,240,220,A)', .12); g.restore();
  }
  g.fillStyle = C(shade(S.skin, -.2)); g.beginPath(); g.ellipse(-1.5, 1.5, 2.6, 3.6, .2, 0, 7); g.fill(); // oreille
  g.strokeStyle = C(shade(S.skin, -.42)); g.lineWidth = .7; g.beginPath(); g.arc(-1.3, 1.5, 1.6, -1.2, 1.8); g.stroke();
  const ex = Face.of(f), bl = Face.blink(f), gz = Face.gaze(f, j), wide = ex === 'surpris' ? 1.25 : ex === 'rage' || ex === 'serre' || ex === 'concentre' ? .82 : ex === 'souffle' ? .9 : 1;
  g.fillStyle = '#f4efe6'; g.beginPath(); g.ellipse(6.4, -2.2, 2.1, 1.2 * wide, 0, 0, 7); g.fill();
  g.save(); g.beginPath(); g.ellipse(6.4, -2.2, 2.1, 1.2 * wide, 0, 0, 7); g.clip();
  g.fillStyle = '#3a2418'; g.beginPath(); g.arc(7.1 + gz[0], -2.2 + gz[1], .95, 0, 7); g.fill(); g.fillStyle = '#0c0806'; g.beginPath(); g.arc(7.25 + gz[0], -2.2 + gz[1], .5, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(7.3 + gz[0], -2.8 + gz[1], .5, .5); g.restore(); // reflet de l'œil
  if (bl > 0) { g.fillStyle = C(shade(S.skin, -.08)); g.beginPath(); g.ellipse(6.4, -2.2 - 1.3 * (1 - bl), 2.3, 1.4 * bl + .05, 0, 0, 7); g.fill(); } // paupière qui se ferme
  g.strokeStyle = 'rgba(40,18,12,.7)'; g.lineWidth = .8; g.beginPath(); g.moveTo(4.6, -2.8 + .9 * bl); g.quadraticCurveTo(6.6, -3.9 * wide + 1.9 * bl, 8.6, -2.7 + .9 * bl); g.stroke(); // paupière
  g.strokeStyle = 'rgba(80,30,24,.45)'; g.lineWidth = .7; g.beginPath(); g.moveTo(10.6, 4.4); g.quadraticCurveTo(9.6, 4.9, 9.4, 4.1); g.stroke(); // narine
  if (fem) { g.strokeStyle = '#1a1210'; g.lineWidth = 1; g.beginPath(); g.moveTo(5, -3.4); g.quadraticCurveTo(7.4, -4.4, 8.9, -3); g.stroke(); g.fillStyle = C('#b8565a'); g.beginPath(); g.ellipse(10.3, 7.2, 1.2, 1.4, 0, 0, 7); g.fill(); }
  // expression : sourcils lissés et bouche selon l'action puis l'état du corps (souffle court, blessure)
  const brow = Face.smooth(f, ex);
  g.strokeStyle = hair; g.lineWidth = fem ? 1.1 : 1.7; g.lineCap = 'round'; g.beginPath(); g.moveTo(3.8, brow[0]); g.quadraticCurveTo(6.5, brow[1], 9.2, brow[2]); g.stroke(); g.lineCap = 'butt';
  if (['pain', 'rage', 'serre', 'blesse'].includes(ex) && bl < .5) { g.strokeStyle = INK; g.lineWidth = .8; g.beginPath(); g.moveTo(4.6, -2.4); g.quadraticCurveTo(6.6, ex === 'pain' || ex === 'blesse' ? -1.2 : -2.9, 8.6, -2.2); g.stroke(); } // paupière plissée
  if (ex === 'blesse' || ex === 'serre' || ex === 'pain') { g.strokeStyle = 'rgba(70,30,24,.5)'; g.lineWidth = .6; g.beginPath(); g.moveTo(4.4, brow[0] - .8); g.lineTo(3.6, brow[0] - 2.2); g.stroke(); } // ride du front
  const mo = (w, h, y) => { g.fillStyle = '#3a1410'; g.beginPath(); g.ellipse(9.2, y || 8, w, h, 0, 0, 7); g.fill(); };
  if (ex === 'rage') { mo(1.7, 1.3); g.fillStyle = 'rgba(255,250,240,.8)'; g.fillRect(8, 7, 2.4, .6); } // dents serrées
  else if (ex === 'pain') mo(1.7, 1.4);
  else if (ex === 'surpris') mo(1, 1.1);
  else if (ex === 'souffle') { const o = .6 + .5 * Math.abs(Math.sin(G.time * 5)); mo(1.3, o, 8.2); } // halète
  else if (ex === 'ko') { g.strokeStyle = INK; g.lineWidth = .8; g.beginPath(); g.moveTo(7.8, 8.6); g.quadraticCurveTo(9.2, 9.4, 10.6, 8.3); g.stroke(); }
  else if (ex === 'serre' || ex === 'blesse') { g.strokeStyle = 'rgba(50,16,12,.85)'; g.lineWidth = .9; g.beginPath(); g.moveTo(7.6, 7.6); g.lineTo(10.6, 7.9); g.stroke(); g.fillStyle = 'rgba(255,250,240,.6)'; if (ex === 'serre') g.fillRect(8.2, 7.3, 2, .5); } // mâchoire serrée
  else if (ex === 'ruse') { g.strokeStyle = INK; g.lineWidth = .9; g.beginPath(); g.moveTo(7.8, 8); g.quadraticCurveTo(9.4, 8.2, 10.8, 6.8); g.stroke(); } // sourire en coin
  if (f.talking && ex === 'neutre') { const o = .25 + .95 * Math.abs(Math.sin(G.time * 13 + Math.sin(G.time * 5) * 2)); g.fillStyle = '#3a1410'; g.beginPath(); g.ellipse(9.3, 8, 1.4, o, 0, 0, 7); g.fill(); } // il parle : la bouche s'ouvre et se ferme
  if (ex === 'joie') { g.strokeStyle = INK; g.lineWidth = .9; g.beginPath(); g.moveTo(7.6, 7.4); g.quadraticCurveTo(9.4, 9, 10.8, 7); g.stroke(); }
  if ((ex === 'souffle' || ex === 'blesse' || ex === 'serre') && f.flash <= 0) { // sueur sur la tempe
    const y = -5 + ((G.time * .9 + (f.isPlayer ? 0 : .5)) % 1) * 9; g.fillStyle = 'rgba(220,235,255,.75)'; g.beginPath(); g.moveTo(2.2, y - 1.8); g.quadraticCurveTo(3.4, y, 2.2, y + .9); g.quadraticCurveTo(1, y, 2.2, y - 1.8); g.fill(); }
  g.strokeStyle = 'rgba(60,24,18,.55)'; g.lineWidth = .7; g.beginPath(); g.moveTo(9.4, -3); g.quadraticCurveTo(11.6, 0, 12, 3); g.stroke(); // arête du nez
  g.beginPath(); g.moveTo(8.4, 5.6); g.quadraticCurveTo(6.6, 5, 5.6, 3.6); g.stroke(); // pli de la joue
  if (!fem) { g.strokeStyle = 'rgba(80,40,30,.6)'; g.lineWidth = .8; g.beginPath(); g.moveTo(8.4, 7.5); g.quadraticCurveTo(9.4, 7.1, 10.4, 7.3); g.stroke(); g.strokeStyle = 'rgba(255,230,210,.25)'; g.beginPath(); g.moveTo(8.8, 8.4); g.lineTo(10, 8.3); g.stroke(); }
  if (S.age === 'vieux' && f.flash <= 0) { g.strokeStyle = 'rgba(80,40,30,.45)'; g.lineWidth = .6; for (const y of [-7.6, -6.2]) { g.beginPath(); g.moveTo(2.5, y); g.quadraticCurveTo(5.5, y - .8, 8.6, y + .2); g.stroke(); } g.beginPath(); g.moveTo(9.2, -1.6); g.lineTo(10.6, -.6); g.moveTo(9.1, -2.6); g.lineTo(10.7, -2.4); g.stroke(); } // rides du front et pattes d'oie
  if (S.scar && f.flash <= 0) { g.strokeStyle = 'rgba(150,70,60,.75)'; g.lineWidth = .9; g.beginPath(); g.moveTo(4.2, 1); g.lineTo(7.4, 6.2); g.stroke(); g.strokeStyle = 'rgba(255,230,210,.35)'; g.lineWidth = .4; g.beginPath(); g.moveTo(4.6, 1.2); g.lineTo(7.8, 6.2); g.stroke(); } // balafre
  // chevelure
  if (S.hairStyle !== 'chauve') {
    g.fillStyle = hair; g.beginPath(); g.moveTo(6, -8.5); g.quadraticCurveTo(-1, -14, -9, -7); g.quadraticCurveTo(-12.5, 1, -8.5, 8.5); g.quadraticCurveTo(-5, 6, -3.5, 2); g.quadraticCurveTo(-2, -4, 6, -8.5); g.closePath(); g.fill();
    if (fem || S.hairStyle === 'long') { g.beginPath(); g.moveTo(7, -8.6); g.quadraticCurveTo(2, -8, -2, -4); g.quadraticCurveTo(1, -10, 7, -8.6); g.fill(); }
    g.strokeStyle = C(shade(S.hair, .35)); g.globalAlpha = .45; g.lineWidth = .6; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(3 - k * 3, -9.5 + k * .4); g.quadraticCurveTo(-4 - k * 2, -7 + k, -7 - k * .6, 1 + k * 2); g.stroke(); } g.globalAlpha = 1;
  }
  if (S.hairStyle === 'tonsure') { g.fillStyle = C(shade(S.skin, .05)); g.beginPath(); g.ellipse(-1, -10.4, 6.5, 3, -.15, 0, 7); g.fill(); }
  if (S.hairStyle === 'chignon') { g.fillStyle = hair; g.beginPath(); g.arc(-10.5, -3, 5, 0, 7); g.fill(); g.strokeStyle = C(shade(S.hair, -.3)); g.lineWidth = .8; g.beginPath(); g.arc(-10.5, -3, 3, 0, 5); g.stroke(); }
  // barbe
  if (!fem && S.beard !== 'none') { g.fillStyle = hair; g.beginPath(); g.moveTo(10.6, 5.1); g.quadraticCurveTo(8, 4.6, 5.5, 6.5); g.quadraticCurveTo(8, 5.8, 9.6, 6.6); g.closePath(); g.fill(); g.strokeStyle = hair; g.lineWidth = 1.2; g.beginPath(); g.moveTo(6, 6.2); g.quadraticCurveTo(4, 6.5, 3.5, 4.6); g.stroke(); }
  if (!fem && S.beard === 'pointed') { g.fillStyle = hair; g.beginPath(); g.moveTo(10, 9.6); g.quadraticCurveTo(10.6, 13, 9.2, 19); g.quadraticCurveTo(7, 14, 6, 12.6); g.quadraticCurveTo(8.5, 12.6, 10, 9.6); g.fill(); }
  if (!fem && S.beard === 'full') { g.fillStyle = hair; g.beginPath(); g.moveTo(10.3, 8.6); g.quadraticCurveTo(11.5, 15, 7.5, 18.5); g.quadraticCurveTo(1, 18, -2, 9.5); g.quadraticCurveTo(-.5, 6, 2, 6.5); g.quadraticCurveTo(5, 10.5, 8.6, 9.4); g.closePath(); g.fill(); }
  // coiffes
  const hatC = S.hat || S.coat2;
  const plume = () => { if (!S.plume) return; g.save(); const sw = clamp((f.vx || 0) * d * -.0016 + Math.sin(G.time * 3.1 + (f.isPlayer ? 0 : 2)) * .05 + (f.state === 'attack' ? -.08 : 0), -.25, .25); g.translate(2, -18); g.rotate(sw); g.translate(-2, 18); // la plume ondule
 const pg = g.createLinearGradient(0, -24, -36, -10); pg.addColorStop(0, C(S.plume)); pg.addColorStop(1, C(shade(S.plume, -.25)));
    g.fillStyle = pg; g.beginPath(); g.moveTo(4, -20); g.quadraticCurveTo(-12, -40, -36, -24); g.quadraticCurveTo(-30, -20, -24, -21); g.quadraticCurveTo(-14, -30, 1, -17); g.closePath(); g.fill();
    g.strokeStyle = C(shade(S.plume, -.35)); g.lineWidth = .8; for (let k = 0; k < 6; k++) { const t = k / 6, x = lerp(2, -30, t), y = -20 - Math.sin(t * Math.PI) * 9; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 4, y + 4); g.stroke(); } g.restore(); };
  switch (f.hatOff ? 'aucun' : S.hatType) {
    case 'feutre': {
      plume(); g.fillStyle = C(hatC); g.beginPath(); g.moveTo(-9, -11); g.quadraticCurveTo(-10, -23, 0, -24); g.quadraticCurveTo(10, -23, 9.5, -11); g.closePath(); g.fill();
      g.fillStyle = C(S.trim); g.fillRect(-9.6, -14.5, 19.2, 2.8);
      const bg = g.createLinearGradient(0, -14, 0, -6); bg.addColorStop(0, shade(hatC, .2)); bg.addColorStop(1, shade(hatC, -.3));
      g.fillStyle = f.flash > 0 ? C(hatC) : bg; g.beginPath(); g.ellipse(1, -10.5, 23, 4.6, -.1, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = INKW; g.stroke(); break;
    }
    case 'beret': {
      if (S.plume) { g.save(); g.translate(14, 6); g.scale(.6, .6); plume(); g.restore(); }
      g.fillStyle = C(hatC); g.beginPath(); g.ellipse(-1, -12.5, 13.5, 5.8, -.2, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = INKW; g.stroke();
      g.fillStyle = C(shade(hatC, -.25)); g.beginPath(); g.ellipse(1, -9.6, 11, 2.2, -.1, 0, 7); g.fill(); break;
    }
    case 'capuche': {
      g.fillStyle = C(hatC); g.beginPath(); g.moveTo(9, -7); g.quadraticCurveTo(4, -17, -4, -16); g.quadraticCurveTo(-16, -14, -16, 0); g.quadraticCurveTo(-15, 12, -8, 17); g.lineTo(2, 14); g.quadraticCurveTo(-1, 6, 1, -1); g.quadraticCurveTo(3, -6, 9, -7); g.closePath(); g.fill();
      g.strokeStyle = INK; g.lineWidth = INKW; g.stroke(); g.strokeStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.moveTo(8, -6); g.quadraticCurveTo(2, -4, 2, 6); g.stroke(); break;
    }
    case 'paille': {
      const st = '#d8b866'; g.fillStyle = C(shade(st, -.1)); g.beginPath(); g.moveTo(-8, -11); g.quadraticCurveTo(-6, -21, 1, -21); g.quadraticCurveTo(8, -21, 9, -11); g.closePath(); g.fill();
      g.fillStyle = C(st); g.beginPath(); g.ellipse(1, -10.5, 25, 4.2, -.08, 0, 7); g.fill(); g.strokeStyle = 'rgba(90,60,20,.5)'; g.lineWidth = .7; for (let k = -20; k <= 20; k += 5) { g.beginPath(); g.moveTo(k + 1, -13); g.lineTo(k * 1.1 + 1, -7); g.stroke(); }
      g.fillStyle = C('#7a4a2a'); g.fillRect(-8.5, -13.5, 17, 2.2); break;
    }
  }
  g.restore();
}

// ---- drac : tête reptilienne (museau, cornes, œil fendu, écailles) et queue ----
function drawDracHead(g, f, S, C) {
  const sk = S.skin;
  g.fillStyle = C(shade(sk, -.4)); // cornes et crête
  g.beginPath(); g.moveTo(-3, -10); g.quadraticCurveTo(-14, -22, -25, -18); g.quadraticCurveTo(-15, -15, -8, -5); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(1, -11); g.quadraticCurveTo(-6, -24, -14, -25); g.quadraticCurveTo(-7, -18, -3, -8); g.closePath(); g.fill();
  for (let k = 0; k < 4; k++) { const x = -8 - k * 2.2, y = -4 + k * 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y + 1); g.lineTo(x, y + 3); g.fill(); } // collerette
  g.beginPath(); g.moveTo(-9, -6); g.quadraticCurveTo(-6, -13, 3, -11); g.quadraticCurveTo(12, -8, 19, -4); g.quadraticCurveTo(21.5, -2, 19.5, .5); g.lineTo(17, 1.5);
  g.quadraticCurveTo(12, 5.5, 6, 8.5); g.quadraticCurveTo(0, 11, -5, 8); g.quadraticCurveTo(-11, 3, -9, -6); g.closePath();
  const gr = g.createLinearGradient(-10, -12, 14, 10); gr.addColorStop(0, shade(sk, .18)); gr.addColorStop(.55, sk); gr.addColorStop(1, shade(sk, -.4));
  g.fillStyle = f.flash > 0 ? C(sk) : gr; g.fill(); g.strokeStyle = INK; g.lineWidth = INKW; g.stroke();
  g.save(); g.clip(); g.strokeStyle = C(shade(sk, -.3)); g.globalAlpha = .45; g.lineWidth = .7; // écailles
  for (let y = -12; y < 10; y += 3) for (let x = -10 + (y / 3 % 2) * 1.5; x < 20; x += 3) { g.beginPath(); g.arc(x, y, 1.6, .2, Math.PI - .2); g.stroke(); }
  g.restore();
  g.strokeStyle = 'rgba(30,10,10,.75)'; g.lineWidth = 1; g.beginPath(); g.moveTo(18, 1); g.quadraticCurveTo(11, 3.6, 3, 4.6); g.stroke(); // gueule
  g.fillStyle = '#efe8d4'; for (const x of [6, 9, 12, 15]) { g.beginPath(); g.moveTo(x, 3.6 - (x - 6) * .2); g.lineTo(x + 1, 6 - (x - 6) * .2); g.lineTo(x + 2, 3.4 - (x - 6) * .2); g.fill(); }
  g.fillStyle = 'rgba(20,10,10,.8)'; g.beginPath(); g.ellipse(17, -2.6, 1, .6, -.3, 0, 7); g.fill(); // narine
  g.strokeStyle = C(shade(sk, -.5)); g.lineWidth = 1.6; g.beginPath(); g.moveTo(1.5, -6.5); g.quadraticCurveTo(5.5, -8.5, 9.5, -6); g.stroke(); // arcade
  g.fillStyle = '#f2c22a'; g.beginPath(); g.ellipse(5.6, -4, 2.6, 1.7, 0, 0, 7); g.fill(); glow(g, 5.6, -4, 5, 'rgba(255,200,60,A)', .35);
  g.fillStyle = '#140c06'; g.beginPath(); g.ellipse(5.9, -4, .55, 1.6, 0, 0, 7); g.fill(); // pupille fendue
}
function drawTail(g, f, j, S, C) {
  const d = f.dir, t = G.time * 2.2 + (f.isPlayer ? 0 : 1.3), sw = Math.sin(t) * 6 + (f.state === 'attack' ? -6 : 0) + clamp(-f.vx * .05, -8, 8);
  const P0 = [j.gx - d * 8, j.gy + 2], P1 = [j.gx - d * 46, j.gy + 22 + sw * .3], P2 = [j.gx - d * (76 + sw), GROUND - 22], P3 = [j.gx - d * (104 + sw * 1.4), GROUND - 10 + Math.sin(t * 1.3) * 4];
  const pt = u => { const v = 1 - u; return [v * v * v * P0[0] + 3 * v * v * u * P1[0] + 3 * v * u * u * P2[0] + u * u * u * P3[0], v * v * v * P0[1] + 3 * v * v * u * P1[1] + 3 * v * u * u * P2[1] + u * u * u * P3[1]]; };
  const L = [], R = []; const n = 18;
  for (let i = 0; i <= n; i++) { const u = i / n, a = pt(Math.max(0, u - .01)), b = pt(Math.min(1, u + .01)), p = pt(u), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = lerp(11, 1.2, u) / 2; L.push([p[0] - dy / l * w, p[1] + dx / l * w]); R.push([p[0] + dy / l * w, p[1] - dx / l * w]); }
  g.beginPath(); g.moveTo(L[0][0], L[0][1]); for (const q of L) g.lineTo(q[0], q[1]); for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath();
  const gr = g.createLinearGradient(P0[0], P0[1] - 10, P0[0], P0[1] + 30); gr.addColorStop(0, shade(S.skin, .1)); gr.addColorStop(1, shade(S.skin, -.45)); g.fillStyle = f.flash > 0 ? C(S.skin) : gr; g.fill();
  g.fillStyle = C(shade(S.skin, -.45)); for (let i = 2; i < n - 1; i += 2) { const q = R[i], u = i / n, s = lerp(4.5, 1.2, u); g.beginPath(); g.moveTo(q[0] - s, q[1]); g.lineTo(q[0], q[1] - s * 1.4); g.lineTo(q[0] + s, q[1]); g.fill(); } // épines dorsales
}
