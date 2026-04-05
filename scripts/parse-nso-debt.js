/**
 * parse-nso-debt.js
 * Parses NSO SES 2566 household debt dataset (SFD_SPB0806) for all 77 provinces.
 * Source: https://catalog.nso.go.th/dataset/0705_08_0009
 * Outputs: weighted-average debtPerHousehold per province (across all socio-economic classes)
 *
 * Logic: for each province, find rows where:
 *   hhdebt_totaldebt = "จำนวนหนี้สินเฉลี่ยต่อครัวเรือน"
 *   hhdebt_totaldebt_purpose_source = "จำนวนหนี้สินเฉลี่ยต่อครัวเรือน" (the total, not broken down)
 *   purpose_source_bor = "จำนวนหนี้สินเฉลี่ยต่อครัวเรือน" (summary row)
 * Then weight by household count (จำนวนครัวเรือนทั้งสิ้น) per class.
 */

const fs = require('fs');
const path = require('path');

// Read the raw CSV (8741 lines)
const csvPath = path.join(__dirname, '../data/nso-ses-spb0806.csv');
if (!fs.existsSync(csvPath)) {
  console.error('CSV not found at', csvPath);
  console.log('Downloading from catalogapi.nso.go.th...');
  process.exit(1);
}

const lines = fs.readFileSync(csvPath, 'utf8').split('\n');
const header = lines[0].replace(/^\uFEFF/, '').split(',');
console.log('Columns:', header);

// Province → { totalHH, weightedDebt }
const provinceData = {};

// Thai province name → English map (key ones)
const thaiToEng = {
  'กรุงเทพมหานคร': 'Bangkok',
  'สมุทรปราการ': 'Samut Prakan',
  'นนทบุรี': 'Nonthaburi',
  'ปทุมธานี': 'Pathum Thani',
  'สมุทรสาคร': 'Samut Sakhon',
  'สมุทรสงคราม': 'Samut Songkhram',
  'นครปฐม': 'Nakhon Pathom',
  'พระนครศรีอยุธยา': 'Phra Nakhon Si Ayutthaya',
  'อ่างทอง': 'Ang Thong',
  'ลพบุรี': 'Lop Buri',
  'ชัยนาท': 'Chai Nat',
  'สระบุรี': 'Saraburi',
  'สิงห์บุรี': 'Sing Buri',
  'สุพรรณบุรี': 'Suphan Buri',
  'นครสวรรค์': 'Nakhon Sawan',
  'อุทัยธานี': 'Uthai Thani',
  'กำแพงเพชร': 'Kamphaeng Phet',
  'พิจิตร': 'Phichit',
  'พิษณุโลก': 'Phitsanulok',
  'สุโขทัย': 'Sukhothai',
  'นครนายก': 'Nakhon Nayok',
  'เพชรบูรณ์': 'Phetchabun',
  'เชียงใหม่': 'Chiang Mai',
  'เชียงราย': 'Chiang Rai',
  'ลำปาง': 'Lampang',
  'ลำพูน': 'Lamphun',
  'น่าน': 'Nan',
  'พะเยา': 'Phayao',
  'แพร่': 'Phrae',
  'อุตรดิตถ์': 'Uttaradit',
  'แม่ฮ่องสอน': 'Mae Hong Son',
  'นครราชสีมา': 'Nakhon Ratchasima',
  'บุรีรัมย์': 'Buri Ram',
  'ชัยภูมิ': 'Chaiyaphum',
  'ขอนแก่น': 'Khon Kaen',
  'กาฬสินธุ์': 'Kalasin',
  'มหาสารคาม': 'Maha Sarakham',
  'ร้อยเอ็ด': 'Roi Et',
  'ยโสธร': 'Yasothon',
  'อำนาจเจริญ': 'Amnat Charoen',
  'บึงกาฬ': 'Bueng Kan',
  'หนองบัวลำภู': 'Nong Bua Lam Phu',
  'หนองคาย': 'Nong Khai',
  'เลย': 'Loei',
  'อุดรธานี': 'Udon Thani',
  'สกลนคร': 'Sakon Nakhon',
  'นครพนม': 'Nakhon Phanom',
  'มุกดาหาร': 'Mukdahan',
  'ศรีสะเกษ': 'Si Sa Ket',
  'สุรินทร์': 'Surin',
  'อุบลราชธานี': 'Ubon Ratchathani',
  'ชลบุรี': 'Chon Buri',
  'ระยอง': 'Rayong',
  'ฉะเชิงเทรา': 'Chachoengsao',
  'ปราจีนบุรี': 'Prachin Buri',
  'สระแก้ว': 'Sa Kaeo',
  'จันทบุรี': 'Chanthaburi',
  'ตราด': 'Trat',
  'ราชบุรี': 'Ratchaburi',
  'กาญจนบุรี': 'Kanchanaburi',
  'ประจวบคีรีขันธ์': 'Prachuap Khiri Khan',
  'เพชรบุรี': 'Phetchaburi',
  'ตาก': 'Tak',
  'สุราษฎร์ธานี': 'Surat Thani',
  'ภูเก็ต': 'Phuket',
  'สงขลา': 'Songkhla',
  'นครศรีธรรมราช': 'Nakhon Si Thammarat',
  'กระบี่': 'Krabi',
  'พังงา': 'Phangnga',
  'ระนอง': 'Ranong',
  'ชุมพร': 'Chumphon',
  'ตรัง': 'Trang',
  'พัทลุง': 'Phatthalung',
  'สตูล': 'Satun',
  'ปัตตานี': 'Pattani',
  'ยะลา': 'Yala',
  'นราธิวาส': 'Narathiwat',
};

