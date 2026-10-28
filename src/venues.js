
// =============================== décors : Paris, 1633 ===============================
// Le Paris des Lames du Cardinal : toits où passent les vouivres, nef de Notre-Dame, salle d'armes d'un hôtel,
// cour du Palais-Cardinal, Pont-Neuf de nuit. Chaque décor est peint une fois puis mis en cache ;
// ses lumières (bougies, torches, lanternes, foyer) vacillent par-dessus.

// ---- éléments partagés ----
// ligne de toits parisiens : pignons, combles, cheminées et souches, clochers ; couleur de plan (atmosphère)
function skyline(g, R, base, hMin, hMax, col, o = {}) {
  g.fillStyle = col; g.beginPath(); g.moveTo(-10, H);
  let x = -10; const tops = [];
  while (x < W + 10) {
    const w = 18 + R() * (o.wMax || 40), h = hMin + R() * (hMax - hMin), roof = R(), y = base - h;
    g.lineTo(x, y);
    if (roof < .45) { g.lineTo(x + w * .5, y - w * .45); g.lineTo(x + w, y); } // pignon
    else if (roof < .8) { g.lineTo(x + w * .15, y - w * .3); g.lineTo(x + w * .85, y - w * .3); g.lineTo(x + w, y); } // comble brisé
    else g.lineTo(x + w, y);
    if (R() < .6) tops.push([x + w * (.2 + R() * .6), y - w * .3, 2 + R() * 3, 6 + R() * 10]);
    x += w;
  }
  g.lineTo(W + 10, H); g.closePath(); g.fill();
  for (const [cx, cy, cw, ch] of tops) { g.fillRect(cx, cy - ch, cw * 1.6, ch + 4); if (o.pots) { g.fillRect(cx + .5, cy - ch - 2, 1.2, 2); g.fillRect(cx + cw, cy - ch - 2.5, 1.2, 2.5); } }
  if (o.windows) for (let i = 0; i < o.windows; i++) { const wx = R() * W, wy = base - R() * hMin * .9; g.fillStyle = rgba(o.winCol || '255,190,100', .3 + R() * .6); g.fillRect(wx, wy, 1.6 + R(), 2.2 + R() * 1.5); g.fillStyle = col; }
}
// fumée de cheminée
function smoke(g, x, y, R, col = '200,180,190', a = .18) { soft(g, 3, s => { for (let i = 0; i < 14; i++) { const t = i / 14, px = x + t * 60 + Math.sin(t * 6) * 6, py = y - t * 80, r = 4 + t * 16; const q = s.createRadialGradient(px, py, 0, px, py, r); q.addColorStop(0, rgba(col, a * (1 - t))); q.addColorStop(1, rgba(col, 0)); s.fillStyle = q; s.fillRect(px - r, py - r, r * 2, r * 2); } }); void R; }
// vouivre perchée, ailes repliées
function perchedWyvern(g, x, y, s, dir, col, rim) {
  g.save(); g.translate(x, y); g.scale(s * dir, s); g.fillStyle = col;
  g.beginPath(); g.moveTo(-30, 0); g.quadraticCurveTo(-34, -20, -16, -30); g.quadraticCurveTo(0, -36, 10, -28); // dos
  g.quadraticCurveTo(18, -40, 20, -54); g.quadraticCurveTo(24, -60, 34, -58); g.lineTo(40, -54); g.lineTo(32, -52); g.quadraticCurveTo(26, -48, 24, -38); // cou dressé et tête
  g.quadraticCurveTo(22, -22, 14, -10); g.lineTo(16, 0); g.lineTo(8, 0); g.lineTo(6, -8); g.quadraticCurveTo(-6, -4, -14, -6); g.lineTo(-14, 0); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-6, -30); g.lineTo(-2, -58); g.lineTo(6, -64); g.quadraticCurveTo(0, -44, 8, -28); g.closePath(); g.fill(); // aile repliée, pouce dressé
  g.beginPath(); g.moveTo(-30, -2); g.quadraticCurveTo(-52, 4, -64, -6); g.quadraticCurveTo(-70, -12, -76, -8); g.lineTo(-70, -4); g.quadraticCurveTo(-56, 8, -30, 4); g.closePath(); g.fill(); // queue
  g.beginPath(); g.moveTo(28, -58); g.lineTo(22, -68); g.lineTo(30, -60); g.fill(); // cornes
  g.strokeStyle = rim; g.lineWidth = 1.2 / s; g.beginPath(); g.moveTo(-30, -2); g.quadraticCurveTo(-34, -20, -16, -30); g.quadraticCurveTo(0, -36, 10, -28); g.quadraticCurveTo(18, -40, 20, -54); g.quadraticCurveTo(24, -60, 34, -58); g.moveTo(-2, -58); g.lineTo(6, -64); g.stroke();
  g.restore();
}
// statue équestre (bronze) : cheval au pas et cavalier
function horseRider(g, x, y, s, col, rim) {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col;
  g.beginPath(); g.moveTo(-34, -40); g.quadraticCurveTo(-36, -58, -14, -60); g.quadraticCurveTo(10, -62, 22, -66); g.quadraticCurveTo(30, -84, 40, -92); g.lineTo(52, -86); g.lineTo(50, -80); g.lineTo(40, -78); g.quadraticCurveTo(34, -70, 30, -56); g.quadraticCurveTo(30, -44, 24, -40); g.closePath(); g.fill(); // corps, encolure, tête
  const leg = (a, b, c) => { g.beginPath(); g.moveTo(a, -42); g.lineTo(a + b, -20); g.lineTo(a + c, 0); g.lineTo(a + c + 5, 0); g.lineTo(a + b + 4, -20); g.lineTo(a + 7, -44); g.closePath(); g.fill(); };
  leg(-30, -2, 0); leg(-22, 4, 8); leg(16, 6, 2); g.beginPath(); g.moveTo(22, -46); g.lineTo(34, -34); g.lineTo(38, -38); g.lineTo(28, -50); g.closePath(); g.fill(); // jambe levée
  g.beginPath(); g.moveTo(-34, -52); g.quadraticCurveTo(-48, -40, -44, -18); g.lineTo(-40, -20); g.quadraticCurveTo(-42, -38, -32, -46); g.closePath(); g.fill(); // queue
  g.beginPath(); g.moveTo(-10, -60); g.quadraticCurveTo(-14, -82, -4, -92); g.lineTo(6, -92); g.quadraticCurveTo(10, -76, 6, -60); g.closePath(); g.fill(); // cavalier
  g.beginPath(); g.arc(1, -98, 6, 0, 7); g.fill(); g.beginPath(); g.ellipse(1, -103, 10, 2.4, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(4, -86); g.lineTo(24, -96); g.lineTo(25, -93); g.lineTo(6, -82); g.fill(); // tête, chapeau, bâton de commandement
  g.beginPath(); g.moveTo(-6, -64); g.lineTo(-2, -44); g.lineTo(4, -44); g.lineTo(2, -64); g.fill(); // jambe du cavalier
  g.strokeStyle = rim; g.lineWidth = 1.3 / s; g.beginPath(); g.moveTo(-34, -40); g.quadraticCurveTo(-36, -58, -14, -60); g.quadraticCurveTo(10, -62, 22, -66); g.quadraticCurveTo(30, -84, 40, -92); g.lineTo(52, -86); g.moveTo(-14, -82); g.quadraticCurveTo(-4, -92, 6, -92); g.moveTo(-5, -102); g.arc(1, -98, 6, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  g.restore();
}
// rosace gothique : vitrail en mosaïque, remplages rayonnants
function roseWindow(g, cx, cy, r, R) {
  glow(g, cx, cy, r * 2.6, 'rgba(110,120,255,A)', .28);
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip();
  const pal = ['30,50,170', '20,40,140', '170,30,40', '200,150,40', '40,110,70', '90,40,140', '230,200,120'];
  for (let i = 0; i < 900; i++) { const a = R() * 7, d = Math.sqrt(R()) * r, px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d, c = pal[R() < .45 ? Math.floor(R() * 2) : Math.floor(R() * pal.length)]; g.fillStyle = rgba(c, .9); g.fillRect(px - 2.5, py - 2.5, 3 + R() * 3, 3 + R() * 3); }
  const lg = g.createRadialGradient(cx, cy, 0, cx, cy, r); lg.addColorStop(0, 'rgba(255,240,200,.35)'); lg.addColorStop(.5, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(0,0,30,.4)'); g.fillStyle = lg; g.fillRect(cx - r, cy - r, r * 2, r * 2);
  g.restore();
  g.strokeStyle = '#1a1418'; g.lineWidth = 3.2; const n = 12;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * r * .24, cy + Math.sin(a) * r * .24); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.stroke(); }
  g.lineWidth = 2; for (let i = 0; i < n; i++) { const a = (i + .5) / n * Math.PI * 2; g.beginPath(); g.arc(cx + Math.cos(a) * r * .72, cy + Math.sin(a) * r * .72, r * .16, 0, 7); g.stroke(); g.beginPath(); g.arc(cx + Math.cos(a) * r * .42, cy + Math.sin(a) * r * .42, r * .09, 0, 7); g.stroke(); }
  g.lineWidth = 1; for (let i = 0; i < 60; i++) { const a = R() * 7, d = R() * r; g.beginPath(); g.moveTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d); g.lineTo(cx + Math.cos(a + .1) * (d + 6), cy + Math.sin(a + .1) * (d + 6)); g.stroke(); } // plombs
  g.lineWidth = 5; g.strokeStyle = '#4a3e3c'; g.beginPath(); g.arc(cx, cy, r + 2, 0, 7); g.stroke(); g.lineWidth = 2; g.strokeStyle = '#1a1418'; g.beginPath(); g.arc(cx, cy, r * .24, 0, 7); g.stroke();
  g.fillStyle = '#e8c86a'; g.beginPath(); g.arc(cx, cy, r * .1, 0, 7); g.fill();
  g.strokeStyle = 'rgba(90,76,70,.9)'; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, r + 9, 0, 7); g.stroke(); g.strokeStyle = 'rgba(140,120,110,.35)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, r + 13, Math.PI * 1.1, Math.PI * 1.7); g.stroke();
}
// vitrail en lancette
function stainedLancet(g, x, y, w, h, R) {
  g.save(); lancet(g, x, y, w, h); g.clip();
  const pal = ['30,50,170', '20,40,140', '170,30,40', '200,150,40', '40,110,70', '230,200,120'];
  for (let i = 0; i < w * h / 12; i++) { g.fillStyle = rgba(pal[Math.floor(R() * pal.length)], .85); g.fillRect(x + R() * w, y - w * .4 + R() * (h + w * .4), 3 + R() * 4, 3 + R() * 4); }
  for (let k = 0; k < 3; k++) { const my = y + 18 + k * (h - 30) / 3; g.fillStyle = 'rgba(240,220,170,.35)'; g.beginPath(); g.arc(x + w / 2, my + 10, w * .3, 0, 7); g.fill(); } // médaillons
  const sg = g.createLinearGradient(0, y, 0, y + h); sg.addColorStop(0, 'rgba(255,255,255,.18)'); sg.addColorStop(1, 'rgba(0,0,20,.35)'); g.fillStyle = sg; g.fillRect(x, y - w, w, h + w);
  g.restore(); g.strokeStyle = '#1a1418'; g.lineWidth = 2.4; lancet(g, x, y, w, h); g.stroke(); g.lineWidth = 1; for (let yy = y + 12; yy < y + h; yy += 12) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); }
  g.beginPath(); g.moveTo(x + w / 2, y - w * .3); g.lineTo(x + w / 2, y + h); g.stroke();
}
// pilier gothique fasciculé, chapiteau à feuillages
function gothicPier(g, x, y0, y1, w, light, R) {
  const n = 5, cw = w / n;
  for (let i = 0; i < n; i++) { const cx = x + i * cw, gr = g.createLinearGradient(cx, 0, cx + cw, 0), b = i === 2 ? 1.1 : 1 - Math.abs(i - 2) * .12; gr.addColorStop(0, `rgb(${70 * b | 0},${60 * b | 0},${62 * b | 0})`); gr.addColorStop(light > 0 ? .3 : .7, `rgb(${118 * b | 0},${104 * b | 0},${100 * b | 0})`); gr.addColorStop(1, `rgb(${46 * b | 0},${38 * b | 0},${42 * b | 0})`); g.fillStyle = gr; g.fillRect(cx, y0, cw + .5, y1 - y0); }
  g.fillStyle = '#6e605a'; g.fillRect(x - 4, y0 - 12, w + 8, 12); // chapiteau
  for (let i = 0; i < 6; i++) { g.fillStyle = rgba('120,104,96', .7); g.beginPath(); g.ellipse(x + i * w / 5, y0 - 6, 5, 4, R(), 0, 7); g.fill(); }
  g.fillStyle = '#5a4e4a'; g.fillRect(x - 6, y1 - 18, w + 12, 18); g.fillStyle = 'rgba(255,240,220,.1)'; g.fillRect(x - 6, y1 - 18, w + 12, 2);
  grime(g, x - 6, y0 - 12, w + 12, y1 - y0 + 12, Math.floor(R() * 99), .45, '20,14,18', 18);
}

