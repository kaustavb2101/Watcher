export class RecommendationEngine {
    static getStrategicRecommendations(provinceData, occupationData) {
        const recommendations = [];

        // 1. Occupation-based hiring
        const highDemand = occupationData.filter(o => (o.value > 100 || o.demand_score > 70));
        if (highDemand.length > 0) {
            recommendations.push({
                title: "Accelerated Talent Acquisition",
                scope: provinceData.province,
                confidence: 0.88,
                inputsUsed: ["SkillMapping", "DOE Vacancies"],
                reasons: `High demand detected in ${highDemand[0].occupationName}.`,
                commercialImplication: "Risk of labor shortage in critical branch operations. Priority hiring required."
            });
        }

        // 2. Branch Posture
        if (provinceData.economicScore > 0.75) {
            recommendations.push({
                title: "Market Expansion Pilot",
                scope: provinceData.province,
                confidence: 0.94,
                inputsUsed: ["NESDC GPP", "NSO Business Count"],
                reasons: "Tier-1 Economic Specialization and concentration detected.",
                commercialImplication: "Sub-district market saturation is low relative to economic throughput. Favorable for new branch catchment."
            });
        }

        return recommendations;
    }
}
