import { SkillMappingAdapter } from '../adapters/skillmapping-adapter.js';

export class OccupationAnalysisService {
    constructor() {
        this.adapter = new SkillMappingAdapter();
    }

    async getOccupationIntelligence(provinceName, topN = 5) {
        // In local config/provinces.js, we have the verified occupation mix
        const { PROVINCE_PROFILES } = await import('../../app/config/provinces.js');
        const occupations = PROVINCE_PROFILES[provinceName]?.professions || [];
        
        const detailed = await Promise.all(occupations.slice(0, topN).map(async (o) => {
            const skills = await this.adapter.getOccupationSkills(o.name);
            return {
                name: o.name,
                population: o.population,
                specializationScore: (o.population / 1000).toFixed(2), // Relative concentration
                topSkills: skills.slice(0, 3)
            };
        }));

        return detailed.sort((a, b) => b.population - a.population);
    }
}
