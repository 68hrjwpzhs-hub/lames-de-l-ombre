// =============================== 2.0 · sprint 20 : trois décors de la route de l'Ouest ===============================
// L'auberge du relais de poste (intérieur, feu de cheminée), le pont d'un navire au crépuscule, un bastion en ruine face à la mer.
// Même manière que les décors de Paris : peints une fois, puis leurs lumières vacillent par-dessus.

function paintAuberge(g) {
  const R = rng(1633);
  // murs de torchis entre colombages
  const wall = g.createLinearGradient(0, 0, 0, 430); wall.addColorStop(0, '#3a2a1e'); wall.addColorStop(.5, '#6a5038'); wall.addColorStop(1, '#4a3626'); g.fillStyle = wall; g.fillRect(0, 0, W, 430);
  for (let i = 0; i < 900; i++) { g.fillStyle = rgba(R() < .5 ? '40,28,18' : '140,110,80', .05 + R() * .08); g.fillRect(R() * W, R() * 430, 2 + R() * 10, 1 + R() * 4); }
  g.fillStyle = '#2a1a10'; for (const x of [0, 190, 390, 570, 770, 940]) { g.fillRect(x, 0, 20, 430); g.fillStyle = 'rgba(255,200,140,.12)'; g.fillRect(x + 2, 0, 2, 430); g.fillStyle = '#2a1a10'; }
  for (const [x0, x1] of [[20, 190], [590, 770]]) { g.save(); g.strokeStyle = '#2a1a10'; g.lineWidth = 14; g.beginPath(); g.moveTo(x0, 330); g.lineTo(x1, 170); g.stroke(); g.restore(); }
  // poutres du plafond, jambons et bouquets d'herbes pendus
  g.fillStyle = '#20140c'; g.fillRect(0, 0, W, 40); for (let x = 30; x < W; x += 120) { const bg = g.createLinearGradient(x, 0, x + 26, 0); bg.addColorStop(0, '#1a100a'); bg.addColorStop(.5, '#4a3020'); bg.addColorStop(1, '#1a100a'); g.fillStyle = bg; g.fillRect(x, 0, 26, 52); }
  for (const x of [250, 300, 680]) { g.strokeStyle = '#1a1008'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, 40); g.lineTo(x, 70); g.stroke(); g.fillStyle = x === 300 ? '#6a7a3a' : '#7a3a24'; g.beginPath(); g.ellipse(x, 88, 10, 20, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,220,180,.18)'; g.beginPath(); g.ellipse(x - 3, 82, 3, 10, 0, 0, 7); g.fill(); }
  // grande cheminée au centre : manteau de pierre, foyer, chaudron
  masonry(g, 380, 120, 200, 310, 26, 14, [120, 104, 90], R, { grimeA: .55 });
  g.fillStyle = '#5a4a3c'; g.fillRect(366, 196, 228, 18); g.fillStyle = 'rgba(255,210,160,.25)'; g.fillRect(366, 196, 228, 2);
  g.fillStyle = '#0e0806'; g.beginPath(); g.moveTo(404, 430); g.lineTo(404, 270); g.quadraticCurveTo(480, 236, 556, 270); g.lineTo(556, 430); g.closePath(); g.fill();
  glow(g, 480, 390, 150, 'rgba(255,140,50,A)', .55); glow(g, 480, 410, 70, 'rgba(255,220,120,A)', .7);
  for (let i = 0; i < 26; i++) { const x = 440 + R() * 80, h = 18 + R() * 40; g.fillStyle = rgba(R() < .5 ? '255,180,60' : '255,110,30', .5 + R() * .4); g.beginPath(); g.moveTo(x - 6, 424); g.quadraticCurveTo(x + (R() - .5) * 10, 424 - h * .6, x, 424 - h); g.quadraticCurveTo(x + 4, 424 - h * .5, x + 6, 424); g.fill(); }
  g.fillStyle = '#2a2420'; for (const x of [436, 520]) g.fillRect(x, 410, 6, 20); g.fillStyle = '#1a1614'; g.beginPath(); g.ellipse(480, 352, 30, 22, 0, 0, 7); g.fill(); g.strokeStyle = '#3a3430'; g.lineWidth = 2; g.beginPath(); g.moveTo(480, 330); g.lineTo(480, 260); g.stroke();
  // fenêtre à petits carreaux : la nuit, la route
  const wx = 70, wy = 150; g.fillStyle = '#0e1426'; g.fillRect(wx, wy, 90, 110); for (let i = 0; i < 20; i++) { g.fillStyle = 'rgba(220,230,255,.6)'; g.fillRect(wx + R() * 90, wy + R() * 60, 1, 1); }
  g.fillStyle = '#1a2030'; g.beginPath(); g.moveTo(wx, wy + 110); g.lineTo(wx, wy + 80); g.quadraticCurveTo(wx + 45, wy + 70, wx + 90, wy + 86); g.lineTo(wx + 90, wy + 110); g.fill();
  g.strokeStyle = '#1e140c'; g.lineWidth = 5; g.strokeRect(wx, wy, 90, 110); g.lineWidth = 1.2; g.strokeStyle = 'rgba(60,50,40,.9)'; for (let k = 1; k < 5; k++) { g.beginPath(); g.moveTo(wx, wy + k * 22); g.lineTo(wx + 90, wy + k * 22); g.stroke(); } for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(wx + k * 22.5, wy); g.lineTo(wx + k * 22.5, wy + 110); g.stroke(); }
  // étagère de pichets et d'étains, enseigne du relais (cheval rouge)
  g.fillStyle = '#3a2414'; g.fillRect(630, 150, 150, 8); g.fillRect(630, 210, 150, 8);
  for (let i = 0; i < 6; i++) { const x = 640 + i * 23; g.fillStyle = i % 2 ? '#a8a49a' : '#8a5a3a'; g.beginPath(); g.moveTo(x, 150); g.lineTo(x + 2, 128); g.lineTo(x + 14, 128); g.lineTo(x + 16, 150); g.fill(); g.fillStyle = 'rgba(255,230,190,.3)'; g.fillRect(x + 3, 130, 2, 18); }
  for (let i = 0; i < 5; i++) { const x = 646 + i * 28; g.fillStyle = '#b8b4aa'; g.beginPath(); g.ellipse(x, 200, 11, 11, 0, 0, 7); g.fill(); g.strokeStyle = '#6a6660'; g.lineWidth = 1; g.stroke(); }
  g.fillStyle = '#2a1a10'; g.fillRect(800, 120, 110, 70); g.strokeStyle = '#8a6a3a'; g.lineWidth = 2; g.strokeRect(804, 124, 102, 62);
  g.fillStyle = '#9a2a1e'; g.beginPath(); g.moveTo(822, 172); g.lineTo(830, 150); g.quadraticCurveTo(846, 136, 868, 142); g.lineTo(884, 132); g.lineTo(886, 146); g.lineTo(874, 154); g.lineTo(878, 174); g.lineTo(870, 174); g.lineTo(864, 160); g.lineTo(842, 162); g.lineTo(838, 174); g.closePath(); g.fill();
  g.font = 'italic 11px Georgia, serif'; g.fillStyle = '#d8b25e'; g.textAlign = 'center'; g.fillText('Au Cheval-Rouge', 855, 184);
  // tables, bancs, tonneaux, buveurs dans l'ombre
  woodPanel(g, 0, 330, 360, 100, '70,46,28', R, false);
  for (const [x, w] of [[30, 150], [620, 160]]) { g.fillStyle = '#4a2e1a'; g.fillRect(x, 368, w, 10); g.fillStyle = '#2a1a10'; g.fillRect(x + 10, 378, 8, 52); g.fillRect(x + w - 18, 378, 8, 52); g.fillStyle = 'rgba(255,200,140,.25)'; g.fillRect(x, 368, w, 2);
    g.fillStyle = '#8a5a3a'; g.fillRect(x + 30, 352, 10, 16); g.fillStyle = '#c8c4b8'; g.beginPath(); g.ellipse(x + 80, 366, 12, 3, 0, 0, 7); g.fill(); g.fillStyle = '#3a2a1a'; g.fillRect(x + 110, 348, 8, 20); }
  for (const x of [830, 880]) { g.fillStyle = '#5a3a20'; g.beginPath(); g.ellipse(x, 400, 24, 32, 0, 0, 7); g.fill(); g.strokeStyle = '#2a2018'; g.lineWidth = 3; for (const dy of [-18, 0, 18]) { g.beginPath(); g.ellipse(x, 400 + dy, 24, 4, 0, 0, Math.PI); g.stroke(); } }
  person(g, 60, 430, 46, 'bourgeois', R, { col: '#3a2a22' }); person(g, 150, 430, 44, 'porteur', R, { dir: -1 }); person(g, 700, 430, 46, 'porteur', R, { col: '#4a3020' });
  // plancher de grosses lattes
  g.fillStyle = '#3a2416'; g.fillRect(0, 430, W, H - 430);
  for (let y = 430; y < H; y += 14) { g.fillStyle = rgba('20,12,6', .5); g.fillRect(0, y, W, 1.4); for (let x = (y / 14 % 2) * 60; x < W; x += 120 + R() * 40) g.fillRect(x, y, 1.2, 14); }
  for (let i = 0; i < 300; i++) { g.fillStyle = rgba(R() < .5 ? '90,60,36' : '20,12,6', .2 + R() * .2); g.fillRect(R() * W, 430 + R() * 110, 6 + R() * 30, 1); }
  const fl = g.createRadialGradient(480, 440, 10, 480, 440, 360); fl.addColorStop(0, 'rgba(255,150,60,.3)'); fl.addColorStop(1, 'rgba(255,150,60,0)'); g.fillStyle = fl; g.fillRect(0, 380, W, H - 380);
  const sh = g.createLinearGradient(0, 430, 0, H); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(10,4,2,.5)'); g.fillStyle = sh; g.fillRect(0, 430, W, 110);
}

