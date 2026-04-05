import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Bias
html = re.sub(r'"projectedPriceChange":"<\+12% to \+18%>"', '\"projectedPriceChange\":\"<e.g. +2% or -1%>\"', html)

# 2. Cost of Living
col_snippet = """    ${d.costOfLiving ? `
    <div class="card" style="margin-bottom: 15px; border-left: 4px solid var(--orange);">
      <div class="card-h"><span class="card-h-l" style="color:var(--orange)">🛒 Cost of Living & Inflation Impact</span></div>
      <div style="padding:15px">
        <div class="g2" style="gap:15px; margin-bottom:15px">
          <div style="background:var(--paper); padding:10px; border-radius:6px; text-align:center">
            <div style="font-size:10px; color:var(--muted); font-weight:800; margin-bottom:4px">OVERALL INFLATION</div>
            <div style="font-size:16px; color:var(--red); font-weight:800">${esc(d.costOfLiving.overallInflationImpact)}</div>
          </div>
          <div style="background:var(--paper); padding:10px; border-radius:6px; text-align:center">
            <div style="font-size:10px; color:var(--muted); font-weight:800; margin-bottom:4px">FOOD PRICE SHOCK</div>
            <div style="font-size:16px; color:var(--red); font-weight:800">${esc(d.costOfLiving.foodPriceImpact)}</div>
          </div>
        </div>
        <div>
          <div style="font-size:11px; font-weight:800; color:var(--muted); margin-bottom:8px">BASKET PROJECTIONS</div>
          ${(d.costOfLiving.items || []).map(item => `
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--border); padding-bottom:6px; margin-bottom:6px">
              <span style="font-size:12px; font-weight:600">${item.item || ''}</span>
              <span style="font-size:12px; font-family:monospace; color:var(--red)">${item.currentPrice || ''} → <b style="color:var(--ink)">${item.projectedChange || ''}</b></span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>` : ''}
"""
html = html.replace('    <div class="card">\n      <div class="card-h"><span class="card-h-l">📊 Expert Analysis</span></div>', col_snippet + '    <div class="card">\n      <div class="card-h"><span class="card-h-l">📊 Expert Analysis</span></div>')

# 3. Empty map state
html = html.replace('if (!d || !d.regionalImpact) return;', 'if (!d || !d.regionalImpact) { d = d || {}; d.regionalImpact = []; }')

# 4. SME
html = html.replace("if (type === 'farmers') keywords = ['farmer', 'cutter', 'crew', 'agri'];", "if (type.toLowerCase() === 'sme') keywords = ['retail', 'shop', 'restaurant', 'tourism', 'hotel', 'sme'];\n          if (type === 'farmers') keywords = ['farmer', 'cutter', 'crew', 'agri'];")

# 5. Bangkok alias
html = html.replace("const explicit = explicitPoints.find(dp => dp.name.toLowerCase() === provName.toLowerCase() || dp.name.toLowerCase().includes(provName.toLowerCase().replace(' ', '')));", "const normProv = provName.toLowerCase() === 'bangkok metropolis' ? 'bangkok' : provName.toLowerCase();\n        const explicit = explicitPoints.find(dp => dp.name.toLowerCase() === normProv || normProv.includes(dp.name.toLowerCase().replace(/ /g, '')) || dp.name.toLowerCase().includes(normProv.replace(/ /g, '')));")

# 6. Map interpolation
old_interp = "inferredScore = (d.impactScore || 0) * 0.5; // Dampened national\n        } else if (inferredScore === null && layer.startsWith('crop:'))"
new_interp = """const regName = ['Northeast', 'Ubon', 'Nong', 'Khon', 'Roiet'].some(x => provName.toLowerCase().includes(x.toLowerCase())) ? 'Northeast' :
                          ['South', 'Surat', 'Phuket', 'Krabi', 'Songkhla'].some(x => provName.toLowerCase().includes(x.toLowerCase())) ? 'South' :
                          ['North', 'Chiang'].some(x => provName.toLowerCase().includes(x.toLowerCase())) ? 'North' : 'Central';
          const regMatch = explicitPoints.find(dp => dp.region && dp.region.toLowerCase() === regName.toLowerCase());
          if (regMatch) { inferredScore = regMatch.value * 0.8; }
          else { inferredScore = (d.impactScore || 0) * 0.5; }
        } else if (inferredScore === null && layer.startsWith('crop:'))"""
html = html.replace(old_interp, new_interp)

# 7. Labels
html = html.replace("          roam: true,\n          zoom: 1.2,\n          itemStyle: {", "          roam: true,\n          zoom: 1.2,\n          label: { show: true, fontSize: 7, color: '#2A2D3A' },\n          itemStyle: {")

# 8. GISTDA Mock Data Fix
html = html.replace("const val = h.data?.data?.[0]?.value ? parseFloat(h.data.data[0].value) : parseFloat((Math.random() * 80 + 20).toFixed(1));", "const val = h.data?.data?.[0]?.value ? parseFloat(h.data.data[0].value) : null;")
html = html.replace("return hubs.map(h => ({ region: h.region, val: parseFloat((Math.random() * 80 + 20).toFixed(1)) }));", "return hubs.map(h => ({ region: h.region, val: null }));")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Python patch applied!")
