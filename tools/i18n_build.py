# assemble la traduction anglaise : tools/en_dict.json (texte français → anglais) → src/lang_en.js
# Après avoir ajouté des textes au jeu : python3 tools/i18n_extract.py, puis python3 tools/i18n_build.py --manquants pour la liste à traduire.
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, 'tools', 'en_dict.json'), encoding='utf8'))
exact, tpl = {}, []
for k, en in D['dict'].items():
    if re.search(r'\{\d+\}', k):
        if re.fullmatch(r'[\s{}\d·:,()./–-]*', re.sub(r'\{\d+\}', '', k)): continue
        tpl.append([k, en])
    else: exact[k] = en
out = 'const LANG_EN = ' + json.dumps({'exact': exact, 'tpl': tpl, 'gloss': D['gloss']}, ensure_ascii=False, separators=(',', ':')) + ';\n'
open(os.path.join(ROOT, 'src', 'lang_en.js'), 'w', encoding='utf8').write('// textes anglais (généré par tools/i18n_build.py depuis tools/en_dict.json : ne pas modifier à la main)\n' + out)
print('exact', len(exact), 'tpl', len(tpl), 'gloss', len(D['gloss']))
if '--manquants' in sys.argv:
    fr = json.load(open(os.path.join(ROOT, 'tools', 'i18n_fr.json'), encoding='utf8'))
    for x in fr:
        n = [0]
        def rep(m): n[0] += 1; return '{%d}' % n[0]
        k = re.sub(r'\$\{(?:[^{}]|\{[^{}]*\})*\}', rep, x['fr'])
        if k not in D['dict']: print(x['file'], '|', k[:120])
