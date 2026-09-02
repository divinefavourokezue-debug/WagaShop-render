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
  // Layout and general gradients
  [/from-blue-600 to-indigo-600/g, 'from-blue-600 to-rose-600'],
  [/from-blue-600 via-indigo-600 to-blue-500/g, 'from-blue-600 via-purple-500 to-rose-500'],
  [/from-blue-600 via-indigo-500 to-blue-700/g, 'from-blue-600 via-purple-500 to-rose-600'],
  [/from-blue-600 to-indigo-500/g, 'from-blue-600 to-rose-500'],
  
  // Hearts (specifically replacing the blue heart states)
  [/fill-blue-600 text-blue-600/g, 'fill-rose-500 text-rose-500'],
  
  // Specific Spotlight backgrounds (HomePage.tsx)
  [/from-blue-900 to-indigo-900/g, 'from-blue-900 to-rose-900'],
  [/from-purple-900 to-fuchsia-900/g, 'from-indigo-900 to-rose-900'],
];

walk('./src', (err, results) => {
  if (err) throw err;
  results.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    replacements.forEach(([regex, replacement]) => {
      content = content.replace(regex, replacement);
    });

    // Special ProductPage replacements
    if (file.endsWith('ProductPage.tsx')) {
      content = content.replace(/className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white/g, 'className="w-full py-5 bg-gradient-to-r from-blue-600 to-rose-600 hover:from-blue-700 hover:to-rose-700 text-white');
      content = content.replace(/shadow-blue-600\/20 hover:shadow-blue-600\/40/g, 'shadow-blue-600/20 hover:shadow-rose-600/40');
    }
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  });
});
