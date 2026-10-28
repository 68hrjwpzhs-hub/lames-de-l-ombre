// =============================== son d'époque : instruments par modèle physique, réverbération des lieux, bruitages, fonds sonores ===============================
// Rien n'est téléchargé : cordes pincées (théorbe, clavecin) par Karplus-Strong, cloches par partiels inharmoniques,
// chocs d'acier par les modes d'une lame (barre libre), réverbération par réponse impulsionnelle calculée pour chaque lieu.
const Aud = {
  sr: 44100, cache: {},
  // lieux : durée de réverbération (s), part réverbérée, couleur (coupure aiguë), sol
  ROOMS: { salle: { rt: 1.1, wet: .22, lp: 5200, floor: 'bois' }, eglise: { rt: 3.6, wet: .42, lp: 3600, floor: 'pierre' }, cloitre: { rt: 1.5, wet: .2, lp: 6000, floor: 'pierre' },
    nuit: { rt: 1.3, wet: .2, lp: 4200, floor: 'pierre' }, loggia: { rt: .7, wet: .1, lp: 7000, floor: 'pierre' }, menu: { rt: 2.2, wet: .26, lp: 4500, floor: 'pierre' } },
  setup() {
    const c = Snd.ctx; if (!c || this.ready) return; this.sr = c.sampleRate;
    const master = Snd.out, dry = c.createGain(); dry.connect(master);
    this.rv = c.createConvolver(); this.rvSend = c.createGain(); this.rvSend.gain.value = .22; this.rvOut = c.createGain(); this.rvOut.gain.value = 1;
    dry.connect(this.rvSend); this.rvSend.connect(this.rv); this.rv.connect(this.rvOut); this.rvOut.connect(master);
    Snd.master = master; Snd.out = dry; // tous les bruitages passent désormais par la salle
    this.amb = c.createGain(); this.amb.gain.value = .0001; this.amb.connect(dry);
    this.ready = true; this.setRoom('menu');
  },
  setRoom(k) {
    const c = Snd.ctx; if (!c || !this.ready || this.room === k) return; this.room = k; const R = this.ROOMS[k] || this.ROOMS.salle;
    const mob = typeof Input !== 'undefined' && Input.touch, rt = Math.min(R.rt, mob ? 2.6 : 4), n = Math.floor(this.sr * rt), b = c.createBuffer(2, n, this.sr);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); let lp = 0; const k0 = Math.exp(-2 * Math.PI * R.lp / this.sr);
      for (let i = 0; i < n; i++) { const t = i / this.sr, env = Math.exp(-6.9 * t / rt) * (t < .012 ? t / .012 : 1), x = (Math.random() * 2 - 1) * env; // décroissance de 60 dB en rt secondes
        const kk = k0 + (1 - k0) * Math.min(.9, t / rt * .7); lp = lp * kk + x * (1 - kk); d[i] = lp * 1.6; }
      for (const [tt, g] of [[.011, .5], [.019, .35], [.027, .28], [.041, .2]]) { const i = Math.floor(tt * this.sr * (ch ? 1.07 : 1)); if (i < n) d[i] += g * (Math.random() < .5 ? -1 : 1); } } // premières réflexions
    this.rv.buffer = b; this.rvSend.gain.setTargetAtTime(R.wet, c.currentTime, .3);
  },
  // ---- cordes pincées : Karplus-Strong (corde amortie), position de pincement, deux cordes accordées à l'unisson (chœurs du luth) ----
  ks(midi, o) {
    const key = o.name + midi; if (this.cache[key]) return this.cache[key];
    const c = Snd.ctx, sr = this.sr, f = 440 * Math.pow(2, (midi - 69) / 12), dur = o.dur(midi), n = Math.floor(sr * dur), b = c.createBuffer(1, n, sr), out = b.getChannelData(0);
    for (const [det, amp] of o.strings) {
      const N = sr / (f * Math.pow(2, det / 1200)), L = Math.floor(N), fr = N - L, buf = new Float32Array(L + 2); let p = 0;
      const pos = Math.max(2, Math.floor(L * o.pos)); for (let i = 0; i < L + 2; i++) buf[i] = (Math.random() * 2 - 1); for (let i = L + 1; i >= pos; i--) buf[i] -= buf[i - pos]; // peigne : point de pincement
      let lp = 0; for (let i = 0; i < L + 2; i++) { lp = lp * (1 - o.bright) + buf[i] * o.bright; buf[i] = lp; }
      const loss = Math.pow(o.decay(f), 1 / f); let prev = 0;
      for (let i = 0; i < n; i++) { const a = buf[p], bq = buf[(p + 1) % (L + 1)], y = a + (bq - a) * fr; out[i] += y * amp; const nv = (y + prev) * .5 * loss; prev = y; buf[p] = nv; p = (p + 1) % (L + 1); }
    }
    let mx = 0; for (let i = 0; i < n; i++) mx = Math.max(mx, Math.abs(out[i])); const g = .6 / (mx || 1); const fade = Math.floor(sr * .05);
    for (let i = 0; i < n; i++) out[i] *= g * (i > n - fade ? (n - i) / fade : 1);
    return this.cache[key] = b;
  },
  INST: {
    theorbe: { name: 'th', strings: [[0, 1], [3, .7]], pos: .13, bright: .55, dur: m => m < 50 ? 2.6 : 1.8, decay: f => .35 + Math.min(.6, 60 / f), body: [[110, 3, 1.4], [260, 4, 1.2], [900, -4, 1]] },
    clavecin: { name: 'cl', strings: [[0, 1], [1202, .45], [-3, .6]], pos: .08, bright: .85, dur: m => 1.9, decay: f => .22 + Math.min(.5, 40 / f), body: [[240, 3, 1.3], [2400, 3, 1.5]] },
    harpe: { name: 'hp', strings: [[0, 1]], pos: .3, bright: .4, dur: m => 2.4, decay: f => .5, body: [[300, 2, 1]] },
  },
  pluck(inst, midi, t, v, dest, pan = 0) {
    const c = Snd.ctx, I = this.INST[inst], s = c.createBufferSource(); s.buffer = this.ks(midi, I);
    let node = s; for (const [f, g, q] of I.body) { const bq = c.createBiquadFilter(); bq.type = 'peaking'; bq.frequency.value = f; bq.gain.value = g; bq.Q.value = q; node.connect(bq); node = bq; }
    const a = c.createGain(); a.gain.value = v; node.connect(a); this.toPan(a, pan, dest); s.start(t); s.stop(t + s.buffer.duration);
  },
  toPan(node, pan, dest) { const c = Snd.ctx; if (pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = pan; node.connect(p); p.connect(dest); } else node.connect(dest); },
  // ---- viole de gambe (archet) : dent de scie, formants du coffre, vibrato tardif, bruit d'archet ----
  viol(midi, t, dur, v, dest, pan = 0, bright = 1) {
    const c = Snd.ctx, f = 440 * Math.pow(2, (midi - 69) / 12), end = t + dur + .25, o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.start(t); o.stop(end);
    const vib = c.createOscillator(), vg = c.createGain(); vib.frequency.value = 5.2; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(dur > .45 ? f * .006 : 0, t + Math.min(.5, dur)); vib.connect(vg); vg.connect(o.frequency); vib.start(t); vib.stop(end);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200 * bright; lp.Q.value = .5; o.connect(lp);
    const g = c.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .07); g.gain.setValueAtTime(v, t + Math.max(.08, dur - .08)); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .2);
    const mix = c.createGain(); mix.gain.value = .5; for (const [ff, q, gg] of [[480, 3, 1], [1150, 4, .6], [2700, 5, .35]]) { const b = c.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = ff; b.Q.value = q; const bg = c.createGain(); bg.gain.value = gg; lp.connect(b); b.connect(bg); bg.connect(mix); }
    const dl = c.createGain(); dl.gain.value = .25; lp.connect(dl); dl.connect(mix);
    const ns = c.createBufferSource(); ns.buffer = Snd.nb; const nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = f * 4; nf.Q.value = 1.5; const ng = c.createGain(); ng.gain.value = .05; ns.connect(nf); nf.connect(ng); ng.connect(mix); ns.start(t, Math.random()); ns.stop(end);
    mix.connect(g); this.toPan(g, pan, dest);
  },
  // ---- flûte à bec : fondamentale presque pure, souffle, attaque « chiff » ----
  flute(midi, t, dur, v, dest, pan = 0) {
    const c = Snd.ctx, f = 440 * Math.pow(2, (midi - 69) / 12), end = t + dur + .15, g = c.createGain();
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .03); g.gain.setValueAtTime(v * .9, t + Math.max(.04, dur - .04)); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .1);
    for (const [h, a] of [[1, 1], [2, .18], [3, .07]]) { const o = c.createOscillator(); o.frequency.value = f * h; const og = c.createGain(); og.gain.value = a; o.connect(og); og.connect(g); o.start(t); o.stop(end); if (dur > .4) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 4.8; lg.gain.value = f * h * .004; l.connect(lg); lg.connect(o.frequency); l.start(t + .2); l.stop(end); } }
    const ns = c.createBufferSource(); ns.buffer = Snd.nb; const nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = f * 2; nf.Q.value = 2; const ng = c.createGain(); ng.gain.setValueAtTime(.25, t); ng.gain.exponentialRampToValueAtTime(.04, t + .06); ns.connect(nf); nf.connect(ng); ng.connect(g); ns.start(t, Math.random()); ns.stop(end);
    this.toPan(g, pan, dest);
  },
  // ---- orgue positif : jeux de fond (8', 4', 2 2/3', 2') et attaque soufflée ----
  organ(midi, t, dur, v, dest) {
    const c = Snd.ctx, f = 440 * Math.pow(2, (midi - 69) / 12), end = t + dur + .4, g = c.createGain();
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .06); g.gain.setValueAtTime(v, t + dur); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .3);
    for (const [h, a] of [[.5, .5], [1, 1], [2, .55], [3, .25], [4, .3], [6, .1]]) { const o = c.createOscillator(); o.frequency.value = f * h; o.detune.value = (Math.random() - .5) * 4; const og = c.createGain(); og.gain.value = a * .3; o.connect(og); og.connect(g); o.start(t); o.stop(end); }
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; g.connect(lp); lp.connect(dest);
  },
  // ---- cornet à bouquin / trompette naturelle : cuivre qui s'ouvre ----
  cornet(midi, t, dur, v, dest, pan = 0) {
    const c = Snd.ctx, f = 440 * Math.pow(2, (midi - 69) / 12), end = t + dur + .2, o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f * .985, t); o.frequency.exponentialRampToValueAtTime(f, t + .05);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2; lp.frequency.setValueAtTime(400, t); lp.frequency.exponentialRampToValueAtTime(2600, t + .06); lp.frequency.exponentialRampToValueAtTime(1500, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .03); g.gain.setValueAtTime(v * .8, t + Math.max(.04, dur - .05)); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .15);
    o.connect(lp); lp.connect(g); this.toPan(g, pan, dest); o.start(t); o.stop(end);
  },
  // ---- tambour militaire (caisse et timbre en boyau) et timbales ----
  drum(t, v, dest, snare = .6) {
    const c = Snd.ctx, o = c.createOscillator(); o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(95, t + .1); const og = c.createGain(); og.gain.setValueAtTime(v, t); og.gain.exponentialRampToValueAtTime(.0001, t + .25); o.connect(og); og.connect(dest); o.start(t); o.stop(t + .3);
    const s = c.createBufferSource(); s.buffer = Snd.nb; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = .8; const sg = c.createGain(); sg.gain.setValueAtTime(v * snare, t); sg.gain.exponentialRampToValueAtTime(.0001, t + .18); s.connect(f); f.connect(sg); sg.connect(dest); s.start(t, Math.random()); s.stop(t + .2);
  },
  timbale(midi, t, v, dest) {
    const c = Snd.ctx, f = 440 * Math.pow(2, (midi - 69) / 12);
    for (const [r, a, d] of [[1, 1, 1.4], [1.5, .5, .9], [1.98, .35, .6], [2.44, .2, .4]]) { const o = c.createOscillator(); o.frequency.setValueAtTime(f * r * 1.02, t); o.frequency.exponentialRampToValueAtTime(f * r, t + .08); const g = c.createGain(); g.gain.setValueAtTime(v * a, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(dest); o.start(t); o.stop(t + d + .05); }
    const s = c.createBufferSource(); s.buffer = Snd.nb; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; const sg = c.createGain(); sg.gain.setValueAtTime(v * .5, t); sg.gain.exponentialRampToValueAtTime(.0001, t + .08); s.connect(lp); lp.connect(sg); sg.connect(dest); s.start(t, Math.random()); s.stop(t + .1);
  },
  // ---- cloche de bronze : partiels inharmoniques (hum, fondamentale, tierce mineure, quinte, octave…) ----
  bell(midi, t, v, dest, len = 6) {
    const c = Snd.ctx, f = 440 * Math.pow(2, (midi - 69) / 12);
    for (const [r, a, d] of [[.5, .5, 1], [1, 1, .8], [1.183, .55, .55], [1.506, .4, .45], [2, .45, .35], [2.514, .25, .25], [2.662, .2, .2], [3.011, .15, .16], [4.166, .1, .1]]) {
      const o = c.createOscillator(); o.frequency.value = f * r; const g = c.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v * a * .3, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + len * d); o.connect(g); g.connect(dest); o.start(t); o.stop(t + len * d + .05); }
  },
};
// ---- bruitages réalistes (remplacent les anciens) ----
(() => {
  const init0 = Snd.init; Snd.init = function () { init0.call(this); if (this.ctx) Aud.setup(); };
  // choc d'acier : modes de flexion d'une lame (barre libre : 1, 2,76, 5,40, 8,93, 13,34) + éclat du contact
  Snd.steel = function (f0, dur, g, delay = 0, pan = 0) {
    const c = this.ctx; if (!c || G.silent || !CFG.sfx) return; const t = c.currentTime + delay;
    for (const [r, a, d] of [[1, 1, 1], [2.756, .7, .7], [5.404, .5, .45], [8.933, .35, .3], [13.34, .2, .18]]) { const f = f0 * r * (1 + (Math.random() - .5) * .01); if (f > 16000) continue;
      const o = c.createOscillator(); o.frequency.value = f; const a2 = c.createGain(); a2.gain.setValueAtTime(.0001, t); a2.gain.exponentialRampToValueAtTime(g * a, t + .002); a2.gain.exponentialRampToValueAtTime(.0001, t + dur * d); o.connect(a2); Aud.toPan(a2, pan, this.out); o.start(t); o.stop(t + dur * d + .05); }
    this.noise(.04, 'highpass', 4000, 9000, .7, g * 2.2, delay);
  };
  Snd.clang = function (bright) { if (bright) { this.steel(1380, 1.8, .07, 0, .1); this.steel(1720, 1.5, .05, .012, -.1); this.tone(2637, 1.2, .02, 'sine', 0, .05); } else { this.steel(1050, .6, .08); this.steel(1310, .45, .05, .008); } };
  Snd.tick = function () { this.steel(1900, .25, .04); };
  Snd.crack = function () { this.tone(150, .25, .3, 'sine', 60); this.noise(.3, 'bandpass', 1400, 300, .9, .45); this.steel(820, .9, .09); this.steel(1170, .7, .06, .02); };
  // pas : parquet de la salle d'armes, pierre ailleurs, pavés mouillés sous la pluie
  Snd.step = function () {
    const R = Aud.ROOMS[G.venue] || Aud.ROOMS.salle, wet = G.weather === 'rain';
    if (R.floor === 'bois') { this.noise(.07, 'bandpass', 420, 180, 1.4, .05); this.noise(.03, 'bandpass', 1800, 900, 2, .02); }
    else { this.noise(.045, 'bandpass', 1500, 600, 1.1, .04); this.noise(.025, 'highpass', 3500, 5000, .7, .015); }
    if (wet) this.noise(.12, 'bandpass', 2600, 1200, .9, .03, .01);
  };
  Snd.stamp = function () { this.tone(85, .14, .32, 'sine', 48); const wood = (Aud.ROOMS[G.venue] || {}).floor === 'bois'; this.noise(.08, 'lowpass', wood ? 700 : 1300, 200, .7, .22); };
  Snd.cloth = function (p = 1) { this.noise(.22 * p, 'bandpass', 900, 2200, .6, .03 * p); }; // froissement de cape et de manches
  const dash0 = Snd.dash; Snd.dash = function () { dash0.call(this); this.cloth(1.2); };
  const swish0 = Snd.swish; Snd.swish = function (p = 1) { swish0.call(this, p); this.cloth(p * .7); };
  // cloche d'annonce de manche : vraie cloche de bronze
  Snd.bell = function () { const c = this.ctx; if (!c || G.silent || !CFG.sfx) return; Aud.bell(76, c.currentTime, .5, this.out, 3.5); };
  Snd.ding = function () { const c = this.ctx; if (!c || G.silent || !CFG.sfx) return; Aud.bell(88, c.currentTime, .22, this.out, 1.4); };
  Snd.fanfare = function () { }; // les fanfares sont jouées par la musique (cornets et timbales)
  // cri de vouivre : glissando rauque à travers des formants, lointain
  Snd.wyvern = function (pan = 0, far = 1) {
    const c = this.ctx; if (!c || G.silent || !CFG.sfx) return; const t = c.currentTime, o = c.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(380, t); o.frequency.exponentialRampToValueAtTime(820, t + .25); o.frequency.exponentialRampToValueAtTime(260, t + 1.1);
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 28; lg.gain.value = 60; lfo.connect(lg); lg.connect(o.frequency);
    const g = c.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05 * far, t + .1); g.gain.exponentialRampToValueAtTime(.0001, t + 1.2);
    for (const [f, q] of [[700, 4], [1300, 5], [2600, 6]]) { const b = c.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = q; o.connect(b); b.connect(g); }
    Aud.toPan(g, pan, this.out); o.start(t); o.stop(t + 1.3); lfo.start(t); lfo.stop(t + 1.3);
  };
})();
// ---- fonds sonores par lieu : rivière, fontaine, oiseaux, vent, feu, foule lointaine, cloches, cris de vouivres ----
const Bed = {
  venue: null, nodes: [], nextEv: 0,
  update(dt) {
    const c = Snd.ctx; if (!c || !Aud.ready) return; const on = (G.state === 'fight' || G.state === 'ko' || G.state === 'demo' || G.state === 'pause') && CFG.sfx && !G.silent;
    Aud.setRoom(on || G.state === 'over' ? G.venue : 'menu');
    Aud.amb.gain.setTargetAtTime(on ? (G.state === 'pause' ? .25 : 1) : .0001, c.currentTime, .6);
    if (on && this.venue !== G.venue) this.build(G.venue);
    if (!on) return;
    if (c.currentTime > this.nextEv) { this.nextEv = c.currentTime + 4 + Math.random() * 9; this.event(); }
  },
  loopNoise(type, f, q, g, lfoF = 0, lfoD = 0) {
    const c = Snd.ctx, s = c.createBufferSource(); s.buffer = Snd.nb; s.loop = true; const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; const a = c.createGain(); a.gain.value = g;
    s.connect(b); b.connect(a); a.connect(Aud.amb); s.start(0, Math.random()); this.nodes.push(s);
    if (lfoF) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = lfoF; lg.gain.value = g * lfoD; l.connect(lg); lg.connect(a.gain); l.start(); this.nodes.push(l); }
  },
  build(v) {
    for (const n of this.nodes) { try { n.stop(); } catch (e) { } } this.nodes = []; this.venue = v;
    if (v === 'nuit') { this.loopNoise('bandpass', 380, .8, .05, .13, .6); this.loopNoise('bandpass', 1100, 1.5, .015, .21, .8); } // la Seine contre les piles du pont
    else if (v === 'cloitre') { this.loopNoise('highpass', 2500, .5, .012, .7, .3); this.loopNoise('bandpass', 500, .6, .012, .09, .5); } // fontaine, rumeur de la cour
    else if (v === 'loggia') { this.loopNoise('lowpass', 500, .7, .05, .07, .8); this.loopNoise('bandpass', 1400, 3, .008, .11, .9); } // vent sur les toits
    else if (v === 'eglise') { this.loopNoise('lowpass', 220, .7, .03, .05, .3); const c = Snd.ctx; for (const m of [38, 45, 50]) { const o = c.createOscillator(); o.frequency.value = 440 * Math.pow(2, (m - 69) / 12); const g = c.createGain(); g.gain.value = .006; o.connect(g); g.connect(Aud.amb); o.start(); this.nodes.push(o); } } // nef, bourdon d'orgue lointain
    else { this.loopNoise('lowpass', 300, .7, .015, .1, .4); } // salle d'armes : feu de cheminée, maison
  },
  event() {
    const c = Snd.ctx, t = c.currentTime + .05, v = this.venue, out = Aud.amb, r = Math.random();
    const chirp = (f0, n) => { for (let i = 0; i < n; i++) { const o = c.createOscillator(), g = c.createGain(), tt = t + i * .11; o.frequency.setValueAtTime(f0, tt); o.frequency.exponentialRampToValueAtTime(f0 * 1.6, tt + .05); g.gain.setValueAtTime(.0001, tt); g.gain.exponentialRampToValueAtTime(.012, tt + .01); g.gain.exponentialRampToValueAtTime(.0001, tt + .07); o.connect(g); g.connect(out); o.start(tt); o.stop(tt + .08); } };
    const crackle = n => { for (let i = 0; i < n; i++) { const tt = t + Math.random() * 1.5, s = c.createBufferSource(); s.buffer = Snd.nb; const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2000 + Math.random() * 3000; const g = c.createGain(); g.gain.setValueAtTime(.03 * Math.random(), tt); g.gain.exponentialRampToValueAtTime(.0001, tt + .015); s.connect(f); f.connect(g); g.connect(out); s.start(tt, Math.random()); s.stop(tt + .02); } };
    const outdoor = v === 'nuit' || v === 'cloitre' || v === 'loggia';
    if (outdoor && r < .18) return Snd.wyvern(Math.random() * 1.6 - .8, .6);
    if (v === 'eglise') { if (r < .35) Aud.bell(50, t, .25, out, 7); else if (r < .5) Aud.bell(57, t, .12, out, 5); }
    else if (v === 'nuit') { if (r < .3) Aud.bell(55, t, .07, out, 6); else if (r < .6) for (let i = 0; i < 6; i++) chirp(4200 + Math.random() * 300, 1); }
    else if (v === 'cloitre') { if (r < .7) chirp(2600 + Math.random() * 1600, 2 + Math.floor(Math.random() * 4)); }
    else if (v === 'loggia') { if (r < .5) { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(330, t); o.frequency.linearRampToValueAtTime(290, t + .5); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.01, t + .08); g.gain.exponentialRampToValueAtTime(.0001, t + .55); const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + .6); } } // pigeons
    else crackle(6 + Math.floor(Math.random() * 10));
  },
};
