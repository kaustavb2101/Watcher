import { BaseAdapter } from './base-adapter.js';

export class WorldBankAdapter extends BaseAdapter {
    constructor() {
        super("WorldBank");
        this.baseUrl = "https://api.worldbank.org/v2/country/TH/indicator";
    }

    async fetchRaw(indicatorCode) {
        const url = `${this.baseUrl}/${indicatorCode}?format=json&mrv=5`;
        return this._request(url);
    }

    validate(payload) {
        return payload[1] || [];
    }

    async normalize(data) {
        return data.map(item => ({
            year: item.date,
            value: item.value,
            indicator: item.indicator.value,
            source: "World Bank Open Data API"
        })).filter(v => v.value !== null);
    }
}
