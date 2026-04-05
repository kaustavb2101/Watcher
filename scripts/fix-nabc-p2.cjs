const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Global replacement for the crash block
html = html.replace(/if \(\!res\.ok\) return;\s*const json = await res\.json\(\);/g, `if (!res.ok) return;
              let json;
              try { json = await res.json(); } catch(e) { return; } // Safely bypass`);

fs.writeFileSync('public/index.html', html);
console.log('Fixed ALL instances of NABC json parse.');
