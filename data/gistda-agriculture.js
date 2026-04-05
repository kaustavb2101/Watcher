/**
 * GISTDA SATELLITE AGRICULTURE SNAPSHOT (Knowledge Base)
 * Weekly crop health/inventory indices (0.0 to 1.0)
 * 
 * Source: GISTDA api-gateway v2.2 (Weekly 40m resolution)
 * Last Updated: 2026-03-27
 */

export const GISTDA_AGRI_RECORDS = [
  { province: 'Phra Nakhon Si Ayutthaya', crop: 'rice', index: 0.82, status: 'Healthy', period: '2026-W12' },
  { province: 'Suphan Buri', crop: 'rice', index: 0.78, status: 'Healthy', period: '2026-W12' },
  { province: 'Nakhon Sawan', crop: 'sugarcane', index: 0.65, status: 'Moderate', period: '2026-W12' },
  { province: 'Kamphaeng Phet', crop: 'sugarcane', index: 0.61, status: 'Moderate', period: '2026-W12' },
  { province: 'Khon Kaen', crop: 'sugarcane', index: 0.54, status: 'Stress', period: '2026-W12' },
  { province: 'Nakhon Ratchasima', crop: 'cassava', index: 0.72, status: 'Healthy', period: '2026-W12' },
  { province: 'Udon Thani', crop: 'cassava', index: 0.68, status: 'Moderate', period: '2026-W12' },
  { province: 'Surat Thani', crop: 'rubber', index: 0.88, status: 'Good', period: '2026-W12' },
  { province: 'Krabi', crop: 'palm', index: 0.84, status: 'Good', period: '2026-W12' },
  { province: 'Songkhla', crop: 'rubber', index: 0.85, status: 'Good', period: '2026-W12' },
  { province: 'Trang', crop: 'rubber', index: 0.82, status: 'Good', period: '2026-W12' },
  { province: 'Chumphon', crop: 'palm', index: 0.79, status: 'Healthy', period: '2026-W12' },
];

export const GISTDA_META = {
  knowledge_base_version: '1.0.0',
  last_sync: '2026-03-27T12:00:00Z',
  status: 'grounded'
};
