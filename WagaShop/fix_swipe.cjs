const fs = require('fs');
let content = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');
content = content.replace(/\{...swipeHandlers\}/g, '');
fs.writeFileSync('src/pages/ProductPage.tsx', content, 'utf8');
