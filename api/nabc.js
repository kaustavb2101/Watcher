export const config = {
    runtime: 'edge'
};

export default async function handler(req) {
    const url = new URL(req.url);
    const path = url.searchParams.get('path');

    if (!path) {
        return new Response(JSON.stringify({ error: 'Missing path parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const targetUrl = `https://agriapi.nabc.go.th${path}`;
        const response = await fetch(targetUrl);

        if (!response.ok) {
            return new Response(JSON.stringify({ error: `NABC API responded with ${response.status}` }), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 's-maxage=3600, stale-while-revalidate'
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
