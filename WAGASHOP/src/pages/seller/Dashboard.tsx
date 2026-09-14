import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Product } from '../../types';
import { removeProductFromCache } from '../../lib/productCache';
import { Store, Plus, Settings, LogOut, TrendingUp, Package, Eye, CheckCircle2, MapPin, Loader2, Share2, Hourglass, Rocket } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { signOut } from 'firebase/auth';
import { ShareBar } from '../../components/ShareBar';
import { ProductShareModal } from '../../components/ProductShareModal';
import { NotificationBanner, NotificationState } from '../../components/NotificationBanner';
import { BURKINA_CITIES } from '../../constants/cities';
import { useLanguageTheme } from '../../context/LanguageThemeContext';

export default function SellerDashboard() {
  const { user, sellerProfile, loading, refreshProfile } = useAuth();
  const { language, t } = useLanguageTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const uid = user?.uid;
      if (!uid) return [];
      const cached = localStorage.getItem(`waga_cached_seller_prods_${uid}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [fetching, setFetching] = useState(() => {
    try {
      const uid = user?.uid;
      if (!uid) return true;
      const cached = localStorage.getItem(`waga_cached_seller_prods_${uid}`);
      return !cached;
    } catch {
      return true;
    }
  });
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [selectedCity, setSelectedCity] = useState(BURKINA_CITIES[0]);
  const [updatingCity, setUpdatingCity] = useState(false);
  const [shareModalProduct, setShareModalProduct] = useState<Product | null>(null);

  const handleUpdateCity = async () => {
    if (!user || !sellerProfile) return;
    setUpdatingCity(true);
    try {
      await updateDoc(doc(db, 'sellers', user.uid), {
        city: selectedCity
      });

      // Update existing products to have this city
      const q = query(collection(db, 'products'), where('sellerId', '==', user.uid));
      const snapshot = await getDocs(q);
      const updatePromises = snapshot.docs.map(productDoc => 
        updateDoc(doc(db, 'products', productDoc.id), {
          city: selectedCity,
          location: productDoc.data().location || selectedCity
        })
      );
      await Promise.all(updatePromises);

      await refreshProfile();
      setNotification({
        type: 'success',
        title: language === 'FR' ? 'Ville mise à jour' : 'City Updated',
        message: language === 'FR' ? 'Votre localisation a été enregistrée avec succès.' : 'Your location has been saved successfully.'
      });
    } catch (error) {
      console.error(error);
      setNotification({
        type: 'error',
        title: 'Erreur',
        message: language === 'FR' ? 'Impossible de mettre à jour la ville.' : 'Could not update city.'
      });
    } finally {
      setUpdatingCity(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/seller/login');
    }
  }, [user, loading, navigate]);

  // Check for incoming alerts from AddProduct or login redirect
  useEffect(() => {
    if (location.state?.notification) {
      setNotification(location.state.notification);
    } else if (searchParams.get('action') === 'product_added') {
      const name = searchParams.get('name') || 'Produit';
      const productId = searchParams.get('productId');
      setNotification({
        type: 'success',
        title: 'Produit publié avec succès !',
        message: `Votre article "${name}" est désormais visible sur WAGA SHOP.`,
      });
      // Optionally show the share modal if we can find the product
      if (productId) {
        // Find it in local state or it will be set when fetchProducts finishes
        const prod = products.find(p => p.id === productId);
        if (prod) setShareModalProduct(prod);
      }
    } else if (searchParams.get('login_error')) {
      setNotification({
        type: 'error',
        title: 'Erreur de Connexion',
        message: 'Échec de l\'authentification. Veuillez réessayer.',
      });
    }
  }, [location, searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;
      let fetched: Product[] = [];
      let fetchSucceeded = false;
      try {
        const q = query(collection(db, 'products'), where('sellerId', '==', user.uid));
        const snapshot = await getDocs(q);
        fetched = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) })) as Product[];
fetched.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        fetchSucceeded = true;
      } catch (error) {
        console.error("Error fetching products:", error);
      }

      if (!fetchSucceeded && user) {
        try {
          const cached = localStorage.getItem(`waga_cached_seller_prods_${user.uid}`);
          if (cached) {
            fetched = JSON.parse(cached);
fetched.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          }
        } catch {}
      }

      // Merge local offline products for this seller
      try {
        const localOffline: Product[] = JSON.parse(localStorage.getItem('waga_offline_products') || '[]');
        const sellerLocals = localOffline.filter(p => p.sellerId === user.uid);
        const existingIds = new Set(fetched.map(p => p.id));
        const newLocals = sellerLocals.filter(p => !existingIds.has(p.id));
        fetched = [...newLocals, ...fetched];
      } catch {}

      if (fetched.length > 0 || fetchSucceeded) {
        setProducts(fetched);
      }
      if (user && fetchSucceeded && fetched.length > 0) {
        try {
          localStorage.setItem(`waga_cached_seller_prods_${user.uid}`, JSON.stringify(fetched));
        } catch {}
      }
      
      // Check if we need to show the share modal for a newly added product
      const addedProductId = searchParams.get('productId');
      if (addedProductId && searchParams.get('action') === 'product_added') {
        const addedProduct = fetched.find(p => p.id === addedProductId);
        if (addedProduct) {
          setShareModalProduct(addedProduct);
          // Clean up the URL to prevent the modal from popping up again on reload
          window.history.replaceState({}, '', '/seller');
        }
      }
      setFetching(false);
    };
    fetchProducts();
  }, [user]);

  const handleDelete = async (productId: string, productName?: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      try {
        if (!productId.startsWith('local_')) {
          await deleteDoc(doc(db, 'products', productId));
        }
        try {
          const localOffline: Product[] = JSON.parse(localStorage.getItem('waga_offline_products') || '[]');
          const updated = localOffline.filter(p => p.id !== productId);
          localStorage.setItem('waga_offline_products', JSON.stringify(updated));
        } catch {}

        if (user) {
          try {
            const cached = JSON.parse(localStorage.getItem(`waga_cached_seller_prods_${user.uid}`) || '[]');
            localStorage.setItem(`waga_cached_seller_prods_${user.uid}`, JSON.stringify(cached.filter((p: any) => p.id !== productId)));
          } catch {}
        }
        removeProductFromCache(productId).catch(console.warn);

        setProducts(products.filter(p => p.id !== productId));
        setNotification({
          type: 'info',
          title: 'Produit Supprimé',
          message: productName ? `"${productName}" a été retiré de votre boutique.` : 'Le produit a été supprimé.',
        });
      } catch (err) {
        setNotification({
          type: 'error',
          title: 'Erreur de Suppression',
          message: 'Impossible de supprimer le produit. Veuillez réessayer.',
        });
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (loading || fetching) return <div className="text-center py-20 text-slate-500 dark:text-slate-400 text-sm">{t('loading')}</div>;
  
  if (!user) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 max-w-lg mx-auto p-8 shadow-xl">
        <Store className="mx-auto text-red-600 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{t('sellerArea')}</h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">{t('sellerLoginNotice')}</p>
        <Link to="/seller/login?mode=signup" className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-md shadow-red-600/30 text-sm uppercase tracking-wider">
          {t('loginOrCreateAccount')}
        </Link>
      </div>
    );
  }

  if (!sellerProfile) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 max-w-lg mx-auto p-8 shadow-xl space-y-4">
        <Store className="mx-auto text-red-500 mb-2 animate-bounce" size={48} />
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('profileCreationInProgress')}</h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">{t('profileCreationNotice')}</p>
        <div className="flex justify-center gap-4 pt-2">
          <Link to="/seller/login?mode=signup" className="bg-red-600 text-white font-bold py-2.5 px-6 rounded-full text-xs uppercase tracking-wider hover:bg-red-700 transition-colors">
            {t('completeProfile')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative">
      <NotificationBanner
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-neutral-900 border-2 border-slate-300 dark:border-white/10 flex items-center justify-center overflow-hidden">
            {sellerProfile.logoUrl ? (
              <img src={sellerProfile.logoUrl} alt={sellerProfile.businessName} className="w-full h-full object-cover" />
            ) : (
              <Store className="text-slate-400 dark:text-white/40" size={28} />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2 text-slate-950 dark:text-white">
              {sellerProfile.businessName}
              {sellerProfile.isVerified && <CheckCircle2 size={20} className="text-red-600" />}
            </h1>
            <p className="text-slate-700 dark:text-white/60 font-bold text-[10px] uppercase tracking-widest mt-1">
              {sellerProfile.isVerified ? (language === 'FR' ? 'Vendeur Vérifié' : 'Verified Seller') : (language === 'FR' ? 'Vendeur' : 'Seller')} • {language === 'FR' ? 'Plan Pionnier' : 'Pioneer Plan'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link to="/seller/add-product" className="bg-red-600 text-white font-bold py-2.5 px-5 rounded-full flex items-center gap-2 hover:bg-red-700 transition-colors shadow-md shadow-red-600/30 text-xs uppercase tracking-wider">
            <Plus size={18} /> {language === 'FR' ? 'Ajouter Produit' : 'Add Product'}
          </Link>
          <Link 
            to="/seller/settings" 
            title={language === 'FR' ? 'Paramètres de la boutique' : 'Shop settings'}
            className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-white transition-colors text-xs font-bold"
          >
            <Settings size={16} />
            <span className="hidden sm:inline">{language === 'FR' ? 'Paramètres' : 'Settings'}</span>
          </Link>
          <button 
            onClick={handleLogout} 
            title={language === 'FR' ? 'Déconnexion' : 'Logout'}
            className="w-10 h-10 rounded-full bg-red-600/10 text-red-600 dark:text-red-500 border border-red-600/30 flex items-center justify-center hover:bg-red-600/20 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Seller Self-Promotion Bar */}
      <ShareBar
        sellerName={sellerProfile.businessName || 'Ma Boutique'}
        sellerSlug={sellerProfile.businessName ? sellerProfile.businessName.toLowerCase().replace(/\s+/g, '-') : 'boutique'}
      />

      {/* City prompt for existing vendors */}
      {!sellerProfile.city && (
        <div className="bg-red-50 dark:bg-amber-950/30 border border-red-200 dark:border-amber-900/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <h3 className="text-amber-900 dark:text-red-300 font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-1">
                <MapPin size={16} /> 
                {language === 'FR' ? 'Complétez votre profil' : 'Complete your profile'}
              </h3>
              <p className="text-red-600 dark:text-red-500/80 text-sm font-medium">
                {language === 'FR' ? 'Veuillez sélectionner votre ville pour aider les clients à trouver vos produits près de chez eux.' : 'Please select your city to help customers find your products near them.'}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-red-300 dark:border-red-600/50 focus:border-red-500 rounded-xl p-2.5 text-zinc-900 dark:text-white outline-none appearance-none pl-10 text-sm font-medium"
                >
                  {BURKINA_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500/50" size={16} />
              </div>
              <button 
                onClick={handleUpdateCity}
                disabled={updatingCity}
                className="bg-red-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl transition-colors shadow-sm text-sm uppercase tracking-wider flex-shrink-0 min-w-[100px] flex justify-center"
              >
                {updatingCity ? <Loader2 size={16} className="animate-spin" /> : (language === 'FR' ? 'Enregistrer' : 'Save')}
              </button>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-red-500/10 to-transparent pointer-events-none" />
        </div>
      )}

      {/* URGENCY / FOUNDERS OFFER BANNER */}
      <div className="mb-8 p-5 rounded-[2rem] bg-gradient-to-r from-red-500/10 to-orange-600/10 border border-red-500/20 relative overflow-hidden shadow-sm">
        <div className="absolute -right-4 -top-4 opacity-[0.03] rotate-12">
           <Hourglass size={150} />
        </div>
        <div className="relative z-10">
          <h3 className="text-red-600 dark:text-red-400 font-black text-lg sm:text-xl mb-3 flex items-center gap-2">
            <Rocket size={22} className="text-amber-600" />
            {language === 'FR' ? 'Profitez du Lancement Illimité !' : 'Enjoy Unlimited Launch Access!'}
          </h3>
          <p className="text-sm text-amber-900/80 dark:text-amber-100/70 font-medium mb-4 leading-relaxed">
            {language === 'FR'
              ? "Actuellement, Waga Shop est en phase de lancement : vous pouvez publier un nombre illimité de produits. À la fin de cette période, le plan gratuit sera limité à 5 produits actifs (les produits supplémentaires seront mis en pause et masqués)."
              : "Currently, Waga Shop is in its launch phase: you can publish an unlimited number of products. At the end of this period, the free plan will be limited to 5 active products (additional products will be paused and hidden)."
            }
          </p>
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-red-500/10">
            <p className="text-sm text-amber-900 dark:text-amber-100 font-bold">
              <span className="text-amber-600 dark:text-red-400 uppercase tracking-widest text-xs mr-2">🎁 {language === 'FR' ? 'Avantage Pionnier' : 'Pioneer Advantage'}</span> 
              <br className="sm:hidden" />
              {language === 'FR' 
                ? "En tant que premier utilisateur, vous recevrez bientôt une offre VIP exclusive à -50% à vie pour débloquer tout votre inventaire lors de la transition. Profitez-en pour ajouter tous vos articles dès maintenant !"
                : "As an early user, you will soon receive an exclusive lifetime 50% VIP offer to unlock your entire inventory during the transition. Take advantage to add all your items now!"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900/80 p-4 rounded-2xl border-t-2 border-t-red-600 border-x border-b border-zinc-200 dark:border-white/10 relative overflow-hidden shadow-md">
          <div className="text-zinc-800 dark:text-zinc-300 font-bold mb-1 flex items-center gap-2 text-xs uppercase tracking-widest"><Package size={14}/> Produits</div>
          <div className="text-3xl font-black text-zinc-950 dark:text-white">{products.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900/80 p-4 rounded-2xl border-t-2 border-t-red-600 border-x border-b border-zinc-200 dark:border-white/10 relative overflow-hidden shadow-md">
          <div className="text-zinc-800 dark:text-zinc-300 font-bold mb-1 flex items-center gap-2 text-xs uppercase tracking-widest"><Eye size={14}/> Vues Profil</div>
          <div className="text-3xl font-black text-zinc-950 dark:text-white">---</div>
        </div>
        <div className="bg-white dark:bg-zinc-900/80 p-4 rounded-2xl border-t-2 border-t-red-600 border-x border-b border-zinc-200 dark:border-white/10 relative overflow-hidden shadow-md">
          <div className="text-zinc-800 dark:text-zinc-300 font-bold mb-1 flex items-center gap-2 text-xs uppercase tracking-widest"><TrendingUp size={14}/> Clics WA</div>
          <div className="text-3xl font-black text-zinc-950 dark:text-white">---</div>
        </div>
      </div>

      {/* Products List */}
      <div>
        <h2 className="text-2xl font-light tracking-tight mb-6 text-zinc-900 dark:text-zinc-100">Mes <span className="font-black italic text-red-600 dark:text-red-500">Produits</span></h2>
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-white/5 border-dashed shadow-sm">
            <Package size={48} className="mx-auto text-zinc-400 dark:text-zinc-500 mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400 font-medium mb-6 text-sm">Vous n'avez pas encore ajouté de produits.</p>
            <Link to="/seller/add-product" className="inline-flex bg-red-600 text-white font-bold py-3 px-6 rounded-full items-center gap-2 text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
              <Plus size={16} /> Ajouter le premier produit
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="bg-white dark:bg-zinc-900/80 p-4 rounded-2xl flex gap-4 items-center border border-zinc-200 dark:border-white/10 shadow-md">
                <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-950 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-white/5">
                  {product.imageUrls?.[0] ? (
                    <img src={product.imageUrls[0]} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Sans Img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate text-base text-zinc-900 dark:text-white">{product.name}</h3>
                  <div className="text-red-600 dark:text-red-500 font-mono text-sm mt-1">{formatPrice(product.price)}</div>
                  <div className="flex gap-2 mt-3">
                    <Link to={`/product/${product.id}`} className="text-[10px] bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-800 dark:text-white transition-colors">Voir</Link>
                    <button onClick={() => setShareModalProduct(product)} className="text-[10px] bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-800 dark:text-white transition-colors flex items-center gap-1"><Share2 size={10}/> Partager</button>
                    <button onClick={() => handleDelete(product.id, product.name)} className="text-[10px] bg-red-600/10 text-red-600 dark:text-red-500 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest hover:bg-red-600/20 transition-colors">Supprimer</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="text-center py-4 opacity-80">
        <p className="text-sm font-bold text-red-600 dark:text-red-500">
          {language === 'FR' ? "🎉 GRATUIT SANS LIMITE JUSQU'EN SEPTEMBRE 2028" : "🎉 UNLIMITEDLY FREE TILL SEPTEMBER 2028"}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          {language === 'FR' ? "Toutes les ventes se font directement sur votre WhatsApp." : "All sales are conducted directly on your WhatsApp."}
        </p>
      </div>

      {shareModalProduct && (
        <ProductShareModal 
          isOpen={true} 
          onClose={() => setShareModalProduct(null)} 
          product={shareModalProduct} 
        />
      )}
    </div>
  );
}
