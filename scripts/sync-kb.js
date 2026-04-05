/**
 * Watcher Knowledge Base (WKB) Synchronization Utility
 * Orchestrates monthly pulls from institutional APIs (data.go.th, HDX, GeoJSON)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const standardize = (name) => {
    if (!name) return 'National';
    const clean = name.toString().trim()
        .replace(/^(จังหวัด|Prov\.)\s*/, '')
        .replace(/\s+/g, ' ');

    const mapping = {
        'กรุงเทพมหานคร': 'Bangkok', 'Bangkok': 'Bangkok',
        'บุรีรัมย์': 'Buri Ram', 'Buri Ram': 'Buri Ram', 'Buriram': 'Buri Ram',
        'พระนครศรีอยุธยา': 'Phra Nakhon Si Ayutthaya', 'Ayutthaya': 'Phra Nakhon Si Ayutthaya',
        'ชลบุรี': 'Chon Buri', 'Chonburi': 'Chon Buri',
        'เชียงใหม่': 'Chiang Mai', 'Chiangmai': 'Chiang Mai',
        'สมุทรปราการ': 'Samut Prakan', 'ขอนแก่น': 'Khon Kaen'
    };
    return mapping[clean] || clean;
};

const TARGET_DATASETS = [
    {
        name: 'dlt-cumulative',
        exportName: 'DLT_CUMULATIVE',
        id: '0bdd38c8-affb-4e34-b303-510f825b2303',
        limit: 10000,
        normalizer: (records) => records.map(r => ({
            province: standardize(r['จังหวัด']),
            type: r['ประเภทรถ'] || 'Other',
            size: parseInt(r['รถที่ดำเนินการ']) || 0,
            asOf: r['เดือนที่รายงาน']
        }))
    },
    {
        name: 'dlt-new-registrations',
        exportName: 'DLT_NEW',
        id: 'b9ee9f28-c3a1-44f7-a86e-e53799e5d4f0',
        limit: 10000,
        normalizer: (records) => records.map(r => ({
            province: standardize(r['จังหวัด'] || 'National'),
            type: r['รถประเภท'] || 'Other',
            brand: r['ยี่ห้อ'] || 'Other',
            growth: parseInt(r['จำนวน'] || 0),
            month: r['เดือน'] || r['report_month']
        })).sort((a,b) => new Date(b.month) - new Date(a.month))
    },
    {
        name: 'nso-unemployment',
        exportName: 'NSO_UNEMPLOYED',
        id: '71a8b59d-2a0f-4f9d-b2f5-c8e6b0730ca3',
        limit: 5000,
        normalizer: (records) => records.map(r => ({
            province: standardize(r['จังหวัด']),
            labor_force: parseInt(r['กำลังแรงงาน'] || 0),
            unemployed: parseInt(r['ผู้ว่างงาน'] || 0),
            unemployment_rate: parseFloat(r['อัตราการว่างงาน'] || 0),
            period: r['ปี_ไตรมาส']
        }))
    },
    {
        name: 'provincial-economy',
        exportName: 'ECON',
        id: '61af127b-1f1a-4123-b632-efa9fa1088fc',
        limit: 10000,
        normalizer: (records) => records.map(r => ({
            province: standardize(r['จังหวัด']),
            gpp: parseInt(r['ผลิตภัณฑ์มวลรวมจังหวัด'] || 0),
            sector: r['สาขาการผลิต'],
            year: r['ปี']
        }))
    },
    {
        name: 'migrant-labor',
        exportName: 'MIGRANT',
        id: '401baf4b-20eb-4381-9af9-86258747050a',
        limit: 5000,
        normalizer: (records) => records.map(r => ({
            province: standardize(r['จังหวัด'] || 'National'),
            permit_type: r['ประเภทการอนุญาต'] || 'Other',
            count: parseInt(r['จำนวน'] || 0),
            period: r['เดือน_ปี'] || r['report_month']
        }))
    },
    {
        name: 'job-vacancies',
        exportName: 'VACANCIES',
        id: '91e74a8e-e3d7-4e92-aa1a-87b9258b3d53',
        limit: 5000,
        normalizer: (records) => records.map(r => ({
            province: standardize(r['จังหวัด'] || 'National'),
            job_title: r['ตำแหน่งงาน'] || 'Other',
            vacancies: parseInt(r['จำนวนตำแหน่งงานว่าง'] || 0),
            date_posted: r['วันที่ลงประกาศ']
        }))
    },
    {
        name: 'tourism-stats',
        exportName: 'TOURISM',
        id: '6d09fa0d-374e-494d-a82b-25b79a534d4e',
        limit: 5000,
        normalizer: (records) => records.map(r => ({
            province: standardize(r['จังหวัด'] || 'National'),
            arrivals: parseInt(r['จำนวนนักท่องเที่ยว'] || 0),
            revenue: parseFloat(r['รายได้'] || 0),
            month: r['เดือน'] || r['report_month']
        }))
    },
    {
        name: 'rsi-sentiment',
        exportName: 'RSI',
        id: '6e839c50-aadd-4be0-83c1-881164117836',
        limit: 1000,
        normalizer: (records) => records.map(r => ({
            region: r['ภูมิภาค'] || 'National',
            index: parseFloat(r['ดัชนี'] || 0),
            growth: parseFloat(r['การขยายตัว'] || 0),
            period: r['เดือน_ปี']
        }))
    }
];

