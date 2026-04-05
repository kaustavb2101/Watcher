// Append aliases and DLT_LOOKUP function
const fs = require('fs');
let src = fs.readFileSync('public/assets/js/dlt-kb-client.js', 'utf8');
const aliases = `
// Province name aliases — maps DLT xlsx spellings to canonical UI province names
var DLT_ALIAS_MAP = {
  'Chonburi': 'Chon Buri', 'Buri Rum': 'Buri Ram', 'Khanchanaburi': 'Kanchanaburi',
  'Pang Nga': 'Phangnga', 'Petchaburi': 'Phetchaburi', 'nan': 'Nan',
  'Samut Sakorn': 'Samut Sakhon', 'Samut Songkram': 'Samut Songkhram',
  'Nong Bua Lamphu': 'Nong Bua Lam Phu', 'Prachuap Kiri Khan': 'Prachuap Khiri Khan',
  'Sra Kaew': 'Sa Kaeo', 'Trad': 'Trat'
};
Object.entries(DLT_ALIAS_MAP).forEach(function(entry) {
  var from = entry[0], to = entry[1];
  if (window.DLT_VEHICLES[from] !== undefined && !window.DLT_VEHICLES[to]) {
    window.DLT_VEHICLES[to] = window.DLT_VEHICLES[from];
    window.DLT_PROVINCE_TOTALS[to] = window.DLT_PROVINCE_TOTALS[from];
  }
});
// UI uses "Bangkok Metropolis" — alias it
if (!window.DLT_VEHICLES['Bangkok Metropolis'] && window.DLT_VEHICLES['Bangkok']) {
  window.DLT_VEHICLES['Bangkok Metropolis'] = window.DLT_VEHICLES['Bangkok'];
  window.DLT_PROVINCE_TOTALS['Bangkok Metropolis'] = window.DLT_PROVINCE_TOTALS['Bangkok'];
}
// Helper: tolerant lookup
window.DLT_LOOKUP = function(name) {
  if (!name) return 0;
  var n = String(name).replace(/\\s*Province$/, '').replace(/\\s*Metropolis$/, '').trim();
  return window.DLT_VEHICLES[n] || window.DLT_VEHICLES[name] || 0;
};
`;
fs.writeFileSync('public/assets/js/dlt-kb-client.js', src + aliases, 'utf8');
console.log('Done. Lines:', (src + aliases).split('\\n').length);
