import { BaseAdapter } from './base-adapter.js';

export class NESDCAdapter extends BaseAdapter {
    constructor() {
        super("NESDC");
        this.baseUrl = "https://nso-api.gdcatalog.go.th/service"; // Often proxied via NSO portal
    }

    async fetchRaw({ province }) {
        const url = `${this.baseUrl}/economic/gpp?province=${encodeURIComponent(province)}`;
        return this._request(url).catch(() => ({ data: null }));
    }

    validate(payload) {
        return payload?.data || null;
    }

    async normalize(data) {
        if (!data) return { gppPerCapita: 0, source: "NESDC (Manual Refresh Required)" };
        return {
            gppPerCapita: data.gpp_pc || 0,
            growth: data.growth_rate || 0,
            primaryIndustry: data.top_sector || "Unknown",
            source: "NESDC Thailand"
        };
    }
}
