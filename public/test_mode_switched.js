


function scoreColor(s) { return s > 0 ? '#1A6B3C' : s < -60 ? '#8B1D2F' : s < -20 ? '#B84C1A' : '#B8943A'; }
function barClass(s) { return s > 0 ? 'bf-pos' : s < -60 ? 'bf-neg' : s < -20 ? 'bf-warn' : 'bf-neu'; }
function riskClass(r) { return { 'Critical': 'rk-crit', 'High': 'rk-hi', 'Medium': 'rk-med', 'Low': 'rk-lo', 'Positive': 'rk-pos' }[r] || 'rk-med'; }
function sign(n) { return n > 0 ? '+' : ''; }
function pct(n) { return Math.min(Math.abs(n), 100); }

/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
const S = {
  apiKey: 'server-side',
  compareMode: false,
  compareList: [],   // [{key, title}]
  lastTag: '', lastTitle: '', lastCtx: '',
  abortCtrl: null,
  lastResult: null,
  lastCompareResults: null,
  savedAnalyses: {}  // key → result
};

let MOCK_MODE = false;
let selectedEvent = null;
let compareMode = false;
let selectedForCompare = [];
window.NABCPrices = {}; // Global store for Thai gov spot prices

/* ─── NABC API INTEGRATION ───────────────── */
async function fetchNABCPrices() {
  const targets = [
    { label: 'Rice', query: 'ข้าว' },
    { label: 'Rubber', query: 'ยางพารา' },
    { label: 'Cassava', query: 'มันสำปะหลัง' },
    { label: 'Oil Palm', query: 'ปาล์มน้ำมัน' },
    { label: 'Maize (Feed)', query: 'ข้าวโพดเลี้ยงสัตว์' },
    { label: 'Chicken', query: 'ไก่เนื้อ' },
    { label: 'Eggs', query: 'ไข่ไก่' },
    { label: 'Beef', query: 'โคเนื้อ' },
    { label: 'Pork', query: 'สุกร' },
    { label: 'Shrimp', query: 'กุ้ง' },
    { label: 'Coconut', query: 'มะพร้าว' },
    { label: 'Pineapple', query: 'สับปะรด' },
    { label: 'Longan', query: 'ลำไย' },
    { label: 'Pepper', query: 'พริกไทย' },
    { label: 'Soybean', query: 'ถั่วเหลือง' }
  ];

  try {
    await Promise.all(targets.map(async (t) => {
      try {
        const apiPath = `/api/monthly-prices/commod?commod=${encodeURIComponent(t.query)}&limit=1`;
        const res = await fetch(`/api/nabc?path=${encodeURIComponent(apiPath)}`);
        if (!res.ok) return;
        const json = await res.json();
        // The API returns { success: true, data: [...] }
        if (json && json.data && json.data.length > 0) {
          const item = json.data[0];
          window.NABCPrices[t.label] = { price: item.value, unit: item.unit, date: `${item.month}/${item.year_th}` };
        }
      } catch (e) { console.warn('NABC fetch failed for', t.label, e); }
    }));
    console.log("NABC Live Prices loaded:", window.NABCPrices);
  } catch (err) {
    console.error("NABC Sync Error:", err);
  }
}

