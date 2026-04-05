import { BaseAdapter } from './base-adapter.js';

export class WorldPopAdapter extends BaseAdapter {
    constructor() {
        super("WorldPop");
        this.baseUrl = "https://www.worldpop.org/rest/data";
    }

    async fetchRaw({ iso3, year }) {
        const url = `${this.baseUrl}/pop/wpgp?iso3=${iso3}&year=${year}`;
        return this._request(url);
    }

    validate(payload) {
        if (!payload || !payload.data) throw new Error("WorldPop Response Missing Data");
        return payload.data;
    }

    async normalize(data) {
        return {
            totalPopulation: data.total || 0,
            density: data.density_map_url,
            source: "WorldPop Project / University of Southampton",
            year: data.year
        };
    }
}
