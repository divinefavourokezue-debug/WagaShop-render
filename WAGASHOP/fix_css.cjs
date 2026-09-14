const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

// Restore some dual-tone variables
content = content.replace(/--color-waga-neon: #2563EB;/g, '--color-waga-neon: #E11D48;');
content = content.replace(/--color-waga-red: #2563EB;/g, '--color-waga-red: #E11D48;');
content = content.replace(/--color-waga-gold: #2563EB;/g, '--color-waga-gold: #F59E0B;');

// Give gradients a dual tone look
content = content.replace(/background: linear-gradient\(to right, #2563EB, #2563EB\);/g, 'background: linear-gradient(to right, #2563EB, #E11D48);');
content = content.replace(/background: linear-gradient\(to right, #2563EB, #60A5FA\);/g, 'background: linear-gradient(to right, #2563EB, #E11D48);');
content = content.replace(/background: linear-gradient\(to right, rgba\(37, 99, 235, 0.15\), rgba\(37, 99, 235, 0.15\)\);/g, 'background: linear-gradient(to right, rgba(37, 99, 235, 0.15), rgba(225, 29, 72, 0.15));');

fs.writeFileSync('src/index.css', content, 'utf8');