// ================= 1. Les toits de Paris (crépuscule) =================
function paintToits(g) {
  const R = rng(1633);
  skyGrad(g, 0, 340, [[0, '#18203e'], [.3, '#3e3658'], [.55, '#9a5a58'], [.75, '#e08e5a'], [.9, '#f7b878'], [1, '#ffd8a0']]);
  glow(g, 770, 300, 300, 'rgba(255,170,110,A)', .5); glow(g, 770, 300, 90, 'rgba(255,230,180,A)', .9);
  g.fillStyle = 'rgba(255,246,220,.95)'; g.beginPath(); g.arc(770, 300, 19, 0, 7); g.fill();
  cloudBank(g, R, 280, 80, 560, 70, 'rgba(110,84,118,.85)', 'rgba(255,160,110,.5)', 'rgba(40,30,60,.55)', 770, 300, 34);
  cloudBank(g, R, 760, 190, 420, 34, 'rgba(196,110,96,.75)', 'rgba(255,214,150,.7)', 'rgba(90,46,70,.45)', 770, 300, 22);
  cloudBank(g, R, 110, 220, 320, 26, 'rgba(150,90,100,.6)', 'rgba(255,180,120,.4)', 'rgba(60,36,60,.4)', 770, 300, 18);
  strokes(g, 0, 0, W, 300, 500, ['255,200,150', '60,50,90', '200,120,120'], R, { ang: -.05, len: 14, wid: 2, a: .05 });
  // vouivres : une patrouille lointaine, un courrier monté plus près
  wyvern(g, 600, 150, .26, -1, .3, 'rgba(70,46,66,.9)', 'rgba(255,190,130,.6)');
  wyvern(g, 650, 178, .19, -1, -.6, 'rgba(90,60,76,.85)', 'rgba(255,190,130,.5)');
  wyvern(g, 548, 196, .14, -1, .9, 'rgba(110,74,86,.8)', 'rgba(255,190,130,.4)');
  wyvern(g, 200, 118, .5, 1, .7, '#271b2a', 'rgba(255,170,110,.85)', { rider: true, eye: '#ffb050' });
  // Paris dans la brume : trois plans, Notre-Dame et la tour Saint-Jacques
  skyline(g, R, 336, 8, 26, 'rgb(152,104,112)');
  const nd = (x, b, c) => { g.fillStyle = c; g.fillRect(x, b - 74, 26, 74); g.fillRect(x + 46, b - 74, 26, 74); g.fillRect(x + 22, b - 52, 28, 52); g.fillRect(x + 70, b - 40, 110, 40); g.beginPath(); g.moveTo(x + 70, b - 40); g.lineTo(x + 125, b - 64); g.lineTo(x + 180, b - 40); g.fill(); g.fillRect(x + 118, b - 110, 4, 50); g.beginPath(); g.moveTo(x + 114, b - 70); g.lineTo(x + 120, b - 128); g.lineTo(x + 126, b - 70); g.fill();
    g.fillStyle = 'rgba(255,190,140,.25)'; g.beginPath(); g.arc(x + 36, b - 44, 8, 0, 7); g.fill(); for (const k of [0, 46]) for (let i = 0; i < 2; i++) { g.fillStyle = 'rgba(40,24,40,.5)'; g.fillRect(x + k + 5 + i * 9, b - 68, 5, 18); } };
  nd(250, 336, 'rgb(128,86,98)');
  g.fillStyle = 'rgb(122,82,94)'; g.fillRect(640, 268, 18, 70); g.fillRect(636, 264, 26, 6); for (const dx of [636, 659]) { g.beginPath(); g.moveTo(dx, 264); g.lineTo(dx + 1.5, 254); g.lineTo(dx + 3, 264); g.fill(); } // tour Saint-Jacques
  // la Seine qui miroite sous le couchant
  const sg = g.createLinearGradient(0, 330, 0, 346); sg.addColorStop(0, 'rgba(255,200,140,.0)'); sg.addColorStop(.5, 'rgba(255,200,140,.55)'); sg.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = sg; g.fillRect(0, 330, W, 16);
  for (let i = 0; i < 70; i++) { g.fillStyle = rgba('255,236,200', R() * .7); g.fillRect(640 + R() * 260, 334 + R() * 8, 4 + R() * 12, .8); }
  const haze = g.createLinearGradient(0, 220, 0, 350); haze.addColorStop(0, 'rgba(240,150,110,0)'); haze.addColorStop(1, 'rgba(240,160,120,.45)'); g.fillStyle = haze; g.fillRect(0, 220, W, 130);
  skyline(g, R, 352, 14, 40, 'rgb(98,62,76)', { windows: 40, pots: true });
  skyline(g, R, 372, 20, 60, 'rgb(66,40,54)', { windows: 70, pots: true, wMax: 54 });
  smoke(g, 140, 300, R); smoke(g, 520, 316, R); smoke(g, 830, 300, R, '230,190,170', .14);
  const haze2 = g.createLinearGradient(0, 300, 0, 380); haze2.addColorStop(0, 'rgba(230,140,110,0)'); haze2.addColorStop(1, 'rgba(200,120,100,.3)'); g.fillStyle = haze2; g.fillRect(0, 300, W, 80);
  // grands toits d'ardoise de part et d'autre de la terrasse
  const slate = (x0, x1, top, base, sideLit) => {
    g.beginPath(); g.moveTo(x0, base); g.lineTo(x0 + (sideLit ? 30 : 0), top); g.lineTo(x1 - (sideLit ? 0 : 30), top); g.lineTo(x1, base); g.closePath();
    const gr = g.createLinearGradient(0, top, 0, base); gr.addColorStop(0, '#5a5068'); gr.addColorStop(1, '#2c2632'); g.fillStyle = gr; g.fill();
    g.save(); g.clip(); for (let y = top; y < base; y += 5) for (let x = x0 + ((y / 5) % 2) * 4; x < x1; x += 8) { g.fillStyle = rgba(R() < .5 ? '140,130,160' : '20,16,26', .08 + R() * .14); g.fillRect(x, y, 7, 4); }
    const lg = g.createLinearGradient(x0, 0, x1, 0); lg.addColorStop(sideLit ? 1 : 0, 'rgba(255,170,110,.3)'); lg.addColorStop(sideLit ? 0 : 1, 'rgba(255,170,110,0)'); g.fillStyle = lg; g.fillRect(x0, top, x1 - x0, base - top); g.restore();
  };
  slate(-20, 170, 250, 372, false); slate(800, 980, 236, 372, true);
  // lucarne éclairée à droite
  g.fillStyle = '#7a6658'; g.fillRect(846, 270, 70, 80); g.beginPath(); g.moveTo(838, 272); g.lineTo(881, 236); g.lineTo(924, 272); g.closePath(); g.fill(); g.fillStyle = '#4e4048'; g.beginPath(); g.moveTo(838, 272); g.lineTo(881, 236); g.lineTo(924, 272); g.lineTo(916, 272); g.lineTo(881, 244); g.lineTo(846, 272); g.fill();
  leaded(g, 858, 282, 46, 62, true, R, { arch: true, pane: 5 });
  g.fillStyle = 'rgba(255,170,110,.35)'; g.fillRect(912, 270, 4, 80);
  // grande souche de cheminée en brique, à gauche
  for (let y = 210; y < 372; y += 6) for (let x = 40 + ((y / 6) % 2) * 6; x < 132; x += 12) { const v = .75 + R() * .4; g.fillStyle = `rgb(${130 * v | 0},${62 * v | 0},${48 * v | 0})`; g.fillRect(x, y, 11, 5); }
  g.fillStyle = 'rgba(30,12,16,.45)'; g.fillRect(40, 210, 30, 162); g.fillStyle = 'rgba(255,170,110,.25)'; g.fillRect(124, 210, 8, 162);
  g.fillStyle = '#5a3a30'; g.fillRect(34, 204, 104, 8); for (const px of [52, 74, 96, 116]) { g.fillStyle = '#8a5038'; g.fillRect(px, 186, 10, 18); g.fillStyle = '#2a1a16'; g.fillRect(px + 1, 186, 8, 2); }
  smoke(g, 100, 180, R, '170,150,160', .2);
  // girouette en forme de vouivre
  g.strokeStyle = '#1e1418'; g.lineWidth = 2; g.beginPath(); g.moveTo(880, 236); g.lineTo(880, 196); g.stroke(); wyvern(g, 884, 196, .16, 1, .2, '#1e1418', 'rgba(255,170,110,.6)');
  // terrasse : balustrade de pierre derrière les duellistes
  const by = 372; masonry(g, 0, by + 48, W, 12, 40, 12, [150, 120, 106], R, { grimeA: .3 });
  g.fillStyle = '#8a7468'; g.fillRect(0, by, W, 10); g.fillStyle = 'rgba(255,200,150,.35)'; g.fillRect(0, by, W, 2);
  for (let x = 6; x < W; x += 22) {
    const bg = g.createLinearGradient(x, 0, x + 12, 0); bg.addColorStop(0, '#4e3c3a'); bg.addColorStop(.7, '#a08a7a'); bg.addColorStop(1, '#6a5650'); g.fillStyle = bg;
    g.beginPath(); g.moveTo(x + 3, by + 10); g.quadraticCurveTo(x - 2, by + 22, x + 2, by + 34); g.quadraticCurveTo(x + 6, by + 40, x + 2, by + 48); g.lineTo(x + 10, by + 48); g.quadraticCurveTo(x + 6, by + 40, x + 10, by + 34); g.quadraticCurveTo(x + 14, by + 22, x + 9, by + 10); g.closePath(); g.fill();
  }
  grime(g, 0, by, W, 60, 77, .4);
  // pigeons sur la balustrade
  for (const px of [250, 262, 700]) { g.fillStyle = '#5a5258'; g.beginPath(); g.ellipse(px, by - 4, 5, 3.5, 0, 0, 7); g.fill(); g.beginPath(); g.arc(px + 4, by - 8, 2.2, 0, 7); g.fill(); g.fillStyle = 'rgba(255,190,140,.5)'; g.fillRect(px - 3, by - 7, 5, 1); }
  // gargouille au coin
  g.fillStyle = '#6a5850'; g.beginPath(); g.moveTo(940, by + 2); g.quadraticCurveTo(958, by - 16, 972, by - 8); g.lineTo(966, by - 2); g.lineTo(956, by - 6); g.quadraticCurveTo(952, by + 8, 940, by + 12); g.fill();
  // dallage de plomb et de pierre de la terrasse
  perspFloor(g, 430, 16, 7, '#6a5852', '#5e4c48', { w: 70, lines: 'rgba(30,18,20,.5)', vary: .12, seed: 3 });
  grime(g, 0, 430, W, 110, 91, .4); strokes(g, 0, 430, W, 110, 260, ['255,190,140', '30,20,24'], R, { ang: 0, len: 18, wid: 1.6, a: .06 });
  const fl = g.createLinearGradient(0, 430, 0, H); fl.addColorStop(0, 'rgba(255,170,110,.18)'); fl.addColorStop(1, 'rgba(20,10,20,.4)'); g.fillStyle = fl; g.fillRect(0, 430, W, H - 430);
  glow(g, 880, 470, 160, 'rgba(255,170,100,A)', .12);
}

