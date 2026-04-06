export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const prompt = `You are a senior macro analyst specialising in Thailand's economy and AutoX (Ngern Chaiyo), Thailand's largest non-bank lender. Today is ${today}.

Generate EXACTLY 8 of the most impactful current real-world events that affect Thailand's economy, workforce, household debt repayment capacity, and vehicle/title loan portfolios.

Prioritise:
- Active geopolitical conflicts with energy/trade implications (US-Iran, Gulf, Russia-Ukraine spillover)
- US tariff and trade policy developments
- Oil and commodity price shocks
- Chinese overcapacity / ASEAN dumping
- Thai domestic macro (BOT rate, GDP, household debt, baht)
- Technology shocks (AI automation, EV transition)
- Climate / agricultural disruptions affecting Isan/North Thailand

Rules:
- Only include REAL, currently active events — no hypotheticals
- Each event must have a direct, traceable impact on Thai household incomes or loan repayment risk
- Severity: "crit" = active crisis, "hi" = high ongoing risk, "med" = elevated watch, "lo" = emerging
- Category: "geo" | "trade" | "energy" | "tech" | "env" | "policy"
- context: 2–3 sentence briefing used as AI analysis input (specific, data-grounded, no fluff)
- tag: unique snake_case identifier, e.g. "geo_hormuz_2026"

Return ONLY valid JSON, no markdown fences:
{
  "generated": "${today}",
  "events": [
    {
      "tag": "geo_example",
      "title": "Event title — max 12 words",
      "meta": "Date · 1 key stat or consequence",
      "severity": "crit|hi|med|lo",
      "category": "geo|trade|energy|tech|env|policy",
      "context": "2-3 sentence grounded briefing for AI analysis input."
    }
  ]
}`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');

    const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    let res, errorText = '';

    for (const model of models) {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.3 }
          }),
        }
      );
      if (res.ok) break;
      errorText = await res.text();
    }

    if (!res || !res.ok) {
      return new Response(JSON.stringify({ error: `Gemini error: ${errorText.slice(0, 200)}` }), {
        status: 502, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    const body = await res.json();
    const raw = body?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(raw);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: {
        ...CORS,
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=1800',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }
}
