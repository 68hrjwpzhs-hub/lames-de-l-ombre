# contrôle visuel : compare tests/out/visual/*.png aux références tests/baseline/*.png
# --referencer : enregistre les captures actuelles comme nouvelles références
import os, sys, shutil, numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = os.path.join(ROOT, 'tests', 'out', 'visual'); REF = os.path.join(ROOT, 'tests', 'baseline')
os.makedirs(REF, exist_ok=True); bad = 0
for fn in sorted(os.listdir(OUT)):
    if not fn.endswith('.png'): continue
    a, r = os.path.join(OUT, fn), os.path.join(REF, fn)
    if '--referencer' in sys.argv or not os.path.exists(r): shutil.copy(a, r); print('référence', fn); continue
    A = np.asarray(Image.open(a).convert('RGB'), np.int16); B = np.asarray(Image.open(r).convert('RGB'), np.int16)
    if A.shape != B.shape: print('TAILLE DIFFÉRENTE', fn); bad += 1; continue
    d = np.abs(A - B).max(axis=2); changed = float((d > 40).mean()) * 100   # pixels nettement différents (le grain du film reste sous le seuil)
    ok = changed < 2.5; bad += not ok; print(('ok      ' if ok else 'CHANGÉ  ') + f'{fn} : {changed:.2f} % de pixels différents')
    if not ok: Image.fromarray(((d > 40) * 255).astype(np.uint8)).save(os.path.join(OUT, fn.replace('.png', '_diff.png')))
print('contrôle visuel :', 'aucun écart' if not bad else f'{bad} écart(s) à regarder'); sys.exit(1 if bad else 0)