// ================= 2. Notre-Dame, la nef aux chandelles =================
function paintNotreDame(g) {
  const R = rng(1163);
  const bg = g.createLinearGradient(0, 0, 0, 430); bg.addColorStop(0, '#0c0a14'); bg.addColorStop(.6, '#1e1824'); bg.addColorStop(1, '#2e2428'); g.fillStyle = bg; g.fillRect(0, 0, W, 430);
  // fond du chœur : mur, rosace, lancettes
  masonry(g, 300, 40, 360, 390, 30, 16, [74, 62, 66], R, { grimeA: .5 });
  const dk = g.createLinearGradient(0, 40, 0, 430); dk.addColorStop(0, 'rgba(8,6,14,.6)'); dk.addColorStop(1, 'rgba(8,6,14,.2)'); g.fillStyle = dk; g.fillRect(300, 40, 360, 390);
  roseWindow(g, 480, 150, 74, R);
  for (const [x, w] of [[372, 30], [414, 34], [460, 40], [512, 34], [556, 30]]) stainedLancet(g, x, 262, w, 92, R);
  // rayons de couleur jusqu'au sol, encens
  rays(g, [[430, 530, 150, 320, 520, 470, .13], [400, 440, 200, 250, 340, 470, .07], [520, 560, 200, 620, 720, 470, .07]], 'rgba(170,170,255,A)');
  soft(g, 6, s => { for (let i = 0; i < 18; i++) { const x = 300 + R() * 360, y = 240 + R() * 180, r = 40 + R() * 70; const q = s.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, 'rgba(180,170,220,.12)'); q.addColorStop(1, 'rgba(180,170,220,0)'); s.fillStyle = q; s.fillRect(x - r, y - r, r * 2, r * 2); } });
  // autel : degrés, devant d'autel d'or, croix, chandeliers
  g.fillStyle = '#4a3e3c'; g.fillRect(380, 404, 200, 26); g.fillStyle = '#5a4c48'; g.fillRect(392, 396, 176, 10); g.fillStyle = 'rgba(255,220,170,.15)'; g.fillRect(392, 396, 176, 2);
  g.fillStyle = '#e8e0cc'; g.fillRect(410, 368, 140, 8); const ag = g.createLinearGradient(420, 0, 540, 0); ag.addColorStop(0, '#8a6220'); ag.addColorStop(.5, '#f0c860'); ag.addColorStop(1, '#8a6220'); g.fillStyle = ag; g.fillRect(418, 376, 124, 22);
  g.fillStyle = '#9a1418'; g.fillRect(462, 378, 36, 18); g.strokeStyle = '#f0c860'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(480, 380); g.lineTo(480, 394); g.moveTo(474, 385); g.lineTo(486, 385); g.stroke();
  g.fillStyle = '#d8b25e'; g.fillRect(477, 312, 6, 56); g.fillRect(466, 324, 28, 5); glow(g, 480, 330, 50, 'rgba(255,210,120,A)', .25);
  for (const x of [424, 444, 516, 536]) { g.fillStyle = '#b89040'; g.fillRect(x - 1.5, 352, 3, 16); g.fillRect(x - 5, 366, 10, 2); candle(g, x, 352, 14); }
  // bannières du Cardinal de part et d'autre du chœur
  banner(g, 322, 60, 54, 170, '150,20,26', R, (q, x, y) => richelieuArms(q, x, y + 10, .62));
  banner(g, 584, 60, 54, 170, '150,20,26', R, (q, x, y) => richelieuArms(q, x, y + 10, .62));
  // nef : piliers fasciculés de plus en plus proches, arcs brisés, triforium, fenêtres hautes
  const piers = [[300, 26, 110], [238, 36, 70], [150, 50, 26], [30, 70, -20]];
  for (const side of [1, -1]) {
    let prev = null;
    for (const [px, pw, top] of piers) {
      const x = side > 0 ? px : W - px - pw;
      if (prev) { // travée : arc, triforium, fenêtre haute
        const [qx, qw, qy] = prev, l = side > 0 ? x + pw : qx + qw, r = side > 0 ? qx : x, yy = Math.max(qy, top) + 4, mid = (l + r) / 2, sp = r - l;
        g.fillStyle = '#16121a'; g.beginPath(); g.moveTo(l, 430); g.lineTo(l, yy + 150); g.quadraticCurveTo(l, yy + 70, mid, yy + 50); g.quadraticCurveTo(r, yy + 70, r, yy + 150); g.lineTo(r, 430); g.fill(); // bas-côté obscur
        g.strokeStyle = '#5a4c4a'; g.lineWidth = 10; g.beginPath(); g.moveTo(l, yy + 150); g.quadraticCurveTo(l, yy + 70, mid, yy + 50); g.quadraticCurveTo(r, yy + 70, r, yy + 150); g.stroke();
        g.strokeStyle = '#3a3034'; g.lineWidth = 3; g.beginPath(); g.moveTo(l + 8, yy + 150); g.quadraticCurveTo(l + 8, yy + 78, mid, yy + 60); g.quadraticCurveTo(r - 8, yy + 78, r - 8, yy + 150); g.stroke();
        for (let k = 0; k < 4; k++) { const tx = l + sp * (k + .5) / 4; g.fillStyle = '#0e0c12'; roundWin(g, tx - sp / 12, yy + 10, sp / 6, 26); g.fill(); g.strokeStyle = '#5a4c4a'; g.lineWidth = 1.5; roundWin(g, tx - sp / 12, yy + 10, sp / 6, 26); g.stroke(); } // triforium
        if (yy - 70 > -40) { g.save(); g.globalAlpha = .55; stainedLancet(g, mid - sp * .12, yy - 70, sp * .24, 60, R); g.restore(); }
        // chapelle latérale : cierges et statue
        const cxp = mid; for (let k = 0; k < 9; k++) candle(g, cxp - 24 + k * 6, 410 - (k % 3) * 3, 8 + (k % 4) * 3);
        g.fillStyle = '#2a2228'; g.fillRect(cxp - 30, 410, 60, 8); glow(g, cxp, 395, 70, 'rgba(255,180,90,A)', .3);
        if (Math.abs(cxp - 480) > 200) { g.fillStyle = 'rgba(70,58,56,.75)'; g.beginPath(); g.moveTo(cxp - 8, 386); g.quadraticCurveTo(cxp - 10, 350, cxp, 340); g.quadraticCurveTo(cxp + 10, 350, cxp + 8, 386); g.fill(); g.beginPath(); g.arc(cxp, 334, 6, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,210,120,.35)'; g.lineWidth = 1; g.beginPath(); g.arc(cxp, 333, 9, 0, 7); g.stroke(); }
      }
      gothicPier(g, x, top + 12, 430, pw, side, R);
      prev = [x, pw, top];
    }
  }
  // voûte d'ogives et clés
  g.strokeStyle = 'rgba(110,94,90,.7)'; g.lineWidth = 5;
  for (const x of [0, 110, 230, 730, 850, 960]) { g.beginPath(); g.moveTo(x, -10); g.quadraticCurveTo((x + 480) / 2, 26, 480, 64); g.stroke(); }
  g.fillStyle = '#c8a050'; g.beginPath(); g.arc(480, 62, 6, 0, 7); g.fill();
  // couronnes de lumière suspendues
  for (const cx of [250, 710]) { g.strokeStyle = 'rgba(40,30,30,.9)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, 120); g.stroke();
    g.strokeStyle = '#8a6a30'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, 130, 46, 8, 0, 0, 7); g.stroke(); for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, px = cx + Math.cos(a) * 46, py = 130 + Math.sin(a) * 8; if (Math.sin(a) > -.3) candle(g, px, py, 7); } glow(g, cx, 124, 120, 'rgba(255,190,110,A)', .22); }
  // dallage de marbre et pierres tombales
  perspFloor(g, 430, 18, 7, '#3a3036', '#6a5c5a', { w: 52, vary: .1, seed: 8 });
  g.strokeStyle = 'rgba(200,180,150,.18)'; g.lineWidth = 1; for (const [x, y] of [[180, 470], [700, 500]]) { g.strokeRect(x, y, 70, 22); for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x + 10, y + 6 + k * 5); g.lineTo(x + 58 - k * 6, y + 6 + k * 5); g.stroke(); } }
  const sh = g.createLinearGradient(0, 430, 0, H); sh.addColorStop(0, 'rgba(10,8,14,.25)'); sh.addColorStop(1, 'rgba(10,8,14,.55)'); g.fillStyle = sh; g.fillRect(0, 430, W, 110);
  for (const x of [424, 536, 120, 840]) { g.fillStyle = 'rgba(255,190,110,.12)'; g.beginPath(); g.ellipse(x, 470, 30, 4, 0, 0, 7); g.fill(); } // reflets des flammes
  glow(g, 480, 470, 200, 'rgba(150,150,255,A)', .07);
  // cierges sur pied près des piliers
  for (const x of [96, 864]) { g.fillStyle = '#3a2a20'; g.fillRect(x - 2, 400, 4, 32); g.fillRect(x - 12, 428, 24, 4); candle(g, x, 400, 16); }
}

