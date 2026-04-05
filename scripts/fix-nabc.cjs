const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const broken = 'fetch(`/api/nabc?path=/api/prices/${type}`).then(r => r.json())';
const fixed = 'fetch(`/api/nabc?path=/api/prices/${type}`).then(r => r.ok ? r.json() : {price: 0, status: "down"}).catch(()=>({price:0}))';

if(html.includes(broken)) {
    html = html.replace(broken, fixed);
    fs.writeFileSync('public/index.html', html);
    console.log('Successfully patched index.html NABC catch block');
} else {
    console.log('Could not find broken NABC fetch string');
}
