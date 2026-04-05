/**
 * update-kb-debt.cjs
 * Reads NSO SES 2566 weighted-average debt per province from JSON
 * and patches debtPerHousehold values in province-intel-kb.js
 */
const fs = require('fs');
const path = require('path');

const debtData = JSON.parse(fs.readFileSync('data/nso-ses-debt-2566.json', 'utf8'));
let kb = fs.readFileSync('public/assets/js/province-intel-kb.js', 'utf8');

let updated = 0;
let skipped = [];

for (const [province, debt] of Object.entries(debtData)) {
  // Escape special regex chars in province name
  const escaped = province.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match: "Province Name": { ... debtPerHousehold: <number>, ...
  // We want to replace just the debtPerHousehold value for the right province block
  const blockPattern = new RegExp(
    `("${escaped}"\\s*:\\s*\\{[^}]*?)debtPerHousehold:\\s*\\d+`,
    's'
  );
  const newKb = kb.replace(blockPattern, `$1debtPerHousehold: ${debt}`);
  if (newKb !== kb) {
    kb = newKb;
    updated++;
    console.log(`✓ ${province}: ${debt.toLocaleString()} THB`);
  } else {
    skipped.push(province);
  }
}

// Update source comment header
kb = kb.replace(
  /\* Generated: .*?\n/,
  `* Generated: ${new Date().toISOString().split('T')[0]} | NSO SES 2566 (catalog.nso.go.th/dataset/0705_08_0009) — All 77 provinces\n`
);

// Update debtSource for all provinces that were matched
kb = kb.replace(
  /debtSource:\s*"[^"]*"/g,
  `debtSource: "NSO SES 2566 (catalog.nso.go.th/dataset/0705_08_0009)"`
);

fs.writeFileSync('public/assets/js/province-intel-kb.js', kb, 'utf8');
console.log(`\nUpdated: ${updated} provinces`);
if (skipped.length > 0) {
  console.log(`Skipped (no match in KB): ${skipped.join(', ')}`);
}
console.log('KB saved.');
