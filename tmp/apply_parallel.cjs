const fs = require('fs');
let code = fs.readFileSync('c:\\Users\\Kaustav Bagchi\\OneDrive\\Desktop\\Watcher\\public\\index.html', 'utf8');

// 1. Replace buildPrompt
const bpStart = code.indexOf('    function buildPrompt(tag, title, ctx) {');
const bpEnd = code.indexOf('    function abortAnalysis() {');

const newBP = `    function buildPrompt(tag, title, ctx, agentType = 'overview') {
      let nabcCtx = "";
      if (Object.keys(window.NABCPrices).length > 0) {
        nabcCtx = "\\n<NABC_LIVE_PRICES> Current Thai Spot Prices: ";
        for (const [crop, data] of Object.entries(window.NABCPrices)) {
          nabcCtx += \`\${crop}: \${data.price} \${data.unit}; \`;
        }
        nabcCtx += "</NABC_LIVE_PRICES>\\nUse these baseline prices when projecting price cascades.";
      }
      
      const base = \`Act as the "AutoX Strategy Agent"—a high-level lending institutional analyst for AutoX (Ngern Chaiyo).
Analyze this event: [\${tag}] \${title}
Context: \${ctx}

Return ONLY valid JSON (no markdown). Your response must be extremely brief.\`;

      if (agentType === 'overview') {
        return base + \`\\n{\\n  "overallSentiment":"SEVERE CRISIS|HIGH RISK|ELEVATED RISK|MIXED|CAUTIOUS POSITIVE|STRONG POSITIVE",\\n  "impactScore":<-100 to +100>,\\n  "workersAtRisk":"<e.g. 1.4 million>",\\n  "jobsLost":"<estimate>",\\n  "jobsCreated":"<estimate>",\\n  "gdpImpact":"<e.g. -0.8% GDP>",\\n  "timeHorizon":"<e.g. 6-18 months>",\\n  "headline":"<one precise data-grounded sentence>",\\n  "analysis":"<bullet: max 15 words: immediate transmission>\\\\n\\\\n<bullet: max 15 words: hardest hit>\\\\n\\\\n<bullet: max 15 words: primary commodity>\\\\n\\\\n<bullet: max 15 words: structural risk>",\\n  "keyInsights":[\\n    {"icon":"<emoji>","title":"<short>","bullets":["<max 10 words>","<max 10 words>"]}\\n  ],\\n  "costOfLiving":{\\n    "overallInflationImpact":"<e.g. +1.2% to +2.5% CPI>",\\n    "foodPriceImpact":"<e.g. +5% to +12%>",\\n    "energyPriceImpact":"<e.g. +15% to +30%>",\\n    "householdBurden":"<2 sentences>",\\n    "items":[\\n      {"item":"<item>","currentPrice":"<baht>","projectedChange":"<% change>"}\\n    ]\\n  },\\n  "timeline":[\\n    {"phase":"Immediate (0–3 months)","icon":"<emoji>","colorHex":"<hex>","title":"<title>","description":"<specific>"}\\n  ]\\n}\`;
      } else if (agentType === 'labor') {
        return base + \`Follow limits: max 8 professions, max 6 industries, max 6 wage impacts.\\n{\\n  "professions":[\\n    {"icon":"<emoji>","name":"<profession>","workerCount":"<number>","avgWage":"<baht>","impactScore":<-100 to +100>,"riskLevel":"Critical|High|Medium|Low|Positive","immediateImpact":"<max 12 words>","mediumTermImpact":"<max 12 words>","adaptationPaths":["<action>"],"tags":["<tag>"]}\\n  ],\\n  "industries":[\\n    {"icon":"<emoji>","name":"<industry>","gdpShare":"<%>","workforceSize":"<number>","impactScore":<-100 to +100>,"verdict":"<5-word verdict>","analysisBullets":["<max 12 words>"],"subOccupations":[{"name":"<role>","impact":<number>}],"keyActions":["<action>"]}\\n  ],\\n  "wageImpacts":[\\n    {"icon":"<emoji>","profession":"<name>","currentWage":"<baht>","projectedChange":"<%>","outlook":"<1 sentence>"}\\n  ]\\n}\`;
      } else if (agentType === 'commodities') {
        return base + \`\${nabcCtx}\\nCreate a card for exactly 5 commodities.\\n{\\n  "agriculturalImpact":[\\n    {"icon":"<emoji>","crop":"<crop>","farmersAffected":"<number>","currentPrice":"<current price per unit in baht>","projectedPriceChange":"<+12% to +18%>","impactScore":<-100 to +100>,"analysis":"<max 15 words>","costOfLivingEffect":"<max 10 words>"}\\n  ]\\n}\`;
      } else if (agentType === 'strategy') {
        return base + \`Exactly 5 actionable recommendations, 10 impacted provinces.\\n{\\n  "recommendations":[\\n    {"icon":"<emoji>","title":"<title>","description":"<2 sentences specific action>"}\\n  ],\\n  "strategyInsight":{\\n    "autoXThreats":["<Bullet>"],\\n    "strategicOpportunities":["<Action>"],\\n    "actionableRecommendations":["<Action 1: Occupation specific>","<Action 2: Province>","<Action 3>","<Action 4>","<Action 5>"]\\n  },\\n  "regionalImpact":[\\n    {"province":"<province>","region":"<Central|North|Northeast|South|East|West>","impactScore":<-100 to +100>,"riskFactor":"<5-word>","affectedCrops":["<emoji> <crop>"],"criticalOccupations":["<job>"]}\\n  ]\\n}\`;
      }
    }
`;

