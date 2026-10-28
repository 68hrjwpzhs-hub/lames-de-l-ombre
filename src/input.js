
// =============================== entrées ===============================
// Notation « pavé numérique » relative à l'orientation : 4 arrière, 6 avant, 8 haut, 2 bas (7 9 1 3 : diagonales), 5 neutre.
const Input = {
  touch: matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0, usingTouch: false,
  keys: new Set(), dirs: [], lastMotion: 0, stick: { x: 0, y: 0, id: null }, btn: { guard: false, attack: false }, pressed: { attack: false, feint: false, esq: false },
  tap: null, prevHx: 0, feintNext: false,
  init() {
    addEventListener('keydown', e => {
      if (e.target && e.target.tagName === 'INPUT') return; // saisie du nom
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(e.code)) e.preventDefault();
      if (e.code === 'Escape' || e.code === 'KeyP') { if (G.state === 'fight') G.pause(); else if (G.state === 'pause') G.resume(); else if (G.state === 'demo') Demo.stop(); return; }
      if (e.repeat) return; this.keys.add(e.code); this.usingTouch = false; Snd.init();
      if (e.code === 'KeyJ') this.pressed.attack = true;
      if (e.code === 'KeyK') this.pressed.feint = true;
      if (e.code === 'KeyI' || e.code === 'KeyU') this.pressed.esq = true;
      if (G.state === 'over' && e.code === 'Enter' && !$('over').hidden) $('again').click();
    });
    addEventListener('keyup', e => this.keys.delete(e.code));
    $('c').addEventListener('pointerdown', () => { if (G.state === 'finish') Finisher.skip(); }); addEventListener('keydown', e => { if (G.state === 'finish' && (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape')) Finisher.skip(); });
    addEventListener('blur', () => { this.keys.clear(); this.btn.guard = false; this.btn.attack = false; this.stick.id = null; this.stick.x = this.stick.y = 0; if (G.state === 'fight') G.pause(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && G.state === 'fight') G.pause(); });
    // pas de défilement, de zoom ni de sélection pendant le combat (les menus restent défilables)
    document.addEventListener('touchmove', e => { if (!e.target.closest || !e.target.closest('.card')) e.preventDefault(); }, { passive: false });
    document.addEventListener('dblclick', e => e.preventDefault());
    document.addEventListener('gesturestart', e => e.preventDefault());
    this.initTouch();
  },
  initTouch() {
    const zone = $('stickZone'), base = $('stickBase'), knob = $('stickKnob'); let ox = 0, oy = 0;
    zone.addEventListener('pointerdown', e => { e.preventDefault(); if (this.stick.id !== null) return; this.stick.id = e.pointerId; this.usingTouch = e.pointerType !== 'mouse'; try { zone.setPointerCapture(e.pointerId); } catch (_) { } Snd.init(); const r = zone.getBoundingClientRect(); ox = e.clientX; oy = e.clientY; base.style.left = (ox - r.left) + 'px'; base.style.top = (oy - r.top) + 'px'; base.classList.add('on'); this.stick.x = this.stick.y = 0; });
    zone.addEventListener('pointermove', e => { if (e.pointerId !== this.stick.id) return; let dx = e.clientX - ox, dy = e.clientY - oy; const l = Math.hypot(dx, dy), R = 56; if (l > R) { dx *= R / l; dy *= R / l; } knob.style.transform = `translate(${dx}px,${dy}px)`; this.stick.x = dx / R; this.stick.y = dy / R; });
    const end = e => { if (e.pointerId !== this.stick.id) return; this.stick.id = null; this.stick.x = this.stick.y = 0; knob.style.transform = ''; base.classList.remove('on'); };
    zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end); zone.addEventListener('lostpointercapture', end);
    const hold = (id, down, up) => { const el = $(id); let pid = null;
      const rel = e => { if (e.pointerId !== pid) return; pid = null; el.classList.remove('down'); up && up(); };
      el.addEventListener('pointerdown', e => { e.preventDefault(); if (pid !== null) return; pid = e.pointerId; this.usingTouch = e.pointerType !== 'mouse'; try { el.setPointerCapture(pid); } catch (_) { } el.classList.add('down'); Snd.init(); down(); });
      el.addEventListener('pointerup', rel); el.addEventListener('pointercancel', rel); el.addEventListener('lostpointercapture', rel);
      el.addEventListener('contextmenu', e => e.preventDefault()); el.addEventListener('click', e => e.preventDefault()); };
    hold('bAtk', () => { this.pressed.attack = true; this.btn.attack = true; }, () => { this.btn.attack = false; });
    hold('bFeint', () => { this.pressed.feint = true; });
    hold('bEsq', () => { this.pressed.esq = true; });
    hold('bGuard', () => { this.btn.guard = true; }, () => { this.btn.guard = false; });
  },
  dirNum(dir) {
    const k = this.keys;
    let x = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    let y = (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) - (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0), mag = 1;
    if (this.stick.id !== null) {
      const sx = this.stick.x, sy = this.stick.y; x = Math.abs(sx) > .3 ? Math.sign(sx) : 0; y = sy < -.5 ? -1 : sy > .5 ? 1 : 0;
      mag = Math.abs(sx) < .62 ? .5 : 1; // petit déplacement du pouce : pas d'ajustement
      if (y !== 0 && Math.abs(sx) < .45) x = 0;
    }
    const f = x * dir; const n = y < 0 ? (f > 0 ? 9 : f < 0 ? 7 : 8) : y > 0 ? (f > 0 ? 3 : f < 0 ? 1 : 2) : (f > 0 ? 6 : f < 0 ? 4 : 5);
    return { x, y, f, n, mag };
  },
  apply(fi, dt) {
    const now = G.time, D = this.dirNum(fi.dir), it = fi.intent;
    if (!this.dirs.length || this.dirs[this.dirs.length - 1].n !== D.n) this.dirs.push({ n: D.n, t: now });
    while (this.dirs.length && this.dirs[0].t < now - .8) this.dirs.shift();
    it.dx = D.x * D.mag;
    // double poussée horizontale : pas rapide (avant ou retraite)
    if (D.x !== 0 && this.prevHx === 0) { if (this.tap && this.tap.s === D.x && now - this.tap.t < .28) { it.dash = D.x * fi.dir; this.tap = null; } else this.tap = { s: D.x, t: now }; }
    this.prevHx = D.x;
    // une seule garde (maintenue) ; Attaque maintenue → fente lourde
    it.guard = this.btn.guard || this.keys.has('KeyL') || this.keys.has('Space');
    it.holdAtk = this.btn.attack || this.keys.has('KeyJ');
    if (this.feintNext) { it.act = 'feint'; this.feintNext = false; }
    if (this.pressed.attack && fi.ripOffer && now <= fi.ripOffer.end) { it.rip = true; this.pressed.attack = false; } // pendant l'offre, le bouton Attaque devient Riposte (sous le pouce)
    if (this.pressed.attack) {
      it.act = 'p:' + (D.y < 0 ? 'circ' : D.y > 0 ? 'bassa' : D.f > 0 ? 'fente' : D.f < 0 ? 'degage' : 'jab');
      if (this.pressed.feint) this.feintNext = true; // Attaque et Feinte ensemble : attaque composée
    } else if (this.pressed.feint) it.act = D.y > 0 ? 'lie' : D.f > 0 && D.y === 0 && D.mag === 1 ? 'beat' : 'feint'; // le fer : → + Feinte battement, ↓ + Feinte prise de fer
    if (this.pressed.esq) it.esq = true;
    this.pressed.attack = this.pressed.feint = this.pressed.esq = false;
  },
};

G.init();
