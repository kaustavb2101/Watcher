const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const splitText = '<div class="sb-section">';
if(html.includes(splitText)) { 
  const inj = `<div style="background:var(--paper); padding:15px; margin: 15px 12px 0 12px; border-radius:var(--r); border:1px solid var(--border);">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h4 style="color:var(--gold); margin:0; font-size: 13px">📈 Dynamic Macro Shocks</h4>
        <div id="liveOilValue" style="font-size:11px; color:var(--muted); background:var(--bg); padding:2px 6px; border-radius:4px; border:1px solid var(--border)">Fetching WTI...</div>
    </div>
    <label style="font-size:11px; color:var(--muted); display:block; margin-bottom:5px;">Simulate Oil Price Shock (WTI $/bbl)</label>
    <input type="range" id="oilSlider" min="50" max="150" value="75" step="1" style="width:100%; accent-color:var(--gold);" oninput="document.getElementById('oilDisplay').innerText = '$' + this.value; window.OIL_SLIDER_DELTA = this.value - 75; if(document.querySelector('div.ec.active')){ document.querySelector('div.ec.active').click(); }">
    <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:5px; font-weight:bold; color:var(--fg)">
        <span>$50</span>
        <span id="oilDisplay" style="color:var(--gold)">$75</span>
        <span>$150</span>
    </div>
  </div>
  <div class="sb-section">`;
  html = html.replace(splitText, inj); 
  fs.writeFileSync('public/index.html', html); 
  console.log('Successfully injected.'); 
} else { 
  console.log('FAILED to find sb-section'); 
}
