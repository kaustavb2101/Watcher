/**
 * TMLI Main Application Logic
 * Manages global state, initialization, and UI event orchestration.
 */

/* GLOBAL STATE */
window.S = {
  activeTab: 'overview',
  compareMode: false,
  selectedEvents: [],
  compareList: [],
  lastResult: null,
  lastTag: '',
  lastTitle: '',
  lastCtx: '',
  abortCtrl: new AbortController(), // Safe default prevents null crash on early fetch calls
  activeModule: 'executive',
  apiKey: '',
  dataMode: 'fallback', // Track live vs fallback data source status
  bsiData: null, // Branch Strategic Intelligence Cache
  provincialStrategy: {} // Processed strategies per province
};

window.NABCPrices = {};
const MOCK_MODE = false;
const MOCK_RESULT = { overallSentiment: 'MIXED', impactScore: -12 };

/* INITIALIZATION */
async function init() {
  console.log("TMLI Phase 9: Executive Summary Initializing (Bug Hunter Mode)...");
  
  try {
    // Initialize Clock
    setInterval(tick, 1000);
    tick();

    await fetchNABCPrices();
    renderEvents();
    
    // Modular Initialization (Phase 9 RE-Sync)
    if (window.RE && window.RE.initMapData) {
        await window.RE.initMapData();
    } else {
        console.warn("RE Module not ready, map init deferred.");
    }
    
    // INITIALIZE BSI (Government Data Grounding)
    await initBSI();
    
    showHome();
    
    if (window.TMLI_TELEMETRY) window.TMLI_TELEMETRY.record('System-Init', 0, 'OK', 'Main-Loop');
  } catch (err) {
    console.error("CRITICAL INITIALIZATION FAILURE:", err);
    if (window.TMLI_TELEMETRY) window.TMLI_TELEMETRY.record('System-Init', 0, 'CRITICAL', err.message);
    showToast('System Recovery Mode Active. Please Refresh.', 'error');
  }
}

/**
 * BSI ORCHESTRATOR
 * Fetches and maps gov datasets to our provincial profiles.
 */
async function initBSI() {
  console.log("Fetching Government Macro Data...");
  try {
    const raw = await API.getBSIBaseline();
    S.bsiData = raw;
    // Inject DLT KB records from the data-enrichment grounding cache if available
    // or directly from a client-side fetch of the DLT KB via the API pathway.
    // The BSI endpoint returns dltMonthly from data.go.th; we supplement with KB records
    // by calling data-enrichment with a 'dlt-kb' probe.
    if (!raw.dltRecords) {
        try {
            const dltKbResp = await fetch('/api/data-enrichment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'dlt-kb-probe' }),
                signal: S.abortCtrl?.signal
            });
            if (dltKbResp.ok) {
                const dltKbData = await dltKbResp.json();
                raw.dltRecords = dltKbData.dltRecords || [];
            }
        } catch (e) {
            console.warn('DLT KB probe failed, using API-only DLT data.', e);
        }
    }
    mapBSIDatasets(raw);
    console.log("BSI Processed Successfully.", Object.keys(window.BSI_STRATEGY || {}).length, "provinces mapped.");
  } catch (err) {
    console.error("BSI Initialization Failed", err);
  }
}

function normalizeProvinceName(name) {
    if (!name) return "";
    return name.replace(/\sProvince$/i, '')
               .replace(/\sMetropolis$/i, '')
               .replace(/Phra Nakhon Si Ayutthaya/i, "Ayutthaya")
               .replace(/Chon Buri/i, "Chonburi")
               .replace(/Lop Buri/i, "Lopburi")
               .replace(/Suphan Buri/i, "Suphanburi")
               .replace(/Buri Ram/i, "Buriram")
               .replace(/Sakon Nakhon/i, "Sakon Nakhon")
               .replace(/Si Sa Ket/i, "Sisaket")
               .replace(/Prachin Buri/i, "Prachinburi")
               .trim();
}

