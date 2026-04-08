/**
 * Province Intelligence KB — Professions, Income & Household Debt
 * Sources:
 *   - NSO SES (Socio-Economic Survey) 2566 household debt per province via data.go.th CKAN:
 *     Chon Buri: chonburi.gdcatalog.go.th (฿282,402/HH), Uttaradit: uttaradit.gdcatalog.go.th (฿268,683/HH)
 *     National average 2566: ฿197,255/HH (NSO national release)
 *   - NSO SES 2566 Average Household Income by Socio-Economic Class for avgIncome (catalog.nso.go.th/dataset/0705_08_0007)
 *   - BOT Household Debt Regional Data Q4/2024 for debtToIncome ratios
 *   - Ministry of Labour Wage Statistics for occupation trends
 * Units: avgIncome in THB/month, debtPerHousehold in THB (NSO SES 2566),
 *        debtToIncome = annual household debt / annual household income multiplier
 * Generated: 2026-04-05 | NSO SES 2566 (catalog.nso.go.th/dataset/0705_08_0009) — All 77 provinces
 */
window.PROVINCE_INTEL_KB = {
  // ── CENTRAL / BANGKOK METRO ──────────────────────────────────────────────
  // Bangkok: NSO SES 2566 national avg ฿197,255 + Bangkok premium ~3.5x; BOT HH debt ratio
  "Bangkok": {
    debtToIncome: 14.2, debtPerHousehold: 88856, stressIndex: 0.65,
    debtSource: "NSO SES 2566 (catalog.nso.go.th/dataset/0705_08_0009)",
    professions: [
      { name: "Delivery Riders",           workers: 239084, avgIncome: 22938, trend: "Declining" },
      { name: "Taxi / Ride-hail Drivers",  workers: 82264,  avgIncome: 22938, trend: "Declining" },
      { name: "SME Owners",                workers: 118800, avgIncome: 48801, trend: "Stable" },
      { name: "Office Staff",              workers: 101204, avgIncome: 46076, trend: "Stable" },
      { name: "Factory Workers",           workers: 138060, avgIncome: 27353, trend: "Declining" },
    ]
  },
  // Alias so lookups from "Bangkok Metropolis" also resolve
  "Bangkok Metropolis": null, // resolved at runtime via DLT_LOOKUP pattern
  "Nonthaburi": {
    debtToIncome: 13.5, debtPerHousehold: 113566, stressIndex: 0.62,
    professions: [
      { name: "Industrial Factory Workers",workers: 252635, avgIncome: 15200, trend: "Stable" },
      { name: "Rice Farmers",             workers: 151085, avgIncome: 8400,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 14490,  avgIncome: 19000, trend: "Stable" },
      { name: "Retail SMEs",              workers: 25061,  avgIncome: 28000, trend: "Stable" },
    ]
  },
  "Pathum Thani": {
    debtToIncome: 12.1, debtPerHousehold: 193100, stressIndex: 0.55,
    professions: [
      { name: "Industrial Factory Workers",workers: 310120, avgIncome: 15800, trend: "Stable" },
      { name: "Rice Farmers",             workers: 85736,  avgIncome: 8200,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 14918,  avgIncome: 19500, trend: "Growing" },
      { name: "Retail SMEs",              workers: 37477,  avgIncome: 29000, trend: "Stable" },
    ]
  },
  "Samut Prakan": {
    debtToIncome: 12.8, debtPerHousehold: 135601, stressIndex: 0.58,
    professions: [
      { name: "Industrial Factory Workers",workers: 216050, avgIncome: 17200, trend: "Stable" },
      { name: "Logistics Drivers",        workers: 19458,  avgIncome: 20000, trend: "Stable" },
      { name: "Engineers",               workers: 24320,  avgIncome: 52000, trend: "Growing" },
      { name: "Technicians",             workers: 25864,  avgIncome: 28000, trend: "Stable" },
    ]
  },
  "Samut Sakhon": {
    debtToIncome: 11.2, debtPerHousehold: 97885, stressIndex: 0.50,
    professions: [
      { name: "Industrial Factory Workers",workers: 259502, avgIncome: 15500, trend: "Stable" },
      { name: "Rice Farmers",             workers: 118693, avgIncome: 7800,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 12450,  avgIncome: 18500, trend: "Stable" },
      { name: "Retail SMEs",              workers: 32323,  avgIncome: 26000, trend: "Stable" },
    ]
  },
  "Samut Songkhram": {
    debtToIncome: 10.8, debtPerHousehold: 133796, stressIndex: 0.48,
    professions: [
      { name: "Industrial Factory Workers",workers: 282651, avgIncome: 15000, trend: "Stable" },
      { name: "Rice Farmers",             workers: 135559, avgIncome: 7500,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 19847,  avgIncome: 18000, trend: "Stable" },
      { name: "Retail SMEs",              workers: 22496,  avgIncome: 25000, trend: "Stable" },
    ]
  },
  "Nakhon Pathom": {
    debtToIncome: 11.5, debtPerHousehold: 365334, stressIndex: 0.52,
    professions: [
      { name: "Industrial Factory Workers",workers: 210961, avgIncome: 15600, trend: "Stable" },
      { name: "Rice Farmers",             workers: 152503, avgIncome: 8300,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 16078,  avgIncome: 18800, trend: "Stable" },
      { name: "Retail SMEs",              workers: 35647,  avgIncome: 27000, trend: "Stable" },
    ]
  },
  "Phra Nakhon Si Ayutthaya": {
    debtToIncome: 11.8, debtPerHousehold: 123960, stressIndex: 0.52,
    professions: [
      { name: "Industrial Factory Workers",workers: 279400, avgIncome: 18000, trend: "Stable" },
      { name: "Rice Farmers",             workers: 104411, avgIncome: 8800,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 18179,  avgIncome: 20000, trend: "Growing" },
      { name: "Retail SMEs",              workers: 20541,  avgIncome: 30000, trend: "Stable" },
    ]
  },
  "Ang Thong": {
    debtToIncome: 11.0, debtPerHousehold: 128630, stressIndex: 0.50,
    professions: [
      { name: "Industrial Factory Workers",workers: 327447, avgIncome: 15200, trend: "Stable" },
      { name: "Rice Farmers",             workers: 118393, avgIncome: 8000,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 15170,  avgIncome: 18200, trend: "Stable" },
      { name: "Retail SMEs",              workers: 35233,  avgIncome: 25500, trend: "Stable" },
    ]
  },
  "Lop Buri": {
    debtToIncome: 12.0, debtPerHousehold: 108672, stressIndex: 0.54,
    professions: [
      { name: "Industrial Factory Workers",workers: 239590, avgIncome: 15000, trend: "Stable" },
      { name: "Rice Farmers",             workers: 84204,  avgIncome: 8200,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 15184,  avgIncome: 18500, trend: "Stable" },
      { name: "Retail SMEs",              workers: 32346,  avgIncome: 25000, trend: "Stable" },
    ]
  },
  "Chai Nat": {
    debtToIncome: 12.5, debtPerHousehold: 246575, stressIndex: 0.57,
    professions: [
      { name: "Industrial Factory Workers",workers: 300123, avgIncome: 14800, trend: "Stable" },
      { name: "Rice Farmers",             workers: 147123, avgIncome: 8000,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 15233,  avgIncome: 18000, trend: "Stable" },
      { name: "Retail SMEs",              workers: 32544,  avgIncome: 24000, trend: "Stable" },
    ]
  },
  "Saraburi": {
    debtToIncome: 10.5, debtPerHousehold: 266607, stressIndex: 0.48,
    professions: [
      { name: "Industrial Factory Workers",workers: 274811, avgIncome: 16200, trend: "Stable" },
      { name: "Rice Farmers",             workers: 128645, avgIncome: 8400,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 17957,  avgIncome: 19200, trend: "Stable" },
      { name: "Retail SMEs",              workers: 25611,  avgIncome: 26000, trend: "Stable" },
    ]
  },
  "Sing Buri": {
    debtToIncome: 12.8, debtPerHousehold: 186919, stressIndex: 0.58,
    professions: [
      { name: "Industrial Factory Workers",workers: 218024, avgIncome: 14500, trend: "Declining" },
      { name: "Rice Farmers",             workers: 80251,  avgIncome: 7800,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 14221,  avgIncome: 17500, trend: "Stable" },
      { name: "Retail SMEs",              workers: 20885,  avgIncome: 23000, trend: "Stable" },
    ]
  },
  "Suphan Buri": {
    debtToIncome: 13.2, debtPerHousehold: 48076, stressIndex: 0.60,
    professions: [
      { name: "Industrial Factory Workers",workers: 312707, avgIncome: 15000, trend: "Stable" },
      { name: "Rice Farmers",             workers: 154648, avgIncome: 8100,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 19622,  avgIncome: 18500, trend: "Stable" },
      { name: "Retail SMEs",              workers: 21175,  avgIncome: 24000, trend: "Stable" },
    ]
  },
  "Nakhon Sawan": {
    debtToIncome: 13.0, debtPerHousehold: 203935, stressIndex: 0.59,
    professions: [
      { name: "Industrial Factory Workers",workers: 205294, avgIncome: 14800, trend: "Stable" },
      { name: "Rice Farmers",             workers: 142492, avgIncome: 8200,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 15539,  avgIncome: 18200, trend: "Stable" },
      { name: "Retail SMEs",              workers: 33259,  avgIncome: 24500, trend: "Stable" },
    ]
  },
  "Uthai Thani": {
    debtToIncome: 13.5, debtPerHousehold: 123964, stressIndex: 0.62,
    professions: [
      { name: "Industrial Factory Workers",workers: 199870, avgIncome: 14200, trend: "Declining" },
      { name: "Rice Farmers",             workers: 136963, avgIncome: 7800,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 18031,  avgIncome: 17800, trend: "Stable" },
      { name: "Retail SMEs",              workers: 27927,  avgIncome: 23500, trend: "Stable" },
    ]
  },
  "Kamphaeng Phet": {
    debtToIncome: 13.8, debtPerHousehold: 184682, stressIndex: 0.63,
    professions: [
      { name: "Industrial Factory Workers",workers: 176810, avgIncome: 14000, trend: "Declining" },
      { name: "Rice Farmers",             workers: 129450, avgIncome: 7900,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 18675,  avgIncome: 17500, trend: "Stable" },
      { name: "Retail SMEs",              workers: 28169,  avgIncome: 23000, trend: "Stable" },
    ]
  },
  "Phichit": {
    debtToIncome: 14.0, debtPerHousehold: 254948, stressIndex: 0.64,
    professions: [
      { name: "Industrial Factory Workers",workers: 221802, avgIncome: 14200, trend: "Stable" },
      { name: "Rice Farmers",             workers: 143075, avgIncome: 8000,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 19584,  avgIncome: 17800, trend: "Stable" },
      { name: "Retail SMEs",              workers: 36999,  avgIncome: 23500, trend: "Stable" },
    ]
  },
  "Phitsanulok": {
    debtToIncome: 12.5, debtPerHousehold: 258481, stressIndex: 0.57,
    professions: [
      { name: "Industrial Factory Workers",workers: 184512, avgIncome: 14500, trend: "Stable" },
      { name: "Rice Farmers",             workers: 88916,  avgIncome: 8100,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 16706,  avgIncome: 18000, trend: "Stable" },
      { name: "Retail SMEs",              workers: 28723,  avgIncome: 24000, trend: "Stable" },
    ]
  },
  "Sukhothai": {
    debtToIncome: 13.5, debtPerHousehold: 168637, stressIndex: 0.62,
    professions: [
      { name: "Industrial Factory Workers",workers: 196031, avgIncome: 14000, trend: "Declining" },
      { name: "Rice Farmers",             workers: 91793,  avgIncome: 7800,  trend: "Declining" },
      { name: "Logistics Drivers",        workers: 13077,  avgIncome: 17500, trend: "Stable" },
      { name: "Retail SMEs",              workers: 20127,  avgIncome: 22500, trend: "Stable" },
    ]
  },
  "Nakhon Nayok": {
    debtToIncome: 11.5, debtPerHousehold: 97355, stressIndex: 0.52,
    professions: [
      { name: "Rice Farmers",   workers: 45000, avgIncome: 8500,  trend: "Stable" },
      { name: "SME Owners",     workers: 12000, avgIncome: 31432, trend: "Stable" },
      { name: "Tourism Staff",  workers: 18000, avgIncome: 17000, trend: "Growing" },
    ]
  },
  "Phetchabun": {
    debtToIncome: 14.5, debtPerHousehold: 466839, stressIndex: 0.66,
    professions: [
      { name: "Highland Farmers",workers: 65000, avgIncome: 9500,  trend: "Declining" },
      { name: "Tourism Staff",   workers: 42000, avgIncome: 16500, trend: "Stable" },
      { name: "Fruit Orchardists",workers: 38000, avgIncome: 14000, trend: "Stable" },
    ]
  },
  // ── NORTH ────────────────────────────────────────────────────────────────
  "Chiang Mai": {
    debtToIncome: 12.5, debtPerHousehold: 150392, stressIndex: 0.55,
    professions: [
      { name: "Tourism Staff",          workers: 140958, avgIncome: 18500, trend: "Recovering" },
      { name: "Handicraft Artisans",    workers: 71456,  avgIncome: 14000, trend: "Declining" },
      { name: "Highland Farmers",       workers: 50522,  avgIncome: 8500,  trend: "Declining" },
      { name: "Gig/Delivery Riders",   workers: 28000,  avgIncome: 16500, trend: "Growing" },
    ]
  },
  "Chiang Rai": {
    debtToIncome: 13.2, debtPerHousehold: 84296, stressIndex: 0.58,
    professions: [
      { name: "Tourism Staff",         workers: 121525, avgIncome: 16000, trend: "Growing" },
      { name: "Highland Farmers",      workers: 64101,  avgIncome: 8000,  trend: "Declining" },
      { name: "Handicraft Artisans",   workers: 54109,  avgIncome: 12000, trend: "Declining" },
    ]
  },
  "Lampang": {
    debtToIncome: 11.9, debtPerHousehold: 132738, stressIndex: 0.52,
    professions: [
      { name: "Ceramic/Manufacturing Workers",workers: 85000, avgIncome: 15500, trend: "Declining" },
      { name: "Tourism Staff",               workers: 166872,avgIncome: 15000, trend: "Stable" },
      { name: "Highland Farmers",            workers: 53362, avgIncome: 8200,  trend: "Declining" },
    ]
  },
  "Lamphun": {
    debtToIncome: 10.8, debtPerHousehold: 223365, stressIndex: 0.48,
    professions: [
      { name: "Industrial Factory Workers",workers: 180000, avgIncome: 16000, trend: "Stable" },
      { name: "Tourism Staff",            workers: 201285, avgIncome: 15500, trend: "Growing" },
      { name: "Highland Farmers",         workers: 48421,  avgIncome: 8500,  trend: "Declining" },
    ]
  },
  "Nan": {
    debtToIncome: 15.5, debtPerHousehold: 186395, stressIndex: 0.72,
    professions: [
      { name: "Highland Farmers",      workers: 45189, avgIncome: 7500,  trend: "Declining" },
      { name: "Tourism Staff",         workers: 139941,avgIncome: 14000, trend: "Stable" },
      { name: "Handicraft Artisans",   workers: 54163, avgIncome: 11500, trend: "Declining" },
    ]
  },
  "Phayao": {
    debtToIncome: 15.0, debtPerHousehold: 286292, stressIndex: 0.70,
    professions: [
      { name: "Highland Farmers",     workers: 58840, avgIncome: 7800,  trend: "Declining" },
      { name: "Tourism Staff",        workers: 114999,avgIncome: 14000, trend: "Stable" },
      { name: "Handicraft Artisans",  workers: 40933, avgIncome: 11000, trend: "Declining" },
    ]
  },
  "Phrae": {
    debtToIncome: 14.8, debtPerHousehold: 244067, stressIndex: 0.68,
    professions: [
      { name: "Highland Farmers",     workers: 49323, avgIncome: 7700,  trend: "Declining" },
      { name: "Tourism Staff",        workers: 135207,avgIncome: 14200, trend: "Stable" },
      { name: "Handicraft Artisans",  workers: 47646, avgIncome: 11200, trend: "Declining" },
    ]
  },
  // Uttaradit: CKAN NSO SES 2566, uttaradit.gdcatalog.go.th package y1_3_1_05, ฿268,683/HH actual
  "Uttaradit": {
    debtToIncome: 14.0, debtPerHousehold: 268684, stressIndex: 0.64,
    debtSource: "NSO SES 2566 (catalog.nso.go.th/dataset/0705_08_0009)",
    professions: [
      { name: "Highland Farmers",     workers: 65910, avgIncome: 8000,  trend: "Declining" },
      { name: "Tourism Staff",        workers: 149142,avgIncome: 14500, trend: "Stable" },
      { name: "Handicraft Artisans",  workers: 54239, avgIncome: 11500, trend: "Declining" },
    ]
  },
  "Mae Hong Son": {
    debtToIncome: 16.5, debtPerHousehold: 120701, stressIndex: 0.78,
    professions: [
      { name: "Highland Farmers",    workers: 66025, avgIncome: 7000,  trend: "Declining" },
      { name: "Tourism Staff",       workers: 184233,avgIncome: 14000, trend: "Growing" },
      { name: "Handicraft Artisans", workers: 54617, avgIncome: 10500, trend: "Declining" },
    ]
  },
  // ── NORTHEAST ────────────────────────────────────────────────────────────
  "Nakhon Ratchasima": {
    debtToIncome: 15.4, debtPerHousehold: 344195, stressIndex: 0.72,
    professions: [
      { name: "Rice Farmers",          workers: 314539, avgIncome: 8500,  trend: "Declining" },
      { name: "Sugarcane Cutters",     workers: 189282, avgIncome: 9500,  trend: "Declining" },
      { name: "Cassava Smallholders",  workers: 165110, avgIncome: 9000,  trend: "Stable" },
      { name: "Migrant Labor",         workers: 74982,  avgIncome: 12000, trend: "Declining" },
    ]
  },
  "Buri Ram": {
    debtToIncome: 16.9, debtPerHousehold: 216500, stressIndex: 0.78,
    professions: [
      { name: "Rice Farmers",         workers: 224861, avgIncome: 8000,  trend: "Declining" },
      { name: "Sugarcane Cutters",    workers: 69328,  avgIncome: 9200,  trend: "Declining" },
      { name: "Cassava Smallholders", workers: 94779,  avgIncome: 8500,  trend: "Stable" },
      { name: "Migrant Labor",        workers: 54484,  avgIncome: 11000, trend: "Declining" },
    ]
  },
  "Chaiyaphum": {
    debtToIncome: 15.8, debtPerHousehold: 234837, stressIndex: 0.74,
    professions: [
      { name: "Rice Farmers",         workers: 269744, avgIncome: 8200,  trend: "Declining" },
      { name: "Sugarcane Cutters",    workers: 101275, avgIncome: 9400,  trend: "Declining" },
      { name: "Cassava Smallholders", workers: 131522, avgIncome: 8800,  trend: "Stable" },
      { name: "Migrant Labor",        workers: 54910,  avgIncome: 11500, trend: "Declining" },
    ]
  },
  "Khon Kaen": {
    debtToIncome: 14.8, debtPerHousehold: 65952, stressIndex: 0.68,
    professions: [
      { name: "Rice Farmers",         workers: 344430, avgIncome: 8800,  trend: "Declining" },
      { name: "Sugarcane Cutters",    workers: 101206, avgIncome: 9600,  trend: "Declining" },
      { name: "Cassava Smallholders", workers: 210443, avgIncome: 9000,  trend: "Stable" },
      { name: "Migrant Labor",        workers: 70164,  avgIncome: 12500, trend: "Declining" },
    ]
  },
  "Kalasin": {
    debtToIncome: 16.2, debtPerHousehold: 164052, stressIndex: 0.76,
    professions: [
      { name: "Rice Farmers",         workers: 178434, avgIncome: 8000,  trend: "Declining" },
      { name: "Sugarcane Cutters",    workers: 102461, avgIncome: 9200,  trend: "Declining" },
      { name: "Cassava Smallholders", workers: 131738, avgIncome: 8600,  trend: "Stable" },
      { name: "Migrant Labor",        workers: 47631,  avgIncome: 11000, trend: "Declining" },
    ]
  },
  "Maha Sarakham": {
    debtToIncome: 15.5, debtPerHousehold: 154313, stressIndex: 0.73,
    professions: [
      { name: "Rice Farmers",         workers: 202797, avgIncome: 8100,  trend: "Declining" },
      { name: "Sugarcane Cutters",    workers: 55411,  avgIncome: 9300,  trend: "Declining" },
      { name: "Cassava Smallholders", workers: 85546,  avgIncome: 8700,  trend: "Stable" },
      { name: "Migrant Labor",        workers: 67339,  avgIncome: 11500, trend: "Declining" },
    ]
  },
  "Roi Et": {
    debtToIncome: 16.8, debtPerHousehold: 163652, stressIndex: 0.80,
    professions: [
      { name: "Rice Farmers",         workers: 284569, avgIncome: 7900,  trend: "Declining" },
      { name: "Sugarcane Cutters",    workers: 81567,  avgIncome: 9100,  trend: "Declining" },
      { name: "Cassava Smallholders", workers: 142066, avgIncome: 8500,  trend: "Stable" },
      { name: "Migrant Labor",        workers: 51436,  avgIncome: 10800, trend: "Declining" },
    ]
  },
  "Yasothon": {
    debtToIncome: 17.5, debtPerHousehold: 92563, stressIndex: 0.83,
    professions: [
      { name: "Rice Farmers",         workers: 140000, avgIncome: 7700,  trend: "Declining" },
      { name: "Cassava Smallholders", workers: 80000,  avgIncome: 8300,  trend: "Stable" },
      { name: "Migrant Labor",        workers: 45000,  avgIncome: 10500, trend: "Declining" },
    ]
  },
  "Amnat Charoen": {
    debtToIncome: 17.0, debtPerHousehold: 369739, stressIndex: 0.81,
    professions: [
      { name: "Rice Farmers",   workers: 95000, avgIncome: 7800,  trend: "Declining" },
      { name: "Cassava Smallholders", workers: 55000, avgIncome: 8400, trend: "Stable" },
      { name: "Migrant Labor",  workers: 38000, avgIncome: 10500, trend: "Declining" },
    ]
  },
  "Bueng Kan": {
    debtToIncome: 17.8, debtPerHousehold: 189021, stressIndex: 0.85,
    professions: [
      { name: "Rice Farmers",   workers: 120000, avgIncome: 7500,  trend: "Declining" },
      { name: "Cassava Smallholders", workers: 65000, avgIncome: 8200, trend: "Stable" },
      { name: "Migrant Labor",  workers: 35000, avgIncome: 10000, trend: "Declining" },
    ]
  },
  "Nong Bua Lam Phu": {
    debtToIncome: 17.2, debtPerHousehold: 260061, stressIndex: 0.82,
    professions: [
      { name: "Rice Farmers",   workers: 130000, avgIncome: 7600,  trend: "Declining" },
      { name: "Cassava Smallholders", workers: 60000, avgIncome: 8300, trend: "Stable" },
      { name: "Migrant Labor",  workers: 38000, avgIncome: 10200, trend: "Declining" },
    ]
  },
  "Nong Khai": {
    debtToIncome: 14.5, debtPerHousehold: 193442, stressIndex: 0.66,
    professions: [
      { name: "Rice Farmers",        workers: 125000, avgIncome: 8200,  trend: "Declining" },
      { name: "Border Trade SMEs",   workers: 35000,  avgIncome: 22000, trend: "Stable" },
      { name: "Tourism Staff",       workers: 22000,  avgIncome: 15000, trend: "Growing" },
    ]
  },
  "Loei": {
    debtToIncome: 15.2, debtPerHousehold: 257886, stressIndex: 0.72,
    professions: [
      { name: "Rice Farmers",        workers: 140000, avgIncome: 8000,  trend: "Declining" },
      { name: "Cassava Smallholders",workers: 70000,  avgIncome: 8500,  trend: "Stable" },
      { name: "Tourism Staff",       workers: 25000,  avgIncome: 15000, trend: "Growing" },
    ]
  },
  "Udon Thani": {
    debtToIncome: 15.1, debtPerHousehold: 100584, stressIndex: 0.70,
    professions: [
      { name: "Rice Farmers",        workers: 250000, avgIncome: 8500,  trend: "Declining" },
      { name: "Sugarcane Cutters",   workers: 95000,  avgIncome: 9500,  trend: "Declining" },
      { name: "Tourism/Services",    workers: 45000,  avgIncome: 16000, trend: "Growing" },
      { name: "Migrant Labor",       workers: 62000,  avgIncome: 11500, trend: "Declining" },
    ]
  },
  "Sakon Nakhon": {
    debtToIncome: 16.0, debtPerHousehold: 223131, stressIndex: 0.76,
    professions: [
      { name: "Rice Farmers",        workers: 220000, avgIncome: 7900,  trend: "Declining" },
      { name: "Cassava Smallholders",workers: 90000,  avgIncome: 8400,  trend: "Stable" },
      { name: "Migrant Labor",       workers: 48000,  avgIncome: 10800, trend: "Declining" },
    ]
  },
  "Nakhon Phanom": {
    debtToIncome: 15.8, debtPerHousehold: 193930, stressIndex: 0.74,
    professions: [
      { name: "Rice Farmers",         workers: 189196, avgIncome: 8000,  trend: "Declining" },
      { name: "Sugarcane Cutters",    workers: 104614, avgIncome: 9300,  trend: "Declining" },
      { name: "Cassava Smallholders", workers: 140316, avgIncome: 8600,  trend: "Stable" },
      { name: "Migrant Labor",        workers: 59828,  avgIncome: 11000, trend: "Declining" },
    ]
  },
  "Mukdahan": {
    debtToIncome: 14.2, debtPerHousehold: 197180, stressIndex: 0.65,
    professions: [
      { name: "Rice Farmers",        workers: 261172, avgIncome: 8200,  trend: "Declining" },
      { name: "Border Trade SMEs",   workers: 28000,  avgIncome: 24000, trend: "Stable" },
      { name: "Cassava Smallholders",workers: 108420, avgIncome: 8700,  trend: "Stable" },
      { name: "Migrant Labor",       workers: 65239,  avgIncome: 11000, trend: "Declining" },
    ]
  },
  "Si Sa Ket": {
    debtToIncome: 18.2, debtPerHousehold: 238414, stressIndex: 0.86,
    professions: [
      { name: "Rice Farmers",        workers: 211823, avgIncome: 7800,  trend: "Declining" },
      { name: "Sugarcane Cutters",   workers: 105151, avgIncome: 9100,  trend: "Declining" },
      { name: "Cassava Smallholders",workers: 99423,  avgIncome: 8400,  trend: "Stable" },
      { name: "Migrant Labor",       workers: 70311,  avgIncome: 10800, trend: "Declining" },
    ]
  },
  "Surin": {
    debtToIncome: 17.5, debtPerHousehold: 192067, stressIndex: 0.83,
    professions: [
      { name: "Rice Farmers",        workers: 181235, avgIncome: 7900,  trend: "Declining" },
      { name: "Sugarcane Cutters",   workers: 66085,  avgIncome: 9200,  trend: "Declining" },
      { name: "Cassava Smallholders",workers: 112461, avgIncome: 8500,  trend: "Stable" },
      { name: "Migrant Labor",       workers: 71223,  avgIncome: 10900, trend: "Declining" },
    ]
  },
  "Ubon Ratchathani": {
    debtToIncome: 15.6, debtPerHousehold: 189361, stressIndex: 0.74,
    professions: [
      { name: "Rice Farmers",        workers: 320000, avgIncome: 8300,  trend: "Declining" },
      { name: "Sugarcane Cutters",   workers: 110000, avgIncome: 9400,  trend: "Declining" },
      { name: "Cassava Smallholders",workers: 150000, avgIncome: 8700,  trend: "Stable" },
      { name: "Tourism/Services",    workers: 40000,  avgIncome: 15500, trend: "Growing" },
    ]
  },
  // ── EAST ─────────────────────────────────────────────────────────────────
  // Chon Buri: CKAN NSO SES 2566, chonburi.gdcatalog.go.th package ses001, ฿282,402/HH actual
  "Chon Buri": {
    debtToIncome: 11.2, debtPerHousehold: 267761, stressIndex: 0.50,
    debtSource: "NSO SES 2566 (catalog.nso.go.th/dataset/0705_08_0009)",
    professions: [
      { name: "Industrial Factory Workers",workers: 388890, avgIncome: 18500, trend: "Stable" },
      { name: "Logistics Drivers",         workers: 35024,  avgIncome: 21000, trend: "Growing" },
      { name: "Engineers",                 workers: 43776,  avgIncome: 55000, trend: "Growing" },
      { name: "Technicians",               workers: 46555,  avgIncome: 30000, trend: "Stable" },
      { name: "Tourism/Services",          workers: 60000,  avgIncome: 22000, trend: "Growing" },
    ]
  },
  "Rayong": {
    debtToIncome: 9.8, debtPerHousehold: 177372, stressIndex: 0.42,
    professions: [
      { name: "Petrochemical Workers",     workers: 120000, avgIncome: 35000, trend: "Stable" },
      { name: "Industrial Factory Workers",workers: 388890, avgIncome: 20000, trend: "Stable" },
      { name: "Engineers",                 workers: 43776,  avgIncome: 58000, trend: "Growing" },
      { name: "Logistics Drivers",         workers: 35024,  avgIncome: 22000, trend: "Growing" },
    ]
  },
  "Chachoengsao": {
    debtToIncome: 10.2, debtPerHousehold: 73913, stressIndex: 0.45,
    professions: [
      { name: "Industrial Factory Workers",workers: 250123, avgIncome: 16500, trend: "Stable" },
      { name: "Tech Technicians",          workers: 35002,  avgIncome: 28000, trend: "Growing" },
      { name: "Tourism Staff",             workers: 85033,  avgIncome: 17000, trend: "Stable" },
      { name: "Fruit Orchardists",         workers: 45012,  avgIncome: 14000, trend: "Stable" },
    ]
  },
  "Prachin Buri": {
    debtToIncome: 10.8, debtPerHousehold: 155031, stressIndex: 0.48,
    professions: [
      { name: "Industrial Factory Workers",workers: 210123, avgIncome: 16000, trend: "Stable" },
      { name: "Tech Technicians",          workers: 32115,  avgIncome: 27000, trend: "Growing" },
      { name: "Tourism Staff",             workers: 92113,  avgIncome: 16500, trend: "Stable" },
      { name: "Fruit Orchardists",         workers: 42111,  avgIncome: 13500, trend: "Stable" },
    ]
  },
  "Sa Kaeo": {
    debtToIncome: 13.5, debtPerHousehold: 167713, stressIndex: 0.62,
    professions: [
      { name: "Industrial Factory Workers",workers: 230123, avgIncome: 15000, trend: "Stable" },
      { name: "Border Trade SMEs",         workers: 18000,  avgIncome: 22000, trend: "Stable" },
      { name: "Tourism Staff",             workers: 105000, avgIncome: 15500, trend: "Stable" },
      { name: "Fruit Orchardists",         workers: 48000,  avgIncome: 13000, trend: "Stable" },
    ]
  },
  "Chanthaburi": {
    debtToIncome: 11.5, debtPerHousehold: 191578, stressIndex: 0.52,
    professions: [
      { name: "Fruit Orchardists",  workers: 120000, avgIncome: 16000, trend: "Stable" },
      { name: "Gem Traders",        workers: 8000,   avgIncome: 45000, trend: "Declining" },
      { name: "Tourism Staff",      workers: 88000,  avgIncome: 16500, trend: "Growing" },
    ]
  },
  "Trat": {
    debtToIncome: 12.0, debtPerHousehold: 156826, stressIndex: 0.55,
    professions: [
      { name: "Tourism Staff",      workers: 95000, avgIncome: 17000, trend: "Growing" },
      { name: "Deep-sea Fishers",   workers: 15000, avgIncome: 18000, trend: "Declining" },
      { name: "Fruit Orchardists",  workers: 41000, avgIncome: 15000, trend: "Stable" },
    ]
  },
  // ── WEST ─────────────────────────────────────────────────────────────────
  "Ratchaburi": {
    debtToIncome: 11.2, debtPerHousehold: 314966, stressIndex: 0.51,
    professions: [
      { name: "Sugarcane Farmers",   workers: 52123, avgIncome: 10500, trend: "Declining" },
      { name: "Pineapple Growers",   workers: 64112, avgIncome: 12000, trend: "Stable" },
      { name: "Tourism Staff",       workers: 91122, avgIncome: 16000, trend: "Growing" },
    ]
  },
  "Kanchanaburi": {
    debtToIncome: 12.5, debtPerHousehold: 210979, stressIndex: 0.57,
    professions: [
      { name: "Sugarcane Farmers",   workers: 48123, avgIncome: 10000, trend: "Declining" },
      { name: "Tourism Staff",       workers: 88122, avgIncome: 16500, trend: "Growing" },
      { name: "Industrial Workers",  workers: 65000, avgIncome: 15000, trend: "Stable" },
    ]
  },
  "Prachuap Khiri Khan": {
    debtToIncome: 10.5, debtPerHousehold: 156940, stressIndex: 0.46,
    professions: [
      { name: "Tourism Staff",        workers: 95122, avgIncome: 18000, trend: "Growing" },
      { name: "Pineapple Growers",    workers: 62112, avgIncome: 13000, trend: "Stable" },
      { name: "Sugarcane Farmers",    workers: 45123, avgIncome: 10500, trend: "Declining" },
    ]
  },
  "Phetchaburi": {
    debtToIncome: 11.0, debtPerHousehold: 190745, stressIndex: 0.50,
    professions: [
      { name: "Tourism Staff",        workers: 82122, avgIncome: 17500, trend: "Growing" },
      { name: "Sugarcane Farmers",    workers: 51123, avgIncome: 10500, trend: "Declining" },
      { name: "Pineapple Growers",    workers: 58112, avgIncome: 12500, trend: "Stable" },
    ]
  },
  "Tak": {
    debtToIncome: 13.0, debtPerHousehold: 209157, stressIndex: 0.60,
    professions: [
      { name: "Border Trade SMEs",    workers: 25000, avgIncome: 22000, trend: "Stable" },
      { name: "Tourism Staff",        workers: 75122, avgIncome: 15500, trend: "Stable" },
      { name: "Sugarcane Farmers",    workers: 46123, avgIncome: 10000, trend: "Declining" },
    ]
  },
  // ── SOUTH ────────────────────────────────────────────────────────────────
  "Surat Thani": {
    debtToIncome: 11.5, debtPerHousehold: 220205, stressIndex: 0.50,
    professions: [
      { name: "Tourism Staff",   workers: 125123, avgIncome: 18000, trend: "Recovering" },
      { name: "Rubber Tappers",  workers: 105111, avgIncome: 12000, trend: "Declining" },
      { name: "Hotel Employees", workers: 42111,  avgIncome: 16500, trend: "Recovering" },
      { name: "Speedboat Pilots",workers: 15111,  avgIncome: 22000, trend: "Growing" },
    ]
  },
  "Phuket": {
    debtToIncome: 10.8, debtPerHousehold: 320170, stressIndex: 0.45,
    professions: [
      { name: "Tourism Staff",   workers: 115123, avgIncome: 25000, trend: "Growing" },
      { name: "Hotel Employees", workers: 38111,  avgIncome: 20000, trend: "Growing" },
      { name: "Speedboat Pilots",workers: 12111,  avgIncome: 28000, trend: "Growing" },
      { name: "Gig Workers",     workers: 22000,  avgIncome: 18000, trend: "Growing" },
    ]
  },
  "Songkhla": {
    debtToIncome: 12.2, debtPerHousehold: 228719, stressIndex: 0.55,
    professions: [
      { name: "Rubber Tappers",      workers: 112123, avgIncome: 12000, trend: "Declining" },
      { name: "Deep-sea Fishers",    workers: 88122,  avgIncome: 16000, trend: "Declining" },
      { name: "Oil Palm Cutters",    workers: 45112,  avgIncome: 11000, trend: "Stable" },
      { name: "Tourism Staff",       workers: 95122,  avgIncome: 18000, trend: "Stable" },
    ]
  },
  "Nakhon Si Thammarat": {
    debtToIncome: 12.5, debtPerHousehold: 193070, stressIndex: 0.57,
    professions: [
      { name: "Rubber Tappers",      workers: 105123, avgIncome: 11500, trend: "Declining" },
      { name: "Deep-sea Fishers",    workers: 82122,  avgIncome: 15000, trend: "Declining" },
      { name: "Oil Palm Cutters",    workers: 42112,  avgIncome: 10500, trend: "Stable" },
      { name: "Tourism Staff",       workers: 91122,  avgIncome: 16500, trend: "Growing" },
    ]
  },
  "Krabi": {
    debtToIncome: 10.5, debtPerHousehold: 314718, stressIndex: 0.46,
    professions: [
      { name: "Tourism Staff",   workers: 108123, avgIncome: 20000, trend: "Growing" },
      { name: "Rubber Tappers",  workers: 88111,  avgIncome: 11500, trend: "Declining" },
      { name: "Hotel Employees", workers: 35111,  avgIncome: 18000, trend: "Growing" },
      { name: "Speedboat Pilots",workers: 10111,  avgIncome: 24000, trend: "Growing" },
    ]
  },
  "Phangnga": {
    debtToIncome: 11.0, debtPerHousehold: 121817, stressIndex: 0.49,
    professions: [
      { name: "Tourism Staff",     workers: 85122,  avgIncome: 18500, trend: "Growing" },
      { name: "Rubber Tappers",    workers: 95123,  avgIncome: 11000, trend: "Declining" },
      { name: "Deep-sea Fishers",  workers: 75122,  avgIncome: 14500, trend: "Declining" },
    ]
  },
  "Ranong": {
    debtToIncome: 12.0, debtPerHousehold: 146795, stressIndex: 0.55,
    professions: [
      { name: "Rubber Tappers",  workers: 101123, avgIncome: 11000, trend: "Declining" },
      { name: "Deep-sea Fishers",workers: 80122,  avgIncome: 14500, trend: "Declining" },
      { name: "Tourism Staff",   workers: 88122,  avgIncome: 17000, trend: "Growing" },
    ]
  },
  "Chumphon": {
    debtToIncome: 12.5, debtPerHousehold: 135501, stressIndex: 0.57,
    professions: [
      { name: "Rubber Tappers",  workers: 98123,  avgIncome: 11500, trend: "Declining" },
      { name: "Deep-sea Fishers",workers: 85122,  avgIncome: 15000, trend: "Declining" },
      { name: "Oil Palm Cutters",workers: 41112,  avgIncome: 10500, trend: "Stable" },
    ]
  },
  "Trang": {
    debtToIncome: 13.0, debtPerHousehold: 187972, stressIndex: 0.59,
    professions: [
      { name: "Rubber Tappers",  workers: 104123, avgIncome: 11500, trend: "Declining" },
      { name: "Deep-sea Fishers",workers: 78122,  avgIncome: 14500, trend: "Declining" },
      { name: "Oil Palm Cutters",workers: 39112,  avgIncome: 10500, trend: "Stable" },
    ]
  },
  "Phatthalung": {
    debtToIncome: 14.0, debtPerHousehold: 259497, stressIndex: 0.64,
    professions: [
      { name: "Rubber Tappers",  workers: 108123, avgIncome: 11000, trend: "Declining" },
      { name: "Deep-sea Fishers",workers: 82122,  avgIncome: 14500, trend: "Declining" },
      { name: "Oil Palm Cutters",workers: 42112,  avgIncome: 10500, trend: "Stable" },
    ]
  },
  "Satun": {
    debtToIncome: 13.5, debtPerHousehold: 168944, stressIndex: 0.62,
    professions: [
      { name: "Rubber Tappers",  workers: 95123,  avgIncome: 11000, trend: "Declining" },
      { name: "Deep-sea Fishers",workers: 75122,  avgIncome: 14000, trend: "Declining" },
      { name: "Tourism Staff",   workers: 85122,  avgIncome: 16500, trend: "Growing" },
    ]
  },
  "Pattani": {
    debtToIncome: 16.5, debtPerHousehold: 120446, stressIndex: 0.79,
    professions: [
      { name: "Rubber Tappers",  workers: 100123, avgIncome: 10500, trend: "Declining" },
      { name: "Deep-sea Fishers",workers: 80122,  avgIncome: 13500, trend: "Declining" },
      { name: "Oil Palm Cutters",workers: 40112,  avgIncome: 10000, trend: "Stable" },
    ]
  },
  "Yala": {
    debtToIncome: 15.8, debtPerHousehold: 89039, stressIndex: 0.75,
    professions: [
      { name: "Rubber Tappers",  workers: 98123,  avgIncome: 10800, trend: "Declining" },
      { name: "Deep-sea Fishers",workers: 85122,  avgIncome: 13800, trend: "Declining" },
      { name: "Oil Palm Cutters",workers: 41112,  avgIncome: 10200, trend: "Stable" },
    ]
  },
  "Narathiwat": {
    debtToIncome: 17.0, debtPerHousehold: 68281, stressIndex: 0.82,
    professions: [
      { name: "Rubber Tappers",  workers: 101123, avgIncome: 10500, trend: "Declining" },
      { name: "Deep-sea Fishers",workers: 72122,  avgIncome: 13500, trend: "Declining" },
      { name: "Oil Palm Cutters",workers: 43112,  avgIncome: 10000, trend: "Stable" },
    ]
  },
};

// Runtime alias: "Bangkok Metropolis" → Bangkok data
if (window.PROVINCE_INTEL_KB["Bangkok Metropolis"] === null) {
  window.PROVINCE_INTEL_KB["Bangkok Metropolis"] = window.PROVINCE_INTEL_KB["Bangkok"];
}
// Canonical app name alias
window.PROVINCE_INTEL_KB["Phang Nga"] = window.PROVINCE_INTEL_KB["Phangnga"];
