import { CONFIG } from '../../config/config.js';

export class MapService {
    static async loadGeoJSON() {
        const res = await fetch('/thailand.json?v=1.1.2');
        return res.json();
    }

    static joinDataToGeo(geoJSON, laborData) {
        // Ensure canonical province name joins
        const joinedData = geoJSON.features.map(feature => {
            const provinceName = feature.properties.name;
            const stats = laborData.find(d => d.province === provinceName) || {};
            return {
                name: provinceName,
                value: stats.opportunityScore || 0,
                ...stats
            };
        });
        return joinedData;
    }

    static getColorScale(values) {
        // Deterministic scale implementation
        const max = Math.max(...values, 1);
        const min = Math.min(...values, 0);
        return { min, max };
    }
}
