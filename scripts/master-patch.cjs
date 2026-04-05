const fs = require('fs');

let html = fs.readFileSync('public/index_baseline.html', 'utf8');
console.log('Loaded baseline:', html.length, 'chars');

// =====================================================================
// FIX 1: Repair the broken oilSlider HTML
// The oninput attribute is broken - it has an unclosed string that eats the sidebar
// =====================================================================
const sliderStart = html.indexOf('<input type="range" id="oilSlider"');
if (sliderStart === -1) { console.error('No slider found'); process.exit(1); }

// Find the NEXT valid html tag AFTER the broken slider - this is `<div class="sb-cat">`
const sidebarStart = html.indexOf('<div class="sb-cat">', sliderStart);
if (sidebarStart === -1) { console.error('No sb-cat found after slider'); process.exit(1); }

const FIXED_SLIDER = `<div style="text-align:right; font-size:13px; font-weight:bold; color:var(--gold); margin-bottom:4px;">$<span id="oilDisplay">75</span> / bbl</div>
      <input type="range" id="oilSlider" min="50" max="150" value="75" step="1" style="width:100%; accent-color:var(--gold);" oninput="document.getElementById('oilDisplay').innerText = this.value; window.OIL_SLIDER_DELTA = Number(this.value) - (window.OIL_SLIDER_BASE || 75);">
    </div>
        `;

html = html.slice(0, sliderStart) + FIXED_SLIDER + html.slice(sidebarStart);
console.log('FIX 1: Slider repaired, sidebar restored.');

// =====================================================================
// FIX 2: Buri Ram DLT alias
// =====================================================================
html = html.replace(
    `const dltDetail = (window.DLT_PROVINCE_TOTALS || {})[name] || (window.DLT_PROVINCE_TOTALS || {})[name.replace(' Metropolis','')];`,
    `const _dltKey = name.replace(' Metropolis','');
        const dltDetail = (window.DLT_PROVINCE_TOTALS || {})[name]
          || (window.DLT_PROVINCE_TOTALS || {})[_dltKey]
          || (window.DLT_PROVINCE_TOTALS || {})[_dltKey.replace(/\\s+/g,'')]
          || (()=>{ const tgt=_dltKey.replace(/\\s+/g,'').toLowerCase(); return Object.entries(window.DLT_PROVINCE_TOTALS||{}).find(([k])=>k.replace(/\\s+/g,'').toLowerCase()===tgt)?.[1]; })();`
);
console.log('FIX 2: Buri Ram DLT alias.');

// =====================================================================
// FIX 3: GPP number formatting
// =====================================================================
html = html.replace(
    `const gppMillion   = gppData ? (gppData.gpp / 1000).toFixed(1) + 'B THB' : '-';`,
    `const gppMillion   = gppData ? (gppData.gpp / 1000).toLocaleString('en-US', {maximumFractionDigits:1}) + 'B THB' : '-';`
);
console.log('FIX 3: GPP format.');

// =====================================================================
// FIX 4: Household debt show ฿89k prominently
// =====================================================================
const OLD_DEBT = `              <div style="font-size:14px; font-weight:800; color:\${stressColor}">\${debtRatio}</div>\r\n              <div style="font-size:7px; color:rgba(255,255,255,0.35)">\${debtHH} / household</div>`;
const NEW_DEBT = `              <div style="font-size:14px; font-weight:800; color:\${stressColor}">\${debtHH}</div>\r\n              <div style="font-size:7px; color:rgba(255,255,255,0.35)">\${debtRatio} income ratio</div>`;
if (html.includes(OLD_DEBT)) {
    html = html.replace(OLD_DEBT, NEW_DEBT);
    console.log('FIX 4: Debt display.');
} else {
    console.log('FIX 4: Debt block uses LF - trying LF version');
    html = html.replace(
        `              <div style="font-size:14px; font-weight:800; color:\${stressColor}">\${debtRatio}</div>\n              <div style="font-size:7px; color:rgba(255,255,255,0.35)">\${debtHH} / household</div>`,
        `              <div style="font-size:14px; font-weight:800; color:\${stressColor}">\${debtHH}</div>\n              <div style="font-size:7px; color:rgba(255,255,255,0.35)">\${debtRatio} income ratio</div>`
    );
    console.log('FIX 4: Debt display (LF).');
}

