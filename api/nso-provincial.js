// Vercel Edge Function: NSO Thailand — Provincial Labor Force Survey (LFS)
// Primary source: data/nso-lfs-provincial-summary.js (static ES module, 77 provinces)
// Downloaded from: catalogapi.nso.go.th — table ST_02_2005005_4 (Q3/2568)
// Edge runtime avoids Node.js Lambda cold-start failures in Vercel sin1 region.
import { NSO_LFS_PROVINCES, NSO_LFS_META } from '../data/nso-lfs-provincial-summary.js';

export const config = { runtime: 'edge' };

// Thai province names (all 77) with region grouping for sector enrichment
const PROVINCE_META = {
    // Central
    'กรุงเทพมหานคร':    { nameEn: 'Bangkok', region: 'Central',   regionEn: 'Central',   lat: 13.75, lon: 100.52, econ: ['services','finance','manufacturing'] },
    'กาญจนบุรี':         { nameEn: 'Kanchanaburi', region: 'Central',   regionEn: 'Central',   lat: 14.00, lon: 99.53,  econ: ['agriculture','tourism','mining'] },
    'นครปฐม':           { nameEn: 'Nakhon Pathom', region: 'Central',   regionEn: 'Central',   lat: 13.82, lon: 100.04, econ: ['agriculture','manufacturing'] },
    'นนทบุรี':           { nameEn: 'Nonthaburi', region: 'Central',   regionEn: 'Central',   lat: 13.86, lon: 100.51, econ: ['services','manufacturing'] },
    'ปทุมธานี':          { nameEn: 'Pathum Thani', region: 'Central',   regionEn: 'Central',   lat: 14.02, lon: 100.53, econ: ['manufacturing','services'] },
    'พระนครศรีอยุธยา':   { nameEn: 'Phra Nakhon Si Ayutthaya', region: 'Central',   regionEn: 'Central',   lat: 14.35, lon: 100.57, econ: ['rice','manufacturing','tourism'] },
    'ลพบุรี':            { nameEn: 'Lopburi', region: 'Central',   regionEn: 'Central',   lat: 14.80, lon: 100.61, econ: ['rice','sugarcane','military'] },
    'สมุทรปราการ':       { nameEn: 'Samut Prakan', region: 'Central',   regionEn: 'Central',   lat: 13.60, lon: 100.60, econ: ['manufacturing','services'] },
    'สมุทรสาคร':        { nameEn: 'Samut Sakhon', region: 'Central',   regionEn: 'Central',   lat: 13.55, lon: 100.27, econ: ['fishery','manufacturing'] },
    'สระบุรี':           { nameEn: 'Saraburi', region: 'Central',   regionEn: 'Central',   lat: 14.53, lon: 100.91, econ: ['manufacturing','cement','agriculture'] },
    'สุพรรณบุรี':        { nameEn: 'Suphan Buri', region: 'Central',   regionEn: 'Central',   lat: 14.47, lon: 100.12, econ: ['rice','agriculture'] },
    'ชัยนาท':           { nameEn: 'Chai Nat', region: 'Central',   regionEn: 'Central',   lat: 15.18, lon: 100.13, econ: ['rice','sugarcane'] },
    'สิงห์บุรี':         { nameEn: 'Sing Buri', region: 'Central',   regionEn: 'Central',   lat: 14.89, lon: 100.40, econ: ['rice','agriculture'] },
    'อ่างทอง':          { nameEn: 'Ang Thong', region: 'Central',   regionEn: 'Central',   lat: 14.59, lon: 100.45, econ: ['rice','agriculture'] },
    'นครนายก':          { nameEn: 'Nakhon Nayok', region: 'Central',   regionEn: 'Central',   lat: 14.20, lon: 101.21, econ: ['agriculture','tourism'] },
    'ปราจีนบุรี':        { nameEn: 'Prachin Buri', region: 'East',      regionEn: 'East',      lat: 14.05, lon: 101.37, econ: ['manufacturing','sugarcane'] },
    'ราชบุรี':           { nameEn: 'Ratchaburi', region: 'Central',   regionEn: 'Central',   lat: 13.54, lon: 99.82,  econ: ['sugarcane','rice','ceramics'] },
    'สมุทรสงคราม':      { nameEn: 'Samut Songkhram', region: 'Central',   regionEn: 'Central',   lat: 13.41, lon: 100.00, econ: ['fishery','coconut','salt'] },
    // North
    'เชียงใหม่':         { nameEn: 'Chiang Mai', region: 'North',     regionEn: 'North',     lat: 18.79, lon: 98.98,  econ: ['tourism','rice','craft'] },
    'เชียงราย':         { nameEn: 'Chiang Rai', region: 'North',     regionEn: 'North',     lat: 19.91, lon: 99.83,  econ: ['rice','rubber','tourism'] },
    'แม่ฮ่องสอน':       { nameEn: 'Mae Hong Son', region: 'North',     regionEn: 'North',     lat: 19.30, lon: 97.97,  econ: ['tourism','agriculture'] },
    'น่าน':              { nameEn: 'Nan', region: 'North',     regionEn: 'North',     lat: 18.78, lon: 100.77, econ: ['rice','corn','forestry'] },
    'พะเยา':             { nameEn: 'Phayao', region: 'North',     regionEn: 'North',     lat: 19.16, lon: 99.90,  econ: ['rice','corn'] },
    'แพร่':              { nameEn: 'Phrae', region: 'North',     regionEn: 'North',     lat: 18.14, lon: 100.14, econ: ['teak','agriculture'] },
    'ลำปาง':             { nameEn: 'Lampang', region: 'North',     regionEn: 'North',     lat: 18.29, lon: 99.49,  econ: ['ceramics','coal','agriculture'] },
    'ลำพูน':             { nameEn: 'Lamphun', region: 'North',     regionEn: 'North',     lat: 18.57, lon: 99.01,  econ: ['manufacturing','lychee','agriculture'] },
    'อุตรดิตถ์':         { nameEn: 'Uttaradit', region: 'North',     regionEn: 'North',     lat: 17.63, lon: 100.10, econ: ['rice','palm','agriculture'] },
    'กำแพงเพชร':         { nameEn: 'Kamphaeng Phet', region: 'North',     regionEn: 'Lower North', lat: 16.48, lon: 99.52, econ: ['sugarcane','cassava','rice'] },
    'ตาก':               { nameEn: 'Tak', region: 'North',     regionEn: 'Lower North', lat: 16.88, lon: 99.12, econ: ['border_trade','agriculture','tourism'] },
    'นครสวรรค์':         { nameEn: 'Nakhon Sawan', region: 'North',     regionEn: 'Lower North', lat: 15.70, lon: 100.14, econ: ['rice','sugarcane'] },
    'พิจิตร':            { nameEn: 'Phichit', region: 'North',     regionEn: 'Lower North', lat: 16.44, lon: 100.35, econ: ['rice','agriculture'] },
    'พิษณุโลก':          { nameEn: 'Phitsanulok', region: 'North',     regionEn: 'Lower North', lat: 16.82, lon: 100.26, econ: ['rice','agriculture','services'] },
    'เพชรบูรณ์':         { nameEn: 'Phetchabun', region: 'North',     regionEn: 'Lower North', lat: 16.42, lon: 101.16, econ: ['corn','tapioca','tourism'] },
    'สุโขทัย':           { nameEn: 'Sukhothai', region: 'North',     regionEn: 'Lower North', lat: 17.01, lon: 99.82, econ: ['rice','agriculture','tourism'] },
    'อุทัยธานี':         { nameEn: 'Uthai Thani', region: 'North',     regionEn: 'Lower North', lat: 15.38, lon: 100.03, econ: ['rice','agriculture'] },
    // Northeast (Isan)
    'กาฬสินธุ์':         { nameEn: 'Kalasin', region: 'Northeast', regionEn: 'Northeast', lat: 16.43, lon: 103.51, econ: ['rice','cassava'] },
    'ขอนแก่น':           { nameEn: 'Khon Kaen', region: 'Northeast', regionEn: 'Northeast', lat: 16.43, lon: 102.83, econ: ['sugarcane','cassava','services'] },
    'ชัยภูมิ':           { nameEn: 'Chaiyaphum', region: 'Northeast', regionEn: 'Northeast', lat: 15.81, lon: 102.03, econ: ['cassava','sugarcane'] },
    'นครพนม':            { nameEn: 'Nakhon Phanom', region: 'Northeast', regionEn: 'Northeast', lat: 17.41, lon: 104.78, econ: ['rice','border_trade'] },
    'นครราชสีมา':        { nameEn: 'Nakhon Ratchasima', region: 'Northeast', regionEn: 'Northeast', lat: 14.97, lon: 102.10, econ: ['cassava','sugarcane','manufacturing'] },
    'บึงกาฬ':            { nameEn: 'Bueng Kan', region: 'Northeast', regionEn: 'Northeast', lat: 18.36, lon: 103.65, econ: ['rubber','rice'] },
    'บุรีรัมย์':          { nameEn: 'Buri Ram', region: 'Northeast', regionEn: 'Northeast', lat: 14.99, lon: 103.10, econ: ['rice','cassava'] },
    'มหาสารคาม':         { nameEn: 'Maha Sarakham', region: 'Northeast', regionEn: 'Northeast', lat: 16.18, lon: 103.30, econ: ['rice','cassava'] },
    'มุกดาหาร':          { nameEn: 'Mukdahan', region: 'Northeast', regionEn: 'Northeast', lat: 16.54, lon: 104.72, econ: ['border_trade','rice'] },
    'ยโสธร':             { nameEn: 'Yasothon', region: 'Northeast', regionEn: 'Northeast', lat: 15.79, lon: 104.15, econ: ['rice','cassava'] },
    'ร้อยเอ็ด':          { nameEn: 'Roi Et', region: 'Northeast', regionEn: 'Northeast', lat: 16.05, lon: 103.65, econ: ['rice','silk'] },
    'เลย':               { nameEn: 'Loei', region: 'Northeast', regionEn: 'Northeast', lat: 17.49, lon: 101.72, econ: ['corn','tourism'] },
    'สกลนคร':           { nameEn: 'Sakon Nakhon', region: 'Northeast', regionEn: 'Northeast', lat: 17.15, lon: 104.14, econ: ['rice','rubber'] },
    'สุรินทร์':          { nameEn: 'Surin', region: 'Northeast', regionEn: 'Northeast', lat: 14.88, lon: 103.49, econ: ['rice','silk','cassava'] },
    'ศรีสะเกษ':          { nameEn: 'Si Sa Ket', region: 'Northeast', regionEn: 'Northeast', lat: 15.12, lon: 104.33, econ: ['rice','cassava'] },
    'หนองคาย':           { nameEn: 'Nong Khai', region: 'Northeast', regionEn: 'Northeast', lat: 17.88, lon: 102.74, econ: ['border_trade','rubber','rice'] },
    'หนองบัวลำภู':       { nameEn: 'Nong Bua Lam Phu', region: 'Northeast', regionEn: 'Northeast', lat: 17.20, lon: 102.44, econ: ['sugarcane','cassava'] },
    'อำนาจเจริญ':        { nameEn: 'Amnat Charoen', region: 'Northeast', regionEn: 'Northeast', lat: 15.86, lon: 104.63, econ: ['rice','cassava'] },
    'อุดรธานี':          { nameEn: 'Udon Thani', region: 'Northeast', regionEn: 'Northeast', lat: 17.42, lon: 102.79, econ: ['cassava','services','border_trade'] },
    'อุบลราชธานี':       { nameEn: 'Ubon Ratchathani', region: 'Northeast', regionEn: 'Northeast', lat: 15.25, lon: 104.85, econ: ['rice','cassava'] },
    // East
    'จันทบุรี':          { nameEn: 'Chanthaburi', region: 'East',      regionEn: 'East',      lat: 12.61, lon: 102.10, econ: ['fruit','rubber','fishery'] },
    'ฉะเชิงเทรา':        { nameEn: 'Chachoengsao', region: 'East',      regionEn: 'East',      lat: 13.69, lon: 101.08, econ: ['manufacturing','agriculture'] },
    'ชลบุรี':            { nameEn: 'Chon Buri', region: 'East',      regionEn: 'East',      lat: 13.36, lon: 100.98, econ: ['manufacturing','EEC','tourism'] },
    'ตราด':              { nameEn: 'Trat', region: 'East',      regionEn: 'East',      lat: 12.24, lon: 102.52, econ: ['fishery','tourism','gems'] },
    'ระยอง':             { nameEn: 'Rayong', region: 'East',      regionEn: 'East',      lat: 12.68, lon: 101.26, econ: ['petrochemical','EEC','cassava'] },
    'สระแก้ว':           { nameEn: 'Sa Kaeo', region: 'East',      regionEn: 'East',      lat: 13.82, lon: 102.07, econ: ['border_trade','cassava'] },
    // West
    'ประจวบคีรีขันธ์':   { nameEn: 'Prachuap Khiri Khan', region: 'West',      regionEn: 'West',      lat: 11.81, lon: 99.80,  econ: ['pineapple','fishery','tourism'] },
    'เพชรบุรี':          { nameEn: 'Phetchaburi', region: 'West',      regionEn: 'West',      lat: 12.96, lon: 100.15, econ: ['sugarcane','salt','tourism'] },
    // South
    'กระบี่':            { nameEn: 'Krabi', region: 'South',     regionEn: 'South',     lat: 8.09,  lon: 98.92,  econ: ['palmOil','rubber','tourism'] },
    'ชุมพร':             { nameEn: 'Chumphon', region: 'South',     regionEn: 'South',     lat: 10.49, lon: 99.18,  econ: ['rubber','palmOil','fishery'] },
    'ตรัง':              { nameEn: 'Trang', region: 'South',     regionEn: 'South',     lat: 7.56,  lon: 99.62,  econ: ['rubber','palmOil','fishery'] },
    'นครศรีธรรมราช':     { nameEn: 'Nakhon Si Thammarat', region: 'South',     regionEn: 'South',     lat: 8.43,  lon: 99.96,  econ: ['rubber','rice','fishery'] },
    'นราธิวาส':          { nameEn: 'Narathiwat', region: 'South',     regionEn: 'South',     lat: 6.43,  lon: 101.82, econ: ['rubber','fishery','border_trade'] },
    'ปัตตานี':           { nameEn: 'Pattani', region: 'South',     regionEn: 'South',     lat: 6.87,  lon: 101.25, econ: ['fishery','rubber','rice'] },
    'พังงา':             { nameEn: 'Phangnga', region: 'South',     regionEn: 'South',     lat: 8.45,  lon: 98.53,  econ: ['tourism','rubber','tin'] },
    'พัทลุง':            { nameEn: 'Phatthalung', region: 'South',     regionEn: 'South',     lat: 7.62,  lon: 100.07, econ: ['rice','rubber','fishery'] },
    'ภูเก็ต':            { nameEn: 'Phuket', region: 'South',     regionEn: 'South',     lat: 7.89,  lon: 98.40,  econ: ['tourism','services'] },
    'ยะลา':              { nameEn: 'Yala', region: 'South',     regionEn: 'South',     lat: 6.54,  lon: 101.28, econ: ['rubber','agriculture'] },
    'ระนอง':             { nameEn: 'Ranong', region: 'South',     regionEn: 'South',     lat: 9.96,  lon: 98.63,  econ: ['fishery','rubber','tourism'] },
    'สงขลา':             { nameEn: 'Songkhla', region: 'South',     regionEn: 'South',     lat: 7.19,  lon: 100.59, econ: ['rubber','fishery','services'] },
    'สตูล':              { nameEn: 'Satun', region: 'South',     regionEn: 'South',     lat: 6.61,  lon: 100.07, econ: ['fishery','rubber','tourism'] },
    'สุราษฎร์ธานี':      { nameEn: 'Surat Thani', region: 'South',     regionEn: 'South',     lat: 9.14,  lon: 99.33,  econ: ['rubber','palmOil','tourism'] },
};