function paintNavire(g) {
  const R = rng(1628);
  // ciel de crépuscule sur l'Atlantique
  skyGrad(g, 0, 330, [[0, '#2a2440'], [.45, '#7a4a5a'], [.8, '#e0905a'], [1, '#f4c07a']]);
  glow(g, 690, 300, 220, 'rgba(255,190,110,A)', .5); g.fillStyle = '#ffe2a8'; g.beginPath(); g.arc(690, 312, 34, Math.PI, 0); g.fill();
  cloudBank(g, R, 300, 110, 460, 40, 'rgba(90,60,90,.8)', 'rgba(255,170,120,.55)', 'rgba(30,20,40,.4)', 690, 300, 22);
  cloudBank(g, R, 800, 180, 300, 26, 'rgba(120,70,80,.7)', 'rgba(255,190,130,.5)', 'rgba(40,20,30,.3)', 690, 300, 16);
  // la mer, et un autre navire au loin
  const sea = g.createLinearGradient(0, 312, 0, 400); sea.addColorStop(0, '#6a5a6a'); sea.addColorStop(1, '#1e2234'); g.fillStyle = sea; g.fillRect(0, 312, W, 90);
  for (let i = 0; i < 160; i++) { const y = 316 + R() * 80, w = 10 + R() * 40; g.fillStyle = rgba('255,200,140', (.1 + R() * .5) * Math.max(0, 1 - Math.abs(y - 320) / 70) * (1 - Math.abs(690 - 480) / 900)); g.fillRect(690 - w / 2 + (R() - .5) * 120, y, w, 1.2); }
  for (let i = 0; i < 200; i++) { g.fillStyle = rgba(R() < .5 ? '20,24,40' : '140,120,150', .15 + R() * .2); g.fillRect(R() * W, 316 + R() * 86, 14 + R() * 40, 1); }
  g.fillStyle = '#1a1622'; g.beginPath(); g.moveTo(150, 316); g.lineTo(230, 316); g.lineTo(220, 324); g.lineTo(160, 324); g.fill(); g.fillRect(186, 270, 2, 46); g.beginPath(); g.moveTo(188, 274); g.lineTo(212, 296); g.lineTo(188, 304); g.fill();
  // le gréement : grand mât, vergues, voiles ferlées, haubans
  const mast = (x, top) => { const mg = g.createLinearGradient(x - 9, 0, x + 9, 0); mg.addColorStop(0, '#2a1a10'); mg.addColorStop(.5, '#6a4628'); mg.addColorStop(1, '#2a1a10'); g.fillStyle = mg; g.fillRect(x - 9, top, 18, 440 - top);
    for (const [y, w] of [[top + 40, 300], [top + 150, 360]]) { g.fillStyle = '#3a2416'; g.fillRect(x - w / 2, y, w, 8); g.fillStyle = '#d8c8a8'; g.beginPath(); g.moveTo(x - w / 2 + 8, y + 8); for (let k = 0; k <= 10; k++) g.lineTo(x - w / 2 + 8 + k * (w - 16) / 10, y + 8 + 12 + Math.sin(k * 1.7) * 4); g.lineTo(x + w / 2 - 8, y + 8); g.fill(); g.fillStyle = 'rgba(120,80,60,.35)'; for (let k = 0; k < 10; k++) g.fillRect(x - w / 2 + 12 + k * (w - 16) / 10, y + 10, 2, 12); }
    g.fillStyle = '#3a2416'; g.fillRect(x - 24, top + 96, 48, 10); g.fillRect(x - 20, top + 86, 40, 10); }; // hune
  mast(480, -20);
  g.strokeStyle = 'rgba(30,20,16,.85)'; g.lineWidth = 1.4; for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(480, 40 + k * 8); g.lineTo(60 + k * 22, 400); g.stroke(); g.beginPath(); g.moveTo(480, 40 + k * 8); g.lineTo(900 - k * 22, 400); g.stroke(); }
  g.lineWidth = .9; for (let y = 120; y < 400; y += 26) { const t = (y - 40) / 360; g.beginPath(); g.moveTo(480 - t * 420 + 30, y); g.lineTo(480 - t * 300 - 10, y); g.stroke(); g.beginPath(); g.moveTo(480 + t * 300 + 10, y); g.lineTo(480 + t * 420 - 30, y); g.stroke(); }
  // pavillon noir à la mouette
  g.fillStyle = '#121014'; g.beginPath(); g.moveTo(489, -2); g.quadraticCurveTo(540, 6, 580, 0); g.lineTo(574, 30); g.quadraticCurveTo(534, 34, 489, 28); g.fill(); g.strokeStyle = '#e8e4dc'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(518, 18); g.quadraticCurveTo(528, 8, 536, 16); g.quadraticCurveTo(544, 8, 554, 18); g.stroke();
  // bastingage, canons, tonneaux, cordages
  g.fillStyle = '#3a2416'; g.fillRect(0, 386, W, 14); g.fillStyle = 'rgba(255,200,140,.3)'; g.fillRect(0, 386, W, 2);
  for (let x = 10; x < W; x += 36) { g.fillStyle = '#2a1a10'; g.fillRect(x, 398, 8, 34); }
  woodPanel(g, 0, 400, W, 32, '74,48,30', R, false);
  for (const x of [130, 790]) { g.fillStyle = '#1a1818'; g.beginPath(); g.moveTo(x - 30, 412); g.lineTo(x + 34, 408); g.lineTo(x + 34, 420); g.lineTo(x - 30, 424); g.fill(); g.fillStyle = '#4a2e1a'; g.fillRect(x - 36, 420, 60, 12); g.fillStyle = '#2a1a10'; for (const dx of [-28, 12]) { g.beginPath(); g.arc(x + dx, 432, 7, 0, 7); g.fill(); } g.fillStyle = 'rgba(255,200,140,.4)'; g.fillRect(x - 28, 409, 60, 1.5); }
  g.strokeStyle = '#8a7050'; g.lineWidth = 3; for (const [x, y] of [[300, 420], [640, 424]]) { for (let r = 4; r < 20; r += 4) { g.beginPath(); g.ellipse(x, y, r * 1.6, r * .5, 0, 0, 7); g.stroke(); } }
  // pont : bordages clairs, joints de brai, écoutille
  g.fillStyle = '#7a5a3a'; g.fillRect(0, 432, W, H - 432);
  for (let y = 432; y < H; y += 12) { g.fillStyle = 'rgba(30,18,10,.6)'; g.fillRect(0, y, W, 1.6); for (let x = (y / 12 % 3) * 80; x < W; x += 220) { g.fillRect(x, y, 1.4, 12); g.fillStyle = 'rgba(30,18,10,.5)'; g.fillRect(x + 6, y + 5, 2, 2); g.fillStyle = 'rgba(30,18,10,.6)'; } }
  for (let i = 0; i < 260; i++) { g.fillStyle = rgba(R() < .5 ? '150,110,70' : '50,30,18', .15 + R() * .2); g.fillRect(R() * W, 432 + R() * 108, 10 + R() * 40, 1); }
  g.fillStyle = '#3a2416'; g.fillRect(420, 500, 120, 30); g.strokeStyle = '#1a100a'; g.lineWidth = 2; for (let x = 430; x < 540; x += 14) { g.beginPath(); g.moveTo(x, 500); g.lineTo(x, 530); g.stroke(); }
  const lt = g.createLinearGradient(0, 432, 0, H); lt.addColorStop(0, 'rgba(255,180,110,.22)'); lt.addColorStop(1, 'rgba(20,10,20,.45)'); g.fillStyle = lt; g.fillRect(0, 432, W, 108);
  // mouettes
  g.strokeStyle = 'rgba(40,30,40,.7)'; g.lineWidth = 1.6; for (const [x, y, s] of [[260, 150, 1], [300, 130, .7], [820, 90, .8]]) { g.beginPath(); g.moveTo(x - 10 * s, y); g.quadraticCurveTo(x - 5 * s, y - 6 * s, x, y); g.quadraticCurveTo(x + 5 * s, y - 6 * s, x + 10 * s, y); g.stroke(); }
}

