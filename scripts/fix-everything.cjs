const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Fix NABC catch block inside fetchGISTDAData/runAnalysis
html = html.replace(
  /const res = await fetch\(\`\/api\/nabc\?path=\$\{encodeURIComponent\(apiPath\)\}\`\);\s*if \(\!res\.ok\) return;\s*const json = await res\.json\(\);/,
  `const res = await fetch(\`/api/nabc?path=\${encodeURIComponent(apiPath)}\`);
              if (!res.ok) return;
              let json;
              try { json = await res.json(); } catch(e) { return; } // Safely bypass`
);

// 2. Fix the vehicle alias logic in drillDownProvince
// The issue: dltDetail uses name.replace(...) but "Buri Ram" needs to map to "Buriram"
html = html.replace(
  /const dltDetail = \(window\.DLT_PROVINCE_TOTALS \|\| \{\}\)\[name\] \|\| \(window\.DLT_PROVINCE_TOTALS \|\| \{\}\)\[name\.replace\(' Metropolis',''\)\];/,
  `const dltDetail = (window.DLT_PROVINCE_TOTALS || {})[name] || (window.DLT_PROVINCE_TOTALS || {})[name.replace(' Metropolis','')] || (window.DLT_PROVINCE_TOTALS || {})[name.replace(' ','')] || (window.DLT_PROVINCE_TOTALS || {})[name.replace('Buri Ram','Buriram')];`
);

// 3. Fix the GPP 7200.0B formatting
html = html.replace(
  /const gppMillion   = gppData \? \(gppData\.gpp \/ 1000\)\.toFixed\(1\) \+ 'B THB' : '-';/,
  `const gppMillion   = gppData ? (gppData.gpp / 1000).toLocaleString('en-US', {maximumFractionDigits:0}) + 'B THB' : '-';`
);

// 4. Fix Household Debt output (just show 89k / household instead of 14.2x)
html = html.replace(
  /<div style="font-size:16px; font-weight:800; color:\$\{stressColor\}">\$\{debtRatio\}<\/div>\s*<div style="font-size:10px; color:#8A98A8; margin-top:4px">\$\{debtHH\} \/ household<\/div>/,
  `<div style="font-size:16px; font-weight:800; color:\${stressColor}">\${debtHH}</div>
              <div style="font-size:10px; color:#8A98A8; margin-top:4px">per household (\${debtRatio})</div>`
);

fs.writeFileSync('public/index.html', html);
console.log('Fixed Buri Ram, NABC, GPP, and Debt formatting.');
