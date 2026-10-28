
// =============================== ambiance : le guet et le temps qu'il fait ===============================
// Depuis l'édit de 1626, le duel est interdit : dans la rue, sur les toits ou sous les fenêtres du Cardinal,
// le guet finit toujours par arriver. La pluie rend les pavés glissants ; la nuit, l'orage éclaire la scène.
const OUTDOOR = ['loggia', 'nuit', 'cloitre'];
const RAIN_P = { loggia: .3, nuit: .5, cloitre: .25 };
const GUET_WARN = 12;
const hash1 = i => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const Ambiance = {
  // au début de chaque manche
  setup() {
    const v = G.venue, outdoor = OUTDOOR.includes(v);
    G.guet = outdoor && (G.mode === 'run' || G.mode === 'duel') || (G.mode === 'story' && !!G.storyGuet);
    G.weather = outdoor && G.mode !== 'training' && Math.random() < (RAIN_P[v] || 0) ? 'rain' : 'clear';
    if (G.forceWeather) G.weather = G.forceWeather;
    this.warned = false; this.flashT = 0; this.nextBolt = 3 + Math.random() * 5; this.thunderAt = -1;
    Snd.rain(G.weather === 'rain' && !G.silent);
    return { timer: G.mode === 'training' ? 999 : G.mode === 'story' ? (G.storyTimer || 999) : G.mode === 'run' ? 45 : 60, sub: G.weather === 'rain' ? 'Pluie : pavés glissants' : G.guet ? 'Duel interdit : gare au guet' : null };
  },
  stop() { Snd.rain(false); },
  step(dt) {
    if (G.state !== 'fight' && G.state !== 'ko') return;
    if (G.guet && G.state === 'fight' && !this.warned && G.timer <= GUET_WARN) { this.warned = true; Snd.whistle(); G.say('Le guet arrive !', [W / 2, 150], '#ff9a7a', 26); }
    if (G.weather === 'rain' && (G.venue === 'nuit' || G.venue === 'loggia')) {
      this.nextBolt -= dt; if (this.nextBolt <= 0) { this.nextBolt = 6 + Math.random() * 8; this.flashT = .5; this.boltX = 120 + Math.random() * 720; this.thunderAt = G.time + .5 + Math.random() * .8; }
      if (this.thunderAt > 0 && G.time >= this.thunderAt) { this.thunderAt = -1; Snd.thunder(); }
    }
    this.flashT = Math.max(0, this.flashT - dt);
  },
  // fin de manche au temps : le guet tranche (rapport des points de vie)
  timeUp() {
    const p = G.p, e = G.e, eMax = G.mode === 'run' ? RUN_FOE_HP[Run.cur.stage] : 100;
    G.endRound(p.hp / 100 >= e.hp / eMax ? p : e, G.guet ? 'Le guet !' : 'Temps écoulé');
    if (G.guet) Snd.whistle();
  },
  // ---- dessin ----
  back(g, t) { // derrière les duellistes : voile de pluie lointain, sol mouillé, gardes qui approchent
    if (G.weather === 'rain') {
      g.fillStyle = 'rgba(30,40,62,.22)'; g.fillRect(0, 0, W, H);
      const wg = g.createLinearGradient(0, 430, 0, H); wg.addColorStop(0, 'rgba(170,185,220,.12)'); wg.addColorStop(1, 'rgba(170,185,220,.03)'); g.fillStyle = wg; g.fillRect(0, 430, W, H - 430);
      this.drops(g, t, 260, 12, 520, .16, 0);
    }
    if (G.guet && (G.state === 'fight' || G.state === 'ko') && G.timer <= GUET_WARN) {
      const u = clamp(1 - G.timer / GUET_WARN, 0, 1), night = G.venue === 'nuit' || G.weather === 'rain', R = rng(5);
      for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
        const x0 = side < 0 ? -40 - k * 46 : W + 40 + k * 46, x1 = side < 0 ? 40 + 80 * u - k * 46 : W - 40 - 80 * u + k * 46, x = lerp(x0, x1, ease(u)) + Math.sin(t * 7 + k) * 1.5;
        person(g, x, 440 + k * 2, 62 - k * 3, k === 1 && night ? 'porteur' : 'garde', R, { dir: -side, cape: '#3a0a0e' });
      }
    }
  },
  front(g, t) { // devant : pluie proche, éclaboussures, éclair
    if (G.weather === 'rain') {
      this.drops(g, t, 170, 26, 980, .26, 300);
      g.save(); g.strokeStyle = 'rgba(210,220,240,.35)'; g.lineWidth = .8;
      for (let k = 0; k < 34; k++) { const b = Math.floor(t * 7) * 41 + k, ph = (t * 7) % 1, x = hash1(b * 1.7) * W, y = 440 + hash1(b * 3.1) * 96, r = 1 + ph * (3 + (y - 440) / 30);
        g.globalAlpha = 1 - ph; g.beginPath(); g.ellipse(x, y, r * 1.6, r * .45, 0, 0, 7); g.stroke(); }
      g.restore();
    }
    if (this.flashT > 0) {
      const a = this.flashT > .38 ? .55 : this.flashT > .3 ? .1 : this.flashT > .22 ? .35 : this.flashT * .4;
      g.fillStyle = `rgba(220,230,255,${a})`; g.fillRect(0, 0, W, H);
      if (this.flashT > .3) { g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2; g.beginPath(); let x = this.boltX, y = 0; g.moveTo(x, y); const R = rng(Math.floor(this.boltX)); while (y < 260) { x += (R() - .5) * 40; y += 18 + R() * 20; g.lineTo(x, y); } g.stroke(); }
    }
  },
  drops(g, t, n, len, speed, a, seed) {
    g.save(); g.strokeStyle = `rgba(205,215,235,${a})`; g.lineWidth = len > 20 ? 1.2 : .8; g.beginPath();
    const wind = -.22;
    for (let i = 0; i < n; i++) { const s = seed + i, y = ((hash1(s) * (H + 80) + t * speed * (.8 + hash1(s + 7) * .4)) % (H + 80)) - 40, x = ((hash1(s + 3) * (W + 200) + y * -wind) % (W + 200)) - 100;
      g.moveTo(x, y); g.lineTo(x + wind * len, y + len); }
    g.stroke(); g.restore();
  },
};
