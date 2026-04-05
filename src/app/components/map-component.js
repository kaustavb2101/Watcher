export const MapComponent = {
    render: () => `
        <div id="main-map" class="w-full h-[600px] bg-slate-900/50 rounded-2xl border border-slate-800 relative group overflow-hidden">
            <div id="map-container" class="w-full h-full"></div>
            <div id="map-legend" class="absolute bottom-6 left-6 bg-slate-900/90 border border-slate-800 p-4 rounded-xl backdrop-blur-md z-10 hidden group-hover:block transition-all">
                <h4 class="text-xs font-bold text-white mb-2 uppercase tracking-tighter">Opportunity Score</h4>
                <div class="flex items-center space-x-2">
                    <div class="h-3 w-3 bg-[#E5E7EB] rounded-sm"></div><span class="text-[10px] text-slate-400">Low</span>
                    <div class="h-1 w-12 bg-gradient-to-r from-[#E5E7EB] via-[#B8943A] to-[#1B3F7A] rounded-full"></div>
                    <span class="text-[10px] text-slate-400">High</span>
                </div>
            </div>
            <div class="absolute top-6 right-6 space-y-2 z-10">
                <button id="toggle-gistda" class="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:border-slate-500 transition-all flex items-center">
                    <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> GISTDA Impacts
                </button>
            </div>
        </div>
    `,

    init: (containerId, data, onProvinceSelect) => {
        const chart = echarts.init(document.getElementById(containerId));
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                formatter: params => {
                    const val = params.value || 0;
                    return `<div class="p-2">
                        <div class="font-bold text-white">${params.name}</div>
                        <div class="text-slate-400 text-xs mt-1">Opportunity Score: <span class="text-blue-400">${val.toFixed(1)}</span></div>
                    </div>`;
                },
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: '#1e293b',
                textStyle: { color: '#cbd5e1' }
            },
            visualMap: {
                min: 0,
                max: 10,
                show: false,
                inRange: {
                    color: ['#E5E7EB', '#B8943A', '#1B3F7A']
                }
            },
            series: [{
                name: 'Thailand Labor Intelligence',
                type: 'map',
                map: 'thailand',
                roam: true,
                emphasis: {
                    label: { show: true, color: '#fff' },
                    itemStyle: { areaColor: '#334155' }
                },
                itemStyle: {
                    areaColor: '#1e293b',
                    borderColor: '#334155',
                    borderWidth: 0.5
                },
                data: data
            }]
        };

        chart.setOption(option);
        chart.on('click', params => onProvinceSelect(params.name));
        return chart;
    }
};
