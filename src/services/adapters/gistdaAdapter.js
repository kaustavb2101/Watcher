import { BaseAdapter } from './base-adapter.js';
import { CONFIG } from '../../app/config/config.js';

export class GistdaAdapter extends BaseAdapter {
    constructor() {
        super("GISTDA");
        this.baseUrl = "https://api-gateway.gistda.or.th/api/2.0";
    }

    async fetchRaw({ layer, province }) {
        const url = `${this.baseUrl}/resources/gi-service/v2.2/${layer}?api_key=${CONFIG.GISTDA_KEY}&province=${encodeURIComponent(province)}`;
        return this._request(url);
    }

    validate(payload) {
        if (!payload || !payload.data) throw new Error("GISTDA Payload Invalid");
        return payload.data;
    }

    async normalize(data) {
        if (!data || !Array.isArray(data)) return null;
        return {
            indexValue: parseFloat(data[0]?.value || 0),
            unit: "%",
            source: "GISTDA Sphere / Sentinel-2",
            timestamp: data[0]?.date || new Date().toISOString()
        };
    }
}