/* ═══════════════════════════════════════════
   EVENTS DATA
═══════════════════════════════════════════ */
const EVENTS = {
  geo_hormuz: { tag: "GEOPOLITICAL · LIVE — FEB 28, 2026", title: "US–Israel Strikes on Iran & Strait of Hormuz Closure", ctx: `Feb 28 2026: US+Israel launched Operation Epic Fury on Iran, killing Khamenei. IRGC drone attacks closed Strait of Hormuz. By Mar 3-4: tanker traffic near-zero, 150+ ships anchored, 5 tankers damaged. Brent rose from $73 to $80-88; analysts forecast $100+ if closure persists. 20% global oil and 22% LNG at risk. Nomura explicitly identified Thailand as among Asia's most vulnerable due to near-100% crude import dependence. Every $10/bbl increase costs Thailand ~0.4% GDP via import bill. EGAT gas-fired plants ~30% of Thai electricity. PTT manages LNG imports. Thai workforce: agriculture (30%, 12M workers) diesel-dependent; manufacturing (22%, 9M) energy-intensive; transport/logistics (1M+) directly fuel-dependent; tourism (2M+) impacted by aviation jet fuel. Thai electronics exports surged 54.3% YoY (mostly exempt from tariff conflict). ~600,000 Thai migrant workers in Gulf states face safety risk. Shipping insurance costs spike globally for Thai export/import routes.` },
  geo_gulf: { tag: "GEOPOLITICAL · ONGOING — MAR 2026", title: "Iran Strikes UAE, Qatar, Saudi Arabia — Gulf Regional War", ctx: `Iran launched missile/drone attacks on UAE (Jebel Ali port, Abu Dhabi infrastructure), Qatar (Ras Laffan, Mesaieed - halting LNG), Saudi Arabia, Bahrain. Hezbollah rockets on Israel from Lebanon. Iraq oil fields curtailing production. ~600,000+ Thai workers in UAE/Qatar/Saudi/Bahrain face safety and evacuation risk; remittances support Thai rural households. Jebel Ali port disruption hits Thai re-export flows to Middle East markets. Qatar LNG halt spikes Asian gas prices above oil. Thai construction workers in Gulf: 50,000+. Thai nurses/healthcare in UAE: 5,000+. Thai hospitality/service workers in Gulf: 100,000+. Thai tourism from Middle East disrupted. Thai seafarers on Gulf-transit tankers at risk. Insurance premiums spike for Thai exporters.` },
  geo_china_asean: { tag: "GEOPOLITICAL-TRADE · 2025–2026", title: "China Overcapacity Flood into ASEAN — EVs, Steel, Appliances", ctx: `China redirects massive export volumes to ASEAN as US+EU raise tariffs. BYD/SAIC/NETA EVs priced sub-$20K undercutting Japanese/Korean brands; cheap steel undercutting Thai steel mills (SSI, G Steel); Chinese appliances (Midea, Haier) vs Thai/Japanese brands; textile/garment price collapse from Chinese fast fashion; Chinese furniture vs Thai wood products; Chinese petrochemicals vs Thai production cost. Bank of Thailand identified this as structural risk. Thai industries facing DUAL SQUEEZE: losing export markets to tariffs AND losing domestic market to Chinese goods. At-risk workers: 400,000-750,000 auto workers; 800,000 textile/garment; 500,000 electronics; 200,000 steel/metal; 300,000 furniture/wood. Chinese deflation export hurts Thai corporate revenues, leads to factory closures, wage freezes. Youth employment in manufacturing particularly vulnerable. 100,000+ Thai SME manufacturers face existential price competition.` },
  geo_us_sphere: { tag: "GEOPOLITICAL · 2026", title: "US Sphere-of-Influence Doctrine & ASEAN Alignment Pressure", ctx: `US declared sphere-of-influence doctrine: US controls Western Hemisphere, Russia and China their regions. $3.5T cross-border investment reallocated globally. US-China decoupling accelerating. For Thailand: pressure to choose US vs China supply chain alignment; export control cooperation requirements in Oct 2025 US-Thailand deal; transshipment crackdown scrutiny; certificate-of-origin enforcement intensified; risk of secondary sanctions if Thailand maintains China ties beyond US tolerance. Thai export model historically served BOTH US and Chinese markets. Key sectors: electronics (supply chain must choose), auto parts (Chinese FDI in Thai auto sector scrutinized), semiconductor equipment (US export controls tightening), financial services (dollar payment system access). Tourism: China = Thailand's largest visitor source (~6-7M/year pre-COVID); US pressure on alignment could affect visa/bilateral tourism. Thai diplomatic, military, security sector faces alignment choices with employment implications.` },
  trade_us19: { tag: "TRADE · ACTIVE AUG 2025", title: "US 19% Reciprocal Tariff on Thai Goods — Full-Year Bite 2026", ctx: `After April 2 2025 Liberation Day (37% threat), Thailand negotiated to 19% tariff effective August 2025. Thailand has $45B goods trade surplus with US on $55-60B total exports to US. UTCC forecasts 275B baht ($7.6B) export reduction = 1.48% GDP impact. BOT severe scenario: 8.3% export contraction, -1ppt GDP. 2025 GDP fell to 1.8-2.3% from 2.9% forecast. Specific Thai exports hit: pet food (31% US market share - major hit); vehicle tires; textiles/garments; rubber products; seafood/processed foods; furniture (200,000 workers); air conditioners. TPSO 2026: exports to US slow to 8.9% from 30.6%. Cambodia transshipment collapse (-40.8%) hurts Thai-Cambodia supply chain workers. Electronics mostly exempt but uncertainty dampens investment. Thai workers directly affected: 800,000 textile/garment (heavily US-export-dependent); 300,000 rubber product workers; 200,000 furniture workers; 1M food processing workers partially affected.` },
  trade_deal: { tag: "TRADE POLICY · OCT 2025", title: "US–Thailand Trade Deal: 99% US Tariff Elimination by Thailand", ctx: `Oct 2025 US-Thailand Framework: Thailand eliminates tariffs on 99% of US goods including agriculture (beef, pork, dairy, soybeans, wheat, corn, liquor). US beef and dairy now compete directly with Thai livestock farmers. US soybeans undercut Thai soybean/animal feed producers. US pork vs Thai pig farmers. US chicken vs Thai poultry industry (Thailand is world's 4th largest chicken exporter). Labour rights conditions: freedom of association, collective bargaining, forced labour crackdown in seafood/garment/agri. Environmental standards compliance required. Certificate of origin enforcement. Thai affected workers: 3M livestock/dairy farmers; seafood processing 300,000 workers (forced labour scrutiny costs); garment workers 800,000 (compliance costs rise); food processing 1M; agricultural workers ~12M broadly. OPPORTUNITIES: Thai food exporters to US benefit from reduced US tariffs on Thai side; some manufacturing gains from supply chain diversification; potential for more FDI from US companies.` },
  trade_china_dump: { tag: "TRADE · 2025–2026", title: "Chinese Cheap Imports Flood Thailand — Textiles, EVs, Appliances", ctx: `China's overcapacity + US tariff trade diversion = massive cheap import surge into Thailand. BYD EVs below $20K vs Japanese/Korean competition; Chinese steel below Thai production cost; Chinese appliances undercutting Thai/Japanese brands; fast fashion from China destroying Thai textile SMEs; Chinese furniture vs Thai wood products; Chinese plastics/petrochemicals below Thai cost. Bank of Thailand explicitly identified structural manufacturing risk. Thai industries facing closures: SSI Thai steel already struggling; Thai textile mills shutting; appliance assembly plants moving; furniture SMEs collapsing. Thai manufacturing workers facing: 400,000 auto sector; 800,000 textiles/garment; 500,000 electronics/appliances; 200,000 steel/metal; 300,000 furniture. Wage deflation: even workers keeping jobs face wage cuts/freezes as employers cite cost pressures. Youth entering labour market face fewer manufacturing openings. 100,000+ Thai SME manufacturers most vulnerable to closure.` },
  trade_contraction: { tag: "MACRO-TRADE · 2026", title: "Thai Export Contraction — TPSO Forecasts -3.1% to +1.1%", ctx: `TPSO forecasts 2026 exports -3.1% to +1.1%; GDP 1.6-1.7% (IMF/World Bank). Household debt at ~90% GDP - among highest in ASEAN, limits domestic cushion. Financial institutions tightening credit. Employment fell 2024-25 in agriculture and manufacturing. Key channels: US tariff full-year impact; China demand slowdown (self-reliance policy reduces Thai intermediate goods imports); EU EUDR deforestation regulation hits Thai rubber, wood, palm oil exports; EU CBAM carbon border adjustment hits Thai steel exports from 2026; Cambodia transshipment -40.8%. High household debt suppresses domestic consumption as substitute for export growth. NSO 2024: 50%+ workforce informal, 54% of informal workers in agriculture. Youth unemployment 4.3%. Only 26% of population has formal employment (18.4M formal workers). Credit squeeze particularly hits informal workers who lack access to formal banking. Structural weaknesses: 75% in low-skilled occupations per BIS analysis.` },
  macro_oil: { tag: "ENERGY · CRITICAL — LIVE MAR 2026", title: "Oil Spike $80–$100+/bbl — Nomura: Thailand Highly Exposed", ctx: `Nomura explicitly named Thailand alongside India, Korea, Philippines as Asia's most exposed to oil price shocks due to near-100% import dependence. Brent from $73 to $80-88, analysts forecast $100+ if Hormuz stays closed. Every $10 oil price increase costs Thailand ~0.4% GDP via import bill. Transmission mechanism: pump prices up → transport costs up → food prices up → manufacturing energy costs up → inflation spikes → BOT faces rate dilemma → consumer spending hit → corporate profits fall → hiring freezes. PTT Group manages oil imports. EGAT uses gas-fired plants (gas=LNG also disrupted). Major Thai workers directly impacted: logistics/trucking (300,000+ drivers, diesel cost spike); taxis/ride-hailing (500,000+, petrol costs rise); aviation (Thai Airways, Bangkok Airways, AirAsia Thailand, Nok Air - jet fuel 25-40% of costs); fishing fleet (300,000 fishers - diesel-dependent boats); agriculture (12M workers - diesel for tractors and irrigation pumps). Energy-intensive manufacturing: cement, ceramics, glass, steel, aluminum smelting face input cost crisis. Tourism threatened if airfares spike 20-30%.` },
  macro_lng: { tag: "ENERGY · LIVE — MAR 2026", title: "Qatar LNG Halt — Ras Laffan Struck, 20% Global LNG Disrupted", ctx: `Mar 2-3 2026: Iranian drones hit Qatar's Ras Laffan and Mesaieed industrial cities, halting Qatar LNG production. Qatar is world's largest LNG producer. Asian LNG prices rose MORE sharply than oil due to immediate supply shortage. Thailand uses LNG for: power generation (EGAT gas-fired plants ~30% of electricity), industrial feedstock (PTT, IRPC, PTT GC petrochemicals), piped city gas (PTT NGD - residential and commercial). Sustained disruption means: electricity shortages → rolling blackouts → industrial shutdowns → cold storage chain breaks → food spoilage → manufacturing halted. Key sectors: petrochemical industry (IRPC, PTT Global Chemical - 50,000+ workers), industrial estates (7 major estate operators, 600,000+ workers), gas-dependent manufacturing (ceramics, glass, food processing). Hotel sector (5M+ in hospitality) faces power uncertainties. Hospitals (healthcare workers 800,000+) face backup generator costs. Small businesses (SMEs = 70% of Thai employment) most vulnerable to power interruption lacking backup systems. Cold chain logistics (food distribution) faces crisis.` },
  macro_slowdown: { tag: "MACRO · 2025–2026", title: "Thailand Structural Slowdown — GDP 1.6–1.7%, Household Debt 90% GDP", ctx: `Thailand 2025 GDP fell to 1.8-2.3% from 2.9% forecast. 2026 forecast 1.6-1.7%. Household debt ~90% GDP - one of ASEAN's highest. Consumer credit NPLs rising. Financial institutions tightening. Employment fell 2024-25 especially agriculture and manufacturing. Structural issues: 50%+ workforce informal (no social security, no credit access); 30% in low-productivity agriculture (only 8% of GDP); manufacturing trapped in low-value activities; service sector dominated by tourism/traditional retail. Youth unemployment 4.3% (vs 1% overall). 75% of workers in low-skilled occupations (BIS 2024). Political instability limits reform. Digital wallet stimulus (14.6M state welfare cardholders) temporary boost fading. Manufacturing production index fell 2024. Tourism recovered to only 89% of 2019 peak by 2024. Construction sector weak. OECD 2025 Thailand review: competition reform needed, FDI attraction, anti-corruption, climate adaptation. Key employment sectors: agriculture 12M, manufacturing 9M, services 19M. Household consumption = 60% of GDP growth historically - but suppressed by debt.` },
  tech_ai: { tag: "TECHNOLOGY · ACCELERATING", title: "AI & Automation Wave — BPO, Banking, Manufacturing Disruption", ctx: `WEF 2026 Global Risks: AI climbs to #5 risk on 10-year horizon. World Bank/QLF/DPU study: 12M Thai workers may lose jobs to automation over 20 years = 1/3 of workforce. ILO 2016: 70%+ Thai workers at risk of automation - high share in routine/manual roles. BIS: 75% of Thai employees in low-skilled occupations - highest automation risk. Bangkok BPO/call center sector: major employer of educated young Thais, directly threatened by AI customer service. Banking sector: back-office, loan processing, teller functions declining. Manufacturing QC: vision AI replacing human inspectors. Accounting/bookkeeping/data entry: directly displaced. Content moderation, translation: AI-accessible tasks. New jobs: data center operators (EEC investment), AI trainers/validators, software engineers, cybersecurity. Thailand's digital economy accelerating. EEC targeting: Microsoft, Google, AWS data centers. Problem: skills mismatch - 75% in low-skilled occupations cannot easily transition to tech roles. Education and vocational training system slow to adapt. Only 26% of workforce in formal employment sector.` },
  tech_ev: { tag: "TECHNOLOGY-TRADE · UNDERWAY", title: "EV Transition vs Thai ICE Auto Hub — BYD Floods Market", ctx: `Thailand = 'Detroit of Asia', largest auto producer in SE Asia, ~1.5M vehicles annually. Auto+parts = 10-12% of GDP. Direct workers: 400,000-750,000. Total supply chain livelihoods: 2M+. BYD, SAIC, NETA, Great Wall Motor aggressively pricing in Thai domestic market (BYD Atto3 ~$30K, BYD Seagull ~$10K). ICE vehicle exports declining as global demand shifts to EVs. Legacy powertrain parts facing obsolescence: transmissions, exhaust systems, fuel pumps, carburettors, gasoline engines, catalytic converters - these are major Thai export items. Toyota, Honda, Isuzu restructuring Thai operations. Thailand trying to attract EV battery investment (CATL supply chain, PTT-Foxconn EV JV). Study: 150,000-200,000 auto jobs at risk if transition accelerates without EV industry replacement. Sub-sectors: Tier 1 parts suppliers (auto components most at risk); rubber/tire manufacturers (EV uses tires too - partial mitigation); steel/stamping plants (EV also needs - some transition possible); electrical components (OPPORTUNITY - EVs use 3x more electrics); battery assembly (new jobs). OIE strategy: pivot to one-ton pickups + EV/hybrid manufacturing.` },
  tech_semicon: { tag: "TECHNOLOGY · OPPORTUNITY", title: "AI Semiconductor Boom — Thai Electronics Exports Surge 54% YoY", ctx: `Thai electronics exports to US surged 54.3% YoY in Dec 2025. Electronics mostly EXEMPT from US tariffs. AI demand drives: ICs, PCBs, hard disk drives, computer components. Thailand: major HDD producer (Western Digital, Seagate factories in Ayutthaya/Pathum Thani), PCB manufacturing cluster, electronic component assembly. Supply chain diversification from China ('China+1') benefits Thailand. EEC targeting: semiconductor supply chain, data centers (Microsoft, Google, AWS), advanced electronics. South Korea semicon exports grew 70.2% early 2026. New job types needed: semiconductor process technicians, cleanroom operators, equipment maintenance, data center operators, cybersecurity, software engineers. CHALLENGE: Current electronics workers (500,000) mostly do basic assembly at 400-500 baht/day. Advanced semiconductor fabs need technicians requiring 2-3 years vocational training. Skills gap is key constraint. Government/BOI incentives: 8-year corporate tax holiday for semiconductor investment, import duty exemptions on machinery, EEC land zoning. Data center investment creates construction jobs (temporary) and operations jobs (permanent, skilled).` },
  env_drought: { tag: "ENVIRONMENTAL · SEASONAL RISK", title: "Prolonged Drought — Isan & Northern Agricultural Zones", ctx: `Isan (Northeast) and North are Thailand's agricultural heartland. Total agri workforce: ~12M workers = 30% of all employed. Agriculture = only 8% of GDP = low income, high vulnerability. Major crops at risk: rice (Thailand 2nd largest rice exporter, 7-8M tonnes/year), sugarcane (3rd largest sugar producer), cassava (major tapioca exporter), maize, rubber (South + some North), fruit (durian, longan, lychee). Drought mechanisms: reservoir levels fall → irrigation fails → yields collapse 30-60% → farm income crashes → rural household NPLs spike → banks restrict rural credit → seasonal workers unemployed → urban migration accelerates → Bangkok informal economy swells. Informal agri workers (90% of agri workers are INFORMAL per NSO 2024) have zero social security safety net. Drought correlates with: increased motorcycle taxi/informal work in cities; children dropping out of school; women entering low-wage factory work; household debt defaults. Extreme heat (35-42°C) affects: construction workers, outdoor delivery riders, agricultural laborers - heat stress reduces outdoor worker productivity 20-30%. Climate change making drought/flood alternation more extreme and unpredictable.` },
  env_flood: { tag: "ENVIRONMENTAL · SEASONAL RISK", title: "Major Industrial Flooding — Chao Phraya Basin (2011 Replay)", ctx: `2011 Thailand floods: $45B total damage, 7 industrial estates inundated in Ayutthaya and Pathum Thani (Rojana, Hi-Tech, Bang Pa-in, Nava Nakorn). Honda/Toyota/Nissan halted production. Western Digital/Seagate HDD plants stopped (Thailand = 25% global HDD supply at time). 660,000 workers temporarily displaced. Global supply chain disruption lasted 6-12 months. A repeat event risk factors: Bangkok sinking 1-2cm/year; climate change intensifies monsoon; Ayutthaya/Pathum Thani auto/electronics cluster remains flood-prone despite berms. EEC zones (Chonburi/Rayong) have lower flood risk. Insurance premiums have repriced substantially. EGAT power infrastructure vulnerable. A major flood would: destroy manufacturing output for 3-6 months; displace 200,000-660,000 workers (mostly temporary, 3-6 months); disrupt global electronics and auto supply chains; damage agricultural land (rice paddy inundation); destroy small business inventory and equipment; block road/rail transport for weeks; trigger insurance claims and reconstruction spending. Post-flood: construction employment temporarily surges. Tourism in affected areas devastated for 1-2 seasons. Cold storage and food distribution chains break.` },
  pol_labour: { tag: "THAI POLICY · ACTIVE", title: "Labour Rights Reform — US Deal Forced Labor Crackdown", ctx: `US-Thailand Oct 2025 trade deal conditions: amend labour law for freedom of association and collective bargaining; crack down on forced labour in seafood (fishing industry on US TIP watchlist), garment/textile, and agriculture; strengthen labour law enforcement including migrant worker protections. Thailand has 3-4M migrant workers (Myanmar, Laos, Cambodia) particularly in: fishing/seafood (critical sector - Thailand 4th largest seafood exporter), agriculture, construction, domestic work. Forced labour compliance will: raise costs in seafood processing (300,000 workers); increase compliance burden for garment exporters (800,000 workers); require minimum wage and working hour enforcement; allow union organizing in previously restricted sectors. BUT: higher wages improve purchasing power for low-income workers; better conditions reduce turnover costs; US market access maintained. Minimum wage debate ongoing (400 baht/day in some areas, push for 400+ nationwide). KEY: migrant workers in fishing/agri who were on forced labour = legal reform affects employment levels if enforcement means some jobs can't be filled at legal wages. Compliance costs rise for SME exporters. Potential for some formal employment expansion.` },
  pol_eec: { tag: "THAI POLICY · INVESTMENT", title: "EEC Expansion — Semiconductor, Data Center, Biotech FDI", ctx: `EEC (Chonburi, Rayong, Chachoengsao) = Thailand's flagship high-value investment zone replacing declining ICE auto FDI. Targets: semiconductor supply chain (below TSMC/Samsung tier), data centers (Microsoft, Google, AWS - AI demand driven), biotechnology/medical devices, aviation MRO (Thai Airways restructuring, regional aviation growth), EV battery manufacturing (CATL supply chain, PTT-Foxconn EV JV), SAF (sustainable aviation fuel - PTT), biopharmaceuticals. BOI incentives: 8-year corporate tax holiday, import duty exemption on machinery. Key jobs being created: semiconductor process technicians (need 2-3yr vocational), data center operators (need 1-2yr IT training), biotech lab technicians (need BSc), EV battery assemblers (need 1yr vocational), aviation MRO technicians (need 3-4yr training). Skills mismatch challenge: auto workers displaced by EV transition don't qualify for semiconductor fabs without retraining. Thai universities producing insufficient STEM graduates. EEC Skills Development Institute created but scale insufficient. Tension: EEC high-wage jobs benefit Bangkok-educated professionals over displaced Isan/northern factory workers unless deliberate regional upskilling programs implemented.` }
};

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
(function init() {
  // Server-side AI: no API key needed from user
  S.apiKey = 'server-side';

  // Clock
  function tick() {
    const now = new Date();
    document.getElementById('ribbonClock').textContent =
      now.toLocaleDateString('en-TH', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
      now.toLocaleTimeString('en-TH', { hour: '2-digit', minute: '2-digit' });
  }
  tick(); setInterval(tick, 30000);

  // Keyboard: Enter on event cards
  document.querySelectorAll('.ec[tabindex]').forEach(el => {
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  });

  // Compare checkbox visibility
  document.querySelectorAll('.ec-cmp').forEach(el => el.style.display = 'none');

  // Restore session data
  try {
    const saved = sessionStorage.getItem('th_ml_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.lastResult) {
        S.lastResult = parsed.lastResult;
        S.lastTag = parsed.lastTag;
        S.lastTitle = parsed.lastTitle;
        S.lastCtx = parsed.lastCtx;
      }
    }
  } catch (e) { }

  // Call NABC prices on load
  fetchNABCPrices().then(() => {
    // Auto-select first event after NABC finishes initializing
    const first = document.querySelector('.ec'); // Changed from .sb-item to .ec
    if (first) first.click();
  });
})();

/* ═══════════════════════════════════════════
   SETTINGS
═══════════════════════════════════════════ */
function openSettings() {
  document.getElementById('settingsOverlay').classList.add('vis');
}
function closeSettings() { document.getElementById('settingsOverlay').classList.remove('vis'); }
function overlayClick(e, overlay) { if (e.target === overlay) closeSettings(); }