// ================= 3. Salle d'armes d'un hôtel du Marais =================
function paintSalle(g) {
  const R = rng(1630);
  plaster(g, 0, 0, W, 270, '200,178,146', 4, .5);
  // plafond à la française : poutres peintes
  g.fillStyle = '#3a2416'; g.fillRect(0, 0, W, 46); for (let x = -10; x < W; x += 34) { const pg = g.createLinearGradient(x, 0, x + 18, 0); pg.addColorStop(0, '#2a180e'); pg.addColorStop(.5, '#6a4426'); pg.addColorStop(1, '#2a180e'); g.fillStyle = pg; g.fillRect(x, 0, 18, 40); g.fillStyle = '#9a3a24'; g.fillRect(x + 4, 30, 10, 3); g.fillStyle = '#c8a050'; g.fillRect(x + 7, 22, 4, 4); }
  const beam = g.createLinearGradient(0, 40, 0, 62); beam.addColorStop(0, '#5a3a20'); beam.addColorStop(1, '#2a1a10'); g.fillStyle = beam; g.fillRect(0, 40, W, 22);
  for (let x = 10; x < W; x += 40) { g.fillStyle = 'rgba(200,150,70,.5)'; g.beginPath(); g.moveTo(x, 50); g.lineTo(x + 8, 45); g.lineTo(x + 16, 50); g.lineTo(x + 8, 55); g.closePath(); g.fill(); g.fillStyle = 'rgba(150,40,30,.5)'; g.fillRect(x + 20, 48, 12, 4); } // frise peinte
  // boiseries sculptées
  woodPanel(g, 0, 262, W, 168, '92,58,34', R, true);
  for (let x = 10; x < W; x += 80) { for (const [py, ph] of [[276, 60], [348, 70]]) { const gr = g.createLinearGradient(x, py, x + 64, py + ph); gr.addColorStop(0, 'rgba(255,220,170,.18)'); gr.addColorStop(.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(20,10,4,.35)'); g.fillStyle = gr; g.fillRect(x + 6, py, 64, ph); g.strokeStyle = 'rgba(30,16,8,.6)'; g.lineWidth = 1.5; g.strokeRect(x + 6, py, 64, ph); g.strokeStyle = 'rgba(255,220,170,.15)'; g.strokeRect(x + 12, py + 6, 52, ph - 12); } }
  g.fillStyle = '#4a2e1a'; g.fillRect(0, 258, W, 8); g.fillStyle = 'rgba(255,220,170,.25)'; g.fillRect(0, 258, W, 1.5); g.fillStyle = '#3a2414'; g.fillRect(0, 422, W, 10);
  // hautes croisées à petits bois, rideaux de velours, lumière du jour
  for (const x of [36, 806]) {
    g.fillStyle = '#8a7a64'; g.fillRect(x - 8, 76, 134, 196); g.fillStyle = 'rgba(40,30,20,.5)'; g.fillRect(x - 8, 76, 134, 4);
    const sky = g.createLinearGradient(0, 84, 0, 262); sky.addColorStop(0, '#a8c4dc'); sky.addColorStop(1, '#e8eef0'); g.fillStyle = sky; g.fillRect(x, 84, 118, 178);
    g.fillStyle = 'rgba(120,130,150,.5)'; g.fillRect(x, 200, 118, 62); for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(110,116,140,.7)'; g.fillRect(x + k * 20, 196 - R() * 30, 16, 66); } // maisons d'en face
    g.strokeStyle = '#2a2018'; g.lineWidth = 4; g.strokeRect(x, 84, 118, 178); g.beginPath(); g.moveTo(x + 59, 84); g.lineTo(x + 59, 262); g.moveTo(x, 140); g.lineTo(x + 118, 140); g.stroke();
    g.lineWidth = 1; g.strokeStyle = 'rgba(40,40,50,.6)'; for (let yy = 92; yy < 262; yy += 9) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + 118, yy); g.stroke(); } for (let xx = x + 10; xx < x + 118; xx += 10) { g.beginPath(); g.moveTo(xx, 84); g.lineTo(xx, 262); g.stroke(); }
    for (const sd of [0, 1]) { const cx = sd ? x + 104 : x - 10, cg = g.createLinearGradient(cx, 0, cx + 26, 0); cg.addColorStop(0, '#4a0e12'); cg.addColorStop(.4, '#9a2a2a'); cg.addColorStop(.7, '#6a1418'); cg.addColorStop(1, '#3a0a0e'); g.fillStyle = cg; g.beginPath(); g.moveTo(cx, 70); g.lineTo(cx + 26, 70); g.quadraticCurveTo(cx + (sd ? 6 : 20), 170, cx + 22, 272); g.lineTo(cx + 2, 272); g.quadraticCurveTo(cx + (sd ? 2 : 14), 170, cx, 70); g.fill(); g.fillStyle = '#c8a050'; g.fillRect(cx + 4, 180, 18, 3); }
    g.fillStyle = '#3a2414'; g.fillRect(x - 16, 64, 150, 8);
  }
  rays(g, [[40, 160, 90, 260, 420, 470, .18], [810, 920, 90, 600, 760, 470, .12]], 'rgba(255,246,220,A)');
  // tapisserie : chevalier contre le dragon, dans un paysage de verdure
  const tx = 330, ty = 76, tw = 300, th = 176;
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(tx + 4, ty + 5, tw, th);
  const tg = g.createLinearGradient(0, ty, 0, ty + th); tg.addColorStop(0, '#9ab0a0'); tg.addColorStop(.5, '#6a8a62'); tg.addColorStop(1, '#4a6240'); g.fillStyle = tg; g.fillRect(tx, ty, tw, th);
  g.save(); g.beginPath(); g.rect(tx + 12, ty + 12, tw - 24, th - 24); g.clip();
  for (let i = 0; i < 40; i++) { g.fillStyle = rgba(R() < .5 ? '60,90,50' : '120,140,90', .7); g.beginPath(); g.arc(tx + R() * tw, ty + 60 + R() * 100, 8 + R() * 14, 0, 7); g.fill(); } // feuillages
  g.fillStyle = 'rgba(200,200,170,.6)'; g.beginPath(); g.moveTo(tx + 200, ty + 70); g.lineTo(tx + 214, ty + 40); g.lineTo(tx + 228, ty + 70); g.fill(); g.fillRect(tx + 196, ty + 70, 36, 30); // château lointain
  wyvern(g, tx + 110, ty + 92, .62, 1, .6, '#6a5a2a', 'rgba(230,200,120,.8)', { eye: '#c03020' });
  g.fillStyle = '#d8d0b8'; g.beginPath(); g.ellipse(tx + 200, ty + 128, 26, 12, 0, 0, 7); g.fill(); g.fillRect(tx + 180, ty + 132, 5, 20); g.fillRect(tx + 214, ty + 132, 5, 20); g.beginPath(); g.moveTo(tx + 222, ty + 120); g.lineTo(tx + 236, ty + 104); g.lineTo(tx + 240, ty + 110); g.lineTo(tx + 226, ty + 126); g.fill(); // cheval
  g.fillStyle = '#8a2a2a'; g.fillRect(tx + 194, ty + 98, 12, 22); g.fillStyle = '#c8c0a8'; g.beginPath(); g.arc(tx + 200, ty + 94, 5, 0, 7); g.fill(); g.strokeStyle = '#c8c0a8'; g.lineWidth = 2; g.beginPath(); g.moveTo(tx + 196, ty + 104); g.lineTo(tx + 140, ty + 86); g.stroke(); // chevalier et lance
  g.restore();
  g.strokeStyle = 'rgba(40,30,20,.12)'; g.lineWidth = 1; for (let y = ty; y < ty + th; y += 2) { g.beginPath(); g.moveTo(tx, y); g.lineTo(tx + tw, y); g.stroke(); } // trame
  g.strokeStyle = '#7a3a2a'; g.lineWidth = 12; g.strokeRect(tx + 6, ty + 6, tw - 12, th - 12); for (let k = 0; k < 40; k++) { g.fillStyle = rgba(R() < .5 ? '200,160,80' : '60,90,60', .8); const p = R(); const side = Math.floor(R() * 4); const px = side < 2 ? tx + p * tw : tx + (side === 2 ? 6 : tw - 6), py = side < 2 ? ty + (side === 0 ? 6 : th - 6) : ty + p * th; g.beginPath(); g.arc(px, py, 2.4, 0, 7); g.fill(); }
  g.fillStyle = '#3a2414'; g.fillRect(tx - 8, ty - 6, tw + 16, 6);
  // portraits : Son Éminence en rouge, un maître d'armes
  paintingFrame(g, 182, 92, 100, 132, (q, x, y, w, h) => { q.fillStyle = '#2a2018'; q.fillRect(x, y, w, h); const rg = q.createLinearGradient(x, y + 40, x + w, y + h); rg.addColorStop(0, '#c82a2a'); rg.addColorStop(1, '#5a0a0e'); q.fillStyle = rg; q.beginPath(); q.moveTo(x + w * .5, y + 40); q.quadraticCurveTo(x + w * .15, y + 60, x + 6, y + h); q.lineTo(x + w - 6, y + h); q.quadraticCurveTo(x + w * .85, y + 60, x + w * .5, y + 40); q.fill();
    q.fillStyle = '#f0ece0'; q.beginPath(); q.moveTo(x + w * .36, y + 44); q.lineTo(x + w * .64, y + 44); q.lineTo(x + w * .58, y + 56); q.lineTo(x + w * .42, y + 56); q.fill(); q.fillStyle = '#d8b090'; q.beginPath(); q.ellipse(x + w * .5, y + 32, 11, 14, 0, 0, 7); q.fill(); q.fillStyle = '#8a7a6a'; q.beginPath(); q.moveTo(x + w * .43, y + 38); q.quadraticCurveTo(x + w * .5, y + 52, x + w * .57, y + 38); q.fill(); q.fillStyle = '#a8141a'; q.beginPath(); q.ellipse(x + w * .5, y + 19, 10, 4, 0, Math.PI, 0); q.fill(); });
  paintingFrame(g, 680, 92, 100, 132, (q, x, y, w, h) => { q.fillStyle = '#1e2420'; q.fillRect(x, y, w, h); q.fillStyle = '#22222a'; q.beginPath(); q.moveTo(x + w * .5, y + 42); q.quadraticCurveTo(x + 10, y + 60, x + 4, y + h); q.lineTo(x + w - 4, y + h); q.quadraticCurveTo(x + w - 10, y + 60, x + w * .5, y + 42); q.fill(); q.fillStyle = '#efe7d4'; q.beginPath(); q.ellipse(x + w * .5, y + 46, 18, 5, 0, 0, 7); q.fill();
    q.fillStyle = '#c89a78'; q.beginPath(); q.ellipse(x + w * .5, y + 32, 11, 14, 0, 0, 7); q.fill(); q.fillStyle = '#2a1a10'; q.beginPath(); q.ellipse(x + w * .5, y + 22, 22, 5, 0, 0, 7); q.fill(); q.strokeStyle = '#d8dde4'; q.lineWidth = 1.5; q.beginPath(); q.moveTo(x + 18, y + h - 6); q.lineTo(x + w - 10, y + 54); q.stroke(); });
  // cheminée de pierre à droite ? non : râteliers et poteau d'exercice
  rapierRack(g, 120, 290, 5, '#c8a050'); rapierRack(g, 724, 290, 5, '#c4c9d2');
  // pal d'entraînement et banc
  const pal = g.createLinearGradient(262, 0, 280, 0); pal.addColorStop(0, '#3a2414'); pal.addColorStop(.5, '#7a5432'); pal.addColorStop(1, '#2a1a10'); g.fillStyle = pal; g.fillRect(262, 330, 18, 100); g.fillStyle = '#3a2414'; g.fillRect(252, 422, 38, 10);
  for (const y of [350, 380]) { g.fillStyle = 'rgba(20,10,4,.6)'; g.fillRect(262, y, 18, 2); } g.fillStyle = '#c8b88a'; g.beginPath(); g.ellipse(271, 342, 10, 6, 0, 0, 7); g.fill(); // cible de cuir
  g.fillStyle = '#4a2e1a'; g.fillRect(620, 396, 140, 9); g.fillRect(630, 405, 8, 25); g.fillRect(742, 405, 8, 25); g.fillStyle = '#e8e0cc'; g.beginPath(); g.ellipse(660, 391, 16, 6, 0, 0, 7); g.fill(); g.fillStyle = '#6a4a2e'; g.beginPath(); g.ellipse(702, 392, 10, 5, .3, 0, 7); g.fill(); g.beginPath(); g.ellipse(716, 392, 10, 5, -.3, 0, 7); g.fill(); // plastron et gants
  // parquet de chêne et cercle mystérieux tracé au sol (à la manière de Thibault)
  perspFloor(g, 430, 22, 8, '#8a6440', '#7a5634', { w: 40, planks: true, lines: 'rgba(40,24,12,.35)', vary: .08, seed: 12 });
  strokes(g, 0, 430, W, 110, 400, ['255,230,190', '40,24,12'], R, { ang: 0, len: 22, wid: 1.2, a: .07 });
  g.save(); g.translate(480, 486); g.scale(1, .115); g.strokeStyle = 'rgba(150,40,30,.55)'; g.lineWidth = 14; g.beginPath(); g.arc(0, 0, 300, 0, 7); g.stroke(); g.lineWidth = 8;
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, b = (k + 3) / 8 * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(a) * 300, Math.sin(a) * 300); g.lineTo(Math.cos(b) * 300, Math.sin(b) * 300); g.stroke(); }
  g.strokeStyle = 'rgba(200,160,80,.5)'; g.lineWidth = 6; g.strokeRect(-212, -212, 424, 424); g.restore();
  grime(g, 0, 430, W, 110, 33, .25, '60,40,20');
  const sh = g.createLinearGradient(0, 430, 0, H); sh.addColorStop(0, 'rgba(255,240,210,.08)'); sh.addColorStop(1, 'rgba(20,12,6,.35)'); g.fillStyle = sh; g.fillRect(0, 430, W, 110);
  for (const [x, w] of [[300, 120], [640, 100]]) { g.fillStyle = 'rgba(255,240,200,.12)'; g.beginPath(); g.moveTo(x, 440); g.lineTo(x + w, 440); g.lineTo(x + w * 1.6, 540); g.lineTo(x + w * .4, 540); g.fill(); } // flaques de soleil
}

