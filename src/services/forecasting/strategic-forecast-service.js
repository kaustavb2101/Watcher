export class StrategicForecastService {
    static generate(laborData, horizonMonths = 12) {
        if (!laborData || laborData.unemploymentRate === null) {
            return { status: 'unavailable', reason: 'Insufficient historical data for forecasting.' };
        }

        const trend = laborData.unemploymentYoY || 0;
        const confidence = Math.abs(trend) < 0.1 ? 0.9 : 0.7; // Lower confidence for high volatility
        
        return {
            scope: 'National Labor Market',
            metric: 'Unemployment Rate',
            horizon: `${horizonMonths} months`,
            method: 'Trend Continuation (Exponential Smoothing)',
            projectedValue: (laborData.unemploymentRate + (trend * (horizonMonths / 12))).toFixed(2),
            confidence,
            implication: trend < 0 ? 'Positive outlook; expect tightening labor supply.' : 'Defensive outlook; potential for increased credit risk.',
            assumptions: 'Assumes continuity in macroeconomic conditions and no structural shocks.'
        };
    }
}
