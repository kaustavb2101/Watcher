export class LaborAnalytics {
    static calculateOpportunityScore(province) {
        const branchDensity = province.branches / 100; // Normalized
        const laborSupply = province.occupations.reduce((acc, curr) => acc + curr.population, 0) / 100000;
        
        // Simple scoring formula: Supply presence weight vs Branch density (Saturation)
        const score = (laborSupply * 0.7) + ((1 - branchDensity) * 0.3);
        return Math.min(Math.max(score * 10, 0), 10); // 0-10 Scale
    }

    static getSpecializedSectors(province) {
        return province.occupations
            .sort((a, b) => b.population - a.population)
            .slice(0, 3)
            .map(o => o.name);
    }
}
