import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Share2, Check, Copy } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLanguageTheme } from '../context/LanguageThemeContext';

interface ProductShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export function ProductShareModal({ isOpen, onClose, product }: ProductShareModalProps) {
  const { language } = useLanguageTheme();
  const [copied, setCopied] = useState(false);
  
  // Base URL for the product
  const baseUrl = `${window.location.origin}/product/${product.id}`;
  
  // Track share in Firestore
  const trackShare = async () => {
    try {
      const productRef = doc(db, 'products', product.id);
      const updates: any = {
        shares: increment(1),
        linkCopies: increment(1)
      };
      
      if (!product.id.startsWith('local_')) {
        await updateDoc(productRef, updates).catch(() => {});
      }
    } catch (e) {
      console.error("Error tracking share", e);
    }
  };

  const handleCopyLink = async () => {
    trackShare();
    const shareUrl = `${baseUrl}?ref=copy`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pb-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[2rem] sm:rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-zinc-100 dark:border-white/5">
            <h3 className="font-black text-lg text-zinc-900 dark:text-white flex items-center gap-2">
              <Share2 size={20} className="text-red-600" />
              {language === 'FR' ? 'Partager le produit' : 'Share Product'}
            </h3>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            {/* Product Mini Preview */}
            <div className="flex items-center gap-4 p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-white/5">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-700 shrink-0">
                {product.imageUrls?.[0] ? (
                  <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{product.name}</h4>
                <p className="text-sm font-black text-red-600 dark:text-red-500 mt-1">{formatPrice(product.price)}</p>
                {product.location && (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">{product.location}</p>
                )}
              </div>
            </div>

            {/* Link Copy Box */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {language === 'FR' ? 'Lien de partage du produit' : 'Product share link'}
              </label>
              
              <div className="flex items-center gap-2 p-2 bg-zinc-100 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="p-2 text-zinc-400">
                  <Link2 size={18} />
                </div>
                <input
                  type="text"
                  readOnly
                  value={baseUrl}
                  className="bg-transparent text-xs font-mono text-zinc-800 dark:text-zinc-200 flex-1 outline-none truncate select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                    copied
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      <span>{language === 'FR' ? 'Copié !' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>{language === 'FR' ? 'Copier' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Prominent Action Button */}
            <button
              onClick={handleCopyLink}
              className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 shadow-zinc-900/10'
              }`}
            >
              {copied ? (
                <>
                  <Check size={18} />
                  <span>{language === 'FR' ? 'Lien Copié avec Succès !' : 'Link Copied Successfully!'}</span>
                </>
              ) : (
                <>
                  <Link2 size={18} />
                  <span>{language === 'FR' ? 'Copier le Lien' : 'Copy Link'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
