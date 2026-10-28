// =============================== 2.0 · sprint 22 : gestes, manette, signaux sonores, duel lent ===============================
// Gestes (option) : sur l'écran de jeu, glisser vers l'adversaire = fente, vers le bas = esquive, vers le haut = imbroccata. Les boutons restent.
// Manette (Safari et Chrome la reconnaissent) : stick ou croix pour bouger, A attaque (maintenir : lourde), B esquive, X feinte, gâchettes garde, Start pause.
// Signaux sonores (option) : chaque attaque adverse a sa note selon la ligne (haute aiguë, basse grave), utile sans regarder la pointe.
// Duel lent (option) : le combat tourne à 65 % de sa vitesse pour apprendre.
const V2OPT_DEF = { gestures: false, cues: false, slowDuel: false };
const Controls = {
  opt: Object.assign({}, V2OPT_DEF), gesture: null, pad: { idx: null, prev: [], keys: new Set(), name: '' },
  load() { this.opt = Object.assign({}, V2OPT_DEF, store.get('ct2d.v2opts', {})); },
  save() { store.set('ct2d.v2opts', this.opt); },
  set(k, v) { this.opt[k] = v; this.save(); this.refreshUI(); if (k === 'slowDuel' && (G.state === 'fight' || G.state === 'round')) G.timeScale = v ? .65 : 1; },
  // ---- gestes sur le canevas ----
  initGestures() {
    const c = $('c'); let st = null;
    c.addEventListener('pointerdown', e => { if (!this.opt.gestures || G.state !== 'fight') return; st = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }; });
    const up = e => { if (!st || e.pointerId !== st.id) return; const dx = e.clientX - st.x, dy = e.clientY - st.y, dt = performance.now() - st.t; st = null; this.readSwipe(dx, dy, dt); };
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', () => { st = null; });
  },
  // un glissé rapide et franc ; sens relatif à l'adversaire (et à l'écran inversé du mode gaucher, le sens reste celui de l'adversaire)
  readSwipe(dx, dy, dt) {
    if (!this.opt.gestures || G.state !== 'fight' || dt > 450) return null; const L = Math.hypot(dx, dy); if (L < 44) return null;
    const p = G.p, toward = Math.sign(dx) === p.dir; let g = null;
    if (Math.abs(dx) > Math.abs(dy) * 1.3) g = toward ? 'fente' : null; else if (dy > 0) g = 'esq'; else g = 'circ';
    if (g) { this.gesture = g; Input.usingTouch = true; } return g;
  },
  // ---- manette ----
  pollPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : []; let gp = null; for (const p of pads || []) if (p && p.connected) { gp = p; break; }
    const K = this.pad.keys, set = (code, on) => { if (on && !K.has(code)) { K.add(code); Input.keys.add(code); } else if (!on && K.has(code)) { K.delete(code); Input.keys.delete(code); } };
    if (!gp) { for (const k of [...K]) set(k, false); this.pad.prev = []; return null; }
    const b = i => !!(gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > .5)), ax = gp.axes[0] || 0, ay = gp.axes[1] || 0, prev = this.pad.prev, edge = i => b(i) && !prev[i];
    set('ArrowLeft', b(14) || ax < -.45); set('ArrowRight', b(15) || ax > .45); set('ArrowUp', b(12) || ay < -.55); set('ArrowDown', b(13) || ay > .55);
    set('KeyJ', b(0)); set('KeyL', b(4) || b(5) || b(6) || b(7));
    if (edge(0)) Input.pressed.attack = true; if (edge(1)) Input.pressed.esq = true; if (edge(2) || edge(3)) Input.pressed.feint = true;
    if (edge(9)) { if (G.state === 'fight') G.pause(); else if (G.state === 'pause') G.resume(); }
    if (edge(0) && G.state === 'over' && !$('over').hidden) $('again').click();
    if (edge(0) && G.state === 'finish') Finisher.skip();
    if (edge(0) && G.state === 'scene') Story.next();
    if ((K.size || gp.buttons.some(x => x.pressed))) Input.usingTouch = false;
    this.pad.prev = gp.buttons.map(x => !!(x.pressed || x.value > .5)); this.pad.name = gp.id; return gp;
  },
  // ---- signaux sonores des attaques adverses ----
  cue(f, kind) {
    if (!this.opt.cues || f.isPlayer || G.state !== 'fight' || G.silent || kind === 'pending' || kind === 'riposte') return null;
    const M = MOVES[kind] || {}, line = M.line || 'ext', freq = { haute: 990, ext: 740, int: 620, basse: 440 }[line] || 700;
    Snd.tone(freq, .09, .05, 'triangle'); if (kind === 'heavy' || M.breaks) Snd.tone(freq / 2, .16, .06, 'square', 0, .06);
    return freq;
  },
  init() {
    this.load(); this.initGestures();
    // le geste et la manette passent par la même entrée que le clavier et l'écran tactile
    const ap = Input.apply; Input.apply = function (f, dt) { Controls.pollPad(); const r = ap.apply(this, arguments);
      const g = Controls.gesture; if (g && f === G.p) { Controls.gesture = null; const it = f.intent; if (g === 'esq') it.esq = true; else if (f.ripOffer && G.time <= f.ripOffer.end) it.rip = true; else it.act = 'p:' + g; }
      return r; };
    addEventListener('gamepadconnected', e => { toastMsg('Manette connectée : A attaque, B esquive, X feinte, gâchettes garde.'); this.refreshUI(); });
    addEventListener('gamepaddisconnected', () => { this.pollPad(); this.refreshUI(); });
    // la manette agit aussi au menu, sans rien jouer
    setInterval(() => { if (G.state !== 'fight' && G.state !== 'round') this.pollPad(); }, 100);
    const sm = Fighter.prototype.startMove; Fighter.prototype.startMove = function (kind) { const r = sm.apply(this, arguments); Controls.cue(this, kind); return r; };
    // touche reçue : vibration là où le téléphone le permet (pas sur iPhone depuis une page web)
    const ev = G.event; G.event = function (t, i) { if (Controls.opt.cues && t === 'hit' && i && i.d && i.d.isPlayer && navigator.vibrate) { try { navigator.vibrate(40); } catch (e) { } } return ev.apply(this, arguments); };
    const sr = G.startRound; G.startRound = function () { const r = sr.apply(this, arguments); this.timeScale = Controls.opt.slowDuel ? .65 : 1; return r; };
    // options
    const P = V2.panel('options'); if (P && !$('v2Opts')) { const row = document.createElement('div'); row.className = 'row'; row.style.alignItems = 'center'; row.innerHTML = '<span class="keys" style="min-width:110px">Commandes</span><div class="row" id="v2Opts"><button class="opt small" id="optGest">Gestes</button><button class="opt small" id="optCues">Signaux sonores</button><button class="opt small" id="optSlow">Duel lent</button></div>'; P.prepend(row);
      const hint = document.createElement('p'); hint.className = 'keys'; hint.id = 'v2Hint'; row.after(hint);
      for (const [id, k] of [['optGest', 'gestures'], ['optCues', 'cues'], ['optSlow', 'slowDuel']]) $(id).addEventListener('click', () => this.set(k, !this.opt[k])); }
    this.refreshUI();
  },
  refreshUI() {
    for (const [id, k] of [['optGest', 'gestures'], ['optCues', 'cues'], ['optSlow', 'slowDuel']]) { const b = $(id); if (b) b.setAttribute('aria-pressed', !!this.opt[k]); }
    const h = $('v2Hint'); if (h) h.textContent = (this.opt.gestures ? 'Gestes : glissez vers l\'adversaire pour la fente, vers le bas pour l\'esquive, vers le haut pour l\'imbroccata. ' : '') + (this.opt.cues ? 'Signaux : une note par attaque adverse, aiguë en haut, grave en bas. ' : '') + (this.opt.slowDuel ? 'Duel lent : 65 % de la vitesse. ' : '') + (this.pad.name ? 'Manette : ' + this.pad.name.split('(')[0].trim() + '.' : 'Une manette se branche à tout moment.');
  },
};
