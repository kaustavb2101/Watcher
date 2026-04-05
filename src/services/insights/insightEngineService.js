export class InsightEngineService {
    /**
     * @param {Object} data - Aggregated metrics from all adapters
     * @returns {import('../../types/domain.js').Insight[]}
     */
    static generateInsights(data) {
        const insights = [];

        // 1. Regional Performance
        if (data.regionalData?.economicScore > 0.8) {
            insights.push({
                id: `eco_${data.activeProvince}`,
                title: "Top-Tier Economic Concentration",
                category: "Regional Intelligence",
                scope: "Province",
                explanation: `${data.activeProvince} exhibits a specialized growth score of ${data.regionalData.economicScore}, driven by ${data.regionalData.mainEconomicDriver}.`,
                whyItMatters: "High specialization suggests concentrated labor demand and opportunity for targeted branch rotation.",
                confidence: 0.92,
                supportingMetrics: [
                    { label: "Economic Score", value: data.regionalData.economicScore, source: "NSO/NESDC" }
                ]
            });
        }

        // 2. GISTDA Environmental Risk
        if (data.gistdaImpact?.indexValue > 0.7) {
            insights.push({
                id: `environment_${data.activeProvince}`,
                title: "Agricultural Water Index Warning",
                category: "Environment",
                scope: "Province",
                explanation: `GISTDA telemetry indicates an NDVI/Moisture index of ${data.gistdaImpact.indexValue}, well above baseline.`,
                whyItMatters: "Excess moisture/flooding risk directly impacts agricultural labor availability and branch catchment accessibility.",
                confidence: 0.85,
                supportingMetrics: [
                    { label: "Sentinel-2 Index", value: data.gistdaImpact.indexValue, source: "GISTDA" }
                ]
            });
        }

        return insights;
    }
}
