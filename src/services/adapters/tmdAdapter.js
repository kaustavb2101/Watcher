import { BaseAdapter } from './base-adapter.js';

export class TMDAdapter extends BaseAdapter {
    constructor() {
        super("TMD");
        this.baseUrl = "https://data.tmd.go.th/api/v1";
    }

    async fetchRaw({ province }) {
        const url = `${this.baseUrl}/forecast/daily?province=${encodeURIComponent(province)}`;
        return this._request(url).catch(() => ({ data: [] }));
    }

    validate(payload) {
        return payload?.data || [];
    }

    async normalize(data) {
        return {
            rainChance: data[0]?.rain_percentage || 0,
            tempMax: data[0]?.temp_max || 0,
            riskLevel: (data[0]?.rain_percentage > 70) ? "High" : "Normal",
            source: "Thai Meteorological Department (TMD)"
        };
    }
}
