const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const regex = /if \(combinedProfessions && combinedProfessions\.length < 10 && window\.SKILL_PROFILES\) \{[\s\S]*?generic\.forEach\(p => \{[\s\S]*?combinedProfessions\.push\(\{[\s\S]*?name: window\.SKILL_PROFILES\[p\]\.title \|\| p,[\s\S]*?population: Math\.floor\(Math\.random\(\) \* 50000\) \+ 5000,[\s\S]*?avgIncome: avgProvIncome \* \(Math\.random\(\) \* 1\.5 \+ 0\.5\)[\s\S]*?\}\);[\s\S]*?\}\);[\s\S]*?\}/m;

const replacement = `if (combinedProfessions && combinedProfessions.length < 10) {
            const fallbackRoles = ["Agricultural Laborers", "Retail Cashiers", "Construction Workers", "Street Food Vendors", "Logistics Drivers", "Janitorial Staff", "Hospitality Workers", "Garment Factory Workers", "Healthcare Assistants", "Security Guards"];
            let idx = 0;
            while (combinedProfessions.length < 10) {
                combinedProfessions.push({
                    name: fallbackRoles[idx % fallbackRoles.length],
                    population: Math.floor(Math.random() * 50000) + 5000,
                    avgIncome: avgProvIncome * (Math.random() * 0.8 + 0.4)
                });
                idx++;
            }
        }`;

if(regex.test(html)) {
    html = html.replace(regex, replacement);
    fs.writeFileSync('public/index.html', html);
    console.log("Patched fallback professions");
} else {
    console.log("Could not find regex for professions fallback");
}
