const { open } = require('./lib'); const fs = require('fs');
(async () => {
  for (const [tag, old] of [['avant', true], ['apres', false]]) {
    const { b, pg, errs } = await open(); await pg.setViewportSize({ width: 960, height: 540 });
    await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
    if (old) await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/oldfig.js', 'utf8') });
    await pg.evaluate(() => { G.frame = () => {}; document.querySelectorAll('.screen').forEach(s => s.hidden = true); });
    const snap = async (n, fn) => { await pg.evaluate(fn); await pg.evaluate(() => G.render(0)); await pg.screenshot({ path: `out/ba_${n}_${tag}.png` }); };
    await snap('salle', () => { T.setup(240); G.venue = 'salle'; G.e.look = LOOKS.duelliste; G.p.intent.guard = true; T.stepN(40); });
    await snap('eglise', () => { T.setup(285); G.venue = 'eglise'; G.e.look = LOOKS.maitre; G.p.intent.act = 'fente'; T.stepN(36); });
    console.log(tag, errs); await b.close();
  }
  require('child_process').execSync(`python3 -c "
from PIL import Image, ImageDraw, ImageFont
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',26)
ims=[[Image.open('out/ba_%s_%s.png'%(s,t)) for t in ('avant','apres')] for s in ('salle','eglise')]
W,H=ims[0][0].size; o=Image.new('RGB',(W*2+10,H*2+10),(20,16,20))
for r,row in enumerate(ims):
  for c,im in enumerate(row): o.paste(im,(c*(W+10),r*(H+10))); ImageDraw.Draw(o).text((c*(W+10)+18,r*(H+10)+H-44),('AVANT','APRÈS')[c],fill=(255,230,170),font=f)
o.save('/mnt/user-data/outputs/contre-temps-personnages-avant-apres.png')"`);
})();
