// =============================== 3.0 · sprint 30 : trois décors de Madrid ===============================
// La Plaza Mayor au soleil, une académie de la destreza (le cercle tracé au sol), la cour de l'Alcázar de nuit, aux flambeaux.

function paintPlaza(g) {
  const R = rng(1619);
  skyGrad(g, 0, 300, [[0, '#4a86c8'], [.6, '#8ab8e0'], [1, '#e8dcc0']]);
  cloudBank(g, R, 300, 80, 380, 28, 'rgba(255,255,255,.75)', 'rgba(255,250,235,.9)', 'rgba(170,180,200,.4)', 820, 40, 14);
  glow(g, 840, 40, 220, 'rgba(255,240,200,A)', .35);
  // façades de brique rouge, trois étages de balcons, toits d'ardoise et chapiteaux des tours
  const facade = (x0, x1, top) => {
    masonry(g, x0, top, x1 - x0, 330 - top, 14, 7, [150, 72, 52], R, { grimeA: .3 });
    g.fillStyle = '#2a2a34'; g.beginPath(); g.moveTo(x0 - 6, top); g.lineTo(x0 + 12, top - 26); g.lineTo(x1 - 12, top - 26); g.lineTo(x1 + 6, top); g.fill();
    for (let x = x0 + 14; x < x1 - 20; x += 44) for (let k = 0; k < 3; k++) { const y = top + 18 + k * 44; g.fillStyle = '#e8dcc4'; g.fillRect(x - 3, y - 3, 26, 34); g.fillStyle = '#1e1a1e'; g.fillRect(x, y, 20, 28); g.fillStyle = 'rgba(120,160,210,.25)'; g.fillRect(x + 2, y + 2, 7, 24);
      g.strokeStyle = '#141014'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - 5, y + 30); g.lineTo(x + 25, y + 30); for (let b = 0; b <= 6; b++) { g.moveTo(x - 5 + b * 5, y + 30); g.lineTo(x - 5 + b * 5, y + 22); } g.moveTo(x - 5, y + 22); g.lineTo(x + 25, y + 22); g.stroke(); } // balcons de fer
  };
  facade(-20, 380, 120); facade(580, 980, 120);
  // la Casa de la Panadería au fond, avec ses deux tours à flèche
  masonry(g, 380, 96, 200, 234, 14, 7, [168, 84, 60], R, { grimeA: .25 });
  for (const tx of [380, 548]) { g.fillStyle = '#9a4a34'; g.fillRect(tx, 60, 32, 50); g.fillStyle = '#26262e'; g.beginPath(); g.moveTo(tx - 4, 62); g.lineTo(tx + 16, 14); g.lineTo(tx + 36, 62); g.fill(); g.strokeStyle = '#26262e'; g.lineWidth = 2; g.beginPath(); g.moveTo(tx + 16, 14); g.lineTo(tx + 16, 2); g.stroke(); }
  g.fillStyle = '#e8dcc4'; g.fillRect(380, 92, 200, 6); g.fillStyle = '#2a2a6a'; g.fillRect(452, 150, 56, 40); g.fillStyle = '#d8b25e'; g.beginPath(); g.arc(480, 170, 12, 0, 7); g.fill(); // blason
  // arcades du rez-de-chaussée, ombre des portiques
  g.fillStyle = '#e0d0b0'; g.fillRect(0, 330, W, 12);
  for (let x = -10; x < W; x += 64) { g.fillStyle = '#c8b898'; g.fillRect(x, 342, 14, 88); g.fillStyle = '#2a1c18'; g.beginPath(); g.moveTo(x + 14, 430); g.lineTo(x + 14, 366); g.quadraticCurveTo(x + 39, 340, x + 64, 366); g.lineTo(x + 64, 430); g.fill(); g.fillStyle = 'rgba(255,200,130,.18)'; g.fillRect(x + 22, 386, 34, 44); }
  for (let i = 0; i < 9; i++) person(g, 40 + i * 104 + R() * 30, 430, 30 + R() * 10, ['bourgeois', 'dame', 'porteur', 'moine'][Math.floor(R() * 4)], R, { dir: R() < .5 ? 1 : -1 });
  // étals et toile tendue
  for (const x of [120, 760]) { g.fillStyle = '#6a4a2a'; g.fillRect(x, 400, 90, 30); g.fillStyle = x < 400 ? '#c8a050' : '#a83a2a'; g.beginPath(); g.moveTo(x - 10, 372); g.lineTo(x + 100, 372); g.lineTo(x + 92, 392); g.lineTo(x - 2, 392); g.fill(); g.fillStyle = '#e8c87a'; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(x + 12 + k * 13, 398, 5, 0, 7); g.fill(); } }
  // pavé ocre au soleil, ombres portées des arcades
  cobbles(g, 430, R, '186,150,110');
  const sh = g.createLinearGradient(0, 430, 0, H); sh.addColorStop(0, 'rgba(255,230,180,.12)'); sh.addColorStop(1, 'rgba(60,30,20,.3)'); g.fillStyle = sh; g.fillRect(0, 430, W, 110);
  g.fillStyle = 'rgba(60,30,20,.22)'; for (let x = -40; x < W; x += 64) { g.beginPath(); g.moveTo(x, 430); g.lineTo(x + 30, 430); g.lineTo(x + 70, 470); g.lineTo(x + 40, 470); g.fill(); }
}

