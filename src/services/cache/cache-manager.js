export class CacheManager {
    constructor() {
        this.ttl = 24 * 60 * 60 * 1000; // Default 24h
    }

    get(key) {
        const cached = localStorage.getItem(`tmli_cache_${key}`);
        if (!cached) return null;
        
        try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp > this.ttl) {
                console.log(`[Cache] Stale: ${key}`);
                return { data, isStale: true };
            }
            return { data, isStale: false };
        } catch (e) {
            return null;
        }
    }

    set(key, data) {
        const entry = { data, timestamp: Date.now() };
        localStorage.setItem(`tmli_cache_${key}`, JSON.stringify(entry));
    }

    clear() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('tmli_cache_')) localStorage.removeItem(key);
        });
    }
}

export const TMLICache = new CacheManager();