// ================= 4. Cour du Palais-Cardinal =================
function paintPalais(g) {
  const R = rng(1639);
  skyGrad(g, 0, 300, [[0, '#4a78b0'], [.6, '#8ab0d4'], [1, '#d8e4e8']]);
  cloudBank(g, R, 220, 70, 380, 50, 'rgba(250,250,250,.85)', 'rgba(255,255,250,.8)', 'rgba(150,160,190,.45)', 100, -100, 26);
  cloudBank(g, R, 760, 50, 320, 40, 'rgba(245,245,248,.8)', 'rgba(255,255,255,.7)', 'rgba(150,160,190,.4)', 100, -100, 20);
  wyvern(g, 640, 60, .22, -1, .2, 'rgba(70,70,90,.75)', 'rgba(255,255,240,.6)');
  // toits d'ardoise brisés, lucarnes, hautes cheminées
  const roof = (x0, x1, top, base) => { g.beginPath(); g.moveTo(x0, base); g.lineTo(x0 + 14, top + 30); g.lineTo(x0 + 30, top); g.lineTo(x1 - 30, top); g.lineTo(x1 - 14, top + 30); g.lineTo(x1, base); g.closePath(); const gr = g.createLinearGradient(0, top, 0, base); gr.addColorStop(0, '#5a6274'); gr.addColorStop(1, '#3a4050'); g.fillStyle = gr; g.fill();
    g.save(); g.clip(); for (let y = top; y < base; y += 4) for (let x = x0 + ((y / 4) % 2) * 3; x < x1; x += 6) { g.fillStyle = rgba(R() < .5 ? '170,180,200' : '30,34,44', .06 + R() * .1); g.fillRect(x, y, 5, 3); } g.restore();
    g.fillStyle = '#c8b898'; g.fillRect(x0 + 30, top - 3, x1 - x0 - 60, 3); };
  roof(-10, 330, 120, 196); roof(630, 970, 120, 196); roof(300, 660, 80, 186);
  for (const x of [40, 250, 700, 900, 380, 580]) { const top = x > 300 && x < 660 ? 40 : 76; masonry(g, x, top, 24, 50, 8, 6, [180, 120, 96], R, { grimeA: .3, gap: .6 }); g.fillStyle = '#8a6a58'; g.fillRect(x - 3, top - 4, 30, 5); }
  for (const x of [70, 170, 760, 860, 400, 540]) { const top = x > 300 && x < 660 ? 104 : 140; g.fillStyle = '#d8ccb0'; g.fillRect(x, top, 34, 48); g.beginPath(); g.moveTo(x - 4, top + 2); g.lineTo(x + 17, top - 14); g.lineTo(x + 38, top + 2); g.fill(); leaded(g, x + 7, top + 10, 20, 30, false, R, { darkCol: '70,84,110', glow: false, pane: 4 }); }
  perchedWyvern(g, 790, 122, .8, -1, '#34303c', 'rgba(255,255,240,.75)');
  // façades de pierre de taille, chaînes d'angle, pilastres
  masonry(g, 0, 190, W, 240, 34, 14, [214, 200, 172], R, { grimeA: .25, streaks: 30 });
  const fac = g.createLinearGradient(0, 190, 0, 430); fac.addColorStop(0, 'rgba(255,250,235,.15)'); fac.addColorStop(1, 'rgba(60,50,40,.18)'); g.fillStyle = fac; g.fillRect(0, 190, W, 240);
  g.fillStyle = 'rgba(240,232,214,.9)'; g.fillRect(0, 186, W, 8); g.fillRect(0, 300, W, 6); g.fillStyle = 'rgba(80,70,60,.35)'; g.fillRect(0, 194, W, 3); g.fillRect(0, 306, W, 3);
  for (let x = 0; x < W; x += 80) { if (x > 400 && x < 560) continue; const pg = g.createLinearGradient(x, 0, x + 14, 0); pg.addColorStop(0, 'rgba(255,250,235,.45)'); pg.addColorStop(1, 'rgba(80,70,60,.25)'); g.fillStyle = pg; g.fillRect(x, 194, 14, 236); }
  // fenêtres à frontons alternés, au premier étage
  for (let x = 24; x < W; x += 80) { if (x > 400 && x < 560) continue; leaded(g, x + 4, 216, 34, 70, R() < .15, R, { darkCol: '60,74,96', pane: 5, glow: false });
    g.fillStyle = '#e8dcc0'; if ((x / 80 | 0) % 2) { g.beginPath(); g.moveTo(x - 2, 214); g.lineTo(x + 21, 200); g.lineTo(x + 44, 214); g.closePath(); g.fill(); } else { g.beginPath(); g.ellipse(x + 21, 214, 23, 9, 0, Math.PI, 0); g.fill(); }
    g.fillStyle = 'rgba(60,50,40,.3)'; g.fillRect(x + 2, 286, 38, 3); }
  // galerie des proues : arcades du rez-de-chaussée, ancres et proues sculptées
  for (let x = 0; x < W; x += 80) { if (x > 400 && x < 560) continue; g.fillStyle = '#3a3430'; roundWin(g, x + 18, 324, 46, 106); g.fill(); const ag = g.createLinearGradient(0, 324, 0, 430); ag.addColorStop(0, 'rgba(0,0,0,.4)'); ag.addColorStop(1, 'rgba(60,50,40,.2)'); g.fillStyle = ag; g.fill();
    g.fillStyle = 'rgba(120,100,80,.35)'; g.beginPath(); g.moveTo(x + 8, 316); g.quadraticCurveTo(x + 3, 330, x + 9, 342); g.lineTo(x + 14, 342); g.quadraticCurveTo(x + 11, 330, x + 13, 316); g.fill(); g.strokeStyle = 'rgba(90,80,70,.45)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + 6, 352); g.lineTo(x + 6, 368); g.moveTo(x + 2, 356); g.lineTo(x + 10, 356); g.arc(x + 6, 366, 5, 0, Math.PI); g.stroke(); }
  // pavillon central : porte cochère, armes de Son Éminence, gardes en casaque rouge
  masonry(g, 400, 140, 160, 290, 30, 14, [222, 210, 184], R, { grimeA: .2 });
  g.fillStyle = '#e8dcc0'; g.beginPath(); g.moveTo(392, 146); g.lineTo(480, 100); g.lineTo(568, 146); g.closePath(); g.fill(); g.strokeStyle = 'rgba(80,70,60,.4)'; g.lineWidth = 2; g.stroke();
  richelieuArms(g, 480, 196, .9);
  g.fillStyle = '#2a2018'; roundWin(g, 428, 290, 104, 140); g.fill(); woodPanel(g, 432, 330, 30, 100, '90,56,30', R); woodPanel(g, 498, 330, 30, 100, '90,56,30', R);
  g.fillStyle = 'rgba(200,190,170,.6)'; for (let k = 0; k < 4; k++) g.fillRect(470 + k * 6, 360, 3, 70); // cour intérieure entrevue
  g.strokeStyle = '#efe6d0'; g.lineWidth = 6; roundWin(g, 428, 290, 104, 140); g.stroke();
  g.fillStyle = '#9a1418'; for (const x of [386, 574]) { g.fillRect(x - 3, 214, 6, 40); g.beginPath(); g.moveTo(x - 3, 214); g.lineTo(x - 22, 222); g.lineTo(x - 22, 252); g.lineTo(x - 3, 246); g.fill(); }
  person(g, 418, 430, 46, 'garde', R, { dir: 1, cape: null }); person(g, 542, 430, 46, 'garde', R, { dir: -1 });
  // passants, chaise à porteurs, orangers en caisse
  person(g, 140, 428, 34, 'bourgeois', R, { cape: '#2a2a30' }); person(g, 166, 428, 32, 'dame', R, { dir: -1 }); person(g, 780, 428, 34, 'moine', R, { dir: -1 }); person(g, 860, 428, 34, 'bourgeois', R, { col: '#4a3a2a' });
  g.fillStyle = '#5a1a1e'; g.fillRect(250, 376, 40, 48); g.fillStyle = '#c8a050'; g.fillRect(248, 372, 44, 6); g.fillStyle = '#e8d8a8'; g.fillRect(258, 388, 24, 18); g.strokeStyle = '#3a2414'; g.lineWidth = 3; g.beginPath(); g.moveTo(220, 404); g.lineTo(320, 404); g.stroke(); person(g, 228, 430, 32, 'bourgeois', R, { col: '#5a4a3a' }); person(g, 312, 430, 32, 'bourgeois', R, { col: '#5a4a3a', dir: -1 });
  for (const x of [40, 920]) { g.fillStyle = '#3a5a3a'; for (let k = 0; k < 18; k++) { g.beginPath(); g.arc(x + (R() - .5) * 40, 300 + (R() - .5) * 36, 8 + R() * 8, 0, 7); g.fill(); } g.fillStyle = '#e89030'; for (let k = 0; k < 8; k++) { g.beginPath(); g.arc(x + (R() - .5) * 36, 300 + (R() - .5) * 30, 2.4, 0, 7); g.fill(); } g.fillStyle = 'rgba(255,255,220,.25)'; g.beginPath(); g.arc(x - 8, 290, 16, 0, 7); g.fill();
    g.fillStyle = '#5a3a24'; g.fillRect(x - 3, 320, 6, 40); g.fillStyle = '#e8e4da'; g.fillRect(x - 22, 360, 44, 64); g.strokeStyle = '#3a6a4a'; g.lineWidth = 3; g.strokeRect(x - 22, 360, 44, 64); g.beginPath(); g.moveTo(x - 22, 360); g.lineTo(x + 22, 424); g.moveTo(x + 22, 360); g.lineTo(x - 22, 424); g.stroke(); groundShadow(g, x + 18, 428, 40, 6, .4); }
  // grands pavés de la cour, caniveau central
  cobbles(g, 428, R, '170,160,144');
  g.fillStyle = 'rgba(60,54,48,.4)'; g.beginPath(); g.moveTo(476, 428); g.lineTo(484, 428); g.lineTo(520, 540); g.lineTo(440, 540); g.fill();
  const sh = g.createLinearGradient(0, 428, 0, H); sh.addColorStop(0, 'rgba(255,250,235,.15)'); sh.addColorStop(1, 'rgba(40,34,30,.3)'); g.fillStyle = sh; g.fillRect(0, 428, W, 112);
  const shade = g.createLinearGradient(0, 0, W, 0); shade.addColorStop(0, 'rgba(255,250,230,.08)'); shade.addColorStop(1, 'rgba(40,40,70,.12)'); g.fillStyle = shade; g.fillRect(0, 180, W, 360);
  for (const px of [330, 344, 610]) { g.fillStyle = '#6a6470'; g.beginPath(); g.ellipse(px, 470, 5, 3.5, 0, 0, 7); g.fill(); g.beginPath(); g.arc(px + 4, 466, 2.2, 0, 7); g.fill(); } // pigeons
}

// ================= 5. Le Pont-Neuf, la nuit =================
function paintPontNeuf(g) {
  const R = rng(1607);
  skyGrad(g, 0, 330, [[0, '#060918'], [.5, '#141a38'], [1, '#2c3058']]);
  g.fillStyle = '#fff'; for (let i = 0; i < 160; i++) { g.globalAlpha = R() * .8 + .2; const s = R() < .1 ? 2 : 1.2; g.fillRect(R() * W, R() * 230, s, s); } g.globalAlpha = 1;
  glow(g, 760, 92, 160, 'rgba(190,205,255,A)', .3); g.fillStyle = '#f4f2e4'; g.beginPath(); g.arc(760, 92, 25, 0, 7); g.fill(); g.fillStyle = 'rgba(170,170,160,.35)'; g.beginPath(); g.arc(752, 86, 6, 0, 7); g.arc(768, 100, 4, 0, 7); g.arc(764, 82, 3, 0, 7); g.fill();
  cloudBank(g, R, 600, 130, 420, 40, 'rgba(50,56,90,.8)', 'rgba(200,210,255,.45)', 'rgba(10,12,30,.5)', 760, 92, 26);
  cloudBank(g, R, 180, 70, 360, 36, 'rgba(40,46,80,.7)', 'rgba(170,180,230,.3)', 'rgba(10,12,30,.4)', 760, 92, 20);
  wyvern(g, 790, 96, .34, -1, .6, '#0c0c18', 'rgba(200,210,255,.85)', { rider: true }); // devant la lune
  // rive droite : la Grande Galerie du Louvre, le Louvre au loin
  const lv = (x0, x1, top, base, col) => { g.fillStyle = col; g.fillRect(x0, top, x1 - x0, base - top); g.beginPath(); g.moveTo(x0 - 4, top); g.lineTo(x0 + 10, top - 14); g.lineTo(x1 - 10, top - 14); g.lineTo(x1 + 4, top); g.fill();
    for (let x = x0 + 8; x < x1 - 8; x += 14) { const lit = R() < .28; g.fillStyle = lit ? rgba('255,190,100', .6 + R() * .4) : 'rgba(10,10,20,.8)'; g.fillRect(x, top + 10, 6, 14); if (lit) glow(g, x + 3, top + 17, 12, 'rgba(255,180,90,A)', .2); g.fillStyle = 'rgba(160,170,210,.15)'; g.fillRect(x - 4, top + 4, 2, base - top - 4); } };
  skyline(g, R, 290, 10, 40, 'rgb(30,30,48)', { windows: 20 }); // la ville derrière
  lv(-20, 330, 262, 330, '#2a2a40'); lv(330, 700, 270, 330, '#26263a'); g.fillStyle = '#2e2c46'; g.fillRect(40, 232, 90, 100); g.beginPath(); g.moveTo(34, 232); g.lineTo(85, 198); g.lineTo(136, 232); g.fill(); // pavillon
  g.fillStyle = '#2a2a40'; g.fillRect(840, 226, 40, 104); g.beginPath(); g.moveTo(834, 226); g.lineTo(860, 186); g.lineTo(886, 226); g.fill(); g.fillStyle = rgba('255,190,100', .8); g.fillRect(856, 250, 6, 10); // tour de Nesle (rive gauche)
  g.fillStyle = 'rgba(160,170,220,.25)'; g.fillRect(0, 328, W, 3); // quai
  // la Seine : reflets de la lune et des fenêtres, barque à la lanterne
  const wg = g.createLinearGradient(0, 330, 0, 400); wg.addColorStop(0, '#141830'); wg.addColorStop(1, '#0a0c1a'); g.fillStyle = wg; g.fillRect(0, 330, W, 70);
  for (let i = 0; i < 120; i++) { const y = 334 + R() * 62, w = 8 + R() * 30; g.fillStyle = rgba('210,220,255', (.15 + R() * .5) * (1 - Math.abs(y - 345) / 80)); g.fillRect(760 - w / 2 + (R() - .5) * 40, y, w, 1.2); }
  for (let i = 0; i < 90; i++) { g.fillStyle = rgba('255,180,90', R() * .35); g.fillRect(R() * 700, 334 + R() * 40, 3 + R() * 6, 1); }
  for (let i = 0; i < 200; i++) { g.fillStyle = rgba(R() < .5 ? '60,70,120' : '0,0,10', .2 + R() * .3); g.fillRect(R() * W, 330 + R() * 70, 10 + R() * 30, 1); }
  g.fillStyle = '#1a1210'; g.beginPath(); g.moveTo(220, 372); g.quadraticCurveTo(260, 384, 320, 372); g.lineTo(312, 366); g.lineTo(228, 366); g.closePath(); g.fill(); person(g, 270, 368, 20, 'porteur', R, { dir: -1 }); for (let i = 0; i < 10; i++) { g.fillStyle = rgba('255,170,70', .3 * (1 - i / 10)); g.fillRect(276 + (R() - .5) * 6, 376 + i * 2.2, 3, 1); }
  // statue équestre du roi Henri, sur son piédestal
  masonry(g, 744, 300, 120, 100, 20, 12, [70, 70, 90], R, { grimeA: .5 }); g.fillStyle = '#3a3a52'; g.fillRect(738, 296, 132, 8); g.fillRect(738, 396, 132, 8); g.strokeStyle = 'rgba(200,210,255,.3)'; g.lineWidth = 1; g.strokeRect(770, 320, 66, 50);
  horseRider(g, 806, 296, 1.25, '#1a2420', 'rgba(200,215,255,.8)');
  // parapet du pont et ses demi-lunes, échoppes fermées
  masonry(g, 0, 398, W, 34, 30, 11, [96, 92, 110], R, { grimeA: .45 }); g.fillStyle = '#5a5870'; g.fillRect(0, 394, W, 7); g.fillStyle = 'rgba(200,210,255,.35)'; g.fillRect(0, 394, W, 1.5);
  for (const x of [14, 600]) { woodPanel(g, x, 330, 130, 70, '70,52,40', R); g.fillStyle = '#3a2a24'; g.beginPath(); g.moveTo(x - 8, 334); g.lineTo(x + 138, 334); g.lineTo(x + 126, 316); g.lineTo(x + 4, 316); g.fill(); g.fillStyle = 'rgba(200,210,255,.18)'; g.fillRect(x + 4, 316, 122, 2); g.strokeStyle = 'rgba(20,14,10,.8)'; g.lineWidth = 1.5; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x + k * 32, 336); g.lineTo(x + k * 32, 398); g.stroke(); } }
  // lanternes sur potence
  for (const x of [110, 850]) { g.strokeStyle = '#141018'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, 430); g.lineTo(x, 280); g.lineTo(x + 16, 280); g.stroke(); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + 16, 280); g.lineTo(x + 16, 288); g.stroke();
    glow(g, x + 16, 300, 110, 'rgba(255,170,80,A)', .35); g.fillStyle = '#1a1418'; g.beginPath(); g.moveTo(x + 8, 290); g.lineTo(x + 24, 290); g.lineTo(x + 22, 312); g.lineTo(x + 10, 312); g.closePath(); g.fill(); g.fillStyle = '#ffc060'; g.fillRect(x + 11, 293, 10, 16); g.fillStyle = '#fff0c0'; g.fillRect(x + 14, 297, 4, 9); }
  person(g, 690, 430, 40, 'porteur', R, { dir: -1, cape: '#1a1a24' }); person(g, 210, 430, 40, 'bourgeois', R, { cape: '#14141c', col: '#22222c' });
  // pavés mouillés qui reflètent les lanternes
  cobbles(g, 430, R, '80,78,96', { wet: '255,180,100' });
  for (const x of [126, 866]) { const rg = g.createLinearGradient(0, 430, 0, H); rg.addColorStop(0, 'rgba(255,170,80,.35)'); rg.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = rg; g.fillRect(x - 10, 430, 20, 110); }
  const sh = g.createLinearGradient(0, 430, 0, H); sh.addColorStop(0, 'rgba(20,24,50,.1)'); sh.addColorStop(1, 'rgba(6,6,16,.5)'); g.fillStyle = sh; g.fillRect(0, 430, W, 110);
  glow(g, 126, 470, 150, 'rgba(255,160,70,A)', .14); glow(g, 866, 470, 150, 'rgba(255,160,70,A)', .14);
}

