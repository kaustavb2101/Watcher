import { NSOAdapter } from '../adapters/nsoAdapter.js';
import { NESDCAdapter } from '../adapters/nesdcAdapter.js';

export class RegionalAnalysisService {
    constructor() {
        this.nso = new NSOAdapter();
        this.nesdc = new NESDCAdapter();
    }

    async analyzeProvince(provinceName) {
        const [nsoData, nesdcData] = await Promise.all([
            this.nso.fetchRaw({ province: provinceName }).then(r => this.nso.normalize(r)),
            this.nesdc.fetchRaw({ province: provinceName }).then(r => this.nesdc.normalize(r))
        ]);

        // Logic ranking/comparison
        const score = (nesdcData.growth / 100) * 0.4 + (nsoData.length / 1000) * 0.6; 
        
        return {
            province: provinceName,
            economicScore: score.toFixed(2),
            gpp: nesdcData.gppPerCapita,
            mainEconomicDriver: nesdcData.primaryIndustry,
            stats: nsoData,
            status: "grounded"
        };
    }
}
