// Vercel Edge Function: IMF DataMapper API — Thailand WEO Projections
// Free, no authentication required.
// Docs: https://www.imf.org/external/datamapper/api/v1
// Covers: GDP growth, inflation, unemployment, current account, fiscal balance for Thailand (THA)
export const config = {
    runtime: 'edge'
};

const IMF_BASE = 'https://www.imf.org/external/datamapper/api/v1';
const COUNTRY  = 'THA';

// Key WEO indicators
const INDICATORS = {
    NGDP_RPCH: 'GDP Growth (%)',          // Real GDP growth rate
    PCPIPCH:   'Inflation (%)',            // Consumer price inflation
    LUR:       'Unemployment Rate (%)',    // Unemployment rate
    BCA_NGDPD: 'Current Account (% GDP)', // Current account balance
    GGXCNL_NGDP: 'Fiscal Balance (% GDP)' // Government fiscal balance
};

async function safeFetch(url, timeoutMs = 10000) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const resp = await fetch(url, {
            signal: ctrl.signal,
            headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timer);
        if (!resp.ok) return null;
        return await resp.json();
    } catch (e) {
        clearTimeout(timer);
        return null;
    }
}

// Extract the latest two years of data from IMF response (for current year + projections)
function extractIMFSeries(raw, indicatorCode) {
    try {
        const values = raw?.values?.[indicatorCode]?.[COUNTRY];
        if (!values) return null;

        const currentYear = new Date().getFullYear();
        const years = Object.keys(values)
            .map(Number)
            .filter(y => y >= currentYear - 2 && y <= currentYear + 3)
            .sort((a, b) => a - b);

        const series = years.map(year => ({
            year,
            value: values[String(year)] !== undefined && values[String(year)] !== null
                ? parseFloat(parseFloat(values[String(year)]).toFixed(2))
                : null,
            isProjection: year >= currentYear
        })).filter(d => d.value !== null);

        if (series.length === 0) return null;

        const latest = series.find(d => !d.isProjection) || series[0];
        const nextYear = series.find(d => d.isProjection);
        const prevYear = series.filter(d => !d.isProjection)[1];

        return {
            latest: latest?.value ?? null,
            latestYear: latest?.year ?? null,
            projection: nextYear?.value ?? null,
            projectionYear: nextYear?.year ?? null,
            yoyChange: (latest && prevYear) ? parseFloat((latest.value - prevYear.value).toFixed(2)) : null,
            series: series.slice(0, 6)
        };
    } catch (e) {
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
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }

    const indicatorList = Object.keys(INDICATORS).join(',');

    // Fetch all indicators in a single IMF DataMapper call
    const raw = await safeFetch(
        `${IMF_BASE}/data/${indicatorList}/${COUNTRY}`,
        12000
    );

    if (!raw) {
        return new Response(JSON.stringify({
            error: 'IMF DataMapper API unavailable',
            source: 'IMF World Economic Outlook DataMapper',
            url: 'https://www.imf.org/external/datamapper/api/v1'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    const results = {
        gdpGrowth:      extractIMFSeries(raw, 'NGDP_RPCH'),
        inflation:      extractIMFSeries(raw, 'PCPIPCH'),
        unemployment:   extractIMFSeries(raw, 'LUR'),
        currentAccount: extractIMFSeries(raw, 'BCA_NGDPD'),
        fiscalBalance:  extractIMFSeries(raw, 'GGXCNL_NGDP'),
        country: COUNTRY,
        source: 'IMF World Economic Outlook DataMapper — imf.org/external/datamapper/api/v1',
        dataTimestamp: new Date().toISOString(),
        // Macro narrative summary for AI prompt enrichment
        macroNarrative: buildNarrative(raw)
    };

    return new Response(JSON.stringify(results), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800' // Cache 1 day (WEO updates quarterly)
        }
    });
}

function buildNarrative(raw) {
    try {
        const gdp  = extractIMFSeries(raw, 'NGDP_RPCH');
        const cpi  = extractIMFSeries(raw, 'PCPIPCH');
        const unem = extractIMFSeries(raw, 'LUR');
        const ca   = extractIMFSeries(raw, 'BCA_NGDPD');
        const fiscal = extractIMFSeries(raw, 'GGXCNL_NGDP');

        const parts = [];

        if (gdp?.latest !== null) {
            const momentum = gdp.projection !== null
                ? `, projected ${gdp.projection > gdp.latest ? 'to accelerate' : 'to slow'} to ${gdp.projection}% in ${gdp.projectionYear}`
                : '';
            parts.push(`Thailand GDP growth: ${gdp.latest}% (${gdp.latestYear})${momentum}`);
        }
        if (cpi?.latest !== null) {
            const inflStance = cpi.latest > 4 ? 'high — above BOT target' : cpi.latest < 1 ? 'low — deflation risk' : 'within target range';
            parts.push(`CPI inflation: ${cpi.latest}% (${cpi.latestYear}) — ${inflStance}`);
        }
        if (unem?.latest !== null) {
            parts.push(`IMF-estimated unemployment: ${unem.latest}% (${unem.latestYear})`);
        }
        if (ca?.latest !== null) {
            const surplus = ca.latest >= 0;
            parts.push(`Current account: ${surplus ? '+' : ''}${ca.latest}% of GDP — ${surplus ? 'surplus' : 'deficit'}`);
        }
        if (fiscal?.latest !== null) {
            parts.push(`Fiscal balance: ${fiscal.latest >= 0 ? '+' : ''}${fiscal.latest}% of GDP`);
        }

        return parts.join('. ') + (parts.length > 0 ? '.' : '');
    } catch (e) {
        return '';
    }
}
