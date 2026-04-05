import { BaseAdapter } from './base-adapter.js';
import { CONFIG } from '../../app/config/config.js';

export class NSOAdapter extends BaseAdapter {
    constructor() {
        super('NSO');
        this.baseUrl = 'https://nso-api.gdcatalog.go.th/service';
    }

    async getProvinceStats(provinceName) {
        const url = `${this.baseUrl}/business/business?page=1&limit=10&filter_key=province&filter_value=${encodeURIComponent(provinceName)}`;
        const raw = await this.fetchRaw(url, {
            headers: { 'Authorization': `Bearer ${CONFIG.NSO_TOKEN}` }
        });
        return this.normalize(raw);
    }

    normalize(raw) {
        const results = raw.results || raw.data || [];
        return results.map(r => ({
            province: r.province || r.name,
            indicator: r.indicator_name || 'Business Count',
            value: parseFloat(r.value || 0),
            unit: r.unit || 'units'
        }));
    }
}
