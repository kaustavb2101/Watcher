const fs=require('fs');
const lines=fs.readFileSync('data/nso-ses-spb0802-66-clean.csv','utf8').split('\n');

function parseCSV(line) {
  const r = []; let c = '', q = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { q = !q; }
    else if (line[i] === ',' && !q) { r.push(c); c = ''; }
    else { c += line[i]; }
  }
  r.push(c); return r;
}

const sets = new Set();
for(let i=1;i<lines.length;i++){
  const l=lines[i]?.trim(); if(!l)continue;
  const p=parseCSV(l);
  if(p.length<9) continue;
  if (p[0]==='2566' && p[2]==='รายได้ทั้งสิ้นต่อเดือน' && p[3]==='รายได้ทั้งสิ้นต่อเดือน' && p[4]==='รายได้ทั้งสิ้นต่อเดือน') {
     sets.add(p[5] + ' || ' + p[6]);
  }
}
console.log('Unique class pairings:\n' + Array.from(sets).join('\n'));
