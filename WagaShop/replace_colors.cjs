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
  [/red-600/g, 'blue-600'],
  [/red-500/g, 'blue-500'],
  [/red-400/g, 'blue-400'],
  [/red-700/g, 'blue-700'],
  [/red-100/g, 'blue-100'],
  [/red-200/g, 'blue-200'],
  [/red-900\/50/g, 'blue-900/50'],
  [/rose-600/g, 'indigo-600'],
  [/rose-500/g, 'indigo-500'],
  [/rose-400/g, 'indigo-400'],
  [/rose-100/g, 'indigo-100'],
  [/rose-200/g, 'indigo-200'],
  [/rose-50/g, 'indigo-50'],
  [/amber-500/g, 'teal-500'],
  [/amber-200/g, 'teal-200'],
  [/amber-700/g, 'teal-700'],
  [/amber-800/g, 'teal-800'],
  [/amber-400/g, 'teal-400'],
  [/amber-300/g, 'teal-300'],
  [/amber-50/g, 'teal-50'],
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
