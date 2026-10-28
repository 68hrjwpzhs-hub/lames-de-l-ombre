// =============================== musique : bande originale de style 1630, jouée par des instruments d'époque modélisés ===============================
// Compositions originales et airs du domaine public réarrangés ici, note à note : rien n'est téléchargé, rien n'est protégé.
// - Thème du Cardinal (original) : orgue grave, violes, tambour voilé — ouvre le menu.
// - La Folia (basse obstinée ibérique du XVIe s., domaine public) : variations improvisées pour théorbe, viole et flûte à bec.
// - Tarentelle de combat (originale) en couches : la tension du duel ajoute le clavecin, le tambour, puis le cornet.
// - Toccata de victoire (originale, à la manière des fanfares d'ouverture du début du XVIIe s.) ; lamento (basse de lamento descendante).
const mf = m => 440 * Math.pow(2, (m - 69) / 12);
const CH = { Dm: [50, [62, 65, 69]], A: [45, [61, 64, 69]], Gm: [43, [62, 67, 70]], C: [48, [60, 64, 67]], Bb: [46, [62, 65, 70]], D: [50, [62, 66, 69]], F: [53, [60, 65, 69]], E: [52, [64, 68, 71]] };
const H_ = -2; // tenue de la note précédente
const TAR_A = { ch: ['Dm', 'A', 'Dm', 'A', 'Dm', 'Gm', 'A', 'Dm'], mel: [
  [69, 74, 74, 74, 76, 77], [76, 73, 73, 73, 74, 76], [77, 76, 74, 74, 73, 74], [76, 69, H_, H_, 0, 0],
  [69, 74, 74, 74, 76, 77], [79, 77, 76, 74, 76, 77], [76, 74, 73, 69, 73, 76], [74, H_, H_, 74, 0, 0]] };
const TAR_B = { ch: ['Gm', 'Dm', 'A', 'Dm', 'Gm', 'Dm', 'A', 'Dm'], mel: [
  [79, 77, 79, 81, 79, 77], [77, 76, 77, 79, 77, 76], [76, 74, 76, 77, 76, 74], [74, 73, 74, 69, 0, 0],
  [79, 77, 79, 81, 79, 77], [81, 79, 77, 76, 74, 77], [76, 73, 69, 73, 76, 79], [77, 76, 74, 74, H_, 0]] };
const FOLIA = ['Dm', 'A', 'Dm', 'C', 'F', 'C', 'Dm', 'A', 'Dm', 'A', 'Dm', 'C', 'F', 'C', 'Dm', 'Dm']; // la Folia : basse obstinée, une harmonie par mesure à 3/4
// thème du Cardinal : quatre mesures graves et inquiètes, retenues par l'orgue (original)
const CARD = { ch: ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'Gm', 'A', 'Dm'], mel: [[62, H_, 65, 64], [62, H_, 61, H_], [62, 64, 65, 67], [69, H_, H_, H_], [74, H_, 72, 70], [69, H_, 67, 65], [64, H_, 61, H_], [62, H_, H_, H_]] };
const noteLen = (row, i) => { let n = 1; for (let k = i + 1; k < row.length && row[k] === H_; k++) n++; return n; };
const SCALE = [62, 64, 65, 67, 69, 70, 72, 74, 76, 77, 79, 81];

