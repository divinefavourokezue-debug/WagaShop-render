import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Seller } from '../types';
import { getCachedProducts, addRecentlyViewed } from '../lib/productCache';
import { formatPrice } from '../lib/utils';
import { useSavedStore } from '../store/useSavedStore';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { useAuth } from '../components/AuthProvider';
import { MessageCircle, Heart, Share2, MapPin, CheckCircle2, HelpCircle, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareBar } from '../components/ShareBar';
import { ProductShareModal } from '../components/ProductShareModal';
import { updateDoc, increment } from 'firebase/firestore';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { isSaved, toggleSaved } = useSavedStore();
  const { t } = useLanguageTheme();

  const handleDeleteProduct = async () => {
    if (!product) return;
    if (confirm("Êtes-vous sûr de vouloir supprimer cet article ? Cette action est définitive.")) {
      try {
        if (!product.id.startsWith('local_')) {
          await deleteDoc(doc(db, 'products', product.id));
        }
        try {
          const localOffline: Product[] = JSON.parse(localStorage.getItem('waga_offline_products') || '[]');
          const updated = localOffline.filter(p => p.id !== product.id);
          localStorage.setItem('waga_offline_products', JSON.stringify(updated));
        } catch {}

        navigate('/seller?action=product_deleted');
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Erreur lors de la suppression de l'article.");
      }
    }
  };

  useEffect(() => {
    const fetchProductAndSeller = async () => {
      if (!id) return;

      // 1. Instantly check cached products (offline-first, zero waiting)
      let foundInCache: Product | null = null;
      try {
        const cachedList = await getCachedProducts();
        const match = cachedList.find(p => p.id === id);
        if (match) {
          foundInCache = match;
          setProduct(match);
          setLoading(false);
          addRecentlyViewed(match);

          // Populate similar products from cache immediately
          if (match.category) {
            const similar = cachedList
              .filter(p => p.category === match.category && p.id !== match.id)
              .slice(0, 4);
            setSimilarProducts(similar);
          }
        }
      } catch {}

      // If offline and we found the product in cache, we're done!
      if (typeof navigator !== 'undefined' && !navigator.onLine && foundInCache) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(productData);
          setLoading(false);
          
          // Increment views
          if (!productData.id.startsWith('local_')) {
            updateDoc(docRef, { views: increment(1) }).catch(console.error);
          }
          
          // Fetch similar products in the same category
          if (productData.category) {
            try {
              const q = query(
                collection(db, 'products'),
                where('category', '==', productData.category),
                where('isAvailable', '==', true),
                limit(5)
              );
              const similarSnap = await getDocs(q);
              const similar = similarSnap.docs
                .map(d => ({ id: d.id, ...d.data() } as Product))
                .filter(p => p.id !== productData.id);
              setSimilarProducts(similar);
            } catch (err) {
              console.error("Error fetching similar products:", err);
            }
          }
          
          // Safely add to recently viewed without deleting products cache!
          addRecentlyViewed(productData);
          
          if (productData.sellerId) {
            try {
              const sellerRef = doc(db, 'sellers', productData.sellerId);
              const sellerSnap = await getDoc(sellerRef);
              if (sellerSnap.exists()) {
                setSeller({ id: sellerSnap.id, ...sellerSnap.data() } as Seller);
              }
            } catch {}
          }
        }
      } catch (error) {
        console.warn("Network fetch failed in product page, using cache if available:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndSeller();
  }, [id]);

  if (loading) {
    return <div className="animate-pulse h-96 glass rounded-[2.5rem]"></div>;
  }

  if (!product) {
    return <div className="text-center py-20 text-white/40">Produit introuvable.</div>;
  }

  const images = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [];

  const handleNext = () => {
    if (images.length <= 1) return;
    setActiveImage((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    if (images.length <= 1) return;
    setActiveImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const getWhatsAppLink = (isBargain = false) => {
    if (!seller?.whatsappNumber) return '#';
    let text = `Bonjour, je suis intéressé par *${product.name}* (${formatPrice(product.price)}) sur WAGA SHOP.`;
    if (isBargain) {
      text = `Bonjour, pouvons-nous discuter du prix de *${product.name}* (${formatPrice(product.price)}) sur WAGA SHOP ?`;
    }
    const cleanNumber = seller.whatsappNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
  };

  const getShareWhatsAppUrl = () => {
    const message = `Découvre cet article sur WAGA SHOP : *${product.name}* au prix de *${formatPrice(product.price)}* !\n\nRegarde l'offre ici : ${window.location.href}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  };

  const supportWhatsAppUrl = `https://wa.me/22666317245?text=${encodeURIComponent(`Hi WAGA Support from D VORTEX, I need help with product "${product.name}"`)}`;

  const isMediaVideo = (url: string) => {
    if (!url) return false;
    return url.startsWith('data:video') || url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
  };

    const phone = (product?.whatsappNumber || '22666317245').replace(/[^0-9]/g, '');
  const message = encodeURIComponent(`Bonjour, je suis intéressé par votre annonce sur WAGA SHOP: ${product?.name} (${product ? formatPrice(product.price) : ''})`);
  const whatsappUrl = `https://wa.me/${phone}?text=${message}`;

  return (
    <div className="grid lg:grid-cols-2 gap-8 pb-32 md:pb-0 max-w-6xl mx-auto">
      {/* Image Gallery & Carousel */}
      <div className="space-y-4">
        <div className="aspect-square bg-zinc-100 dark:bg-zinc-950 rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-white/10 relative shadow-lg dark:shadow-2xl group select-none touch-pan-y flex items-center justify-center">
          {images.length > 0 ? (
            <AnimatePresence mode="wait">
              {isMediaVideo(images[activeImage]) ? (
                <video 
                  key={activeImage}
                  src={images[activeImage]} 
                  controls 
                  autoPlay 
                  loop
                  className="w-full h-full object-contain" 
                />
              ) : (
                <motion.img 
                  key={activeImage}
                  src={images[activeImage]} 
                  alt={`${product.name} - ${activeImage + 1}`} 
                  onClick={() => setIsLightboxOpen(true)}
                  className="w-full h-full object-contain cursor-grab active:cursor-grabbing cursor-zoom-in"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  drag={images.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold || offset.x < -50) {
                      handleNext();
                    } else if (swipe > swipeConfidenceThreshold || offset.x > 50) {
                      handlePrev();
                    }
                  }}
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              )}
            </AnimatePresence>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-400 dark:text-white/20 text-sm uppercase tracking-widest font-bold">Sans Image</div>
          )}
          
          {/* Controls & Indicators */}
          {images.length > 1 && (
            <>
              {/* Previous Button */}
              <button 
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 text-zinc-900 dark:text-white flex items-center justify-center backdrop-blur-md border border-zinc-200 dark:border-white/20 hover:bg-white dark:hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 shadow-md z-10"
              >
                <ChevronLeft size={24} />
              </button>
              
              {/* Next Button */}
              <button 
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 text-zinc-900 dark:text-white flex items-center justify-center backdrop-blur-md border border-zinc-200 dark:border-white/20 hover:bg-white dark:hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 shadow-md z-10"
              >
                <ChevronRight size={24} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/60 dark:bg-black/40 backdrop-blur-md border border-white/10 z-10">
                {images.map((_, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`h-1.5 rounded-full transition-all ${activeImage === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
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
                className={`w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer snap-start ${
                  activeImage === idx ? 'border-red-600 scale-105 shadow-md shadow-red-600/20' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-500 text-xs font-black uppercase tracking-widest border border-red-200 dark:border-red-600/20">
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
            <span className="text-5xl font-black text-red-600 dark:text-red-500 tracking-tighter">
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
            className="w-full py-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-2xl font-black text-lg sm:text-xl uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-600/20 hover:shadow-rose-400/40 hover:-translate-y-1"
          >
            <MessageCircle size={24} />
            {t('buyNow')}
          </a>
          
          <div className="flex gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-4 border border-blue-500/30 dark:border-blue-500/30 rounded-2xl bargain-btn text-xl tracking-wide hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all text-center text-blue-600 dark:text-blue-400 font-semibold"
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
                  className="absolute inset-0 bg-red-500/50 rounded-full" 
                />
              )}
              <Heart size={20} className={isSaved(product.id) ? "fill-red-600 text-red-600 relative z-10" : "text-zinc-500 dark:text-white relative z-10"} />
            </motion.button>

            <button
              onClick={handleShare}
              className="w-16 h-16 border border-zinc-300 dark:border-white/10 rounded-2xl flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/5 transition-all text-zinc-700 dark:text-white"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* 5-Button Share Bar */}
        <ShareBar
          sellerName={seller?.businessName || 'Vendeur WAGA'}
          title={product.name}
          url={window.location.href}
        />

        {/* Seller Info */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
          <Link to={`/shop/${seller?.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            {seller?.logoUrl ? (
              <img src={seller.logoUrl} alt={seller.businessName} className="w-12 h-12 rounded-full object-cover bg-neutral-200 dark:bg-neutral-800" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-lg text-slate-800 dark:text-white border border-slate-300 dark:border-white/10">
                {seller?.businessName?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <h3 className="font-bold text-sm flex items-center gap-1 text-slate-900 dark:text-white">
                {seller?.businessName || t('unverifiedSeller')}
                {seller?.isVerified && <CheckCircle2 size={14} className="text-blue-500 dark:text-blue-400" />}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                Voir la boutique
              </p>
            </div>
          </Link>
          
          <div className="flex gap-2">
            <a
              href={supportWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle size={14} /> Support WAGA
            </a>
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="pt-8 mt-8 border-t border-slate-200 dark:border-white/10">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              Articles similaires
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {similarProducts.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="group block bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                    {p.imageUrls?.[0] ? (
                      <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Sans Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-1 group-hover:text-red-600 transition-colors">{p.name}</h4>
                    <p className="font-black text-red-600 dark:text-red-500 text-sm mt-1">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <ProductShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        product={product} 
      />
    </div>
  );
}