function mapBSIDatasets(raw) {
    const strategyCache = {};
    const normalizedPop = (raw.pop || []).map(p => ({ ...p, norm: normalizeProvinceName(p.province_name_en || p.province) }));
    
    // DLT KB: records have { province, category, count }
    // Build a provincial vehicle totals map by summing all categories per province
    const dltByProvince = {};
    (raw.dltRecords || []).forEach(r => {
        const normProv = normalizeProvinceName(r.province);
        if (!dltByProvince[normProv]) dltByProvince[normProv] = 0;
        dltByProvince[normProv] += parseFloat(r.count || 0);
    });
    
    // Also try raw.dltMonthly for any legacy monthly aggregate data
    const normalizedDlt = (raw.dltMonthly || []).map(d => ({ ...d, norm: normalizeProvinceName(d.province_en || d.province) }));

    for (const [name, prof] of Object.entries(window.PROVINCE_PROFILES)) {
        const normName = normalizeProvinceName(name);
        const branches = prof.branches || 0;
        
        // 1. Population Match
        const popData = normalizedPop.find(p => p.norm === normName);
        const population = popData ? (parseFloat(popData.total_population) || 1000000) : 1000000;
        
        // 2. DLT Vehicle Match — prefer provincial KB aggregate, fallback to monthly API
        let vehicles = dltByProvince[normName] || 0;
        if (!vehicles) {
            const dltData = normalizedDlt.find(d => d.norm === normName);
            vehicles = dltData ? (parseFloat(dltData.size) || parseFloat(dltData.total_registered) || parseFloat(dltData.count) || 50000) : 50000;
        }
        if (!vehicles) vehicles = 50000; // Hard fallback
        
        // 3. GISTDA Satellite Match
        const gistdaData = (raw.gistdaAgriData || []).find(g => normalizeProvinceName(g.province) === normName);
        const gistdaAnomaly = gistdaData ? (gistdaData.anomaly || 'Stable') : 'Baseline';
        
        // 4. Metrics Calculation
        const penetration = (branches / population) * 100000;
        const vehicleDensity = (vehicles / population) * 1000;
        const marketShare = (branches / (vehicles / 1000)) * 10;
        
        // 5. Strategic Logic (Based on Vehicle Penetration & Satellite Risk)
        let posture = 'STABLE';
        let action = 'Maintain operations';
        
        if (vehicleDensity > 450) {
            posture = 'EXPANSION';
            action = 'High Mobility Demand: Launch EV Title Loans';
        } else if (marketShare < 0.3 || (gistdaAnomaly.toLowerCase().includes('drought'))) {
            posture = 'CAUTIOUS';
            action = gistdaAnomaly.includes('Drought') ? 'Agri-Risk: Monitor crop-linked defaults' : 'Low Penetration: Inspect NPL risk';
        }
        
        strategyCache[name] = {
            branches,
            population,
            vehicles: vehicles.toLocaleString(),
            penetration: penetration.toFixed(2),
            vehicleDensity: vehicleDensity.toFixed(2),
            marketShare: marketShare.toFixed(3),
            gistdaAnomaly,
            posture,
            action,
            riskScore: Math.round(100 - (vehicleDensity / 10))
        };
    }
    window.BSI_STRATEGY = strategyCache;
}

function tick() {
  const now = new Date();
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  const el = document.getElementById('clock');
  if (el) el.textContent = now.toLocaleString('en-US', options).toUpperCase();
}

document.addEventListener('DOMContentLoaded', init);

/* EVENT HANDLERS */
function renderEvents() {
  const grid = document.getElementById('eventGrid');
  if (!grid || !window.EVENTS) return;
  grid.innerHTML = Object.values(window.EVENTS).map(ev => `
    <div class="ec" onclick="selEvent(this, '${esc(ev.tag)}')">
      <div style="display:flex; justify-content:space-between">
        <div class="ec-tag">${esc(ev.tag)}</div>
        ${ev.isNew ? '<div class="ec-new">NEW</div>' : ''}
      </div>
      <div class="ec-t">${esc(ev.title)}</div>
      <div class="ec-d">${esc(ev.desc || '')}</div>
      <div class="ec-cmp" onclick="event.stopPropagation(); toggleCompare(event, this, '${esc(ev.title)}')">
        <div class="ec-cmp-box"></div> <span>Compare</span>
      </div>
    </div>
  `).join('');
  updateCount(Object.keys(window.EVENTS).length);
}

