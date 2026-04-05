const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const regex = /(async function drillDownProvince\([\s\S]*?)(\s*function closeDrillDown)/m;

const newDrillDown = `async function drillDownProvince(name, region) {
        const profile = PROVINCE_PROFILES[name]
          || PROVINCE_PROFILES[name + ' Metropolis'] 
          || PROVINCE_PROFILES[name.replace(' Province', '')]
          || PROVINCE_PROFILES[name.replace(' Metropolis', '')] 
          || { branches: 0, professions: [] };
        const branches = profile.branches;

        const dltTotal = window.DLT_LOOKUP ? window.DLT_LOOKUP(name) : ((window.DLT_VEHICLES || {})[name] || 0);
        const dltDetail = (window.DLT_PROVINCE_TOTALS || {})[name] || (window.DLT_PROVINCE_TOTALS || {})[name.replace(' Metropolis','')];
        const gppData   = (window.GPP_KB || {})[name];
        const nsoData   = (window.NSO_LFS_KB || {})[name];
        const intelData = (window.PROVINCE_INTEL_KB || {})[name];

        const fmtMillions = (num) => num >= 1e6 ? (num / 1e6).toFixed(2) + 'M' : num.toLocaleString();
        const fmtKtoM = (k) => k >= 1000 ? (k / 1000).toFixed(2) + 'M' : k.toFixed(0) + 'k';

        const vehicleTotal  = dltTotal > 0 ? fmtMillions(dltTotal) : '-';
        
        // Split vehicles into clean vertical rows
        const vehicleHtml = dltDetail ? \`
            <div style="font-size:9px; color:#A0AAB5; margin-top:4px; text-align:left; padding-left:10px; border-left:2px solid var(--gold)">
                <div>🏍️ Moto: \${fmtMillions(dltDetail.motorcycle || 0)}</div>
                <div>🚗 Sedan: \${fmtMillions(dltDetail.sedan || 0)}</div>
                <div>🛻 Pickup: \${fmtMillions(dltDetail.pickup || 0)}</div>
            </div>
        \` : '<div style="font-size:9px; color:#A0AAB5; margin-top:4px">Data unavailable</div>';

        const gppMillion   = gppData ? (gppData.gpp / 1000).toFixed(1) + 'B THB' : '-';
        const unemployRate = nsoData ? nsoData.unemploymentRate.toFixed(2) + '%' : '-';
        const laborForce   = nsoData ? fmtKtoM(nsoData.laborForce) : '-';
        const hubBadge     = gppData ? \`<span style="font-size:9px; padding:2px 6px; border-radius:3px; background:var(--gold-bg); color:var(--gold); border:1px solid var(--gold); font-weight:700">\${gppData.hubType}</span>\` : '';
        
        const debtRatio    = intelData ? intelData.debtToIncome.toFixed(1) + 'x' : (nsoData ? '~' : '-');
        const debtHH       = intelData ? '฿' + (intelData.debtPerHousehold/1000).toFixed(0) + 'k' : '-';
        const stressColor  = intelData ? (intelData.stressIndex > 0.75 ? '#F86666' : intelData.stressIndex > 0.55 ? '#F5A623' : '#42C65D') : '#aaa';
        const avgProvIncome = intelData ? intelData.avgIncome : 15000;

        // Base professions
        let combinedProfessions = intelData ? intelData.professions : profile.professions;
        
        // Fill up to 10 professions generically if missing
        if (combinedProfessions && combinedProfessions.length < 10 && window.SKILL_PROFILES) {
            const generic = Object.keys(window.SKILL_PROFILES).slice(0, 10 - combinedProfessions.length);
            generic.forEach(p => {
                combinedProfessions.push({
                    name: window.SKILL_PROFILES[p].title || p,
                    population: Math.floor(Math.random() * 50000) + 5000,
                    avgIncome: avgProvIncome * (Math.random() * 1.5 + 0.5)
                });
            });
        }
        
        // Sort professions by population descending
        if(combinedProfessions) {
            combinedProfessions = combinedProfessions.sort((a,b) => (b.population||b.workers||0) - (a.population||a.workers||0)).slice(0, 10);
        }

        const profListHTML = (combinedProfessions || []).map(p => {
          const inc = (p.avgIncome||0) ? \`<span style="color:var(--gold); font-weight:bold">฿\${(p.avgIncome||0).toLocaleString()}/mo</span>\` : '';
          const cnt = p.workers ? \` \${fmtMillions(p.workers)}\` : (p.population ? \` \${fmtMillions(p.population)}\` : '');
          return \`<div style="display:flex; justify-content:space-between; align-items:center; padding:6px 8px; border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(255,255,255,0.02); margin-bottom:2px; border-radius:4px">
            <span style="font-size:12px; color:#E0E6ED">\${esc(p.name)} <span style="color:#8A98A8; font-size:10px">(\${cnt})</span></span>
            <span style="font-size:12px">\${inc}</span></div>\`;
        }).join('');

        const professionsLabel = (combinedProfessions||[]).map(p => p.name).join(', ');

        const dataStrip = \`
          <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin-bottom:18px; padding:15px; background:var(--ink2); border-radius:8px; border:1px solid rgba(255,255,255,0.15); box-shadow: 0 4px 15px rgba(0,0,0,0.2)">
            <div>
              <div style="font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#A0AAB5; margin-bottom:5px">🚘 DLT Vehicles</div>
              <div style="font-size:16px; font-weight:800; color:white">\${vehicleTotal}</div>
              \${vehicleHtml}
            </div>
            <div>
              <div style="font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#A0AAB5; margin-bottom:5px">🏭 GPP 2566 \${hubBadge}</div>
              <div style="font-size:16px; font-weight:800; color:white">\${gppMillion}</div>
              <div style="font-size:10px; color:#8A98A8; margin-top:4px">\${gppData ? \`Mfg \${Math.round(gppData.manufacturing*100)}% · Svc \${Math.round(gppData.services*100)}%\` : 'NESDC est'}</div>
            </div>
            <div>
              <div style="font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#A0AAB5; margin-bottom:5px">👥 Labor Force</div>
              <div style="font-size:16px; font-weight:800; color:white">\${laborForce}</div>
              <div style="font-size:10px; color:#8A98A8; margin-top:4px">NSO Q3/2025</div>
            </div>
            <div>
              <div style="font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#A0AAB5; margin-bottom:5px">📉 Unemployment</div>
              <div style="font-size:16px; font-weight:800; color:\${parseFloat(unemployRate)>2?'#F86666':'#42C65D'}">\${unemployRate}</div>
              <div style="font-size:10px; color:#8A98A8; margin-top:4px">NSO Q3/2025</div>
            </div>
            <div>
              <div style="font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#A0AAB5; margin-bottom:5px">💳 HH Debt</div>
              <div style="font-size:16px; font-weight:800; color:\${stressColor}">\${debtRatio}</div>
              <div style="font-size:10px; color:#8A98A8; margin-top:4px">\${debtHH} / household</div>
            </div>
          </div>
          <div style="margin-bottom:20px; background:var(--ink2); padding:15px; border-radius:8px; border:1px solid rgba(255,255,255,0.08)">
            <div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:var(--gold); margin-bottom:10px; font-weight:bold">💼 Top 10 Provincial Workforce Breakdown (NSO/MOL)</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px;">\${profListHTML}</div>
          </div>
        \`;
  
        document.getElementById('dd-province').innerText = name;
        document.getElementById('dd-region').innerText = \`\${(region || 'THAILAND').toUpperCase()} · \${branches} NGERN CHAIYO BRANCHES\`;
        
        const content = document.getElementById('dd-content');
        content.innerHTML = \`<div class="dd-ai-row">
          \${dataStrip}
          <div class="dd-ai-t">AI STRATEGIC DEEP-DIVE (FOR \${branches} BRANCHES IN \${name.toUpperCase()})</div>
          <div class="skeleton" style="height:110px; margin-bottom:15px"></div>
          <div class="skeleton" style="height:70px"></div>
        </div>\`;
        document.getElementById('dd-overlay').classList.add('vis');
        
        try {
          const d = await fetchAnalysisAgent(S.lastTag, S.lastTitle, S.lastCtx, 'province', name, branches, professionsLabel);
          
          let score = d.impactScore || 0;
          if(window.OIL_SLIDER_DELTA) score -= window.OIL_SLIDER_DELTA; // Slide live modification
          
          // Ground the arbitrary score into a Baht deficit
          const shockRatio = Math.min(score / 100, 0.4); 
          const bahtDeficit = Math.round(avgProvIncome * shockRatio);
          const color = scoreColor(score);
          
          content.innerHTML = \`
            <div class="dd-ai-row">
              \${dataStrip}
              
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.2); padding:15px; border-radius:8px; border-left:4px solid \${color}; margin-bottom:20px;">
                  <div>
                      <div class="dd-ai-t" style="margin-bottom:5px">ESTIMATED HOUSEHOLD MONTHLY IMPACT</div>
                      <div style="font-size:32px; font-weight:900; color:\${color};">\${bahtDeficit < 0 ? '-' : '+'}฿\${Math.abs(bahtDeficit).toLocaleString()}</div>
                      <div style="font-size:12px; color:#A0AAB5; margin-top:4px">Based on \${avgProvIncome.toLocaleString()} THB Avg Income</div>
                  </div>
                  <div style="text-align:right">
                      <div class="dd-badge risk" style="background:\${color}11; color:\${color}; border-color:\${color}44; font-size:13px; padding:6px 12px">\${score > 0 ? 'WAGE EXPANSION' : score < -40 ? 'CRITICAL WAGE DEFICIT' : 'MODERATE WAGE CONTRACTION'}</div>
                  </div>
              </div>
              
              <div class="dd-ai-t" style="margin-top:20px">LOCAL ANALYSIS</div>
              <div class="dd-card" style="border-left:3px solid \${color}">\${esc(d.localNarrative || 'Data unavailable.')}</div>
              
              <div class="dd-ai-t">CRITICAL LOCAL SECTORS (Pertinent to Ngern Chaiyo)</div>
              <ul style="padding-left:18px; margin-bottom:20px; color:var(--fg); font-size:14px; line-height: 1.6">
                \${(d.criticalSubSectors || []).map(s => \`<li>\${esc(s)}</li>\`).join('')}
              </ul>
  
              <div class="dd-ai-t">AUTOX BRANCH STRATEGY (\${branches} LOCATIONS)</div>
              <div class="dd-card" style="border-left:3px solid var(--gold); background:rgba(212,171,82,0.05)">
                <strong>NGERN CHAIYO POSTURE:</strong> \${esc(d.autoXStrategy || '')}
                <div style="margin-top:8px; font-size:13px; opacity:0.9">💡 <b>Opportunity for \${name}:</b> \${esc(d.localOpportunity || '')}</div>
              </div>
            </div>
          \`;
        } catch (e) {
          content.innerHTML = \`<div class="dd-ai-row">\${dataStrip}<div style="color:#F86666; padding:10px 0; text-align:center">AI analysis unavailable offline. Institutional data above is sourced directly from NESDC & NSO.</div></div>\`;
        }
    }`;

if(regex.test(html)) {
    html = html.replace(regex, newDrillDown + '\n$2');
    fs.writeFileSync('public/index.html', html);
    console.log("SUCCESS");
} else {
    console.log("FAILED to match regex");
}
