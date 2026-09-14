const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Replace all the duplicate buttons with just an empty string
// We will manually add it back in one place

const buttonRegex = /            <button\n              onClick=\{\(\) => setIsTutorialOpen\(true\)\}\n              aria-label=\{language === 'FR' \? "Comment ça marche" : "How it works"\}\n              title=\{language === 'FR' \? "Comment ça marche" : "How it works"\}\n              className=\{cn\(\n                "flex items-center justify-center w-8 h-8 rounded-xl transition-all border cursor-pointer",\n                isDark\n                  \? "bg-zinc-900 border-white\/10 text-zinc-300 hover:text-white hover:border-emerald-500\/50"\n                  : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-emerald-600 hover:border-emerald-300"\n              \)\}\n            >\n              <HelpCircle size=\{15\} \/>\n            <\/button>/g;

content = content.replace(buttonRegex, '');

fs.writeFileSync('src/components/Layout.tsx', content);
