export class RegionalAnalysisService {
    static aggregate(provinces, regionName) {
        const filtered = provinces.filter(p => p.region === regionName);
        if (filtered.length === 0) return null;

        const totalBranches = filtered.reduce((acc, curr) => acc + (curr.branches || 0), 0);
        const avgOpportunity = filtered.reduce((acc, curr) => acc + (curr.opportunityScore || 0), 0) / filtered.length;
        
        return {
            region: regionName,
            provinceCount: filtered.length,
            totalBranches,
            averageOpportunity: parseFloat(avgOpportunity.toFixed(2)),
            benchmarks: {
                vsNational: avgOpportunity > 5 ? 'Above Average' : 'Needs Intervention'
            }
        };
    }

    static rank(provinces, metric = 'opportunityScore') {
        return [...provinces].sort((a, b) => (b[metric] || 0) - (a[metric] || 0));
    }
}