function paintBastion(g) {
  const R = rng(1627);
  // ciel d'orage sur l'océan, éclaircie rasante
  skyGrad(g, 0, 300, [[0, '#1e2230'], [.5, '#4a4a58'], [1, '#a89a88']]);
  glow(g, 220, 250, 260, 'rgba(255,220,170,A)', .35);
  cloudBank(g, R, 520, 80, 700, 60, 'rgba(40,42,56,.9)', 'rgba(220,200,180,.4)', 'rgba(10,10,20,.5)', 220, 250, 30);
  cloudBank(g, R, 180, 160, 360, 30, 'rgba(70,70,84,.7)', 'rgba(255,220,180,.45)', 'rgba(20,20,30,.4)', 220, 250, 18);
  for (let i = 0; i < 4; i++) { g.strokeStyle = 'rgba(180,190,210,.12)'; g.lineWidth = 30; g.beginPath(); g.moveTo(600 + i * 60, 120); g.lineTo(560 + i * 60, 300); g.stroke(); } // averse au large
  // l'océan et, au loin, les restes de la grande digue
  const sea = g.createLinearGradient(0, 290, 0, 350); sea.addColorStop(0, '#5a6070'); sea.addColorStop(1, '#2a3040'); g.fillStyle = sea; g.fillRect(0, 290, W, 60);
  for (let i = 0; i < 160; i++) { g.fillStyle = rgba(R() < .6 ? '200,200,210' : '20,24,34', .1 + R() * .25); g.fillRect(R() * W, 292 + R() * 56, 10 + R() * 30, 1); }
  g.fillStyle = '#2a2a30'; g.beginPath(); g.moveTo(380, 300); for (let x = 380; x <= 940; x += 20) g.lineTo(x, 296 - R() * 5); g.lineTo(940, 306); g.lineTo(380, 306); g.fill();
  for (let x = 400; x < 940; x += 34) { g.fillStyle = '#1e1e24'; g.fillRect(x, 286 - R() * 8, 4, 14); } // pieux de la digue
  glow(g, 470, 294, 30, 'rgba(255,240,220,A)', .25);
  // les remparts éventrés : courtine, bastion en éperon, guérite
  masonry(g, 0, 214, 360, 216, 34, 15, [128, 118, 104], R, { grimeA: .6 });
  g.fillStyle = 'rgba(30,26,22,.55)'; g.beginPath(); g.moveTo(180, 214); g.lineTo(206, 250); g.lineTo(232, 226); g.lineTo(262, 270); g.lineTo(300, 214); g.fill(); // brèche
  for (let x = 0; x < 360; x += 40) if (x < 170 || x > 300) { g.fillStyle = '#7a7064'; g.fillRect(x, 196, 26, 20); g.fillStyle = 'rgba(255,230,190,.25)'; g.fillRect(x, 196, 26, 2); }
  g.fillStyle = '#6a6256'; g.beginPath(); g.moveTo(40, 196); g.lineTo(40, 140); g.quadraticCurveTo(62, 116, 84, 140); g.lineTo(84, 196); g.fill(); g.fillStyle = '#1a1814'; g.fillRect(56, 156, 12, 22); // guérite
  masonry(g, 640, 240, 320, 190, 34, 15, [118, 108, 96], R, { grimeA: .65 });
  g.fillStyle = '#5a5248'; g.beginPath(); g.moveTo(640, 240); g.lineTo(700, 214); g.lineTo(960, 214); g.lineTo(960, 240); g.fill(); g.fillStyle = 'rgba(255,230,190,.2)'; g.fillRect(700, 214, 260, 2);
  masonry(g, 356, 346, 290, 84, 30, 13, [104, 96, 86], R, { grimeA: .7 }); g.fillStyle = '#6a6256'; g.fillRect(352, 338, 298, 10); g.fillStyle = 'rgba(255,230,190,.22)'; g.fillRect(352, 338, 298, 2); // parapet bas entre les deux bastions
  g.fillStyle = 'rgba(40,46,62,.55)'; g.fillRect(356, 306, 290, 32); // mer vue au-dessus du parapet
  // canon renversé, boulets, gabions éventrés, pavillon royal en lambeaux
  g.fillStyle = '#2a2622'; g.save(); g.translate(780, 404); g.rotate(-.22); g.beginPath(); g.moveTo(-60, -9); g.lineTo(50, -6); g.lineTo(50, 6); g.lineTo(-60, 10); g.fill(); g.fillStyle = 'rgba(200,190,170,.25)'; g.fillRect(-58, -8, 106, 2); g.restore();
  g.fillStyle = '#4a3020'; g.beginPath(); g.arc(760, 420, 14, 0, 7); g.fill(); g.strokeStyle = '#2a1a10'; g.lineWidth = 3; g.beginPath(); g.arc(760, 420, 14, 0, 7); g.stroke();
  g.fillStyle = '#1e1c1a'; for (const [x, y] of [[700, 424], [714, 426], [707, 416]]) { g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); }
  for (const x of [400, 450, 880]) { g.fillStyle = '#5a4a32'; g.beginPath(); g.ellipse(x, 400, 22, 30, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(30,20,10,.7)'; g.lineWidth = 1.5; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(x + k * 8, 372); g.lineTo(x + k * 8, 428); g.stroke(); } g.fillStyle = 'rgba(120,100,70,.6)'; g.fillRect(x - 20, 370, 40, 6); }
  g.strokeStyle = '#2a2018'; g.lineWidth = 3; g.beginPath(); g.moveTo(920, 214); g.lineTo(920, 120); g.stroke(); g.fillStyle = '#2a3a7a'; g.beginPath(); g.moveTo(920, 122); g.lineTo(880, 128); g.lineTo(886, 140); g.lineTo(874, 150); g.lineTo(920, 156); g.fill();
  g.fillStyle = '#d8b25e'; for (const [x, y] of [[904, 134], [896, 146]]) { g.beginPath(); g.arc(x, y, 2.4, 0, 7); g.fill(); }
  // chemin de ronde : dalles disjointes, flaques, herbes folles
  g.fillStyle = '#4a4440'; g.fillRect(0, 430, W, H - 430);
  for (let row = 0, y = 430; y < H; row++, y += 18) { for (let x = -(row % 2) * 30; x < W; x += 54 + R() * 14) { const sh = 60 + R() * 30; g.fillStyle = `rgb(${sh + 14 | 0},${sh + 8 | 0},${sh | 0})`; g.fillRect(x + 1.5, y + 1.5, 50, 15); g.fillStyle = 'rgba(255,240,220,.12)'; g.fillRect(x + 1.5, y + 1.5, 50, 1.5); } }
  for (const [x, y, w] of [[160, 470, 70], [620, 500, 90], [860, 460, 50]]) { g.fillStyle = 'rgba(160,170,190,.35)'; g.beginPath(); g.ellipse(x, y, w, 6, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,230,200,.25)'; g.fillRect(x - w * .5, y - 1, w * .6, 1); }
  for (let i = 0; i < 60; i++) { const x = R() * W, y = 430 + R() * 4; g.strokeStyle = rgba('90,100,60', .7); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - .5) * 8, y - 6 - R() * 10); g.stroke(); }
  const sh = g.createLinearGradient(0, 430, 0, H); sh.addColorStop(0, 'rgba(255,230,190,.08)'); sh.addColorStop(1, 'rgba(10,10,20,.5)'); g.fillStyle = sh; g.fillRect(0, 430, W, 110);
  // goélands
  g.strokeStyle = 'rgba(230,230,235,.8)'; g.lineWidth = 1.6; for (const [x, y, s] of [[480, 170, 1], [520, 190, .7], [130, 110, .8]]) { g.beginPath(); g.moveTo(x - 10 * s, y); g.quadraticCurveTo(x - 5 * s, y - 6 * s, x, y); g.quadraticCurveTo(x + 5 * s, y - 6 * s, x + 10 * s, y); g.stroke(); }
}

