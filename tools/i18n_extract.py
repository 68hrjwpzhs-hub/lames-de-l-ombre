# extrait les textes français du jeu (littéraux de chaîne et textes du HTML) → tools/i18n_fr.json
import re, json, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
order = open(os.path.join(ROOT, 'build.sh')).read()
files = re.findall(r'src/[a-z0-9_]+\.(?:js|html)', order)
FR = re.compile(r"[A-Za-zÀ-ÿ]{2,}")
SKIP = re.compile(r"^(#|\.|rgba?\(|[a-z]+:\/\/)|var\(--|=>|^\s*$|^[a-z]+[A-Z][A-Za-z]*$|^[a-z_]+$|^[\w-]+\.(png|js|json)$|font|px\b|^(source-over|lighter|round|butt|center|left|right|middle|bold|italic)\b")
out, seen = [], set()
def add(t, f):
    t = t.strip()
    if not t or t in seen or not FR.search(t) or SKIP.search(t): return
    if re.fullmatch(r"[a-z][a-zA-Z0-9]*", t): return   # identifiants
    if re.fullmatch(r"[\w\- ]+", t) and ' ' not in t and t.islower(): return
    seen.add(t); out.append({'fr': t, 'file': f})
for f in [x for x in files if 'lang_en' not in x]:
    s = open(os.path.join(ROOT, f), encoding='utf8').read()
    if f.endswith('.html'):
        body = s[s.find('<body'):] if '<body' in s else s
        for m in re.finditer(r'>([^<>]+)<', body): add(re.sub(r'\s+', ' ', m.group(1)), f)
        for m in re.finditer(r'(?:title|aria-label|placeholder)="([^"]+)"', body): add(m.group(1), f)
        continue
    for m in re.finditer(r"'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`", s):
        t = m.group(1) if m.group(1) is not None else m.group(2)
        t = t.replace("\\'", "'")
        if '<' in t and '>' in t:   # morceaux de HTML : on garde les textes entre balises
            for mm in re.finditer(r'>([^<>]+)<', t): add(mm.group(1), f)
            continue
        add(t, f)
json.dump(out, open(os.path.join(ROOT, 'tools', 'i18n_fr.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=0)
print(len(out), sum(len(x['fr'].split()) for x in out))
