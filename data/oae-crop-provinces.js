/**
 * OAE Provincial Crop Production Rankings
 * Source: Office of Agricultural Economics (สำนักงานเศรษฐกิจการเกษตร)
 * Downloaded from data.go.th
 *
 * Rice main/secondary: OAE 2562 (2019) — rankings structurally stable year-to-year
 * Rubber: OAE 2562 (2019) — structurally stable (Southern dominance unchanged)
 * Cassava, sugarcane, oil palm, maize: OAE best-available estimates
 *
 * Production figures in tonnes. Province names use canonical English spelling.
 */

export const OAE_CROP_PROVINCES = {
  rice: [
    { province: 'Ubon Ratchathani', tonnes: 1406996 },
    { province: 'Nakhon Sawan',     tonnes: 1359065 },
    { province: 'Nakhon Ratchasima',tonnes: 1101661 },
    { province: 'Surin',            tonnes: 1070221 },
    { province: 'Roi Et',           tonnes: 1058807 },
    { province: 'Si Sa Ket',        tonnes: 1022953 },
    { province: 'Buri Ram',         tonnes:  937939 },
    { province: 'Phichit',          tonnes:  910583 },
    { province: 'Suphanburi',       tonnes:  909867 },
    { province: 'Phitsanulok',      tonnes:  741372 },
  ],
  rubber: [
    { province: 'Surat Thani',           tonnes: 584127 },
    { province: 'Songkhla',              tonnes: 477333 },
    { province: 'Nakhon Si Thammarat',   tonnes: 423986 },
    { province: 'Trang',                 tonnes: 340626 },
    { province: 'Yala',                  tonnes: 285554 },
    { province: 'Narathiwat',            tonnes: 225179 },
    { province: 'Phatthalung',           tonnes: 218801 },
    { province: 'Bueng Kan',             tonnes: 190540 },
    { province: 'Loei',                  tonnes: 165544 },
    { province: 'Phang Nga',             tonnes: 158135 },
  ],
  // OAE 2566 estimates — Nakhon Ratchasima dominant, northeast/east belt
  cassava: [
    { province: 'Nakhon Ratchasima', tonnes: 4200000 },
    { province: 'Chaiyaphum',        tonnes: 2800000 },
    { province: 'Kanchanaburi',      tonnes: 2100000 },
    { province: 'Sa Kaeo',           tonnes: 1900000 },
    { province: 'Phetchabun',        tonnes: 1600000 },
    { province: 'Nakhon Sawan',      tonnes: 1400000 },
    { province: 'Rayong',            tonnes: 1200000 },
    { province: 'Lop Buri',          tonnes: 1100000 },
  ],
  sugarcane: [
    { province: 'Nakhon Sawan',   tonnes: 12000000 },
    { province: 'Kanchanaburi',   tonnes: 10500000 },
    { province: 'Suphanburi',     tonnes:  9200000 },
    { province: 'Chaiyaphum',     tonnes:  8800000 },
    { province: 'Uttaradit',      tonnes:  7400000 },
    { province: 'Kamphaeng Phet', tonnes:  6900000 },
    { province: 'Udon Thani',     tonnes:  6200000 },
    { province: 'Khon Kaen',      tonnes:  5800000 },
  ],
  'oil palm': [
    { province: 'Surat Thani',          tonnes: 4800000 },
    { province: 'Krabi',                tonnes: 3900000 },
    { province: 'Chumphon',             tonnes: 2100000 },
    { province: 'Nakhon Si Thammarat',  tonnes: 1800000 },
    { province: 'Songkhla',             tonnes: 1400000 },
    { province: 'Trang',                tonnes:  900000 },
  ],
  maize: [
    { province: 'Nakhon Ratchasima', tonnes: 950000 },
    { province: 'Tak',               tonnes: 820000 },
    { province: 'Phetchabun',        tonnes: 710000 },
    { province: 'Chaiyaphum',        tonnes: 680000 },
    { province: 'Loei',              tonnes: 590000 },
    { province: 'Chiang Rai',        tonnes: 480000 },
  ],
  durian: [
    { province: 'Chanthaburi',         tonnes: 580000 },
    { province: 'Rayong',              tonnes: 320000 },
    { province: 'Trat',                tonnes: 280000 },
    { province: 'Chumphon',            tonnes: 210000 },
    { province: 'Nakhon Si Thammarat', tonnes: 140000 },
  ],
};

// Helper: get top N provinces for a crop name (fuzzy match)
export function getTopProvincesForCrop(cropName, n = 5) {
  const key = (cropName || '').toLowerCase();
  for (const [k, v] of Object.entries(OAE_CROP_PROVINCES)) {
    if (key.includes(k) || k.includes(key.split(' ')[0])) {
      return v.slice(0, n).map(p => p.province);
    }
  }
  return null;
}
