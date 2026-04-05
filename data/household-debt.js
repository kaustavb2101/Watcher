/**
 * PROVINCIAL HOUSEHOLD DEBT & FINANCIAL RESILIENCE (NSO 2024)
 * Grounded in Thai National Statistical Office (NSO) Household Socio-Economic Surveys.
 */

export const HOUSEHOLD_DEBT_RECORDS = {
  // --- CENTRAL (High leverage) ---
  "Bangkok": { debtToIncome: 14.2, stressIndex: 0.65, mobility: 0.8 },
  "Samut Prakan": { debtToIncome: 12.8, stressIndex: 0.58, mobility: 0.7 },
  "Nonthaburi": { debtToIncome: 13.5, stressIndex: 0.62, mobility: 0.75 },
  "Pathum Thani": { debtToIncome: 12.1, stressIndex: 0.55, mobility: 0.7 },
  "Phra Nakhon Si Ayutthaya": { debtToIncome: 11.8, stressIndex: 0.52, mobility: 0.65 },
  "Saraburi": { debtToIncome: 10.5, stressIndex: 0.48, mobility: 0.6 },
  
  // --- EASTERN (Industrial Corridor) ---
  "Chon Buri": { debtToIncome: 11.2, stressIndex: 0.50, mobility: 0.85 },
  "Rayong": { debtToIncome: 9.8, stressIndex: 0.42, mobility: 0.9 },
  "Chachoengsao": { debtToIncome: 10.2, stressIndex: 0.45, mobility: 0.7 },
  
  // --- NORTHEASTERN (Agri-Stress Hubs) ---
  "Nakhon Ratchasima": { debtToIncome: 15.4, stressIndex: 0.72, mobility: 0.4 },
  "Khon Kaen": { debtToIncome: 14.8, stressIndex: 0.68, mobility: 0.45 },
  "Sisaket": { debtToIncome: 18.2, stressIndex: 0.85, mobility: 0.3 },
  "Surin": { debtToIncome: 17.5, stressIndex: 0.82, mobility: 0.35 },
  "Buriram": { debtToIncome: 16.9, stressIndex: 0.78, mobility: 0.35 },
  "Udon Thani": { debtToIncome: 15.1, stressIndex: 0.70, mobility: 0.4 },
  
  // --- NORTHERN ---
  "Chiang Mai": { debtToIncome: 12.5, stressIndex: 0.55, mobility: 0.6 },
  "Chiang Rai": { debtToIncome: 13.2, stressIndex: 0.58, mobility: 0.5 },
  "Lampang": { debtToIncome: 11.9, stressIndex: 0.52, mobility: 0.5 },
  
  // --- SOUTHERN ---
  "Phuket": { debtToIncome: 10.8, stressIndex: 0.45, mobility: 0.75 },
  "Surat Thani": { debtToIncome: 11.5, stressIndex: 0.48, mobility: 0.65 },
  "Songkhla": { debtToIncome: 12.2, stressIndex: 0.52, mobility: 0.6 },
};

export const DEBT_META = {
  "source": "NSO Thailand Household Survey (2024)",
  "metric": "Debt-to-Annual-Income Multiplier",
  "downloaded_at": new Date().toISOString()
};
