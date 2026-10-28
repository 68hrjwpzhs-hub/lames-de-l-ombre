const { open } = require('./lib'); const fs = require('fs');
const row = async (file, setup, label, frames, every) => {
  const { b, pg } = await open({ file }); await pg.setViewportSize({ width: 960, height: 540 });
  if (file.includes('index')) await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const url = await pg.evaluate(([setup, label, frames, every]) => {
    G.frame = () => {}; document.querySelectorAll('.screen').forEach(s => s.hidden = true); G.silent = true;
    const cw = 300, ch = 210, S = document.createElement('canvas'); S.width = cw * frames; S.height = ch; const sg = S.getContext('2d');
    const ctl = (new Function('return ' + setup))(); let f = 0;
    for (let c = 0; c < frames; c++) {
      while (f < c * every) { ctl.tick && ctl.tick(f); G.hitStop = 0; G.slow = 0; G.slowT = 0; G.step(1 / 120); f++; }
      G.render(0); const sc = G.scale, cx = (G.p.x + G.e.x) / 2;
      sg.drawImage(G.cv, (cx - 250) * sc, (GROUND - 290) * sc, 500 * sc, 350 * sc, c * cw, 0, cw, ch);
      sg.fillStyle = 'rgba(0,0,0,.6)'; sg.fillRect(c * cw, 0, cw, 20); sg.fillStyle = '#fff'; sg.font = '13px sans-serif'; sg.fillText(`${label} · ${(c * every / 120).toFixed(2)} s`, c * cw + 6, 14);
    }
    return S.toDataURL();
  }, [setup, label, frames, every]);
  await b.close(); return Buffer.from(url.split(',')[1], 'base64');
};
(async () => {
  const V1 = '/home/claude/ct2d/v1.html', V2 = '/home/claude/ct2d/index.html';
  const v1setup = d => `(() => { G.level='duelliste'; G.startMatch(); G.state='fight'; G.banner=null; G.ai.think=()=>{}; Input.apply=()=>{}; G.p.x=300; G.e.x=300+${d}; return { tick(f){ if(f===2) G.p.intent.attack=true; } }; })()`;
  const v1heavy = `(() => { G.level='duelliste'; G.startMatch(); G.state='fight'; G.banner=null; G.ai.think=()=>{}; Input.apply=()=>{}; G.p.x=300; G.e.x=470; return { tick(f){ if(f===2) G.p.intent.heavy=true; } }; })()`;
  const v2 = (d, act, guard) => `(() => { T.setup(${d}); G.e.look = LOOKS.duelliste; ${guard ? `T.holdGuard(G.e,'${guard}');` : ''} return { tick(f){ if(f===2) G.p.intent.act='${act}'; } }; })()`;
  const v2parry = `(() => { T.setup(225); G.e.look = LOOKS.maitre; return { tick(f){ if(f===2) G.e.intent.act='jab'; if (G.e.state==='attack' && G.e.move.kind==='jab' && G.e.t >= G.e.move.wu - .06) { G.p.intent.guard=true; G.p.intent.gline='ext'; } } }; })()`;
  const rows = [
    await row(V1, v1setup(170), 'AVANT · estocade', 7, 8),
    await row(V1, v1heavy, 'AVANT · fente lourde', 7, 12),
    await row(V2, v2(330, 'fente'), 'APRÈS · fente', 7, 12),
    await row(V2, v2(230, 'degage', 'ext'), 'APRÈS · dégagement contre Terza', 7, 10),
    await row(V2, v2(230, 'circ', 'basse'), 'APRÈS · imbroccata contre Bassa', 7, 12),
    await row(V2, v2parry, 'APRÈS · parade parfaite → riposte', 7, 9),
  ];
  fs.writeFileSync(__dirname + '/out/rows.json', JSON.stringify(rows.map(r => r.toString('base64'))));
  const { execSync } = require('child_process');
  rows.forEach((r, i) => fs.writeFileSync(__dirname + `/out/row${i}.png`, r));
  execSync(`python3 -c "
from PIL import Image
ims=[Image.open('out/row%d.png'%i) for i in range(${rows.length})]
W=ims[0].width; H=sum(i.height for i in ims)+6*len(ims)
o=Image.new('RGB',(W,H),(20,16,20)); y=0
for im in ims: o.paste(im,(0,y)); y+=im.height+6
o.save('out/avant_apres.png'); o.resize((W//2,H//2)).save('out/avant_apres_small.png')"`);
  console.log('ok');
})();