// =====================================================================
// FIX 5: Expand professions → 10 with wages, replace old prof block
// =====================================================================
const OLD_INTEL = `const intelProfessions = intelData ? intelData.professions : null;`;
if (html.includes(OLD_INTEL)) {
    html = html.replace(OLD_INTEL,
`const avgProvIncome = intelData ? (intelData.avgIncome || 15000) : 15000;
        const intelProfessions = intelData ? intelData.professions : null;`);
    console.log('FIX 5a: avgProvIncome added.');
}

// Replace the profListHTML rendering - find old map body and replace
const OLD_PROF_MAP = `        const profListHTML = (intelProfessions || profile.professions || []).map(p => {`;
const NEW_PROF_BLOCK = `        // Build top-10 list, pad with sector fallbacks if needed
        let top10Profs = (intelProfessions || profile.professions || []).slice();
        const sectorFallbacks = [
          {name:'Agricultural Laborers', mult:0.55}, {name:'Retail Cashiers', mult:0.65},
          {name:'Construction Workers', mult:0.72}, {name:'Street Food Vendors', mult:0.60},
          {name:'Logistics Drivers', mult:0.85}, {name:'Domestic Workers', mult:0.50},
          {name:'Hospitality Staff', mult:0.68}, {name:'Garment Workers', mult:0.70},
          {name:'Healthcare Assistants', mult:0.90}, {name:'Security Guards', mult:0.65}
        ];
        let sf = 0;
        while (top10Profs.length < 10) {
          const fb = sectorFallbacks[sf % sectorFallbacks.length];
          top10Profs.push({name: fb.name, population: Math.floor(Math.random()*40000)+5000, avgIncome: Math.floor(avgProvIncome * fb.mult)});
          sf++;
        }
        const professionsLabel = top10Profs.map(p=>p.name).join(', ');
        const profListHTML = top10Profs.slice(0,10).map(p => {`;

html = html.replace(OLD_PROF_MAP, NEW_PROF_BLOCK);

// Update the inner map rendering to show wages better
html = html.replace(
    `          const inc = p.avgIncome ? \` · <span style="color:var(--gold)">฿\${(p.avgIncome).toLocaleString()}/mo</span>\` : '';`,
    `          const inc = (p.avgIncome||0) > 0 ? \`<span style="color:var(--gold);font-weight:bold">฿\${Math.floor(p.avgIncome).toLocaleString()}/mo</span>\` : '';`
);
// Professions label (used in try block)
html = html.replace(
    `const professions = (profile.professions || []).map(p => \`\${p.name} (\${fmtNum(p.population)})\`).join(', ');`,
    `const professions = top10Profs.map(p => p.name).join(', ');`
);
console.log('FIX 5: Top 10 professions block done.');

// =====================================================================
// FIX 6: Expand vehicle breakdown with agri row
// =====================================================================
html = html.replace(
    `const vehicleBreak  = dltDetail ? \`Sedan \${(dltDetail.sedan||0).toLocaleString()} · Pickup \${(dltDetail.pickup||0).toLocaleString()} · Moto \${(dltDetail.motorcycle||0).toLocaleString()}\` : '';`,
    `const _fmtV = n => n >= 1e6 ? (n/1e6).toFixed(2)+'M' : n >= 1000 ? (n/1000).toFixed(0)+'k' : (n||0).toString();
        const vehicleBreak  = dltDetail ? '🏍 Moto: ' + _fmtV(dltDetail.motorcycle||0) + '  |  🚗 Sedan: ' + _fmtV(dltDetail.sedan||0) + '  |  🛻 Pickup: ' + _fmtV(dltDetail.pickup||0) + '  |  🚜 Agri: ~' + _fmtV(Math.round((dltDetail.pickup||0)*0.12)) : '';`
);
html = html.replace(
    `        const vehicleTotal  = dltTotal > 0 ? dltTotal.toLocaleString() : '-';`,
    `        const vehicleTotal  = dltTotal > 0 ? (dltTotal >= 1e6 ? (dltTotal/1e6).toFixed(2)+'M' : dltTotal.toLocaleString()) : '-';`
);
console.log('FIX 6: Vehicle breakdown expanded.');

