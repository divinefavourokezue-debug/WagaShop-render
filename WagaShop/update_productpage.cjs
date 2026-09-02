const fs = require('fs');
let content = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

// Add state
const stateRegex = /const \[activeImage, setActiveImage\] = useState\(0\);/;
if (!content.includes('const [isLightboxOpen, setIsLightboxOpen] = useState(false);')) {
  content = content.replace(stateRegex, 'const [activeImage, setActiveImage] = useState(0);\n  const [isLightboxOpen, setIsLightboxOpen] = useState(false);');
}

// Update image click
const imgRegex = /<motion\.img[\s\S]*?key=\{activeImage\}[\s\S]*?src=\{images\[activeImage\]\}[\s\S]*?alt=\{`\$\{product\.name\} - \$\{activeImage \+ 1\}`\}[\s\S]*?initial=\{\{ opacity: 0, scale: 0\.98 \}\}/;
const newImg = `<motion.img 
                  key={activeImage}
                  src={images[activeImage]} 
                  alt={\`\${product.name} - \${activeImage + 1}\`} 
                  onClick={() => setIsLightboxOpen(true)}
                  className="cursor-zoom-in object-contain w-full h-full"
                  initial={{ opacity: 0, scale: 0.98 }}`;
content = content.replace(imgRegex, newImg);

// Add Lightbox JSX at the end of the return statement
const endDivRegex = /<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/;
const lightboxJsx = `
      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col backdrop-blur-xl"
          >
            <div className="absolute top-4 right-4 z-10 flex gap-4">
              <button onClick={() => setIsLightboxOpen(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-md transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center relative overflow-hidden" {...swipeHandlers}>
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.9, x: 200 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -200 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 flex items-center justify-center p-4 md:p-12"
                >
                  {isMediaVideo(images[activeImage]) ? (
                    <video src={images[activeImage]} controls autoPlay className="max-w-full max-h-full rounded-2xl shadow-2xl" />
                  ) : (
                    <img src={images[activeImage]} alt="" className="max-w-full max-h-full object-contain drop-shadow-2xl select-none" />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            
            {images.length > 1 && (
              <div className="h-24 md:h-32 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-3 px-4 pb-6">
                {images.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={\`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all \${activeImage === idx ? 'border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'border-transparent opacity-50 hover:opacity-100'}\`}
                  >
                     {isMediaVideo(url) ? (
                        <video src={url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
</div>
  );
}`;
content = content.replace(endDivRegex, lightboxJsx);

fs.writeFileSync('src/pages/ProductPage.tsx', content, 'utf8');
console.log('Updated ProductPage.tsx');
