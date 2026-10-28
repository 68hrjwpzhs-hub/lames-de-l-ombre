# atelier des costumes : petites textures raccordables (brocart, sergé, cuir, laine, salissure) → src/textures.js
# Gris neutre (128) = aucun effet : le jeu les pose en « incrustation » sur les vêtements déjà peints.
import os, base64, io, numpy as np, cv2
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); N = 96
R = np.random.default_rng(1633)
def tile_noise(s, sigma):
    n = R.standard_normal((N, N)).astype(np.float32); big = np.tile(n, (3, 3)); b = cv2.GaussianBlur(big, (0, 0), sigma); b = b[N:2 * N, N:2 * N]
    return (b - b.mean()) / (b.std() + 1e-6) * s
def brocade():
    # damas : fleur à quatre pétales sur un treillis en losanges, motif raccordable, en léger relief
    y, x = np.mgrid[0:N, 0:N].astype(np.float32); m = np.zeros((N, N), np.float32)
    for cx, cy, sc in ((0, 0, 1), (N, 0, 1), (0, N, 1), (N, N, 1), (N / 2, N / 2, .8)):
        dx, dy = x - cx, y - cy; r = np.hypot(dx, dy); th = np.arctan2(dy, dx)
        petal = r < N * .22 * sc * (.55 + .45 * np.abs(np.cos(2 * th))); hole = r < N * .05 * sc
        m = np.maximum(m, (petal & ~hole).astype(np.float32))
    lat = (np.minimum(np.abs(((x + y) % (N / 2)) - N / 4), np.abs(((x - y) % (N / 2)) - N / 4)) < 1.1).astype(np.float32) * .6
    m = np.maximum(m, lat); m = cv2.GaussianBlur(m, (0, 0), .8)
    gy, gx = np.gradient(m); relief = (-gx - gy) * 1.6
    return m * .45 + relief + tile_noise(.05, .6)
def twill():
    y, x = np.mgrid[0:N, 0:N].astype(np.float32); return .22 * np.sin((x + y) * 2 * np.pi / 6) + tile_noise(.08, .7)
def leather():
    pts = R.random((40, 2)) * N; d = np.full((N, N), 1e9, np.float32); y, x = np.mgrid[0:N, 0:N].astype(np.float32)
    for px, py in pts:
        for ox in (-N, 0, N):
            for oy in (-N, 0, N): d = np.minimum(d, np.hypot(x - px - ox, y - py - oy))
    cr = np.exp(-d / 2.2); return -cr * .5 + tile_noise(.12, 1.5)
def wool():
    y, x = np.mgrid[0:N, 0:N].astype(np.float32); return .12 * np.sin(x * 2 * np.pi / 4) * np.sin(y * 2 * np.pi / 4) + tile_noise(.18, .9)
def dirt():
    return np.clip(tile_noise(1, 5) * .5 + tile_noise(.6, 1.6), -2, 2)
TEX = {'brocart': brocade(), 'serge': twill(), 'cuir': leather(), 'laine': wool(), 'salissure': dirt()}
out = []
for k, a in TEX.items():
    if k == 'salissure': img = np.clip(128 - np.maximum(a, 0) * 70, 0, 255)  # assombrit seulement
    else: img = np.clip(128 + a * 60, 0, 255)
    buf = io.BytesIO(); Image.fromarray(img.astype(np.uint8), 'L').convert('RGB').save(buf, 'PNG', optimize=True)
    out.append(f"  {k}: 'data:image/png;base64,{base64.b64encode(buf.getvalue()).decode()}'"); Image.fromarray(img.astype(np.uint8)).resize((N * 3, N * 3), Image.NEAREST).save(f'/tmp/claude-0/tex_{k}.png')
js = '// textures des costumes (générées par tools/textures.py : ne pas modifier à la main)\nconst TEXTURES = {\n' + ',\n'.join(out) + '\n};\n'
open(os.path.join(ROOT, 'src', 'textures.js'), 'w').write(js); print(len(js) // 1024, 'Ko')
