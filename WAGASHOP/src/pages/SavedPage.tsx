import React from 'react';
import { useSavedStore } from '../store/useSavedStore';
import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/utils';
import { Heart, MessageCircle } from 'lucide-react';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { motion } from 'framer-motion';

export default function SavedPage() {
  const { savedItems, toggleSaved } = useSavedStore();
  const { t } = useLanguageTheme();

  const handleWhatsAppClick = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    const phone = (product.whatsappNumber || '22666317245').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Bonjour, je suis intéressé par votre annonce sur WAGA SHOP: ${product.name} (${formatPrice(product.price)})`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={28} className="text-red-600 fill-red-600/20" />
        <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">{t('mySaved')} <span className="font-black italic text-red-600 dark:text-red-500">{t('savedTitle')}</span></h1>
      </div>

      {savedItems.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 bg-red-100 dark:bg-red-950/20 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-0 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center">
              <Heart size={32} className="text-red-600" />
            </div>
          </div>
          <p className="text-slate-900 dark:text-white text-lg font-black mb-2 tracking-tight">
            No saved items yet
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">
            {t('noSaved')}
          </p>
          <Link to="/" className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md active:scale-95">
            {t('browseOffers')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {savedItems.map((product) => (
            <div key={product.id} className="relative group">
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
                      <span className="font-mono text-xs font-black text-red-600 dark:text-red-500 shrink-0">{formatPrice(product.price)}</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate">{product.location || 'Ouaga'}</span>
                    </div>

                    <button
                      onClick={(e) => handleWhatsAppClick(e, product)}
                      className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500/15 dark:hover:bg-emerald-500 dark:text-emerald-400 dark:hover:text-white border border-emerald-600 dark:border-emerald-500/30 font-bold text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      {t('contactSeller')}
                    </button>
                  </div>
                </div>
              </Link>
              
              <motion.button 
                whileTap={{ scale: 0.7 }}
                whileHover={{ scale: 1.1 }}
                onClick={(e) => {
                  e.preventDefault();
                  toggleSaved(product);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/95 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-center border border-zinc-200 dark:border-white/10 z-10 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shadow-sm relative overflow-hidden group text-zinc-700 dark:text-zinc-300"
              >
                <motion.div 
                  initial={{ scale: 0, opacity: 1 }} 
                  animate={{ scale: 2, opacity: 0 }} 
                  transition={{ duration: 0.4 }} 
                  className="absolute inset-0 bg-red-500/50 rounded-full" 
                />
                <Heart size={14} className="fill-red-600 text-red-600 relative z-10" />
              </motion.button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

