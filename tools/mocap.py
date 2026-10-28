# atelier des animations : d'une vidéo d'escrimeur filmé de profil aux poses du squelette 2D du jeu → src/poses_mocap.js
#
# 1) python3 tools/mocap.py video estocade.mp4 --nom jabA --images 12-18 [--gaucher]
#      repère les articulations image par image (MediaPipe, modèle « pose_landmarker » à télécharger une fois, voir --modele),
#      lisse le mouvement, et enregistre les repères dans tools/mocap/estocade.json
# 2) python3 tools/mocap.py poses
#      convertit tous les relevés en poses du jeu (angles des bras, du buste, position des pieds) → src/poses_mocap.js
#      le jeu remplace alors ses poses dessinées à la main par les poses captées du même nom (POSES.jabA, POSES.fenteA…)
#
# Conseils de tournage : téléphone posé à hauteur de hanche, escrimeur de profil, tout le corps dans le cadre, fond uni,
# 2 à 3 secondes par geste ; une image nette au moment clé (bras tendu, fente au plus bas).
import os, sys, json, math, argparse
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); MOC = os.path.join(ROOT, 'tools', 'mocap')
MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task'
# repères MediaPipe utilisés (numéros du modèle « pose »)
LM = dict(nose=0, lsh=11, rsh=12, lel=13, rel=14, lwr=15, rwr=16, lidx=19, ridx=20, lhip=23, rhip=24, lkn=25, rkn=26, lan=27, ran=28, lheel=29, rheel=30, lft=31, rft=32)
GROUND = 468; TORSO = 55.0  # du milieu des hanches au milieu des épaules, dans le squelette du jeu

def extract(video, model, gaucher=False):
    import cv2, mediapipe as mp
    from mediapipe.tasks import python as mpt
    from mediapipe.tasks.python import vision
    if not os.path.exists(model): sys.exit(f'Modèle introuvable : {model}\nTéléchargez-le une fois : {MODEL_URL}')
    opts = vision.PoseLandmarkerOptions(base_options=mpt.BaseOptions(model_asset_path=model), running_mode=vision.RunningMode.VIDEO, num_poses=1)
    det = vision.PoseLandmarker.create_from_options(opts); cap = cv2.VideoCapture(video); fps = cap.get(cv2.CAP_PROP_FPS) or 30; frames = []; i = 0
    while True:
        ok, img = cap.read()
        if not ok: break
        h, w = img.shape[:2]; r = det.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB)), int(i * 1000 / fps))
        if r.pose_landmarks: frames.append({k: [p.x * w, p.y * h, p.visibility] for k, idx in LM.items() for p in [r.pose_landmarks[0][idx]]})
        else: frames.append(None)
        i += 1
    return {'fps': fps, 'gaucher': gaucher, 'frames': frames}

def smooth(frames, a=.5):
    # lissage exponentiel aller-retour : enlève le tremblement de la détection sans retarder le geste
    keys = [k for k in LM]; out = [dict(f) if f else None for f in frames]
    for direction in (1, -1):
        prev = None; rng = range(len(out)) if direction > 0 else range(len(out) - 1, -1, -1)
        for i in rng:
            f = out[i]
            if not f: continue
            if prev:
                for k in keys: f[k] = [prev[k][0] + (f[k][0] - prev[k][0]) * a, prev[k][1] + (f[k][1] - prev[k][1]) * a, f[k][2]]
            prev = f
    return out

def ang(dx, dy, d):  # angle du jeu : 0° = vers l'adversaire, positif vers le haut (y de l'image vers le bas)
    return math.degrees(math.atan2(-dy, dx * d))

