import { BaseAdapter } from './base-adapter.js';
import { CONFIG } from '../../app/config/config.js';

export class GistdaAdapter extends BaseAdapter {
    constructor() {
        super('GISTDA');
        this.baseUrl = 'https://api-gateway.gistda.or.th/api/2.0/resources/gi-service/v2.2';
    }

    async getCropStats(provinceName, cropType = 'rice') {
        const endpoints = {
            'rice': 'agriculture/rice-weekly-40m',
            'rubber': 'agriculture/rubber-yearly-40m',
            'palm': 'agriculture/palm-yearly-40m',
            'sugarcane': 'agriculture/sugarcane-weekly-40m'
        };
        const endpoint = endpoints[cropType] || endpoints.rice;
        // In production, we'd look up Lat/Lon for the province centroid
        const url = `${this.baseUrl}/${endpoint}?api_key=${CONFIG.GISTDA_KEY}&province=${encodeURIComponent(provinceName)}`;
        const raw = await this.fetchRaw(url);
        return this.normalize(raw);
    }

    normalize(raw) {
        if (!raw || !raw.data) return null;
        return {
            index: parseFloat(raw.data[0]?.value || 0),
            unit: raw.unit || '%',
            timestamp: raw.data[0]?.date || new Date().toISOString()
        };
    }
}
