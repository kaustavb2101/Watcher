export const BranchIntelligencePage = {
    render: (state) => `
        <div class="space-y-8 animate-in slide-in-from-bottom duration-500">
            <h2 class="text-2xl font-bold">Branch & Catchment Intelligence</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- PDF Extracted Branch List -->
                <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <h3 class="text-white font-bold mb-4">Auto X Network Strength</h3>
                    <div class="space-y-3">
                         <div class="p-3 bg-slate-800/50 rounded-lg">
                            <span class="text-[10px] text-slate-500 uppercase">National Scaling</span>
                            <div class="text-xl font-bold">1,001 Branches</div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    `
};
