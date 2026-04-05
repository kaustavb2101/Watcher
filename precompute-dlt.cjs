/**
 * precompute-dlt.cjs
 * Pre-processes data/dlt-cumulative.js into a province→total vehicle map
 * for embedding in the client bundle without API dependency.
 */
const fs = require('fs');

// Read and evaluate the DLT cumulative data
const dltSrc = fs.readFileSync('data/dlt-cumulative.js', 'utf8');
// Extract the records array via regex (avoid full eval)
const match = dltSrc.match(/export const DLT_CUMULATIVE_RECORDS = (\[[\s\S]*?\]);/);
if (!match) { console.error('Could not extract DLT records'); process.exit(1); }

// Safe-eval using Function
const records = Function('"use strict"; return ' + match[1])();

// Thai → English province name map
const THAI_TO_EN = {
  'กระบี่': 'Krabi', 'กาญจนบุรี': 'Kanchanaburi', 'กาฬสินธุ์': 'Kalasin',
  'กำแพงเพชร': 'Kamphaeng Phet', 'จันทบุรี': 'Chanthaburi', 'ฉะเชิงเทรา': 'Chachoengsao',
  'ชัยนาท': 'Chai Nat', 'ชัยภูมิ': 'Chaiyaphum', 'ชุมพร': 'Chumphon',
  'เชียงราย': 'Chiang Rai', 'ตรัง': 'Trang', 'ตราด': 'Trat',
  'ตาก': 'Tak', 'นครนายก': 'Nakhon Nayok', 'นครปฐม': 'Nakhon Pathom',
  'นครพนม': 'Nakhon Phanom', 'นครราชสีมา': 'Nakhon Ratchasima',
  'นครศรีธรรมราช': 'Nakhon Si Thammarat', 'นครสวรรค์': 'Nakhon Sawan',
  'นนทบุรี': 'Nonthaburi', 'นราธิวาส': 'Narathiwat', 'น่าน': 'Nan',
  'บึงกาฬ': 'Bueng Kan', 'ปทุมธานี': 'Pathum Thani',
  'ประจวบคีรีขันธ์': 'Prachuap Khiri Khan', 'ปราจีนบุรี': 'Prachin Buri',
  'ปัตตานี': 'Pattani', 'พะเยา': 'Phayao', 'พังงา': 'Phangnga',
  'พัทลุง': 'Phatthalung', 'พิจิตร': 'Phichit', 'พิษณุโลก': 'Phitsanulok',
  'เพชรบุรี': 'Phetchaburi', 'เพชรบูรณ์': 'Phetchabun', 'แพร่': 'Phrae',
  'ภูเก็ต': 'Phuket', 'มหาสารคาม': 'Maha Sarakham', 'มุกดาหาร': 'Mukdahan',
  'แม่ฮ่องสอน': 'Mae Hong Son', 'ยโสธร': 'Yasothon', 'ยะลา': 'Yala',
  'ร้อยเอ็ด': 'Roi Et', 'ระนอง': 'Ranong', 'ระยอง': 'Rayong',
  'ราชบุรี': 'Ratchaburi', 'ลพบุรี': 'Lop Buri', 'ลำปาง': 'Lampang',
  'ลำพูน': 'Lamphun', 'เลย': 'Loei', 'ศรีสะเกษ': 'Si Sa Ket',
  'สกลนคร': 'Sakon Nakhon', 'สงขลา': 'Songkhla', 'สตูล': 'Satun',
  'สมุทรสงคราม': 'Samut Songkhram', 'สมุทรสาคร': 'Samut Sakhon',
  'สระแก้ว': 'Sa Kaeo', 'สระบุรี': 'Saraburi', 'สิงห์บุรี': 'Sing Buri',
  'สุโขทัย': 'Sukhothai', 'สุพรรณบุรี': 'Suphan Buri',
  'สุราษฎร์ธานี': 'Surat Thani', 'สุรินทร์': 'Surin',
  'หนองคาย': 'Nong Khai', 'หนองบัวลำภู': 'Nong Bua Lam Phu',
  'อ่างทอง': 'Ang Thong', 'อำนาจเจริญ': 'Amnat Charoen',
  'อุดรธานี': 'Udon Thani', 'อุตรดิตถ์': 'Uttaradit',
  'อุทัยธานี': 'Uthai Thani', 'อุบลราชธานี': 'Ubon Ratchathani',
};

// Aggregate by province
const totals = {};
records.forEach(r => {
  let prov = r.province;
  if (THAI_TO_EN[prov]) prov = THAI_TO_EN[prov];
  if (!totals[prov]) totals[prov] = { total: 0, breakdown: {} };
  totals[prov].total += (r.size || 0);
  // Categorise type
  const t = r.type || '';
  let cat = 'other';
  if (t.includes('รย. 1') || t.includes('รย. 2')) cat = 'passenger_car';
  else if (t.includes('รย. 3')) cat = 'pickup_truck';
  else if (t.includes('รย. 12')) cat = 'motorcycle';
  else if (t.includes('รย. 6') || t.includes('รย. 17') || t.includes('รย. 18')) cat = 'for_hire';
  if (!totals[prov].breakdown[cat]) totals[prov].breakdown[cat] = 0;
  totals[prov].breakdown[cat] += (r.size || 0);
});

// Write client JS
const out = `/**
 * DLT Cumulative Vehicle Totals — Client-Side KB
 * Pre-aggregated from data/dlt-cumulative.js (3,805 records, all 77 provinces)
 * Source: DLT / data.go.th | Generated: ${new Date().toISOString()}
 * Units: number of registered vehicles (cumulative, latest available period)
 */
window.DLT_PROVINCE_TOTALS = ${JSON.stringify(totals, null, 2)};

// Convenience: flat total map for quick lookup
window.DLT_VEHICLES = {};
Object.entries(window.DLT_PROVINCE_TOTALS).forEach(([prov, d]) => {
  window.DLT_VEHICLES[prov] = d.total;
});
`;

fs.writeFileSync('public/assets/js/dlt-kb-client.js', out, 'utf8');
const count = Object.keys(totals).length;
console.log(`Generated dlt-kb-client.js: ${count} provinces, ${records.length} records processed`);
console.log('Sample:', JSON.stringify(Object.entries(totals).slice(0,3).map(([k,v]) => [k, v.total])));
