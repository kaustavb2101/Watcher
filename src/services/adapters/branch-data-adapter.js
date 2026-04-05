import { BaseAdapter } from './base-adapter.js';

export class BranchDataAdapter extends BaseAdapter {
    constructor() {
        super('BranchData');
    }

    async getBranches() {
        // Sourced from internal config/provinces.js but validated
        const { PROVINCE_PROFILES } = await import('../../app/config/provinces.js');
        return this.normalize(PROVINCE_PROFILES);
    }

    normalize(profiles) {
        return Object.entries(profiles).map(([name, data]) => ({
            province: name,
            count: data.branches,
            region: data.region,
            precision: 'province-level'
        }));
    }
}
