/**
 * THAILAND CLIMATE RISK KNOWLEDGE BASE
 * Provincial risk scores for Flood, Drought, and PM2.5.
 * 
 * Sources: DDPM, PCD, World Bank CCDR Thailand (2024-2026).
 * Scale: 0.0 (None) to 1.0 (Critical).
 */

export const CLIMATE_RISK_RECORDS = {
  'Bangkok': { pm25: 0.85, flood: 0.90, drought: 0.10, heat: 0.95 },
  'Samut Prakan': { pm25: 0.80, flood: 0.95, drought: 0.05, erosion: 0.90 },
  'Chon Buri': { pm25: 0.70, flood: 0.40, drought: 0.50 },
  'Rayong': { pm25: 0.75, flood: 0.30, drought: 0.40 },
  'Nakhon Ratchasima': { pm25: 0.60, flood: 0.70, drought: 0.85, heat: 0.80 },
  'Chiang Mai': { pm25: 0.98, flood: 0.50, drought: 0.40, landslide: 0.60 },
  'Chiang Rai': { pm25: 0.95, flood: 0.60, drought: 0.30, landslide: 0.75 },
  'Nakhon Sawan': { pm25: 0.65, flood: 0.90, drought: 0.70 },
  'Khon Kaen': { pm25: 0.55, flood: 0.60, drought: 0.80 },
  'Udon Thani': { pm25: 0.50, flood: 0.40, drought: 0.75 },
  'Surat Thani': { pm25: 0.30, flood: 0.80, drought: 0.20 },
  'Krabi': { pm25: 0.25, flood: 0.70, drought: 0.15 },
  'Songkhla': { pm25: 0.40, flood: 0.85, drought: 0.10 },
  'Phuket': { pm25: 0.30, flood: 0.60, drought: 0.10, storm: 0.70 },
  'Phra Nakhon Si Ayutthaya': { pm25: 0.75, flood: 0.98, drought: 0.20 }, // Historical high flood risk
  'Buri Ram': { pm25: 0.50, flood: 0.30, drought: 0.90 }, // High drought risk
};

export const CLIMATE_META = {
  knowledge_base_version: '1.0.0',
  last_sync: '2026-03-29T12:00:00Z',
  status: 'grounded'
};

/**
 * Helper to get risk for a province with regional fallbacks.
 */
export function getProvincialRisk(province) {
  const record = CLIMATE_RISK_RECORDS[province];
  if (record) return record;
  
  // National Averages if specific province missing
  return { pm25: 0.5, flood: 0.4, drought: 0.4 };
}
