import { BaseAdapter } from './base-adapter.js';
import { CONFIG } from '../../app/config/config.js';

export class FirmsAdapter extends BaseAdapter {
    constructor() {
        super("NASA_FIRMS");
        this.baseUrl = "https://firms.modaps.eosdis.nasa.gov/api/country/csv";
    }

    async fetchRaw({ countryCode, area }) {
        // Note: FIRMS often returns CSV, so we use a text-compatible fetch in _request if needed
        const url = `${this.baseUrl}/${CONFIG.FIRMS_KEY}/VIIRS_SNPP_NRT/${countryCode}/1`;
        const res = await fetch(url);
        return res.text(); // Explicitly override for CSV
    }

    validate(csv) {
        if (!csv) return [];
        const lines = csv.split('\n');
        return lines.slice(1);
    }

    async normalize(lines) {
        return lines.map(line => {
            const [country, lat, lon, brightness, scan, track, acq_date, acq_time, satellite, confidence, version, bright_t31, frp, daynight] = line.split(',');
            return {
                lat: parseFloat(lat),
                lng: parseFloat(lon),
                intensity: parseFloat(frp || 0),
                source: "NASA FIRMS (VIIRS)",
                timestamp: acq_date
            };
        }).filter(h => !isNaN(h.lat));
    }
}
