/**
 * TMLI RAG Retrieval — api/retrieve.js
 * Keyword-based retrieval from the TMLI Knowledge Base.
 * Called before AI analysis to ground prompts in real provincial/crop data.
 * No vector DB required — runs entirely on Vercel Edge.
 */
import { KnowledgeBase } from '../data/index.js';

export const config = { runtime: 'edge' };

// Maps user-facing keywords → OAE_CROP_PROVINCES keys
const CROP_MAP = {
  rice:       ['rice', 'paddy', 'jasmine rice', 'khao'],
  rubber:     ['rubber', 'latex', 'para rubber', 'yang'],
  cassava:    ['cassava', 'tapioca', 'manioc'],
  sugarcane:  ['sugarcane', 'sugar cane', 'sugar'],
  'oil palm': ['palm oil', 'oil palm', 'palm'],
  maize:      ['maize', 'corn', 'feed corn'],
  durian:     ['durian', 'monthong'],
  shrimp:     ['shrimp', 'prawn', 'aquaculture', 'seafood'],
};

function detectCrops(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const [crop, keywords] of Object.entries(CROP_MAP)) {
    if (keywords.some(kw => {
      // Word-boundary match — prevents 'price' matching 'rice', etc.
      const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      return re.test(lower);
    })) found.push(crop);
  }
  return found;
}

function detectProvinces(text, provinceList) {
  const lower = text.toLowerCase();
  return provinceList.filter(p => lower.includes(p.toLowerCase()));
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  let body = {};
  try { body = await req.json(); } catch (e) {}

  const { query = '', province = '' } = body;
  const fullText = `${query} ${province}`;

  const debtRecords   = KnowledgeBase.debt?.records       || {};
  const lfsMapThai    = KnowledgeBase.nso?.map             || {}; // Thai-script keys
  const gppRecords    = KnowledgeBase.gpp?.records         || {};
  const climateRecs   = KnowledgeBase.climate?.risk        || {};
  const cropProvinces = KnowledgeBase.oae?.cropProvinces   || {};
  const provinceList  = Object.keys(debtRecords);

  // NSO LFS JSON uses Thai script keys — build English→Thai reverse map
  const thaiToEng = KnowledgeBase.provinces?.map || {};
  const engToThai = Object.fromEntries(Object.entries(thaiToEng).map(([th, en]) => [en, th]));
  // Wrapper: look up LFS by English province name
  const lfsMap = { get: (eng) => lfsMapThai[engToThai[eng]] || null };

  const detectedCrops    = detectCrops(fullText);
  const explicitProvince = province ? [province] : [];
  const queryProvinces   = detectProvinces(query, provinceList);
  // Deduplicate: explicit province first, then any found in the query text
  const detectedProvinces = [...new Set([...explicitProvince, ...queryProvinces])];

  const chunks = [];

  // ── 1. CROP PROVINCE RANKINGS ─────────────────────────────────────────────
  for (const crop of detectedCrops) {
    const rows = cropProvinces[crop];
    if (!rows?.length) continue;
    const top = rows.slice(0, 5);
    const formatted = top.map((p, i) => {
      const t = p.tonnes >= 1_000_000
        ? `${(p.tonnes / 1_000_000).toFixed(1)}M t`
        : `${Math.round(p.tonnes / 1_000)}K t`;
      return `${i + 1}. ${p.province} (${t})`;
    }).join(', ');
    chunks.push({ label: `OAE: Top ${crop} provinces`, value: formatted });

    // Auto-enrich detectedProvinces from crop's top producers if none specified
    if (detectedProvinces.length === 0) {
      top.forEach(p => {
        if (!detectedProvinces.includes(p.province)) detectedProvinces.push(p.province);
      });
    }
  }

  // ── 2. HOUSEHOLD DEBT & STRESS ────────────────────────────────────────────
  const debtChunks = detectedProvinces.slice(0, 6).map(prov => {
    const d = debtRecords[prov];
    if (!d) return null;
    const debt = d.debtPerHousehold ? `฿${d.debtPerHousehold.toLocaleString()}/hh` : '—';
    return `${prov}: ${debt}, stress-idx ${d.stressIndex ?? '—'}, debt/income ${d.debtToIncome ?? '—'}x`;
  }).filter(Boolean);
  if (debtChunks.length) {
    chunks.push({ label: 'BOT/NSO SES 2566: Household Debt', value: debtChunks.join(' | ') });
  }

  // ── 3. LABOR FORCE (NSO LFS Q3/2025) ──────────────────────────────────────
  const lfsChunks = detectedProvinces.slice(0, 6).map(prov => {
    const d = lfsMap.get(prov);
    if (!d) return null;
    return `${prov}: ${d.employed?.toFixed(0) ?? '—'}K employed, ${d.unemploymentRate?.toFixed(1) ?? '—'}% unemp`;
  }).filter(Boolean);
  if (lfsChunks.length) {
    chunks.push({ label: 'NSO LFS Q3/2025: Provincial Labor Force', value: lfsChunks.join(' | ') });
  }

  // ── 4. PROVINCIAL GPP (NESDC 2566) ────────────────────────────────────────
  const gppChunks = detectedProvinces.slice(0, 4).map(prov => {
    const d = gppRecords[prov];
    if (!d) return null;
    const gppFmt = d.gpp >= 1_000_000
      ? `฿${(d.gpp / 1_000_000).toFixed(1)}T`
      : d.gpp >= 1_000
        ? `฿${(d.gpp / 1_000).toFixed(0)}B`
        : `฿${d.gpp}M`;
    return `${prov}: ${gppFmt} GPP, agri-share ${Math.round(d.agri * 100)}%, hub-type ${d.hubType}`;
  }).filter(Boolean);
  if (gppChunks.length) {
    chunks.push({ label: 'NESDC 2566: Provincial GPP', value: gppChunks.join(' | ') });
  }

  // ── 5. CLIMATE RISK ───────────────────────────────────────────────────────
  const climateChunks = detectedProvinces.slice(0, 4).map(prov => {
    const d = climateRecs[prov];
    if (!d) return null;
    const parts = [];
    if (d.drought != null) parts.push(`drought ${d.drought}`);
    if (d.flood   != null) parts.push(`flood ${d.flood}`);
    if (d.pm25    != null) parts.push(`pm2.5 ${d.pm25}`);
    return parts.length ? `${prov}: ${parts.join(', ')}` : null;
  }).filter(Boolean);
  if (climateChunks.length) {
    chunks.push({ label: 'GISTDA/DDPM: Climate Risk (0=none, 1=critical)', value: climateChunks.join(' | ') });
  }

  return new Response(JSON.stringify({
    chunks,
    detectedCrops,
    detectedProvinces: detectedProvinces.slice(0, 6),
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    }
  });
}
