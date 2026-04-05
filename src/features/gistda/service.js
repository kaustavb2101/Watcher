import { GistdaAnalysisService } from '../../services/geospatial/gistda-analysis-service.js';
import { Store } from '../../app/lib/state.js';

export class GistdaFeature {
    constructor() {
        this.service = new GistdaAnalysisService();
    }

    async updateImpacts(provinceName) {
        Store.setState({ isAnalysisLoading: true });
        try {
            const impact = await this.service.getProvinceImpact(provinceName, 'rice');
            Store.setState({ gistdaImpact: impact, isAnalysisLoading: false });
        } catch (e) {
            Store.setState({ error: 'GISTDA Feed Failed', isAnalysisLoading: false });
        }
    }
}
