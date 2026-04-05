import { BranchIntelligenceService } from '../../services/analytics/branch-intelligence-service.js';
import { Store } from '../../app/lib/state.js';

export class BranchFeature {
    constructor() {
        this.service = new BranchIntelligenceService();
    }

    async loadBranchStrategy(provinceName) {
        const strategy = await this.service.getBranchStrategy(provinceName);
        Store.setState({ activeBranchStrategy: strategy });
    }
}
