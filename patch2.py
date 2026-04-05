import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ===========================================================================
# FEATURE 1 & 2: Force scoreCalculation in AI prompts + UI display
# ===========================================================================

# Prompt: Overview agent — add scoreCalculation
old_overview = '"costOfLiving":{\\\\\n    \\"overallInflationImpact\\":\\"<%>\\",\\\\\n    \\"foodPriceImpact\\":\\"<%>\\",\\\\\n    \\"items\\":[{\\"item\\":\\"<name>\\",\\"currentPrice\\":\\"<baht>\\",\\"projectedChange\\":\\"<%>\\"}]\\\\\n  }\\\\\n}'
new_overview = '"costOfLiving":{\\\\\n    \\"overallInflationImpact\\":\\"<%>\\",\\\\\n    \\"foodPriceImpact\\":\\"<%>\\",\\\\\n    \\"items\\":[{\\"item\\":\\"<name>\\",\\"currentPrice\\":\\"<baht>\\",\\"projectedChange\\":\\"<%>\\"}]\\\\\n  },\\\\\n  \\"scoreCalculation\\":\\"<show explicit formula e.g. (2M workers at risk x-30) + (1.2% GDP shock x-40) = -88>\\"\\\\\n}'
html = html.replace(old_overview, new_overview)

# Prompt: Labor agent — add scoreCalculation to professions and industries
old_labor_prof = '"monthlyDisposableIncomeImpact\\":\\"<THB>\\"}'
html = html.replace(old_labor_prof, '"monthlyDisposableIncomeImpact\\":\\"<THB>\\",\\"scoreCalculation\\":\\"<e.g. (60% supply chain x-50pts) + (wage cut 15% x-20pts) = -43>\\"}', 1)

old_labor_ind = '"monthlyDisposableIncomeImpact\\":\\"<THB>\\"}\\\\n  ],'
html = html.replace(old_labor_ind, '"monthlyDisposableIncomeImpact\\":\\"<THB>\\",\\"scoreCalculation\\":\\"<e.g. (GDP share 12% x shock -30) + (workforce sensitivity x-20) = -62>\\"}\\\\n  ],', 1)

# Prompt: Commodities — add scoreCalculation per crop
html = html.replace(
    '"costOfLivingEffect\\":\\"<max 10 words>\\"}\\\\n  ]\\\\n}',
    '"costOfLivingEffect\\":\\"<max 10 words>\\",\\"scoreCalculation\\":\\"<e.g. (farmer exposure 35% x-40) + (price shock x-30) = -62>\\"}\\\\n  ]\\\\n}'
)

# Prompt: Strategy — add scoreCalculation to regionalImpact
html = html.replace(
    '"criticalOccupations\\":[\\"<job>\\"]}'
    + '\\\\n  ]\\\\n}',
    '"criticalOccupations\\":[\\"<job>\\"],\\"scoreCalculation\\":\\"<e.g. (crop reliance 70% x-60) + (branch NPL history x-20) = -72>\\"}'
    + '\\\\n  ]\\\\n}'
)

# Prompt: Province — add scoreCalculation
html = html.replace(
    '  \\"localOpportunity\\":\\"<1 sentence: growth segment>\\"\\n}',
    '  \\"localOpportunity\\":\\"<1 sentence: growth segment>\\",\\n  \\"scoreCalculation\\":\\"<explicit formula e.g. (primary industry shock x-50) + (nc branch exposure x-20) = -70>\\"\\n}'
)

# ===========================================================================
# FEATURE 3: Inject GISTDA agri data into AI context in runAnalysis
# ===========================================================================
old_enrich_inject = "if (enrichData.cpiInflation) ctx += `\\n[MACRO] Thai CPI Inflation: ${enrichData.cpiInflation}%`;"
new_enrich_inject = """if (enrichData.cpiInflation) ctx += `\\n[MACRO] Thai CPI Inflation: ${enrichData.cpiInflation}%`;
           if (enrichData.unemploymentRate) ctx += `\\n[MACRO] Thai Unemployment Rate: ${enrichData.unemploymentRate}%`;
           if (enrichData.gistdaAgriData && enrichData.gistdaAgriData.length > 0) {
             const gistdaStr = enrichData.gistdaAgriData.map(g => `${g.province}: ${g.cropType} index=${g.value}`).join(', ');
             ctx += `\\n[GISTDA SATELLITE GROUND TRUTH] Crop health by province: ${gistdaStr}. Use these as anchors when computing agricultural impact scores.`;
           }"""
