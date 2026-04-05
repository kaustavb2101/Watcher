/**
 * WORLD BANK COMMODITY PRICE SNAPSHOT (Knowledge Base)
 * Snapshots of benchmark prices for energy and agricultural commodities.
 * 
 * Last Updated: 2026-03-29
 */

export const COMMODITIES_KB = {
  energy: {
    brentOil: {
      value: 112.57,
      unit: 'USD/bbl',
      label: 'Brent Crude Oil (Benchmark)',
      period: '2026-03-27',
      trend: 'increasing', // +51% in March 2026
      source: 'World Price Index'
    },
    wtiOil: {
      value: 99.12,
      unit: 'USD/bbl',
      label: 'West Texas Intermediate (WTI)',
      period: '2026-03-27',
      trend: 'increasing',
      source: 'World Price Index'
    },
    naturalGas: {
      value: 4.85,
      unit: 'USD/mmbtu',
      label: 'Natural Gas',
      period: '2026-03',
      source: 'World Bank'
    }
  },
  agricultural: {
    thaiRice: {
      value: 642.00,
      unit: 'USD/mt',
      label: 'Thai Rice (5% Broken)',
      period: '2026-03-27',
      trend: 'increasing',
      source: 'FOB Bangkok / World Bank'
    },
    naturalRubber: {
      value: 1.68,
      unit: 'USD/kg',
      label: 'Natural Rubber (SGX RSS3)',
      period: '2026-03',
      source: 'World Bank'
    },
    palmOil: {
      value: 1150.00,
      unit: 'USD/mt',
      label: 'Palm Oil (Malaysia Benchmark)',
      period: '2026-03',
      source: 'World Bank'
    },
    cassava: {
      value: 285.00,
      unit: 'USD/mt',
      label: 'Cassava',
      period: '2026-02',
      source: 'OAE Thailand'
    }
  }
};

export const COMMODITY_META = {
  knowledge_base_version: '1.0.0',
  last_sync: '2026-03-29T12:00:00Z',
  next_sync_scheduled: '2026-04-29T12:00:00Z',
  status: 'grounded'
};
