const fs = require('fs');

let content = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

// I will rebuild the missing section.
// The broken section starts after:
// 230:          {/* Controls & Indicators */}
// 231:          {images.length > 1 && (
// 232:            <>
// 233:              {/* Previous Button */}

// up to 
// 258:        </div>
// 259:
// 260:        {/* 5-Button Share Bar */}

const patch = `          {/* Controls & Indicators */}
          {images.length > 1 && (
            <>
              {/* Previous Button */}
              <button 
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md border border-white/20 hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10"
              >
                <ChevronLeft size={24} />
              </button>
              
              {/* Next Button */}
              <button 
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md border border-white/20 hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10"
              >
                <ChevronRight size={24} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 z-10">
                {images.map((_, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={\`h-1.5 rounded-full transition-all \${activeImage === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}\`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none snap-x px-1">
            {images.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(idx)}
                className={\`w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer snap-start \${
                  activeImage === idx ? 'border-blue-600 scale-105 shadow-md shadow-blue-600/20' : 'border-transparent opacity-60 hover:opacity-100'
                }\`}
              >
                {isMediaVideo(url) ? (
                  <video src={url} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={url} alt="" className="w-full h-full object-cover" decoding="async" referrerPolicy="no-referrer" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-10 flex flex-col gap-8 border border-zinc-200 dark:border-white/10 shadow-lg dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative">
        {/* Header */}
        <div className="space-y-4 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20">
            {product.category}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-3 pt-2">
            <MapPin size={18} className="text-zinc-400" />
            <span className="text-zinc-600 dark:text-zinc-400 font-medium">{product.location || 'Ouagadougou, Burkina Faso'}</span>
          </div>
          
          <div className="flex items-baseline gap-2 pt-4">
            <span className="text-5xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">
              {formatPrice(product.price).replace(' FCFA', '')}
            </span>
            <span className="text-xl font-bold text-zinc-500">FCFA</span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4 bg-zinc-50 dark:bg-zinc-950/50 p-6 rounded-3xl border border-zinc-100 dark:border-white/5">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
            Description
          </h3>
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">
            {product.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg sm:text-xl uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1"
          >
            <MessageCircle size={24} />
            {t('buyNow')}
          </a>
          
          <div className="flex gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-4 border border-blue-500/40 rounded-2xl bargain-btn text-xl tracking-wide hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all text-center text-blue-600 dark:text-blue-400 font-semibold"
            >
              {t('negotiate')}
            </a>
            
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

            <button
              onClick={handleShare}
              className="w-16 h-16 border border-zinc-300 dark:border-white/10 rounded-2xl flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/5 transition-all text-zinc-700 dark:text-white"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>`;

const startIdx = content.indexOf('{/* Controls & Indicators */}');
const endStr = '{/* 5-Button Share Bar */}';
const endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + patch + '\n\n        ' + content.substring(endIdx);
  fs.writeFileSync('src/pages/ProductPage.tsx', content, 'utf8');
  console.log('Fixed ProductPage.tsx');
} else {
  console.log('Could not find indices');
}
