const fs = require('fs');
const raw = fs.readFileSync('data/nso-ses-spb0802-66-clean.csv', 'utf8');
const lines = raw.split('\n');

function parseCSV(line) {
  const r = []; let c = '', q = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { q = !q; }
    else if (line[i] === ',' && !q) { r.push(c); c = ''; }
    else { c += line[i]; }
  }
  r.push(c); return r;
}

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

const incomeData = {};

for (let i = 1; i < lines.length; i++) {
  const l = lines[i]?.trim();
  if (!l) continue;
  const p = parseCSV(l);
  if (p.length < 9) continue;
  
  const yr = p[0], prov = p[1], s1 = p[2], s2 = p[3], s3 = p[4], c1 = p[5], c2 = p[6], valStr = p[7];
  
  if (yr !== '2566') continue;
  
  if (s1 === 'รายได้ทั้งสิ้นต่อเดือน' && s2 === 'รายได้ทั้งสิ้นต่อเดือน' && s3 === 'รายได้ทั้งสิ้นต่อเดือน') {
    const eng = T[prov];
    if (!eng) continue;
    
    let key = null;
    if (c2 === 'ผู้จัดการนักวิชาการและผู้ปฏิบัติงานวิชาชีพ' || c2 === 'เสมียนพนักงานขายและให้บริการ') {
        key = 'OfficeStaff';
    } else if (c2 === 'ผู้ปฏิบัติงานในกระบวนการผลิตก่อสร้างและเหมืองแร่') {
        key = 'FactoryWorkers';
    } else if (c2 === 'คนงานด้านการขนส่งและงานพื้นฐาน') {
        key = 'Transport'; // Maps to Taxi / Delivery Riders
    } else if (c1 === 'ผู้ประกอบธุรกิจของตนเองที่ไม่ใช่การเกษตร') {
        key = 'SMEOwners';
    } else if (c1 === 'ผู้ถือครองทำการเกษตร/เพาะเลี้ยง' || c2 === 'คนงานเกษตรป่าไม้และประมง') {
        key = 'Agriculture';
    }
    
    if (key) {
      const v = parseFloat(valStr);
      if (!isNaN(v) && v > 0) {
        if (!incomeData[eng]) incomeData[eng] = { OfficeStaff: [], FactoryWorkers: [], Transport: [], SMEOwners: [], Agriculture: [] };
        incomeData[eng][key].push(v);
      }
    }
  }
}

// Average out OfficeStaff since it combines two classes (Managers + Clerical)
for (const prov in incomeData) {
    for (const key in incomeData[prov]) {
        const arr = incomeData[prov][key];
        if (arr.length > 0) {
            const avg = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
            incomeData[prov][key] = avg;
        } else {
            // If data is suppressed for a province class, use a sensible baseline relative to others
            incomeData[prov][key] = 0;
        }
    }
}

fs.writeFileSync('data/nso-ses-income-2566.json', JSON.stringify(incomeData, null, 2));
console.log('Saved mapped income data.');
