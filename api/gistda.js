/**
 * Vercel Edge Function: GISTDA Satellite Agriculture
 * Migrated to Local Knowledge Base (Grounded Static Snapshots)
 * 
 * Sourced from: GISTDA v2.2 (Weekly 40m resolution)
 */
import { GISTDA_AGRI_RECORDS, GISTDA_META } from '../data/gistda-agriculture.js';
import { standardizeProvince } from '../data/provinces.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
    const url = new URL(req.url);
    const provinceParam = url.searchParams.get('province');
    const type = url.searchParams.get('type') || 'rice';

    try {
        let province = provinceParam ? standardizeProvince(provinceParam) : 'Ayutthaya';
        
        // Filter in local knowledge base by province and optionally crop type
        let records = GISTDA_AGRI_RECORDS.filter(r => r.province === province);
        if (records.length === 0 && province === 'Ayutthaya') {
            // Default first record if direct match fails for Ayutthaya
            records = [GISTDA_AGRI_RECORDS[0]];
        }

        const results = {
            province,
            type,
            data: records,
            meta: GISTDA_META,
            dataMode: 'local-knowledge-base',
            timestamp: new Date().toISOString()
        };

        return new Response(JSON.stringify(results), {
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
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}
