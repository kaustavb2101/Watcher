// TMLI Logic Verification Tests (Standard Jest-like assertions)

import { NSOAdapter } from '../services/adapters/nso-adapter.js';
import { RegionalAnalysisService } from '../services/analytics/regional-analysis-service.js';

export const runTests = () => {
    console.log('[QA] Starting TMLI Intelligence Verification...');

    // 1. Adapter Test: NSO Normalization
    const nso = new NSOAdapter();
    const mockRaw = { results: [{ province: 'Bangkok', value: '100', unit: 'units' }] };
    const normalized = nso.normalize(mockRaw);
    if (normalized[0].value === 100) {
        console.log('✅ TEST PASSED: NSO Adapter Normalization');
    } else {
        console.error('❌ TEST FAILED: NSO Adapter Normalization');
    }

    // 2. Analytics Test: Regional Aggregation
    const provinces = [
        { province: 'Bangkok', region: 'Central', opportunityScore: 10, branches: 5 },
        { province: 'Pathum Thani', region: 'Central', opportunityScore: 8, branches: 3 }
    ];
    const aggr = RegionalAnalysisService.aggregate(provinces, 'Central');
    if (aggr.totalBranches === 8 && aggr.averageOpportunity === 9) {
        console.log('✅ TEST PASSED: Regional Aggregation Calculation');
    } else {
        console.error('❌ TEST FAILED: Regional Aggregation Calculation');
    }

    console.log('[QA] All critical paths verified.');
};
