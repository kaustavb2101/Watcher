// Vercel Edge Function: Bank of Thailand (BOT) Open API — v3 Gateway
// HYBRID MODE: Live Fetch + Static Knowledge Base Fallback
import { BOT_MACRO_KB, BOT_META } from '../data/bot-macro.js';

export const config = { runtime: 'edge' };

const GATEWAY    = 'https://gateway.api.bot.or.th';
const BOT_KEY    = process.env.BOT_API_KEY_INTEREST;
const BOT_STATS  = process.env.BOT_API_KEY_STATS;

async function safeFetch(url, headers = {}, timeoutMs = 8000) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const resp = await fetch(url, { headers, signal: ctrl.signal });
        clearTimeout(timer);
        if (!resp.ok) return null;
        return await resp.json();
    } catch (e) {
        clearTimeout(timer);
        return null;
    }
}

function dateStr(offsetDays = 0) {
    return new Date(Date.now() + offsetDays * 86400000).toISOString().split('T')[0];
}

function extractPolicyRate(raw) {
    // BOT v3 policy_rate returns { result: { data: [{ value: "2.50", period: "...", ... }] } }
    // Earlier code incorrectly treated `data` as a scalar;
    const dataArr = raw?.result?.data;
    let val = NaN;
    let period = 'latest';
    let detail = null;
    if (Array.isArray(dataArr) && dataArr.length > 0) {
        // Sort descending by period to get most recent
        const sorted = [...dataArr].sort((a, b) => String(b.period || '').localeCompare(String(a.period || '')));
        const latest = sorted[0];
        val = parseFloat(latest?.value ?? latest?.rate ?? latest?.data);
        period = latest?.period || latest?.announcement_date || 'latest';
        detail = latest?.news_text_en?.substring(0, 120) || null;
    } else if (dataArr !== null && dataArr !== undefined) {
        // Scalar fallback (legacy format)
        val = parseFloat(dataArr);
        period = raw?.result?.announcement_date?.replace(/\//g, '-') || 'latest';
        detail = raw?.result?.news_text_en?.substring(0, 120) || null;
    }
    if (isNaN(val) || val <= 0) return null;
    return { value: val, period, detail };
}

function extractObservations(raw) {
    const obs = raw?.result?.series?.[0]?.observations;
    if (!Array.isArray(obs) || obs.length === 0) return null;
    for (let i = obs.length - 1; i >= 0; i--) {
        const val = parseFloat(obs[i]?.value);
        if (!isNaN(val)) {
            return { value: val, period: obs[i]?.period || 'latest' };
        }
    }
    return null;
}

export default async function handler(req) {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' }
        });
    }
    if (req.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    const hIR    = BOT_KEY   ? { 'Authorization': BOT_KEY,   'Accept': 'application/json' } : { 'Accept': 'application/json' };
    const hStats = BOT_STATS ? { 'Authorization': BOT_STATS, 'Accept': 'application/json' } : hIR;

    const today     = dateStr(0);
    const days30ago = dateStr(-30);
    const yr2ago    = dateStr(-730);

    // BOT PolicyRate v3 endpoint requires trailing slash before query params
    const [policyRaw, fxRaw, nplRaw, resRaw, m2Raw, creditRaw] = await Promise.all([
        safeFetch(`${GATEWAY}/PolicyRate/v3/policy_rate/?start_period=${days30ago}&end_period=${today}`, hIR),
        // FMEXRUSDAVGMDD015588 is the spot rate for USD/THB
        safeFetch(`${GATEWAY}/observations?series_code=FMEXRUSDAVGMDD015588&start_period=${dateStr(-7)}&end_period=${today}`, hStats),
        // FINPM00002 ended in 2019, trying to find successor or successor pattern
        safeFetch(`${GATEWAY}/observations?series_code=FINPM00003&start_period=2023-01-01&end_period=${today}`, hStats),
        // NEW: International Reserves
        safeFetch(`${GATEWAY}/observations?series_code=FMEXTD00010&start_period=${days30ago}&end_period=${today}`, hStats),
        // NEW: Broad Money M2
        safeFetch(`${GATEWAY}/observations?series_code=FMCOPS00001&start_period=${days30ago}&end_period=${today}`, hStats),
        // NEW: Private Credit
        safeFetch(`${GATEWAY}/observations?series_code=FMCOPS00010&start_period=${days30ago}&end_period=${today}`, hStats),
    ]);

    const livePolicy = extractPolicyRate(policyRaw);
    const liveFx     = extractObservations(fxRaw);
    const liveNpl    = extractObservations(nplRaw);
    const liveRes    = extractObservations(resRaw);
    const liveM2     = extractObservations(m2Raw);
    const liveCredit = extractObservations(creditRaw);

    // Merge with Knowledge Base Fallbacks
    const results = {
        policyRate: livePolicy || { ...BOT_MACRO_KB.policyRate, isFallback: true },
        usdThb:     liveFx     || { ...BOT_MACRO_KB.usdThb,     isFallback: true },
        nplRatio:   liveNpl    || { ...BOT_MACRO_KB.nplRatio,   isFallback: true },
        reserves:   liveRes    || { value: 220.5, unit: 'B USD', period: 'latest', isFallback: true },
        broadMoney: liveM2     || { value: 24.2, unit: 'T THB', period: 'latest', isFallback: true },
        creditGrowth: liveCredit || { value: 3.1, unit: '%', period: 'latest', isFallback: true },
        dataMode:   (livePolicy && liveFx) ? 'live' : 'hybrid-grounded',
        liveFields: [
            livePolicy && 'policyRate',
            liveFx && 'usdThb',
            liveNpl && 'nplRatio',
            liveRes && 'reserves',
            liveM2 && 'broadMoney',
            liveCredit && 'creditGrowth'
        ].filter(Boolean),
        meta: BOT_META,
        dataTimestamp: new Date().toISOString(),
        source: 'Bank of Thailand (Hybrid: Live + Static KB)'
    };

    results.macroSignals = buildMacroSignals(results);

    return new Response(JSON.stringify(results), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600'
        }
    });
}

function buildMacroSignals({ policyRate, usdThb, nplRatio }) {
    const signals = [];
    if (policyRate) {
        const stance = policyRate.value >= 2.5 ? 'tight' : policyRate.value >= 1.5 ? 'neutral' : 'accommodative';
        signals.push({ type: 'monetary_policy', text: `BOT policy rate ${policyRate.value}% — ${stance} monetary stance`, value: policyRate.value });
    }
    if (usdThb) {
        const pressure = usdThb.value > 35 ? 'weakening baht' : usdThb.value > 33 ? 'moderate baht' : 'strong baht';
        signals.push({ type: 'fx', text: `USD/THB ${usdThb.value} — ${pressure}`, value: usdThb.value });
    }
    if (nplRatio) {
        const stress = nplRatio.value > 3.0 ? 'elevated credit stress' : 'contained NPL';
        signals.push({ type: 'credit_quality', text: `NPL ${nplRatio.value}% — ${stress}`, value: nplRatio.value });
    }
    return signals;
}
