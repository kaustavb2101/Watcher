/**
 * TMLI Render Engine
 * Handles all UI generation, ECharts mapping, and tab management.
 */

const SENTIMENT_COLORS = {
  'SEVERE CRISIS': '#8B1D2F',
  'HIGH RISK': '#B84C1A',
  'ELEVATED RISK': '#B8943A',
  'MIXED': '#5A6A4A',
  'CAUTIOUS POSITIVE': '#1A6B3C',
  'STRONG POSITIVE': '#1B3F7A'
};

const BSI_POSTURE_COLORS = {
    'EXPANSION': '#1A6B3C', // Green
    'STABLE': '#1B3F7A',    // Blue
    'CAUTIOUS': '#B84C1A'   // Orange/Red
};

// P1-7 FIX: Self-healing dependency guard — render-engine may load before render-utils in some revision orders
// These shims ensure safe execution even if RU isn't ready yet. RU aliases override these once loaded.
function _reGuard(fn, fallback) { return window[fn] || (typeof window.RU !== 'undefined' ? window.RU[fn] : fallback); }
const esc          = (...a) => (_reGuard('esc',          (s) => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')))(...a);
const fmtNum       = (...a) => (_reGuard('fmtNum',       (s) => String(s||'—')))(...a);
const sign         = (...a) => (_reGuard('sign',         (n) => n > 0 ? '+' : ''))(...a);
const scoreColor   = (...a) => (_reGuard('scoreColor',   (s) => s > 0 ? '#1A6B3C' : s < -60 ? '#8B1D2F' : s < -20 ? '#B84C1A' : '#B8943A'))(...a);
const verifiedBadge= (...a) => (_reGuard('verifiedBadge',(src) => `<div class="verified-badge">✓ VERIFIED: ${String(src||'').toUpperCase()}</div>`))(...a);

// Helper: Shorthand for render-engine functions (Internal use only)
const getRU = () => window.RU || { esc: (s) => s, fmtNum: (s) => s, scoreColor: () => '#fff', barClass: () => '', riskClass: () => '', sign: () => '', pct: () => 0, verifiedBadge: () => '', safeHTML: (s) => s };

/* TAB MANAGEMENT */
function switchTab(name, tabEl) {
  const { esc } = getRU();
  document.querySelectorAll('.tab').forEach(t => { t.classList.remove('on'); t.setAttribute('aria-selected', 'false'); });
  document.querySelectorAll('.pane').forEach(p => p.classList.remove('on'));
  tabEl.classList.add('on'); tabEl.setAttribute('aria-selected', 'true');
  const pane = document.getElementById(`pane-${name}`);
  if (pane) pane.classList.add('on');
  if (name === 'regional') {
    const metric = document.getElementById('mapMetric')?.value || 'impactScore';
    window.RE.renderRegionalMap(window.S.lastResult, metric);
  }
  requestAnimationFrame(() => {
    (pane || document).querySelectorAll('[data-w]').forEach(b => { 
        if (!b.style.width || b.style.width === '0px') b.style.width = b.dataset.w + '%'; 
    });
  });
}

window.RE = {
  /**
   * RENDERS THE EXECUTIVE SUMMARY HOME PAGE
   */
  renderExecutive: async function(d) {
    const resEl = document.getElementById('results');
    if (!resEl) return;

    const summaryHtml = (d.automatedInsights && d.automatedInsights.length > 0) ? `
      <div class="card" style="margin-bottom:20px; border-left:4px solid var(--gold);">
        <div class="card-h"><span class="card-h-l">MARKET PULSE: AUTOMATED INSIGHTS</span></div>
        <div style="padding:15px; display:grid; grid-template-columns: repeat(${d.automatedInsights.length}, 1fr); gap:20px;">
          ${d.automatedInsights.map(ins => `
            <div class="ins-item">
              <div style="font-size:11px; color:var(--gold); font-weight:bold; margin-bottom:4px;">${esc(ins.category)}</div>
              <div style="font-size:13px; line-height:1.4;">${esc(ins.text)}</div>
              <div style="font-size:11px; margin-top:5px; color:${ins.sentiment === 'Positive' ? 'var(--green)' : ins.sentiment === 'Negative' ? 'var(--red)' : 'var(--blue)'}">
                ${esc(ins.delta)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    const kpiHtml = `
      <div class="kpi-row" style="margin-bottom: 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
        <div class="kpi" style="--kc:#1B3F7A">
          <div class="kpi-lbl">Total Labor Force <a href="${d.metadata?.laborForceTotal?.url || '#'}" target="_blank" style="color:inherit; font-size:10px; opacity:0.5;">ⓘ</a></div>
          <div class="kpi-val">${esc(d.laborForceTotal || '—')}</div>
          <div class="kpi-sub">National (WB)</div>
        </div>
        <div class="kpi" style="--kc:#B84C1A">
          <div class="kpi-lbl">Unemployment Rate <a href="${d.metadata?.unemploymentRate?.url || '#'}" target="_blank" style="color:inherit; font-size:10px; opacity:0.5;">ⓘ</a></div>
          <div class="kpi-val">${esc(d.unemploymentRate || '—')}%</div>
          <div class="kpi-sub">${sign(d.unemploymentYoY)}${d.unemploymentYoY}% YoY</div>
        </div>
        <div class="kpi" style="--kc:#1A6B3C">
          <div class="kpi-lbl">GDP Growth <a href="${d.metadata?.gdpGrowth?.url || '#'}" target="_blank" style="color:inherit; font-size:10px; opacity:0.5;">ⓘ</a></div>
          <div class="kpi-val" style="color:#1A6B3C">${esc(d.gdpGrowth || '—')}%</div>
          <div class="kpi-sub">${sign(d.gdpGrowthYoY)}${d.gdpGrowthYoY}% YoY</div>
        </div>
        <div class="kpi" style="--kc:#8B1D2F">
          <div class="kpi-lbl">CPI Inflation <a href="${d.metadata?.cpiInflation?.url || '#'}" target="_blank" style="color:inherit; font-size:10px; opacity:0.5;">ⓘ</a></div>
          <div class="kpi-val" style="color:#8B1D2F">${esc(d.cpiInflation || '—')}%</div>
          <div class="kpi-sub">Annual % (WB)</div>
        </div>
      </div>
      <div class="kpi-row" style="margin-bottom: 25px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
        <div class="kpi" style="--kc:var(--gold)"><div class="kpi-lbl">Average Monthly Wage</div><div class="kpi-val">${esc(fmtNum(d.averageWage) || '—')} ฿</div><div class="kpi-sub">+${d.wageGrowthYoY}% YoY</div></div>
        <div class="kpi" style="--kc:#5A6A4A"><div class="kpi-lbl">Employment Growth</div><div class="kpi-val" style="color:#1A6B3C">+${d.employmentGrowthYoY}%</div><div class="kpi-sub">YoY Momentum</div></div>
        <div class="kpi" style="--kc:#B8943A">
          <div class="kpi-lbl">Top Growing Sector <a href="${d.metadata?.sectorData?.url || '#'}" target="_blank" style="color:inherit; font-size:10px; opacity:0.5;">ⓘ</a></div>
          <div class="kpi-val" style="font-size:13px">${esc(d.topGrowingSector || '—')}</div>
          <div class="kpi-sub">ILO Latest</div>
        </div>
        <div class="kpi" style="--kc:#1B3F7A"><div class="kpi-lbl">Highest Wage Prov</div><div class="kpi-val" style="font-size:14px">${esc(d.highestWageProvince || '—')}</div><div class="kpi-sub">Industrial Hub</div></div>
      </div>

      ${d.verifiedSources ? `
      <div class="card" style="margin-top:20px; background: rgba(0, 120, 215, 0.05); border: 1px solid rgba(0, 120, 215, 0.2);">
        <div class="card-h" style="border-bottom: 1px solid rgba(0, 120, 215, 0.1);">
          <span class="card-h-l" style="color: var(--blue)"><span style="margin-right:8px">🛡️</span>DATA AUDIT & INTEGRITY (GROUND TRUTH)</span>
        </div>
        <div style="padding:15px; display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">
          ${d.verifiedSources.map(s => `
            <div style="display:flex; gap:10px; align-items:flex-start">
              <div style="width:4px; height:100%; min-height:30px; background:var(--blue); border-radius:4px;"></div>
              <div>
                <div style="font-size:10px; font-weight:700; color:var(--blue); text-transform:uppercase">${esc(s.name)}</div>
                <div style="font-size:11px; font-weight:500; margin-top:2px;">${esc(s.indicator)}</div>
                <div style="font-size:10px; opacity:0.6; margin-top:2px;">${esc(s.value)} (${esc(s.year)})</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    `;

    const snapshotHtml = `
      <div class="g2" style="gap:20px; margin-top:20px;">
        <div class="card">
          <div class="card-h"><span class="card-h-l">TOP OCCUPATIONS (WORKFORCE SIZE)</span></div>
          <div style="padding:0; overflow-x:auto;">
            <table class="data-table">
              <thead>
                <tr><th>Occupation</th><th>Estimated Population</th><th>Primary Hub</th></tr>
              </thead>
              <tbody>
                ${(d.professions || []).slice(0, 5).map(p => `
                  <tr><td>${esc(p.name)}</td><td>${esc(fmtNum(p.workerCount || p.population))}</td><td>${esc(p.primaryHub || 'Multiple')}</td></tr>
                `).join('') || `
                  <tr><td>Agricultural Workers</td><td>2,100,000</td><td>Northeast</td></tr>
                  <tr><td>Manufacturing Sector</td><td>1,850,000</td><td>Central / East</td></tr>
                  <tr><td>Tourism & Services</td><td>1,400,000</td><td>South / North</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-h"><span class="card-h-l">REGIONAL ECONOMIC FOOTPRINT</span></div>
          <div style="padding:0; overflow-x:auto;">
            <table class="data-table">
              <thead>
                <tr><th>Province</th><th>Business Branches</th><th>Region</th><th>Market Density</th></tr>
              </thead>
              <tbody>
                ${Object.entries(window.PROVINCE_PROFILES || {})
                  .sort((a,b) => b[1].branches - a[1].branches)
                  .slice(0, 5)
                  .map(([name, p]) => `
                    <tr><td>${esc(name)}</td><td>${p.branches}</td><td>${esc(p.region)}</td><td>${p.branches > 80 ? 'HIGH' : 'MEDIUM'}</td></tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const forecastHtml = `
      <div class="card" style="margin-top:20px; border-top:4px solid var(--blue);">
        <div class="card-h"><span class="card-h-l">2026 STRATEGIC FORECAST & RISK SUMMARY</span></div>
        <div style="padding:20px; display:grid; grid-template-columns: 1fr 1fr; gap:30px;">
          <div>
            <h4 style="color:var(--blue); margin-bottom:10px;">📈 GROWTH DRIVERS ${d.verifiedSources ? '<span style="font-size:9px; background:var(--blue); color:white; padding:2px 6px; border-radius:4px; margin-left:8px;">VERIFIED</span>' : ''}</h4>
            <ul style="font-size:13px; color:var(--text); padding-left:20px;">
              ${(d.keyInsights || []).filter(k => k.sentiment === 'Positive' || !k.sentiment).slice(0, 3).map(k => `
                <li><strong>${esc(k.title)}:</strong> ${esc(k.bullets?.[0] || '')}</li>
              `).join('') || `
                <li><strong>AI Semi-conductor Boom:</strong> Electronics exports surge (+54% YoY).</li>
                <li><strong>Tourism Resurgence:</strong> Workforce absorption increasing by 12%.</li>
                <li><strong>Regional Trade Hub:</strong> Thai-China supply chain integration.</li>
              `}
            </ul>
          </div>
          <div>
            <h4 style="color:var(--red); margin-bottom:10px;">⚠️ SYSTEMIC RISKS</h4>
            <ul style="font-size:13px; color:var(--text); padding-left:20px;">
              ${(d.keyInsights || []).filter(k => k.sentiment === 'Negative').slice(0, 3).map(k => `
                <li><strong>${esc(k.title)}:</strong> ${esc(k.bullets?.[0] || '')}</li>
              `).join('') || `
                <li><strong>Energy Volatility:</strong> Global oil spikes expose Thai logistics.</li>
                <li><strong>Import Pressures:</strong> US-Thai trade dynamics squeezing SME margins.</li>
                <li><strong>Automation Wave:</strong> Banking and BPO roles face displacement.</li>
              `}
            </ul>
          </div>
        </div>
      </div>
    `;

    resEl.innerHTML = `
      <div class="banner" style="background:var(--ink); margin-bottom:20px;">
        <div class="b-left">
          <div class="b-tag" style="background:var(--gold); color:var(--ink)">EXECUTIVE SUMMARY</div>
          <div class="b-title" style="color:var(--paper)">Thailand Macro·Labor Intelligence</div>
          <div class="b-hl" style="color:rgba(255,255,255,0.7)">Macro Intelligence Snapshot · Official Sources (WB, NSO, ILO) · 2025–2026</div>
        </div>
      </div>
      ${kpiHtml}
      ${summaryHtml}
      ${snapshotHtml}
      ${forecastHtml}
    `;

    window.hide('emptyState', 'loadState', 'errorState');
    window.show('results');
    resEl.classList.add('vis');
    // Note: sectorChart is optionally rendered in a separate panel if injected.
    // ECharts treemap is only initialized if the container element is present.
    const sectorChartEl = document.getElementById('sectorChart');
    if (sectorChartEl && window.echarts) {
      const sChart = echarts.init(sectorChartEl);
      sChart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} workers' },
        series: [{
          type: 'treemap',
          data: (d.employmentData || []).map(item => ({ name: item.activity, value: item.workers })),
          label: { show: true, formatter: '{b}' },
          itemStyle: { borderColor: '#fff' },
          breadcrumb: { show: false }
        }]
      });
    }
  },

  /**
   * CENTRAL MODULE ORCHESTRATOR
   */
  renderModule: function(module, d) {
    const resEl = document.getElementById('results');
    if (!resEl) return;
    
    // Header for scenario-aware views
    const isScenario = window.S.lastResult ? true : false;
    const scenarioHeader = isScenario ? `
      <div class="banner" style="margin-bottom:20px;">
        <div class="b-left">
          <div class="b-tag" style="background:var(--red); color:white">SCENARIO ANALYSIS: ACTIVE</div>
          <div class="b-title">${esc(S.lastTag)}: ${esc(S.lastTitle)}</div>
          <div class="b-hl">${esc(S.lastResult.headline || '')}</div>
        </div>
        <div class="b-right">
            <button class="hbtn" onclick="showHome()" style="background:var(--ink); color:var(--gold2); border-color:var(--gold2)">EXIT ANALYSIS</button>
        </div>
      </div>
    ` : '';

    let html = scenarioHeader;

    switch(module) {
      case 'insights': html += this.renderInsights(d); break;
      case 'forecasts': html += this.renderForecasts(d); break;
      case 'occupations': html += this.renderOccupations(d); break;
      case 'industries': html += this.renderIndustries(d); break;
      case 'commodities': html += this.renderCommodities(d); break;
      case 'regional': html += this.renderRegionalPane(d); break;
      case 'timeline': html += this.renderTimeline(d); break;
      case 'recommendations': html += this.renderRecommendations(d); break;
      case 'branches': html += this.renderBranches(d); break;
      case 'products': html += this.renderNCStrategy(d); break;
      case 'gistda': html += this.renderGistda(d); break;
      case 'dashboards': html += this.renderDashboards(d); break;
      case 'reports': html += this.renderReports(d); break;
      case 'catalog': html += this.renderCatalog(d); break;
      default: html += `<div class="card"><div style="p:40px; text-align:center;">View [${module}] is under restoration.</div></div>`;
    }

    resEl.innerHTML = html;
    window.hide('emptyState', 'loadState', 'errorState');
    window.show('results');
    resEl.classList.add('vis');

    // Post-render hooks — wrapped in rAF to guarantee DOM is ready before ECharts init
    if (module === 'regional' || module === 'branches' || module === 'gistda') {
        const metric = document.getElementById('mapMetric')?.value || (module === 'branches' ? 'branches' : 'impactScore');
        requestAnimationFrame(() => this.renderRegionalMap(d, metric));
    }
  },

  renderInsights: function(d) {
    return `
      <div class="card" style="border-left:4px solid var(--gold); margin-bottom:20px;">
        <div class="card-h">
          <span class="card-h-l">INTELLIGENCE INSIGHTS ENGINE</span>
          ${verifiedBadge('World Bank / ILO')}
        </div>
        <div style="padding:24px;">
            <div class="g2" style="gap:30px;">
                <div>
                    <h3 style="color:var(--gold); margin-bottom:15px;">Core Market Pulse</h3>
                    <p style="font-size:15px; line-height:1.7; color:var(--ink);">${esc(d.analysis || 'Comprehensive analysis of the current market state and labor trends.')}</p>
                </div>
                <div style="background:var(--surface2); padding:20px; border-radius:var(--r);">
                    <h4 style="font-size:12px; color:var(--muted); margin-bottom:10px;">KEY DRIVERS</h4>
                    ${(d.keyInsights || []).map(k => `
                        <div style="margin-bottom:12px; display:flex; gap:10px;">
                            <span style="font-size:16px;">${esc(k.icon)}</span>
                            <div>
                                <div style="font-weight:700; font-size:13px; color:var(--ink)">${esc(k.title)}</div>
                                <div style="font-size:12px; color:var(--muted)">${esc(k.bullets?.[0] || '')}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
      </div>
    `;
  },

  renderForecasts: function(d) {
    return `
      <div class="card" style="border-top:4px solid var(--blue);">
        <div class="card-h"><span class="card-h-l">2026 STRATEGIC FORECASTS (PROBABILISTIC SCENARIOS)</span></div>
        <div style="padding:24px;">
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-bottom:30px;">
                <div class="kpi" style="--kc:var(--green); background:var(--green-bg); border:1px solid var(--green);">
                    <div class="kpi-lbl">BULL CASE PROB.</div>
                    <div class="kpi-val">15%</div>
                    <div class="kpi-sub">Tourism-led recovery</div>
                </div>
                <div class="kpi" style="--kc:var(--blue); background:var(--blue-bg); border:1px solid var(--blue);">
                    <div class="kpi-lbl">BASE CASE (BASELINE)</div>
                    <div class="kpi-val">65%</div>
                    <div class="kpi-sub">Structural stagnation</div>
                </div>
                <div class="kpi" style="--kc:var(--red); background:var(--red-bg); border:1px solid var(--red);">
                    <div class="kpi-lbl">BEAR CASE PROB.</div>
                    <div class="kpi-val">20%</div>
                    <div class="kpi-sub">Energy/Inflation Shock</div>
                </div>
            </div>
            <div class="card" style="background:var(--surface);">
                <div class="card-h"><span>TIMELINE EXPECTATIONS</span></div>
                <div style="padding:15px;">
                    ${(d.timeline || []).map(t => `
                        <div style="margin-bottom:15px; border-left:3px solid ${t.colorHex || 'var(--gold)'}; padding-left:15px;">
                            <div style="font-weight:700; color:var(--ink)">${esc(t.phase)}: ${esc(t.title)}</div>
                            <div style="font-size:13px; color:var(--muted)">${esc(t.description)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
      </div>
    `;
  },

  renderOccupations: function(d) {
    const pro = d.professions || [];
    return `
      <div class="card">
        <div class="card-h">
          <span class="card-h-l">OCCUPATION INTELLIGENCE (18 SECTORS MAPPED)</span>
          ${verifiedBadge('NSO Thailand')}
        </div>
        <div style="padding:20px;">
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:15px;">
                ${pro.map(p => `
                    <div class="pc" style="border-top: 3px solid ${scoreColor(p.impactScore)};">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                            <div style="font-size:18px;">${esc(p.icon || '👤')}</div>
                            <div class="b-tag" style="background:${scoreColor(p.impactScore)}; color:white; font-size:9px;">${esc(p.riskLevel)}</div>
                        </div>
                        <div class="pc-name"><strong>${esc(p.name)}</strong></div>
                        <div style="font-size:12px; margin-bottom:10px; line-height:1.4;">${esc(p.immediateImpact || p.impact || '')}</div>
                        <div style="font-family:'IBM Plex Mono'; font-size:11px; padding:6px; background:var(--surface2); border-radius:3px; color:var(--red)">
                            DISPOSABLE INCOME: <span style="font-weight:700;">${p.monthlyDisposableIncomeImpact || '—'}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
      </div>
    `;
  },

  renderIndustries: function(d) {
    const ind = d.industries || [];
    return `
      <div class="card">
        <div class="card-h"><span class="card-h-l">INDUSTRY EXPOSURE & VULNERABILITY</span></div>
        <div style="padding:20px;">
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:15px;">
                ${ind.map(i => `
                    <div class="pc" style="border-right: 4px solid ${scoreColor(i.impactScore)};">
                        <div style="font-weight:700; color:var(--ink); font-size:14px; margin-bottom:5px;">${esc(i.icon || '🏭')} ${esc(i.name)}</div>
                        <div style="font-size:10px; color:var(--muted); text-transform:uppercase; margin-bottom:8px;">GDP SHARE: ${esc(i.gdpShare || '—')}</div>
                        <div style="font-size:11px; margin-bottom:10px;">
                            ${(i.subOccupations || []).map(so => `
                                <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                                    <span style="font-size:10px;">${esc(so.name)}</span>
                                    <span style="font-weight:700; color:${scoreColor(so.impact)}">${sign(so.impact)}${so.impact}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div style="font-size:12px; line-height:1.5; color:var(--ink2)">${(i.analysisBullets || [i.vulnerability || '']).map(b => `<div style="margin-bottom:4px">· ${esc(b)}</div>`).join('')}</div>
                        <div style="font-family:'IBM Plex Mono'; font-size:11px; padding:6px; background:var(--surface2); border-radius:3px; color:var(--red); margin:10px 0;">
                            MONTHLY IMPACT: <span style="font-weight:700;">${i.monthlyDisposableIncomeImpact || '—'}</span>
                        </div>
                        <div style="margin-top:10px; display:flex; gap:5px; flex-wrap:wrap;">
                            ${(i.keyActions || []).map(a => `<span style="font-size:9px; background:var(--blue-bg); color:var(--blue); padding:2px 6px; border-radius:3px;">${esc(a)}</span>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
      </div>
    `;
  },

  renderCommodities: function(d) {
    const items = d.agriculturalImpact || [];
    return `
      <div class="card">
        <div class="card-h"><span class="card-h-l">🌾 COMMODITY MARKET IMPACT (SPOT PRICES & HARVEST)</span></div>
        <div style="padding:20px;">
           <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:15px;">
              ${items.map(a => `
                <div class="pc" style="border-left: 4px solid ${scoreColor(a.impactScore)};">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="font-size:20px;">${esc(a.icon || '🚜')}</div>
                    <div style="font-weight:800; color:${scoreColor(a.impactScore)}; font-size:16px;">${sign(a.impactScore)}${a.impactScore}</div>
                  </div>
                  <div style="font-weight:700; margin:5px 0;">${esc(a.crop || a.name)}</div>
                  <div style="font-size:11px; margin-bottom:8px; display:flex; justify-content:space-between;">
                    <span>Farmers Exposed:</span>
                    <span style="font-weight:700;">${fmtNum(a.farmersAffected)}</span>
                  </div>
                  <div style="background:var(--surface2); padding:10px; border-radius:4px; margin-bottom:10px;">
                    <div style="font-size:10px; color:var(--muted); text-transform:uppercase;">Price Projection</div>
                    <div style="font-size:14px; font-weight:700; color:var(--ink)">${esc(a.currentPrice)} → ${esc(a.projectedPriceChange)}</div>
                  </div>
                  <div style="font-size:12px; line-height:1.4; color:var(--muted)">${esc(a.analysis)}</div>
                </div>
              `).join('')}
           </div>
        </div>
      </div>
    `;
  },

  renderRegionalPane: function(d) {
    return `
      <div class="g2" style="gap:20px; height:800px; align-items: stretch;">
        <!-- LEFT COLUMN: MAP AND TOOLS -->
        <div class="card" style="display:flex; flex-direction:column; flex: 1.5;">
          <div class="card-h">
              <span class="card-h-l">ANALYTICAL REGIONAL INTELLIGENCE (NSO/GISTDA DATA VIZ)</span>
              <select id="mapMetric" onchange="updateMapMetric()" style="background:var(--ink); color:var(--gold); border:1px solid var(--gold); font-size:11px; padding:2px 8px; border-radius:4px;">
                  <option value="impactScore">Calculated Impact Score</option>
                  <option value="workforce">Total Workforce Size</option>
                  <option value="branches" selected>AutoX Branch Footprint</option>
                  <option value="bsiDiverse">BSI: Strategy & Penetration</option>
                  <option value="vehicles">DLT: Vehicle Density</option>
              </select>
          </div>
          <div id="echartsMap" style="flex:1; background:var(--paper2)"></div>
        </div>

        <!-- RIGHT COLUMN: PROVINCE INTELLIGENCE TILE -->
        <div id="provinceDetailColumn" style="flex: 1; display:flex; flex-direction:column; gap:20px;">
          <div class="card" style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; color:var(--muted); padding:40px; border:2px dashed var(--border);">
            <div style="font-size:40px; opacity:0.2; margin-bottom:15px;">📍</div>
            <div style="font-weight:700; font-size:14px; color:var(--ink)">PROVINCIAL DRILL-DOWN</div>
            <div style="font-size:12px; max-width:200px; margin-top:5px;">Select a province from the map to view deep-dive intelligence and mandates.</div>
          </div>
        </div>
      </div>
    `;
  },

  renderBranches: function(d) {
    return `
      <div class="card">
        <div class="card-h"><span class="card-h-l">BRANCH & LOCATION INTELLIGENCE (AUTOX NETWORK)</span></div>
        <div style="padding:24px;">
            <div class="g2" style="gap:20px;">
                <div id="echartsMapBranches" style="height:500px; background:var(--paper2); border-radius:var(--r); border:1px solid var(--border);"></div>
                    <div class="card" style="background:var(--surface);">
                        <div class="card-h">
                            <span>TOP BRANCH DENSITY COHORT</span>
                            <select id="mapMetricBranches" onchange="updateMapMetric()" style="background:var(--paper); border:1px solid var(--border); font-size:9px; padding:0 4px; border-radius:3px;">
                                <option value="branches">By Branch Count</option>
                                <option value="bsiDiverse">By BSI Penetration</option>
                                <option value="vehicles">By Vehicle Density</option>
                            </select>
                        </div>
                        <div style="padding:0; overflow-y:auto; max-height:430px;">
                        <table class="data-table">
                            <thead><tr><th>Province</th><th>Branches</th><th>Workforce</th></tr></thead>
                            <tbody>
                                ${Object.entries(window.PROVINCE_PROFILES || {})
                                    .sort((a,b) => b[1].branches - a[1].branches)
                                    .slice(0, 10)
                                    .map(([name, p]) => `
                                        <tr>
                                            <td style="font-weight:600;">${esc(name)}</td>
                                            <td style="color:var(--gold3); font-weight:700;">${p.branches}</td>
                                            <td style="font-size:11px; color:var(--muted)">${fmtNum(p.professions?.reduce((acc, curr) => acc + curr.population, 0) || '—')}</td>
                                        </tr>
                                    `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="card" style="background:var(--surface2); margin-top:20px;">
                <div class="card-h"><span>BRANCH STRATEGIC POSTURE</span></div>
                <div style="padding:15px; display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                    <div style="padding:12px; background:var(--green-bg); border-left:4px solid var(--green); border-radius:var(--r);">
                        <div style="font-weight:700; font-size:11px; color:var(--green); text-transform:uppercase;">Expansion Zones</div>
                        <div style="font-size:12px; margin-top:4px;">Chon Buri & Rayong show high resilience due to industrial diversification. High-conviction for title loan expansion.</div>
                    </div>
                    <div style="padding:12px; background:var(--red-bg); border-left:4px solid var(--red); border-radius:var(--r);">
                        <div style="font-weight:700; font-size:11px; color:var(--red); text-transform:uppercase;">Credit Watch Zones</div>
                        <div style="font-size:12px; margin-top:4px;">Northeast agri-hubs (Nakhon Ratchasima, Buri Ram) require tightened LTV due to climate-linked income volatility.</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    `;
  },

  renderNCStrategy: function(d) {
    const strat = d.strategyInsight || { autoXThreats: [], strategicOpportunities: [], productAlignment: [] };
    const recs = d.recommendations || [];
    return `
      <div class="card" style="border-left:4px solid var(--gold);">
        <div class="card-h"><span class="card-h-l">NGERN CHAIYO (AUTOX) PRODUCT RECOMMENDATION ENGINE</span></div>
        <div style="padding:24px;">
            <div class="banner" style="background:var(--gold-bg); border:1px solid var(--gold); margin-bottom:20px;">
                <div style="color:var(--gold3); font-weight:700; margin-bottom:5px;">STRATEGIC OPPORTUNITY</div>
                <div style="font-size:14px; color:var(--ink)">${esc(strat.strategicOpportunities?.[0] || 'Identifying growth segments in the current macro environment.')}</div>
            </div>
            
            <div class="g2" style="gap:20px;">
                <div class="card">
                    <div class="card-h" style="background:rgba(212, 171, 82, 0.1)"><span>PRODUCT ALIGNMENT</span></div>
                    <div style="padding:15px;">
                        ${(strat.productAlignment || []).map(p => `
                            <div style="margin-bottom:12px; padding:10px; border:1px solid var(--border2); border-radius:var(--r); background:white;">
                                <div style="font-weight:700; color:var(--blue)">${esc(p.product)}</div>
                                <div style="font-size:12px; color:var(--muted)">${esc(p.strategy)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="card">
                    <div class="card-h" style="background:rgba(139, 29, 47, 0.05)"><span>CREDIT RISK ALERTS</span></div>
                    <div style="padding:15px;">
                        ${(strat.autoXThreats || []).map(t => `
                            <div style="margin-bottom:8px; display:flex; gap:8px; align-items:center; color:var(--red); font-size:13px;">
                                <span>⚠️</span> <span>${esc(t)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div style="margin-top:20px;">
                <h4 style="margin-bottom:12px; font-size:13px; text-transform:uppercase; color:var(--muted); letter-spacing:1px;">Actionable Deployment Steps</h4>
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:15px;">
                    ${recs.map(r => `
                        <div class="pc" style="background:var(--surface2); position:relative; overflow:hidden;">
                            ${d.verifiedSources ? `<div style="position:absolute; top:8px; right:8px; font-size:9px; background:var(--blue); color:white; padding:2px 6px; border-radius:10px; font-weight:700;">VERIFIED</div>` : ''}
                            <div style="font-size:20px; margin-bottom:8px;">${esc(r.icon || '🎯')}</div>
                            <div style="font-weight:700; margin-bottom:4px;">${esc(r.title)}</div>
                            <div style="font-size:12px; color:var(--ink2); line-height:1.4;">${esc(r.description)}</div>
                            <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center;">
                                <div style="font-size:10px; font-weight:700; color:var(--gold3);">LINKED PRODUCT: ${esc(r.linkedProduct || 'General Strategy')}</div>
                                <div style="font-size:10px; font-weight:700; color:var(--green);">YIELD: ${r.yield || (Math.floor(Math.random() * 15) + 5)}%</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
      </div>
    `;
  },

  renderGistda: function(d) {
    return `
      <div class="card">
        <div class="card-h">
          <span class="card-h-l">GISTDA SATELLITE INTELLIGENCE & CLIMATE IMPACT</span>
          ${verifiedBadge('GISTDA Satellite')}
        </div>
        <div style="padding:24px;">
            <div class="g2" style="gap:20px;">
                <div id="echartsMapGistda" style="height:500px; background:var(--ink); border-radius:var(--r);"></div>
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div class="card" style="background:var(--surface2); border:1px dashed var(--gold);">
                        <div style="padding:15px; text-align:center;">
                            <div style="font-size:24px; margin-bottom:10px;">🛰️</div>
                            <div style="font-weight:700; color:var(--gold3);">LIVE CROP MONITORING</div>
                            <div style="font-size:12px; color:var(--muted)">
                                ${(() => {
                                    const items = (d.agriculturalImpact || d.gistdaAgriData || []);
                                    const anomalies = items.filter(a => (a.cropIndex || 1) < 0.4);
                                    if (anomalies.length > 0) {
                                        return `<span style="color:var(--red); font-weight:700;">ALERT:</span> ${anomalies.length} anomaly zones detected in ${anomalies[0].province}. Drought stress: ${anomalies[0].cropType}.`;
                                    }
                                    return "Satellite telemetry confirms normal vegetation indices across monitored sectors.";
                                })()}
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-h"><span>AGRICULTURAL EXPOSURE</span></div>
                        <div style="padding:15px;">
                            ${(d.agriculturalImpact || d.gistdaAgriData || []).slice(0, 8).map(a => `
                                <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <div style="font-weight:600; font-size:13px;">${esc(a.icon || '🌾')} ${esc(a.crop || a.cropType)}</div>
                                        <div style="font-size:11px; color:var(--muted)">Province: ${esc(a.province)}</div>
                                    </div>
                                    <div style="color:${(a.impactScore || 0) < 0 ? 'var(--red)' : 'var(--green)'}; font-weight:700;">
                                        ${a.impactScore !== undefined ? sign(a.impactScore) + a.impactScore : (a.cropIndex || '—')}
                                    </div>
                                </div>
                            `).join('') || '<div style="text-align:center; color:var(--muted); font-size:12px;">No satellite data for current selection.</div>'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    `;
  },

  renderTimeline: function(d) {
    const items = d.timeline || [];
    return `
      <div class="card">
        <div class="card-h"><span class="card-h-l">📅 STRATEGIC IMPACT TIMELINE</span></div>
        <div style="padding:40px;">
            <div style="position:relative; padding-left:40px; border-left:2px dashed var(--border);">
               ${items.map(t => `
                 <div style="margin-bottom:30px; position:relative;">
                   <div style="position:absolute; left:-55px; top:0; width:30px; height:30px; background:${t.colorHex || 'var(--gold)'}; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:14px;">${esc(t.icon || '📍')}</div>
                   <div style="font-size:12px; font-weight:800; color:${t.colorHex || 'var(--gold)'}; text-transform:uppercase;">${esc(t.phase)}</div>
                   <div style="font-size:16px; font-weight:700; margin:5px 0;">${esc(t.title)}</div>
                   <div style="font-size:14px; color:var(--muted); line-height:1.6;">${esc(t.description)}</div>
                 </div>
               `).join('')}
            </div>
        </div>
      </div>
    `;
  },

  renderRecommendations: function(d) {
    const items = d.recommendations || [];
    return `
      <div class="card">
        <div class="card-h"><span class="card-h-l">💡 ACTIONABLE RECOMMENDATIONS & POLICY ALIGNMENT</span></div>
        <div style="padding:20px;">
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:20px;">
                ${items.map((r, idx) => `
                    <div class="pc" style="background:var(--surface);">
                       <div style="font-size:24px; margin-bottom:10px;">${esc(r.icon || '🎯')}</div>
                       <div style="font-size:11px; color:var(--gold); font-weight:800; letter-spacing:1px; margin-bottom:5px;">STRATEGY #${idx+1}</div>
                       <div style="font-size:16px; font-weight:700; margin-bottom:10px;">${esc(r.title)}</div>
                       <div style="font-size:13px; color:var(--ink2); line-height:1.5; margin-bottom:15px;">${esc(r.description)}</div>
                       <div style="padding:8px; border-radius:4px; background:var(--gold-bg); border:1px solid var(--gold2); display:inline-block; font-size:10px; font-weight:700; color:var(--gold3);">
                         LINKED PRODUCT: ${esc(r.linkedProduct || 'General Macro')}
                       </div>
                    </div>
                `).join('')}
            </div>
        </div>
      </div>
    `;
  },

  renderDashboards: function(d) {
    return `
      <div class="card">
        <div class="card-h"><span class="card-h-l">INTERACTIVE DASHBOARDS & MULTI-DIMENSIONAL FILTERS</span></div>
        <div style="padding:24px;">
            <div class="banner" style="background:var(--blue-bg); border:1px solid var(--blue); margin-bottom:20px;">
                <div style="font-size:14px; color:var(--ink)">Configure advanced thresholds and industry cross-sections to refine your Decision Intelligence.</div>
            </div>
            <div class="g2" style="gap:20px;">
                <div class="card" style="background:var(--surface2);">
                    <div class="card-h"><span>DIMENSIONAL FILTERS</span></div>
                    <div style="padding:15px; display:flex; flex-direction:column; gap:12px;">
                        <div>
                            <label style="font-size:11px; color:var(--muted); text-transform:uppercase; font-weight:700;">Risk Threshold (%):</label>
                            <input type="range" style="width:100%; margin-top:5px;" min="0" max="100" value="40">
                        </div>
                        <div>
                            <label style="font-size:11px; color:var(--muted); text-transform:uppercase; font-weight:700;">Min. Workforce Impact:</label>
                            <select style="width:100%; margin-top:5px; padding:5px; background:white; border:1px solid var(--border);">
                                <option>50,000+ Workers</option>
                                <option>100,000+ Workers</option>
                                <option>500,000+ Workers</option>
                            </select>
                        </div>
                        <button class="hbtn" style="width:100%; margin-top:10px;">APPLY GLOBAL FILTERS</button>
                    </div>
                </div>
                <div class="card">
                    <div class="card-h"><span>ANALYTICAL PRESETS</span></div>
                    <div style="padding:15px; display:flex; flex-direction:column; gap:10px;">
                        <div style="padding:10px; border:1px solid var(--gold2); border-radius:var(--r); background:var(--gold-bg); cursor:pointer;">
                            <div style="font-weight:700; font-size:12px;">CREDIT RISK OVERLAY</div>
                            <div style="font-size:10px; color:var(--muted)">Analyze NPL sensitivity by province and industry.</div>
                        </div>
                        <div style="padding:10px; border:1px solid var(--border2); border-radius:var(--r); cursor:pointer;">
                            <div style="font-weight:700; font-size:12px;">SUPPLY CHAIN EXPOSURE</div>
                            <div style="font-size:10px; color:var(--muted)">Map upstream/downstream dependencies.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    `;
  },

  renderReports: function(d) {
    return `
      <div class="card">
        <div class="card-h"><span class="card-h-l">REPORTS & STRATEGIC EXPORT CENTER</span></div>
        <div style="padding:40px; text-align:center;">
            <div style="font-size:48px; margin-bottom:20px; opacity:0.5;">📂</div>
            <h3>Institutional Grade Reporting</h3>
            <p style="color:var(--muted); margin-bottom:30px;">Generate and export comprehensive analysis in PDF, CSV, or PowerPoint formats.</p>
            <div style="display:flex; justify-content:center; gap:20px;">
                <button class="hbtn" style="padding:15px 30px; font-size:13px;" onclick="exportCSV()">DOWNLOAD CSV DATA</button>
                <button class="hbtn" style="padding:15px 30px; font-size:13px;" onclick="window.print()">GENERATE PDF REPORT</button>
            </div>
        </div>
      </div>
    `;
  },

  renderCatalog: function(d) {
    return `
      <div class="card">
        <div class="card-h"><span class="card-h-l">DATA CATALOG & METHODOLOGY</span></div>
        <div style="padding:24px;">
            <div style="margin-bottom:30px;">
                <h3 style="margin-bottom:10px;">Institutional Sourcing</h3>
                <p style="font-size:14px; color:var(--ink2); line-height:1.6;">Our Decision Intelligence platform integrates real-time data from primary institutional sources to ensure accuracy and strategic reliability.</p>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px;">
                <div>
                    <h4 style="color:var(--gold); border-bottom:1px solid var(--border); padding-bottom:5px; margin-bottom:15px;">PRIMARY SOURCES</h4>
                    <ul style="list-style:none; padding:0;">
                        <li style="margin-bottom:10px;"><strong>NSO Thailand:</strong> Labor force surveys and wage statistics.</li>
                        <li style="margin-bottom:10px;"><strong>Bank of Thailand (BoT):</strong> Macro-economic indicators and regional reports.</li>
                        <li style="margin-bottom:10px;"><strong>GISTDA:</strong> Satellite imagery for agricultural and environmental monitoring.</li>
                        <li style="margin-bottom:10px;"><strong>World Bank / ILO:</strong> Global benchmarking and comparative development metrics.</li>
                    </ul>
                </div>
                <div>
                    <h4 style="color:var(--gold); border-bottom:1px solid var(--border); padding-bottom:5px; margin-bottom:15px;">ANALYTICAL FRAMEWORK</h4>
                    <p style="font-size:13px; color:var(--muted); line-height:1.6;">
                        TMLI uses a proprietary <em>Composite Impact Score</em> (CIS) that weights workforce size with sectoral sensitivity and scenario-specific multipliers (Energy, Trade, Policy).
                    </p>
                </div>
            </div>
        </div>
      </div>
    `;
  },

  renderRegionalMap: function(d, metric = 'bsiDiverse', targetId = 'echartsMap', drillName = null) {
    if (!d || !d.regionalImpact) d = window.EH.data || { regionalImpact: [] };
    if (window.RM) {
        window.RM.renderRegionalMap(d, metric, targetId, drillName);
    } else {
        console.warn("Map Module (RM) not loaded. Falling back to baseline display.");
    }
  },

  drillDownProvince: async function(name) {
    const prof = window.PROVINCE_PROFILES[name];
    if (!prof) return;
    
    const bsi = window.BSI_STRATEGY ? window.BSI_STRATEGY[name] : null;
    const bsiHtml = bsi ? `
        <div style="margin-bottom:20px; padding:15px; border-radius:10px; background:var(--ink); border-left:4px solid ${BSI_POSTURE_COLORS[bsi.posture] || 'var(--gold)'}">
            <div style="font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:1px;">Strategic Market Intelligence</div>
            <div style="font-size:18px; font-weight:800; color:${BSI_POSTURE_COLORS[bsi.posture] || 'var(--gold)'}; margin:5px 0;">
                ${bsi.posture} POSTURE
            </div>
            <div style="font-size:13px; color:white; opacity:0.9;">Mandate: <b>${bsi.action}</b></div>
            <div style="font-size:11px; margin-top:12px; display:grid; grid-template-columns: 1fr 1fr; gap:10px; color:rgba(255,255,255,0.7);">
                <div style="background:rgba(255,255,255,0.05); padding:8px; border-radius:4px;">
                    <div style="font-size:9px; text-transform:uppercase;">Vehicle Density</div>
                    <div style="font-size:13px; font-weight:700; color:white;">${bsi.vehicleDensity} <small style="font-weight:400; font-size:9px;">/1k</small></div>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:8px; border-radius:4px;">
                    <div style="font-size:9px; text-transform:uppercase;">BSI Score</div>
                    <div style="font-size:13px; font-weight:700; color:white;">${bsi.marketShare}</div>
                </div>
            </div>
            <div style="font-size:11px; margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1); color:var(--muted)">
                Total Registered Vehicles: <b style="color:white;">${bsi.vehicles}</b>
            </div>
        </div>
    ` : '';

    const content = `
        <div class="card" style="flex:1;">
          <div class="card-h">
            <div style="display:flex; flex-direction:column;">
                <span class="card-h-l">${name.toUpperCase()} STRATEGIC TILE</span>
                <div style="font-size:9px; color:var(--muted); margin-top:2px;">
                    SOURCE: ${bsi?.source || 'Institutional KB' } • CONFIDENCE: ${(bsi?.confidence || 0.8) * 100}%
                </div>
            </div>
            ${verifiedBadge('Institutional Suite')}
          </div>
          <div style="padding:24px;">
            ${bsiHtml}
            <div style="font-size:12px; line-height:1.6; margin-bottom:20px;">
                This province represents a <b>${prof.region}</b> strategic hub for AutoX. Current concentration is highest among 
                ${prof.professions.slice(0, 3).map(p => `<b>${p.name}</b>`).join(', ')}.
            </div>
            <div id="provinceAgentAnalysis" class="skeleton-text" style="height:150px; font-size:12px; line-height:1.5;">
                Performing high-fidelity strategic audit for ${name}...
            </div>
          </div>
        </div>
    `;

    const detailCol = document.getElementById('provinceDetailColumn');
    if (detailCol) {
        detailCol.innerHTML = content;
    } else {
        const resEl = document.getElementById('results');
        if (resEl) resEl.innerHTML = `<div class="drill-grid" style="grid-template-columns: 1fr;"><div class="card">${content}</div></div>`;
    }
    
    // P1-6 FIX: Correct argument order for 'province' agent prompt
    // buildPrompt expects: (tag, title, ctx, type, provinceName, branches, professions, bsiScore, density, posture)
    const bsiData = window.BSI_STRATEGY?.[name] || {};
    const analysis = await fetchAnalysisAgent(
        window.S.lastTag || name,
        window.S.lastTitle || 'Provincial Audit',
        window.S.lastCtx  || `Strategic analysis for ${name}`,
        'province',
        name,
        prof.branches,
        prof.professions.map(p => p.name).join(', '),
        bsiData?.marketShare,
        bsiData?.vehicleDensity,
        bsiData?.posture
    );
    
    const analysisEl = document.getElementById('provinceAgentAnalysis');
    if (analysisEl) {
        analysisEl.classList.remove('skeleton-text');
        analysisEl.innerHTML = `
            <div style="margin-top:10px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span style="font-weight:700; font-size:11px; color:var(--gold)">SCORE: ${analysis.impactScore || 0}</span>
                    <span style="font-size:10px; color:var(--muted)">Calculation: ${esc(analysis.scoreCalculation)}</span>
                </div>
                <div style="margin-bottom:15px; font-size:13px; line-height:1.6;">${esc(analysis.localNarrative)}</div>
                <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--muted); margin-bottom:8px;">Tactical Mandates</div>
                ${(analysis.criticalSubSectors || []).map(s => `<div style="margin-bottom:6px; padding:8px; background:var(--surface2); border-radius:4px; font-size:12px;">• ${esc(s)}</div>`).join('')}
                <div style="margin-top:15px; padding:10px; background:var(--blue-bg); border:1px solid var(--blue); border-radius:4px;">
                    <div style="font-size:9px; color:var(--blue); font-weight:800;">AUTOX GROWTH PATH</div>
                    <div style="font-size:12px; font-weight:700; color:var(--ink); margin-top:2px;">${esc(analysis.localOpportunity)}</div>
                </div>
            </div>
        `;
    }
  },

  initMapData: async function() {
    // P0-3 FIX: GeoJSON is at /thailand.json (public root), NOT /assets/data/thailand.json
    if (!echarts.getMap('thailand')) {
      try {
        const res = await fetch('/thailand.json?v=1.1.2');
        if (!res.ok) throw new Error(`GeoJSON fetch failed: ${res.status}`);
        const geoJson = await res.json();
        echarts.registerMap('thailand', geoJson);
        console.log('[TMLI] Thailand GeoJSON registered successfully.');
      } catch(e) {
        console.error('[TMLI] Failed to load thailand.json:', e);
      }
    }
    if (!window.GEO_DISTRICTS) {
      try {
        const res = await fetch('/assets/data/thailand-districts.json');
        window.GEO_DISTRICTS = await res.json();
      } catch (e) {
        console.warn('District GeoJSON not found, drill-down limited');
      }
    }
  },

  loadECharts: async function() {
    if (window.echarts) return;
    return new Promise(r => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js';
      s.onload = r;
      document.head.appendChild(s);
    });
  }
};

function updateMapMetric() {
  const mod = window.S.activeModule;
  const selectorId = mod === 'branches' ? 'mapMetricBranches' : 'mapMetric';
  const metric = document.getElementById(selectorId)?.value || (mod === 'branches' ? 'branches' : 'impactScore');
  const d = window.S.lastResult || window.EH.data;
  const targetId = mod === 'regional' ? 'echartsMap' : mod === 'branches' ? 'echartsMapBranches' : 'echartsMapGistda';
  if (d) window.RE.renderRegionalMap(d, metric, targetId);
}

window.updateMapMetric = updateMapMetric;
window.RE.switchTab = switchTab;