const VENUES = {
  loggia: { name: 'Toits de Paris', draw: paintToits, tint: null, lights: [[878, 312, 60, 'rgba(255,180,100,A)'], [100, 186, 30, 'rgba(255,170,100,A)']] },
  eglise: { name: 'Notre-Dame', draw: paintNotreDame, tint: 'rgba(30,24,60,.08)', lights: [[434, 340, 46, 'rgba(255,200,120,A)'], [526, 340, 46, 'rgba(255,200,120,A)'], [96, 380, 40, 'rgba(255,200,120,A)'], [864, 380, 40, 'rgba(255,200,120,A)'], [250, 124, 60, 'rgba(255,190,110,A)'], [710, 124, 60, 'rgba(255,190,110,A)']] },
  salle: { name: 'Salle d\'armes', draw: paintSalle, tint: null, lights: [[95, 170, 90, 'rgba(255,246,220,A)'], [865, 170, 90, 'rgba(255,246,220,A)']] },
  cloitre: { name: 'Palais-Cardinal', draw: paintPalais, tint: null, lights: [] },
  nuit: { name: 'Pont-Neuf', draw: paintPontNeuf, tint: 'rgba(20,30,70,.12)', lights: [[126, 300, 70, 'rgba(255,170,80,A)'], [866, 300, 70, 'rgba(255,170,80,A)'], [274, 356, 30, 'rgba(255,170,80,A)']] },
};
const VENUE_KEYS = Object.keys(VENUES);
const BGS = {};
function venueCanvas(k) {
  if (!BGS[k]) { if (Paint.on && Paint.grain) BGS[k] = Paint.venue(Paint.k, k); else { const c = document.createElement('canvas'); c.width = W; c.height = H; VENUES[k].draw(c.getContext('2d')); BGS[k] = c; } }
  return BGS[k];
}
function drawVenueLights(g, k, time) {
  const v = VENUES[k]; if (!v.lights.length) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  v.lights.forEach(([x, y, r, col], i) => { const f = .55 + .25 * Math.sin(time * 9 + i * 2.1) + .15 * Math.sin(time * 23 + i); glow(g, x, y, r * (.9 + .1 * f), col, .22 * f); });
  g.restore();
}
