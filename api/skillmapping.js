export const config = {
    runtime: 'edge'
};

export default async function handler(req) {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
        return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const fetchUrl = `https://api.skillmapping.in.th/api/v1/industries/${id}/careers?locale=en&perPage=3`;
        const response = await fetch(fetchUrl);
        
        if (!response.ok) {
            return new Response(JSON.stringify({ error: `SkillMapping API responded with ${response.status}` }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}