const Music = {
  track: null, want: null, next: 0, step: 0, bus: null, vol: .55, intensity: 0, L: [0, 0, 0], rng: 1,
  init() { setInterval(() => this.tick(), 40); },
  play(name) { this.want = name; },
  rnd() { this.rng = (this.rng * 16807) % 2147483647; return (this.rng - 1) / 2147483646; },
  // tension du duel (0 à 1) : distance, attaques en cours, vie basse, dernière manche
  tension() {
    if (!(G.state === 'fight' || G.state === 'demo') || !G.p || !G.e) return 0;
    const d = Math.abs(G.p.x - G.e.x), near = clamp((340 - d) / 180, 0, 1), atk = (G.p.state === 'attack' || G.e.state === 'attack') ? 1 : 0;
    this.atkT = atk ? G.time : this.atkT || -9; const recent = clamp(1 - (G.time - this.atkT) / 2.5, 0, 1);
    const hp = clamp((50 - Math.min(G.p.hp, G.e.hp)) / 40, 0, 1), last = G.round >= 3 ? .35 : 0;
    return clamp(near * .35 + recent * .35 + hp * .5 + last, 0, 1);
  },
  tick() {
    const c = Snd.ctx; if (!c || G.silent) return;
    if (typeof Bed !== 'undefined') Bed.update();
    if (!CFG.music) { if (this.bus) this.fade(this.bus); this.bus = null; this.track = null; return; }
    if (this.want !== this.track || !this.bus) {
      if (this.bus) this.fade(this.bus);
      this.track = this.want; if (!this.track) return;
      this.bus = c.createGain(); this.bus.gain.value = .0001; this.bus.gain.exponentialRampToValueAtTime(this.vol, c.currentTime + .8); this.bus.connect(Snd.out);
      this.step = 0; this.next = c.currentTime + .12; this.rng = 1 + Math.floor(Math.random() * 1e6);
    }
    // coup de grâce : la musique se tait ; pause : elle s'éloigne
    const target = G.state === 'ko' ? this.vol * .12 : G.state === 'pause' ? this.vol * .3 : this.vol; this.bus.gain.setTargetAtTime(target, c.currentTime, G.state === 'ko' ? .08 : .3);
    const ten = this.tension(); this.intensity = ten;
    this.L = [1, ten > .25 ? 1 : 0, ten > .6 ? 1 : 0]; // couches : base, clavecin et tambour, cornet et doublures
    const T = this.TRACKS[this.track];
    while (this.next < c.currentTime + .3) {
      T.play.call(this, this.step, this.next);
      this.next += T.dt; this.step++;
      if (T.len && this.step >= T.len) { this.want = T.then; this.track = null; this.fade(this.bus); this.bus = null; return; }
    }
  },
  fade(bus) { const c = Snd.ctx; bus.gain.cancelScheduledValues(c.currentTime); bus.gain.setTargetAtTime(.0001, c.currentTime, .25); setTimeout(() => { try { bus.disconnect(); } catch (e) { } }, 1500); },
  // couleur instrumentale du lieu : orgue à Notre-Dame, clavecin à la salle d'armes, flûte la nuit et sur les toits
  color() { const v = G.venue; return v === 'eglise' ? 'orgue' : v === 'nuit' || v === 'loggia' ? 'flute' : 'clavecin'; },
  // ---- morceaux ----
  TRACKS: {
    // menu : thème du Cardinal (8 mesures à 4/4), puis la Folia en sarabande (16 mesures à 3/4), en boucle
    menu: { dt: 60 / 72 / 2, play(s, t) {
      const dt = 60 / 72 / 2, A = Aud, bus = this.bus, cyc = 64 + 96, k = s % cyc;
      if (k < 64) { // thème du Cardinal
        const bar = Math.floor(k / 8), e = k % 8, ch = CARD.ch[bar], [b] = CH[ch];
        if (e === 0) { A.organ(b - 12, t, dt * 7.6, .05, bus); A.viol(b - 12, t, dt * 7.4, .07, bus, -.3, .7); for (const m of CH[ch][1]) A.organ(m - 12, t, dt * 7.6, .018, bus); }
        if (e === 0 && bar % 2 === 1) A.drum(t, .05, bus, .9); if (e === 6 && bar === 7) A.timbale(38, t, .2, bus);
        if (e % 2 === 0) { const row = CARD.mel[bar], i = e / 2, m = row[i]; if (m > 0) A.viol(m, t, noteLen(row, i) * dt * 2 - .05, .085, bus, .2, .9); }
        return;
      }
      // la Folia : croche = dt ; mesure de 6 croches (3 noires)
      const j = k - 64, bar = Math.floor(j / 6), e = j % 6, ch = FOLIA[bar % 16], [b, tones] = CH[ch], pass = Math.floor(s / cyc) % 3;
      if (e === 0) { A.viol(b - 12, t, dt * 3.8, .08, bus, -.25, .8); A.pluck('theorbe', b - 12, t, .5, bus, -.2); }
      if (e === 2) for (let i = 0; i < 3; i++) A.pluck('theorbe', tones[i] - 12, t + i * .018, .22, bus, -.1); // rasgueado léger sur le 2e temps (sarabande)
      if (e === 4) A.pluck('theorbe', b, t, .25, bus, -.2);
      // mélodie : variations (première fois : valeurs longues ; ensuite : divisions de plus en plus vives)
      const div = pass === 0 ? [0, 3] : pass === 1 ? [0, 2, 3, 4] : [0, 1, 2, 3, 4, 5];
      if (div.includes(e) && bar < 16) {
        if (e === 0 || this.lastM == null) this.lastM = tones[(bar + pass) % 3] + 12;
        else { const pool = SCALE.filter(m => Math.abs(m - this.lastM) <= 4).map(m => ch === 'A' && m % 12 === 0 ? m + 1 : m); this.lastM = pool[Math.floor(this.rnd() * pool.length)] || this.lastM; }
        const len = (div[div.indexOf(e) + 1] ?? 6) - e, m = this.lastM;
        if (pass === 2) A.flute(m + 12, t, len * dt - .03, .06, bus, .25); else A.viol(m, t, len * dt - .03, .075, bus, .25);
      }
    } },
    // combat : tarentelle 6/8 ; la couche 1 ajoute clavecin (ou orgue, ou flûte) et tambour, la couche 2 le cornet et la doublure
    combat: { dt: 60 / 104 / 3, play(s, t) {
      const dt = 60 / 104 / 3, A = Aud, bus = this.bus, L = this.L, cyc = Math.floor(s / 48) % 3, sec = cyc === 1 ? TAR_B : TAR_A, bar = Math.floor(s / 6) % 8, e = s % 6;
      const ch = sec.ch[bar], [b, tones] = CH[ch], col = this.color();
      if (e === 0) { A.viol(b - 12, t, dt * 2.6, .085, bus, -.3, .8); A.pluck('theorbe', b - 12, t, .45, bus, -.2); }
      if (e === 3) { A.viol(b - 5, t, dt * 2.4, .06, bus, -.3, .8); }
      if (e === 1 || e === 4) for (let i = 0; i < 3; i++) A.pluck('theorbe', tones[i] - 12, t + i * .012, .16, bus, -.15);
      if (L[1]) { // couche 1 : continuo et percussions
        if (col === 'clavecin' && (e === 2 || e === 5)) for (const m of tones) A.pluck('clavecin', m, t, .1, bus, .15);
        if (col === 'orgue' && e === 0) for (const m of tones) A.organ(m - 12, t, dt * 5.5, .016, bus);
        if (col === 'flute' && (e === 2 || e === 5)) A.pluck('harpe', tones[e === 2 ? 1 : 2], t, .18, bus, .2);
        A.drum(t, e === 0 ? .1 : e === 3 ? .07 : .025, bus, e === 0 || e === 3 ? .7 : 1);
      }
      if (L[2] && e === 0 && bar % 2 === 0) A.timbale(b < 48 ? b - 12 + 12 : b - 12, t, .22, bus);
      const row = sec.mel[bar], m = row[e];
      if (m > 0) { const d = noteLen(row, e) * dt - .02; // mélodie : viole, puis flûte ou cornet quand ça se tend
        if (L[2]) { A.cornet(m, t, d, .045, bus, .2); A.viol(m - 12, t, d, .05, bus, -.1); }
        else if (cyc === 2 || col === 'flute') A.flute(m + (col === 'flute' ? 12 : 0), t, d, .06, bus, .2);
        else A.viol(m, t, d, .075, bus, .2); }
    } },
    victoire: { dt: 60 / 112 / 4, len: 64, then: 'menu', play(s, t) { // toccata : accord de ré majeur martelé (rythme long-brève-brève), cornets et timbales
      const A = Aud, bus = this.bus, dt = 60 / 112 / 4, bar = Math.floor(s / 16), e = s % 16, fig = [0, 6, 8, 12];
      const chs = ['D', 'D', 'A', 'D'], [b, tones] = CH[chs[bar]];
      if (fig.includes(e) && bar < 3 || (bar === 3 && e === 0)) { const v = e === 0 ? .06 : .045, d = bar === 3 ? dt * 14 : (e === 0 ? dt * 5.5 : dt * 1.8);
        A.cornet(tones[2] + 12, t, d, v, bus, .2); A.cornet(tones[0] + 12, t, d, v * .8, bus, -.2); A.cornet(b, t, d, v * .7, bus, 0); A.timbale(e === 0 ? 38 : 45, t, .2, bus); }
      if (bar === 3 && e === 0) { A.organ(b - 12, t, dt * 14, .04, bus); Aud.bell(74, t, .25, bus, 3); }
    } },
    defaite: { dt: .5, len: 16, then: 'menu', play(s, t) { // lamento : basse descendante ré – do – si♭ – la, viole seule
      const A = Aud, bus = this.bus, bass = [50, 48, 46, 45, 50, 48, 46, 45], mel = [74, 72, 70, 69, H_, 67, 65, 64, 62, H_, H_, 61, 62, H_, 0, 0];
      if (s % 2 === 0 && s < 16) { A.viol(bass[s / 2] - 12, t, .95, .07, bus, -.3, .7); A.pluck('theorbe', bass[s / 2] - 12, t, .3, bus); }
      if (mel[s] > 0) A.viol(mel[s] - 12, t, noteLen(mel, s) * .5 - .05, .08, bus, .2);
    } },
  },
};
