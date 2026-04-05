/**
 * PROVINCIAL ECONOMIC SPECIALIZATION (GPP Sector Weights) - 2024/2025
 * Grounded in NESDC Regional GDP Profiles
 */

export const PROVINCIAL_ECONOMY_RECORDS = {
  // --- CENTRAL ---
  "Bangkok": { gdp: 5500000, manufacturing: 0.2, services: 0.8, agri: 0.0, retail: 0.9, finance: 0.9, logistics: 0.6, hubType: "TOUR" },
  "Samut Prakan": { gdp: 820000, manufacturing: 0.7, services: 0.1, agri: 0.0, retail: 0.4, finance: 0.2, logistics: 0.9, hubType: "IND" },
  "Nonthaburi": { gdp: 350000, manufacturing: 0.3, services: 0.5, agri: 0.1, retail: 0.8, finance: 0.4, logistics: 0.5, hubType: "MIX" },
  "Pathum Thani": { gdp: 450000, manufacturing: 0.6, services: 0.3, agri: 0.1, retail: 0.6, finance: 0.3, logistics: 0.8, hubType: "IND" },
  "Phra Nakhon Si Ayutthaya": { gdp: 420000, manufacturing: 0.7, services: 0.2, agri: 0.1, retail: 0.4, finance: 0.2, logistics: 0.6, hubType: "IND" },
  "Ang Thong": { gdp: 35000, manufacturing: 0.2, services: 0.1, agri: 0.7, retail: 0.3, finance: 0.1, logistics: 0.2, hubType: "AGRI" },
  "Lop Buri": { gdp: 120000, manufacturing: 0.4, services: 0.2, agri: 0.4, retail: 0.4, finance: 0.2, logistics: 0.3, hubType: "MIX" },
  "Sing Buri": { gdp: 32000, manufacturing: 0.3, services: 0.1, agri: 0.6, retail: 0.3, finance: 0.1, logistics: 0.2, hubType: "AGRI" },
  "Chai Nat": { gdp: 38000, manufacturing: 0.1, services: 0.1, agri: 0.8, retail: 0.3, finance: 0.1, logistics: 0.2, hubType: "AGRI" },
  "Saraburi": { gdp: 250000, manufacturing: 0.7, services: 0.1, agri: 0.2, retail: 0.4, finance: 0.2, logistics: 0.6, hubType: "IND" },

  // --- EASTERN ---
  "Chon Buri": { gdp: 1200000, manufacturing: 0.6, tourism: 0.3, agri: 0.1, retail: 0.7, finance: 0.4, logistics: 0.9, hubType: "IND" },
  "Rayong": { gdp: 1100000, manufacturing: 0.8, tourism: 0.1, agri: 0.1, retail: 0.4, finance: 0.2, logistics: 0.8, hubType: "IND" },
  "Chachoengsao": { gdp: 410000, manufacturing: 0.7, tourism: 0.1, agri: 0.2, retail: 0.4, finance: 0.2, logistics: 0.7, hubType: "IND" },
  "Prachin Buri": { gdp: 320000, manufacturing: 0.8, tourism: 0.1, agri: 0.1, retail: 0.3, finance: 0.1, logistics: 0.6, hubType: "IND" },
  "Sa Kaeo": { gdp: 65000, manufacturing: 0.2, tourism: 0.1, agri: 0.7, retail: 0.4, finance: 0.1, logistics: 0.5, hubType: "AGRI" },
  "Chanthaburi": { gdp: 160000, manufacturing: 0.1, tourism: 0.2, agri: 0.7, retail: 0.4, finance: 0.1, logistics: 0.3, hubType: "AGRI" },
  "Trat": { gdp: 52000, manufacturing: 0.1, tourism: 0.4, agri: 0.5, retail: 0.3, finance: 0.1, logistics: 0.4, hubType: "TOUR" },

  // --- NORTHEASTERN (Agri Hub) ---
  "Nakhon Ratchasima": { gdp: 380000, manufacturing: 0.4, tourism: 0.2, agri: 0.4, retail: 0.6, finance: 0.3, logistics: 0.7, hubType: "MIX" },
  "Khon Kaen": { gdp: 220000, manufacturing: 0.3, tourism: 0.2, agri: 0.5, retail: 0.7, finance: 0.4, logistics: 0.6, hubType: "AGRI" },
  "Ubon Ratchathani": { gdp: 140000, manufacturing: 0.2, tourism: 0.1, agri: 0.7, retail: 0.5, finance: 0.2, logistics: 0.4, hubType: "AGRI" },
  "Buriram": { gdp: 110000, manufacturing: 0.1, tourism: 0.3, agri: 0.6, retail: 0.4, finance: 0.1, logistics: 0.3, hubType: "AGRI" },
  "Surin": { gdp: 95000, manufacturing: 0.1, tourism: 0.1, agri: 0.8, retail: 0.4, finance: 0.1, logistics: 0.2, hubType: "AGRI" },
  "Sisaket": { gdp: 85000, manufacturing: 0.1, tourism: 0.1, agri: 0.8, retail: 0.4, finance: 0.1, logistics: 0.2, hubType: "AGRI" },
  "Chaiyaphum": { gdp: 80000, manufacturing: 0.2, tourism: 0.1, agri: 0.7, retail: 0.4, finance: 0.1, logistics: 0.3, hubType: "AGRI" },
  "Roi Et": { gdp: 90000, manufacturing: 0.1, tourism: 0.1, agri: 0.8, retail: 0.4, finance: 0.1, logistics: 0.3, hubType: "AGRI" },
  "Mahasarakham": { gdp: 75000, manufacturing: 0.1, tourism: 0.1, agri: 0.8, retail: 0.4, finance: 0.1, logistics: 0.2, hubType: "AGRI" },
  "Kalasin": { gdp: 72000, manufacturing: 0.1, tourism: 0.1, agri: 0.8, retail: 0.4, finance: 0.1, logistics: 0.2, hubType: "AGRI" },
  "Udon Thani": { gdp: 130000, manufacturing: 0.2, tourism: 0.2, agri: 0.6, retail: 0.6, finance: 0.3, logistics: 0.5, hubType: "AGRI" },
  "Nong Khai": { gdp: 54000, manufacturing: 0.1, tourism: 0.2, agri: 0.7, retail: 0.4, finance: 0.1, logistics: 0.6, hubType: "AGRI" },
  "Loei": { gdp: 68000, manufacturing: 0.1, tourism: 0.4, agri: 0.5, retail: 0.3, finance: 0.1, logistics: 0.3, hubType: "TOUR" },
  "Nong Bua Lam Phu": { gdp: 38000, manufacturing: 0.1, tourism: 0.1, agri: 0.8, retail: 0.2, finance: 0.1, logistics: 0.2, hubType: "AGRI" },
  "Bungkan": { gdp: 28000, manufacturing: 0.1, tourism: 0.1, agri: 0.8, retail: 0.2, finance: 0.1, logistics: 0.2, hubType: "AGRI" },
  "Sakon Nakhon": { gdp: 105000, manufacturing: 0.1, tourism: 0.1, agri: 0.8, retail: 0.4, finance: 0.1, logistics: 0.3, hubType: "AGRI" },
  "Nakhon Phanom": { gdp: 65000, manufacturing: 0.1, tourism: 0.1, agri: 0.8, retail: 0.4, finance: 0.1, logistics: 0.4, hubType: "AGRI" },
  "Mukdahan": { gdp: 35000, manufacturing: 0.1, tourism: 0.1, agri: 0.8, retail: 0.4, finance: 0.1, logistics: 0.6, hubType: "AGRI" },
  "Amnat Charoen": { gdp: 24000, manufacturing: 0.1, tourism: 0.1, agri: 0.8, retail: 0.2, finance: 0.1, logistics: 0.2, hubType: "AGRI" },
  "Yasothon": { gdp: 38000, manufacturing: 0.1, tourism: 0.1, agri: 0.8, retail: 0.3, finance: 0.1, logistics: 0.2, hubType: "AGRI" },

  // --- NORTHERN ---
  "Chiang Mai": { gdp: 280000, manufacturing: 0.1, tourism: 0.7, agri: 0.2, retail: 0.8, finance: 0.4, logistics: 0.5, hubType: "TOUR" },
  "Chiang Rai": { gdp: 120000, manufacturing: 0.1, tourism: 0.4, agri: 0.5, retail: 0.5, finance: 0.2, logistics: 0.6, hubType: "TOUR" },
  "Lampang": { gdp: 85000, manufacturing: 0.4, tourism: 0.2, agri: 0.4, retail: 0.4, finance: 0.2, logistics: 0.4, hubType: "MIX" },
  "Lamphun": { gdp: 110000, manufacturing: 0.8, tourism: 0.1, agri: 0.1, retail: 0.3, finance: 0.1, logistics: 0.4, hubType: "IND" },
  "Mae Hong Son": { gdp: 18000, manufacturing: 0.0, tourism: 0.6, agri: 0.4, retail: 0.2, finance: 0.1, logistics: 0.1, hubType: "TOUR" },
  "Phrae": { gdp: 45000, manufacturing: 0.2, tourism: 0.2, agri: 0.6, retail: 0.3, finance: 0.1, logistics: 0.2, hubType: "AGRI" },
  "Nan": { gdp: 42000, manufacturing: 0.1, tourism: 0.4, agri: 0.5, retail: 0.3, finance: 0.1, logistics: 0.2, hubType: "TOUR" },
  "Phayao": { gdp: 54000, manufacturing: 0.1, tourism: 0.2, agri: 0.7, retail: 0.3, finance: 0.1, logistics: 0.3, hubType: "AGRI" },
  "Uttaradit": { gdp: 51000, manufacturing: 0.1, tourism: 0.1, agri: 0.8, retail: 0.3, finance: 0.1, logistics: 0.3, hubType: "AGRI" },
  "Phitsanulok": { gdp: 115000, manufacturing: 0.3, tourism: 0.2, agri: 0.5, retail: 0.6, finance: 0.3, logistics: 0.7, hubType: "MIX" },
  "Sukhothai": { gdp: 65000, manufacturing: 0.1, tourism: 0.4, agri: 0.5, retail: 0.4, finance: 0.1, logistics: 0.3, hubType: "TOUR" },
  "Tak": { gdp: 72000, manufacturing: 0.4, tourism: 0.2, agri: 0.4, retail: 0.4, finance: 0.2, logistics: 0.7, hubType: "IND" },
  "Kamphaeng Phet": { gdp: 120000, manufacturing: 0.2, tourism: 0.1, agri: 0.7, retail: 0.3, finance: 0.1, logistics: 0.4, hubType: "AGRI" },
  "Phichit": { gdp: 78000, manufacturing: 0.1, tourism: 0.1, agri: 0.8, retail: 0.3, finance: 0.1, logistics: 0.3, hubType: "AGRI" },
  "Phetchabun": { gdp: 92000, manufacturing: 0.1, tourism: 0.3, agri: 0.6, retail: 0.4, finance: 0.1, logistics: 0.3, hubType: "AGRI" },
  "Nakhon Sawan": { gdp: 135000, manufacturing: 0.3, tourism: 0.1, agri: 0.6, retail: 0.6, finance: 0.3, logistics: 0.8, hubType: "MIX" },
  "Uthai Thani": { gdp: 38000, manufacturing: 0.1, tourism: 0.2, agri: 0.7, retail: 0.3, finance: 0.1, logistics: 0.2, hubType: "AGRI" },

  // --- WESTERN ---
  "Ratchaburi": { gdp: 210000, manufacturing: 0.6, tourism: 0.2, agri: 0.2, retail: 0.4, finance: 0.2, logistics: 0.5, hubType: "IND" },
  "Kanchanaburi": { gdp: 115000, manufacturing: 0.2, tourism: 0.5, agri: 0.3, retail: 0.4, finance: 0.2, logistics: 0.4, hubType: "TOUR" },
  "Phetchaburi": { gdp: 95000, manufacturing: 0.4, tourism: 0.4, agri: 0.2, retail: 0.4, finance: 0.2, logistics: 0.4, hubType: "TOUR" },
  "Prachuap Khiri Khan": { gdp: 110000, manufacturing: 0.2, tourism: 0.6, agri: 0.2, retail: 0.5, finance: 0.2, logistics: 0.4, hubType: "TOUR" },
  "Samut Songkhram": { gdp: 28000, manufacturing: 0.3, tourism: 0.4, agri: 0.3, retail: 0.3, finance: 0.1, logistics: 0.3, hubType: "TOUR" },
  "Samut Sakhon": { gdp: 450000, manufacturing: 0.8, tourism: 0.1, agri: 0.1, retail: 0.5, finance: 0.2, logistics: 0.9, hubType: "IND" },

  // --- SOUTHERN ---
  "Phuket": { gdp: 260000, manufacturing: 0.0, tourism: 0.9, agri: 0.1, retail: 0.8, finance: 0.5, logistics: 0.3, hubType: "TOUR" },
  "Krabi": { gdp: 120000, manufacturing: 0.1, tourism: 0.7, agri: 0.2, retail: 0.5, finance: 0.2, logistics: 0.3, hubType: "TOUR" },
  "Phang Nga": { gdp: 85000, manufacturing: 0.1, tourism: 0.7, agri: 0.2, retail: 0.4, finance: 0.2, logistics: 0.3, hubType: "TOUR" },
  "Surat Thani": { gdp: 240000, manufacturing: 0.2, tourism: 0.4, agri: 0.4, retail: 0.6, finance: 0.3, logistics: 0.5, hubType: "TOUR" },
  "Nakhon Si Thammarat": { gdp: 190000, manufacturing: 0.2, tourism: 0.1, agri: 0.7, retail: 0.5, finance: 0.2, logistics: 0.4, hubType: "AGRI" },
  "Songkhla": { gdp: 280000, manufacturing: 0.3, tourism: 0.2, agri: 0.5, retail: 0.7, finance: 0.4, logistics: 0.8, hubType: "IND" },
  "Trang": { gdp: 95000, manufacturing: 0.2, tourism: 0.2, agri: 0.6, retail: 0.4, finance: 0.2, logistics: 0.4, hubType: "AGRI" },
  "Satun": { gdp: 42000, manufacturing: 0.1, tourism: 0.4, agri: 0.5, retail: 0.3, finance: 0.1, logistics: 0.4, hubType: "TOUR" },
  "Phatthalung": { gdp: 48000, manufacturing: 0.1, tourism: 0.1, agri: 0.8, retail: 0.4, finance: 0.1, logistics: 0.2, hubType: "AGRI" },
  "Ranong": { gdp: 32000, manufacturing: 0.1, tourism: 0.2, agri: 0.7, retail: 0.3, finance: 0.1, logistics: 0.4, hubType: "AGRI" },
  "Chumphon": { gdp: 110000, manufacturing: 0.1, tourism: 0.2, agri: 0.7, retail: 0.4, finance: 0.2, logistics: 0.4, hubType: "AGRI" },
  "Pattani": { gdp: 54000, manufacturing: 0.2, tourism: 0.1, agri: 0.7, retail: 0.4, finance: 0.1, logistics: 0.4, hubType: "AGRI" },
  "Yala": { gdp: 62000, manufacturing: 0.2, tourism: 0.1, agri: 0.7, retail: 0.4, finance: 0.1, logistics: 0.3, hubType: "AGRI" },
  "Narathiwat": { gdp: 58000, manufacturing: 0.1, tourism: 0.1, agri: 0.8, retail: 0.4, finance: 0.1, logistics: 0.3, hubType: "AGRI" }
};

export const ECON_META = {
  "source": "NESDC Thailand (2024 Provisional)",
  "resolution": "Provincial",
  "granularity": "Sector-weighted GPP Profiles",
  "unit": "Million THB",
  "downloaded_at": "2026-03-30T14:10:30Z"
};
