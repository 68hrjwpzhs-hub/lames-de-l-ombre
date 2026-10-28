# atelier des décors, étape 2 : peinture, relief, texture de toile et étalonnage → tools/decors/hd/*.webp, puis src/decors_hd.js
# usage : python3 tools/decors_hd.py [décor ...]   (il faut numpy, opencv-python, Pillow)
import os, sys, base64, numpy as np, cv2
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); RAW = os.path.join(ROOT, 'tools', 'decors', 'raw'); HD = os.path.join(ROOT, 'tools', 'decors', 'hd')
# direction de la lumière principale (comme LIGHTING.from dans paint.js), teinte des ombres et des lumières
LOOK = {
  'loggia': dict(light=(.75, -.45), sh=(40, 22, 48), hi=(255, 196, 140), relief=.16),
  'eglise': dict(light=(0, -1), sh=(14, 10, 40), hi=(190, 200, 255), relief=.14),
  'salle': dict(light=(-.35, -.94), sh=(44, 28, 20), hi=(255, 240, 214), relief=.14),
  'cloitre': dict(light=(-.6, -.8), sh=(36, 38, 64), hi=(255, 248, 226), relief=.16),
  'nuit': dict(light=(.6, -.8), sh=(10, 14, 40), hi=(200, 210, 255), relief=.12),
  'auberge': dict(light=(0, .2), sh=(30, 14, 8), hi=(255, 170, 90), relief=.16),
  'navire': dict(light=(.7, -.4), sh=(40, 24, 50), hi=(255, 200, 140), relief=.14),
  'bastion': dict(light=(-.7, -.6), sh=(24, 28, 44), hi=(255, 232, 205), relief=.16),
}
def kuwahara(img, r=4):
    # filtre de Kuwahara : chaque pixel prend la couleur du quart de voisinage le plus uniforme (effet d'empâtement)
    f = img.astype(np.float32) / 255; g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255; k = (r + 1, r + 1)
    m = cv2.boxFilter(f, -1, k, normalize=True, borderType=cv2.BORDER_REFLECT); mg = cv2.boxFilter(g, -1, k, borderType=cv2.BORDER_REFLECT); v = cv2.boxFilter(g * g, -1, k, borderType=cv2.BORDER_REFLECT) - mg * mg
    best = None; bv = None; h = r // 2 + 0
    for dy, dx in ((-h, -h), (-h, h), (h, -h), (h, h)):
        M = np.roll(m, (dy, dx), (0, 1)); V = np.roll(v, (dy, dx), (0, 1))
        if best is None: best, bv = M.copy(), V.copy()
        else: sel = V < bv; best[sel] = M[sel]; bv = np.minimum(bv, V)
    return best
