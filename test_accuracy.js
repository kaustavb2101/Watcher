/**
 * Phase 8 Accuracy & Pillar Verification
 */
import fetch from 'node-fetch';

async function verifyPillars() {
    console.log("--- CTO PILLAR VERIFICATION ---");
    const resp = await fetch('http://localhost:3000/api/data-enrichment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'full' })
    });
    
    if (!resp.ok) {
        console.error("FAIL: API offline or 500 error.");
        return;
    }
    
    const data = await resp.json();
    const pillars = ['nso', 'bot', 'worldbank', 'gistda', 'imf', 'moc', 'nesdc'];
    let passed = 0;
    
    pillars.forEach(p => {
        const found = data.sources.some(s => s.name.toLowerCase().includes(p) || s.url?.toLowerCase().includes(p));
        if (found) {
            console.log(`[✓] ${p.toUpperCase()}: Grounded`);
            passed++;
        } else {
            console.warn(`[!] ${p.toUpperCase()}: Missing or fallback used`);
        }
    });

    console.log(`\nPILLAR SCORE: ${passed}/${pillars.length}`);
    if (passed >= 5) console.log("STATUS: VIABLE FOR DEPLOYMENT.");
    else console.warn("STATUS: PARTIAL VIABILITY.");
}

verifyPillars();
