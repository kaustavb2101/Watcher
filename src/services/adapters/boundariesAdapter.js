import { BaseAdapter } from './base-adapter.js';

export class BoundariesAdapter extends BaseAdapter {
    constructor() {
        super("Boundaries");
    }

    async fetchRaw() {
        // Fetch canonical GeoJSON (Thailand Province boundaries)
        const res = await fetch('/thailand.json?v=1.1.2');
        return res.json();
    }

    validate(payload) {
        if (!payload || payload.type !== 'FeatureCollection') {
            throw new Error("Invalid GeoJSON for Administrative Boundaries");
        }
        return payload;
    }

    async normalize(geojson) {
        return {
            geometry: geojson,
            source: "HDX / GADM Thailand Boundaries",
            timestamp: "2024-Q1 Stable"
        };
    }
}
