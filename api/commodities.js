// Vercel Edge Function: Commodity Prices
// HYBRID MODE: Live Fetch (Oil) + Static Knowledge Base (Agriculture/Fallbacks)
import { COMMODITIES_KB, COMMODITY_META } from '../data/commodities-worldbank.js';
import { standardizeProvince } from '../data/provinces.js';

export const config = { runtime: 'edge' };

const WB_BASE   = 'https://api.worldbank.org/v2/country/all/indicator';

async function safeFetch(url, options = {}, timeoutMs = 8000) {
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

function wbLatest(raw) {
    try {
        const entries = raw?.[1];
        if (!Array.isArray(entries)) return null;
        const curr = entries.find(e => e.value !== null && e.value !== undefined);
        const prev = entries.filter(e => e.value !== null && e.value !== undefined)[1];
        if (!curr) return null;
        const val  = parseFloat(curr.value.toFixed(3));
        const chg  = prev ? parseFloat((curr.value - prev.value).toFixed(3)) : null;
        const pct  = prev ? parseFloat(((curr.value - prev.value) / prev.value * 100).toFixed(2)) : null;
        return { value: val, period: curr.date, change: chg, changePct: pct };
    } catch (e) { return null; }
}

export default async function handler(req) {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' }
        });
    }

    const WB = (code) => safeFetch(`${WB_BASE}/${code}?format=json&mrv=3&per_page=3`, {}, 10000);

    // Attempt Live Fetch for Oil (High Volatility)
    const [brentRaw, wtiRaw] = await Promise.all([
        WB('POILBRENUSDM'),   // Brent crude $/bbl
        WB('POILWTIUSDM'),    // WTI crude $/bbl
    ]);

    const liveBrent = wbLatest(brentRaw);
    const liveWti   = wbLatest(wtiRaw);

    const results = {
        oil: {
            brent:  liveBrent || { ...COMMODITIES_KB.energy.brentOil, isFallback: true },
            wti:    liveWti   || { ...COMMODITIES_KB.energy.wtiOil,   isFallback: true },
        },
        agricultural: COMMODITIES_KB.agricultural,
        // Standardized Province-to-Crop Mapping
        provinceCropMapping: {
            'Phra Nakhon Si Ayutthaya': ['rice', 'palmOil'],
            'Chiang Mai':               ['rice'],
            'Chiang Rai':               ['rice', 'rubber'],
            'Khon Kaen':                ['cassava', 'sugar'],
            'Nakhon Ratchasima':        ['cassava', 'sugar'],
            'Surat Thani':              ['rubber', 'palmOil'],
            'Krabi':                    ['palmOil', 'rubber'],
            'Songkhla':                 ['rubber', 'palmOil'],
            'Udon Thani':               ['cassava', 'rice'],
            'Ubon Ratchathani':         ['rice', 'cassava'],
            'Chon Buri':                ['sugar', 'cassava'],
            'Rayong':                   ['cassava', 'sugar'],
            'Suphan Buri':              ['rice'],
            'Kamphaeng Phet':           ['sugar', 'cassava'],
            'Nakhon Sawan':             ['rice', 'sugar'],
            'Surin':                    ['rice'],
            'Buri Ram':                 ['rice', 'cassava'],
            'Trang':                    ['rubber', 'palmOil'],
            'Narathiwat':               ['rubber', 'palmOil'],
            'Yala':                     ['rubber', 'palmOil'],
        },
        meta: COMMODITY_META,
        dataMode: (liveBrent && liveWti) ? 'live-energy' : 'grounded-kb',
        dataTimestamp: new Date().toISOString(),
        macroSignals: buildCommoditySignals({ 
            brent: liveBrent || COMMODITIES_KB.energy.brentOil, 
            rice: COMMODITIES_KB.agricultural.thaiRice, 
            rubber: COMMODITIES_KB.agricultural.naturalRubber 
        })
    };

    return new Response(JSON.stringify(results), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600'
        }
    });
}

function buildCommoditySignals({ brent, rice, rubber }) {
    const signals = [];
    if (brent) {
        const stress = brent.value > 95 ? 'high pressure' : 'moderate';
        signals.push({ type: 'energy', label: 'Brent Crude', value: brent.value, unit: '$/bbl', stress });
    }
    if (rice) {
        signals.push({ type: 'rice', label: 'Thai Rice', value: rice.value, unit: '$/mt' });
    }
    return signals;
}
