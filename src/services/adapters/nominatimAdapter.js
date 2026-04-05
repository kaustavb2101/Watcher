import { BaseAdapter } from './base-adapter.js';

export class NominatimAdapter extends BaseAdapter {
    constructor() {
        super("Nominatim");
        this.baseUrl = "https://nominatim.openstreetmap.org";
    }

    async fetchRaw(q) {
        const url = `${this.baseUrl}/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=th`;
        return this._request(url, { headers: { 'User-Agent': 'TMLI-Intelligence-Suite-Prod' } });
    }

    validate(payload) {
        return Array.isArray(payload) ? payload[0] : null;
    }

    async normalize(match) {
        if (!match) return { precision: "unknown", source: "OSM/Nominatim" };
        return {
            lat: parseFloat(match.lat),
            lng: parseFloat(match.lon),
            precision: match.class === 'place' ? 'province' : 'exact',
            source: "OpenStreetMap (OSM)",
            display_name: match.display_name
        };
    }
}
