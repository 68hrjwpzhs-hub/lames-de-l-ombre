// =============================== 3.0 · sprints 25 et 27 : moteur WebGL (composition et lumière) ===============================
// Le monde est toujours dessiné par le canevas 2D (mêmes personnages, même style). Avant le HUD, l'image du monde passe à la carte
// graphique : un canevas WebGL placé dessous l'affiche avec la lumière des torches (relief tiré de l'image elle-même), le halo des
// lames et des étincelles, les reflets sur les pavés mouillés, l'étalonnage du lieu, le vignettage et le grain.
// Le canevas 2D, devenu transparent, ne garde que le HUD par-dessus. Si WebGL manque ou si l'iPhone ralentit, retour au rendu 2D.
const GL_GRADE = { // étalonnage par lieu : gain RVB, contraste, saturation, lumière ambiante (relief)
  loggia: { gain: [1.04, .98, .92], con: 1.06, sat: 1.05, amb: .35 }, eglise: { gain: [.94, .96, 1.06], con: 1.08, sat: .95, amb: .45 },
  salle: { gain: [1.03, 1, .95], con: 1.04, sat: 1.02, amb: .25 }, cloitre: { gain: [1, 1, 1], con: 1.05, sat: 1.04, amb: .25 },
  nuit: { gain: [.92, .96, 1.08], con: 1.1, sat: .95, amb: .55 }, auberge: { gain: [1.06, .98, .9], con: 1.06, sat: 1.04, amb: .5 },
  navire: { gain: [1.05, .99, .94], con: 1.06, sat: 1.06, amb: .3 }, bastion: { gain: [.96, .98, 1.04], con: 1.07, sat: .92, amb: .35 },
};
const GL = {
  on: false, ok: false, cv: null, gl: null, P: {}, tex: null, fb: [], t0: performance.now(), slow: 0, frames: 0, lastCam: null,
  wanted() { return store.get('ct2d.webgl', true) !== false; },
  set(v) { store.set('ct2d.webgl', !!v); this.slow = 0; if (v && !this.ok) this.setup(); this.on = !!v && this.ok; this.apply(); this.refreshUI(); },
  apply() { if (this.cv) this.cv.style.display = this.on ? 'block' : 'none'; const c = $('c'); if (c) c.style.background = this.on ? 'transparent' : ''; if (this.on && $('vig')) $('vig').hidden = true; },
  sh(type, src) { const g = this.gl, s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s); if (!g.getShaderParameter(s, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(s)); return s; },
  prog(fs) { const g = this.gl, p = g.createProgram(); g.attachShader(p, this.sh(g.VERTEX_SHADER, 'attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}')); g.attachShader(p, this.sh(g.FRAGMENT_SHADER, 'precision mediump float;varying vec2 v;' + fs)); g.bindAttribLocation(p, 0, 'a'); g.linkProgram(p); if (!g.getProgramParameter(p, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(p)); const u = {}; const n = g.getProgramParameter(p, g.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const a = g.getActiveUniform(p, i), nm = a.name.replace(/\[0\]$/, ''); u[nm] = g.getUniformLocation(p, a.name); } return { p, u }; },
  texture() { const g = this.gl, t = g.createTexture(); g.bindTexture(g.TEXTURE_2D, t); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE); return t; },
  target(w, h) { const g = this.gl, t = this.texture(); g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, w, h, 0, g.RGBA, g.UNSIGNED_BYTE, null); const f = g.createFramebuffer(); g.bindFramebuffer(g.FRAMEBUFFER, f); g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, t, 0); g.bindFramebuffer(g.FRAMEBUFFER, null); return { t, f, w, h }; },
  setup() {
    try {
      const c = document.createElement('canvas'); c.id = 'gl'; c.setAttribute('aria-hidden', 'true'); c.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:0;display:none;pointer-events:none';
      const g = c.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' }); if (!g) return false;
      $('stage').insertBefore(c, $('c')); this.cv = c; this.gl = g;
      const vb = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, vb); g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW); g.enableVertexAttribArray(0); g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0);
      // 1. partie lumineuse, réduite au quart (halo)
      this.P.bright = this.prog('uniform sampler2D t;uniform vec2 px;void main(){vec3 c=vec3(0.);for(int i=0;i<4;i++){vec2 o=vec2(mod(float(i),2.),floor(float(i)/2.))-.5;c+=texture2D(t,v+o*px).rgb;}c*=.25;float l=dot(c,vec3(.299,.587,.114));gl_FragColor=vec4(c*smoothstep(.62,.95,l),1.);}');
      // 2. flou séparable (9 taps)
      this.P.blur = this.prog('uniform sampler2D t;uniform vec2 d;void main(){vec3 c=texture2D(t,v).rgb*.227;c+=(texture2D(t,v+d*1.385).rgb+texture2D(t,v-d*1.385).rgb)*.316;c+=(texture2D(t,v+d*3.231).rgb+texture2D(t,v-d*3.231).rgb)*.07;gl_FragColor=vec4(c,1.);}');
      // 3. composition finale : relief + lumières, reflets mouillés, halo, étalonnage, vignettage, grain
      this.P.fin = this.prog(`uniform sampler2D t;uniform sampler2D b;uniform vec2 px;uniform vec2 res;uniform float time;uniform vec4 L[8];uniform vec3 LC[8];uniform int nL;
uniform float amb;uniform vec3 gain;uniform float con;uniform float sat;uniform float bloom;uniform float rain;uniform float ground;uniform float vig;uniform float relief;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float lum(vec2 q){return dot(texture2D(t,q).rgb,vec3(.299,.587,.114));}
void main(){vec2 q=v;vec3 c=texture2D(t,q).rgb;
 vec2 sp=vec2(q.x,1.-q.y)*res;
 if(rain>0.&&sp.y>ground){float dy=sp.y-ground;vec2 m=vec2(q.x+sin(sp.y*.35+time*5.)*.0016*rain,1.-(ground-dy*.92)/res.y);if(m.y<1.&&m.y>0.){vec3 r=texture2D(t,m).rgb;float f=rain*.42*exp(-dy/(res.y*.16));c=mix(c,max(c,r*.9),f);}}
 if(relief>0.){float lx=lum(q+vec2(px.x,0.))-lum(q-vec2(px.x,0.)),ly=lum(q-vec2(0.,px.y))-lum(q+vec2(0.,px.y));vec3 n=normalize(vec3(-lx*6.,-ly*6.,1.));vec3 acc=vec3(0.);
  for(int i=0;i<8;i++){if(i>=nL)break;vec2 d=L[i].xy-sp;float dist=length(d);float fall=max(0.,1.-dist/L[i].z);fall*=fall;vec3 ld=normalize(vec3(d/max(dist,1.),.55));float lam=max(dot(n,ld),0.);acc+=LC[i]*L[i].w*fall*(.55+.9*lam);}
  c+=c*acc*relief;}
 c+=texture2D(b,q).rgb*bloom;
 c*=gain;c=(c-.5)*con+.5;float g=dot(c,vec3(.299,.587,.114));c=mix(vec3(g),c,sat);
 vec2 cq=q-.5;c*=1.-vig*smoothstep(.32,.85,length(cq*vec2(1.,.82))*1.25);
 c+=(h(sp+fract(time*7.)*91.)-.5)*.035;
 gl_FragColor=vec4(clamp(c,0.,1.),1.);}`);
      this.tex = this.texture(); this.ok = true; return true;
    } catch (e) { console.warn('WebGL indisponible', e && e.message); this.ok = false; if (this.cv) this.cv.remove(); this.cv = null; return false; }
  },
  size(w, h) { if (this.cv.width === w && this.cv.height === h && this.fb.length) return; this.cv.width = w; this.cv.height = h; this.cv.style.width = $('c').style.width; this.cv.style.height = $('c').style.height; const bw = Math.max(1, w >> 2), bh = Math.max(1, h >> 2); this.fb = [this.target(bw, bh), this.target(bw, bh)]; },
  draw(P, fb, w, h) { const g = this.gl; g.bindFramebuffer(g.FRAMEBUFFER, fb ? fb.f : null); g.viewport(0, 0, w, h); g.useProgram(P.p); return P.u; },
  // lumières du lieu (torches, cierges, lanternes, soleil couchant) en coordonnées écran, avec leur vacillement
  lights(cam, sc, sx, sy) {
    const v = VENUES[G.venue], out = []; if (!v || !v.lights) return out; const t = G.time || 0;
    v.lights.forEach(([x, y, r, col], i) => { if (out.length >= 8) return; const m = /(\d+),\s*(\d+),\s*(\d+)/.exec(col) || [0, 255, 200, 140]; const f = .8 + .14 * Math.sin(t * 9 + i * 2.1) + .08 * Math.sin(t * 23 + i);
      out.push({ x: ((x - cam.x) * cam.s + W / 2 + sx) * sc, y: ((y - cam.y) * cam.s + H / 2 + sy) * sc, r: r * 4.2 * cam.s * sc, w: f, c: [m[1] / 255, m[2] / 255, m[3] / 255] }); });
    for (const s of G.sparks || []) { if (out.length >= 8) break; if (s.life > .12) out.push({ x: ((s.x - cam.x) * cam.s + W / 2 + sx) * sc, y: ((s.y - cam.y) * cam.s + H / 2 + sy) * sc, r: 70 * cam.s * sc, w: s.life * 2, c: [1, .85, .6] }); }
    return out;
  },
  // appelé par G.render une fois le monde dessiné, avant le HUD
  capture(cv, cam) {
    if (!this.on) return false; const g = this.gl, w = cv.width, h = cv.height, t0 = performance.now();
    this.size(w, h);
    g.activeTexture(g.TEXTURE0); g.bindTexture(g.TEXTURE_2D, this.tex); g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true); g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, cv); g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, false);
    const [A, B] = this.fb, calm = typeof A11y !== 'undefined' && A11y.opt.calm;
    let u = this.draw(this.P.bright, A, A.w, A.h); g.uniform1i(u.t, 0); g.uniform2f(u.px, 1 / w, 1 / h); g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
    for (let k = 0; k < 2; k++) { g.bindTexture(g.TEXTURE_2D, A.t); u = this.draw(this.P.blur, B, B.w, B.h); g.uniform1i(u.t, 0); g.uniform2f(u.d, 1 / B.w, 0); g.drawArrays(g.TRIANGLE_STRIP, 0, 4); g.bindTexture(g.TEXTURE_2D, B.t); u = this.draw(this.P.blur, A, A.w, A.h); g.uniform1i(u.t, 0); g.uniform2f(u.d, 0, 1 / A.h); g.drawArrays(g.TRIANGLE_STRIP, 0, 4); }
    u = this.draw(this.P.fin, null, w, h); g.activeTexture(g.TEXTURE0); g.bindTexture(g.TEXTURE_2D, this.tex); g.uniform1i(u.t, 0); g.activeTexture(g.TEXTURE1); g.bindTexture(g.TEXTURE_2D, A.t); g.uniform1i(u.b, 1); g.activeTexture(g.TEXTURE0);
    const Gd = GL_GRADE[G.venue] || GL_GRADE.salle, sc = G.scale, Ls = this.lights(cam, sc, G.shakeX || 0, G.shakeY || 0), L = new Float32Array(32), C = new Float32Array(24);
    Ls.forEach((l, i) => { L.set([l.x, l.y, l.r, l.w], i * 4); C.set(l.c, i * 3); });
    g.uniform2f(u.px, 1 / w, 1 / h); g.uniform2f(u.res, w, h); g.uniform1f(u.time, (performance.now() - this.t0) / 1000); g.uniform4fv(u.L, L); g.uniform3fv(u.LC, C); g.uniform1i(u.nL, Ls.length);
    g.uniform1f(u.amb, Gd.amb); g.uniform3fv(u.gain, Gd.gain); g.uniform1f(u.con, Gd.con); g.uniform1f(u.sat, Gd.sat); g.uniform1f(u.bloom, calm ? .35 : .75); g.uniform1f(u.relief, Gd.amb);
    g.uniform1f(u.rain, G.weather === 'rain' && G.state !== 'menu' ? 1 : 0); g.uniform1f(u.ground, ((GROUND - cam.y) * cam.s + H / 2 + (G.shakeY || 0)) * sc); g.uniform1f(u.vig, .55);
    g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
    this.cost = performance.now() - t0; this.frames++;
    return true;
  },
  // garde-fou : si l'image dépasse 24 ms en moyenne pendant 4 s de combat, on revient au rendu 2D (et on le dit)
  watch(dtMs) {
    if (!this.on || G.state !== 'fight') return; this.acc = (this.acc || 0) + dtMs; this.n = (this.n || 0) + 1;
    if (this.acc >= 4000) { const avg = this.acc / this.n; this.acc = 0; this.n = 0; if (avg > 24) { this.slow++; if (this.slow >= 2) { this.on = false; store.set('ct2d.webgl', false); this.apply(); this.refreshUI(); if (typeof toastMsg === 'function') toastMsg('Rendu WebGL coupé : l\'appareil ralentissait. Vous pouvez le rallumer dans les options.'); } } else this.slow = 0; }
  },
  init() {
    if (this.wanted()) { this.setup(); this.on = this.ok; } this.apply();
    const rs = G.resize; G.resize = function () { const r = rs.apply(this, arguments); if (GL.cv) { GL.cv.style.width = $('c').style.width; GL.cv.style.height = $('c').style.height; } return r; };
    const P = V2.panel('options'); if (P && !$('optGL')) { const row = document.createElement('div'); row.className = 'row'; row.style.alignItems = 'center'; row.innerHTML = '<span class="keys" style="min-width:110px">Moteur</span><div class="row"><button class="opt small" id="optGL">Rendu WebGL (lumière, halo, reflets)</button></div>'; const a = $('a11yOpts'); if (a) a.parentElement.after(row); else P.prepend(row); $('optGL').addEventListener('click', () => this.set(!this.on)); }
    this.refreshUI();
  },
  refreshUI() { const b = $('optGL'); if (b) { b.setAttribute('aria-pressed', !!this.on); b.disabled = !this.ok && !this.wanted() ? false : false; } },
};

