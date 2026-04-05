export class DataNormalizer {
    static normalizeProvince(raw) {
        return {
            name: raw.name || raw.province || 'Unknown',
            region: raw.region || 'Central',
            branches: parseInt(raw.branches || 0, 10),
            occupations: Array.isArray(raw.professions) ? raw.professions.map(p => ({
                name: p.name,
                population: parseInt(p.population || 0, 10)
            })) : [],
            lastUpdated: new Date().toISOString()
        };
    }

    static normalizeLaborStats(raw) {
        return {
            laborForce: raw.laborForceTotal || 'N/A',
            unemploymentRate: parseFloat(raw.unemploymentRate || 0),
            gdpGrowth: parseFloat(raw.gdpGrowth || 0),
            source: raw.sources?.[0]?.name || 'Official Sources',
            timestamp: raw.dataTimestamp || new Date().toISOString()
        };
    }

    static validate(data, schema) {
        // Simple schema validation implementation
        for (const key in schema) {
            if (schema[key].required && (data[key] === undefined || data[key] === null)) {
                throw new Error(`Validation Error: Missing required field ${key}`);
            }
        }
        return true;
    }
}
