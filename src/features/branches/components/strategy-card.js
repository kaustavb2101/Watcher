export const BranchStrategyCard = {
    render: (recommendation) => `
        <div class="bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
             <div class="flex justify-between items-center mb-6">
                <h3 class="text-white font-bold flex items-center">
                    <span class="w-2 h-6 bg-violet-500 rounded-full mr-3"></span>
                    Branch Posture
                </h3>
            </div>
            
            <div class="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50 mb-4">
                <span class="text-[10px] text-slate-500 uppercase block mb-1">Strategic Logic</span>
                <h4 class="text-white font-bold mb-2">${recommendation.title}</h4>
                <p class="text-slate-400 text-xs leading-normal">${recommendation.commercialImplication}</p>
            </div>
            
            <div class="flex flex-wrap gap-2">
                ${recommendation.inputsUsed?.map(input => `
                    <span class="text-[9px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md border border-slate-700">${input}</span>
                `).join('')}
            </div>
        </div>
    `
};
