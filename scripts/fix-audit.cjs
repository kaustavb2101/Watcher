const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Fix the broken HTML slider syntax
const brokenSlider = `<input type="range" id="oilSlider" min="50" max="150" value="75" step="1" style="width:100%; accent-color:var(--gold);" oninput="document.getElementById('oilDisplay').innerText = '`;
const fixedSlider = `<div style="text-align:right; font-size:14px; font-weight:bold; color:var(--gold); margin-bottom:5px;">$<span id="oilDisplay">75</span></div>
    <input type="range" id="oilSlider" min="50" max="150" value="75" step="1" style="width:100%; accent-color:var(--gold);" oninput="document.getElementById('oilDisplay').innerText = this.value; window.OIL_SLIDER_DELTA = this.value - (window.OIL_SLIDER_BASE || 75);">
    </div>`;

// Note: In the DOM, the brokenSlider was exactly followed by newline "          <div class="sb-cat">"
// We need to replace `brokenSlider` and add a closing `</div>` because the wrapper `<div style="background:var(--paper)...` needs closing.
if (html.includes(brokenSlider)) {
    html = html.replace(brokenSlider, fixedSlider);
    console.log("Slider DOM layout fixed.");
}

// 2. Fix the non-integer math in synthesized professions
const brokenMath = `avgIncome: avgProvIncome * (Math.random() * 0.8 + 0.4)`;
const fixedMath = `avgIncome: Math.floor(avgProvIncome * (Math.random() * 0.8 + 0.4))`;
if (html.includes(brokenMath)) {
    html = html.replace(/avgIncome: avgProvIncome \* \(Math\.random\(\) \* 0\.8 \+ 0\.4\)/g, fixedMath);
    console.log("Synthesized math floored.");
}

// 3. Inject missing fetchOil() function before the closing body or inside script tag
if (!html.includes('async function fetchLiveOil()')) {
    const oilFetchLogic = `
      async function fetchLiveOil() {
        try {
          const res = await fetch('/api/oil-price');
          if(res.ok) {
             const data = await res.json();
             if(data.status === 'success' && data.data && data.data.price) {
                const p = Math.round(data.data.price);
                const el = document.getElementById('liveOilValue');
                if(el) el.innerText = 'LIVE: $' + p;
                window.OIL_SLIDER_BASE = p;
                const sd = document.getElementById('oilSlider');
                if(sd) { sd.value = p; document.getElementById('oilDisplay').innerText = p; }
             }
          }
        } catch(e) {}
      }
      setTimeout(fetchLiveOil, 1000);
      `;
    // Add logic to the very bottom script tag
    html = html.replace('function closeDrillDown() {', oilFetchLogic + '\n      function closeDrillDown() {');
    console.log("fetchLiveOil injected logic.");
}

fs.writeFileSync('public/index.html', html);
console.log('Audit fixes applied');
