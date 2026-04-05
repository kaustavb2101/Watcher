const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const checks = [
    // Check 1: Oil slider has oilDisplay element and OIL_SLIDER_DELTA assignment
    ['Oil slider display element exists', html.includes('id="oilDisplay"') && html.includes('OIL_SLIDER_DELTA')],
    // Check 2: fetchLiveOil function exists
    ['fetchLiveOil function exists', html.includes('async function fetchLiveOil()')],
    // Check 3: setTimeout for oil init
    ['setTimeout for oil exists', html.includes('setTimeout(fetchLiveOil, 800)')],
    // Check 4: DLT alias handles space-variant province names (Buri Ram, etc.)
    ['DLT alias for province name variants', html.includes('.replace(/\\s+/g,') && (html.includes('_dltKey') || html.includes('_dltCore'))],
    // Check 5: GPP number formatting with toLocaleString
    ['GPP formatting fixed', html.includes("toLocaleString('en-US'")],
    // Check 6: Top 10 profession fallback system exists
    ['Top 10 fallback professions', html.includes('sectorFallbacks') || html.includes('fallbackSectors')],
    // Check 7: Vehicle breakdown with compact number formatter
    ['Vehicle breakdown expanded', html.includes('_fmtV') || html.includes('_vfmt')],
    // Check 8: NABC JSON parse crash protection
    ['NABC crash protection', html.includes('try { json = await res.json(); } catch(e) { return; }')],
    // Check 9: Household monthly impact label
    ['Baht deficit instead of score', html.includes('ESTIMATED HOUSEHOLD MONTHLY IMPACT')],
    // Check 10: Debt shows ฿ value prominently
    ['Debt shows ฿k not ratio', html.includes('${debtHH}</div>')],
    // Check 11: No duplicate closing html tag
    ['No HTML after </html>', !html.includes('</html>') || html.indexOf('</html>') === html.lastIndexOf('</html>')],
    // Check 12: Missing functions are now defined
    ['cancelCompare defined', html.includes('function cancelCompare()')],
    // Check 13: Settings modal can be closed
    ['closeSettings defined', html.includes('function closeSettings()')],
    // Check 14: XSS protection on province name
    ['Province name XSS-escaped in drilldown', html.includes('esc(name)')],
    // Check 15: localStorage cache key consistency
    ['localStorage cache key consistent', !html.includes('tmli_cache_${tag}') || html.includes('tmli_cache_v2_${tag}')],
];

let pass = 0, fail = 0;
checks.forEach(([label, result]) => {
    console.log((result ? '✅' : '❌') + ' ' + label);
    result ? pass++ : fail++;
});
console.log(`\n${pass}/${checks.length} checks passed.`);
if (fail > 0) process.exit(1);
