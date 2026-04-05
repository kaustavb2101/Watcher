export const RecommendationComponent = {
    render: (recommendations) => `
        <div class="space-y-4">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-2">Stratetic Recommendations — Ngern Chaiyo</h3>
            ${recommendations.map(req => `
                <div class="bg-slate-900 border-l-4 border-blue-500 p-4 rounded-r-xl shadow-lg">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-sm font-bold text-white">${req.title}</span>
                        <span class="text-xs font-mono text-blue-400">${(req.score * 100).toFixed(0)}% Confidence</span>
                    </div>
                    <p class="text-xs text-slate-400 leading-relaxed mb-3">${req.rationale}</p>
                    <div class="bg-blue-900/20 border border-blue-800/50 p-2 rounded text-[10px] text-blue-300">
                        <span class="font-bold">STRATEGY:</span> ${req.implication}
                    </div>
                </div>
            `).join('')}
            ${recommendations.length === 0 ? '<div class="text-xs text-slate-500 italic">No specific recommendations for current filters.</div>' : ''}
        </div>
    `
};
