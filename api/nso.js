import { NSO_LFS_RECORDS, NSO_LFS_META } from '../data/nso-lfs-provincial-summary.js';
import { standardizeProvince } from '../data/provinces.js';

export const config = {
    runtime: 'edge'
};

export default async function handler(req) {
    const url = new URL(req.url);
    const region = url.searchParams.get('region') || 'รวม'; // Default to total country
    const activity = url.searchParams.get('activity');
    const province = url.searchParams.get('province');

    try {
        let metrics = NSO_LFS_RECORDS.map(row => ({
            activity: row.activity || row['กิจกรรมทางเศรษฐกิจ'] || 'Labor Force',
            count: parseInt(row.value || row['จำนวน'] || '0', 10),
            region: row.region || row['ภาค'],
            province: standardizeProvince(row.province || row['จังหวัด']),
            year: row.year || '2023'
        }));

        // Filter by region (Thai)
        if (region && region !== 'รวม') {
            metrics = metrics.filter(m => m.region === region);
        }

        // Filter by activity
        if (activity) {
            metrics = metrics.filter(m => m.activity === activity);
        }

        // Filter by province (English standardized)
        if (province) {
            const standardProv = standardizeProvince(province);
            metrics = metrics.filter(m => m.province === standardProv);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: metrics,
            debug: {
                dataMode: 'local-knowledge-base',
                recordCount: NSO_LFS_RECORDS.length,
                lastUpdate: NSO_LFS_META.downloaded_at
            }
        }), {
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
