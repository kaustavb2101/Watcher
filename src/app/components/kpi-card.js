export const KPICard = {
    render: (title, value, delta, sentiment, source) => `
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-all shadow-lg group">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">${title}</h3>
                <span class="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded uppercase">${source}</span>
            </div>
            <div class="flex items-baseline space-x-2">
                <span class="text-2xl font-bold text-white tabular-nums">${value}</span>
                <span class="text-xs font-medium ${sentiment === 'Positive' ? 'text-emerald-400' : 'text-rose-400'}">
                    ${delta}
                </span>
            </div>
            <div class="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full ${sentiment === 'Positive' ? 'bg-emerald-500' : 'bg-rose-500'} opacity-30 w-full group-hover:opacity-60 transition-opacity"></div>
            </div>
        </div>
    `
};
