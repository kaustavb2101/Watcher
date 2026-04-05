import { NSOClient } from './nso-client.js';
import { GISTDAClient } from './gistda-client.js';
import { DataNormalizer } from '../data/normalizer.js';
import { CacheManager } from '../cache/cache-manager.js';

export class DataService {
    constructor() {
        this.nso = new NSOClient();
        this.gistda = new GISTDAClient();
        this.cache = new CacheManager();
    }

    async getNationalSnapshot() {
        const cacheKey = 'national_snapshot';
        const cached = this.cache.get(cacheKey);
        if (cached && !cached.isStale) return cached.data;

        // Fetch from api/data-enrichment.js (consolidated official source adapter)
        const res = await fetch('/api/data-enrichment', { method: 'POST' });
        const raw = await res.json();
        const normalized = DataNormalizer.normalizeLaborStats(raw);
        
        this.cache.set(cacheKey, normalized);
        return normalized;
    }

    async getProvinceDetails(provinceName) {
        // Implementation for drill-down integration
        return {};
    }
}
