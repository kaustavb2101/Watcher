export class RecommendationEngine {
    static generate(laborData, province, climateData = null) {
        const recommendations = [];
        const signals = {
            unemployment: parseFloat(laborData.unemploymentRate || 0),
            sector: laborData.dominantSector || 'Agriculture',
            risk: climateData?.riskLevel || 'Low'
        };

        // Logic based on Ngern Chaiyo target segments (Farmers, MSMEs, Factory Workers)
        if (signals.unemployment < 1.0) {
            recommendations.push({
                title: "MSME Expansion Credit",
                score: 0.85,
                rationale: "Low local unemployment indicates high economic activity and business stability.",
                implication: "High probability of repayment; target local retail and service MSMEs."
            });
        }

        if (signals.sector === 'Agriculture' && signals.risk === 'High') {
            recommendations.push({
                title: "Crop Insurance & Emergency Fund",
                score: 0.95,
                rationale: "High climate risk detected via GISTDA layers for agricultural province.",
                implication: "Offer defensive financial products and climate-resilient loan restructuring."
            });
        }

        return recommendations;
    }
}