function paintAcademia(g) {
  const R = rng(1582);
  // murs chaulés, poutres sombres, haute fenêtre au soleil d'Espagne
  const wall = g.createLinearGradient(0, 0, 0, 430); wall.addColorStop(0, '#d8ccb4'); wall.addColorStop(1, '#bfae90'); g.fillStyle = wall; g.fillRect(0, 0, W, 430);
  for (let i = 0; i < 700; i++) { g.fillStyle = rgba(R() < .5 ? '150,130,100' : '250,245,230', .05 + R() * .08); g.fillRect(R() * W, R() * 430, 4 + R() * 16, 2 + R() * 5); }
  g.fillStyle = '#3a2618'; g.fillRect(0, 0, W, 34); for (let x = 20; x < W; x += 110) g.fillRect(x, 0, 20, 52);
  for (const x of [80, 760]) { g.fillStyle = '#5a3a20'; g.fillRect(x - 10, 70, 140, 200); const sky = g.createLinearGradient(0, 80, 0, 260); sky.addColorStop(0, '#5a9ad8'); sky.addColorStop(1, '#e8e0c8'); g.fillStyle = sky; g.fillRect(x, 80, 120, 180); g.strokeStyle = '#2a1a10'; g.lineWidth = 6; g.strokeRect(x, 80, 120, 180); g.lineWidth = 3; g.beginPath(); g.moveTo(x + 60, 80); g.lineTo(x + 60, 260); g.moveTo(x, 170); g.lineTo(x + 120, 170); g.stroke();
    g.fillStyle = '#c8b898'; g.fillRect(x + 6, 210, 108, 50); g.fillStyle = '#a89878'; for (let k = 0; k < 4; k++) g.fillRect(x + 8 + k * 28, 196 - R() * 20, 22, 64); } // toits de Madrid
  rays(g, [[80, 200, 80, 300, 520, 470, .2], [760, 880, 80, 640, 860, 470, .16]], 'rgba(255,240,200,A)');
  // tableau de géométrie : le cercle et ses cordes, comme dans les traités de la destreza
  const cx = 480, cy = 170; g.fillStyle = '#efe6d0'; g.fillRect(cx - 120, cy - 110, 240, 220); g.strokeStyle = '#5a3a20'; g.lineWidth = 5; g.strokeRect(cx - 120, cy - 110, 240, 220);
  g.strokeStyle = 'rgba(60,40,30,.8)'; g.lineWidth = 1.6; g.beginPath(); g.arc(cx, cy, 86, 0, 7); g.stroke(); g.beginPath(); g.arc(cx, cy, 44, 0, 7); g.stroke();
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.beginPath(); g.moveTo(cx + Math.cos(a) * 86, cy + Math.sin(a) * 86); g.lineTo(cx - Math.cos(a) * 86, cy - Math.sin(a) * 86); g.stroke(); }
  g.beginPath(); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; const px = cx + Math.cos(a) * 86, py = cy + Math.sin(a) * 86; if (k) g.lineTo(px, py); else g.moveTo(px, py); } g.closePath(); g.stroke();
  g.fillStyle = '#7a2a1a'; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.beginPath(); g.arc(cx + Math.cos(a) * 86, cy + Math.sin(a) * 86, 3.5, 0, 7); g.fill(); }
  // râteliers d'épées et blasons
  for (const x of [270, 630]) { g.fillStyle = '#4a2e1a'; g.fillRect(x, 230, 60, 10); g.fillRect(x, 330, 60, 10); for (let k = 0; k < 5; k++) { const bx = x + 6 + k * 12; g.strokeStyle = '#c8ccd2'; g.lineWidth = 2; g.beginPath(); g.moveTo(bx, 236); g.lineTo(bx, 336); g.stroke(); g.strokeStyle = '#b89048'; g.lineWidth = 2.4; g.beginPath(); g.arc(bx, 244, 5, Math.PI, 0); g.stroke(); } }
  // lambris bas
  woodPanel(g, 0, 380, W, 50, '96,62,36', R, true); g.fillStyle = '#3a2414'; g.fillRect(0, 376, W, 6);
  // sol de tomettes, et le grand cercle mystérieux peint au sol
  g.fillStyle = '#a8603a'; g.fillRect(0, 430, W, H - 430);
  for (let y = 430, r = 0; y < H; y += 14, r++) for (let x = (r % 2) * 18; x < W; x += 36) { const s = .85 + R() * .3; g.fillStyle = `rgb(${168 * s | 0},${96 * s | 0},${58 * s | 0})`; g.fillRect(x + 1, y + 1, 34, 12); }
  g.save(); g.translate(480, 490); g.scale(1, .2); g.strokeStyle = 'rgba(250,240,220,.75)'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 330, 0, 7); g.stroke(); g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 170, 0, 7); g.stroke();
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4; g.beginPath(); g.moveTo(Math.cos(a) * 330, Math.sin(a) * 330); g.lineTo(-Math.cos(a) * 330, -Math.sin(a) * 330); g.stroke(); } g.restore();
  const sh = g.createLinearGradient(0, 430, 0, H); sh.addColorStop(0, 'rgba(255,230,180,.1)'); sh.addColorStop(1, 'rgba(40,20,10,.35)'); g.fillStyle = sh; g.fillRect(0, 430, W, 110);
}