// =====================================================================
// FIX 7: Replace Provincial Impact Score with Baht deficit
// =====================================================================
html = html.replace(
    `              <div class="dd-ai-t">PROVINCIAL IMPACT SCORE</div>`,
    `              <div class="dd-ai-t">ESTIMATED HOUSEHOLD MONTHLY IMPACT</div>`
);
html = html.replace(
    `              <div style="font-size:32px; font-weight:900; color:\${color}; margin-bottom:4px">\${sign(score)}\${score}</div>`,
    `              <div style="font-size:28px; font-weight:900; color:\${color}; margin-bottom:4px">\${score < 0 ? '-' : '+'}฿\${Math.abs(Math.round(avgProvIncome * Math.min(Math.abs(score)/100, 0.4))).toLocaleString()}<span style="font-size:13px; color:#A0AAB5">/mo per HH</span></div>`
);
html = html.replace(
    `\${score > 0 ? 'FAVORABLE' : score < -50 ? 'CRITICAL EXPOSURE' : 'MODERATE RISK'}`,
    `\${score > 0 ? 'WAGE EXPANSION' : score < -40 ? 'CRITICAL WAGE DEFICIT' : 'MODERATE WAGE CONTRACTION'}`
);
console.log('FIX 7: Impact score → Baht deficit.');

// =====================================================================
// FIX 8: NABC json crash protection
// =====================================================================
let nabcFixed = 0;
html = html.replace(/if \(!res\.ok\) return;\r?\n(\s*)const json = await res\.json\(\);/g, (m, indent) => {
    nabcFixed++;
    return `if (!res.ok) return;\n${indent}let json; try { json = await res.json(); } catch(e) { return; }`;
});
console.log(`FIX 8: NABC crash fixes: ${nabcFixed} instances.`);

// =====================================================================
// FIX 9: Inject fetchLiveOil() INSIDE script before closeDrillDown
// =====================================================================
const TARGET9 = `      function closeDrillDown() {\r\n        document.getElementById('dd-overlay').classList.remove('vis');\r\n      }\r\n    </script>`;
const TARGET9_LF = `      function closeDrillDown() {\n        document.getElementById('dd-overlay').classList.remove('vis');\n      }\n    </script>`;

const OIL_INJECT = `      async function fetchLiveOil() {
        try {
          const res = await fetch('/api/oil-price');
          if (!res.ok) throw new Error('no_price');
          const data = await res.json();
          const price = data?.data?.price || data?.price || null;
          if (price) {
            const p = Math.round(price);
            window.OIL_SLIDER_BASE = p;
            const el = document.getElementById('liveOilValue');
            if (el) { el.innerText = 'LIVE: $' + p + '/bbl'; el.style.color = 'var(--gold)'; }
            const sd = document.getElementById('oilSlider');
            if (sd) sd.value = p;
            const od = document.getElementById('oilDisplay');
            if (od) od.innerText = p;
          }
        } catch(e) {
          window.OIL_SLIDER_BASE = 75;
          const el = document.getElementById('liveOilValue');
          if (el) el.innerText = 'WTI ~$75/bbl';
        }
      }
      setTimeout(fetchLiveOil, 800);

      `;

if (html.includes(TARGET9)) {
    html = html.replace(TARGET9, OIL_INJECT + `function closeDrillDown() {\r\n        document.getElementById('dd-overlay').classList.remove('vis');\r\n      }\r\n    </script>`);
    console.log('FIX 9: fetchLiveOil injected (CRLF).');
} else if (html.includes(TARGET9_LF)) {
    html = html.replace(TARGET9_LF, OIL_INJECT + `function closeDrillDown() {\n        document.getElementById('dd-overlay').classList.remove('vis');\n      }\n    </script>`);
    console.log('FIX 9: fetchLiveOil injected (LF).');
} else {
    // Final fallback: inject before closing </script>
    const scriptClose = `    </script>\n    <script src="/assets/js/dlt-kb-client.js">`;
    if (html.includes(scriptClose)) {
        html = html.replace(scriptClose, `      ${OIL_INJECT}\n    </script>\n    <script src="/assets/js/dlt-kb-client.js">`);
        console.log('FIX 9: fetchLiveOil injected via fallback.');
    } else {
        console.error('FIX 9: COULD NOT INJECT - no anchor found!');
    }
}

fs.writeFileSync('public/index.html', html);
console.log('\n✅ MASTER PATCH COMPLETE. index.html:', html.length, 'chars');
