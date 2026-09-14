const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            next();
          });
        } else {
          if (file.endsWith('.tsx') || file.endsWith('.ts')) {
             results.push(file);
          }
          next();
        }
      });
    })();
  });
};

const replacements = [
  // Specific gradients
  [/from-blue-600 to-rose-600/g, 'from-teal-700 to-rose-400'],
  [/from-blue-600 via-purple-500 to-rose-600/g, 'from-teal-800 via-teal-600 to-rose-400'],
  [/from-blue-600 via-purple-500 to-rose-500/g, 'from-teal-800 via-teal-600 to-rose-400'],
  [/from-blue-600 to-rose-500/g, 'from-teal-700 to-rose-400'],
  [/from-blue-900 to-rose-900/g, 'from-teal-950 to-rose-950'],
  [/from-indigo-900 to-rose-900/g, 'from-teal-900 to-rose-900'],
  
  // Mappings
  [/\bblue-50\b/g, 'teal-50'],
  [/\bblue-100\b/g, 'teal-100'],
  [/\bblue-200\b/g, 'teal-200'],
  [/\bblue-300\b/g, 'teal-300'],
  [/\bblue-400\b/g, 'teal-500'],
  [/\bblue-500\b/g, 'teal-600'],
  [/\bblue-600\b/g, 'teal-700'],
  [/\bblue-700\b/g, 'teal-800'],
  [/\bblue-800\b/g, 'teal-900'],
  [/\bblue-900\b/g, 'teal-950'],
  
  [/\bindigo-50\b/g, 'teal-50'],
  [/\bindigo-100\b/g, 'teal-100'],
  [/\bindigo-400\b/g, 'teal-500'],
  [/\bindigo-500\b/g, 'teal-600'],
  [/\bindigo-600\b/g, 'teal-700'],
  [/\bindigo-900\b/g, 'teal-950'],
  [/\bindigo-950\b/g, 'teal-950'],

  [/\bpurple-500\b/g, 'teal-600'],
  
  [/\brose-600\b/g, 'rose-500'],
  [/\brose-500\b/g, 'rose-400'],
  
  // Specific heart override
  [/fill-rose-500 text-rose-500/g, 'fill-rose-400 text-rose-400'],
];

walk('./src', (err, results) => {
  if (err) throw err;
  results.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    replacements.forEach(([regex, replacement]) => {
      content = content.replace(regex, replacement);
    });

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  });
});

// Update index.css
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/--color-waga-neon: #[A-Za-z0-9]+;/g, '--color-waga-neon: #0F766E;');
css = css.replace(/--color-waga-red: #[A-Za-z0-9]+;/g, '--color-waga-red: #FB7185;');
css = css.replace(/--color-waga-blue: #[A-Za-z0-9]+;/g, '--color-waga-blue: #0F766E;');
css = css.replace(/#2563EB/g, '#0F766E');
css = css.replace(/#E11D48/g, '#FB7185');
css = css.replace(/37, 99, 235/g, '15, 118, 110');
css = css.replace(/225, 29, 72/g, '251, 113, 133');
// Adjust selection color to teal
css = css.replace(/selection:bg-blue-500\/30/g, 'selection:bg-teal-600/30');

fs.writeFileSync('src/index.css', css, 'utf8');
console.log('Updated index.css');

