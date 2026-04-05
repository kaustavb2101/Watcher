import { DLT_CUMULATIVE_RECORDS as CUMULATIVE_RECORDS, DLT_CUMULATIVE_META as CUMULATIVE_META } from '../data/dlt-cumulative.js';
import { DLT_NEW_RECORDS as NEW_REG_RECORDS } from '../data/dlt-new-registrations.js';
import { PROVINCE_POP, AUTOX_BRANCHES, standardizeProvince } from '../data/provinces.js';

export const config = { runtime: 'edge' };

// ─── AUTOX BRANCH NETWORK ─────────────────────────────────────────────────
const PROVINCE_RISK_PROFILE = {
  'Bangkok': { agri: 0.0, debt: 'low', region: 'Central' },
  'Samut Prakan': { agri: 0.0, debt: 'medium', region: 'Central' },
  'Chon Buri': { agri: 0.1, debt: 'low', region: 'Eastern' },
  'Rayong': { agri: 0.1, debt: 'low', region: 'Eastern' },
  'Nakhon Ratchasima': { agri: 0.7, debt: 'high', region: 'Northeastern' },
  'Buri Ram': { agri: 0.8, debt: 'high', region: 'Northeastern' },
  'Surin': { agri: 0.8, debt: 'high', region: 'Northeastern' },
  'Si Sa Ket': { agri: 0.8, debt: 'high', region: 'Northeastern' },
  'Ubon Ratchathani': { agri: 0.7, debt: 'high', region: 'Northeastern' },
  'Khon Kaen': { agri: 0.6, debt: 'high', region: 'Northeastern' },
  'Udon Thani': { agri: 0.6, debt: 'high', region: 'Northeastern' },
  'Chiang Mai': { agri: 0.5, debt: 'medium', region: 'Northern' },
  'Chiang Rai': { agri: 0.7, debt: 'high', region: 'Northern' },
  'Surat Thani': { agri: 0.6, debt: 'medium', region: 'Southern' },
  'Songkhla': { agri: 0.4, debt: 'medium', region: 'Southern' },
  'Krabi': { agri: 0.5, debt: 'medium', region: 'Southern' },
  'Narathiwat': { agri: 0.8, debt: 'high', region: 'Southern' },
  'Yala': { agri: 0.8, debt: 'high', region: 'Southern' },
  'Pattani': { agri: 0.8, debt: 'high', region: 'Southern' },
};

const RESOURCE_ID = '0bdd38c8-affb-4e34-b303-510f825b2303';

// ─── DATA PROCESSING ─────────────────────────────────────────────────────
function normalizeDLTRecord(record) {
  const keys = Object.keys(record);
  const findKey = (patterns) => keys.find(k => patterns.some(p => k.includes(p)));
  const provKey  = findKey(['จังหวัด', 'province', 'area', 'พื้นที่']);
  const countKey = findKey(['ดำเนินการ', 'จำนวน', 'count', 'total', 'ยอดสะสม']);
  return {
    province:     provKey  ? record[provKey]  : null,
    vehicleCount: parseInt(countKey ? record[countKey] : 0) || 0,
  };
}

function aggregateByProvince(records) {
  const totals = {};
  for (const rec of records) {
    const { province, vehicleCount } = normalizeDLTRecord(rec);
    const standardName = standardizeProvince(province);
    if (!standardName || vehicleCount === 0) continue;
    totals[standardName] = (totals[standardName] || 0) + vehicleCount;
  }
  return totals;
}

