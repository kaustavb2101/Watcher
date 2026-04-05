export class InsightEngineService {
    static generateInsights(data) {
        const insights = [];

        // Insight Trigger: High Opportunity score
        if (data.averageOpportunity > 8) {
            insights.push({
                id: 'high-opp-001',
                title: 'Market Expansion Opportunity',
                category: 'Strategic',
                supportingMetrics: `Opportunity Index: ${data.averageOpportunity}`,
                explanation: `High concentration of unbanked occupations relative to branch density in this region indicates a prime expansion window.`,
                confidence: 0.92,
                source: 'TMLI Analytics Engine'
            });
        }

        // Insight Trigger: High Unemployment with High GISTDA risk
        if (data.unemploymentRate > 1.5 && data.climateRisk === 'High') {
            insights.push({
                id: 'risk-001',
                title: 'Vulnerable Labor Segment detected',
                category: 'Risk',
                supportingMetrics: `Unemployment: ${data.unemploymentRate}%, Climate Impact: High`,
                explanation: `Overlapping labor slack and climate stress suggests high probability of NPL increase in agricultural segments.`,
                confidence: 0.88,
                source: 'GISTDA + BOT Correlation'
            });
        }

        return insights;
    }
}
