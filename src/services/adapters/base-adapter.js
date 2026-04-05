/** @typedef {"healthy" | "degraded" | "unavailable"} SourceHealth */

/**
 * @template TInput, TNormalized
 */
export class BaseAdapter {
    constructor(sourceName) {
        this.sourceName = sourceName;
        this.status = "healthy";
        this.lastUpdateTime = null;
    }

    /**
     * @param {any} [params]
     * @returns {Promise<unknown>}
     */
    async fetchRaw(params) {
        // Implement in subclass
        throw new Error("fetchRaw not implemented");
    }

    /**
     * @param {unknown} payload
     * @returns {any}
     */
    validate(payload) {
        // Implement in subclass
        return payload;
    }

    /**
     * @param {any} payload
     * @returns {Promise<any>}
     */
    async normalize(payload) {
        // Implement in subclass
        return payload;
    }

    /**
     * @returns {Promise<SourceHealth>}
     */
    async getHealthStatus() {
        return this.status;
    }

    /**
     * @param {unknown} [payload]
     * @returns {string | null}
     */
    getLastUpdated(payload) {
        return this.lastUpdateTime;
    }

    /**
     * Internal fetch helper with timeout and retries
     */
    async _request(url, options = {}, retries = 3) {
        const timeout = 15000;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(id);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            this.status = "healthy";
            this.lastUpdateTime = new Date().toISOString();
            return await response.json();
        } catch (err) {
            clearTimeout(id);
            if (retries > 0) {
                console.warn(`[Adapter:${this.sourceName}] Retrying... (${retries})`);
                await new Promise(r => setTimeout(r, 1000 * (4 - retries)));
                return this._request(url, options, retries - 1);
            }
            this.status = err.name === 'AbortError' ? 'degraded' : 'unavailable';
            console.error(`[Adapter:${this.sourceName}] Final failure:`, err.message);
            throw err;
        }
    }
}
