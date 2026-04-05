/**
 * update-kb-income.cjs
 * Reads NSO SES 2566 average household income by profession per province from JSON
 * and patches avgIncome values in province-intel-kb.js
 */
const fs = require('fs');

const incomeData = JSON.parse(fs.readFileSync('data/nso-ses-income-2566.json', 'utf8'));
let kb = fs.readFileSync('public/assets/js/province-intel-kb.js', 'utf8');

let updated = 0;
let skipped = [];

// Helper function to replace income for a specific profession in a province block
function replaceProfessionIncome(provinceBlock, projNameList, income) {
    if (!income || income === 0) return provinceBlock;
    
    let updatedBlock = provinceBlock;
    for (const projName of projNameList) {
       // Escape brackets/spaces in regex
       const nameRegex = projName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
       // Match: { name: "Delivery Riders", workers: ..., avgIncome: <number>
       const pattern = new RegExp(`(name:\\s*"${nameRegex}"[^}]*?)avgIncome:\\s*\\d+`, 's');
       updatedBlock = updatedBlock.replace(pattern, `$1avgIncome: ${income}`);
    }
    return updatedBlock;
}

for (const [province, incomeKeys] of Object.entries(incomeData)) {
  const escaped = province.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Find the entire object block for the province
  // It starts with "ProvinceName": { and ends where another province starts or at the file end
  const blockRegex = new RegExp(`("${escaped}"\\s*:\\s*\\{.*?)(?=\\n\\s*"[A-Z]|\\n\\s*\\};|$)`, 's');
  
  const match = kb.match(blockRegex);
  if (match) {
      let block = match[1];
      
      block = replaceProfessionIncome(block, ["Office Staff"], incomeKeys.OfficeStaff);
      block = replaceProfessionIncome(block, ["Factory Workers"], incomeKeys.FactoryWorkers);
      block = replaceProfessionIncome(block, ["SME Owners"], incomeKeys.SMEOwners);
      block = replaceProfessionIncome(block, ["Taxi / Ride-hail Drivers", "Delivery Riders"], incomeKeys.Transport);
      
      kb = kb.replace(match[1], block);
      updated++;
  } else {
      skipped.push(province);
  }
}

// Update source comment header regarding income
kb = kb.replace(
  /\*   - NSO Wage Survey 2567 \(2024\) for avgIncome by occupation/,
  `*   - NSO SES 2566 Average Household Income by Socio-Economic Class for avgIncome (catalog.nso.go.th/dataset/0705_08_0007)`
);

fs.writeFileSync('public/assets/js/province-intel-kb.js', kb, 'utf8');
console.log(`\nUpdated income for: ${updated} provinces`);
if (skipped.length > 0) {
  console.log(`Skipped (no match in KB): ${skipped.join(', ')}`);
}
console.log('KB income saved.');
