import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Seller } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../lib/utils';
import { Zap, Heart, Store, ArrowRight, Sparkles, MessageCircle, ShieldCheck, ShoppingBag, Search as SearchIcon, MapPin, SlidersHorizontal, X, Check, Globe, Clock, Filter, Mic, Award, UserCheck, RefreshCw, ArrowDown, Loader2, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSavedStore } from '../store/useSavedStore';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { CATEGORIES, Category, getCategoryTranslation } from '../constants/categories';
import { InstallBanner } from '../components/InstallBanner';
import { ProductShareModal } from '../components/ProductShareModal';
import { BURKINA_CITIES } from '../constants/cities';


export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('waga_products_cache') || sessionStorage.getItem('waga_products_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('waga_products_cache') || sessionStorage.getItem('waga_products_cache');
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('Toutes');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showPlansGrid, setShowPlansGrid] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Pull to Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = React.useRef(0);
  const isPulling = React.useRef(false);
  const PULL_THRESHOLD = 70;

  const { t, language } = useLanguageTheme();
  const navigate = useNavigate();

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(50));
      let fetchedProducts: Product[] = [];
      try {
        const snapshot = await getDocs(q);
        fetchedProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
      } catch (err) {
        console.warn("Firestore fetch error, fallback to offline/cached products:", err);
      }

      // Merge local offline products queue if present
      try {
        const localOffline: Product[] = JSON.parse(localStorage.getItem('waga_offline_products') || '[]');
        if (localOffline.length > 0) {
          const existingIds = new Set(fetchedProducts.map(p => p.id));
          const newLocals = localOffline.filter(p => !existingIds.has(p.id));
          fetchedProducts = [...newLocals, ...fetchedProducts];
        }
      } catch {}

      setProducts(fetchedProducts);

      try {
        localStorage.setItem('waga_products_cache', JSON.stringify(fetchedProducts));
      } catch {}
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  useEffect(() => {
    try {
      const recent = localStorage.getItem('waga_recently_viewed');
      if (recent) {
        setRecentProducts(JSON.parse(recent));
      }
    } catch {}

    fetchData();
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 2 && !isRefreshing) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    if (deltaY > 0 && window.scrollY <= 2) {
      const distance = Math.min(Math.pow(deltaY, 0.85), 90);
      setPullDistance(distance);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setPullDistance(PULL_THRESHOLD);
      fetchData(true);
    } else {
      setPullDistance(0);
    }
  };

  // Voice Search Handler
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('voiceSearchNotSupported'));
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Filter logic
  const filteredProducts = products.filter(p => {
    // Search matching
    const matchesSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());

    // Category matching (by name or slug)
    const matchesCategory = !selectedCategory || 
      p.category === selectedCategory || 
      (selectedCategory === 'Services Digitaux' && (p.category === 'services-digitaux' || p.category === 'Services Digitaux'));

    // Location matching
    const matchesLocation = !selectedLocation || selectedLocation === 'Toutes' || 
      (p.location || 'Ouagadougou').toLowerCase().includes(selectedLocation.toLowerCase()) ||
      (p.city || 'Ouagadougou').toLowerCase().includes(selectedLocation.toLowerCase());

    // Price matching
    const priceVal = p.price || p.startingPrice || 0;
    const matchesMinPrice = !minPrice || priceVal >= Number(minPrice);
    const matchesMaxPrice = !maxPrice || priceVal <= Number(maxPrice);

    return matchesSearch && matchesCategory && matchesLocation && matchesMinPrice && matchesMaxPrice;
  });

  // Featured WAGA Picks (4 products)
  const wagaPicks = products.slice(0, 4);

  const activeCategoryObj = CATEGORIES.find(c => c.name === selectedCategory || c.slug === selectedCategory);

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="space-y-8 pb-12 relative"
    >
      {/* Pull To Refresh Mobile Indicator */}
      <div 
        className="overflow-hidden transition-all duration-200 flex items-center justify-center pointer-events-none"
        style={{ 
          height: isRefreshing ? `${PULL_THRESHOLD}px` : `${pullDistance}px`, 
          opacity: isRefreshing ? 1 : Math.min(1, pullDistance / (PULL_THRESHOLD * 0.5)) 
        }}
      >
        <div className="flex items-center gap-2 py-2 px-4 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-md">
          {isRefreshing ? (
            <>
              <Loader2 size={16} className="animate-spin text-red-600 dark:text-red-500" />
              <span>{t('refreshing')}</span>
            </>
          ) : pullDistance >= PULL_THRESHOLD ? (
            <>
              <RefreshCw size={16} className="text-red-600 dark:text-red-500 animate-spin" />
              <span>{t('releaseToRefresh')}</span>
            </>
          ) : (
            <>
              <ArrowDown 
                size={16} 
                className="text-slate-500 transition-transform duration-200" 
                style={{ transform: `rotate(${Math.min(180, (pullDistance / PULL_THRESHOLD) * 180)}deg)` }} 
              />
              <span>{t('pullToRefresh')}</span>
            </>
          )}
        </div>
      </div>

      {/* RECENTLY VIEWED (VUS RECEMMENT) */}
      {recentProducts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white mb-4 px-1">
            <Clock size={20} className="text-red-600" />
            Vus récemment
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
            {recentProducts.map(product => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="w-32 sm:w-40 shrink-0 group block bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all"
              >
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  {product.imageUrls?.[0] ? (
                    <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <span className="text-[8px] font-bold uppercase tracking-widest opacity-50">Sans Image</span>
                    </div>
                  )}
                </div>
                <div className="p-2 sm:p-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-[10px] sm:text-xs line-clamp-1 group-hover:text-red-600 transition-colors">{product.name}</h4>
                  <p className="font-black text-red-600 dark:text-red-500 text-xs sm:text-sm mt-1">{formatPrice(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* PLANS OFFER BANNER */}
      <div className="px-1 mb-6">
        <button 
          onClick={() => document.getElementById('plans-offer')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-blue-600 rounded-xl p-2.5 sm:p-3 flex items-center justify-between text-white shadow-md hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-white/90 mb-0.5">{language === 'FR' ? 'Vendez sur Waga Shop' : 'Sell on Waga Shop'}</p>
              <p className="font-bold text-xs sm:text-sm leading-tight">{language === 'FR' ? 'Découvrez nos offres et plans' : 'Discover our offers & plans'}</p>
            </div>
          </div>
          <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-colors">
            <ArrowDown size={14} />
          </div>
        </button>
      </div>

      {/* BUYER TOP BAR: Search + Voice Search + Location Badge + Filter Trigger */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar Input with Voice Search */}
          <div className="relative flex-1 group transition-all duration-300 ease-out focus-within:flex-[1.8] sm:focus-within:flex-[2.5]">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--color-waga-neon)] transition-colors duration-300">
              <SearchIcon size={18} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isListening ? t('voiceSearchListening') : t('searchPlaceholderHome')}
              className={`w-full bg-white dark:bg-slate-900 border rounded-2xl py-3.5 pl-11 pr-20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none waga-neon-focus transition-all duration-300 shadow-sm ${
                isListening ? 'border-red-400 ring-2 ring-red-400/50' : 'border-slate-200 dark:border-white/10'
              }`}
            />
            
            <div className="absolute inset-y-0 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleVoiceSearch}
                title="Recherche vocale"
                className={`p-1.5 rounded-xl transition-all ${
                  isListening ? 'bg-red-500 text-slate-950 animate-bounce' : 'text-slate-400 hover:text-red-400'
                }`}
              >
                <Mic size={18} />
              </button>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Location Badge + Filter Button */}
          <div className="flex items-center gap-2">
            {/* Location Selector Pill */}
            <div className="flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm shrink-0">
              <MapPin size={15} className="text-red-600 shrink-0" />
              <select 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-transparent outline-none font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="Toutes" className="dark:bg-slate-900 text-slate-900 dark:text-white">{t('allLocations')}</option>
                {BURKINA_CITIES.map(c => (
                  <option key={c} value={c} className="dark:bg-slate-900 text-slate-900 dark:text-white">{c}</option>
                ))}
              </select>
            </div>

            {/* Filter Modal Trigger */}
            <button
              onClick={() => setShowFilterModal(true)}
              className={`p-3 rounded-2xl border flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                minPrice || maxPrice || (selectedLocation && selectedLocation !== 'Toutes')
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-red-500'
              }`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">{t('filters')}</span>
            </button>
          </div>
        </div>

        {/* 22 HORIZONTAL SCROLL CATEGORIES */}
        <div className="relative">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x touch-pan-x">
            {/* "All" Category Pill */}
            <button
              onClick={() => setSelectedCategory(null)}
              className={`snap-start shrink-0 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
                selectedCategory === null
                  ? 'bg-red-600 text-white border-transparent shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:border-red-500'
              }`}
            >
              <span>🔥</span> {t('all')} ({products.length})
            </button>

            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.name || selectedCategory === cat.slug;
              const count = products.filter(p => p.category === cat.name || p.category === cat.slug).length;
              const translatedName = getCategoryTranslation(cat, t);

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isActive ? null : cat.name)}
                  className={`snap-start shrink-0 px-4 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all flex items-center gap-2 border ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-transparent shadow-[0_0_15px_rgba(225,29,72,0.4)] scale-105'
                      : cat.name === 'Services Digitaux'
                      ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40 hover:border-red-500'
                      : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-white/10 hover:border-red-500'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{translatedName}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Digital Services Dedicated Category Banner when selected */}
        {selectedCategory === 'Services Digitaux' && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💻</span>
              <div>
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
                  {t('digitalServicesHeader')}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                  {t('digitalServicesDesc')}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-red-600 dark:text-red-500 font-bold hover:underline shrink-0"
            >
              {t('viewAll')}
            </button>
          </div>
        )}
      </div>

      {/* Welcoming & Hero Banner (shown when no specific category filter is active) - Compact & Elegant */}
      {!selectedCategory && !searchTerm && (
        <section className="relative overflow-hidden rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-red-700 via-rose-800 to-zinc-950 text-white border border-red-600/40 shadow-md">
          <div className="relative z-10 max-w-2xl space-y-2.5">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-600/30 border border-blue-400/40 text-blue-100 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm backdrop-blur-md">
                <Sparkles size={11} className="text-blue-300" />
                {t('welcomeBadge')}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-black/25 border border-white/20 text-red-100 text-[10px] font-semibold uppercase tracking-wider rounded-full backdrop-blur-md">
                {t('launchOffer')} {t('freeUntil')}
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug text-white">
              {t('heroTitle')}
            </h1>
            
            <p className="text-xs sm:text-sm font-medium text-red-100/90 leading-normal max-w-xl">
              {t('welcomeTagline')}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1.5">
              <Link 
                to="/seller/add-product" 
                className="inline-flex items-center justify-center gap-1.5 bg-white text-red-600 font-bold py-2 px-4 rounded-xl hover:bg-red-50 transition-all shadow-md text-xs uppercase tracking-wider active:scale-98"
              >
                <Store size={14} />
                <span>{t('becomeSellerFree')}</span>
                <ArrowRight size={13} />
              </Link>

              <a 
                href="#waga-picks-section" 
                className="inline-flex items-center justify-center gap-1.5 bg-black/30 hover:bg-black/40 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-sm text-xs uppercase tracking-wider border border-white/20 backdrop-blur-md"
              >
                <ShoppingBag size={14} />
                <span>{t('exploreMarket')}</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </div>

          <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none text-white">
            <Zap size={150} />
          </div>
        </section>
      )}

      {/* WAGA PICKS FEATURED SECTION */}
      {!selectedCategory && !searchTerm && wagaPicks.length > 0 && (
        <section id="waga-picks-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider flex items-center gap-2 text-zinc-900 dark:text-white">
              <Sparkles size={22} className="text-red-600 dark:text-red-600 animate-pulse" />
              <span>{t('wagaPicks')}</span>
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-full border border-red-200 dark:border-red-800">
              {t('premiumSelection')}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wagaPicks.map((product) => (
              <div key={product.id} className="relative group">
                {/* Red "✨ WAGA Pick" Badge */}
                <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-[9px] uppercase tracking-wider px-2 py-1 rounded-md shadow-lg flex items-center gap-1 border border-red-500">
                  <Award size={11} /> ✨ WAGA Pick
                </div>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ALL PRODUCTS SECTION */}
      <section id="products-section" className="scroll-mt-24 space-y-4">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-slate-900 dark:text-slate-100">
              {selectedCategory ? (
                <>
                  {activeCategoryObj?.icon} <span className="font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-600 dark:from-red-500 dark:to-red-500">{selectedCategory}</span>
                </>
              ) : (
                <>
                  {t('trending')} <span className="font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-600 dark:from-red-500 dark:to-red-500">{t('current')}</span>
                </>
              )}
            </h2>
            {selectedLocation && selectedLocation !== 'Toutes' && (
              <p className="text-xs text-red-600 dark:text-red-500 font-bold mt-1">📍 {t('availableIn')} {selectedLocation}</p>
            )}
          </div>
          <span className="text-[10px] uppercase text-red-600 dark:text-red-500 font-bold tracking-widest">
            {filteredProducts.length} {t('articles')}
          </span>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <ProductSkeletonCard key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm p-6 flex flex-col items-center justify-center">
            <div className="w-24 h-24 mb-6 relative">
              <div className="absolute inset-0 bg-red-100 dark:bg-red-950/20 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-0 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center">
                <SearchIcon size={32} className="text-red-600" />
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
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md active:scale-95"
            >
              Browse all categories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* LAUNCH OFFER DETAILED SECTION */}
      <section id="plans-offer" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="text-center max-w-2xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-600/20 text-red-600 dark:text-red-500 font-bold text-xs uppercase tracking-widest mb-4">
            <Sparkles size={14} /> {language === 'FR' ? 'Offre de Lancement' : 'Launch Offer'}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-4 leading-tight">
            {language === 'FR' ? 'Vendez sans limites aujourd\'hui.' : 'Sell without limits today.'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-6">
            {language === 'FR' 
              ? 'Pendant notre période de lancement, publiez un nombre illimité d\'articles 100% gratuitement. Bientôt, le plan gratuit sera limité à 5 articles et vos articles excédentaires seront mis en pause.'
              : 'During our launch period, publish an unlimited number of items 100% free. Soon, the free plan will be limited to 5 items and your excess items will be paused.'}
          </p>
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl text-left">
            <h4 className="text-red-700 dark:text-red-400 font-bold text-sm flex items-center gap-2 mb-2">
              🎁 {language === 'FR' ? 'Offre exclusive aux pionniers' : 'Exclusive early bird offer'}
            </h4>
            <p className="text-red-600 dark:text-red-300 text-sm">
              {language === 'FR'
                ? 'Les vendeurs qui s\'inscrivent et publient leurs produits MAINTENANT recevront une réduction VIP à vie (-50%) sur les futurs plans payants pour tout débloquer. N\'attendez pas !'
                : 'Sellers who sign up and publish products NOW will receive a lifetime VIP discount (-50%) on future paid plans to unlock everything. Do not wait!'}
            </p>
          </div>

          <button 
            onClick={() => setShowPlansGrid(!showPlansGrid)}
            className="mt-8 mb-4 inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider hover:scale-105 transition-transform shadow-md"
          >
            {showPlansGrid ? (language === 'FR' ? 'Masquer les plans' : 'Hide plans') : (language === 'FR' ? 'Voir tous les plans' : 'View all plans')}
            <ArrowDown className={`transition-transform duration-300 ${showPlansGrid ? 'rotate-180' : ''}`} size={16} />
          </button>
        </div>

        <AnimatePresence>
          {showPlansGrid && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 pt-4 pb-2">
          {/* PIONEER PLAN (NEW) */}
          <div className="bg-gradient-to-b from-red-50 to-white dark:from-red-600/10 dark:to-zinc-800/50 rounded-3xl p-6 border border-indigo-200 dark:border-red-600/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black tracking-widest uppercase py-1 px-3 rounded-bl-xl rounded-tr-3xl">
              {language === 'FR' ? 'Actuel' : 'Current'}
            </div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-2xl">🚀</span> {language === 'FR' ? 'Pionnier' : 'Pioneer'}
            </h3>
            <p className="text-[10px] sm:text-xs font-bold text-red-600 dark:text-red-500 uppercase tracking-widest mb-6">
              {language === 'FR' ? "ILLIMITÉ JUSQU'EN SEPT. 2028" : 'UNLIMITED TILL SEPT. 2028'}
            </p>
            
            <ul className="space-y-3 mb-8">
              {(language === 'FR' ? [
                'Produits illimités', 'Remise VIP à vie (-50%)', 'Recevez des clients sans limite', 'Création de boutique gratuite', 'Badge Pionnier'
              ] : [
                'Unlimited products', 'Lifetime VIP discount (-50%)', 'Unlimited customers', 'Free shop creation', 'Pioneer Badge'
              ]).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium">
                  <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <Link to="/seller/signup" className="block w-full py-3 rounded-xl bg-red-600 hover:bg-rose-700 text-white font-bold text-sm text-center transition-colors shadow-md shadow-red-600/20">
              {language === 'FR' ? 'Créer ma boutique' : 'Create my shop'}
            </Link>
          </div>

          {/* FREE PLAN */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-6 border border-zinc-200 dark:border-white/10 opacity-70">
            <h3 className="text-xl font-black text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-2">
              <span className="text-2xl opacity-50">🆓</span> {language === 'FR' ? 'Gratuit' : 'Free'}
            </h3>
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">0 FCFA / {language === 'FR' ? 'mois' : 'mo'}</p>
            
            <ul className="space-y-3">
              {(language === 'FR' ? [
                'Jusqu\'à 5 produits actifs', 'Recevez des clients sans limite', 'Contact direct via WhatsApp', 'Création de boutique gratuite', 'Partage de produits facile'
              ] : [
                'Up to 5 active products', 'Unlimited customers', 'Direct WhatsApp contact', 'Free shop creation', 'Easy product sharing'
              ]).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  <Check size={16} className="text-zinc-300 dark:text-zinc-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 py-3 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 font-bold text-[10px] sm:text-xs text-center uppercase tracking-wider">
              {language === 'FR' ? 'À partir de Sept. 2028' : 'From Sept. 2028'}
            </div>
          </div>

          {/* BASIC PLAN */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-6 border border-zinc-200 dark:border-white/10 opacity-70">
            <h3 className="text-xl font-black text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-2">
              <span className="text-2xl opacity-50">⭐</span> Basic
            </h3>
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">5 000 FCFA / {language === 'FR' ? 'mois' : 'mo'}</p>
            
            <ul className="space-y-3">
              {(language === 'FR' ? [
                'Jusqu\'à 25 produits actifs', 'Visibilité augmentée', 'Statistiques de la boutique', 'Outils promotionnels', 'Badge vendeur vérifié'
              ] : [
                'Up to 25 active products', 'Increased visibility', 'Shop statistics', 'Promotional tools', 'Verified seller badge'
              ]).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  <Check size={16} className="text-zinc-300 dark:text-zinc-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 py-3 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 font-bold text-sm text-center">
              {language === 'FR' ? 'Payant à partir de Septembre 2028' : 'Paid from September 2028'}
            </div>
          </div>

          {/* PRO PLAN */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-6 border border-zinc-200 dark:border-white/10 opacity-70">
            <h3 className="text-xl font-black text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-2">
              <span className="text-2xl opacity-50">👑</span> Pro
            </h3>
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">10 000 FCFA / {language === 'FR' ? 'mois' : 'mo'}</p>
            
            <ul className="space-y-3">
              {(language === 'FR' ? [
                'Jusqu\'à 100 produits actifs', 'Visibilité maximale (Top Position)', 'Statistiques avancées', 'Produits mis en avant', 'Personnalisation de boutique'
              ] : [
                'Up to 100 active products', 'Maximum visibility (Top)', 'Advanced statistics', 'Featured products', 'Shop customization'
              ]).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  <Check size={16} className="text-zinc-300 dark:text-zinc-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 py-3 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 font-bold text-sm text-center">
              {language === 'FR' ? 'Payant à partir de Septembre 2028' : 'Paid from September 2028'}
            </div>
          </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* PWA Install Banner */}
      <InstallBanner />

      {/* FILTER MODAL */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl text-zinc-900 dark:text-white"
            >
              <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/10 pb-4">
                <h3 className="font-black text-lg uppercase tracking-wider flex items-center gap-2">
                  <Filter size={18} className="text-red-600" /> {t('filterTitle')}
                </h3>
                <button 
                  onClick={() => setShowFilterModal(false)}
                  className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-500"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('priceRange')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">{t('minPrice')}</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-sm font-mono font-bold outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">{t('maxPrice')}</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="ex: 500000"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-sm font-mono font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Category Select */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('category')}
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-xl p-3.5 text-sm font-bold outline-none cursor-pointer"
                >
                  <option value="">{t('allCategories')} (22)</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.icon} {getCategoryTranslation(cat, t)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Select */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('location')}
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-xl p-3.5 text-sm font-bold outline-none cursor-pointer"
                >
                  <option value="Toutes">{t('allLocations')}</option>
                  {BURKINA_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    setSelectedCategory(null);
                    setSelectedLocation('Toutes');
                  }}
                  className="w-1/2 py-3.5 rounded-2xl border border-slate-300 dark:border-white/10 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  {t('clear')}
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="w-1/2 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-lg"
                >
                  {t('apply')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductCard({ product }: { product: Product; key?: React.Key }) {
  const { savedItems, toggleSaved } = useSavedStore();
  const { t } = useLanguageTheme();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const isSaved = savedItems.some(item => item.id === product.id);
  const isDigital = product.category === 'Services Digitaux' || product.category === 'services-digitaux';

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
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500 text-xs uppercase tracking-widest font-semibold">{t('noImage')}</div>
            )}

            {/* Category or Digital Badge */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center pointer-events-none">
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-900/90 dark:bg-black/90 text-white border border-white/10 truncate max-w-[80%] shadow-xs">
                {product.category}
              </span>
              {isDigital && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-600 text-white shadow-xs">
                  Pro
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col flex-1 gap-1">
            <h4 className="text-sm font-bold truncate text-zinc-900 dark:text-zinc-100">{product.name}</h4>

            <div className="flex items-center justify-between gap-1 mt-auto pt-1 overflow-hidden">
              <span className="font-mono text-xs font-black text-red-600 dark:text-red-500 shrink-0">
                {formatPrice(product.price)}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-0.5 min-w-0">
                <MapPin size={10} className="text-red-600 shrink-0" />
                <span className="truncate">{product.location || 'Ouaga'}</span>
              </span>
            </div>

            {/* Quick WhatsApp Contact Button */}
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

      <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleSaved(product);
          }}
          className="w-8 h-8 rounded-full bg-white/95 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-center border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shadow-sm opacity-90 sm:opacity-0 group-hover:opacity-100 text-zinc-700 dark:text-zinc-300"
        >
          <Heart size={14} className={isSaved ? "fill-red-600 text-red-600" : "text-zinc-400 dark:text-zinc-400"} />
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsShareOpen(true);
          }}
          className="w-8 h-8 rounded-full bg-white/95 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-center border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shadow-sm opacity-90 sm:opacity-0 group-hover:opacity-100 text-zinc-700 dark:text-zinc-300"
        >
          <Share2 size={14} className="text-zinc-700 dark:text-zinc-300" />
        </button>
      </div>

      <ProductShareModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        product={product}
      />
    </div>
  );
}

export function ProductSkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-3.5 flex flex-col gap-3 border border-slate-200 dark:border-white/10 shadow-md">
      {/* Aspect Square Image Skeleton */}
      <div className="w-full aspect-square rounded-xl overflow-hidden shimmer-bg relative border border-slate-200/60 dark:border-white/5">
        <div className="absolute bottom-2 left-2 w-16 h-4 rounded-md shimmer-bg opacity-70" />
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-col flex-1 gap-2 mt-1">
        {/* Title skeleton */}
        <div className="h-4 w-3/4 rounded-md shimmer-bg" />

        {/* Price & Location row */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <div className="h-3.5 w-16 rounded-md shimmer-bg" />
          <div className="h-3.5 w-12 rounded-md shimmer-bg" />
        </div>

        {/* Button skeleton */}
        <div className="w-full mt-2 h-8 rounded-xl shimmer-bg" />
      </div>
    </div>
  );
}




