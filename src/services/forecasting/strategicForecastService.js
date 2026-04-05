export class StrategicForecastService {
    /**
     * @param {any[]} timeSeries - Historical metrics from BOT/NSO 
     * @returns {Object}
     */
    static generateOutlook(timeSeries) {
        if (!timeSeries || timeSeries.length < 3) {
            return { outlook: "Stable", confidence: 0.5, method: "Insufficient Data fallback" };
        }

        const values = timeSeries.map(i => i.value);
        const last = values[values.length - 1];
        const prev = values[values.length - 2];
        
        const trend = ((last - prev) / prev) * 100;
        
        return {
            projection: (last * (1 + (trend / 100))).toFixed(2),
            trend: trend > 0 ? "Growth" : "Contraction",
            method: "Trend Continuation (Linear)",
            assumptions: "Past quarterly velocity remains constant",
            horizon: "12 Months",
            confidence: Math.min(0.6 + (timeSeries.length * 0.05), 0.95)
        };
    }
}
