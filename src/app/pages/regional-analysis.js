import { RegionRankings } from '../../features/regions/components/region-rankings.js';

export const RegionalAnalysisPage = {
    render: (state) => `
        <div class="space-y-8 animate-in slide-in-from-bottom duration-500">
            <h2 class="text-2xl font-bold">Regional Performance Benchmarks</h2>
            <div id="rankings-container">
                ${RegionRankings.render(state.data.regional ? [state.data.regional] : [], state.filters.region)}
            </div>
        </div>
    `
};