window.filterEvents = function(q) {
  const query = q.toLowerCase();
  let count = 0;
  document.querySelectorAll('.ec').forEach(el => {
    const text = el.textContent.toLowerCase();
    const match = text.includes(query);
    el.style.display = match ? '' : 'none';
    if (match) count++;
  });
  updateCount(count);
};

function updateCount(n) {
  const el = document.getElementById('eventCount');
  if (el) el.textContent = `${n} SCENARIOS LOADED`;
}

window.toggleCompare = function(e, el, title) {
  e.stopPropagation();
  const card = el.closest('.ec');
  const tag = card.querySelector('.ec-tag').textContent;
  const ctx = Object.values(window.EVENTS).find(ev => ev.title === title)?.ctx || '';
  
  const idx = S.compareList.findIndex(x => x.title === title);
  if (idx > -1) {
    S.compareList.splice(idx, 1);
    el.classList.remove('on');
  } else {
    if (S.compareList.length >= 4) {
      showToast('Maximum 4 scenarios for comparison', 'error');
      return;
    }
    S.compareList.push({ tag, title, ctx });
    el.classList.add('on');
  }
  updateComparePanel();
};

function updateComparePanel() {
  const panel = document.getElementById('comparePanel');
  const list = document.getElementById('compareList');
  if (!panel || !list) return;

  if (S.compareList.length > 0) {
    panel.classList.add('show');
    list.innerHTML = S.compareList.map(item => `
      <div class="cpill" onclick="clickPill('${esc(item.title)}')">
        <span class="cpill-t">${esc(item.title)}</span>
        <span class="cpill-x" onclick="event.stopPropagation(); removeCompare('${esc(item.title)}')">&times;</span>
      </div>
    `).join('');
    
    const runBtn = document.getElementById('runCompareBtn');
    if (runBtn) {
       runBtn.style.display = S.compareList.length > 1 ? 'flex' : 'none';
       runBtn.textContent = S.compareList.length === 1 ? 'SELECT ANOTHER' : `ANALYZE ${S.compareList.length} SCENARIOS`;
    }
  } else {
    panel.classList.remove('show');
  }
}

window.removeCompare = function(title) {
  const idx = S.compareList.findIndex(x => x.title === title);
  if (idx > -1) S.compareList.splice(idx, 1);
  
  // Update UI cards
  document.querySelectorAll('.ec').forEach(card => {
    if (card.querySelector('.ec-t').textContent === title) {
      card.querySelector('.ec-cmp').classList.remove('on');
    }
  });
  updateComparePanel();
};

window.clearCompare = function() {
  S.compareList = [];
  document.querySelectorAll('.ec-cmp').forEach(el => el.classList.remove('on'));
  updateComparePanel();
};

window.clickPill = function(title) {
  const ev = Object.values(window.EVENTS).find(e => e.title === title);
  if (ev) runAnalysis(ev.tag, ev.title, ev.ctx, null);
};

/**
 * Event Selection Handler (Bridge from index.html)
 */
function selEvent(el, eventKey) {
  const ev = window.EVENTS ? window.EVENTS[eventKey] : null;
  if (!ev) {
    console.error("Scenario data not found for:", eventKey);
    return;
  }
  runAnalysis(ev.tag, ev.title, ev.ctx, el);
}

window.selEvent = selEvent;

// NOTE: Primary switchGlobalTab and showHome are defined below (lines 376+)
// This stub has been removed to prevent duplicate declaration overwrite.

// NOTE: Primary showHome is defined below. This duplicate stub has been removed.

window.runCustom = function() {
  const tag = document.getElementById('customTag').value || 'CUSTOM';
  const title = document.getElementById('customTitle').value;
  const ctx = document.getElementById('customCtx').value;
  if (!title || !ctx) {
    showToast('Please enter title and context', 'error');
    return;
  }
  runAnalysis(tag, title, ctx, null);
};

