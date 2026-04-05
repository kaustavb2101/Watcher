export class GlobalState {
    constructor() {
        this.listeners = [];
        this.state = {
            activeProvince: null,
            activeRegion: null,
            filters: {
                occupation: 'All',
                industry: 'All',
                timePeriod: '2026'
            },
            analysisResults: null,
            gistdaImpact: null,
            activeBranchStrategy: null,
            activeOccupations: [],
            activeForecast: null,
            activeInsights: [],
            isAnalysisLoading: false,
            error: null
        };
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(l => l(this.state));
    }
}

export const Store = new GlobalState();