def to_pose(f, gaucher=False):
    """repères (pixels de l'image) → pose du jeu : px, py, torso, a1, a2, a3, b1, b2, ff, bf, fl, bl"""
    mid = lambda a, b: [(f[a][0] + f[b][0]) / 2, (f[a][1] + f[b][1]) / 2]
    hip, neck = mid('lhip', 'rhip'), mid('lsh', 'rsh')
    # sens : le nez (ou l'orteil avant) indique où regarde l'escrimeur
    d = 1 if f['nose'][0] >= neck[0] else -1
    s = TORSO / max(1e-6, math.hypot(neck[0] - hip[0], neck[1] - hip[1]))  # échelle image → unités du jeu
    arm, back = ('l', 'r') if gaucher else ('r', 'l')
    torso = math.degrees(math.atan2((neck[0] - hip[0]) * d, hip[1] - neck[1]))
    sh, el, wr = f[arm + 'sh'], f[arm + 'el'], f[arm + 'wr']; bsh, bel, bwr = f[back + 'sh'], f[back + 'el'], f[back + 'wr']
    a1 = ang(el[0] - sh[0], el[1] - sh[1], d); a2 = ang(wr[0] - el[0], wr[1] - el[1], d)
    idx = f[arm + 'idx']; a3 = ang(idx[0] - wr[0], idx[1] - wr[1], d) if math.hypot(idx[0] - wr[0], idx[1] - wr[1]) > 2 else a2 + 6  # la lame prolonge la main
    b1 = ang(bel[0] - bsh[0], bel[1] - bsh[1], d); b2 = ang(bwr[0] - bel[0], bwr[1] - bel[1], d)
    feet = sorted([f['lan'], f['ran']], key=lambda p: p[0] * d)  # pied arrière puis pied avant
    groundy = max(f['lan'][1], f['ran'][1], f['lheel'][1], f['rheel'][1])
    py = (groundy - hip[1]) * s + 8  # hauteur du bassin (repère du jeu) au-dessus du sol
    ff = (feet[1][0] - hip[0]) * d * s; bf = (feet[0][0] - hip[0]) * d * s
    fl = max(0, (groundy - feet[1][1]) * s); bl = max(0, (groundy - feet[0][1]) * s)
    r = lambda v: round(v, 1)
    return dict(px=0, py=r(py), torso=r(torso), a1=r(a1), a2=r(a2), a3=r(a3), b1=r(b1), b2=r(b2), ff=r(ff), bf=r(bf), fl=r(fl), bl=r(bl))

def cmd_video(a):
    os.makedirs(MOC, exist_ok=True); data = extract(a.video, a.modele, a.gaucher); data['frames'] = smooth(data['frames'])
    if a.images: lo, hi = map(int, a.images.split('-')); data['key'] = [lo, hi]
    data['nom'] = a.nom; out = os.path.join(MOC, os.path.splitext(os.path.basename(a.video))[0] + '.json'); json.dump(data, open(out, 'w'))
    print(out, len([f for f in data['frames'] if f]), 'images avec un escrimeur repéré')

def cmd_poses(a):
    poses = {}
    for fn in sorted(os.listdir(MOC)) if os.path.isdir(MOC) else []:
        if not fn.endswith('.json'): continue
        D = json.load(open(os.path.join(MOC, fn))); fr = [f for f in D['frames'] if f]
        if not fr or not D.get('nom'): continue
        lo, hi = D.get('key', [0, len(D['frames']) - 1]); seg = [f for f in D['frames'][lo:hi + 1] if f] or fr
        # la pose clé : la moyenne de la fenêtre choisie (images lo à hi)
        P = [to_pose(f, D.get('gaucher')) for f in seg]; poses[D['nom']] = {k: round(sum(p[k] for p in P) / len(P), 1) for k in P[0]}
    js = '// poses captées sur vidéo (générées par tools/mocap.py : ne pas modifier à la main)\nconst POSES_MOCAP = ' + json.dumps(poses, ensure_ascii=False) + ';\n'
    open(os.path.join(ROOT, 'src', 'poses_mocap.js'), 'w').write(js); print('src/poses_mocap.js :', ', '.join(poses) or 'aucune pose (rien dans tools/mocap/)')

if __name__ == '__main__':
    p = argparse.ArgumentParser(description='Vidéo d\'escrime → poses du jeu'); sp = p.add_subparsers(dest='cmd', required=True)
    v = sp.add_parser('video'); v.add_argument('video'); v.add_argument('--nom', required=True, help='nom de la pose du jeu remplacée (ex. jabA, fenteA, g_ext)'); v.add_argument('--images', help='fenêtre de la pose clé, ex. 12-18'); v.add_argument('--gaucher', action='store_true'); v.add_argument('--modele', default=os.path.join(MOC, 'pose_landmarker_full.task'))
    sp.add_parser('poses'); a = p.parse_args(); {'video': cmd_video, 'poses': cmd_poses}[a.cmd](a)
