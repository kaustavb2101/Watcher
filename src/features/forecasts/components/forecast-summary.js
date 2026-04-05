export const ForecastSummary = {
    render: (forecast) => {
        if (!forecast) return '<div>Calculating Outlook...</div>';
        
        return `
        <div class="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
            <h3 class="text-white font-bold mb-4 flex items-center">
                <span class="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                Strategic Outlook
            </h3>
            
            <div class="text-3xl font-bold ${forecast.trend === 'Growth' ? 'text-emerald-400' : 'text-rose-400'} mb-1">
                ${forecast.trend}
            </div>
            <div class="text-slate-500 text-xs mb-6">Horizon: ${forecast.horizon} · Conf: ${(forecast.confidence * 100).toFixed(0)}%</div>
            
            <div class="space-y-4">
                <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-800/50">
                    <span class="text-[10px] text-slate-500 uppercase block mb-1">Methodology</span>
                    <span class="text-white text-xs font-medium">${forecast.method}</span>
                </div>
                
                <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-800/50">
                    <span class="text-[10px] text-slate-500 uppercase block mb-1">Assumption</span>
                    <span class="text-slate-400 text-xs leading-relaxed italic">"${forecast.assumptions}"</span>
                </div>
            </div>
        </div>
        `;
    }
};
