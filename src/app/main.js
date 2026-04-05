import { Layout } from './ui/layout.js';
import { Store } from './state/filters.js';
import { ExecutiveDashboard } from './pages/executive-dashboard.js';
import { RegionalAnalysisPage } from './pages/regional-analysis.js';
import { BranchIntelligencePage } from './pages/branch-intelligence.js';
import { RegionalAnalysisService } from '../services/analytics/regionalAnalysisService.js';
import { OccupationAnalysisService } from '../services/analytics/occupationAnalysisService.js';
import { InsightEngineService } from '../services/insights/insightEngineService.js';
import { RecommendationEngine } from '../services/analytics/recommendationEngine.js';
import { StrategicForecastService } from '../services/forecasting/strategicForecastService.js';
import { GistdaAdapter } from '../services/adapters/gistdaAdapter.js';

class IntelligenceSuite {
    constructor() {
        this.regional = new RegionalAnalysisService();
        this.occupation = new OccupationAnalysisService();
        this.gistda = new GistdaAdapter();
    }

    async init() {
        Store.initFromURL();
        document.body.innerHTML = Layout.render();
        
        Store.subscribe((state) => this.render(state));
        
        window.addEventListener('hashchange', () => this.handleNavigation());
        await this.refreshAllData();
    }

    async refreshAllData() {
        Store.setState({ ui: { ...Store.state.ui, isLoading: true } });
        const { province } = Store.state.filters;

        try {
            const results = await Promise.allSettled([
                this.regional.analyzeProvince(province),
                this.occupation.getProvinceOccupations(province),
                this.gistda.fetchRaw({ layer: 'ndvi', province }).then(r => this.gistda.normalize(r))
            ]);

            const reg = results[0].status === 'fulfilled' ? results[0].value : { province, economicScore: 'N/A', gpp: 0, status: 'error' };
            const occ = results[1].status === 'fulfilled' ? results[1].value : [];
            const gist = results[2].status === 'fulfilled' ? results[2].value : null;

            const insights = InsightEngineService.generateInsights({ 
                regionalData: reg, 
                gistdaImpact: gist, 
                activeProvince: province 
            });

            const recs = RecommendationEngine.getStrategicRecommendations(reg, occ);
            const forecast = StrategicForecastService.generateOutlook(reg.stats);

            Store.setState({
                data: {
                    regional: reg,
                    occupations: occ,
                    gistda: gist,
                    insights,
                    recommendations: recs,
                    forecast
                },
                ui: { ...Store.state.ui, isLoading: false, error: null }
            });
        } catch (err) {
            console.error("[IntelligenceSuite] Critical Refresh Error:", err);
            Store.setState({ ui: { ...Store.state.ui, isLoading: false, error: "Backbone Synchronization Failed" } });
        }
    }

    handleNavigation() {
        const hash = window.location.hash || '#executive';
        Store.setState({ ui: { ...Store.state.ui, activeTab: hash.slice(1) } });
    }

    render(state) {
        const container = document.getElementById('app-content');
        if (!container) return;
        
        if (state.ui.isLoading) {
            container.innerHTML = '<div class="glass-morph p-12 text-center text-blue-400 animate-pulse">Synchronizing Data Backbone...</div>';
            return;
        }

        if (state.ui.error) {
            container.innerHTML = `<div class="p-8 border border-rose-500/50 bg-rose-500/10 text-rose-400 rounded-xl">Connection Error: ${state.ui.error}</div>`;
            return;
        }

        let pageHTML = '';
        switch(state.ui.activeTab) {
            case 'regional': pageHTML = RegionalAnalysisPage.render(state); break;
            case 'branches': pageHTML = BranchIntelligencePage.render(state); break;
            default: pageHTML = ExecutiveDashboard.render(state);
        }

        container.innerHTML = pageHTML;
        
        // Re-init map if on executive and container exists
        if (state.ui.activeTab === 'executive' || !state.ui.activeTab) {
            const mapCont = document.getElementById('main-map');
            if (mapCont && mapCont.childElementCount === 0) {
                this.initMap();
            }
        }
    }

    async initMap() {
        const res = await fetch('/thailand.json?v=1.1.2');
        const geoJSON = await res.json();
        
        const chart = echarts.init(document.getElementById('main-map'));
        echarts.registerMap('thailand', geoJSON);
        
        chart.setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'item', backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#fff' } },
            series: [{
                name: 'Thailand',
                type: 'map',
                map: 'thailand',
                roam: true,
                emphasis: { label: { show: false }, itemStyle: { areaColor: '#3b82f6' } },
                itemStyle: { areaColor: '#0f172a', borderColor: '#334155', borderWidth: 1 }
            }]
        });

        chart.on('click', (params) => {
            Store.setFilter('province', params.name);
            this.refreshAllData();
        });
    }
}

const suit = new IntelligenceSuite();
suit.init();