export default async function handler(req) {
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

    // Build province records from the static knowledge base
    const provinces = Object.entries(PROVINCE_META).map(([nameThai, meta]) => {
        const record = {
            nameThai,
            nameEn:  meta.nameEn,
            region:  meta.regionEn,
            lat:     meta.lat,
            lon:     meta.lon,
            econ:    meta.econ,
        };

        const p = NSO_LFS_PROVINCES[nameThai];
        if (p) {
            record.laborForce       = p.laborForce       ?? null;
            record.employed         = p.employed         ?? null;
            record.unemployed       = p.unemployed       ?? null;
            record.unemploymentRate = p.unemploymentRate ?? null;
            record.employmentRate   = p.employmentRate   ?? null;
            record.year             = NSO_LFS_META.reference_period;
            record.dataSource       = 'NSO LFS (local-knowledge-base)';
        } else {
            record.laborForce       = null;
            record.employed         = null;
            record.unemployed       = null;
            record.unemploymentRate = null;
            record.employmentRate   = null;
            record.dataSource       = 'NSO LFS (no data)';
        }

        return record;
    });

    const localCount = provinces.filter(p => p.dataSource === 'NSO LFS (local-knowledge-base)').length;

    return new Response(JSON.stringify({
        provinces,
        totalProvinces:  provinces.length,
        localDataCount:  localCount,
        liveDataCount:   0,
        localDataPeriod: NSO_LFS_META.reference_period,
        dataMode:        'local-knowledge-base',
        recordCount:     Object.keys(NSO_LFS_PROVINCES).length,
        downloadedAt:    NSO_LFS_META.downloaded_at,
        dataTimestamp:   new Date().toISOString(),
        source:          'Thailand National Statistical Office (NSO) — Labor Force Survey (LFS)',
        sourceUrl:       'https://www.nso.go.th/',
        table:           NSO_LFS_META.table,
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800',
        },
    });
}
