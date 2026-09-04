import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { getInitialProductsSync, getCachedProducts, saveProductsCache, shouldFetchFromNetwork } from '../lib/productCache';
import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/utils';
import { Search as SearchIcon, Mic, Heart, MessageCircle } from 'lucide-react';
import { useSavedStore } from '../store/useSavedStore';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { ProductSkeletonCard } from './HomePage';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>(getInitialProductsSync);
  const [loading, setLoading] = useState(() => getInitialProductsSync().length === 0);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const { t, language } = useLanguageTheme();

  useEffect(() => {
    const fetchAllProducts = async () => {
      // 1. Immediately ensure rich cached data from IndexedDB is loaded
      try {
        const cached = await getCachedProducts();
        if (cached.length > 0) {
          setProducts(cached);
          setLoading(false);
        }
      } catch {}

      // 2. If offline or fresh cache already present, save reads!
      if (!shouldFetchFromNetwork()) {
        setLoading(false);
        return;
      }

      let fetched: Product[] = [];
      let fetchSucceeded = false;
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        fetchSucceeded = true;
      } catch (error) {
        console.warn("Error fetching products from Firestore in search:", error);
      }

      // Merge local offline products queue if present
      try {
        const localOffline: Product[] = JSON.parse(localStorage.getItem('waga_offline_products') || '[]');
        const newLocals = localOffline.filter(lo => !fetched.some(f => f.id === lo.id));
        fetched = [...newLocals, ...fetched];
      } catch {}

      if (fetchSucceeded && fetched.length > 0) {
        setProducts(fetched);
        await saveProductsCache(fetched);
      }

      setLoading(false);
    };
    fetchAllProducts();
  }, []);

  const filteredProducts = products
    .filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return b.createdAt - a.createdAt; // newest is default from firestore, but this ensures it
    });

  return (
    <div className="space-y-8">
      <div className="relative w-full max-w-xl focus-within:max-w-3xl mx-auto transition-all duration-300 ease-out group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-[var(--color-waga-neon)] transition-colors duration-300">
          <SearchIcon size={20} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full bg-white dark:bg-zinc-900/90 border border-zinc-300 dark:border-white/10 waga-neon-focus rounded-full py-4 pl-14 pr-14 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all duration-300 shadow-md dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-md"
        />
        <button 
          className="absolute inset-y-0 right-4 flex items-center justify-center w-10 text-zinc-400 hover:text-red-600 transition-colors"
          onClick={() => alert("Voice search")}
        >
          <Mic size={20} />
        </button>
      </div>
      
      {/* SORTING CHIPS */}
      <div className="flex justify-center gap-2 mb-6">
        <button 
          onClick={() => setSortBy('newest')}
          className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${sortBy === 'newest' ? 'bg-zinc-800 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
        >
          {language === 'FR' ? 'Récent' : 'Newest'}
        </button>
        <button 
          onClick={() => setSortBy('price_asc')}
          className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${sortBy === 'price_asc' ? 'bg-zinc-800 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
        >
          {language === 'FR' ? 'Prix Bas' : 'Price Low'}
        </button>
        <button 
          onClick={() => setSortBy('price_desc')}
          className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${sortBy === 'price_desc' ? 'bg-zinc-800 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
        >
          {language === 'FR' ? 'Prix Haut' : 'Price High'}
        </button>
      </div>

      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">{t('searchResults')} <span className="font-black italic text-red-600 dark:text-red-500">{t('searchTitle')}</span></h2>
          <span className="text-[10px] uppercase text-red-600 dark:text-red-500 font-bold tracking-widest">{filteredProducts.length} {t('articles')}</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <ProductSkeletonCard key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-white/5 shadow-sm">
            <p className="text-zinc-600 dark:text-zinc-400 font-medium text-sm">{t('noProductsFound')} "{searchTerm}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product; key?: React.Key }) {
  const { savedItems, toggleSaved } = useSavedStore();
  const { t } = useLanguageTheme();
  const isSaved = savedItems.some(item => item.id === product.id);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const phone = (product.whatsappNumber || '22666317245').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Bonjour, je suis intéressé par votre annonce sur WAGA SHOP: ${product.name} (${formatPrice(product.price)})`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="relative group">
      <Link to={`/product/${product.id}`} className="block h-full">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3.5 flex flex-col gap-3 relative border border-zinc-200 dark:border-white/10 group-hover:border-red-600/50 transition-all duration-300 h-full shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="w-full aspect-square bg-zinc-100 dark:bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center relative border border-zinc-200/80 dark:border-white/5">
            {product.imageUrls?.[0] ? (
              <img 
                src={product.imageUrls[0]} 
                alt={product.name} 
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500 text-xs uppercase tracking-widest font-semibold">{t('noImage')}</div>
            )}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center pointer-events-none">
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-900/90 dark:bg-black/90 text-white border border-white/10 truncate max-w-[80%] shadow-xs">
                {product.category}
              </span>
            </div>
          </div>
          <div className="flex flex-col flex-1 gap-1">
            <h4 className="text-sm font-bold truncate text-zinc-900 dark:text-zinc-100">{product.name}</h4>
            <div className="flex items-center justify-between gap-1 mt-auto pt-1 overflow-hidden">
              <span className="font-mono text-xs font-black text-red-600 dark:text-red-500 shrink-0">
                {formatPrice(product.price)}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                {product.location || 'Ouaga'}
              </span>
            </div>

            <button
              onClick={handleWhatsAppClick}
              className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500/15 dark:hover:bg-emerald-500 dark:text-emerald-400 dark:hover:text-white border border-emerald-600 dark:border-emerald-500/30 font-bold text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <MessageCircle size={13} />
              {t('contactSeller')}
            </button>
          </div>
        </div>
      </Link>
      <button 
        onClick={(e) => {
          e.preventDefault();
          toggleSaved(product);
        }}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/95 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-center border border-zinc-200 dark:border-white/10 z-10 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shadow-sm opacity-90 sm:opacity-0 group-hover:opacity-100 text-zinc-700 dark:text-zinc-300"
      >
        <Heart size={14} className={isSaved ? "fill-red-600 text-red-600" : "text-zinc-400 dark:text-zinc-400"} />
      </button>
    </div>
  );
}

