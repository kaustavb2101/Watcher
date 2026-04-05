import { StrategicForecastService } from '../../services/forecasting/strategic-forecast-service.js';
import { Store } from '../../app/lib/state.js';

export class ForecastFeature {
    static async generateProjectedOutlook() {
        const state = Store.state;
        const forecast = StrategicForecastService.generate(state.analysisResults || {});
        Store.setState({ activeForecast: forecast });
    }
}
