/**
 * BANK OF THAILAND MACRO-ECONOMIC SNAPSHOT (Knowledge Base)
 * Used as a high-performance primary source for edge functions 
 * and a static fallback for live API calls.
 * 
 * Last Updated: 2026-03-29
 */

export const BOT_MACRO_KB = {
  policyRate: {
    value: 1.00,
    unit: '%',
    label: 'BOT Policy Rate (1-day Bilateral Repo)',
    period: '2026-03',
    trend: 'decreasing', // Cut from 1.25% in Feb 2026
    source: 'Bank of Thailand'
  },
  usdThb: {
    value: 32.92,
    unit: 'THB/USD',
    label: 'USD/THB Exchange Rate (Daily Mid)',
    period: '2026-03-27',
    trend: 'volatile',
    source: 'Bank of Thailand'
  },
  cpiHeadline: {
    value: 1.2,
    unit: '%YoY',
    label: 'CPI Headline Inflation',
    period: '2026-02',
    source: 'Bank of Thailand / NSO'
  },
  nplRatio: {
    value: 2.7,
    unit: '%',
    label: 'Commercial Bank NPL Ratio',
    period: '2025-Q4',
    source: 'Bank of Thailand'
  }
};

export const BOT_META = {
  knowledge_base_version: '1.0.0',
  last_sync: '2026-03-29T12:00:00Z',
  next_sync_scheduled: '2026-04-29T12:00:00Z',
  status: 'grounded'
};
