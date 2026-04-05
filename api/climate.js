/**
 * Vercel Edge Function: Climate Risk & Air Quality
 * Migrated to Local Knowledge Base (Static Groundwater Snapshots)
 * 
 * Sourced from: Open-Meteo, PCD Thailand, World Bank CCDR.
 */
import { CLIMATE_RISK_RECORDS, CLIMATE_META } from '../data/climate-risk.js';
import { standardizeProvince } from '../data/provinces.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
    const url = new URL(req.url);
    const provinceParam = url.searchParams.get('province');
    // lat/lon search parameters are kept for compatibility but overridden by provincial lookup
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');

    try {
        let province = provinceParam ? standardizeProvince(provinceParam) : 'Bangkok';
        
        // Lookup in local knowledge base
        const riskData = CLIMATE_RISK_RECORDS[province] || { pm25: 0.5, flood: 0.4, drought: 0.4 };

        const results = {
            province,
            riskData,
            meta: CLIMATE_META,
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
