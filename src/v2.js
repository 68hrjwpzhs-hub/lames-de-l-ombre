// =============================== 2.0 : branchement des nouveautés (appelé par G.init, après le menu) ===============================
const V2 = {
  screens: ['defi', 'ecole', 'joute', 'carte', 'forge', 'succes'],
  panel(k) { return document.querySelector(`#menu .mpanel[data-k="${k}"]`); },
  mods() { return [typeof Offhand !== 'undefined' && Offhand, typeof Defi !== 'undefined' && Defi, typeof Ecole !== 'undefined' && Ecole, typeof Controls !== 'undefined' && Controls, typeof A11y !== 'undefined' && A11y, typeof GL !== 'undefined' && GL, typeof DecorHD !== 'undefined' && DecorHD, typeof Costume !== 'undefined' && Costume, ...(typeof Panache !== 'undefined' ? [Panache, Props, Melee, Allies, V4World, Rep, Carte, Chase, Forge, Ach, NGP, Photo, Slots, AudioV4, Joute] : []), typeof I18N !== 'undefined' && I18N].filter(Boolean); },
  init() {
    // 3.0 : poses captées sur vidéo (tools/mocap.py) à la place des poses dessinées à la main du même nom
    if (typeof POSES_MOCAP !== 'undefined') for (const k in POSES_MOCAP) if (POSES[k]) Object.assign(POSES[k], POSES_MOCAP[k]);
    // écrans ajoutés : masqués comme les autres par G.show
    const sh = G.show; G.show = function (id) { const r = sh.apply(this, arguments); for (const s of V2.screens) { const el = $(s); if (el) el.hidden = s !== id; } if (id === 'menu' && typeof Defi !== 'undefined') Defi.badge(); return r; };
    for (const M of this.mods()) { try { M.init(); } catch (e) { console.error('V2', e); } }
    try { Offhand.menu(this.panel('salle')); } catch (e) { console.error('V2 menu', e); }
  },
};
