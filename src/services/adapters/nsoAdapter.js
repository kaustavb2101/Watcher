import { BaseAdapter } from './base-adapter.js';

export class NSOAdapter extends BaseAdapter {
    constructor() {
        super("NSO");
        this.baseUrl = "https://nso-api.gdcatalog.go.th/service";
    }

    async fetchRaw({ province, metric }) {
        // Example CKAN action: datastore_search
        const url = `${this.baseUrl}/business/business?limit=10&filter_key=province&filter_value=${encodeURIComponent(province)}`;
        return this._request(url);
    }

    validate(payload) {
        if (!payload || !payload.results) {
            throw new Error("NSO Source Malformed");
        }
        return payload.results;
    }

    async normalize(results) {
        return results.map(r => ({
            provinceName: r.province || r.name,
            metricKey: "business_count",
            metricLabel: "Active Businesses",
            value: parseFloat(r.value || 0),
            unit: "entities",
            source: "National Statistical Office (NSO)",
            lastUpdated: new Date().toISOString()
        }));
    }
}
