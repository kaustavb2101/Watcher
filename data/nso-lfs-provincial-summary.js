/**
 * NSO Labor Force Survey — Provincial Summary
 * Source: NSO Thailand, catalogapi.nso.go.th (table ST_02_2005005_4)
 * Reference Period: Q3/2025 (ไตรมาสที่ 3/2568)
 * Units: thousands of persons (พันคน)
 * Downloaded: 2026-03-29 | Province count: 77
 *
 * P1 FIX: Replaced single-total stub with full 77-province real NSO LFS data
 */

import NSO_LFS_JSON from './nso-lfs-provincial-summary.json' assert { type: 'json' };

// Flat array format for backward compatibility with api-client and data-enrichment
export const NSO_LFS_RECORDS = Object.entries(NSO_LFS_JSON.provinces).map(([province, d]) => ({
  province,
  sector: 'Total',
  employed: d.employed,       // thousands of persons
  unemployed: d.unemployed,
  laborForce: d.laborForce,
  employmentRate: d.employmentRate,
  unemploymentRate: d.unemploymentRate
}));

// Province-keyed map for fast lookup
export const NSO_LFS_MAP = NSO_LFS_JSON.provinces;

export const NSO_LFS_PROVINCES = Object.keys(NSO_LFS_JSON.provinces);

export const NSO_LFS_META = {
  resource_id: '0bdd38c8-affb-4e34-b303-510f825b2303',
  source: NSO_LFS_JSON.meta.source,
  table: NSO_LFS_JSON.meta.table,
  description: NSO_LFS_JSON.meta.description,
  reference_period: NSO_LFS_JSON.meta.reference_period,
  reference_year_ce: NSO_LFS_JSON.meta.reference_year_ce,
  unit: NSO_LFS_JSON.meta.unit,
  province_count: NSO_LFS_JSON.meta.province_count,
  downloaded_at: NSO_LFS_JSON.meta.downloaded_at,
  total: NSO_LFS_RECORDS.length
};