function computeBSI(vehiclesByProvince) {
  const results = [];
  for (const [province, branches] of Object.entries(AUTOX_BRANCHES)) {
    const popK = PROVINCE_POP[province] || 500;
    const pop100k = popK / 100;
    const vehicles = vehiclesByProvince[province] || 0;
    results.push({
      province,
      branches,
      population: popK,
      registeredVehicles: vehicles,
      bsi: {
        branchPenetration:    pop100k > 0   ? parseFloat((branches / pop100k).toFixed(3))             : 0,
        vehicleDensity:       popK > 0      ? parseFloat((vehicles / popK).toFixed(1))                 : 0,
        marketSharePotential: vehicles > 0  ? parseFloat((branches / (vehicles / 1000)).toFixed(4))    : null,
      },
    });
  }
  return results;
}

// ─── HANDLER ─────────────────────────────────────────────────────────────
export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' }
    });
  }
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }

  // Process the pre-loaded static data — no I/O, runs in microseconds
  const provinceMap = {};
  const cumulative = { total: 0, byType: {} };
  const newMonthly = { total: 0, byType: {} };

  // GRANULAR AGGREGATION Helper
  const mapType = (t) => {
    if (!t) return 'Other';
    const s = t.toString();
    if (s.includes('นั่ง') || s.includes('เก๋ง')) return 'Passenger';
    if (s.includes('ปิคอัพ') || s.includes('บรรทุกส่วนบุคคล')) return 'Pickup';
    if (s.includes('จักรยานยนต์')) return 'Motorcycle';
    if (s.includes('แทรกเตอร์') || s.includes('เกษตร')) return 'Agricultural';
    if (s.includes('บรรทุก')) return 'Truck';
    return 'Other';
  };

  (CUMULATIVE_RECORDS || []).forEach(r => {
    const std = standardizeProvince(r.province);
    if (!std) return;
    
    if (!provinceMap[std]) provinceMap[std] = { total: 0, byType: {} };
    
    const cat = mapType(r.type);
    const size = r.size || 0;
    provinceMap[std].total += size;
    provinceMap[std].byType[cat] = (provinceMap[std].byType[cat] || 0) + size;
    
    cumulative.total += size;
    cumulative.byType[cat] = (cumulative.byType[cat] || 0) + size;
  });

  (NEW_REG_RECORDS || []).forEach(r => {
    const cat = mapType(r.type);
    newMonthly.total += (r.growth || 0);
    newMonthly.byType[cat] = (newMonthly.byType[cat] || 0) + (r.growth || 0);
  });

  // COMPUTE BSI with provincial breakdown
  const bsiData = [];
  for (const [province, branches] of Object.entries(AUTOX_BRANCHES)) {
    const data = provinceMap[province] || { total: 0, byType: {} };
    const popK = PROVINCE_POP[province] || 500;
    const pop100k = popK / 100;
    const vehicles = data.total;
    
    bsiData.push({
      province,
      branches,
      population: popK,
      registeredVehicles: vehicles,
      byType: data.byType,
      bsi: {
        branchPenetration:    pop100k > 0   ? parseFloat((branches / pop100k).toFixed(3))             : 0,
        vehicleDensity:       popK > 0      ? parseFloat((vehicles / popK).toFixed(1))                 : 0,
        marketSharePotential: vehicles > 0  ? parseFloat((branches / (vehicles / 1000)).toFixed(4))    : null,
      },
    });
  }

  const nationalVehicles   = cumulative.total;
  const dltAvailable       = (CUMULATIVE_RECORDS || []).length > 0;

  return new Response(JSON.stringify({
    bsiData,
    cumulative,
    newMonthly,
    nationalVehicles,
    dltAvailable,
    dataSource: 'CUMULATIVE_DLT',
    meta: {}, // Metadata handled in KB
    debug: {
      dataMode:          'local-knowledge-base',
      recordCount:       (CUMULATIVE_RECORDS || []).length,
      aggProvinceCount:  Object.keys(provinceMap).length,
      sampleRecord:      (CUMULATIVE_RECORDS || [])[0],
    },
    debugTokenStatus: 'N/A (local data)',
    dataTimestamp: new Date().toISOString(),
  }),
 {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 's-maxage=300, stale-while-revalidate=60',
    },
  });
}
