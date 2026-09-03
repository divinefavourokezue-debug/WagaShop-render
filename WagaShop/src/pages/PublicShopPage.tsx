import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Seller } from '../types';
import { formatPrice } from '../lib/utils';
import { Store, MapPin, CheckCircle2, ArrowLeft, Phone, Share2, PackageSearch, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguageTheme } from '../context/LanguageThemeContext';

export default function PublicShopPage() {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguageTheme();

  useEffect(() => {
    const fetchShop = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const sellerRef = doc(db, 'sellers', id);
        const sellerSnap = await getDoc(sellerRef);
        
        if (sellerSnap.exists()) {
          setSeller({ id: sellerSnap.id, ...sellerSnap.data() } as Seller);
          
          const q = query(
            collection(db, 'products'),
            where('sellerId', '==', id),
            where('isAvailable', '==', true)
          );
          const productsSnap = await getDocs(q);
          const fetchedProducts = productsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
          
          // Sort locally by creation date descending
          fetchedProducts.sort((a, b) => b.createdAt - a.createdAt);
          setProducts(fetchedProducts);
        }
      } catch (error) {
        console.error("Error fetching shop data:", error);
        // Fallback to cache
        try {
          const cachedProds: Product[] = JSON.parse(localStorage.getItem('waga_products_cache') || '[]');
          const shopProds = cachedProds.filter(p => p.sellerId === id);
          if (shopProds.length > 0) {
            setProducts(shopProds);
          }
        } catch {}
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${seller?.businessName} sur WAGA SHOP`,
          text: `Découvrez la boutique de ${seller?.businessName} sur WAGA SHOP!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(language === 'FR' ? 'Lien de la boutique copié !' : 'Shop link copied!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="text-center py-20 px-4">
        <Store size={48} className="mx-auto text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Boutique introuvable</h2>
        <p className="text-slate-500 mb-6">Cette boutique n'existe pas ou a été supprimée.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full font-bold">
          <ArrowLeft size={20} /> Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors mb-2">
        <ArrowLeft size={16} /> Retour
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden">
        {/* Background decorative element */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-600/10 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md overflow-hidden shrink-0">
            {seller.logoUrl ? (
              <img src={seller.logoUrl} alt={seller.businessName} className="w-full h-full object-cover" />
            ) : (
              <Store size={40} className="text-slate-400" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {seller.businessName}
                  {seller.isVerified && <CheckCircle2 size={24} className="text-red-600" />}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-1.5 text-sm font-medium">
                  <MapPin size={16} className="shrink-0" /> 
                  {seller.categories && seller.categories.length > 0 
                    ? seller.categories.join(' • ')
                    : (seller.category || 'Vendeur WAGA SHOP')}
                </p>
              </div>
              
              <button onClick={handleShare} className="shrink-0 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-full font-bold text-sm transition-colors self-start">
                <Share2 size={16} /> Partager
              </button>
            </div>
            
            <p className="mt-4 text-slate-700 dark:text-slate-300">
              {seller.shopDescription || 'Bienvenue dans ma boutique sur WAGA SHOP !'}
            </p>
            
            <div className="flex flex-wrap gap-3 mt-6">
              {seller.whatsappNumber && (
                <a href={`https://wa.me/${seller.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 px-4 py-2 rounded-full font-bold text-sm transition-colors border border-green-500/20">
                  <Phone size={16} /> WhatsApp
                </a>
              )}
              {seller.facebookUrl && (
                <a href={seller.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-red-600/10 text-red-600 dark:text-red-500 hover:bg-red-600/20 px-4 py-2 rounded-full font-bold text-sm transition-colors border border-red-600/20">
                  <Globe size={16} /> Facebook
                </a>
              )}
              {seller.instagramUrl && (
                <a href={seller.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 px-4 py-2 rounded-full font-bold text-sm transition-colors border border-pink-500/20">
                  <Globe size={16} /> Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            Tous les articles <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm px-2.5 py-0.5 rounded-full">{products.length}</span>
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
            <PackageSearch size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Aucun produit</h3>
            <p className="text-slate-500 text-sm">Cette boutique n'a pas encore ajouté de produits.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {products.map((product) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={product.id}
                className="group bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col"
              >
                <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {product.imageUrls?.[0] ? (
                    <img 
                      src={product.imageUrls[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <Store size={32} className="mb-2 opacity-50" />
                      <span className="text-xs font-bold uppercase tracking-widest opacity-50">Sans Image</span>
                    </div>
                  )}
                  {product.isFeatured && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
                      À LA UNE
                    </div>
                  )}
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base line-clamp-2 leading-snug mb-2 flex-1">
                    <Link to={`/product/${product.id}`} className="hover:text-red-600 transition-colors">
                      {product.name}
                    </Link>
                  </h3>
                  <div className="font-black text-red-600 dark:text-red-500 text-lg">
                    {formatPrice(product.price)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