html = html.replace(old_enrich_inject, new_enrich_inject)

# ===========================================================================
# FEATURE 4: Segmented map risk colors (pieces instead of continuous gradient)
# ===========================================================================
old_visual_map = """        visualMap: {
          min: -100,
          max: 100,
          text: ['High Risk', 'Opportunity'],
          realtime: false,
          calculable: true,
          inRange: {
            color: ['#8B1D2F', '#B84C1A', '#EDE5D4', '#1A6B3C']
          },
          textStyle: {
            color: '#7A7060',
            fontSize: 10
          },
          itemWidth: 10,
          itemHeight: 60,
          right: '5%',
          bottom: '5%'
        },"""
new_visual_map = """        visualMap: {
          type: 'piecewise',
          pieces: [
            { min: -100, max: -61, label: 'Severe Crisis',    color: '#8B1D2F' },
            { min: -60,  max: -26, label: 'High Risk',        color: '#B84C1A' },
            { min: -25,  max:  -1, label: 'Elevated Risk',    color: '#B8943A' },
            { min:   0,  max:  49, label: 'Stable / Positive',color: '#1A6B3C' },
            { min:  50,  max: 100, label: 'High Opportunity', color: '#1B3F7A' }
          ],
          textStyle: { color: '#7A7060', fontSize: 10 },
          itemWidth: 12,
          itemHeight: 12,
          itemGap: 6,
          right: '2%',
          bottom: '5%',
          orient: 'vertical'
        },"""
html = html.replace(old_visual_map, new_visual_map)

# ===========================================================================
# Feature 2: Display scoreCalculation in Overview banner area (UI)
# ===========================================================================
old_score_ring = """      <div class="score-ring" style="border-color:${sc};color:${sc}" aria-label="Impact score ${sign(s)}${s}">
        <div class="score-n">${sign(s)}${s}</div>
        <div class="score-l">IMPACT</div>
      </div>"""
new_score_ring = """      <div class="score-ring" style="border-color:${sc};color:${sc}" aria-label="Impact score ${sign(s)}${s}">
        <div class="score-n">${sign(s)}${s}</div>
        <div class="score-l">IMPACT</div>
      </div>
      ${d.scoreCalculation ? `<div style="font-size:9px; color:var(--muted); margin-top:6px; font-family:monospace; text-align:center; max-width:140px; line-height:1.4; border:1px dashed var(--border); padding:4px 6px; border-radius:4px;">📐 ${esc(d.scoreCalculation)}</div>` : ''}"""
html = html.replace(old_score_ring, new_score_ring)

# Professions: show scoreCalculation inside profession cards
old_prof_score = """              <div class="pc-score" style="color:${pc2}">${sg}${p.impactScore||0}</div>"""
new_prof_score = """              <div class="pc-score" style="color:${pc2}">${sg}${p.impactScore||0}</div>
              ${p.scoreCalculation ? `<div style="font-size:8px; color:var(--muted); font-family:monospace; margin-top:3px; text-align:right; max-width:120px; line-height:1.3;">📐 ${esc(p.scoreCalculation)}</div>` : ''}"""
html = html.replace(old_prof_score, new_prof_score)

# Commodities: show scoreCalculation inside crop cards
old_crop_score = """          <div class="pc-score" style="color:${color}">${sign(a.impactScore || 0)}${a.impactScore || 0}</div>"""
new_crop_score = """          <div class="pc-score" style="color:${color}">${sign(a.impactScore || 0)}${a.impactScore || 0}</div>
          ${a.scoreCalculation ? `<div style="font-size:8px; color:var(--muted); font-family:monospace; margin-top:3px; text-align:right; max-width:120px; line-height:1.3;">📐 ${esc(a.scoreCalculation)}</div>` : ''}"""
html = html.replace(old_crop_score, new_crop_score)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Phase 2 patch applied!")
