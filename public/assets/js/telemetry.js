/**
 * TMLI Telemetry & Debugging Suite
 * Restricted to window.DEBUG activation.
 */

window.TMLI_DEBUG_MODE = false;

window.TMLI_TELEMETRY = {
    logs: [],
    
    /**
     * Record a telemetry event (latency, grounding, errors)
     */
    record: function(pillar, latency, status, grounding = 'Live') {
        const entry = {
            timestamp: new Date().toISOString(),
            pillar,
            latency: latency.toFixed(2) + 'ms',
            status,
            grounding
        };
        this.logs.push(entry);
        if (window.TMLI_DEBUG_MODE) {
            console.log(`[TMLI-DEBUG] ${pillar}: ${entry.latency} | Status: ${status} | Grounding: ${grounding}`);
        }
    },

    /**
     * Print a full health report of the data connections
     */
    printHealthReport: function() {
        console.table(this.logs);
        const avgLatency = this.logs.reduce((acc, curr) => acc + parseFloat(curr.latency), 0) / this.logs.length;
        console.log(`%c AVERAGE PILLAR LATENCY: ${avgLatency.toFixed(2)}ms `, 'background: #1B3F7A; color: #fff; font-weight: bold;');
    },

    /**
     * Activate the debug overlay (Console only trigger)
     */
    activate: function() {
        window.TMLI_DEBUG_MODE = true;
        console.log("%c TMLI DEBUG MODE ACTIVATED ", "background: #B8943A; color: #000; font-weight: bold;");
        this.renderOverlay();
    },

    renderOverlay: function() {
        let el = document.getElementById('debug-overlay');
        if (!el) {
            el = document.createElement('div');
            el.id = 'debug-overlay';
            el.style.cssText = 'position:fixed; bottom:20px; right:20px; background:rgba(0,0,0,0.8); color:#0f0; font-family:monospace; font-size:10px; padding:10px; border-radius:5px; z-index:9999; border:1px solid #0f0; pointer-events:none;';
            document.body.appendChild(el);
        }
        
        const last5 = this.logs.slice(-5).map(l => `<div>${l.pillar}: ${l.latency} (${l.grounding})</div>`).join('');
        el.innerHTML = `<b>TMLI TELEMETRY</b><br/>${last5}`;
    }
};

// Global hook for the user
window.TMLI = {
    printHealthReport: () => window.TMLI_TELEMETRY.printHealthReport(),
    debug: () => window.TMLI_TELEMETRY.activate()
};
