import { BaseAdapter } from './base-adapter.js';

export class BOTMacroAdapter extends BaseAdapter {
    constructor() {
        super("BOT");
        this.baseUrl = "https://api.worldbank.org/v2/country/TH/indicator"; // BOT Open API fallback to WorldBank for macro stability
    }

    async fetchRaw(indicatorCode) {
        const url = `${this.baseUrl}/${indicatorCode}?format=json&mrv=5`;
        return this._request(url);
    }

    validate(payload) {
        if (!payload || !payload[1]) throw new Error("BOT/WB Macro Data Missing");
        return payload[1];
    }

    async normalize(data) {
        return data.map(item => ({
            period: item.date,
            value: item.value,
            indicator: item.indicator?.value,
            source: "Bank of Thailand / World Bank Macro"
        })).filter(i => i.value !== null);
    }
}
