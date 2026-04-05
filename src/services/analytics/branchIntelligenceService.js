import { NominatimAdapter } from '../adapters/nominatimAdapter.js';
import { WorldPopAdapter } from '../adapters/worldPopAdapter.js';

export class BranchIntelligenceService {
    constructor() {
        this.geo = new NominatimAdapter();
        this.pop = new WorldPopAdapter();
    }

    async analyzeBranch(branchRecord) {
        // Geocode if lat/lng missing
        let coords = { lat: branchRecord.lat, lng: branchRecord.lng };
        if (!coords.lat) {
            const match = await this.geo.fetchRaw(`${branchRecord.branchName}, ${branchRecord.provinceName}, Thailand`)
                .then(r => this.geo.normalize(r));
            coords = { lat: match.lat, lng: match.lng };
        }

        // Fetch catchment pop (WorldPop)
        const density = await this.pop.fetchRaw({ iso3: 'THA', year: 2020 })
            .then(r => this.pop.normalize(r));

        return {
            ...branchRecord,
            ...coords,
            catchmentPopulation: density.totalPopulation / 77, // Simple normalized province proxy
            status: coords.lat ? "validated" : "geocoding_fallback",
            source: "Auto X PDFs / OSM / WorldPop"
        };
    }
}
