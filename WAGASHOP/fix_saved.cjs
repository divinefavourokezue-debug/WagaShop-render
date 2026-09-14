const fs = require('fs');
let content = fs.readFileSync('src/pages/SavedPage.tsx', 'utf8');

// Add motion import
if (!content.includes('framer-motion')) {
  content = content.replace("import { useLanguageTheme } from '../context/LanguageThemeContext';", "import { useLanguageTheme } from '../context/LanguageThemeContext';\nimport { motion } from 'framer-motion';");
}

const emptyStateRegex = /<div className="text-center py-20 bg-white dark:bg-zinc-900\/50 rounded-\[2\.5rem\] border border-zinc-200 dark:border-white\/5 shadow-sm">[\s\S]*?<\/div>/;

const newEmptyState = `
        <div className="text-center py-24 bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-white/5 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
              <Heart size={32} className="text-blue-500" />
            </div>
          </div>
          <p className="text-slate-900 dark:text-white text-lg font-black mb-2 tracking-tight">
            No saved items yet
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">
            {t('noSaved')}
          </p>
          <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md active:scale-95">
            {t('browseOffers')}
          </Link>
        </div>
`;
content = content.replace(emptyStateRegex, newEmptyState);

const heartBtnRegex = /<button[\s\S]*?onClick=\{\(e\) => \{[\s\S]*?e\.preventDefault\(\);[\s\S]*?toggleSaved\(product\);[\s\S]*?\}\}[\s\S]*?className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white\/90 dark:bg-zinc-950\/80 backdrop-blur-md flex items-center justify-center border border-zinc-200 dark:border-white\/10 z-10 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shadow-sm"[\s\S]*?>[\s\S]*?<Heart size=\{14\} className="fill-blue-600 text-blue-600" \/>[\s\S]*?<\/button>/;

const newBtn = `
              <motion.button 
                whileTap={{ scale: 0.7 }}
                whileHover={{ scale: 1.1 }}
                onClick={(e) => {
                  e.preventDefault();
                  toggleSaved(product);
                }}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-center border border-zinc-200 dark:border-white/10 z-10 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shadow-sm relative overflow-hidden group"
              >
                <motion.div 
                  initial={{ scale: 0, opacity: 1 }} 
                  animate={{ scale: 2, opacity: 0 }} 
                  transition={{ duration: 0.4 }} 
                  className="absolute inset-0 bg-blue-400/50 rounded-full" 
                />
                <Heart size={14} className="fill-blue-600 text-blue-600 relative z-10" />
              </motion.button>
`;
content = content.replace(heartBtnRegex, newBtn);
fs.writeFileSync('src/pages/SavedPage.tsx', content, 'utf8');
