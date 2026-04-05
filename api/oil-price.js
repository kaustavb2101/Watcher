// Edge runtime — fetch live WTI crude oil price from Yahoo Finance
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    // Yahoo Finance — CL=F is WTI Crude Futures front-month
    const url =
      'https://query1.finance.yahoo.com/v8/finance/chart/CL%3DF?interval=1d&range=1d';

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; TMLI/1.0)',
        Accept: 'application/json',
      },
    });

    if (!res.ok) throw new Error(`Yahoo Finance HTTP ${res.status}`);

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice || meta?.previousClose;
    const currency = meta?.currency || 'USD';
    const symbol = meta?.symbol || 'CL=F';
    const ts = meta?.regularMarketTime
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : new Date().toISOString();

    if (!price) throw new Error('No price in Yahoo Finance response');

    return new Response(
      JSON.stringify({
        price: Math.round(price * 100) / 100,
        currency,
        symbol,
        label: 'WTI Crude Oil Futures',
        timestamp: ts,
        source: 'Yahoo Finance (CL=F)',
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    // Fallback: return a recent historical reference price with a flag
    return new Response(
      JSON.stringify({
        price: null,
        error: err.message,
        fallback: true,
        label: 'WTI Crude Oil Futures',
        source: 'Yahoo Finance (unavailable)',
      }),
      { status: 200, headers: corsHeaders }
    );
  }
}