code = code.substring(0, bpStart) + newBP + code.substring(bpEnd);

// 2. Replace runCompare's fetch logic
const cmpF = "const res = await fetchAnalysis(ev.key, ev.title, ctx);";
const cmpR = `
          S.abortCtrl = new AbortController();
          const p1 = fetchAnalysisAgent(ev.key, ev.title, ctx, 'overview');
          const p2 = fetchAnalysisAgent(ev.key, ev.title, ctx, 'labor');
          const p3 = fetchAnalysisAgent(ev.key, ev.title, ctx, 'commodities');
          const p4 = fetchAnalysisAgent(ev.key, ev.title, ctx, 'strategy');
          const [overview, labor, commodities, strategy] = await Promise.all([p1, p2, p3, p4]);
          const res = { ...overview, ...labor, ...commodities, ...strategy };
`;
code = code.replace(cmpF, cmpR);

// 3. Replace runAnalysis's fetch logic
const anaF = "const data = await fetchAnalysis(tag, title, ctx);";
const anaR = `
        S.abortCtrl = new AbortController();
        const p1 = fetchAnalysisAgent(tag, title, ctx, 'overview');
        const p2 = fetchAnalysisAgent(tag, title, ctx, 'labor');
        const p3 = fetchAnalysisAgent(tag, title, ctx, 'commodities');
        const p4 = fetchAnalysisAgent(tag, title, ctx, 'strategy');
        const [overview, labor, commodities, strategy] = await Promise.all([p1, p2, p3, p4]);
        const data = { ...overview, ...labor, ...commodities, ...strategy };
`;
code = code.replace(anaF, anaR);

// 4. Rename fetchAnalysis to fetchAnalysisAgent and add agentType
code = code.replace(
    '    async function fetchAnalysis(tag, title, ctx) {',
    '    async function fetchAnalysisAgent(tag, title, ctx, agentType = "overview") {'
);

code = code.replace(
    'const prompt = buildPrompt(tag, title, ctx);',
    'const prompt = buildPrompt(tag, title, ctx, agentType);'
);

code = code.replace(
    'S.abortCtrl = new AbortController();',
    '// S.abortCtrl created in parent'
);

fs.writeFileSync('c:\\\\Users\\\\Kaustav Bagchi\\\\OneDrive\\\\Desktop\\\\Watcher\\\\public\\\\index.html', code);
console.log('Update applied');