// enregistrement des décors : lumières, éclairage des personnages, teinte, atmosphère, temps qu'il fait
Object.assign(VENUES, {
  auberge: { name: 'Auberge du Cheval-Rouge', draw: paintAuberge, tint: 'rgba(60,30,10,.06)', lights: [[480, 390, 120, 'rgba(255,150,60,A)'], [480, 410, 60, 'rgba(255,220,130,A)']] },
  navire: { name: 'Pont de la Mouette noire', draw: paintNavire, tint: null, lights: [[690, 306, 120, 'rgba(255,190,110,A)']] },
  bastion: { name: 'Bastion de l\'Ouest', draw: paintBastion, tint: 'rgba(30,34,50,.06)', lights: [] },
});
VENUE_KEYS.push('auberge', 'navire', 'bastion');
Object.assign(LIGHTING, {
  auberge: { from: [0, .2], key: '255,160,80', keyA: .16, shade: '30,14,8', shadeA: .48, rim: '255,170,90', rimA: .9, amb: '255,140,60', ambA: .07, cast: [.0, .28], castA: .2, glaze: 'rgba(110,50,10,.12)' },
  navire: { from: [.7, -.4], key: '255,190,120', keyA: .15, shade: '40,24,50', shadeA: .46, rim: '255,200,140', rimA: .95, amb: '255,160,110', ambA: .06, cast: [-.5, .24], castA: .2, glaze: 'rgba(120,60,50,.1)' },
  bastion: { from: [-.7, -.6], key: '240,230,220', keyA: .14, shade: '24,28,44', shadeA: .5, rim: '255,230,200', rimA: .75, amb: '150,160,190', ambA: .08, cast: [.5, .26], castA: .22, glaze: 'rgba(40,50,70,.12)' },
});
Object.assign(Paint.TINT, { auberge: [[255, 150, 70], .1, .06], navire: [[255, 170, 120], .1, .04], bastion: [[120, 130, 170], .12, .08] });
Object.assign(ATMOS, { auberge: ['255,170,90', 50, -6, 1], navire: ['255,210,170', 34, -10, 1], bastion: ['200,205,220', 40, 6, 1] });
OUTDOOR.push('navire', 'bastion'); Object.assign(RAIN_P, { navire: .25, bastion: .45 });