window.runCompare = async function() {
  if (S.compareList.length < 2) return;
  const tag = "COMPARISON";
  const title = S.compareList.map(x => x.title).join(" vs ");
  const ctx = "Direct comparative analysis of the selected scenarios: " + S.compareList.map(x => `[${x.tag}] ${x.title}`).join(", ");
  
  // Transition to Synergy mode
  hide('emptyState', 'errorState', 'results'); show('loadState');
  document.getElementById('loadState').classList.add('vis');
  
  try {
    const data = await fetchAnalysisAgent(tag, title, ctx, 'synergy');
    S.lastResult = data;
    document.getElementById('loadState').classList.remove('vis');
    RE.renderModule('overview', data); // Render into overview as synergy
  } catch (err) {
    showError(err);
  }
};

async function runAnalysis(tag, title, ctx, el) {
  if (el) { 
    document.querySelectorAll('.ec').forEach(x => x.classList.remove('active')); 
    el.classList.add('active'); 
  }
  hide('emptyState', 'errorState', 'results'); show('loadState');
  const loadEl = document.getElementById('loadState');
  if (loadEl) loadEl.classList.add('vis');
  
  S.lastTag = tag; S.lastTitle = title; S.lastCtx = ctx;
  S.abortCtrl = new AbortController();

  let stepIdx = 0;
  const stepEl = document.getElementById('loadStep');
  if (stepEl) stepEl.textContent = STEPS[0];
  
  const stepTimer = setInterval(() => {
    stepIdx = Math.min(stepIdx + 1, STEPS.length - 1);
    const pct = Math.round((stepIdx / (STEPS.length - 1)) * 100);
    if (stepEl) stepEl.textContent = `[${pct}%] ${STEPS[stepIdx]}`;
  }, 400);

  try {
    const agents = ['overview', 'labor', 'commodities', 'strategy'];
    const results = {};
    await Promise.all(agents.map(async agentType => {
      results[agentType] = await fetchAnalysisAgent(tag, title, ctx, agentType);
    }));
    clearInterval(stepTimer);
    const data = {}; Object.values(results).forEach(r => Object.assign(data, r));
    S.lastResult = data;
    if (loadEl) loadEl.classList.remove('vis');
    // Update Header Status
    updateSystemStatus(data.grounding);
    updateHeaderMetrics(data);
    
    RE.renderModule(S.activeModule, data);
  } catch (err) {
    clearInterval(stepTimer);
    if (loadEl) loadEl.classList.remove('vis');
    showError(err);
  }
}

/**
 * Global Navigation Switcher
 */
window.switchGlobalTab = function(module, el) {
    S.activeModule = module;
    
    // UI Update: Highlight active nav item
    document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('on'));
    if (el) el.classList.add('on');
    else {
        // Find by text or data-mod if needed, but showHome handles its own
    }

    // View Orchestration
    if (module === 'executive') {
        window.showHome(el);
    } else {
        const data = S.lastResult || EH.data;
        if (data) {
            RE.renderModule(module, data);
        } else {
            // If no data, show empty or load baseline
            EH.init().then(() => {
                RE.renderModule(module, S.lastResult || EH.data);
            });
        }
    }
}

/**
 * Switch back to Executive Home view
 */
window.showHome = function(el) {
  S.activeModule = 'executive';
  document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('on'));
  const homeBtn = el || document.querySelector('.nav-item:first-child');
  if (homeBtn) homeBtn.classList.add('on');
  
  // document.querySelectorAll('.ec').forEach(x => x.classList.remove('active'));
  hide('errorState', 'loadState', 'emptyState');
  EH.init().then(data => RE.renderExecutive(data));
}

