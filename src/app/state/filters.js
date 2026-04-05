/**
 * TMLI Reactive Store & Filter Framework
 */

export const Store = {
    state: {
        filters: {
            province: 'Bangkok Metropolis',
            region: 'Central',
            occupationGroup: 'All',
            timePeriod: '2024-Q1'
        },
        data: {
            regional: null,
            occupations: [],
            branches: [],
            gistda: null,
            forecast: null,
            insights: [],
            recommendations: []
        },
        ui: {
            isLoading: false,
            error: null,
            activeTab: 'executive'
        }
    },
    
    listeners: [],

    subscribe(fn) {
        this.listeners.push(fn);
    },

    notify() {
        this.listeners.forEach(fn => fn(this.state));
    },

    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.notify();
        this.syncURL();
    },

    setFilter(key, value) {
        this.state.filters[key] = value;
        this.notify();
        this.syncURL();
    },

    syncURL() {
        const params = new URLSearchParams(this.state.filters);
        window.history.replaceState(null, '', `?${params.toString()}${window.location.hash}`);
    },

    initFromURL() {
        const params = new URLSearchParams(window.location.search);
        params.forEach((v, k) => {
            if (this.state.filters[k] !== undefined) this.state.filters[k] = v;
        });
    }
};
