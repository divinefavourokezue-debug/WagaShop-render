const fs = require('fs');

let content = fs.readFileSync('src/index.css', 'utf8');

const replacements = [
  [/#E11D48/gi, '#2563EB'],
  [/#BE123C/gi, '#1D4ED8'],
  [/#DC2626/gi, '#2563EB'],
  [/#F43F5E/gi, '#60A5FA'],
  [/rgba\(225,\s*29,\s*72/g, 'rgba(37, 99, 235'],
  [/rgba\(220,\s*38,\s*38/g, 'rgba(37, 99, 235'],
  [/bg-red-500/g, 'bg-blue-500'],
];

replacements.forEach(([regex, replacement]) => {
  content = content.replace(regex, replacement);
});

fs.writeFileSync('src/index.css', content, 'utf8');
console.log('Updated index.css');
