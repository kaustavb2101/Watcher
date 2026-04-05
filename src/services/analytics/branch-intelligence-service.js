import { BranchDataAdapter } from '../adapters/branch-data-adapter.js';

export class BranchIntelligenceService {
    constructor() {
        this.adapter = new BranchDataAdapter();
    }

    async getBranchStrategy(provinceName) {
        const branches = await this.adapter.getBranches();
        const provinceBranch = branches.find(b => b.province === provinceName);
        
        if (!provinceBranch || provinceBranch.count === 0) {
            return { strategy: 'Market Entry', recommendation: 'High potential for new branch setup.' };
        }

        const density = provinceBranch.count;
        return {
            strategy: density > 10 ? 'Market Rotation' : 'Market Expansion',
            branchCount: density,
            recommendation: density > 10 ? 'High saturation; focus on digital lean branches.' : 'Expand physical presence in high-growth sub-districts.'
        };
    }
}
