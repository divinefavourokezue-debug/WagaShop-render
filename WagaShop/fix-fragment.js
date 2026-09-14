import fs from 'fs';

let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf-8');

const oldGrid = `        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {hasMore && filteredProducts.length > 0 && !searchTerm && selectedCategory === null && (
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
          )}
        )}`;

const newGrid = `        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {hasMore && filteredProducts.length > 0 && !searchTerm && selectedCategory === null && (
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
            )}
          </>
        )}`;

content = content.replace(oldGrid, newGrid);

fs.writeFileSync('src/pages/HomePage.tsx', content);
