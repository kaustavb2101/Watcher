export const GistdaPanel = {
    render: (gistda) => {
        if (!gistda) return '<div class="text-slate-500">Retrieving Satellite Telemetry...</div>';
        
        return `
        <div class="bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-white font-bold flex items-center">
                    <span class="w-2 h-6 bg-emerald-500 rounded-full mr-3"></span>
                    GISTDA Analysis
                </h3>
                <span class="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">Live Source</span>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                    <span class="text-[10px] text-slate-500 uppercase">NDVI Index</span>
                    <div class="text-2xl font-bold text-white">${gistda.indexValue.toFixed(2)}</div>
                </div>
                <div class="space-y-1 text-right">
                    <span class="text-[10px] text-slate-500 uppercase">Impact Class</span>
                    <div class="text-xs font-bold text-emerald-400">OPTIMAL</div>
                </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
                <span class="text-[10px] text-slate-500 tracking-wide uppercase font-medium">Last Sample: ${new Date(gistda.timestamp).toLocaleDateString()}</span>
                <span class="text-[10px] text-slate-600">Sentinel-2 Telemetry</span>
            </div>
        </div>
        `;
    }
};
