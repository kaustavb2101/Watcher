export const RegionRankings = {
    render: (provinces, regionName) => {
        const aggregated = provinces.filter(p => p.region === regionName);
        if (aggregated.length === 0) return '<div class="text-slate-500 italic text-xs">No regional data for current selection.</div>';

        return `
            <div class="space-y-6">
                <div class="flex justify-between items-end">
                    <h3 class="text-sm font-bold text-white uppercase tracking-widest">Regional Growth Benchmarks: ${regionName}</h3>
                    <span class="text-[10px] text-slate-500">Source: NSO Aggr.</span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${aggregated.slice(0, 4).map(p => `
                        <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                            <div>
                                <div class="text-xs font-bold text-white">${p.province}</div>
                                <div class="text-[9px] text-slate-500 uppercase">Opportunity Score</div>
                            </div>
                            <div class="text-lg font-bold text-blue-400 tabular-nums">${p.opportunityScore?.toFixed(1) || '0.0'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};
