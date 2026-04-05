/**
 * parse-dlt-xlsx.cjs  — Full parser
 * Source: "31Mar2026_total_registered vehicles.xlsx" (DLT สะสม as of 31 March 2026)
 * Extracts: cumulative vehicle totals + vehicle type breakdown per province
 */
const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('data/31Mar2026_total_registered vehicles.xlsx');
const ws = wb.Sheets['Mar2026'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: 0 });

// Row 4 = English headers: ["Type of Vehicle","Whole Kingdom","Bangkok","Regional","Chai Nat",...]
// Row 5 = Grand Total values
// Row 7 = รย.1 Sedan
// Row 8 = รย.2 Microbus/Van
// Row 9 = รย.3 Pickup truck
// Row index for motorcycle: find it
const headerRow = rows[4];   // English province names
const thaiRow   = rows[3];   // Thai province names
const grandTotalRow = rows[5];

// Find sub-type rows by keyword
function findRow(keyword) {
  return rows.find(r => String(r[0]).toLowerCase().includes(keyword.toLowerCase()));
}
const sedanRow    = findRow('Sedan (Not more than 7');
const vanPickupRow= findRow('Van & Pick Up');
const microbusRow = findRow('Microbus');

// Find motorcycle row (รย.12)
const motoRow = rows.find(r => String(r[0]).includes('รย. 12'));

console.log('Motorcycle row label:', motoRow ? String(motoRow[0]).substring(0,60) : 'NOT FOUND');
console.log('Column count:', headerRow.length);
console.log('Provinces start at col 4 (index 4), after: Bangkok(2), Regional(3)');

// Build province → total map
// Columns: 0=type, 1=whole kingdom, 2=Bangkok, 3=Regional, 4..N = provinces
const totals = {};
const breakdown = {};

// Province name normalization map
const NORM = {
  'Bangkok': 'Bangkok',
  'Chai Nat': 'Chai Nat',
  'Sing Buri': 'Sing Buri',
  'Lop Buri': 'Lop Buri',
  'Ang Thong': 'Ang Thong',
  'Saraburi': 'Saraburi',
  'Ayuthaya': 'Phra Nakhon Si Ayutthaya',
  'Pathum Thani': 'Pathum Thani',
  'Nonthaburi': 'Nonthaburi',
  'Samut Prakarn': 'Samut Prakan',
  'Nakhon Nayok': 'Nakhon Nayok',
  'Prachin Buri': 'Prachin Buri',
  'Chachoengsao': 'Chachoengsao',
  'Chon Buri': 'Chon Buri',
  'Rayong': 'Rayong',
  'Chanthaburi': 'Chanthaburi',
  'Trat': 'Trat',
  'Sa Kaeo': 'Sa Kaeo',
  'Nakhon Ratchasima': 'Nakhon Ratchasima',
  'Buri Ram': 'Buri Ram',
  'Surin': 'Surin',
  'Si Sa Ket': 'Si Sa Ket',
  'Ubon Ratchathani': 'Ubon Ratchathani',
  'Yasothon': 'Yasothon',
  'Chaiyaphum': 'Chaiyaphum',
  'Amnat Charoen': 'Amnat Charoen',
  'Bueng Kan': 'Bueng Kan',
  'Nong Bua Lam Phu': 'Nong Bua Lam Phu',
  'Khon Kaen': 'Khon Kaen',
  'Udon Thani': 'Udon Thani',
  'Loei': 'Loei',
  'Nong Khai': 'Nong Khai',
  'Maha Sarakham': 'Maha Sarakham',
  'Roi Et': 'Roi Et',
  'Kalasin': 'Kalasin',
  'Sakon Nakhon': 'Sakon Nakhon',
  'Nakhon Phanom': 'Nakhon Phanom',
  'Mukdahan': 'Mukdahan',
  'Chiang Mai': 'Chiang Mai',
  'Lamphun': 'Lamphun',
  'Lampang': 'Lampang',
  'Uttaradit': 'Uttaradit',
  'Phrae': 'Phrae',
  'Nan': 'Nan',
  'Phayao': 'Phayao',
  'Chiang Rai': 'Chiang Rai',
  'Mae Hong Son': 'Mae Hong Son',
  'Nakhon Sawan': 'Nakhon Sawan',
  'Uthai Thani': 'Uthai Thani',
  'Kamphaeng Phet': 'Kamphaeng Phet',
  'Tak': 'Tak',
  'Sukhothai': 'Sukhothai',
  'Phitsanulok': 'Phitsanulok',
  'Phichit': 'Phichit',
  'Phetchabun': 'Phetchabun',
  'Ratchaburi': 'Ratchaburi',
  'Kanchanaburi': 'Kanchanaburi',
  'Suphan Buri': 'Suphan Buri',
  'Nakhon Pathom': 'Nakhon Pathom',
  'Samut Sakhon': 'Samut Sakhon',
  'Samut Songkhram': 'Samut Songkhram',
  'Phetchaburi': 'Phetchaburi',
  'Prachuap Khiri Khan': 'Prachuap Khiri Khan',
  'Nakhon Si Thammarat': 'Nakhon Si Thammarat',
  'Krabi': 'Krabi',
  'Phangnga': 'Phangnga',
  'Phuket': 'Phuket',
  'Surat Thani': 'Surat Thani',
  'Ranong': 'Ranong',
  'Chumphon': 'Chumphon',
  'Songkhla': 'Songkhla',
  'Satun': 'Satun',
  'Trang': 'Trang',
  'Phatthalung': 'Phatthalung',
  'Pattani': 'Pattani',
  'Yala': 'Yala',
  'Narathiwat': 'Narathiwat',
  // Also add "Bangkok Metropolis" alias
  'Bangkok Metropolis': 'Bangkok',
};

