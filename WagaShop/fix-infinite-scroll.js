import fs from 'fs';

let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf-8');

// 1. Remove the restrictive selectedCategory === null constraint
// 2. Replace the button with a simple spinner and a div

const oldButtonBlock = `{hasMore && filteredProducts.length > 0 && !searchTerm && selectedCategory === null && (
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={loadMore} 
                  disabled={loadingMore}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-200 font-bold px-8 py-3 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingMore ? <Loader2 size={18} className="animate-spin" /> : <ArrowDown size={18} />}
                  {language === 'FR' ? 'Voir plus' : 'Load more'}
                </button>
              </div>
            )}`;

const newButtonBlock = `{hasMore && filteredProducts.length > 0 && !searchTerm && (
              <div className="mt-12 mb-4 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                {loadingMore ? (
                  <>
                    <Loader2 size={28} className="animate-spin text-red-600 dark:text-red-500 mb-2" />
                    <span className="text-sm font-bold animate-pulse">{language === 'FR' ? 'Chargement...' : 'Loading...'}</span>
                  </>
                ) : (
                  <span className="text-sm font-medium opacity-0">Scroll for more</span>
                )}
              </div>
            )}`;

content = content.replace(oldButtonBlock, newButtonBlock);

// Add the window scroll event listener inside the component.
// We'll put it right after the useEffect that fetches data.

const oldUseEffect = `  // Fetch data on mount AND when category/location filters change
  useEffect(() => {
    setRecentProducts(getRecentlyViewed());
    setProducts([]); // Clear existing to show loading state for new category
    setLoading(true);
    fetchData(false);
  }, [selectedCategory, selectedLocation]);`;

const newUseEffect = `  // Fetch data on mount AND when category/location filters change
  useEffect(() => {
    setRecentProducts(getRecentlyViewed());
    setProducts([]); // Clear existing to show loading state for new category
    setLoading(true);
    fetchData(false);
  }, [selectedCategory, selectedLocation]);

  // Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      // If we are within 600px of the bottom of the page, trigger load more
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 600) {
        if (hasMore && !loadingMore && !searchTerm) {
          loadMore();
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, searchTerm, lastVisible, selectedCategory, selectedLocation]);`;

content = content.replace(oldUseEffect, newUseEffect);

fs.writeFileSync('src/pages/HomePage.tsx', content);