// Parse CSV properly (handle quoted fields)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += line[i];
    }
  }
  result.push(current.trim());
  return result;
}

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const parts = parseCSVLine(line);
  if (parts.length < 8) continue;

  const [year, province, , , hhdebtType, purposeSource, purposeBor, valueStr] = parts;

  if (year !== '2566') continue;

  const value = parseFloat(valueStr);
  if (isNaN(value) || value === 0) continue;

  const engProvince = thaiToEng[province];
  if (!engProvince) continue;

  if (!provinceData[engProvince]) {
    provinceData[engProvince] = { households: [], debtValues: [] };
  }

  // Grab household count rows
  if (
    hhdebtType === 'จำนวนครัวเรือนทั้งสิ้น' &&
    purposeSource === 'จำนวนครัวเรือนทั้งสิ้น' &&
    purposeBor === 'จำนวนครัวเรือนทั้งสิ้น'
  ) {
    // This is a household count for a socio-economic class
    // Store with a key based on soc_eco
    provinceData[engProvince].households.push(value);
  }

  // Grab total debt average rows (the summary row per socio-economic class)
  if (
    hhdebtType === 'จำนวนหนี้สินเฉลี่ยต่อครัวเรือน' &&
    purposeSource === 'จำนวนหนี้สินเฉลี่ยต่อครัวเรือน' &&
    purposeBor === 'จำนวนหนี้สินเฉลี่ยต่อครัวเรือน'
  ) {
    provinceData[engProvince].debtValues.push(value);
  }
}

// Compute weighted average
const result = {};
for (const [province, data] of Object.entries(provinceData)) {
  const hh = data.households;
  const debt = data.debtValues;

  if (hh.length === 0 || debt.length === 0) {
    continue;
  }

  // Pair households and debt values by index (they appear in same order per class)
  const pairs = Math.min(hh.length, debt.length);
  let totalHH = 0;
  let weightedDebt = 0;

  for (let i = 0; i < pairs; i++) {
    totalHH += hh[i];
    weightedDebt += hh[i] * debt[i];
  }

  result[province] = {
    debtPerHousehold: Math.round(weightedDebt / totalHH),
    totalHouseholds: Math.round(totalHH),
    dataPoints: pairs,
  };
}

// Sort by province name
const sorted = Object.fromEntries(
  Object.entries(result).sort(([a], [b]) => a.localeCompare(b))
);

console.log('\n=== NSO SES 2566 — Weighted Average HH Debt by Province ===\n');
for (const [prov, d] of Object.entries(sorted)) {
  console.log(`  "${prov}": ${d.debtPerHousehold.toLocaleString()} THB (${d.dataPoints} classes, ${d.totalHouseholds.toLocaleString()} HH)`);
}

// Output as JS object for KB use
const jsOutput = `// NSO SES 2566 — Weighted Average Household Debt per Province\n// Source: catalog.nso.go.th/dataset/0705_08_0009 (SFD_SPB0806)\n// Generated: ${new Date().toISOString().split('T')[0]}\nconst NSO_SES_DEBT_2566 = ${JSON.stringify(sorted, null, 2)};\n`;
const outPath = path.join(__dirname, '../data/nso-ses-debt-2566.js');
fs.writeFileSync(outPath, jsOutput);
console.log('\nOutput written to', outPath);
