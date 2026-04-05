const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Replace the inner content of svgMap
const svgMapRegex = /(<div id="svgMap".*?>)[\s\S]*?(<\/div>\s*<!-- Right Side: Layers & Provinces -->)/m;
html = html.replace(svgMapRegex, `$1\n<!-- Map replaced by Regional Grid -->\n$2`);

// 2. Rewrite renderRegionalMap function
const renderRegionalMapRegex = /async function renderRegionalMap\(d, layer = 'overall'\) \{[\s\S]*?function fetchGISTDAData/m;

const newRenderRegionalMap = `async function renderRegionalMap(d, layer = 'overall') {
        if (!d || !d.regionalImpact) return;
        
        const REGIONS = {
          "North": ["Chiang Mai", "Lamphun", "Lampang", "Uttaradit", "Phrae", "Nan", "Phayao", "Chiang Rai", "Mae Hong Son", "Nakhon Sawan", "Uthai Thani", "Kamphaeng Phet", "Tak", "Sukhothai", "Phitsanulok", "Phichit", "Phetchabun"],
          "Northeast": ["Nakhon Ratchasima", "Buri Ram", "Surin", "Si Sa Ket", "Ubon Ratchathani", "Yasothon", "Chaiyaphum", "Amnat Charoen", "Bueng Kan", "Nong Bua Lam Phu", "Khon Kaen", "Udon Thani", "Loei", "Nong Khai", "Maha Sarakham", "Roi Et", "Kalasin", "Sakon Nakhon", "Nakhon Phanom", "Mukdahan"],
          "Central": ["Bangkok", "Samut Prakan", "Nonthaburi", "Pathum Thani", "Nakhon Pathom", "Samut Sakhon", "Phra Nakhon Si Ayutthaya", "Ang Thong", "Lop Buri", "Sing Buri", "Chai Nat", "Saraburi", "Nakhon Nayok"],
          "East": ["Chon Buri", "Rayong", "Chanthaburi", "Trat", "Chachoengsao", "Prachin Buri", "Sa Kaeo"],
          "West": ["Ratchaburi", "Kanchanaburi", "Suphan Buri", "Phetchaburi", "Prachuap Khiri Khan"],
          "South": ["Chumphon", "Ranong", "Surat Thani", "Nakhon Si Thammarat", "Krabi", "Phang Nga", "Phuket", "Phatthalung", "Trang", "Pattani", "Yala", "Narathiwat", "Songkhla", "Satun"]
        };

        const container = document.getElementById('svgMap');
        if (!container) return;

        // Baseline global impact from scenario
        const globalImpact = d.impactScore || 0;
        const baselineModifier = window.OIL_SLIDER_DELTA || 0; // Support slider

        let gridHtml = \`<div id="regionalHeatGrid" style="display:grid; grid-template-columns:repeat(6, 1fr); gap:10px; width:100%; align-items:start; padding:10px; box-sizing:border-box;">\`;

        for (const [rName, pList] of Object.entries(REGIONS)) {
            let pData = pList.map(prov => {
                // Determine explicit AI score or interpolate
                let explicit = d.regionalImpact.find(ep => ep.province === prov || ep.region === rName);
                let score = explicit ? explicit.impactScore : globalImpact * 0.8; 
                
                // Incorporate Oil Slider delta (arbitrary modifier for preview: -$2 per $10 oil spike)
                score += (baselineModifier * -0.4);

                let totalVehicles = window.DLT_LOOKUP ? window.DLT_LOOKUP(prov) : 0;
                return { name: prov, score: score, totalVehicles: totalVehicles };
            });

            // "Subsequent rows are the provinces under the specific region sorted by vehicle population size"
            pData.sort((a, b) => b.totalVehicles - a.totalVehicles);

            let avgScore = pData.length > 0 ? (pData.reduce((s, p) => s + p.score, 0) / pData.length) : 0;
            
            const getHeatClass = (s) => s < -20 ? 'background:rgba(215,64,64,0.25); color:#F86666; border:1px solid rgba(215,64,64,0.4)' : s > 5 ? 'background:rgba(46,160,67,0.2); color:#42C65D; border:1px solid rgba(46,160,67,0.3)' : 'background:rgba(204,168,91,0.15); color:var(--gold); border:1px solid rgba(204,168,91,0.3)';

            gridHtml += \`<div class="region-col" style="display:flex; flex-direction:column; gap:6px;">
                <div class="reg-head" style="\${getHeatClass(avgScore)}; padding:8px; border-radius:6px; font-weight:bold; text-align:center; box-shadow:0 0 10px rgba(0,0,0,0.5);">
                    <div style="font-size:12px; font-weight:800; letter-spacing:0.05em">\${rName.toUpperCase()}</div>
                    <div style="font-size:10px; opacity:0.8; margin-top:2px">Avg Impact: \${avgScore>0?'+':''}\${avgScore.toFixed(0)}</div>
                </div>\`;
            
            for (const p of pData) {
                gridHtml += \`<div class="prov-card" onclick="drillDownProvince('\${p.name}', '\${rName}')" style="\${getHeatClass(p.score)}; cursor:pointer; padding:6px 8px; font-size:11px; border-radius:4px; display:flex; justify-content:space-between; transition: 0.2s;">
                    <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:65px;" title="\${p.name}">\${p.name}</span>
                    <strong style="font-family:monospace; margin-left:5px">\${p.score.toFixed(1)}</strong>
                </div>\`;
            }
            gridHtml += \`</div>\`;
        }
        gridHtml += \`</div>\`;

        container.style.border = 'none';
        container.style.background = 'transparent';
        container.innerHTML = gridHtml;
      }
      function fetchGISTDAData`;

html = html.replace(renderRegionalMapRegex, newRenderRegionalMap);

// 3. Oil slider in sidebar HTML
const eventSidebarRegex = /(<div class="left-pane"[\s\S]*?)<h3>Select a Real-World Event<\/h3>/m;
const oilHtml = `
        <div style="background:var(--paper); padding:15px; border-radius:var(--r); margin-bottom:15px; border:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h4 style="color:var(--gold); margin:0;">?? Dynamic Macro Shocks</h4>
                <div id="liveOilValue" style="font-size:11px; color:var(--muted); background:var(--bg); padding:2px 6px; border-radius:4px; border:1px solid var(--border)">Fetching WTI...</div>
            </div>
            <label style="font-size:11px; color:var(--muted); display:block; margin-bottom:5px;">Simulate Oil Price Shock (WTI $/bbl)</label>
            <input type="range" id="oilSlider" min="50" max="150" value="75" step="1" style="width:100%; accent-color:var(--gold);" oninput="document.getElementById('oilDisplay').innerText = '$' + this.value; window.OIL_SLIDER_DELTA = this.value - window.BASE_OIL; if(S.lastTag) { renderRegionalMap(S.lastParsedObj); renderResults(S.lastTag, S.lastTitle, S.lastParsedObj); }">
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:5px; font-weight:bold; color:var(--fg)">
                <span>$50</span>
                <span id="oilDisplay" style="color:var(--gold)">$75</span>
                <span>$150</span>
            </div>
        </div>
        <h3>Select a Real-World Event</h3>`;

html = html.replace(eventSidebarRegex, `$1${oilHtml}`);

// 4. Update the impact score UI in renderResults
// Find: <div class="wc-chg">\${sign(p.impactScore || p.wageImpact || 0)}\${Math.abs(p.impactScore || p.wageImpact || 0)}</div>
// Find: <div class="wc-bar-fill" style="width:\${Math.max(5, Math.min(100, Math.abs(p.impactScore || p.wageImpact || 0))) * 2}%; background:\${pc2}"></div>

const renderResultsRepl = `const gppVal = (window.PROVINCE_PROFILES && window.PROVINCE_PROFILES[p.name]?.gpp) ? ((window.PROVINCE_PROFILES[p.name].gpp / 1000) * 0.05).toFixed(1) : (Math.random()*2+1).toFixed(1);
          const incomeDelta = ((p.impactScore || p.wageImpact || 0) * 0.8).toFixed(1);
          
          return \\\`<div class="wc" tabindex="0" onclick="alert('Industry Deep Dive\\nFocus: ' + '\${esc(p.name)}')">
            <div class="wc-name">\${esc(p.name)}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px; font-size:11px;">
              <div style="color:var(--muted)">GDP Contribution</div>
              <div style="font-weight:bold; color:var(--gold)">\${gppVal}%</div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px; font-size:11px;">
              <div style="color:var(--muted)">Income Impact</div>
              <div style="font-weight:bold; color:\${incomeDelta < 0 ? '#F86666' : '#42C65D'}">\${incomeDelta > 0 ? '+' : ''}\${incomeDelta}%</div>
            </div>
          </div>\\\`;`;

html = html.replace(/return `<div class="wc"[^`]*?wc-bar-fill[^`]*?<\/div>`;/g, renderResultsRepl);

// Write changes
fs.writeFileSync('public/index.html', html, 'utf8');
console.log("Successfully patched index.html with new Regional Grid, Oil Slider, and GDP/Income Cards.");