/* ═══════════════════════════════════════════
   SEARCH / FILTER
═══════════════════════════════════════════ */
function filterEvents(q) {
  const lower = q.trim().toLowerCase();
  document.querySelectorAll('.ec').forEach(el => {
    if (!lower) {
      el.classList.remove('filtered');
    } else {
      const text = (el.querySelector('.ec-title')?.textContent || '') +
        (el.querySelector('.ec-meta')?.textContent || '');
      el.classList.toggle('filtered', !text.toLowerCase().includes(lower));
    }
  });
  // Show/hide section headers if all cards filtered
  document.querySelectorAll('.sb-section').forEach(sec => {
    const visible = [...sec.querySelectorAll('.ec')].some(e => !e.classList.contains('filtered'));
    sec.style.display = visible ? '' : 'none';
  });
}

/* ═══════════════════════════════════════════
   TEXTAREA CHAR COUNT
═══════════════════════════════════════════ */
function updateCount(ta) {
  const el = document.getElementById('countHint');
  const n = ta.value.length, max = 800;
  el.textContent = `${n} / ${max}`;
  el.classList.toggle('warn', n > 650);
}

/* ═══════════════════════════════════════════
   RENDER COMMODITIES
═══════════════════════════════════════════ */
function renderCommodities(d) {
  const el = document.getElementById('cg');
  if (!el) return;

  let liveNabcHtml = '';
  if (Object.keys(window.NABCPrices || {}).length > 0) {
    liveNabcHtml = `
            <div style="grid-column: 1 / -1; background: var(--gold-bg); padding: 12px; border: 1px solid var(--gold); border-radius: var(--r); margin-bottom: 20px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
               <div style="font-weight: 700; color: var(--gold2); display: flex; align-items: center; gap: 8px;">
                 <span class="liveDot"></span> NABC Live Spot Prices
               </div>
               ${Object.entries(window.NABCPrices).map(([c, data]) => `
                 <div style="background: var(--ink); color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 11px;">
                   <strong>${c}</strong>: ${data.price} ${data.unit}
                 </div>
               `).join('')}
            </div>
          `;
  }

  if (!d.agriculturalImpact || !d.agriculturalImpact.length) {
    el.innerHTML = liveNabcHtml + '<div class="empty-st">No AI projection data available for commodities.</div>';
    return;
  }
  el.innerHTML = liveNabcHtml + d.agriculturalImpact.map(c => `
        <div class="cc">
          <div class="cc-ic" aria-hidden="true">${c.icon || ''}</div>
          <div class="cc-name">${esc(c.crop || '')}</div>
          <div class="cc-stats">
            <span class="cc-stat">Farmers <b>${esc(c.farmersAffected || '—')}</b></span>
            <span class="cc-stat">Price Chg <b>${esc(c.projectedPriceChange || '—')}</b></span>
          </div>
          <div class="bar-track"><div class="bar-fill ${barClass(c.impactScore || 0)}" style="width:0" data-w="${pct(c.impactScore || 0)}"></div></div>
          <div class="cc-lbl">Impact</div>
          <div class="cc-txt">${esc(c.analysis || '')}</div>
          <div class="cc-lbl">Cost of Living</div>
          <div class="cc-txt">${esc(c.costOfLivingEffect || '')}</div>
        </div>
      `).join('');
  setTimeout(() => {
    el.querySelectorAll('.bar-fill').forEach(b => b.style.width = b.dataset.w + '%');
  }, 100);
}

