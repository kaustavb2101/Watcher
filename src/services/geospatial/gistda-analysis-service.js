import { GistdaAdapter } from '../adapters/gistda-adapter.js';

export class GistdaAnalysisService {
    constructor() {
        this.adapter = new GistdaAdapter();
    }

    async getProvinceImpact(provinceName, cropType) {
        try {
            const stats = await this.adapter.getCropStats(provinceName, cropType);
            if (!stats) return this.nullState('No satellite data for this province');
            
            // Logic: High index in drought-prone or flood-prone month = High Impact
            const impactScore = stats.index > 80 ? 'High' : (stats.index > 40 ? 'Moderate' : 'Low');
            
            return {
                province: provinceName,
                crop: cropType,
                score: impactScore,
                rawIndex: stats.index,
                lastUpdated: stats.timestamp
            };
        } catch (e) {
            return this.nullState('GISTDA Service Temporarily Unavailable');
        }
    }

    nullState(reason) {
        return { status: 'unavailable', reason };
    }
}