function paintAlcazar(g) {
  const R = rng(1561);
  skyGrad(g, 0, 220, [[0, '#050814'], [1, '#1a1e3a']]);
  g.fillStyle = '#fff'; for (let i = 0; i < 120; i++) { g.globalAlpha = R() * .7 + .2; g.fillRect(R() * W, R() * 200, 1.3, 1.3); } g.globalAlpha = 1;
  // cour à deux étages d'arcades de pierre, tours à flèches d'ardoise
  for (const tx of [40, 860]) { masonry(g, tx, 40, 70, 300, 18, 9, [96, 92, 100], R, { grimeA: .5 }); g.fillStyle = '#1a1a26'; g.beginPath(); g.moveTo(tx - 8, 44); g.lineTo(tx + 35, -30); g.lineTo(tx + 78, 44); g.fill(); g.fillStyle = 'rgba(255,190,110,.75)'; g.fillRect(tx + 28, 110, 12, 22); }
  masonry(g, 110, 110, 750, 320, 24, 11, [104, 98, 104], R, { grimeA: .45 });
  for (let row = 0; row < 2; row++) { const y0 = row ? 300 : 150, hh = row ? 130 : 110;
    for (let x = 120; x < 850; x += 92) { g.fillStyle = '#0e0c14'; g.beginPath(); g.moveTo(x + 14, y0 + hh); g.lineTo(x + 14, y0 + 40); g.quadraticCurveTo(x + 46, y0 - 4, x + 78, y0 + 40); g.lineTo(x + 78, y0 + hh); g.fill(); g.fillStyle = 'rgba(255,170,80,.12)'; g.fillRect(x + 22, y0 + 60, 48, hh - 60);
      g.fillStyle = '#7a747c'; g.fillRect(x, y0 + 20, 14, hh - 20); g.fillStyle = 'rgba(255,190,120,.22)'; g.fillRect(x + 10, y0 + 20, 3, hh - 20); }
    g.fillStyle = '#5a5660'; g.fillRect(110, y0 + hh - 2, 750, 8); }
  // azulejos en frise, blason royal tendu
  for (let x = 110; x < 860; x += 16) { g.fillStyle = (x / 16) % 2 ? '#2a4a8a' : '#d8d0c0'; g.fillRect(x, 282, 16, 12); g.fillStyle = '#d8b25e'; g.fillRect(x + 6, 286, 4, 4); }
  g.fillStyle = '#7a1a1e'; g.fillRect(440, 40, 80, 100); g.fillStyle = '#d8b25e'; g.beginPath(); g.moveTo(480, 60); g.lineTo(500, 80); g.lineTo(480, 120); g.lineTo(460, 80); g.closePath(); g.fill(); g.fillStyle = '#7a1a1e'; g.beginPath(); g.arc(480, 85, 8, 0, 7); g.fill();
  // flambeaux sur les piliers
  for (const x of [214, 490, 766]) { g.fillStyle = '#2a2018'; g.fillRect(x - 3, 330, 6, 22); g.fillStyle = '#3a2a1a'; g.beginPath(); g.moveTo(x - 9, 330); g.lineTo(x + 9, 330); g.lineTo(x + 5, 320); g.lineTo(x - 5, 320); g.fill(); glow(g, x, 312, 120, 'rgba(255,150,60,A)', .5); g.fillStyle = '#ffb040'; g.beginPath(); g.moveTo(x - 6, 320); g.quadraticCurveTo(x, 290, x + 6, 320); g.fill(); g.fillStyle = '#fff0b0'; g.beginPath(); g.moveTo(x - 2.5, 320); g.quadraticCurveTo(x, 304, x + 2.5, 320); g.fill(); }
  // gardes en faction, dans l'ombre
  person(g, 160, 430, 42, 'garde', R, { col: '#3a2a4a', cape: '#1a1420' }); person(g, 820, 430, 42, 'garde', R, { dir: -1, col: '#3a2a4a', cape: '#1a1420' });
  // dallage de la cour, éclats des flambeaux
  cobbles(g, 430, R, '92,88,96', { wet: '255,170,90' });
  for (const x of [214, 490, 766]) glow(g, x, 470, 130, 'rgba(255,150,70,A)', .16);
  const sh = g.createLinearGradient(0, 430, 0, H); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(4,4,12,.55)'); g.fillStyle = sh; g.fillRect(0, 430, W, 110);
}

