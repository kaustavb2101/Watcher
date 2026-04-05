const fs = require('fs');
const raw = fs.readFileSync('data/nso-ses-spb0806-clean.csv', 'utf8');
const lines = raw.split('\n');

const T = {
  'กรุงเทพมหานคร': 'Bangkok', 'สมุทรปราการ': 'Samut Prakan',
  'นนทบุรี': 'Nonthaburi', 'ปทุมธานี': 'Pathum Thani',
  'สมุทรสาคร': 'Samut Sakhon', 'สมุทรสงคราม': 'Samut Songkhram',
  'นครปฐม': 'Nakhon Pathom', 'พระนครศรีอยุธยา': 'Phra Nakhon Si Ayutthaya',
  'อ่างทอง': 'Ang Thong', 'ลพบุรี': 'Lop Buri', 'ชัยนาท': 'Chai Nat',
  'สระบุรี': 'Saraburi', 'สิงห์บุรี': 'Sing Buri', 'สุพรรณบุรี': 'Suphan Buri',
  'นครสวรรค์': 'Nakhon Sawan', 'อุทัยธานี': 'Uthai Thani',
  'กำแพงเพชร': 'Kamphaeng Phet', 'พิจิตร': 'Phichit', 'พิษณุโลก': 'Phitsanulok',
  'สุโขทัย': 'Sukhothai', 'นครนายก': 'Nakhon Nayok', 'เพชรบูรณ์': 'Phetchabun',
  'เชียงใหม่': 'Chiang Mai', 'เชียงราย': 'Chiang Rai', 'ลำปาง': 'Lampang',
  'ลำพูน': 'Lamphun', 'น่าน': 'Nan', 'พะเยา': 'Phayao', 'แพร่': 'Phrae',
  'อุตรดิตถ์': 'Uttaradit', 'แม่ฮ่องสอน': 'Mae Hong Son',
  'นครราชสีมา': 'Nakhon Ratchasima', 'บุรีรัมย์': 'Buri Ram',
  'ชัยภูมิ': 'Chaiyaphum', 'ขอนแก่น': 'Khon Kaen', 'กาฬสินธุ์': 'Kalasin',
  'มหาสารคาม': 'Maha Sarakham', 'ร้อยเอ็ด': 'Roi Et', 'ยโสธร': 'Yasothon',
  'อำนาจเจริญ': 'Amnat Charoen', 'บึงกาฬ': 'Bueng Kan',
  'หนองบัวลำภู': 'Nong Bua Lam Phu', 'หนองคาย': 'Nong Khai', 'เลย': 'Loei',
  'อุดรธานี': 'Udon Thani', 'สกลนคร': 'Sakon Nakhon', 'นครพนม': 'Nakhon Phanom',
  'มุกดาหาร': 'Mukdahan', 'ศรีสะเกษ': 'Si Sa Ket', 'สุรินทร์': 'Surin',
  'อุบลราชธานี': 'Ubon Ratchathani', 'ชลบุรี': 'Chon Buri', 'ระยอง': 'Rayong',
  'ฉะเชิงเทรา': 'Chachoengsao', 'ปราจีนบุรี': 'Prachin Buri', 'สระแก้ว': 'Sa Kaeo',
  'จันทบุรี': 'Chanthaburi', 'ตราด': 'Trat', 'ราชบุรี': 'Ratchaburi',
  'กาญจนบุรี': 'Kanchanaburi', 'ประจวบคีรีขันธ์': 'Prachuap Khiri Khan',
  'เพชรบุรี': 'Phetchaburi', 'ตาก': 'Tak', 'สุราษฎร์ธานี': 'Surat Thani',
  'ภูเก็ต': 'Phuket', 'สงขลา': 'Songkhla', 'นครศรีธรรมราช': 'Nakhon Si Thammarat',
  'กระบี่': 'Krabi', 'พังงา': 'Phangnga', 'ระนอง': 'Ranong', 'ชุมพร': 'Chumphon',
  'ตรัง': 'Trang', 'พัทลุง': 'Phatthalung', 'สตูล': 'Satun',
  'ปัตตานี': 'Pattani', 'ยะลา': 'Yala', 'นราธิวาส': 'Narathiwat'
};

function parseCSV(line) {
  const r = []; let c = '', q = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { q = !q; }
    else if (line[i] === ',' && !q) { r.push(c); c = ''; }
    else { c += line[i]; }
  }
  r.push(c); return r;
}

const pData = {};
for (let i = 1; i < lines.length; i++) {
  const l = lines[i].trim();
  if (!l) continue;
  const p = parseCSV(l);
  if (p.length < 8) continue;
  const yr = p[0], prov = p[1], hhType = p[4], purpSrc = p[5], purpBor = p[6], valStr = p[7];
  if (yr !== '2566') continue;
  const v = parseFloat(valStr);
  if (isNaN(v) || v === 0) continue;
  const eng = T[prov];
  if (!eng) continue;
  if (!pData[eng]) pData[eng] = { hh: [], debt: [] };
  if (hhType === 'จำนวนครัวเรือนทั้งสิ้น' && purpSrc === 'จำนวนครัวเรือนทั้งสิ้น' && purpBor === 'จำนวนครัวเรือนทั้งสิ้น')
    pData[eng].hh.push(v);
  if (hhType === 'จำนวนหนี้สินเฉลี่ยต่อครัวเรือน' && purpSrc === 'จำนวนหนี้สินเฉลี่ยต่อครัวเรือน' && purpBor === 'จำนวนหนี้สินเฉลี่ยต่อครัวเรือน')
    pData[eng].debt.push(v);
}

const result = {};
for (const [prov, d] of Object.entries(pData)) {
  const pairs = Math.min(d.hh.length, d.debt.length);
  let tHH = 0, wD = 0;
  for (let i = 0; i < pairs; i++) { tHH += d.hh[i]; wD += d.hh[i] * d.debt[i]; }
  if (tHH > 0) result[prov] = { debt: Math.round(wD / tHH), hh: Math.round(tHH), n: pairs };
}

const out = Object.entries(result).sort(([a], [b]) => a.localeCompare(b));
for (const [p, v] of out)
  console.log(p + ': ' + v.debt.toLocaleString() + ' THB (' + String(v.n) + ' classes, ' + v.hh.toLocaleString() + ' HH)');
console.log('\nTotal provinces: ' + out.length);

const jsonOut = Object.fromEntries(out.map(([p, v]) => [p, v.debt]));
fs.writeFileSync('data/nso-ses-debt-2566.json', JSON.stringify(jsonOut, null, 2));
console.log('Saved data/nso-ses-debt-2566.json');
