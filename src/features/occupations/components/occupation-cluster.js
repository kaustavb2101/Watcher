export const OccupationCluster = {
    /**
     * @param {any[]} occupations
     */
    render: (occupations) => `
        <div class="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
            <h3 class="text-white font-bold mb-6 flex items-center">
                <span class="w-2 h-6 bg-amber-500 rounded-full mr-3"></span>
                Top Occupation Skills
            </h3>
            
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-800">
                            <th class="pb-3 font-medium">Occupation</th>
                            <th class="pb-3 font-medium text-right">Vacancy Index</th>
                            <th class="pb-3 font-medium pl-4">Core Skills</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-300">
                        ${occupations.map(o => `
                            <tr class="border-b border-slate-800/50 hover:bg-slate-800/30">
                                <td class="py-4 font-medium text-white">${o.occupationName}</td>
                                <td class="py-4 text-right">${o.value}</td>
                                <td class="py-4 pl-4">
                                    <div class="flex flex-wrap gap-1">
                                        ${o.skills?.slice(0, 3).map(s => `
                                            <span class="px-1.5 py-0.5 bg-slate-800 rounded text-[9px]">${s.name}</span>
                                        `).join('')}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `
};
