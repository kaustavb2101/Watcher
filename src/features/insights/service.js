import { InsightEngineService } from '../../services/insights/insight-engine-service.js';
import { Store } from '../../app/lib/state.js';

export class InsightFeature {
    static async refreshInsights() {
        const state = Store.state;
        const insights = InsightEngineService.generateInsights({
            averageOpportunity: state.analysisResults?.opportunityIndex || 0,
            unemploymentRate: state.analysisResults?.unemploymentRate || 0,
            climateRisk: state.gistdaImpact?.score || 'Low'
        });
        Store.setState({ activeInsights: insights });
    }
}
