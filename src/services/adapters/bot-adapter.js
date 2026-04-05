import { BaseAdapter } from './base-adapter.js';

export class BOTAdapter extends BaseAdapter {
    constructor() {
        super('BOT');
        // Using BOT public data staging or World Bank fallback for macro when BOT API is gated
        this.baseUrl = 'https://api.worldbank.org/v2/country/TH/indicator';
    }

    async getMacroStats() {
        // Unemployment Rate
        const unempRaw = await this.fetchRaw(`${this.baseUrl}/SL.UEM.TOTL.ZS?format=json&mrv=3`);
        // GDP Growth
        const gdpRaw = await this.fetchRaw(`${this.baseUrl}/NY.GDP.MKTP.KD.ZG?format=json&mrv=3`);
        
        return this.normalize({ unempRaw, gdpRaw });
    }

    normalize({ unempRaw, gdpRaw }) {
        const unemp = unempRaw[1]?.find(e => e.value !== null) || {};
        const gdp = gdpRaw[1]?.find(e => e.value !== null) || {};
        
        return {
            unemploymentRate: parseFloat((unemp.value || 0).toFixed(2)),
            gdpGrowth: parseFloat((gdp.value || 0).toFixed(2)),
            period: unemp.date || '2025'
        };
    }
}