/* UTILITIES */
window.exportCSV = function() {
  if (!S.lastResult) {
    showToast('No analysis to export yet', 'error');
    return;
  }
  const d = S.lastResult;
  const rows = [['Profession', 'Worker Count', 'Avg Wage', 'Impact Score', 'Risk Level', 'Immediate Impact', 'Medium Term']];
  (d.professions || []).forEach(p => rows.push([p.name || '', p.workerCount || '', p.avgWage || '', p.impactScore || '', p.riskLevel || '', (p.immediateImpact || '').replace(/,/g, ';'), (p.mediumTermImpact || '').replace(/,/g, ';')]));
  rows.push([]);
  rows.push(['Industry', 'GDP Share', 'Workforce', 'Impact Score', 'Verdict']);
  (d.industries || []).forEach(i => rows.push([i.name || '', i.gdpShare || '', i.workforceSize || '', i.impactScore || '', i.verdict || '']));
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `thai-labor-analysis-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
  showToast('✓ CSV exported', 'ok');
};

window.generateExecutiveReport = function() {
  const d = S.lastResult;
  if (!d) return;
  let cover = document.getElementById('print-cover');
  if (!cover) {
    cover = document.createElement('div');
    cover.id = 'print-cover';
    cover.className = 'print-only cover-sheet';
    document.body.prepend(cover);
  }
  cover.innerHTML = `
    <div class="cover-logo">AutoX Macro-Intelligence</div>
    <div class="cover-title">STRATEGIC IMPACT ANALYSIS:<br>${esc(S.lastTitle)}</div>
    <div class="cover-meta">
      DOCUMENT ID: AX-${Date.now().toString(36).toUpperCase()}<br>
      DATE GENERATED: ${new Date().toLocaleDateString('en-TH', { year:'numeric', month:'long', day:'numeric' })}<br>
      CONFIDENTIAL STRATEGY REPORT for BOARD OF DIRECTORS
    </div>
  `;
  document.querySelectorAll('.pane').forEach(p => p.classList.add('on'));
  showToast('Preparing board-ready report...', 'ok');
  setTimeout(() => {
    window.print();
    document.querySelectorAll('.pane').forEach(p => { if (p.id !== 'pane-overview') p.classList.remove('on'); });
  }, 500);
};

window.drillDownProvince = async function(name, region) {
  window.lastProvince = name;
  const profile = PROVINCE_PROFILES[name] || PROVINCE_PROFILES[name.replace(' Province', '')] || { branches: 0, professions: [] };
  const branches = profile.branches;
  const professions = (profile.professions || []).map(p => `${p.name} (${fmtNum(p.population)})`).join(', ');

  const provEl = document.getElementById('dd-province');
  const regEl = document.getElementById('dd-region');
  if (provEl) provEl.innerText = name;
  if (regEl) regEl.innerText = `${(region || 'THAILAND').toUpperCase()} · ${branches} NGERN CHAIYO BRANCHES`;
  
  const content = document.getElementById('dd-content');
  if (!content) return;
  content.innerHTML = `<div class="dd-ai-row">
    <div class="dd-ai-t">AI STRATEGIC DEEP-DIVE (FOR ${branches} BRANCHES IN ${name.toUpperCase()})</div>
    <div style="font-size:10px; color:var(--muted); margin-bottom:10px; line-height:1.4">PREDOMINANT PROFESSIONS & POPULATION:<br> ${professions.toUpperCase()}</div>
    <div class="skeleton" style="height:110px; margin-bottom:15px"></div>
    <div class="skeleton" style="height:70px"></div>
  </div>`;
  const overlay = document.getElementById('dd-overlay');
  if (overlay) overlay.classList.add('vis');
  
  try {
    const d = await fetchAnalysisAgent(S.lastTag, S.lastTitle, S.lastCtx, 'province', name, branches, professions);
    const score = d.impactScore || 0;
    const color = scoreColor(score);
    content.innerHTML = `
      <div class="dd-ai-row">
        <div style="font-size:10px; color:var(--muted); margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px; line-height:1.4">PREDOMINANT PROFESSIONS & POPULATION:<br> ${professions.toUpperCase()}</div>
        <div class="dd-ai-t">PROVINCIAL IMPACT SCORE</div>
        <div style="font-size:32px; font-weight:900; color:${color}; margin-bottom:4px">${sign(score)}${score}</div>
        <div class="dd-badge risk" style="background:${color}11; color:${color}; border-color:${color}44">${score > 0 ? 'FAVORABLE' : score < -50 ? 'CRITICAL EXPOSURE' : 'MODERATE RISK'}</div>
        <div class="dd-ai-t" style="margin-top:20px">LOCAL ANALYSIS</div>
        <div class="dd-card" style="border-left:3px solid ${color}">${esc(d.localNarrative || 'Data unavailable.')}</div>
        <div class="dd-ai-t">CRITICAL LOCAL SECTORS (Pertinent to Ngern Chaiyo)</div>
        <ul style="padding-left:18px; margin-bottom:20px; color:var(--muted); font-size:13px">
          ${(d.criticalSubSectors || []).map(s => `<li>${esc(s)}</li>`).join('')}
        </ul>
        <div class="dd-ai-t">AUTOX BRANCH STRATEGY (${branches} LOCATIONS)</div>
        <div class="dd-card" style="border-left:3px solid var(--gold); background:rgba(212,171,82,0.05)">
          <strong>NGERN CHAIYO POSTURE:</strong> ${esc(d.autoXStrategy || '')}
          <div style="margin-top:8px; font-size:12px; opacity:0.8">💡 <b>Opportunity for ${name}:</b> ${esc(d.localOpportunity || '')}</div>
        </div>
      </div>
    `;
  } catch (e) {
    content.innerHTML = `<div style="color:var(--red); padding:20px; text-align:center">Failed to generate province-level analysis for ${name}. Please retry.</div>`;
  }
};

window.closeDrillDown = function() {
  const overlay = document.getElementById('dd-overlay');
  if (overlay) overlay.classList.remove('vis');
};

function updateSystemStatus(grounding) {
    if (!grounding) return;
    
    const dots = {
        bot: document.getElementById('dot-bot'),
        gistda: document.getElementById('dot-gistda'),
        nso: document.getElementById('dot-nso'),
        dlt: document.getElementById('dot-dlt')
    };
    
    // BOT Status: Use dataMode from the global result's grounding context
    const hasBotData = !!(window.S.lastResult?.botPolicyRate || window.S.lastResult?.botUsdThb);
    if (hasBotData) S.dataMode = 'live';
    if (dots.bot) {
        dots.bot.className = 'pillar-dot' + (hasBotData ? ' live' : ' fallback');
    }
    
    // GISTDA Status
    if (dots.gistda) {
        const isGrounded = grounding.satellite && grounding.satellite.length > 0;
        dots.gistda.className = 'pillar-dot' + (isGrounded ? ' live' : ' fallback');
    }
    
    // NSO Status — KB grounded (always available via edge KB)
    if (dots.nso) {
        dots.nso.className = 'pillar-dot live';
    }
    
    // DLT Status — Check KnowledgeBase vehicle total from enrichment grounding
    if (dots.dlt) {
        const hasDlt = grounding.dlt && grounding.dlt.cumulative && grounding.dlt.cumulative.total > 0;
        dots.dlt.className = 'pillar-dot' + (hasDlt ? ' live' : ' fallback');
    }
}

function updateHeaderMetrics(d) {
    const rateEl = document.querySelector('#fig-rate .val');
    const fxEl = document.querySelector('#fig-fx .val');
    const nplEl = document.querySelector('#fig-npl .val');
    
    // BOT data is emitted at the top-level result object (merged from data-enrichment)
    // data-enrichment returns botPolicyRate/botUsdThb/botNplRatio directly
    const botRate = d.botPolicyRate || d.grounding?.botPolicyRate;
    const botFx   = d.botUsdThb   || d.grounding?.botUsdThb;
    const botNpl  = d.botNplRatio  || d.grounding?.botNplRatio;
    
    if (rateEl && botRate) {
        rateEl.textContent = `${botRate.value}%`;
        rateEl.className = 'val ' + (botRate.value > 2.0 ? 'up' : 'down');
    }
    
    if (fxEl && botFx) {
        fxEl.textContent = Number(botFx.value).toFixed(2);
        fxEl.className = 'val ' + (botFx.value > 35 ? 'up' : 'down');
    }
    
    if (nplEl) {
        nplEl.textContent = botNpl ? `${botNpl.value}%` : '1.2%';
    }
}

function hide(...ids) { ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; }); }
function show(...ids) { ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = ''; }); }

async function loadECharts() {
  if (window.echarts) return;
  return new Promise(resolve => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
    s.onload = resolve;
    document.head.appendChild(s);
  });
}