Object.assign(VENUES, {
  plaza: { name: 'Plaza Mayor', draw: paintPlaza, tint: null, lights: [[840, 40, 260, 'rgba(255,236,190,A)']] },
  academia: { name: 'Académie de la destreza', draw: paintAcademia, tint: null, lights: [[140, 170, 120, 'rgba(255,240,200,A)'], [820, 170, 120, 'rgba(255,240,200,A)']] },
  alcazar: { name: 'Cour de l\'Alcázar', draw: paintAlcazar, tint: 'rgba(20,20,60,.08)', lights: [[214, 312, 70, 'rgba(255,150,60,A)'], [490, 312, 70, 'rgba(255,150,60,A)'], [766, 312, 70, 'rgba(255,150,60,A)']] },
});
VENUE_KEYS.push('plaza', 'academia', 'alcazar');
Object.assign(LIGHTING, {
  plaza: { from: [.6, -.8], key: '255,244,220', keyA: .18, shade: '60,34,30', shadeA: .42, rim: '255,248,230', rimA: .8, amb: '255,220,170', ambA: .07, cast: [-.5, .3], castA: .22, glaze: 'rgba(120,70,30,.08)' },
  academia: { from: [-.5, -.85], key: '255,246,226', keyA: .17, shade: '60,40,26', shadeA: .4, rim: '255,250,236', rimA: .75, amb: '255,226,180', ambA: .06, cast: [.4, .26], castA: .2, glaze: 'rgba(110,70,30,.08)' },
  alcazar: { from: [0, .2], key: '255,160,80', keyA: .15, shade: '14,12,34', shadeA: .5, rim: '255,170,90', rimA: .9, amb: '120,100,160', ambA: .08, cast: [0, .28], castA: .22, glaze: 'rgba(30,24,70,.14)' },
});
Object.assign(Paint.TINT, { plaza: [[255, 220, 170], .07, .01], academia: [[255, 226, 180], .06, .02], alcazar: [[60, 50, 120], .2, .14] });
Object.assign(ATMOS, { plaza: ['255,240,200', 40, -4, 1], academia: ['255,240,210', 60, -6, 1], alcazar: ['255,160,70', 30, -20, 2] });
OUTDOOR.push('plaza', 'alcazar'); Object.assign(RAIN_P, { plaza: .1, alcazar: .2 });
if (typeof GL_GRADE !== 'undefined') Object.assign(GL_GRADE, { plaza: { gain: [1.04, 1, .94], con: 1.05, sat: 1.06, amb: .25 }, academia: { gain: [1.03, 1, .95], con: 1.04, sat: 1.02, amb: .3 }, alcazar: { gain: [.96, .94, 1.04], con: 1.1, sat: .96, amb: .55 } });
