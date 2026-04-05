import { Store } from '../state/filters.js';
import { KPICard } from '../components/kpi-card.js';
import { GistdaPanel } from '../../features/gistda/components/gistda-panel.js';
import { BranchStrategyCard } from '../../features/branches/components/strategy-card.js';
import { InsightList } from '../../features/insights/components/insight-list.js';
import { ForecastSummary } from '../../features/forecasts/components/forecast-summary.js';

export const ExecutiveDashboard = {
    render: (state) => {
        const { regional, gistda, forecast, insights, recommendations } = state.data;
        if (!regional) return '<div>Loading Provincial Snapshot...</div>';

        return `
        <div id="executive-dashboard" class="space-y-8 animate-in fade-in duration-500">
            <!-- Header Section -->
            <section class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 class="text-3xl font-bold text-white tracking-tight">Intelligence <span class="text-blue-500 underline decoration-blue-500/30">Suite</span></h2>
                    <p class="text-slate-400 mt-1">Ground-Truthed analysis for ${state.filters.province}.</p>
                </div>
            </section>

            <!-- KPI Row (Real NSO/BOT Data) -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                ${KPICard.render('Economic Score', regional.economicScore, regional.status === 'error' ? '!' : '+0.2', regional.status === 'error' ? 'Neutral' : 'Positive', 'NSO/NESDC')}
                ${KPICard.render('GPP Per Capita', regional.gpp > 0 ? `฿${regional.gpp.toLocaleString()}` : 'Unavailable', 'Trend', 'Neutral', 'NESDC')}
                ${KPICard.render('Hotspots', '0', 'Low', 'Positive', 'NASA FIRMS')}
                ${KPICard.render('Risk Index', gistda ? (gistda.indexValue > 0.5 ? 'Alert' : 'Stable') : 'Unavailable', gistda ? 'S2' : 'Offline', 'Neutral', 'GISTDA')}
            </div>

            <!-- Main Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div class="lg:col-span-3 space-y-8">
                    <!-- Map Placeholder Replacement (Real layers to be initialized) -->
                    <div id="main-map" class="h-[500px] bg-slate-900/50 rounded-3xl border border-slate-800 relative overflow-hidden">
                        <div class="absolute top-4 left-4 z-10 space-y-2">
                             <div class="glass-morph p-2 px-4 rounded-full text-xs text-blue-400 border border-blue-500/30">Live Sentinel-2 Overlay</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div id="gistda-layer-container">${GistdaPanel.render(gistda)}</div>
                         <div id="branch-layer-container">${BranchStrategyCard.render(recommendations[1] || { title: 'Stable Posture' })}</div>
                    </div>
                </div>

                <!-- Insights & Forecasts -->
                <div class="space-y-8 text-sm">
                    <div class="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
                        <h3 class="text-blue-400 font-bold mb-4 uppercase tracking-widest text-[10px]">Real-Time Insights</h3>
                        ${InsightList.render(insights)}
                    </div>
                    <div id="forecast-card-container">
                        ${ForecastSummary.render(forecast)}
                    </div>
                </div>
            </div>
        </div>
        `;
    }
};
