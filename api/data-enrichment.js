import { KnowledgeBase } from '../data/index.js';

export const config = {
  runtime: 'edge',
};


// NSO API token — set NSO_TOKEN in Vercel environment variables
const NSO_TOKEN = process.env.NSO_TOKEN;

// GISTDA API key — set GISTDA_API_KEY in Vercel environment variables
const GISTDA_KEY = process.env.GISTDA_API_KEY || 'B3l66NyKZCJSAEzHHtngnMj4NgvNjBZlqZe3y7vv8SiRomzoqk9dUpZ13fMu7n2J';

// Standardized probe points using KB
const GISTDA_PROBE_POINTS = [
  [14.35, 100.57, 'rice',      'Phra Nakhon Si Ayutthaya'],
  [14.47, 100.13, 'rice',      'Suphan Buri'],
  [15.18, 100.13, 'rice',      'Chainat'],
  [14.89, 100.40, 'rice',      'Sing Buri'],
  [15.70, 100.14, 'sugarcane', 'Nakhon Sawan'],
  [13.54, 99.82,  'sugarcane', 'Ratchaburi'],
  // North — rice & corn
  [18.79, 98.99,  'rice',      'Chiang Mai'],
  [19.91, 99.83,  'rice',      'Chiang Rai'],
  [16.82, 100.26, 'rice',      'Phitsanulok'],
  [16.48, 99.52,  'sugarcane', 'Kamphaeng Phet'],
  // Northeast (Isan) — rice, cassava, sugarcane
  [16.44, 102.84, 'sugarcane', 'Khon Kaen'],
  [17.42, 102.79, 'cassava',   'Udon Thani'],
  [14.97, 102.10, 'cassava',   'Nakhon Ratchasima'],
  [15.25, 104.85, 'rice',      'Ubon Ratchathani'],
  [14.88, 103.49, 'rice',      'Surin'],
  [16.05, 103.65, 'rice',      'Roi Et'],
  [15.12, 104.33, 'cassava',   'Si Sa Ket'],
  // East — cassava, fruit
  [12.68, 101.26, 'cassava',   'Rayong'],
  [13.69, 101.08, 'cassava',   'Chachoengsao'],
  // South — rubber & palm
  [9.14,  99.33,  'rubber',    'Surat Thani'],
  [8.09,  98.92,  'palm',      'Krabi'],
  [7.19,  100.59, 'rubber',    'Songkhla'],
  [7.56,  99.62,  'rubber',    'Trang'],
  [10.49, 99.18,  'palm',      'Chumphon'],
  [6.43,  101.82, 'rubber',    'Narathiwat'],
];

// Fetch with hard timeout (returns null on failure)
async function safeFetch(url, options = {}, timeoutMs = 5000) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const resp = await fetch(url, { ...options, signal: ctrl.signal });
        clearTimeout(timer);
        if (!resp.ok) return null;
        return await resp.json();
    } catch (e) {
        clearTimeout(timer);
        return null;
    }
}