for (let col = 2; col < headerRow.length; col++) {
  const raw = String(headerRow[col]).trim();
  if (!raw || raw === '0') continue;
  const province = NORM[raw] || raw;
  if (province === 'Regional' || province === 'Whole Kingdom') continue;

  const total    = Number(grandTotalRow[col]) || 0;
  const sedan    = Number(sedanRow?.[col]) || 0;
  const pickup   = Number(vanPickupRow?.[col]) || 0;
  const moto     = Number(motoRow?.[col]) || 0;

  totals[province] = total;
  breakdown[province] = { total, sedan, pickup, motorcycle: moto };
}

console.log(`\nParsed ${Object.keys(totals).length} provinces`);
console.log('Bangkok total:', totals['Bangkok']?.toLocaleString());
console.log('Chiang Mai total:', totals['Chiang Mai']?.toLocaleString());
console.log('Rayong total:', totals['Rayong']?.toLocaleString());
console.log('Top 5:', Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>`${k}: ${v.toLocaleString()}`));

// Write the client KB file
const out = `/**
 * DLT Cumulative Vehicle Totals — Client-Side KB
 * Source: DLT Official / สถิติรถจดทะเบียนสะสม ณ วันที่ 31 มีนาคม 2569 (31 March 2026)
 * Reference: "31Mar2026_total_registered vehicles.xlsx" (DLT direct output)
 * Units: number of registered vehicles (รวมทั้งสิ้น Grand Total per province)
 * Generated: ${new Date().toISOString()}
 */
window.DLT_PROVINCE_TOTALS = ${JSON.stringify(breakdown, null, 2)};

// Flat total map for quick lookup (province name → total cumulative vehicles)
window.DLT_VEHICLES = ${JSON.stringify(totals, null, 2)};

// Also support "Bangkok Metropolis" as alias
if (window.DLT_VEHICLES['Bangkok']) {
  window.DLT_VEHICLES['Bangkok Metropolis'] = window.DLT_VEHICLES['Bangkok'];
  window.DLT_PROVINCE_TOTALS['Bangkok Metropolis'] = window.DLT_PROVINCE_TOTALS['Bangkok'];
}
`;

fs.writeFileSync('public/assets/js/dlt-kb-client.js', out, 'utf8');
console.log('\n✅ Written: public/assets/js/dlt-kb-client.js');
console.log('Total provinces:', Object.keys(totals).length);