const GEOJSON_URL = 'https://raw.githubusercontent.com/apisit/thailand.json/master/thailand.json';

export async function performSync() {
    const report = {
        timestamp: new Date().toISOString(),
        datasets: [],
        errors: []
    };

    // 1. Fetch Institutional Datasets
    for (const ds of TARGET_DATASETS) {
        try {
            const url = `https://data.go.th/api/3/action/datastore_search?resource_id=${ds.id}&limit=${ds.limit}`;
            const resp = await fetch(url);
            const data = await resp.json();

            if (data.success && data.result.records.length > 0) {
                const processed = ds.normalizer(data.result.records);
                
                // Only write to filesystem if not in a serverless environment that blocks it
                try {
                    const outputPath = path.join(__dirname, `../data/${ds.name}.js`);
                    const content = `/** AUTO-GENERATED - ${new Date().toISOString()} */\n` +
                                  `export const ${ds.exportName}_RECORDS = ${JSON.stringify(processed, null, 2)};\n` +
                                  `export const ${ds.exportName}_PROVINCES = ${JSON.stringify([...new Set(processed.map(p => p.province || 'National'))])};\n` +
                                  `export const ${ds.exportName}_META = ${JSON.stringify({
                                      resource_id: ds.id,
                                      downloaded_at: new Date().toISOString(),
                                      total: processed.length
                                  }, null, 2)};\n`;
                    fs.writeFileSync(outputPath, content);
                } catch (writeErr) {
                    // Ignore write error for report (likely Vercel)
                }

                report.datasets.push({ name: ds.name, count: processed.length });
            }
        } catch (e) {
            report.errors.push(`${ds.name}: ${e.message}`);
        }
    }

    // 2. Fetch Map Data
    try {
        const resp = await fetch(GEOJSON_URL);
        const geojson = await resp.json();
        geojson.features.forEach(f => f.properties.name = standardize(f.properties.NAME_1 || f.properties.name));
        
        try {
            const outputPath = path.join(__dirname, '../data/thailand-provinces-geo.json');
            fs.writeFileSync(outputPath, JSON.stringify(geojson));
        } catch (writeErr) {}

        report.datasets.push({ name: 'geojson-map', count: geojson.features.length });
    } catch (e) {
        report.errors.push(`geojson: ${e.message}`);
    }

    return report;
}

// Allow CLI execution
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('sync-kb.js')) {
    performSync().then(r => console.log('WKB Sync Complete:', JSON.stringify(r, null, 2)));
}
