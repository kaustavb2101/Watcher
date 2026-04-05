import { OccupationAnalysisService } from '../../services/analytics/occupation-analysis-service.js';
import { Store } from '../../app/lib/state.js';

export class OccupationFeature {
    constructor() {
        this.service = new OccupationAnalysisService();
    }

    async loadProvinceOccupations(provinceName) {
        Store.setState({ isAnalysisLoading: true });
        try {
            const intelligence = await this.service.getOccupationIntelligence(provinceName);
            Store.setState({ activeOccupations: intelligence, isAnalysisLoading: false });
        } catch (e) {
            Store.setState({ error: 'Occupation Service Failed', isAnalysisLoading: false });
        }
    }
}
