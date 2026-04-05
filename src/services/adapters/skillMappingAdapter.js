import { BaseAdapter } from './base-adapter.js';

/**
 * @extends {BaseAdapter<null, any>}
 */
export class SkillMappingAdapter extends BaseAdapter {
    constructor() {
        super("SkillMapping");
        this.baseUrl = "https://skill.kmitl.ac.th/api";
    }

    async fetchRaw(occName) {
        const url = `${this.baseUrl}/occupations/search?name=${encodeURIComponent(occName)}`;
        return this._request(url);
    }

    validate(payload) {
        if (!payload || !Array.isArray(payload.data)) {
            throw new Error("Invalid SkillMapping payload structure");
        }
        return payload.data;
    }

    async normalize(data) {
        return data.map(item => ({
            occupationCode: item.id || "unknown",
            occupationName: item.name_en || item.name_th,
            source: "Thailand Skill Mapping API",
            skills: (item.skills || []).map(s => ({
                name: s.name,
                demandLevel: s.demand_score || 0
            }))
        }));
    }
}
