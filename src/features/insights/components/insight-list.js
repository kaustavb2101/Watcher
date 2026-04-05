export const InsightList = {
    /**
     * @param {import('../../../types/domain.js').Insight[]} insights
     */
    render: (insights) => `
        <div class="space-y-4">
            ${insights.length === 0 ? '<div class="text-slate-500 italic">No anomalies detected in current scope.</div>' : ''}
            ${insights.map(i => `
                <div class="p-4 bg-slate-900/50 rounded-xl border-l-4 border-blue-500/50 hover:bg-slate-900 transition-colors cursor-default">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-[10px] text-blue-400 font-bold uppercase tracking-widest">${i.category}</span>
                        <span class="text-[10px] text-slate-500">${(i.confidence * 100).toFixed(0)}% Conf.</span>
                    </div>
                    <h4 class="text-white font-bold text-sm mb-1">${i.title}</h4>
                    <p class="text-slate-400 text-xs leading-relaxed">${i.explanation}</p>
                    <div class="mt-2 text-[10px] text-slate-600 italic">Source: ${i.supportingMetrics[0]?.source}</div>
                </div>
            `).join('')}
        </div>
    `
};
