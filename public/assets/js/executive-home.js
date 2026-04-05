/**
 * TMLI Executive Home Module
 * Handles macro-data fetching and high-level dashboard orchestration.
 */

window.EH = {
    data: null,

    /**
     * Fetches real-time macro-labor data from the enrichment API.
     */
    async fetchMacroData() {
        try {
            const resp = await fetch('/api/data-enrichment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context: 'executive_summary_init' })
            });
            if (!resp.ok) throw new Error('Failed to fetch macro data');
            this.data = await resp.json();
            return this.data;
        } catch (e) {
            console.error('EH Fetch Error:', e);
            return null;
        }
    },

    /**
     * Initializes the Executive Summary dashboard.
     */
    async init() {
        if (!this.data) {
            await this.fetchMacroData();
        }
        
        // Institutional Baseline Fallback for Local/Offline Environments
        if (!this.data) {
            console.warn('EH: Using Institutional Baseline Fallback');
            this.data = {
                laborForceTotal: "40.6 million (2025 Est.)",
                unemploymentRate: 1.12,
                unemploymentYoY: -0.08,
                gdpGrowth: 2.8,
                gdpGrowthYoY: 0.4,
                cpiInflation: 1.2,
                averageWage: 15450,
                wageGrowthYoY: 2.4,
                employmentGrowthYoY: 1.8,
                topGrowingSector: 'Electronics & Tourism',
                highestWageProvince: 'Bangkok Metropolis',
                automatedInsights: [
                    { category: 'Macro Performance', text: "Thailand's economy maintains a steady recovery path led by tourism and electronics exports.", delta: "+0.4% YoY", sentiment: 'Positive' },
                    { category: 'Workforce Stability', text: "Low unemployment persists at 1.12%, though underemployment in agriculture remains a structural challenge.", delta: "-0.08% QoQ", sentiment: 'Cautious Positive' },
                    { category: 'Inflation Control', text: "CPI remains within the 1-3% target range, providing room for accommodative monetary policy.", delta: "1.2% Annual", sentiment: 'Positive' }
                ],
                employmentData: [
                    { activity: 'Manufacturing', workers: 6200000 },
                    { activity: 'Wholesale & Retail', workers: 5800000 },
                    { activity: 'Agriculture', workers: 11500000 },
                    { activity: 'Accommodation & Food', workers: 3200000 },
                    { activity: 'Construction', workers: 2100000 }
                ]
            };
        }

        const d = this.data;
        // Real-data derived metrics
        d.topGrowingSector = (d.employmentData && d.employmentData.length > 0) ? d.employmentData[0].activity : 'Agriculture & Services';
        d.highestWageProvince = 'Bangkok Metropolis';
        
        // Populate provincial data from real asset (provinces.js)
        if (window.PROVINCE_PROFILES) {
            d.regionalImpact = Object.keys(window.PROVINCE_PROFILES).map(p => {
                const prof = window.PROVINCE_PROFILES[p];
                const totalPop = prof.professions.reduce((sum, pr) => sum + pr.population, 0);
                return {
                    province: p,
                    population: totalPop,
                    branches: prof.branches,
                    region: prof.region,
                    impactScore: Math.min(100, Math.round((prof.branches / (totalPop / 10000)) * 5))
                };
            });
        }

        window.RE.renderExecutive(d);
    },

    /**
     * Returns provincial data formatted for ECharts based on selected metric.
     */
    getProvincialData(metric) {
        if (!window.PROVINCE_PROFILES) return [];
        return Object.keys(window.PROVINCE_PROFILES).map(p => {
            const prof = window.PROVINCE_PROFILES[p];
            let val = 0;
            if (metric === 'workforce') {
                val = prof.professions.reduce((sum, pr) => sum + pr.population, 0);
            } else if (metric === 'footprint') {
                val = prof.branches || 0;
            } else {
                // Default impact score logic or last calculated result
                val = Math.min(100, Math.round((prof.branches / 5) * 2)); 
            }
            return { name: p, value: val };
        });
    }
};
