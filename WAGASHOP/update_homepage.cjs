const fs = require('fs');

let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

const spotlightComponent = `
function SpotlightCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = [
    {
      id: 1,
      title: "Premium Electronics",
      subtitle: "Discover top-tier gadgets in Ouagadougou",
      bg: "bg-gradient-to-r from-blue-900 to-indigo-900",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 2,
      title: "Real Estate Deals",
      subtitle: "Find your dream home today",
      bg: "bg-gradient-to-r from-emerald-900 to-teal-900",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 3,
      title: "Digital Services",
      subtitle: "Hire top freelancers",
      bg: "bg-gradient-to-r from-purple-900 to-fuchsia-900",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-48 sm:h-56 rounded-3xl overflow-hidden mb-6 group">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className={\`absolute inset-0 \${slides[currentIndex].bg}\`}
        >
          <img src={slides[currentIndex].image} alt="Spotlight" className="w-full h-full object-cover mix-blend-overlay opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 flex flex-col gap-1">
            <span className="text-[10px] font-black tracking-widest uppercase text-white/80 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-sm w-max mb-1">
              Spotlight
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {slides[currentIndex].title}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 font-medium">
              {slides[currentIndex].subtitle}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
        {slides.map((_, i) => (
          <div 
            key={i} 
            className={\`h-1.5 rounded-full transition-all duration-300 \${i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}\`} 
          />
        ))}
      </div>
    </div>
  );
}
`;

// Insert SpotlightCarousel at the top of the file before default export
if (!content.includes('SpotlightCarousel')) {
  content = content.replace('export default function HomePage() {', spotlightComponent + '\nexport default function HomePage() {');
}

// Add SpotlightCarousel in the JSX right after "recentProducts" and before "PLANS OFFER BANNER"
const bannerRegex = /\{\/\*\s*PLANS OFFER BANNER\s*\*\/\}/;
if (!content.includes('<SpotlightCarousel />')) {
  content = content.replace(bannerRegex, '<SpotlightCarousel />\n      {/* PLANS OFFER BANNER */}');
}

// Update the Empty State
const emptyStateRegex = /filteredProducts\.length === 0 \? \([\s\S]*?setSelectedCategory\(null\);[\s\S]*?<\/button>\s*<\/div>\s*\)/;
const updatedEmptyState = `filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm p-6 flex flex-col items-center justify-center">
            <div className="w-24 h-24 mb-6 relative">
              <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                <SearchIcon size={32} className="text-blue-500" />
              </div>
            </div>
            <p className="text-slate-900 dark:text-white text-lg font-black mb-2 tracking-tight">
              {t('noProductsMatch')}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">
              {t('tryChangingFilters')}
            </p>
            <button 
              onClick={() => {
                setSelectedCategory(null);
                setSearchTerm('');
                setSelectedLocation('Toutes');
                setMinPrice('');
                setMaxPrice('');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md active:scale-95"
            >
              Browse all categories
            </button>
          </div>
        )`;
content = content.replace(emptyStateRegex, updatedEmptyState);

// Update Heart to motion.button
const heartButtonRegex = /<button[\s\S]*?className="w-8 h-8 rounded-full[^>]*>[\s\S]*?<Heart size={14} className={isSaved \? "fill-indigo-500 text-indigo-500" : "text-slate-400 dark:text-slate-400"} \/>[\s\S]*?<\/button>/;
const updatedHeartButton = `<motion.button 
          whileTap={{ scale: 0.7 }}
          whileHover={{ scale: 1.1 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaved(product);
          }}
          className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm opacity-90 sm:opacity-0 group-hover:opacity-100 relative overflow-hidden"
        >
          {isSaved && (
            <motion.div 
              initial={{ scale: 0, opacity: 1 }} 
              animate={{ scale: 2, opacity: 0 }} 
              transition={{ duration: 0.4 }} 
              className="absolute inset-0 bg-blue-400/50 rounded-full" 
            />
          )}
          <Heart size={14} className={isSaved ? "fill-blue-500 text-blue-500 relative z-10" : "text-slate-400 dark:text-slate-400 relative z-10"} />
        </motion.button>`;
content = content.replace(heartButtonRegex, updatedHeartButton);

fs.writeFileSync('src/pages/HomePage.tsx', content, 'utf8');
console.log('Updated HomePage.tsx');
