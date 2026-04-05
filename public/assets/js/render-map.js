/**
 * TMLI Map Visualization Module
 * Handles ECharts initialization and provincial mapping.
 */

window.RM = {
  renderRegionalMap: function(d, metric = 'bsiDiverse', targetId = 'echartsMap', drillName = null) {
      const container = document.getElementById(targetId);
      if (!container) return;

      const chart = echarts.init(container, 'dark');
      const isBSI = metric === 'bsiDiverse';
      
      const mapName = drillName ? 'district-view' : 'thailand';
      const mapData = drillName ? (window.GEO_DISTRICTS?.[drillName] || []) : (window.S.bsiData?.pop || []);
      
      // Calculate data points for display
      const displayMapData = Object.entries(window.PROVINCE_PROFILES).map(([name, prof]) => {
          const bsi = window.BSI_STRATEGY ? window.BSI_STRATEGY[name] : null;
          let val = 0;
          if (metric === 'impactScore') val = d.regionalImpact?.find(r => r.province === name)?.impactScore || 0;
          else if (metric === 'workforce') val = prof.professions?.reduce((a, b) => a + b.population, 0) || 0;
          else if (metric === 'branches') val = prof.branches || 0;
          else if (metric === 'bsiDiverse') val = bsi ? parseFloat(bsi.penetration) : 0;
          else if (metric === 'vehicles') val = bsi ? parseInt(bsi.vehicles.replace(/,/g,'')) : 0;
          
          return { name, value: val, originalName: name };
      });

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: { 
            trigger: 'item', 
            backgroundColor: 'rgba(10,20,30,0.9)',
            borderColor: '#B8943A',
            textStyle: { color: '#fff' },
            formatter: p => {
                if (!p.data) return p.name;
                const bsi = window.BSI_STRATEGY ? window.BSI_STRATEGY[p.data.originalName] : null;
                if (isBSI) {
                    return `<div style="font-weight:bold; border-bottom:1px solid #B8943A; margin-bottom:5px;">${RU.esc(p.name)} BSI</div>
                            Penetration: <span style="color:#B8943A">${p.value}</span> per 100k<br/>
                            Posture: <span style="color:${window.RE.BSI_POSTURE_COLORS[bsi?.posture] || 'var(--gold)'}">${RU.esc(bsi?.posture || 'N/A')}</span>`;
                } else if (metric === 'vehicles') {
                    return `<div style="font-weight:bold; border-bottom:1px solid #B8943A; margin-bottom:5px;">${RU.esc(p.name)} Vehicles</div>
                            Count: <span style="color:#B8943A">${RU.fmtNum(p.value)}</span> Registered<br/>
                            Density: <b>${RU.esc(bsi?.vehicleDensity || '—')}</b> per 1k`;
                } else if (metric === 'impactScore') {
                    const gistda = bsi?.gistdaAnomaly || 'Stable';
                    return `<div style="font-weight:bold; border-bottom:1px solid #B8943A; margin-bottom:5px;">${RU.esc(p.name)} Impact</div>
                            Scenario Value: <span style="color:#B8943A">${RU.sign(p.value)}${p.value}</span><br/>
                            GISTDA Satellite: <b>${RU.esc(gistda)}</b>`;
                }
                const unit = metric === 'impactScore' ? 'Impact' : metric === 'workforce' ? 'Workers' : 'Branches';
                return `<div style="font-weight:bold; border-bottom:1px solid #B8943A; margin-bottom:5px;">${RU.esc(p.name)}</div>
                        Value: <span style="color:#B8943A">${RU.fmtNum(p.value)}</span> ${unit}`;
            }
        },
        visualMap: {
          min: 0, max: metric === 'workforce' ? 1000000 : metric === 'vehicles' ? 600 : (isBSI ? 5 : 100),
          calculable: true, orient: 'vertical', left: 20, bottom: 20,
          textStyle: { color: '#5A6A4A' },
          inRange: { 
              color: isBSI || metric === 'vehicles' ? ['#F1F5F9', '#3B82F6', '#1E3A8A'] : (metric === 'impactScore' ? ['#10B981', '#F59E0B', '#EF4444'] : ['#F3F4F6', '#D97706', '#1E40AF'])
          }
        },
        series: [{ 
            type: 'map', map: mapName, roam: true, 
            emphasis: { itemStyle: { areaColor: '#FDE68A' }, label: { show: true, color: '#111' } },
            itemStyle: { borderColor: 'rgba(0,0,0,0.1)' },
            data: displayMapData 
        }]
      });

      chart.on('click', (params) => {
          if (params.data && params.data.originalName) {
              window.RE.drillDownProvince(params.data.originalName);
          }
      });
  }
};
