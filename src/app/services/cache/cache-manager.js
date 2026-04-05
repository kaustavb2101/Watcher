export class CacheManager {
    constructor(ttl = 3600000) { // Default 1 hour
        this.ttl = ttl;
    }

    set(key, data) {
        const payload = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(`tmli_cache_${key}`, JSON.stringify(payload));
    }

    get(key) {
        const raw = localStorage.getItem(`tmli_cache_${key}`);
        if (!raw) return null;
        
        try {
            const payload = JSON.parse(raw);
            const age = Date.now() - payload.timestamp;
            
            return {
                data: payload.data,
                isStale: age > this.ttl,
                timestamp: payload.timestamp
            };
        } catch (e) {
            return null;
        }
    }

    clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith('tmli_cache_'))
            .forEach(key => localStorage.removeItem(key));
    }
}