def strokes(h, w, seed):
    # touches de pinceau : bruit étiré dans quelques directions, comme des coups de brosse
    R = np.random.default_rng(seed); out = np.zeros((h, w), np.float32)
    for ang in (20, 65, 110, 155):
        n = R.standard_normal((h // 2, w // 2)).astype(np.float32); L = 17
        k = np.zeros((L, L), np.float32); c = L // 2; a = np.deg2rad(ang)
        for i in range(-c, c + 1): k[int(round(c + i * np.sin(a))), int(round(c + i * np.cos(a)))] = 1
        k /= k.sum(); s = cv2.filter2D(n, -1, k); s = cv2.resize(s, (w, h), interpolation=cv2.INTER_CUBIC)
        m = cv2.GaussianBlur(R.random((h // 64, w // 64)).astype(np.float32), (0, 0), 1); m = cv2.resize(m, (w, h)) ; m = (m > .5).astype(np.float32); m = cv2.GaussianBlur(m, (0, 0), 25)
        out += s * m
    return out / (np.abs(out).std() * 3 + 1e-6)
def canvas_weave(h, w, seed):
    R = np.random.default_rng(seed); y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    weave = .5 * np.sin(x * 2.1) * np.sin(y * 2.3) + .5 * np.sin((x + y) * .9)
    fib = cv2.GaussianBlur(R.standard_normal((h, w)).astype(np.float32), (0, 0), .8)
    return (weave * .5 + fib * .5) / 2.5
def process(name):
    L = LOOK.get(name, LOOK['salle']); img = cv2.imread(os.path.join(RAW, name + '.png'), cv2.IMREAD_COLOR); h, w = img.shape[:2]
    f = img.astype(np.float32) / 255
    # 1. peinture : aplats fondus (filtre qui garde les contours) + empâtement léger, mêlés à l'original pour garder les détails
    ep = cv2.edgePreservingFilter(img, flags=cv2.RECURS_FILTER, sigma_s=36, sigma_r=.28).astype(np.float32) / 255
    oil = kuwahara(img, 6)
    p = f * .45 + ep * .3 + oil * .25
    # 2. relief : la luminance sert de hauteur ; ombrage selon la lumière du lieu (pierres, poutres, pavés prennent du volume)
    lum = cv2.cvtColor((p * 255).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    hgt = cv2.GaussianBlur(lum, (0, 0), 1.6); gx = cv2.Sobel(hgt, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(hgt, cv2.CV_32F, 0, 1, ksize=3)
    nx, ny, nz = -gx * 4, -gy * 4, np.ones_like(gx); nn = np.sqrt(nx * nx + ny * ny + nz * nz); lx, ly = L['light']; lz = .7; ln = (lx * lx + ly * ly + lz * lz) ** .5
    shade = (nx * lx / ln + ny * ly / ln + nz * lz / ln) / nn - lz / ln
    p = np.clip(p * (1 + shade[..., None] * L['relief'] * 1.8), 0, 1)
    # 3. contraste local doux (détails des matières)
    lab = cv2.cvtColor((p * 255).astype(np.uint8), cv2.COLOR_BGR2LAB); lab[..., 0] = cv2.createCLAHE(clipLimit=1.6, tileGridSize=(12, 12)).apply(lab[..., 0])
    p = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR).astype(np.float32) / 255 * .55 + p * .45
    # 4. touches de pinceau et grain de toile
    st = strokes(h, w, hash(name) % 1000); cw = canvas_weave(h, w, 7)
    p = np.clip(p * (1 + st[..., None] * .045 + cw[..., None] * .035), 0, 1)
    # 5. étalonnage : ombres teintées, lumières réchauffées ou refroidies selon le lieu
    lum = cv2.cvtColor((p * 255).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)[..., None] / 255
    shc = np.array(L['sh'][::-1], np.float32) / 255; hic = np.array(L['hi'][::-1], np.float32) / 255
    p = p + (shc - p) * (1 - lum) ** 3 * .22 + (hic - p) * lum ** 3 * .1
    # 6. netteté finale légère
    bl = cv2.GaussianBlur(p, (0, 0), 1.2); p = np.clip(p + (p - bl) * .35, 0, 1)
    out = (p * 255).astype(np.uint8); os.makedirs(HD, exist_ok=True)
    path = os.path.join(HD, name + '.webp'); cv2.imwrite(path, out, [cv2.IMWRITE_WEBP_QUALITY, 80]); return path
names = sys.argv[1:] or sorted(n[:-4] for n in os.listdir(RAW) if n.endswith('.png'))
for n in names: print(n, os.path.getsize(process(n)) // 1024, 'Ko')
# fichier du jeu : les images en base64, décodées seulement quand le décor sert
allhd = sorted(n[:-5] for n in os.listdir(HD) if n.endswith('.webp'))
js = '// décors haute définition (générés par tools/decors_hd.py : ne pas modifier à la main)\nconst DECOR_HD = {\n' + ',\n'.join(f"  {n}: 'data:image/webp;base64,{base64.b64encode(open(os.path.join(HD, n + '.webp'), 'rb').read()).decode()}'" for n in allhd) + '\n};\n'
open(os.path.join(ROOT, 'src', 'decors_hd.js'), 'w').write(js); print('src/decors_hd.js', len(js) // 1024, 'Ko')
