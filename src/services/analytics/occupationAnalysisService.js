import { SkillMappingAdapter } from '../adapters/skillMappingAdapter.js';
import { DOEAdapter } from '../adapters/doeAdapter.js';

export class OccupationAnalysisService {
    constructor() {
        this.skills = new SkillMappingAdapter();
        this.doe = new DOEAdapter();
    }

    async getProvinceOccupations(provinceName) {
        // Fetch top occupations and join with skills
        const demand = await this.doe.fetchRaw({ province: provinceName });
        const normalizedDemand = await this.doe.normalize(demand);

        // Enhance with Skill Mapping for top 5
        const detailed = await Promise.all(
            normalizedDemand.slice(0, 5).map(async (occ) => {
                const skillData = await this.skills.fetchRaw(occ.occupationName)
                    .then(r => this.skills.normalize(r))
                    .catch(() => []);
                return { ...occ, skills: skillData[0]?.skills || [] };
            })
        );

        return detailed;
    }
}