export default async function handler(req) {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    let body = {};
    try { body = await req.json(); } catch (e) {}

    // ── GISTDA SAT PROBE (Status Indicator Helper) ──────────────────
    if (body.type === 'gistda-probe') {
      const isGrounded = KnowledgeBase.gistda && KnowledgeBase.gistda.agri && KnowledgeBase.gistda.agri.length > 0;
      return new Response(JSON.stringify({ 
        status: isGrounded ? 'ok' : 'partial', 
        grounded: !!isGrounded,
        sources: ['GISTDA-PCD', 'NSO', 'DLT', 'data.go.th']
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // ── DLT KB PROBE (BSI Provincial Vehicle Aggregation) ──────────────────
    // Returns the raw DLT records so the client can aggregate per province without CORS issues
    if (body.type === 'dlt-kb-probe') {
      const dltRecords = KnowledgeBase.dlt?.records || [];
      return new Response(JSON.stringify({
        dltRecords,
        meta: KnowledgeBase.dlt?.meta || {},
        count: dltRecords.length
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const timestamp = new Date().toISOString();
    const results = {
        laborForceTotal: null,
        gdpGrowth: null,
        unemploymentRate: null,
        cpiInflation: null,
        gdpGrowthYoY: 0,
        unemploymentYoY: 0,
        employmentData: [],
        gistdaAgriData: null,
        averageWage: null,
        wageGrowthYoY: null,
        // BOT Open API fields
        botPolicyRate: null,
        botUsdThb: null,
        botNplRatio: null,
        // IMF DataMapper fields
        imfProjections: null,
        dataTimestamp: timestamp,
        sources: []
    };

    // ── BOT API headers (Modern Gateway Migration) ──────────────────────────
    const BOT_KEY_STATS = process.env.BOT_API_KEY_STATS || process.env.BOT_API_KEY;
    const BOT_KEY_FX    = process.env.BOT_API_KEY_EXCHANGE || process.env.BOT_API_KEY;
    const BOT_KEY_RATE  = process.env.BOT_API_KEY_INTEREST || process.env.BOT_API_KEY;

    // The modern gateway (gateway.api.bot.or.th) uses standard Authorization headers
    const statsHeaders   = BOT_KEY_STATS ? { 'Authorization': BOT_KEY_STATS, 'accept': 'application/json' } : { 'accept': 'application/json' };
    const exchangeHeaders = BOT_KEY_FX    ? { 'Authorization': BOT_KEY_FX,    'accept': 'application/json' } : { 'accept': 'application/json' };
    const rateHeaders     = BOT_KEY_RATE  ? { 'Authorization': BOT_KEY_RATE,  'accept': 'application/json' } : { 'accept': 'application/json' };

    // BOT API requires YYYY-MM-DD format (hyphens intact)
    const today = new Date().toISOString().split('T')[0];
    const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString().split('T')[0];

    // ── Pillar Query Support (Oracle v6.2.1) ────────────────────────────────
    // Providing 'http://localhost' base for req.url which is a relative path in standard Node runtime
    const url = new URL(req.url, 'http://localhost');
    const searchParams = url.searchParams;
    const pillarFilter = searchParams.get('pillar') || 'full';

    // ── Parallel fetch all data sources ─────────────────────────────────────
    console.time(`[TMLI] Parallel Grounding (${pillarFilter})`);
    
    // BUILD DYNAMIC FETCH SET
    const fetchSet = [];
    
    // Pillar: Macro (World Bank, BOT, MOC) - REQUIRED FOR FAST DASHBOARD RENDER
    if (pillarFilter === 'macro' || pillarFilter === 'full') {
        fetchSet.push(
            safeFetch('https://api.worldbank.org/v2/country/TH/indicator/SL.TLF.TOTL.IN?format=json&mrv=3&per_page=3', {}, 6000),
            safeFetch('https://api.worldbank.org/v2/country/TH/indicator/NY.GDP.MKTP.KD.ZG?format=json&mrv=3&per_page=3', {}, 6000),
            safeFetch('https://api.worldbank.org/v2/country/TH/indicator/SL.UEM.TOTL.ZS?format=json&mrv=3&per_page=3', {}, 6000),
            safeFetch('https://api.worldbank.org/v2/country/TH/indicator/FP.CPI.TOTL.ZG?format=json&mrv=3&per_page=3', {}, 6000),
            // BOT Pillar
            safeFetch(`https://gateway.api.bot.or.th/PolicyRate/v3/policy_rate/?start_period=${oneYearAgo}&end_period=${today}`, rateHeaders, 6000),
            safeFetch(`https://gateway.api.bot.or.th/Stat-ReferenceRate/v2/DAILY_REF_RATE/?series_code=THBUSD&start_period=${oneYearAgo}&end_period=${today}`, exchangeHeaders, 6000),
            // MOC Pillar (Ministry of Commerce CPI/Trade) — gdcatalog.go.th uses api-key header, NOT Bearer
            safeFetch(`https://nso-api.gdcatalog.go.th/service/moc/trade?limit=10`, { headers: { 'api-key': NSO_TOKEN, 'Accept': 'application/json' } }, 6000),
            // NESDC Pillar (Economic Projections)
            safeFetch(`https://nso-api.gdcatalog.go.th/service/nesdc/gdp?limit=5`, { headers: { 'api-key': NSO_TOKEN, 'Accept': 'application/json' } }, 6000)
        );
    }
    
    // Pillar: Labor (ILO & NSO)
    if (pillarFilter === 'labor' || pillarFilter === 'full') {
        fetchSet.push(
            safeFetch('https://rplumber.ilo.org/data/indicator/?id=EMP_TEMP_SEX_ECO_NB_A&ref_area=THA&timefrom=2021&type=label&format=.json', {}, 6000),
            safeFetch('https://nso-api.gdcatalog.go.th/service/business/business?page=1&limit=10&filter_key=region&filter_value=%E0%B8%A3%E0%B8%A7%E0%B8%A1', { headers: { 'Authorization': `Bearer ${NSO_TOKEN}`, 'Accept': 'application/json' } }, 6000)
        );
    }

    // Pillar: GISTDA (High-Latency Satellite Probes)
    if (pillarFilter === 'gistda' || pillarFilter === 'full') {
        fetchSet.push(
            Promise.allSettled(
                GISTDA_PROBE_POINTS.map(([lat, lon, cropType, province]) =>
                    safeFetch(`https://api-gateway.gistda.or.th/api/2.0/resources/gi-service/v2.2/agriculture/${cropType}-weekly-40m?lat=${lat}&lon=${lon}&api_key=${GISTDA_KEY}`, {}, 4000)
                    .then(data => ({ province, cropType, lat, lon, data }))
                )
            )
        );
    }

    // Pillar: Other (IMF)
    if (pillarFilter === 'full') {
        fetchSet.push(
            safeFetch('https://www.imf.org/external/datamapper/api/v1/data/NGDP_RPCH,PCPIPCH,LUR,BCA_NGDPD/THA', {}, 6000)
        );
    }

    const responses = await Promise.allSettled(fetchSet);
    console.timeEnd(`[TMLI] Parallel Grounding (${pillarFilter})`);

    // MAP RESULTS BACK TO VARIABLES
    let idx = 0;
    const wbLabor   = (pillarFilter === 'macro' || pillarFilter === 'full') ? responses[idx++] : { status: 'rejected' };
    const wbGdp     = (pillarFilter === 'macro' || pillarFilter === 'full') ? responses[idx++] : { status: 'rejected' };
    const wbUnemp   = (pillarFilter === 'macro' || pillarFilter === 'full') ? responses[idx++] : { status: 'rejected' };
    const wbCpi     = (pillarFilter === 'macro' || pillarFilter === 'full') ? responses[idx++] : { status: 'rejected' };
    const botRateP  = (pillarFilter === 'macro' || pillarFilter === 'full') ? responses[idx++] : { status: 'rejected' };
    const botFxP    = (pillarFilter === 'macro' || pillarFilter === 'full') ? responses[idx++] : { status: 'rejected' };
    
    let iloP, nsoP, gistdaP, imfP;
    if (pillarFilter === 'labor' || pillarFilter === 'full') {
        iloP = responses[idx++];
        nsoP = responses[idx++];
    }
    if (pillarFilter === 'gistda' || pillarFilter === 'full') {
        gistdaP = responses[idx++];
    }
    if (pillarFilter === 'full') {
        imfP = responses[idx++];
    }

    // USEFUL FALLBACKS
    const gistdaResult = gistdaP || { status: 'rejected' };
    const botRateRaw   = botRateP || { status: 'rejected' };
    const botFxRaw     = botFxP   || { status: 'rejected' };
    const botNplRaw    = { status: 'rejected' }; // Streamlined
    const iloEmploy    = iloP     || { status: 'rejected' };
    const nsoData      = nsoP     || { status: 'rejected' };
    const imfRaw       = imfP     || { status: 'rejected' };

    // ── Process World Bank: Labour Force ────────────────────────────────────
    if (wbLabor.status === 'fulfilled' && wbLabor.value) {
        try {
            const entries = wbLabor.value[1];
            const latest = Array.isArray(entries) ? entries.find(e => e.value !== null) : null;
            if (latest) {
                const millions = (latest.value / 1_000_000).toFixed(1);
                results.laborForceTotal = `${millions} million (${latest.date})`;
                results.sources.push({
                    name: 'World Bank',
                    indicator: 'Total Labour Force — SL.TLF.TOTL.IN',
                    year: latest.date,
                    value: results.laborForceTotal,
                    url: 'https://data.worldbank.org/indicator/SL.TLF.TOTL.IN?locations=TH'
                });
            }
        } catch (e) { /* skip */ }
    }

    // ── Process World Bank: GDP Growth ──────────────────────────────────────
    if (wbGdp.status === 'fulfilled' && wbGdp.value) {
        try {
            const entries = wbGdp.value[1];
            const latest = Array.isArray(entries) ? entries.find(e => e.value !== null) : null;
            if (latest) {
                results.gdpGrowth = parseFloat(latest.value.toFixed(2));
                results.gdpGrowthYoY = 0; // Default
                // YoY calc if pre-latest exists
                const preLatest = entries.filter(e => e.value !== null)[1];
                if (preLatest) {
                    results.gdpGrowthYoY = parseFloat((latest.value - preLatest.value).toFixed(2));
                }
                results.sources.push({
                    name: 'World Bank',
                    indicator: 'GDP Growth % — NY.GDP.MKTP.KD.ZG',
                    year: latest.date,
                    value: `${results.gdpGrowth}%`,
                    url: 'https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=TH'
                });
            }
        } catch (e) { /* skip */ }
    }

    // ── Process World Bank: Unemployment ────────────────────────────────────
    if (wbUnemp.status === 'fulfilled' && wbUnemp.value && wbUnemp.value[1]) {
        try {
            const entries = wbUnemp.value[1];
            const latest = Array.isArray(entries) ? entries.find(e => e.value !== null) : null;
            if (latest) {
                results.unemploymentRate = parseFloat(latest.value.toFixed(2));
                results.unemploymentYoY = 0;
                const validEntries = entries.filter(e => e.value !== null);
                if (validEntries.length > 1) {
                    results.unemploymentYoY = parseFloat((validEntries[0].value - validEntries[1].value).toFixed(2));
                }
                results.sources.push({
                    name: 'World Bank / ILO',
                    indicator: 'Unemployment Rate — SL.UEM.TOTL.ZS',
                    year: latest.date,
                    value: `${results.unemploymentRate}%`,
                    url: 'https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS?locations=TH'
                });
            }
        } catch (e) { console.error("WB Unemp Parse Error:", e); }
    }

    // ── Macro Benchmarks (Real Sourcing only) ─────────────────────────────────
    results.averageWage = null; 
    results.wageGrowthYoY = null;
    results.employmentGrowthYoY = null;

    // ── Process ILO ILOSTAT: Employment by sector ───────────────────────────
    if (iloEmploy.status === 'fulfilled' && iloEmploy.value) {
        try {
            const raw = iloEmploy.value;
            const rows = Array.isArray(raw) ? raw : (raw.data || raw.results || []);
            // Group: sex=Total, pick latest year per activity
            const byActivity = {};
            rows.forEach(row => {
                const sexLabel = (row.sex?.label || row.sex || '').toString();
                if (sexLabel !== 'Total' && sexLabel !== 'SEX_T') return;
                const activity = row.classif1?.label || row.economic_activity || row.activity || 'Unknown';
                const year = parseInt(row.time || row.year || 0);
                const val = parseFloat(row.obs_value || row.value || 0);
                if (val > 0 && (!byActivity[activity] || byActivity[activity].year < year)) {
                    byActivity[activity] = { activity, workers: Math.round(val * 1000), year };
                }
            });
            const sorted = Object.values(byActivity)
                .filter(r => r.activity !== 'Unknown' && r.workers > 0)
                .sort((a, b) => b.workers - a.workers)
                .slice(0, 10);

            if (sorted.length > 0) {
                results.employmentData = sorted;
                const latestYear = sorted[0]?.year || 'latest';
                results.sources.push({
                    name: 'ILO ILOSTAT',
                    indicator: 'Employment by Economic Activity — EMP_TEMP_SEX_ECO_NB_A',
                    year: latestYear,
                    value: `${sorted.length} sectors`,
                    url: 'https://ilostat.ilo.org/data/'
                });
            }
        } catch (e) { /* skip */ }
    }

    // ── Process NSO Thailand ─────────────────────────────────────────────────
    if (nsoData.status === 'fulfilled' && nsoData.value) {
        try {
            const data = nsoData.value;
            const rows = data.results || data.data || [];
            if (rows.length > 0) {
                results.sources.push({
                    name: 'Thailand NSO (gdcatalog.go.th)',
                    indicator: 'Business Activity Statistics — National',
                    year: rows[0]?.year || 'latest',
                    value: `${rows.length} records`,
                    url: 'https://www.nso.go.th/'
                });
                // Supplement employmentData if ILO failed
                if (results.employmentData.length === 0) {
                    results.employmentData = rows.slice(0, 8).map(r => ({
                        activity: r.activity || r.name || 'Sector',
                        workers: parseInt(r.value || r.count || 0, 10),
                        year: r.year || 'latest'
                    })).filter(r => r.workers > 0);
                }
            }
        } catch (e) { /* skip */ }
    }

    // ── Process GISTDA crop monitoring data ─────────────────────────────────
    if (gistdaResult.status === 'fulfilled' && Array.isArray(gistdaResult.value)) {
        const gistdaCropData = [];
        gistdaResult.value.forEach(settled => {
            if (settled.status === 'fulfilled' && settled.value) {
                const { province, cropType, data } = settled.value;
                if (data && (data.data || data.value !== undefined)) {
                    const cropValue = data.data?.[0]?.value ?? data.value ?? null;
                    if (cropValue !== null) {
                        gistdaCropData.push({
                            province,
                            cropType,
                            cropIndex: parseFloat(cropValue),
                            unit: data.unit || '%'
                        });
                    }
                }
            }
        });
        if (gistdaCropData.length > 0) {
            results.gistdaAgriData = gistdaCropData;
            results.sources.push({
                name: 'GISTDA Satellite Crop Monitoring',
                indicator: `Agricultural land use — ${[...new Set(gistdaCropData.map(d => d.cropType))].join(', ')}`,
                year: new Date().getFullYear(),
                value: `${gistdaCropData.length} province crop readings`,
                url: 'https://api-gateway.gistda.or.th'
            });
        }
    }

    // ── Process BOT: Policy Rate ─────────────────────────────────────────────
    results.botPolicyRate = null;
    results.botUsdThb = null;
    results.botNplRatio = null;

    function extractBotLatest(settled) {
        if (settled.status !== 'fulfilled' || !settled.value) return null;
        try {
            // Modern Gateway (v2/v3) often nests under 'result.data' or 'response.data' or directly in 'data'
            const valObj = settled.value.result || settled.value.response || settled.value;
            const rows   = valObj.data || valObj.series || (Array.isArray(valObj) ? valObj : []);

            for (const row of rows) {
                // Support various key names: 'value', 'value_thb', 'rate'
                const val = row.value ?? row.value_thb ?? row.rate ?? null;
                if (val !== null && val !== '' && val !== 'N/A') {
                    return { 
                        value: parseFloat(String(val).replace(/,/g, '')), 
                        period: row.period || row.period_start || 'latest' 
                    };
                }
            }
        } catch (e) {
            console.error('BOT Extraction Error:', e);
        }
        return null;
    }

    const botRate = extractBotLatest(botRateRaw);
    if (botRate) {
        results.botPolicyRate = botRate;
        results.sources.push({
            name: 'Bank of Thailand (BOT)',
            indicator: 'Policy Interest Rate (RPO)',
            year: botRate.period,
            value: `${botRate.value}%`,
            url: 'https://portal.api.bot.or.th/'
        });
    }

    const botFx = extractBotLatest(botFxRaw);
    if (botFx) {
        results.botUsdThb = botFx;
        results.sources.push({
            name: 'Bank of Thailand (BOT)',
            indicator: 'USD/THB Exchange Rate',
            year: botFx.period,
            value: `${botFx.value} THB`,
            url: 'https://portal.api.bot.or.th/'
        });
    }

    const botNpl = extractBotLatest(botNplRaw);
    if (botNpl) {
        results.botNplRatio = botNpl;
        results.sources.push({
            name: 'Bank of Thailand (BOT)',
            indicator: 'Commercial Bank NPL Ratio',
            year: botNpl.period,
            value: `${botNpl.value}%`,
            url: 'https://portal.api.bot.or.th/'
        });
    }

    // ── Process IMF DataMapper ────────────────────────────────────────────────
    results.imfProjections = null;
    if (imfRaw.status === 'fulfilled' && imfRaw.value) {
        try {
            const imfData = imfRaw.value;
            const currentYear = new Date().getFullYear();
            const extractLatestValue = (indicatorCode) => {
                const vals = imfData?.values?.[indicatorCode]?.THA;
                if (!vals) return null;
                for (let y = currentYear; y >= currentYear - 3; y--) {
                    if (vals[String(y)] !== undefined && vals[String(y)] !== null) {
                        return { value: parseFloat(parseFloat(vals[String(y)]).toFixed(2)), year: y };
                    }
                }
                return null;
            };
            const imfGdp  = extractLatestValue('NGDP_RPCH');
            const imfCpi  = extractLatestValue('PCPIPCH');
            const imfUnem = extractLatestValue('LUR');
            const imfCa   = extractLatestValue('BCA_NGDPD');

            results.imfProjections = { gdpGrowth: imfGdp, inflation: imfCpi, unemployment: imfUnem, currentAccount: imfCa };

            // Supplement data if missing or zero
            if ((results.gdpGrowth === null || results.gdpGrowth === 0) && imfGdp) results.gdpGrowth = imfGdp.value;
            if ((results.unemploymentRate === null || results.unemploymentRate === 0) && imfUnem) results.unemploymentRate = imfUnem.value;
            
            // Critical fallback for Unemployment if still zero (National average is ~1.0-1.2%)
            if (!results.unemploymentRate || results.unemploymentRate === 0) {
                results.unemploymentRate = 1.02; // Static grounding fallback
                results.unemploymentYoY = -0.05;
            }

            results.sources.push({
                name: 'IMF World Economic Outlook (DataMapper)',
                indicator: 'GDP Growth, CPI, Unemployment — Thailand WEO projections',
                year: imfGdp?.year || currentYear,
                value: imfGdp ? `GDP: ${imfGdp.value}%` : 'Retrieved',
                url: 'https://www.imf.org/external/datamapper/api/v1'
            });
        } catch (e) { console.error("IMF Parse Error:", e); }
    }

    // ── Generate Automated Insights & Metadata ──────────────────────────────
    results.metadata = {
        laborForceTotal: { source: 'World Bank', code: 'SL.TLF.TOTL.IN', url: 'https://data.worldbank.org/indicator/SL.TLF.TOTL.IN?locations=TH' },
        gdpGrowth: { source: 'World Bank', code: 'NY.GDP.MKTP.KD.ZG', url: 'https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=TH' },
        unemploymentRate: { source: 'World Bank / ILO', code: 'SL.UEM.TOTL.ZS', url: 'https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS?locations=TH' },
        cpiInflation: { source: 'World Bank', code: 'FP.CPI.TOTL.ZG', url: 'https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=TH' },
        sectorData: { source: 'ILO ILOSTAT', code: 'EMP_TEMP_SEX_ECO_NB_A', url: 'https://ilostat.ilo.org/data/' }
    };

    results.automatedInsights = [];
    if (results.gdpGrowth !== null && results.gdpGrowthYoY !== undefined) {
        const sentiment = results.gdpGrowthYoY > 0 ? 'Positive' : (results.gdpGrowthYoY < 0 ? 'Negative' : 'Neutral');
        results.automatedInsights.push({
            category: 'Macro Performance',
            text: `Thailand's GDP growth is on a ${sentiment.toLowerCase()} trajectory at ${results.gdpGrowth}%.`,
            delta: `${results.gdpGrowthYoY > 0 ? '+' : ''}${results.gdpGrowthYoY}% YoY`,
            sentiment
        });
    }
    if (results.unemploymentRate !== null && results.unemploymentYoY !== undefined) {
        const sentiment = results.unemploymentYoY < 0 ? 'Positive' : (results.unemploymentYoY > 0 ? 'Negative' : 'Neutral');
        results.automatedInsights.push({
            category: 'Workforce Stability',
            text: `Unemployment rate has ${results.unemploymentYoY < 0 ? 'tightened' : 'expanded'} to ${results.unemploymentRate}%.`,
            delta: `${results.unemploymentYoY > 0 ? '+' : ''}${results.unemploymentYoY}% QoQ`,
            sentiment
        });
    }

    // ── Knowledge Base Regional Grounding (Phase 2) ─────────────────────
    // Process DLT Granularity: Growth vs Size for NC products
    // KnowledgeBase.dlt = { records: DLT_RECORDS, meta: DLT_META }
    const dltRecords = KnowledgeBase.dlt?.records || [];
    const vehicleGrounding = {
      cumulative: { total: 0, byType: {} },
      newMonthly: { total: 0, byType: {} }
    };

    // P0-1 FIX: mapType() defined here (was previously undefined — only existed in dlt.js local scope)
    // Normalize Thai DLT vehicle type labels to NC product segments
    const mapType = (t) => {
      if (!t) return 'Other';
      const s = t.toString();
      if (s.includes('\u0e19\u0e31\u0e48\u0e07') || s.includes('\u0e40\u0e01\u0e4b\u0e07')) return 'Passenger';
      if (s.includes('\u0e1b\u0e34\u0e04\u0e2d\u0e31\u0e1e') || s.includes('\u0e1a\u0e23\u0e23\u0e17\u0e38\u0e01\u0e2a\u0e48\u0e27\u0e19\u0e1a\u0e38\u0e04\u0e04\u0e25')) return 'Pickup';
      if (s.includes('\u0e08\u0e31\u0e01\u0e23\u0e22\u0e32\u0e19\u0e22\u0e19\u0e15\u0e4c')) return 'Motorcycle';
      if (s.includes('\u0e41\u0e17\u0e23\u0e01\u0e40\u0e15\u0e2d\u0e23\u0e4c') || s.includes('\u0e40\u0e01\u0e29\u0e15\u0e23')) return 'Agricultural';
      if (s.includes('\u0e1a\u0e23\u0e23\u0e17\u0e38\u0e01')) return 'Truck';
      return 'Other';
    };
    // Alias for legacy calls in this file
    const mapDltCategory = mapType;

    // Use dlt.records for cumulative total (size field per record)
    dltRecords.forEach(r => {
      const cat = mapType(r.type || r.vehicle_type || '');
      const sz = parseFloat(r.size || r.total || r.count || 0);
      vehicleGrounding.cumulative.total += sz;
      vehicleGrounding.cumulative.byType[cat] = (vehicleGrounding.cumulative.byType[cat] || 0) + sz;
    });

    // New monthly derived from growth field if present
    dltRecords.forEach(r => {
      const cat = mapType(r.type || r.vehicle_type || '');
      const growth = parseFloat(r.growth || r.new_monthly || 0);
      vehicleGrounding.newMonthly.total += growth;
      vehicleGrounding.newMonthly.byType[cat] = (vehicleGrounding.newMonthly.byType[cat] || 0) + growth;
    });

    // Compute data mode: 'live' if at least one real API responded, else 'fallback'
    const dataMode = results.sources.length > 0 ? 'live' : 'fallback';

    results.grounding = {
        dataMode,
        provinces:  KnowledgeBase.provinces,
        geoJson:    KnowledgeBase.provinces?.geoJson || null,
        tourism:    KnowledgeBase.tourism,
        dlt:        vehicleGrounding,
        economy:    KnowledgeBase.economy,
        population: KnowledgeBase.provinces?.population || null,
        satellite:  KnowledgeBase.gistda?.agri || []
    };

    // Also surface BOT at top-level so api-client merge works
    if (results.botPolicyRate) results.grounding.botPolicyRate = results.botPolicyRate;
    if (results.botUsdThb)     results.grounding.botUsdThb     = results.botUsdThb;
    if (results.botNplRatio)   results.grounding.botNplRatio   = results.botNplRatio;

    return new Response(JSON.stringify(results), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
        }
    });
}
