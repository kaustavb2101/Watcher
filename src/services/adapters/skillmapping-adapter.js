import { BaseAdapter } from './base-adapter.js';

export class SkillMappingAdapter extends BaseAdapter {
    constructor() {
        super('SkillMapping');
        this.baseUrl = 'https://skill.kmitl.ac.th/api';
    }

    async getOccupationSkills(occId) {
        // Conceptual endpoint based on search — hardening required with real dev keys
        const url = `${this.baseUrl}/occupations/${occId}/skills?format=json`;
        const raw = await this.fetchRaw(url).catch(() => ({ data: [] })); 
        return this.normalize(raw);
    }

    normalize(raw) {
        const skills = raw.data || [];
        return skills.map(s => ({
            name: s.skill_name || s.name,
            demandLevel: s.demand_index || 0.5,
            relevance: s.relevance_score || 1.0
        }));
    }
}
