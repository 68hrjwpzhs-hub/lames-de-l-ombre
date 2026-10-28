// atelier des animations : aller-retour squelette du jeu → repères « vidéo » → tools/mocap.py → poses (vérifie la conversion)
const { open } = require('./lib'); const fs = require('fs'); const { execFileSync } = require('child_process');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(600);
  const data = await pg.evaluate(() => {
    const out = []; const names = ['g_ext', 'jabA', 'fenteA', 'bassaA', 'fenteC', 'esqVolte'];
    for (const n of names) for (const dir of [1, -1]) {
      const f = new Fighter(false, LOOKS.duelliste); f.reset(480); f.dir = dir; const P = normPose(Object.assign({}, POSES[n])); f.pose = P; f.feet = null; const j = f.joints(P, false);
      const pt = (q, v = 1) => [q[0] * 1.7 + 30, q[1] * 1.7 - 200, v]; // une « image » à une autre échelle, décalée
      const mid = (a, c) => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
      const hand = [j.wr[0] + (j.tip[0] - j.wr[0]) * .08, j.wr[1] + (j.tip[1] - j.wr[1]) * .08];
      const fr = { nose: pt([j.head[0] + dir * 8, j.head[1]]), rsh: pt(j.sh), lsh: pt(j.bsh), rel: pt(j.el), lel: pt(j.bel), rwr: pt(j.wr), lwr: pt(j.bwr), ridx: pt(hand), lidx: pt(j.bwr),
        rhip: pt(j.fl.hip), lhip: pt(j.bl.hip), rkn: pt(j.fl.knee), lkn: pt(j.bl.knee), ran: pt(j.fl.foot), lan: pt(j.bl.foot), rheel: pt(j.fl.foot), lheel: pt(j.bl.foot), rft: pt(j.fl.foot), lft: pt(j.bl.foot) };
      out.push({ n, dir, pose: P, frame: fr }); }
    return out;
  });
  fs.writeFileSync('/tmp/claude-0/rt.json', JSON.stringify(data));
  const py = `
import json,sys; sys.path.insert(0,'tools'); import mocap
D=json.load(open('/tmp/claude-0/rt.json')); worst={}
for x in D:
  p=mocap.to_pose(x['frame']); P=x['pose']
  for k in ['torso','a1','a2','b1','b2','py','ff','bf']:
    ref=P[k]-P['px'] if k in ('ff','bf') else P[k]
    e=abs(((p[k]-ref)+180)%360-180) if k in ('torso','a1','a2','b1','b2') else abs(p[k]-ref); worst[k]=max(worst.get(k,0),round(e,1))
print(json.dumps(worst))`;
  const w = JSON.parse(execFileSync('python3', ['-c', py], { cwd: __dirname + '/..' }).toString());
  const okA = ['a1', 'a2', 'b1', 'b2'].every(k => w[k] <= 3), okT = w.torso <= 12, okL = w.py <= 6 && w.ff <= 8 && w.bf <= 8;
  console.log(JSON.stringify(w)); console.log((okA ? 'PASS' : 'FAIL') + ' bras : écart ≤ 3°'); console.log((okT ? 'PASS' : 'FAIL') + ' buste : écart ≤ 12°'); console.log((okL ? 'PASS' : 'FAIL') + ' bassin et pieds : écart ≤ 8'); console.log(errs.length ? errs : 'aucune erreur');
  console.log(`${[okA, okT, okL, !errs.length].filter(Boolean).length}/4 tests réussis`); await b.close();
})();
