// =============================== rendu ===============================
function drawLoggia(g) {
  // ciel crépusculaire
  const sky = g.createLinearGradient(0, 0, 0, GROUND); sky.addColorStop(0, '#1a1730'); sky.addColorStop(.45, '#4a2f45'); sky.addColorStop(.78, '#c0704a'); sky.addColorStop(1, '#e8a060');
  g.fillStyle = sky; g.fillRect(0, 0, W, GROUND);
  g.fillStyle = 'rgba(255,230,190,.9)'; g.beginPath(); g.arc(720, 250, 26, 0, Math.PI * 2); g.fill();
  const glow = g.createRadialGradient(720, 250, 20, 720, 250, 200); glow.addColorStop(0, 'rgba(255,200,140,.35)'); glow.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = glow; g.fillRect(500, 50, 440, 400);
  // ville lointaine : dôme, campanile, toits
  g.fillStyle = '#3a2534';
  const city = [[0, 330], [60, 318], [120, 330], [150, 300], [170, 300], [180, 330], [260, 322], [320, 334], [400, 320], [470, 332], [560, 316], [640, 330], [760, 322], [840, 334], [960, 320]];
  g.beginPath(); g.moveTo(0, GROUND); city.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(W, GROUND); g.fill();
  g.beginPath(); g.arc(300, 300, 34, Math.PI, 0); g.fill(); g.fillRect(266, 300, 68, 40); g.fillRect(296, 250, 8, 20); // dôme
  g.fillRect(560, 210, 26, 130); g.beginPath(); g.moveTo(556, 212); g.lineTo(573, 180); g.lineTo(590, 212); g.fill(); // campanile
  g.fillStyle = '#2a1a26'; for (let i = 0; i < 30; i++) { const x = i * 34 + rand(-6, 6), h = rand(18, 50); g.fillRect(x, 352 - h, 30, h + 20); }
  // loggia : arcades et colonnes
  g.fillStyle = '#5b4436';
  g.fillRect(0, 160, W, 22);
  for (let i = 0; i < 7; i++) {
    const x = i * 160 - 20;
    g.fillStyle = '#4a372c'; g.fillRect(x + 6, 182, 26, GROUND - 182);
    g.fillStyle = '#6a5040'; g.fillRect(x, 176, 38, 10); g.fillRect(x + 2, GROUND - 22, 34, 22);
    g.strokeStyle = '#5b4436'; g.lineWidth = 16; g.beginPath(); g.arc(x + 99, 252, 66, Math.PI, 0); g.stroke();
  }
  g.fillStyle = '#4a372c'; g.fillRect(0, 140, W, 24);
  // lanternes
  [[180, 230], [500, 230], [820, 230]].forEach(([x, y]) => { const lg = g.createRadialGradient(x, y, 2, x, y, 70); lg.addColorStop(0, 'rgba(255,190,110,.55)'); lg.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = lg; g.fillRect(x - 70, y - 70, 140, 140); g.fillStyle = '#ffd08a'; g.fillRect(x - 5, y - 8, 10, 14); });
  // sol pavé en perspective
  const fl = g.createLinearGradient(0, GROUND - 40, 0, H); fl.addColorStop(0, '#6b5444'); fl.addColorStop(1, '#2a2019'); g.fillStyle = fl; g.fillRect(0, GROUND - 40, W, H - GROUND + 40);
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1;
  for (let r = 0; r < 8; r++) { const y = GROUND - 40 + r * r * 1.6 + r * 6; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  for (let i = -20; i <= 20; i++) { g.beginPath(); g.moveTo(W / 2 + i * 30, GROUND - 40); g.lineTo(W / 2 + i * 90, H); g.stroke(); }
  // brume chaude
  const hz = g.createLinearGradient(0, GROUND - 120, 0, GROUND); hz.addColorStop(0, 'rgba(232,160,96,0)'); hz.addColorStop(1, 'rgba(232,160,96,.18)'); g.fillStyle = hz; g.fillRect(0, GROUND - 120, W, 120);
}

