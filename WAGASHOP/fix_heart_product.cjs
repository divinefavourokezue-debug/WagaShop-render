const fs = require('fs');
let content = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

const heartBtnRegex = /<button[\s\S]*?onClick=\{\(\) => toggleSaved\(product\)\}[\s\S]*?className="w-16 h-16 border border-zinc-300 dark:border-white\/10 rounded-2xl flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white\/5 transition-all text-zinc-700 dark:text-white"[\s\S]*?>[\s\S]*?<Heart size=\{20\} className=\{isSaved\(product.id\) \? "fill-blue-600 text-blue-600" : "text-zinc-500 dark:text-white"\} \/>[\s\S]*?<\/button>/;

const newBtn = `
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => toggleSaved(product)}
              className="w-16 h-16 border border-zinc-300 dark:border-white/10 rounded-2xl flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/5 transition-all text-zinc-700 dark:text-white relative overflow-hidden group"
            >
              {isSaved(product.id) && (
                <motion.div 
                  initial={{ scale: 0, opacity: 1 }} 
                  animate={{ scale: 2, opacity: 0 }} 
                  transition={{ duration: 0.4 }} 
                  className="absolute inset-0 bg-blue-400/50 rounded-full" 
                />
              )}
              <Heart size={20} className={isSaved(product.id) ? "fill-blue-600 text-blue-600 relative z-10" : "text-zinc-500 dark:text-white relative z-10"} />
            </motion.button>
`;

content = content.replace(heartBtnRegex, newBtn);
fs.writeFileSync('src/pages/ProductPage.tsx', content, 'utf8');