// =============================== 3.0 · sprint 26 : décors haute définition (préparés par l'atelier Python) ===============================
// Chaque décor peint par le code est remplacé, s'il existe, par sa version retravaillée (tools/decors_hd.py) : empâtement, relief,
// touches de pinceau, grain de toile, étalonnage. L'image n'est décodée qu'au moment où le décor sert (mémoire de l'iPhone ménagée).
const DecorHD = {
  img: {}, loading: {},
  on() { return typeof DECOR_HD !== 'undefined' && store.get('ct2d.decorhd', true) !== false && !window.DECOR_HD_OFF; },
  get(k) {
    if (!this.on() || !DECOR_HD[k]) return null; const im = this.img[k]; if (im) return im;
    if (!this.loading[k]) { this.loading[k] = true; const i = new Image(); i.onload = () => { this.img[k] = i; delete BGS[k]; }; i.onerror = () => { this.loading[k] = 'erreur'; }; i.src = DECOR_HD[k]; }
    return null;
  },
  init() {
    for (const k of Object.keys(VENUES)) { const V = VENUES[k]; if (V.draw0) continue; V.draw0 = V.draw; V.draw = function (g) { const im = DecorHD.get(k); if (im) g.drawImage(im, 0, 0, W, H); else V.draw0(g); }; }
    if (this.on() && G.venue) this.get(G.venue); // le décor du menu tout de suite
    const P = V2.panel('options'), row = $('optGL') && $('optGL').parentElement; if (row && !$('optHD')) { const b = document.createElement('button'); b.className = 'opt small'; b.id = 'optHD'; b.textContent = 'Décors haute définition'; b.addEventListener('click', () => { store.set('ct2d.decorhd', !this.on()); for (const key in BGS) delete BGS[key]; b.setAttribute('aria-pressed', this.on()); }); row.appendChild(b); b.setAttribute('aria-pressed', this.on()); }
  },
};