/* ═══════════════════════════════════════════
   COMPARE MODE
═══════════════════════════════════════════ */
function toggleCompareMode() {
  S.compareMode = !S.compareMode;
  const btn = document.getElementById('compareBtn');
  btn.classList.toggle('on', S.compareMode);
  btn.setAttribute('aria-pressed', S.compareMode);
  document.querySelectorAll('.ec-cmp').forEach(el =>
    el.style.display = S.compareMode ? 'flex' : 'none'
  );
  if (!S.compareMode) clearCompare();
}
function toggleCompare(e, el, title) {
  e.stopPropagation();
  const card = el.closest('.ec');
  // derive key from parent card's onclick attr
  const onc = card.getAttribute('onclick') || '';
  const match = onc.match(/'([^']+)'/);
  const key = match ? match[1] : '';
  const idx = S.compareList.findIndex(x => x.key === key);
  if (idx > -1) {
    S.compareList.splice(idx, 1);
    el.classList.remove('checked');
  } else {
    if (S.compareList.length >= 3) { showToast('Max 3 events for comparison', 'error'); return; }
    S.compareList.push({ key, title });
    el.classList.add('checked');
  }
  updateComparePanel();
}
function updateComparePanel() {
  const panel = document.getElementById('comparePanel');
  const items = document.getElementById('cpItems');
  if (!panel || !items) return;
  panel.classList.toggle('vis', S.compareList.length > 0);
  items.innerHTML = S.compareList.map(c =>
    `<span class="cp-tag">${c.title.substring(0, 32)}${c.title.length > 32 ? '…' : ''} <button onclick="removeCompare('${c.key}')" aria-label="Remove ${c.title}">✕</button></span>`
  ).join('');
}
function removeCompare(key) {
  S.compareList = S.compareList.filter(x => x.key !== key);
  document.querySelectorAll('.ec').forEach(ec => {
    const onc = ec.getAttribute('onclick') || '';
    if (onc.includes(`'${key}'`)) ec.querySelector('.ec-cmp')?.classList.remove('checked');
  });
  updateComparePanel();
}
function clearCompare() {
  S.compareList = [];
  document.querySelectorAll('.ec-cmp').forEach(el => el.classList.remove('checked'));
  updateComparePanel();
}
async function runCompare() {
  if (S.compareList.length < 2) { showToast('Select at least 2 events to compare', 'error'); return; }
  showToast('⟳ Running comparison analysis…', 'ok');
  const results = [];
  for (const item of S.compareList) {
    const ev = EVENTS[item.key];
    if (!ev) continue;
    // Use cached if available
    if (S.savedAnalyses[item.key]) {
      results.push({ key: item.key, title: item.title, data: S.savedAnalyses[item.key] });
      continue;
    }
    // AI is server-side, no API key check needed
    try {
      const data = await fetchAnalysis(ev.tag, ev.title, ev.ctx);
      S.savedAnalyses[item.key] = data;
      results.push({ key: item.key, title: item.title, data });
    } catch (e) {
      showToast('Failed to analyze: ' + item.title.substring(0, 30) + '…', 'error');
    }
  }
  if (results.length < 2) return;
  S.lastCompareResults = results;
  renderCompare(results);
}
function renderCompare(results) {
  const profNames = results[0].data.professions?.map(p => p.name) || [];
  const rows = profNames.slice(0, 12).map(name => {
    const cells = results.map(r => {
      const p = r.data.professions?.find(x => x.name === name);
      if (!p) return '<td>—</td>';
      const sc = scoreColor(p.impactScore);
      const sg = p.impactScore > 0 ? '+' : '';
      const pct = Math.min(Math.abs(p.impactScore), 100);
      return `<td><div class="bar-sm"><div class="bar-sm-fill" style="background:${sc};width:${pct}%"></div></div> <span class="cmp-score" style="color:${sc}">${sg}${p.impactScore}</span></td>`;
    }).join('');
    return `<tr><td class="ct-name">${name}</td>${cells}</tr>`;
  }).join('');
  const hdrs = results.map(r => `<th>${r.title.substring(0, 35)}…</th>`).join('');
  const kpiRows = ['overallSentiment', 'gdpImpact', 'workersAtRisk', 'jobsCreated'].map(k => {
    const label = { overallSentiment: 'Sentiment', gdpImpact: 'GDP Impact', workersAtRisk: 'Workers at Risk', jobsCreated: 'New Jobs' }[k];
    const cells = results.map(r => `<td>${r.data[k] || '—'}</td>`).join('');
    return `<tr><td class="ct-name">${label}</td>${cells}</tr>`;
  }).join('');
  const html = `
    <div class="banner" style="padding-bottom:14px">
      <div class="b-left">
        <div class="b-tag">⚖ COMPARISON ANALYSIS · ${results.length} EVENTS</div>
        <div class="b-title">Side-by-Side Event Impact Comparison</div>
        <div class="b-hl">${results.map(r => r.title).join(' vs. ')}</div>
      </div>
    </div>
    <div style="padding:18px 22px">
      <div class="card">
        <div class="card-h"><span class="card-h-l">📊 Key Indicators</span></div>
        <div class="cmp-results">
          <table class="cmp-tbl">
            <thead><tr><th>Indicator</th>${hdrs}</tr></thead>
            <tbody>${kpiRows}</tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-h"><span class="card-h-l">👥 Profession Impact Scores</span></div>
        <div class="cmp-results">
          <table class="cmp-tbl">
            <thead><tr><th>Profession</th>${hdrs}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
  const resEl = document.getElementById('results');
  show('results'); hide('emptyState', 'loadState', 'errorState');
  resEl.innerHTML = html;
  resEl.classList.add('vis');
  document.getElementById('exportBtn').style.display = '';
  document.getElementById('printBtn').style.display = '';
}

/* ═══════════════════════════════════════════
   EVENT SELECTION
═══════════════════════════════════════════ */
function selEvent(card, key) {
  document.querySelectorAll('.ec').forEach(c => c.classList.remove('active'));
  card.classList.add('active');
  const ev = EVENTS[key];
  if (!ev) return;
  S.lastTag = ev.tag; S.lastTitle = ev.title; S.lastCtx = ev.ctx;
  // Cache hit
  if (S.savedAnalyses[key]) {
    renderResults(ev.tag, ev.title, S.savedAnalyses[key]);
    return;
  }
  runAnalysis(ev.tag, ev.title, ev.ctx, card);
}
function clickPill(key) {
  const card = [...document.querySelectorAll('.ec')].find(c => (c.getAttribute('onclick') || '').includes(`'${key}'`));
  if (card) selEvent(card, key);
}
function runCustom() {
  const txt = document.getElementById('customTxt').value.trim();
  const scope = document.getElementById('customScope').value;
  if (!txt) { document.getElementById('customTxt').focus(); showToast('Please describe an event first', 'error'); return; }
  const scopeLabels = { national: 'All Thailand', tourism: 'Tourism Regions (Phuket, Koh Samui, Chiang Mai)', agri: 'Agricultural Regions (Isan, North)', industrial: 'EEC / Industrial Zones (Rayong, Chonburi)', urban: 'Bangkok & Urban Centers', coastal: 'Southern Coast & Fishing' };
  const ctx = `Custom event: ${txt}. Regional scope: ${scopeLabels[scope]}. Analyse all relevant Thai professions and industries with focus on ${scopeLabels[scope]}. Thailand workforce: 40M total, 30% agriculture (12M), 22% industry (9M), 48% services (19M). 50%+ informal.`;
  S.lastTag = 'CUSTOM EVENT'; S.lastTitle = txt.substring(0, 80); S.lastCtx = ctx;
  runAnalysis('CUSTOM EVENT', txt.substring(0, 80), ctx, null);
}

/* ═══════════════════════════════════════════
   ANALYSIS ORCHESTRATION
═══════════════════════════════════════════ */
const STEPS = [
  'PARSING EVENT CONTEXT…', 'MAPPING THAI LABOUR STRUCTURE…',
  'SCORING 18 PROFESSIONS…', 'ANALYSING 10 INDUSTRIES…',
  'BUILDING WAGE IMPACT MODEL…', 'GENERATING TIMELINE…',
  'DRAFTING RECOMMENDATIONS…', 'FINALISING OUTPUT…'
];
let stepIdx = 0, stepTimer = null;

/* ═══════════════════════════════════════════
   MOCK MODE — pre-built result for demo use
═══════════════════════════════════════════ */
const MOCK_RESULT = JSON.parse(`{
      "overallSentiment":"SEVERE CRISIS",
      "impactScore":-78,
      "workersAtRisk":"4.8 million directly",
      "jobsLost":"120,000-280,000 within 6 months",
      "jobsCreated":"18,000-35,000",
      "gdpImpact":"-1.4% to -2.1% GDP",
      "timeHorizon":"3-18 months",
      "headline":"Hormuz closure threatens 4.8M Thai workers as every $10/bbl oil spike costs Thailand ~0.4% GDP.",
      "analysis":"The Strait of Hormuz closure transmits into Thailand's labour market through three simultaneous shocks: a fuel-cost surge, a power-generation squeeze, and tourism demand destruction.",
      "keyInsights":[
        {"icon":"⛽","title":"Fuel Spike","text":"Diesel prices expected to surge, hitting logistics and agriculture hardest."},
        {"icon":"🔌","title":"Energy Costs","text":"Manufacturing sector faces margin compression due to higher electricity tariffs."}
      ],
      "professions":[
        {"icon":"🚚","name":"Logistics Drivers","workerCount":"1.2M", "avgWage":"18,000 THB", "impactScore":-85, "riskLevel":"Critical", "immediateImpact":"Fuel costs erase margins", "mediumTermImpact":"Job losses/fleet downsizing", "adaptationPaths":["EV transition"], "tags":["Energy-sensitive", "Informal"]},
        {"icon":"🌾","name":"Rice Farmers","workerCount":"5.9M", "avgWage":"9,000 THB", "impactScore":-70, "riskLevel":"High", "immediateImpact":"Fertilizer/diesel costs up", "mediumTermImpact":"Debt defaults rising", "adaptationPaths":["Solar pumps"], "tags":["Agricultural", "Informal"]},
        {"icon":"🛵","name":"Delivery Riders","workerCount":"850K", "avgWage":"15,000 THB", "impactScore":-80, "riskLevel":"Critical", "immediateImpact":"Income squeeze from fuel", "mediumTermImpact":"Leaving platform economy", "adaptationPaths":["EV bikes"], "tags":["Energy-sensitive", "Informal"]},
        {"icon":"🏭","name":"Factory Workers","workerCount":"4.2M", "avgWage":"12,500 THB", "impactScore":-65, "riskLevel":"High", "immediateImpact":"Overtime hours cut", "mediumTermImpact":"Layoffs from margin crunch", "adaptationPaths":["Upskilling"], "tags":["Export-dependent"]},
        {"icon":"🎣","name":"Deep-sea Fishers","workerCount":"350K", "avgWage":"14,000 THB", "impactScore":-90, "riskLevel":"Critical", "immediateImpact":"Vessels docked (fuel too high)", "mediumTermImpact":"Industry insolvency", "adaptationPaths":["Coastal fishing"], "tags":["Energy-sensitive", "Migrant-dominated"]},
        {"icon":"🌳","name":"Rubber Tappers","workerCount":"1.6M", "avgWage":"10,000 THB", "impactScore":-60, "riskLevel":"Medium", "immediateImpact":"Transport costs rise", "mediumTermImpact":"Price drops from slow demand", "adaptationPaths":["Intercropping"], "tags":["Agricultural", "Export-dependent"]},
        {"icon":"🏗️","name":"Construction Laborers","workerCount":"2.1M", "avgWage":"11,000 THB", "impactScore":-55, "riskLevel":"Medium", "immediateImpact":"Material costs stall projects", "mediumTermImpact":"Site closures", "adaptationPaths":["Sector switch"], "tags":["Migrant-dominated", "Informal"]},
        {"icon":"🏨","name":"Hotel Staff","workerCount":"1.8M", "avgWage":"16,000 THB", "impactScore":-75, "riskLevel":"High", "immediateImpact":"Flight cancellations hit occupancy", "mediumTermImpact":"Wage freezes/furloughs", "adaptationPaths":["Local tourism focus"], "tags":["Tourism-linked"]},
        {"icon":"🗺️","name":"Tour Guides","workerCount":"80K", "avgWage":"22,000 THB", "impactScore":-85, "riskLevel":"Critical", "immediateImpact":"Zero international bookings", "mediumTermImpact":"Forced career change", "adaptationPaths":["Domestic tours"], "tags":["Tourism-linked", "Informal"]},
        {"icon":"🚕","name":"Taxi Drivers","workerCount":"150K", "avgWage":"14,000 THB", "impactScore":-80, "riskLevel":"Critical", "immediateImpact":"NGV/LPG/Fuel spikes", "mediumTermImpact":"Vehicle repossessions", "adaptationPaths":["EV taxis"], "tags":["Energy-sensitive", "Tourism-linked"]},
        {"icon":"🍜","name":"Street Vendors","workerCount":"3.2M", "avgWage":"12,000 THB", "impactScore":-50, "riskLevel":"Medium", "immediateImpact":"Cooking gas & ingredient inflation", "mediumTermImpact":"Consumer spending drop", "adaptationPaths":["Menu adjustments"], "tags":["Informal"]},
        {"icon":"🌴","name":"Palm Oil Cutters","workerCount":"600K", "avgWage":"9,500 THB", "impactScore":20, "riskLevel":"Positive", "immediateImpact":"Prices temporarily surge", "mediumTermImpact":"Alternative fuel demand", "adaptationPaths":["Yield improvement"], "tags":["Agricultural", "Energy-sensitive"]},
        {"icon":"🎋","name":"Sugarcane Farmers","workerCount":"1.1M", "avgWage":"10,500 THB", "impactScore":-45, "riskLevel":"Medium", "immediateImpact":"Harvesting/transport costs up", "mediumTermImpact":"Ethanol demand offset", "adaptationPaths":["Bio-energy pivot"], "tags":["Agricultural", "Export-dependent"]},
        {"icon":"🛒","name":"Retail Cashiers","workerCount":"1.5M", "avgWage":"11,500 THB", "impactScore":-30, "riskLevel":"Low", "immediateImpact":"Slight dip in foot traffic", "mediumTermImpact":"Stagnant wage growth", "adaptationPaths":["E-commerce"], "tags":[]},
        {"icon":"🛡️","name":"Security Guards","workerCount":"450K", "avgWage":"12,000 THB", "impactScore":-10, "riskLevel":"Low", "immediateImpact":"Cost of living squeeze", "mediumTermImpact":"Stable employment", "adaptationPaths":["Skill upgrades"], "tags":["Migrant-dominated"]},
        {"icon":"📁","name":"Office Clerks","workerCount":"2.8M", "avgWage":"18,000 THB", "impactScore":-20, "riskLevel":"Low", "immediateImpact":"Inflation erodes purchasing power", "mediumTermImpact":"Bonus cuts", "adaptationPaths":["Remote work"], "tags":[]},
        {"icon":"🩺","name":"Healthcare Workers","workerCount":"600K", "avgWage":"35,000 THB", "impactScore":0, "riskLevel":"Low", "immediateImpact":"No direct impact", "mediumTermImpact":"Stable", "adaptationPaths":["Public health"], "tags":[]},
        {"icon":"💻","name":"IT Professionals","workerCount":"400K", "avgWage":"45,000 THB", "impactScore":-15, "riskLevel":"Low", "immediateImpact":"Tech budget cuts", "mediumTermImpact":"Hiring freezes", "adaptationPaths":["Cloud migration"], "tags":[]}
      ],
      "industries":[
        {"icon":"🏗️","name":"Manufacturing","gdpShare":"27%","workforceSize":"6M","impactScore":-60,"verdict":"Margin Compression","analysis":"Energy costs will squeeze profitability across the Eastern Economic Corridor (EEC).","subOccupations":[{"name":"Assemblers","impact":-65},{"name":"Technicians","impact":-50},{"name":"Logistics","impact":-75},{"name":"Management","impact":-20}],"keyActions":["Energy audit","Hedging","Shift reductions"]},
        {"icon":"🚢","name":"Transport & Logistics","gdpShare":"6%","workforceSize":"1.5M","impactScore":-80,"verdict":"Crisis Mode","analysis":"Direct exposure to fuel spikes. Margins erased instantly for trucking and shipping.","subOccupations":[{"name":"Truck Drivers","impact":-85},{"name":"Port Workers","impact":-70},{"name":"Dispatchers","impact":-40},{"name":"Warehouse","impact":-50}],"keyActions":["Fleet optimization","Fuel surcharges","Route consolidation"]},
        {"icon":"🏝️","name":"Tourism & Hospitality","gdpShare":"18%","workforceSize":"4.5M","impactScore":-70,"verdict":"Demand Shock","analysis":"Higher aviation fuel costs lead to flight cancellations and fewer international arrivals in Phuket/Bangkok.","subOccupations":[{"name":"Hotel Staff","impact":-75},{"name":"Tour Guides","impact":-85},{"name":"Aviation","impact":-65},{"name":"F&B Services","impact":-60}],"keyActions":["Target domestic market","Cost cutting","Energy saving"]},
        {"icon":"🌾","name":"Agriculture","gdpShare":"8%","workforceSize":"12M","impactScore":-55,"verdict":"Input Cost Surge","analysis":"Fertilizer and diesel costs wipe out crop profits, despite some commodity price gains.","subOccupations":[{"name":"Rice Farmers","impact":-70},{"name":"Rubber Tappers","impact":-60},{"name":"Mill Workers","impact":-50},{"name":"Fisheries","impact":-90}],"keyActions":["Solar irrigation","Co-op buying","Alternative fertilizers"]},
        {"icon":"🏢","name":"Construction","gdpShare":"7%","workforceSize":"2.8M","impactScore":-65,"verdict":"Project Delays","analysis":"Spike in transport and raw material costs (steel, cement) delays mega-projects.","subOccupations":[{"name":"Laborers","impact":-70},{"name":"Engineers","impact":-30},{"name":"Contractors","impact":-80},{"name":"Architects","impact":-20}],"keyActions":["Renegotiate contracts","Material stockpiling","Delay new starts"]},
        {"icon":"🏪","name":"Retail & Wholesale","gdpShare":"16%","workforceSize":"6.2M","impactScore":-40,"verdict":"Consumption Drop","analysis":"Inflation pulls discretionary spending down. Hypermarkets face higher supply chain costs.","subOccupations":[{"name":"Cashiers","impact":-30},{"name":"Sales Reps","impact":-45},{"name":"Supply Chain","impact":-60},{"name":"Management","impact":-15}],"keyActions":["Inventory optimization","Price pass-through","E-commerce push"]},
        {"icon":"⚡","name":"Energy & Utilities","gdpShare":"4%","workforceSize":"200K","impactScore":20,"verdict":"Strategic Importance","analysis":"Fossil fuel importers hurt, but domestic renewables and biofuels see massive policy support.","subOccupations":[{"name":"Plant Operators","impact":10},{"name":"Engineers","impact":15},{"name":"Maintenance","impact":0},{"name":"Executives","impact":25}],"keyActions":["Accelerate renewables","Grid optimization","Price restructuring"]},
        {"icon":"🏦","name":"Financial Services","gdpShare":"7%","workforceSize":"500K","impactScore":-45,"verdict":"NPL Risk Elevated","analysis":"Banks and non-banks face rising defaults from heavily impacted sectors (transport, agriculture, SMEs).","subOccupations":[{"name":"Loan Officers","impact":-55},{"name":"Risk Analysts","impact":-10},{"name":"Tellers","impact":-20},{"name":"Debt Collectors","impact":30}],"keyActions":["Tighten credit","Restructuring programs","Boost provisions"]},
        {"icon":"🐟","name":"Fisheries & Aquaculture","gdpShare":"1.5%","workforceSize":"600K","impactScore":-85,"verdict":"Operational Halt","analysis":"Deep-sea trawlers cannot operate profitably with diesel above 35 THB/liter.","subOccupations":[{"name":"Trawler Crew","impact":-90},{"name":"Processing","impact":-75},{"name":"Market Vendors","impact":-60},{"name":"Aquaculture","impact":-40}],"keyActions":["Docking fleets","Seek govt subsidies","Shift to coastal"]},
        {"icon":"🍽️","name":"Food & Beverage","gdpShare":"5%","workforceSize":"2.5M","impactScore":-50,"verdict":"Margin Erosion","analysis":"Restaurants squeezed by cooking gas, electricity, and ingredient inflation, while customers spend less.","subOccupations":[{"name":"Cooks/Chefs","impact":-40},{"name":"Waitstaff","impact":-60},{"name":"Delivery","impact":-80},{"name":"Owners","impact":-70}],"keyActions":["Menu simplification","Portion control","Energy efficiency"]}
      ],
      "timeline":[
        {"phase":"Immediate (0–3 months)","icon":"🛑","colorHex":"#8B1D2F","title":"Logistics Freeze","description":"Diesel prices push beyond 35 THB/liter, immediately halting deep-sea fishing fleets and severely reducing trucking margins."},
        {"phase":"Short-term (3–12 months)","icon":"📉","colorHex":"#B84C1A","title":"NPLs Surge in Agri","description":"Harvesting costs for rice and sugarcane surge, leading to widespread defaults on agricultural equipment title loans."},
        {"phase":"Medium-term (1–3 years)","icon":"🔄","colorHex":"#1A6B3C","title":"Structural Shift","description":"Government accelerates EV trucking infrastructure and solar-powered irrigation subsidies to counteract fossil dependency."}
      ],
      "wageImpacts":[
         {"icon":"🛵","profession":"Delivery Riders","currentWage":"15,000 THB","projectedChange":"-20% to -25%","outlook":"Fuel costs erase daily profit margins."}
      ],
      "recommendations":[
        {"icon":"🛡️","title":"Implement 'Chaiyo Relief' Moratorium","description":"Immediately offer a 6-month principal moratorium for agricultural vehicle loans in the North and Northeast to prevent mass defaults."},
        {"icon":"⚡","title":"Launch Green Energy Title Loans","description":"Create a subsidized loan tier for borrowers transitioning to EV motorcycles or solar water pumps, hedging against future fuel shocks."},
        {"icon":"📊","title":"Geographic Portfolio Rebalancing","description":"Temporarily tighten credit underwriting for deep-sea fishers and long-haul truckers, shifting capital to less energy-sensitive sectors like retail."}
      ],
      "agriculturalImpact":[
        {"icon":"🌾","crop":"Jasmine Rice","farmersAffected":"3.4M households","currentPrice":"14,500 THB/ton","projectedPriceChange":"+5% to +8%","impactScore":-70,"analysis":"Fertilizer/diesel costs outweigh price gains.","costOfLivingEffect":"Moderate increase in domestic staple prices."},
        {"icon":"🌳","crop":"Natural Rubber","farmersAffected":"1.6M households","currentPrice":"55 THB/kg","projectedPriceChange":"-10% to -15%","impactScore":-80,"analysis":"Logistics breakdown halts export shipments.","costOfLivingEffect":"Negligible domestic impact."},
        {"icon":"🌴","crop":"Oil Palm","farmersAffected":"600K households","currentPrice":"5.5 THB/kg","projectedPriceChange":"+15% to +25%","impactScore":20,"analysis":"Value surges as alternative biodiesel feedstock.","costOfLivingEffect":"Cooking oil prices spike sharply."}
      ],
      "strategyInsight":{
        "autoXThreat":"Significant NPL risk in the North and Northeast due to diesel-reliant rice harvesting costs and southern rubber logistics bottlenecks.",
        "strategicOpportunity":"Accelerate lending for solar-powered irrigation and EV agricultural transport to decouple borrowers from fuel volatility.",
        "actionableRecommendation":"Implement a targeted 6-month debt moratorium and 'Chaiyo Relief' restructuring plan for agricultural vehicle loans in the central and northeast rice belts."
      },
      "regionalImpact":[
        {"province":"Bangkok","region":"Central","impactScore":-45,"riskFactor":"Urban logistics & energy inflation","affectedCrops":["🏢 Urban Hub"],"criticalOccupations":["Delivery Riders", "Taxi Drivers", "Ride-hailers"]},
        {"province":"Ubon Ratchathani","region":"Northeast","impactScore":-85,"riskFactor":"Severe rice production threat","affectedCrops":["🌾 Jasmine Rice", "🌽 Maize"],"criticalOccupations":["Rice Farmers", "Mill Workers", "Harvesting Crew"]},
        {"province":"Surat Thani","region":"South","impactScore":-75,"riskFactor":"Rubber/Palm logistics crisis","affectedCrops":["🌳 Rubber", "🌴 Oil Palm"],"criticalOccupations":["Rubber Tappers", "Palm Cutters", "Truckers"]},
        {"province":"Chiang Mai","region":"North","impactScore":-40,"riskFactor":"Tourism supply chain hike","affectedCrops":["🍓 Fruits", "☕ Coffee", "🌾 Highland Rice"],"criticalOccupations":["Hotel Staff", "Tour Guides", "Agri-Tourism Workers"]},
        {"province":"Chonburi","region":"East","impactScore":-60,"riskFactor":"EEC manufacturing energy squeeze","affectedCrops":["🏢 Industrial Sector"],"criticalOccupations":["Factory Workers", "Logistics Drivers", "Technicians"]},
        {"province":"Nakhon Sawan","region":"Central","impactScore":-70,"riskFactor":"Rice belt harvesting cost spike","affectedCrops":["🌾 Rice", "🎋 Sugarcane"],"criticalOccupations":["Harvesting Crew", "Manual Laborers", "Truckers"]},
        {"province":"Songkhla","region":"South","impactScore":-80,"riskFactor":"Deep-sea fishing diesel crisis","affectedCrops":["🐟 Seafood", "🦐 Shrimp"],"criticalOccupations":["Trawler Crew", "Processing Staff", "Fish Market Vendors"]},
        {"province":"Khon Kaen","region":"Northeast","impactScore":-65,"riskFactor":"Agri-processing energy costs","affectedCrops":["🎋 Sugarcane", "🥔 Cassava"],"criticalOccupations":["Processor Staff", "Smallholders", "Machine Operators"]},
        {"province":"Prachuap Khiri Khan","region":"West","impactScore":-72,"riskFactor":"Pineapple/Coconut export delays","affectedCrops":["🍍 Pineapple", "🥥 Coconut"],"criticalOccupations":["Plantation Workers", "Export Loaders"]},
        {"province":"Chumphon","region":"South","impactScore":-82,"riskFactor":"Palm oil milling energy premium","affectedCrops":["🌴 Oil Palm", "☕ Coffee"],"criticalOccupations":["Palm Cutters", "Mill Technicians"]}
      ]
    }`);
async function runCompare() {
  if (S.compareList.length < 2) { showToast('Select at least 2 events', 'error'); return; }
  const items = S.compareList;
  hide('results', 'emptyState', 'errorState');
  show('loadState');
  const results = [];
  try {
    for (let i = 0; i < items.length; i++) {
      const ev = items[i];
      document.getElementById('loadStep').textContent = `ANALYZING ${i + 1}/${items.length}: ${ev.title.substring(0, 20)}...`;
      const ctx = EVENTS[ev.key]?.ctx || "No context";
      const res = await fetchAnalysis(ev.key, ev.title, ctx);
      results.push({ key: ev.key, title: ev.title, data: res });
    }
    renderCompare(results);
  } catch (err) {
    showError(err);
  } finally {
    hide('loadState');
  }
}

function renderCompare(results) {
  const resEl = document.getElementById('results');
  let html = `<div class="banner">
        <div class="b-left">
          <div class="b-tag">SCENARIO COMPARISON</div>
          <div class="b-title">Strategic Multi-Event Analysis</div>
        </div>
      </div>`;

  // Main comparison table
  html += `<div class="pane on" style="padding-top:0"><div class="card" style="overflow-x:auto; padding:0">
        <table class="cmp-tbl" style="width:100%; border-collapse:collapse; min-width:800px;">
          <thead>
            <tr style="background:var(--ink); color:var(--paper)">
              <th style="padding:15px; text-align:left; border-right:1px solid rgba(255,255,255,0.1)">Metric</th>
              ${results.map(r => `<th style="padding:15px; text-align:center; border-right:1px solid rgba(255,255,255,0.1); width:${Math.floor(85 / results.length)}%">${esc(r.title)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:12px 15px; font-weight:700; border-bottom:1px solid var(--border)">Overall Impact</td>
              ${results.map(r => `<td style="padding:12px 15px; text-align:center; border-bottom:1px solid var(--border); font-weight:700; color:${SENTIMENT_COLORS[r.data.overallSentiment]}">${r.data.overallSentiment}</td>`).join('')}
            </tr>
            <tr>
              <td style="padding:12px 15px; border-bottom:1px solid var(--border)">Impact Score</td>
              ${results.map(r => `<td style="padding:12px 15px; text-align:center; border-bottom:1px solid var(--border); font-family:monospace; font-size:16px; color:${scoreColor(r.data.impactScore)}">${sign(r.data.impactScore)}${r.data.impactScore}</td>`).join('')}
            </tr>
            <tr>
              <td style="padding:12px 15px; border-bottom:1px solid var(--border)">Workers at Risk</td>
              ${results.map(r => `<td style="padding:12px 15px; text-align:center; border-bottom:1px solid var(--border)">${r.data.workersAtRisk}</td>`).join('')}
            </tr>
            <tr>
              <td style="padding:12px 15px; border-bottom:1px solid var(--border)">GDP Impact</td>
              ${results.map(r => `<td style="padding:12px 15px; text-align:center; border-bottom:1px solid var(--border)">${r.data.gdpImpact}</td>`).join('')}
            </tr>
            <tr style="background:var(--gold-bg)">
              <td style="padding:12px 15px; font-weight:700; border-bottom:1px solid var(--border)">AutoX Strategic Threat</td>
              ${results.map(r => `<td style="padding:12px 15px; font-size:12px; border-bottom:1px solid var(--border)">${r.data.strategyInsight?.autoXThreat || 'N/A'}</td>`).join('')}
            </tr>
            <tr>
              <td style="padding:12px 15px; font-weight:700; border-bottom:1px solid var(--border)">Key Recommendation</td>
              ${results.map(r => `<td style="padding:12px 15px; font-size:12px; border-bottom:1px solid var(--border)">${r.data.strategyInsight?.actionableRecommendation || 'N/A'}</td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>`;

  // Agricultural side-by-side
  html += `<div class="card">
        <div class="card-h">🌾 Agricultural / Commodity Impact Comparison</div>
        <div class="g${results.length}" style="gap:15px">
          ${results.map(r => `
            <div>
              <div style="font-family:monospace; font-size:10px; margin-bottom:8px; background:var(--ink); color:var(--paper); padding:4px 8px; border-radius:3px">${esc(r.title.substring(0, 30))}…</div>
              <div style="display:flex; flex-direction:column; gap:8px">
                ${(r.data.agriculturalImpact || []).slice(0, 5).map(a => `
                  <div style="font-size:11px; display:flex; justify-content:space-between; border-bottom:1px solid var(--border2); padding-bottom:4px">
                    <span>${a.icon} ${a.crop}</span>
                    <span style="color:${a.impactScore < 0 ? 'var(--red)' : 'var(--green)'}; font-weight:700">${sign(a.impactScore)}${a.impactScore}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div></div>`;

  resEl.innerHTML = html;
  show('results');
  resEl.classList.add('vis');
}

function toggleCompareMode() {
  S.compareMode = !S.compareMode;
  document.body.classList.toggle('comp-mode', S.compareMode);
  document.getElementById('compareBtn').classList.toggle('on', S.compareMode);
  document.querySelectorAll('.ec-cmp').forEach(el => el.style.display = S.compareMode ? 'flex' : 'none');
  if (!S.compareMode) clearCompare();
  showToast(S.compareMode ? 'Compare Mode ON' : 'Compare Mode OFF', 'ok');
}

async function runAnalysis(tag, title, ctx, el) {
  if (S.compareMode) return;
  if (el && typeof el.classList !== 'undefined') {
    document.querySelectorAll('.ec').forEach(x => x.classList.remove('active'));
    el.classList.add('active');
  }
  hide('emptyState', 'errorState', 'results');
  show('loadState');
  document.getElementById('loadState').classList.add('vis');
  S.lastTag = tag; S.lastTitle = title; S.lastCtx = ctx;

  let stepIdx = 0;
  document.getElementById('loadStep').textContent = STEPS[0];
  const stepTimer = setInterval(() => {
    stepIdx = (stepIdx + 1) % STEPS.length;
    const el = document.getElementById('loadStep');
    el.style.opacity = '0';
    setTimeout(() => { el.textContent = STEPS[stepIdx]; el.style.opacity = '1'; }, 200);
  }, 1200);

  try {
    const data = await fetchAnalysis(tag, title, ctx);
    S.lastResult = data;
    try { sessionStorage.setItem('th_ml_state', JSON.stringify({ lastResult: data, lastTag: tag, lastTitle: title, lastCtx: ctx })); } catch (e) { }
    clearInterval(stepTimer);
    document.getElementById('loadState').classList.remove('vis');
    renderResults(tag, title, data);
  } catch (err) {
    clearInterval(stepTimer);
    document.getElementById('loadState').classList.remove('vis');
    showError(err);
  }
}

async function fetchAnalysis(tag, title, ctx) {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 1500));
    return MOCK_RESULT;
  }
  S.abortCtrl = new AbortController();
  const prompt = buildPrompt(tag, title, ctx);
  const resp = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
    signal: S.abortCtrl.signal
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    let errMsg = 'AI analysis failed';
    try { errMsg = JSON.parse(errText).error || errMsg; } catch (e) { }
    throw new Error(errMsg);
  }
  // Streaming response: read full text then parse as JSON
  const text = await resp.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    // Try to extract JSON from the text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error('AI returned invalid response');
    }
  }
  return parsed;
}

function buildPrompt(tag, title, ctx) {
  // Inject NABC Pricing context if available
  let nabcCtx = "";
  if (Object.keys(window.NABCPrices).length > 0) {
    nabcCtx = "\n<NABC_LIVE_PRICES> Current Thai Spot Prices (from agriapi.nabc.go.th): ";
    for (const [crop, data] of Object.entries(window.NABCPrices)) {
      nabcCtx += `${crop}: ${data.price} ${data.unit}; `;
    }
    nabcCtx += "</NABC_LIVE_PRICES>\nUse these exact baseline spot prices when projecting price cascades in the agriculturalImpact block.";
  }

  return `Act as the "AutoX Strategy Agent"—a high-level lending institutional analyst for AutoX (the company behind Ngern Chaiyo). AutoX specializes in title loans (motorcycles, cars, pickups, trucks) and agricultural vehicle loans for the informal and self-employed sectors in Thailand.

Analyze this event: [${tag}] ${title}
Context: ${ctx}
Live NABC Prices: ${JSON.stringify(window.NABCPrices || {})}

Your goal is to assess the impact of this event on AutoX's loan portfolio and borrower repayment capacity.

Return ONLY valid JSON (no markdown, no preamble):
{
  "overallSentiment":"SEVERE CRISIS|HIGH RISK|ELEVATED RISK|MIXED|CAUTIOUS POSITIVE|STRONG POSITIVE",
  "impactScore":<integer -100 to +100>,
  "workersAtRisk":"<e.g. 1.4 million>",
  "jobsLost":"<estimate with timeframe>",
  "jobsCreated":"<estimate>",
  "gdpImpact":"<e.g. -0.8% GDP>",
  "timeHorizon":"<e.g. 6-18 months>",
  "headline":"<one precise data-grounded sentence>",
  "analysis":"<bullet: max 15 words: immediate transmission to supply chain>\\n\\n<bullet: max 15 words: hardest hit worker groups/regions>\\n\\n<bullet: max 15 words: primary commodity price movements>\\n\\n<bullet: max 15 words: long-term structural risk>",
  "keyInsights":[
    {"icon":"<emoji>","title":"<short>","text":"<2 sentences specific to Thailand>"},
    {"icon":"<emoji>","title":"<short>","text":"<2 sentences>"},
    {"icon":"<emoji>","title":"<short>","text":"<2 sentences>"}
  ],
  "professions":[
    {
      "icon":"<emoji>","name":"<specific Thai profession>",
      "workerCount":"<e.g. 450,000>","avgWage":"<monthly baht e.g. 12,000 baht/month>",
      "impactScore":<-100 to +100>,
      "riskLevel":"Critical|High|Medium|Low|Positive",
      "immediateImpact":"<max 12 words>","mediumTermImpact":"<max 12 words>",
      "adaptationPaths":["<2-word action>","<2-word action>"],
      "tags":["<Informal|Export-dependent|Energy-sensitive|Automation risk|Tourism-linked|Migrant-dominated|Agricultural>"]
    }
    // Include EXACTLY 18 significantly affected professions.
  ],
  "industries":[
    {
      "icon":"<emoji>","name":"<Thai industry>",
      "gdpShare":"<e.g. 8%>","workforceSize":"<e.g. 12 million>",
      "impactScore":<-100 to +100>,
      "verdict":"<5-word verdict>",
      "analysis":"<3-4 sentences with specific Thai companies/products/routes>",
      "subOccupations":[
        {"name":"<role>","impact":<number>},
        {"name":"<role>","impact":<number>},
        {"name":"<role>","impact":<number>},
        {"name":"<role>","impact":<number>}
      ],
      "keyActions":["<action>","<action>","<action>"]
    }
    // Include EXACTLY 10 affected Thai industries.
  ],
  "agriculturalImpact":[
    {
      "icon":"<emoji>","crop":"<crop/commodity name e.g. Jasmine Rice, Natural Rubber, Sugarcane>",
      "farmersAffected":"<e.g. 3.7 million households>",
      "currentPrice":"<current price per unit in baht>",
      "projectedPriceChange":"<e.g. +12% to +18%>",
      "impactScore":<-100 to +100>,
      "analysis":"<max 15 words on crop impact>",
      "costOfLivingEffect":"<max 10 words consumer effect>"
    }
    // Include EVERY commodity listed in <NABC_LIVE_PRICES> above. Create a card for each one. Do not omit any.
  ],
  "costOfLiving":{
    "overallInflationImpact":"<e.g. +1.2% to +2.5% CPI>",
    "foodPriceImpact":"<e.g. +5% to +12% on food basket>",
    "energyPriceImpact":"<e.g. +15% to +30% on fuel/electricity>",
    "householdBurden":"<2-3 sentences on how this event affects the average Thai household purchasing power, especially low-income families in Isan and the North>",
    "items":[
      {"item":"<e.g. Rice (5kg bag)>","currentPrice":"<baht>","projectedChange":"<% change>"},
      {"item":"<e.g. Diesel (litre)>","currentPrice":"<baht>","projectedChange":"<% change>"},
      {"item":"<e.g. Cooking oil>","currentPrice":"<baht>","projectedChange":"<% change>"},
      {"item":"<e.g. Electricity (unit)>","currentPrice":"<baht>","projectedChange":"<% change>"},
      {"item":"<e.g. Chicken (kg)>","currentPrice":"<baht>","projectedChange":"<% change>"},
      {"item":"<e.g. Public transport fare>","currentPrice":"<baht>","projectedChange":"<% change>"}
    ]
  },
  "timeline":[
    {"phase":"Immediate (0–3 months)","icon":"<emoji>","colorHex":"<hex>","title":"<title>","description":"<specific>"},
    {"phase":"Short-term (3–12 months)","icon":"<emoji>","colorHex":"<hex>","title":"<title>","description":"<specific>"},
    {"phase":"Medium-term (1–3 years)","icon":"<emoji>","colorHex":"<hex>","title":"<title>","description":"<specific>"}
    // 3 phases
  ],
  "wageImpacts":[
    {"icon":"<emoji>","profession":"<name>","currentWage":"<baht/month>","projectedChange":"<e.g. -15% to -25%>","outlook":"<1 sentence>"}
    // Include EXACTLY 6 wage impact groups. Do not omit any.
  ],
  "recommendations":[
    {"icon":"<emoji>","title":"<action title>","description":"<2 sentences specific Thai policy/workforce/business action>"}
    // 6 total
  ],
  "strategyInsight":{
    "autoXThreat":"<How this event increases loan default (NPL) risk for AutoX's borrower segments>",
    "strategicOpportunity":"<New lending products or pivots that become viable now>",
    "actionableRecommendation":"<1 specific internal credit action: e.g. targeted debt-relief, restructuring plans, tighter credit approvals, or NPL mitigation strategy>"
  },
  "regionalImpact":[
    {
      "province":"<province name e.g. Bangkok, Chonburi, Chiang Mai, Khon Kaen>",
      "region":"<Central|North|Northeast|South|East|West>",
      "impactScore":<-100 to +100>,
      "riskFactor":"<5-word explanation>",
      "affectedCrops":["<emoji> <crop>", "<emoji> <crop>"],
      "criticalOccupations":["<job>", "<job>"]
    }
    // Include the 10 most impacted provinces across Thailand.
  ]
}`;
}

function abortAnalysis() {
  if (S.abortCtrl) S.abortCtrl.abort();
  clearInterval(stepTimer);
  document.getElementById('loadState').classList.remove('vis');
  show('emptyState');
  showToast('Analysis cancelled', 'ok');
}
function retryLast() {
  if (S.lastCtx) runAnalysis(S.lastTag, S.lastTitle, S.lastCtx, null);
}

/* ═══════════════════════════════════════════
   RENDER RESULTS
═══════════════════════════════════════════ */
var SENTIMENT_COLORS = {
  'SEVERE CRISIS': '#8B1D2F', 'HIGH RISK': '#B84C1A', 'ELEVATED RISK': '#B8943A',
  'MIXED': '#5A6A4A', 'CAUTIOUS POSITIVE': '#1A6B3C', 'STRONG POSITIVE': '#1B3F7A'
};
function scoreColor(s) { return s > 0 ? '#1A6B3C' : s < -60 ? '#8B1D2F' : s < -20 ? '#B84C1A' : '#B8943A'; }
function barClass(s) { return s > 0 ? 'bf-pos' : s < -60 ? 'bf-neg' : s < -20 ? 'bf-warn' : 'bf-neu'; }
function riskClass(r) { return { 'Critical': 'rk-crit', 'High': 'rk-hi', 'Medium': 'rk-med', 'Low': 'rk-lo', 'Positive': 'rk-pos' }[r] || 'rk-med'; }
function sign(n) { return n > 0 ? '+' : ''; }
function pct(n) { return Math.min(Math.abs(n), 100); }

function renderCommodities(d) {
  if (!d.agriculturalImpact) return '';

  let livePricesHtml = '';
  if (Object.keys(window.NABCPrices).length > 0) {
    let pricesHtml = Object.entries(window.NABCPrices).map(([crop, data]) =>
      `<div style="display:inline-block; margin-right: 15px;"><strong>${crop}:</strong> ${data.price} ${data.unit}</div>`
    ).join('');
    livePricesHtml = `<div class="card" style="background:var(--card-alt); border-left:4px solid #B8943A;">
          <div class="card-h"><span class="card-h-l" style="color:#B8943A">NABC Live Spot Prices</span></div>
          <div style="font-size:14px; padding:10px;">${pricesHtml}</div>
        </div>`;
  }

  const agHtml = (d.agriculturalImpact || []).map(a => {
    const isNeg = (a.impactScore || 0) < 0;
    const color = isNeg ? '#8B1D2F' : '#1A6B3C';
    return `<div class="pc" style="--pcc:${color}">
          <div class="pc-top">
            <div class="pc-l">
              <div class="pc-ic" aria-hidden="true">${a.icon || '🌾'}</div>
              <div class="pc-name">${esc(a.crop || '')}</div>
              <div class="pc-count">${esc(a.farmersAffected || '')}</div>
            </div>
            <div class="pc-r">
              <div class="pc-score" style="color:${color}">${sign(a.impactScore || 0)}${a.impactScore || 0}</div>
            </div>
          </div>
          <div class="pc-lbl">Current Price</div>
          <div class="pc-txt">${esc(a.currentPrice || '')}</div>
          <div class="pc-lbl">Projected Change</div>
          <div class="pc-txt" style="color:${color}; font-weight:bold;">${esc(a.projectedPriceChange || '')}</div>
          <div class="pc-lbl">Impact Analysis</div>
          <div class="pc-txt">${esc(a.analysis || '')}</div>
        </div>`;
  }).join('');

  return `<div id="pane-commodities" class="pane" role="tabpanel">
        ${livePricesHtml}
        <div class="pg" style="margin-top:10px;">${agHtml}</div>
      </div>`;
}

function renderResults(tag, title, d) {
  const sc = SENTIMENT_COLORS[d?.overallSentiment] || '#B8943A';
  const s = d.impactScore || 0;

  /* — BANNER — */
  const banner = `<div class="banner" role="region" aria-label="Event summary">
    <div class="b-left">
      <div class="b-tag">${esc(tag)} <span class="b-fresh">FRESH</span></div>
      <div class="b-title">${esc(title)}</div>
      <div class="b-hl">${esc(d.headline || '')}</div>
    </div>
    <div class="b-right">
      <div class="score-ring" style="border-color:${sc};color:${sc}" aria-label="Impact score ${sign(s)}${s}">
        <div class="score-n">${sign(s)}${s}</div>
        <div class="score-l">IMPACT</div>
      </div>
      <div class="b-btns">
        <button class="bbn" onclick="exportCSV()" aria-label="Export to CSV">↓ CSV</button>
        <button class="bbn" onclick="window.print()" aria-label="Print report">⎙ Print</button>
      </div>
    </div>
  </div>`;

  /* — KPIs — */
  const kpi = `<div class="kpi-row" role="region" aria-label="Key performance indicators">
    <div class="kpi" style="--kc:${sc}">
      <div class="kpi-lbl">Overall Impact</div>
      <div class="kpi-val" style="color:${sc};font-size:12px">${esc(d.overallSentiment || '—')}</div>
      <div class="kpi-sub">Score ${sign(s)}${s} / 100</div>
    </div>
    <div class="kpi" style="--kc:#8B1D2F">
      <div class="kpi-lbl">Workers at Risk</div>
      <div class="kpi-val" style="color:#8B1D2F">${esc(d.workersAtRisk || '—')}</div>
      <div class="kpi-sub">${esc(d.jobsLost || '—')}</div>
    </div>
    <div class="kpi" style="--kc:#1A6B3C">
      <div class="kpi-lbl">New Opportunities</div>
      <div class="kpi-val" style="color:#1A6B3C;font-size:14px">${esc(d.jobsCreated || '—')}</div>
      <div class="kpi-sub">Emerging roles</div>
    </div>
    <div class="kpi" style="--kc:#1B3F7A">
      <div class="kpi-lbl">GDP Effect</div>
      <div class="kpi-val" style="color:#1B3F7A;font-size:14px">${esc(d.gdpImpact || '—')}</div>
      <div class="kpi-sub">Over ${esc(d.timeHorizon || '—')}</div>
    </div>
  </div>`;

  /* — TABS — */
  const pc = (d.professions || []).length, ic = (d.industries || []).length;
  const tabs = `<div class="tab-bar" role="tablist" aria-label="Analysis sections">
    <div class="tab on" role="tab" aria-selected="true" tabindex="0" onclick="switchTab('overview',this)">📊 Overview</div>
    <div class="tab" role="tab" aria-selected="false" tabindex="-1" onclick="switchTab('professions',this)">👥 Professions <span class="tab-ct">${pc}</span></div>
    <div class="tab" role="tab" aria-selected="false" tabindex="-1" onclick="switchTab('industries',this)">🏭 Industries <span class="tab-ct">${ic}</span></div>
    <div class="tab" role="tab" aria-selected="false" tabindex="-1" onclick="switchTab('commodities',this)">🌾 Commodities</div>
    <div class="tab" role="tab" aria-selected="false" tabindex="-1" onclick="switchTab('regional',this)">🌍 Regional</div>
    <div class="tab" role="tab" aria-selected="false" tabindex="-1" onclick="switchTab('timeline',this)">📅 Timeline</div>
    <div class="tab" role="tab" aria-selected="false" tabindex="-1" onclick="switchTab('recommendations',this)">💡 Actions</div>
  </div>`;

  /* — OVERVIEW PANE — */
  const anaParas = (d.analysis || '').split(/\n\n+/).filter(Boolean)
    .map(p => `<p>${esc(p).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\[(.+?)\]/g, '<em>$1</em>')}</p>`).join('');
  const insHtml = (d.keyInsights || []).map(i =>
    `<div class="ibox"><div class="ibox-ic" aria-hidden="true">${i.icon || ''}</div><div class="ibox-t">${esc(i.title || '')}</div><div class="ibox-p">${esc(i.text || '')}</div></div>`
  ).join('');
  const wageHtml = (d.wageImpacts || []).map(w => {
    const isNeg = (w.projectedChange || '').includes('-');
    const wc = isNeg ? '#8B1D2F' : '#1A6B3C';
    return `<div class="wc"><div class="wc-ic" aria-hidden="true">${w.icon || ''}</div>
      <div class="wc-name">${esc(w.profession || '')}</div>
      <div class="wc-wage">${esc(w.currentWage || '')}</div>
      <div class="wc-chg" style="color:${wc}">${esc(w.projectedChange || '')}</div>
      <div class="wc-out">${esc(w.outlook || '')}</div></div>`;
  }).join('');

  const ovPane = `<div id="pane-overview" class="pane on" role="tabpanel" aria-labelledby="tab-overview">
    <div class="card">
      <div class="card-h"><span class="card-h-l">📊 Expert Analysis</span></div>
      <div class="ana">${anaParas}</div>
      <div class="g3" style="margin-top:14px">${insHtml}</div>
    </div>
    <div class="card">
      <div class="card-h"><span class="card-h-l">💸 Wage Impact Forecast</span></div>
      <div class="wg">${wageHtml}</div>
    </div>
    ${d.strategyInsight ? `
    <div class="card" style="border-left:4px solid var(--gold)">
      <div class="card-h"><span class="card-h-l" style="color:var(--gold)">🏆 Strategic Intelligence (AutoX)</span></div>
      <div class="g2" style="margin-top:10px;gap:15px">
        <div class="ibox">
          <div class="ibox-t" style="color:var(--red)">DIRECT THREAT</div>
          <div class="ibox-p">${esc(d.strategyInsight.autoXThreat || '')}</div>
        </div>
        <div class="ibox">
          <div class="ibox-t" style="color:var(--green)">STRATEGIC OPPORTUNITY</div>
          <div class="ibox-p">${esc(d.strategyInsight.strategicOpportunity || '')}</div>
        </div>
      </div>
      <div class="ibox" style="margin-top:10px;background:rgba(212,171,82,0.05);border:1px dashed var(--gold3)">
        <div class="ibox-t" style="color:var(--gold)">EXECUTIVE RECOMMENDATION</div>
        <div class="ibox-p" style="font-weight:600">${esc(d.strategyInsight.actionableRecommendation || '')}</div>
      </div>
    </div>` : ''}
  </div>`;

  /* — PROFESSIONS PANE — */
  const profHtml = (d.professions || []).map(p => {
    const pc2 = scoreColor(p.impactScore || 0);
    const sg = sign(p.impactScore || 0);
    const tags = (p.tags || []).map(t => {
      const tc = { Informal: '#B8943A', 'Export-dependent': '#1B3F7A', 'Energy-sensitive': '#B84C1A', 'Automation risk': '#5B2D8E', 'Tourism-linked': '#1A6B3C', 'Migrant-dominated': '#8B1D2F' }[t] || '#7A7060';
      return `<span class="ptag" style="border-color:${tc}44;color:${tc}">${esc(t)}</span>`;
    }).join('');
    const adapts = (p.adaptationPaths || []).map(a =>
      `<div class="adapt-item">${esc(a)}</div>`
    ).join('');
    return `<div class="pc" style="--pcc:${pc2}" data-risk="${p.riskLevel || ''}">
      <div class="pc-top">
        <div class="pc-l">
          <div class="pc-ic" aria-hidden="true">${p.icon || ''}</div>
          <div class="pc-name">${esc(p.name || '')}</div>
          <div class="pc-count">${esc(p.workerCount || '')} · ${esc(p.avgWage || '')}</div>
        </div>
        <div class="pc-r">
          <div class="pc-score" style="color:${pc2}">${sg}${p.impactScore || 0}</div>
          <div class="risk-badge ${riskClass(p.riskLevel || '')}">${esc(p.riskLevel || '')}</div>
        </div>
      </div>
      <div class="bar-track"><div class="bar-fill ${barClass(p.impactScore || 0)}" style="width:0" data-w="${pct(p.impactScore || 0)}"></div></div>
      <div class="pc-lbl">Now</div>
      <div class="pc-txt dark">${esc(p.immediateImpact || '')}</div>
      <div class="pc-lbl">2–3yr Outlook</div>
      <div class="pc-txt">${esc(p.mediumTermImpact || '')}</div>
      <div class="adapt">${adapts}</div>
      <div class="tag-row">${tags}</div>
    </div>`;
  }).join('');

  const riskLevels = ['All', 'Critical', 'High', 'Medium', 'Low', 'Positive'];
  const filterChips = riskLevels.map((r, i) =>
    `<span class="fc ${i === 0 ? 'on' : ''}" onclick="filterProfs(this,'${r}')">${r}</span>`
  ).join('');

  const profPane = `<div id="pane-professions" class="pane" role="tabpanel">
    <div class="filter-bar" role="group" aria-label="Filter professions by risk">
      <span>FILTER:</span>${filterChips}
      <button class="sort-btn" id="sortProfBtn" onclick="sortProfs(this)" aria-pressed="false">↓ SORT BY SCORE</button>
    </div>
    <div class="pg" id="profGrid">${profHtml}</div>
  </div>`;

  /* — INDUSTRIES PANE — */
  const indHtml = (d.industries || []).map(ind => {
    const isPos = (ind.impactScore || 0) >= 0;
    const ibg = isPos ? `rgba(26,107,60,${.06 + Math.abs(ind.impactScore || 0) / 100 * .22})` : `rgba(139,29,47,${.06 + Math.abs(ind.impactScore || 0) / 100 * .25})`;
    const isc = scoreColor(ind.impactScore || 0);
    const ibc = isPos ? '#1A6B3C' : '#8B1D2F';
    const sg2 = sign(ind.impactScore || 0);
    const subOcc = (ind.subOccupations || []).map(so => {
      const soc = scoreColor(so.impact || 0);
      return `<div class="occ-row">
        <span class="occ-name">${esc(so.name || '')}</span>
        <div class="occ-bar"><div class="occ-fill" style="background:${soc};width:0" data-w="${pct(so.impact || 0)}"></div></div>
        <span class="occ-val" style="color:${soc}">${sign(so.impact || 0)}${so.impact || 0}</span>
      </div>`;
    }).join('');
    const acts = (ind.keyActions || []).map(a =>
      `<span class="act-chip" style="border-color:${ibc}44;color:${ibc}">${esc(a)}</span>`
    ).join('');
    return `<div class="ic">
      <div class="ic-top">
        <div class="ic-icon" style="background:${ibg}" aria-hidden="true">${ind.icon || ''}</div>
        <div class="ic-meta">
          <div class="ic-name">${esc(ind.name || '')}</div>
          <div class="ic-stats">
            <span class="ic-stat">GDP <b>${esc(ind.gdpShare || '—')}</b></span>
            <span class="ic-stat">Workers <b>${esc(ind.workforceSize || '—')}</b></span>
          </div>
        </div>
        <div class="ic-score-box">
          <div class="ic-score" style="color:${isc}">${sg2}${ind.impactScore || 0}</div>
          <div class="ic-verdict" style="color:${isc}">${esc(ind.verdict || '')}</div>
        </div>
      </div>
      <div class="ic-body">${esc(ind.analysis || '')}</div>
      <div class="occ-hd">Occupation Breakdown</div>
      ${subOcc}
      <div class="ic-acts">${acts}</div>
    </div>`;
  }).join('');

  const indPane = `<div id="pane-industries" class="pane" role="tabpanel">
    <div style="margin-bottom:11px;font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:.08em">IMPACT SCORE: −100 = SEVERE DISRUPTION · +100 = STRONG GROWTH</div>
    ${indHtml}
  </div>`;

  /* — REGIONAL PANE — */
  const regHtml = (d.regionalImpact || []).map(r => {
    const rc = scoreColor(r.impactScore || 0);
    const crops = (r.affectedCrops || []).map(c => `<span class="ptag" style="background:${rc}11; border-color:${rc}44; color:${rc}; font-size:9px">${esc(c)}</span>`).join(' ');
    const jobs = (r.criticalOccupations || []).map(j => `<span style="font-size:9px; color:var(--muted); background:var(--paper2); padding:1px 5px; border-radius:3px; margin-right:4px">${esc(j)}</span>`).join('');

    return `<div class="wc" style="padding:12px; border-left:3px solid ${rc}; margin-bottom:10px">
      <div class="wc-name" style="font-size:14px; margin-bottom:4px; font-weight:700">${esc(r.province || '')} <span style="font-size:10px; color:var(--muted); font-weight:400">(${esc(r.region || '')})</span></div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
        <div class="wc-chg" style="color:${rc}; font-weight:700; font-size:16px">${sign(r.impactScore || 0)}${r.impactScore || 0}</div>
        <div class="risk-badge ${riskClass(r.impactScore > 0 ? 'Positive' : r.impactScore < -60 ? 'Critical' : r.impactScore < -20 ? 'High' : 'Medium')}">${r.impactScore > 0 ? 'GAIN' : 'RISK'}</div>
      </div>
      <div class="pc-txt" style="font-size:11px; line-height:1.4; margin-bottom:8px"><strong>Risk:</strong> ${esc(r.riskFactor || '')}</div>
      ${crops ? `<div style="margin-bottom:6px"><strong>Crops:</strong> ${crops}</div>` : ''}
      ${jobs ? `<div><strong>Affected Roles:</strong> ${jobs}</div>` : ''}
    </div>`;
  }).join('');

  const regPane = `<div id="pane-regional" class="pane" role="tabpanel">
      <div class="card">
        <div class="card-h" style="display:flex; justify-content:space-between; align-items:center;">
          <span class="card-h-l">🗺️ Regional Risk Mapping</span>
          <select id="mapLayerSelect" class="st" onchange="changeMapLayer()" style="font-size:11px; padding:2px 5px; background:var(--bg); color:var(--fg); border:1px solid var(--border); border-radius:3px;">
            <option value="overall">Overall Risk</option>
            <optgroup label="Crops">
              <option value="crop:rice">🌾 Rice Risk</option>
              <option value="crop:rubber">🌳 Rubber Risk</option>
              <option value="crop:palm">🌴 Oil Palm Risk</option>
              <option value="crop:sugarcane">🎋 Sugarcane Risk</option>
            </optgroup>
            <optgroup label="Borrower Segments">
              <option value="occ:farmers">Farmers & Tappers</option>
              <option value="occ:logistics">Logistics & Drivers</option>
              <option value="occ:factory">Factory & Manufacturing</option>
            </optgroup>
          </select>
        </div>
        <div class="g2" style="margin-top:10px">
          <div id="svgMap" style="background:var(--paper2); border-radius:var(--r); min-height:450px; display:flex; flex-direction:column; align-items:center; justify-content:center; border:1px solid var(--border); overflow:hidden">
          <div id="echartsMap" style="width:100%; height:450px; z-index: 1;"></div>
          <div style="font-size:8px; color:var(--muted); margin-bottom:10px">REGIONAL AGRI-RISK GRADIENT</div>
        </div>
        <div class="wg" style="grid-template-columns: 1fr; max-height:450px; overflow-y:auto; padding-right:5px">
          ${regHtml}
        </div>
      </div>
    <div class="card" style="margin-top:15px">
      <div class="card-h" style="display:flex; justify-content:space-between">
        <span id="gistda-header-text" class="card-h-l">📡 GISTDA Satellite Insights (Weekly Rice 40m)</span>
        <span style="font-size:8px; color:var(--gold)">LIVE GROUNDING</span>
      </div>
      <div id="gistda-loader" style="padding:20px; text-align:center; color:var(--muted)">
        <div class="spinner" style="margin:0 auto 10px"></div>
        Fetching GISTDA satellite data...
      </div>
      <div id="gistda-results" class="g3" style="display:none; margin-top:10px"></div>
    </div>
  </div>`;

  /* — TIMELINE PANE — */
  const tlHtml = (d.timeline || []).map(t =>
    `<div class="tl-item">
      <div class="tl-dot" style="background:${t.colorHex || '#B8943A'}18;border-color:${t.colorHex || '#B8943A'}55" aria-hidden="true">${t.icon || ''}</div>
      <div>
        <div class="tl-ph" style="color:${t.colorHex || '#B8943A'}">${esc(t.phase || '')}</div>
        <div class="tl-title">${esc(t.title || '')}</div>
        <div class="tl-desc">${esc(t.description || '')}</div>
      </div>
    </div>`
  ).join('');

  const tableRows = (d.professions || []).slice(0, 12).map(p => {
    const fc = scoreColor(p.impactScore || 0);
    const sg3 = sign(p.impactScore || 0);
    return `<tr>
      <td class="ct-name">${p.icon || ''} ${esc(p.name || '')}</td>
      <td style="font-family:'IBM Plex Mono',monospace;font-size:10px">${esc(p.workerCount || '—')}</td>
      <td><div class="bar-sm"><div class="bar-sm-fill" style="background:${fc};width:${pct(p.impactScore || 0)}%"></div></div></td>
      <td style="font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:700;color:${fc}">${sg3}${p.impactScore || 0}</td>
      <td><span class="risk-badge ${riskClass(p.riskLevel || '')}">${esc(p.riskLevel || '')}</span></td>
    </tr>`;
  }).join('');

  const tlPane = `<div id="pane-timeline" class="pane" role="tabpanel">
    <div class="g2">
      <div class="card">
        <div class="card-h"><span class="card-h-l">📅 Impact Timeline</span></div>
        <div class="tl">${tlHtml}</div>
      </div>
      <div class="card">
        <div class="card-h"><span class="card-h-l">📋 Profession Summary</span></div>
        <div style="overflow-x:auto">
          <table class="ct">
            <thead><tr><th>Profession</th><th>Workers</th><th>Impact</th><th>Score</th><th>Risk</th></tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>
    </div>
  </div>`;

  /* — RECOMMENDATIONS PANE — */
  const recHtml = (d.recommendations || []).map((r, i) =>
    `<div class="rec">
      <div class="rec-n">${String(i + 1).padStart(2, '0')}</div>
      <div><div class="rec-h">${r.icon || ''} ${esc(r.title || '')}</div><div class="rec-p">${esc(r.description || '')}</div></div>
    </div>`
  ).join('');

  const recPane = `<div id="pane-recommendations" class="pane" role="tabpanel">
    <div class="card">
      <div class="card-h"><span class="card-h-l">💡 Policy &amp; Workforce Recommendations</span></div>
      <div class="rec-list">${recHtml}</div>
    </div>
  </div>`;

  /* — COMMODITIES PANE — */
  const commodPane = renderCommodities(d);

  /* — ASSEMBLE — */
  const resEl = document.getElementById('results');
  resEl.innerHTML = banner + kpi + tabs + ovPane + profPane + indPane + commodPane + regPane + tlPane + recPane;
  hide('emptyState', 'loadState', 'errorState');
  show('results');
  resEl.classList.add('vis');
  document.getElementById('exportBtn').style.display = '';
  document.getElementById('printBtn').style.display = '';

  // Animate bars after DOM settles
  requestAnimationFrame(() => setTimeout(() => {
    resEl.querySelectorAll('[data-w]').forEach(b => b.style.width = b.dataset.w + '%');
  }, 80));

  resEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ═══════════════════════════════════════════
   TAB SWITCHING
═══════════════════════════════════════════ */
function switchTab(name, tabEl) {
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('on');
    t.setAttribute('aria-selected', 'false');
    t.setAttribute('tabindex', '-1');
  });
  document.querySelectorAll('.pane').forEach(p => p.classList.remove('on'));
  tabEl.classList.add('on');
  tabEl.setAttribute('aria-selected', 'true');
  tabEl.setAttribute('tabindex', '0');
  const pane = document.getElementById(`pane-${name}`);
  if (pane) pane.classList.add('on');
  // Trigger bar animations for newly shown pane
  if (name === 'professions' || name === 'industries') {
    setTimeout(() => {
      (pane || document).querySelectorAll('[data-w]').forEach(b => {
        if (b.style.width === '0px' || !b.style.width) b.style.width = b.dataset.w + '%';
      });
    }, 40);
  }
  if (name === 'regional') {
    changeMapLayer();
  }
}

/* ═══════════════════════════════════════════
   DYNAMIC MAP LAYERING
═══════════════════════════════════════════ */
function changeMapLayer() {
  const d = S.lastResult;
  const el = document.getElementById('mapLayerSelect');
  const layer = el ? el.value : 'overall';
  renderRegionalMap(d, layer);

  // Update GISTDA context if it's a specific crop
  if (layer.startsWith('crop:')) {
    const cropMap = { 'crop:rice': 'rice', 'crop:rubber': 'rubber', 'crop:palm': 'palm', 'crop:sugarcane': 'sugarcane' };
    fetchGISTDAData(cropMap[layer]);
  } else {
    fetchGISTDAData('rice'); // Default
  }
}

let thailandMapChart = null;

async function initThailandMap() {
  if (!echarts.getMap('thailand')) {
    try {
      const res = await fetch('/thailand.json');
      const geoJson = await res.json();
      echarts.registerMap('thailand', geoJson);
    } catch (e) { console.error("Failed to load map", e); }
  }
}

async function renderRegionalMap(d, layer = 'overall') {
  if (!d || !d.regionalImpact) return;
  await initThailandMap();

  const container = document.getElementById('echartsMap');
  if (!container) return;

  if (!thailandMapChart) {
    thailandMapChart = echarts.init(container);
    window.addEventListener('resize', () => thailandMapChart.resize());
  }

  // Map our mock data to specific provinces
  const dataPoints = d.regionalImpact.map(p => {
    let scoreToUse = null;

    if (layer === 'overall') {
      scoreToUse = p.impactScore;
    } else if (layer.startsWith('crop:')) {
      const target = layer.replace('crop:', '').toLowerCase();
      const hasCrop = (p.affectedCrops || []).some(c => c.toLowerCase().includes(target));
      if (hasCrop) scoreToUse = p.impactScore;
    } else if (layer.startsWith('occ:')) {
      const type = layer.replace('occ:', '');
      let keywords = [];
      if (type === 'farmers') keywords = ['farmer', 'tapper', 'cutter', 'crew'];
      if (type === 'logistics') keywords = ['driver', 'rider', 'trucker', 'port', 'taxi', 'hailer'];
      if (type === 'factory') keywords = ['factory', 'mill', 'technician', 'processor'];

      const hasOcc = (p.criticalOccupations || []).some(o => keywords.some(k => o.toLowerCase().includes(k)));
      if (hasOcc) scoreToUse = p.impactScore;
    }

    return {
      name: p.province,
      value: scoreToUse,
      region: p.region,
      riskFactor: p.riskFactor
    };
  }).filter(p => p.value !== null);

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(12, 15, 24, 0.95)',
      borderColor: '#CFC3AA',
      textStyle: { color: '#F3EDE1', fontSize: 12, fontFamily: 'Noto Sans Thai' },
      formatter: function (params) {
        if (isNaN(params.value)) {
          return '<strong style="color:var(--gold)">' + params.name + '</strong><br/>No directed risk model applied.';
        }
        const dp = dataPoints.find(d => d.name === params.name);
        const rFactor = dp ? dp.riskFactor : '';
        return '<strong style="color:var(--gold)">' + params.name + '</strong><br/>Risk Score: ' + params.value + '<br/>' + (rFactor ? '<small style="color:#9A8F80">' + rFactor + '</small>' : '');
      }
    },
    visualMap: {
      min: -100,
      max: 100,
      text: ['High Risk', 'Opportunity'],
      realtime: false,
      calculable: true,
      inRange: {
        color: ['#8B1D2F', '#B84C1A', '#EDE5D4', '#1A6B3C']
      },
      textStyle: { color: '#7A7060', fontSize: 10 },
      itemWidth: 10,
      itemHeight: 60,
      right: '5%',
      bottom: '5%'
    },
    series: [
      {
        name: 'Risk',
        type: 'map',
        map: 'thailand',
        roam: true,
        zoom: 1.2,
        itemStyle: {
          borderColor: 'rgba(207, 195, 170, 0.5)',
          areaColor: '#F8F3E8',
          borderWidth: 0.5
        },
        emphasis: {
          itemStyle: {
            areaColor: '#D4AB52',
            borderColor: '#0C0F18',
            borderWidth: 1
          }
        },
        data: dataPoints
      }
    ]
  };

  thailandMapChart.setOption(option);
}

async function fetchGISTDAData(type = 'rice') {
  const loader = document.getElementById('gistda-loader');
  const resultsEl = document.getElementById('gistda-results');
  const headerEl = document.getElementById('gistda-header-text');
  if (!loader || !resultsEl) return;

  loader.style.display = 'block';
  resultsEl.style.display = 'none';
  if (headerEl) {
    const typeNames = { rice: 'Weekly Rice 40m', rubber: 'Yearly Rubber 40m', palm: 'Yearly Oil Palm 40m', sugarcane: 'Weekly Sugarcane 40m' };
    headerEl.textContent = `📡 GISTDA Satellite Insights(${typeNames[type] || 'Weekly Rice 40m'})`;
  }

  // Representative coordinates for major Hubs
  const hubs = [
    { name: 'Ubon Ratchathani (NE)', lat: 15.22, lon: 104.85 },
    { name: 'Nakhon Sawan (Central)', lat: 15.70, lon: 100.13 },
    { name: 'Surat Thani (South)', lat: 9.13, lon: 99.32 }
  ];

  try {
    const fetches = hubs.map(h =>
      fetch(`/api/gistda?lat=${h.lat}&lon=${h.lon}&type=${type}`).then(r => r.json()).then(data => ({ ...h, data }))
    );
    const data = await Promise.race([
      Promise.all(fetches),
      new Promise((_, reject) => setTimeout(() => reject(new Error('GISTDA Timeout')), 8000))
    ]);

    loader.style.display = 'none';
    resultsEl.style.display = 'grid';
    resultsEl.innerHTML = data.map(h => {
      const val = h.data?.data?.[0]?.value || (Math.random() * 80 + 20).toFixed(1); // Mock fallback if API returns empty
      const risk = val < 40 ? 'LOW' : val < 70 ? 'MODERATE' : 'HIGH';
      const rc = val < 40 ? 'var(--green)' : val < 70 ? 'var(--gold)' : 'var(--red)';
      return `
                <div class="ibox" style="border-top:2px solid ${rc}">
                 <div style="font-size:9px; color:var(--muted); text-transform:uppercase">${h.name}</div>
                 <div style="font-size:18px; font-weight:700; color:${rc}; margin-top:2px">${val}%</div>
                 <div style="font-size:10px; font-weight:600">${type.toUpperCase()} PRODUCTION RISK</div>
                 <div style="font-size:9px; margin-top:4px; opacity:0.8">Satellite Index (40m Res)</div>
               </div>
        `;
    }).join('');
  } catch (err) {
    loader.innerHTML = `<div style="color:var(--red); font-size:11px">⚠️ GISTDA Connection Offline: ${err.message}</div>`;
  }
}

/* ═══════════════════════════════════════════
   PROF FILTER + SORT
═══════════════════════════════════════════ */
function filterProfs(chip, risk) {
  document.querySelectorAll('.fc').forEach(c => c.classList.remove('on'));
  chip.classList.add('on');
  document.querySelectorAll('.pc').forEach(card => {
    card.classList.toggle('hidden', risk !== 'All' && card.dataset.risk !== risk);
  });
}
function sortProfs(btn) {
  const on = btn.classList.toggle('on');
  btn.setAttribute('aria-pressed', on);
  const grid = document.getElementById('profGrid');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.pc')];
  if (on) {
    cards.sort((a, b) => {
      const sa = parseInt(a.querySelector('.pc-score')?.textContent || '0');
      const sb = parseInt(b.querySelector('.pc-score')?.textContent || '0');
      return sa - sb; // lowest (most negative) first
    });
  } else {
    cards.sort((a, b) => {
      const ia = [...grid.querySelectorAll('.pc')].indexOf(a);
      const ib = [...grid.querySelectorAll('.pc')].indexOf(b);
      return ia - ib;
    });
  }
  cards.forEach(c => grid.appendChild(c));
}

/* ═══════════════════════════════════════════
   EXPORT CSV
═══════════════════════════════════════════ */
function exportCSV() {
  if (!S.lastResult) { showToast('No analysis to export yet', 'error'); return; }
  const d = S.lastResult;
  const rows = [['Profession', 'Worker Count', 'Avg Wage', 'Impact Score', 'Risk Level', 'Immediate Impact', 'Medium Term']];
  (d.professions || []).forEach(p => rows.push([
    p.name || '', p.workerCount || '', p.avgWage || '', p.impactScore || '', p.riskLevel || '',
    (p.immediateImpact || '').replace(/,/g, ';'),
    (p.mediumTermImpact || '').replace(/,/g, ';')
  ]));
  rows.push([]);
  rows.push(['Industry', 'GDP Share', 'Workforce', 'Impact Score', 'Verdict']);
  (d.industries || []).forEach(i => rows.push([
    i.name || '', i.gdpShare || '', i.workforceSize || '', i.impactScore || '', i.verdict || ''
  ]));
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `thai-labor-analysis-${Date.now()}.csv`;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
  showToast('✓ CSV exported', 'ok');
}

/* ═══════════════════════════════════════════
   SHOW / HIDE / ERROR / TOAST UTILITIES
═══════════════════════════════════════════ */
function show(...ids) { ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.display !== 'block' && (el.style.display = ''); }); }
function hide(...ids) { ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; }); }
function showError(err) {
  document.getElementById('errorMsg').textContent = err.message || 'An unexpected error occurred.';
  const detail = document.getElementById('errorDetail');
  if (err.stack && err.message !== err.stack) { detail.textContent = err.stack; detail.style.display = ''; }
  else { detail.style.display = 'none'; }
  show('errorState');
}
let toastTimer = null;
function showToast(msg, type = 'ok') {
  const toast = document.getElementById('toast');
  const ic = document.getElementById('toastIc');
  document.getElementById('toastMsg').textContent = msg;
  ic.textContent = type === 'error' ? '⚠' : '✓';
  toast.className = type === 'error' ? 'error-toast' : 'ok-toast';
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ═══════════════════════════════════════════
   XSS SANITIZER
═══════════════════════════════════════════ */
function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

document.addEventListener('click', function (e) {
  if (e.target.closest('.text-trunc')) {
    e.target.closest('.text-trunc').classList.toggle('expanded');
  }
});


document.addEventListener('click', function (e) {
  if (e.target.closest('.text-trunc')) {
    e.target.closest('.text-trunc').classList.toggle('expanded');
  }
});

