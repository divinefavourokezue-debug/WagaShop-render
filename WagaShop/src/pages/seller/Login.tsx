import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Store, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { useLanguageTheme } from '../../context/LanguageThemeContext';
import { useAuth } from '../../components/AuthProvider';
import { CATEGORIES, getCategoryTranslation } from '../../constants/categories';
import { NotificationBanner, NotificationState } from '../../components/NotificationBanner';
import { BURKINA_CITIES } from '../../constants/cities';

interface SellerLoginProps {
  initialIsLogin?: boolean;
}

const PromoBanner = ({ language }: { language: string }) => {
  if (language !== 'FR') {
    return (
      <div className="lg:w-[500px] shrink-0 bg-white dark:bg-zinc-900/90 p-8 md:p-12 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
        <h2 className="text-3xl font-black text-red-600 dark:text-red-500 mb-6 tracking-tight">
          🚀 WAGA SHOP — SELL MORE, SPEND LESS!
        </h2>
        <div className="bg-red-50 dark:bg-red-600/10 border border-indigo-200 dark:border-red-600/20 p-4 rounded-2xl mb-8">
          <p className="font-bold text-rose-700 dark:text-rose-300">🎉 FREE ACCESS FOR NOW!</p>
          <p className="text-sm text-red-600 dark:text-red-500 mt-2">
            During the launch period, all sellers can create their shop and publish products for free on Waga Shop.
          </p>
        </div>

        <div className="space-y-6 mb-8 flex-1">
          <div className="space-y-2">
            <h3 className="font-black text-lg flex items-center gap-2 dark:text-white"><span className="text-2xl">🆓</span> FREE PLAN</h3>
            <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400 ml-8 list-disc">
              <li>Up to 5 active products</li>
              <li>Unlimited customers</li>
              <li>Direct WhatsApp contact</li>
              <li>Create your shop for free</li>
              <li>Share products easily</li>
            </ul>
          </div>
          
          <div className="border-t border-zinc-200 dark:border-white/10 pt-6">
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 rounded-xl mb-4">
              <p className="font-bold text-[10px] sm:text-xs text-red-600 dark:text-red-400 tracking-wider uppercase flex items-center gap-2">
                <span className="text-sm">⏳</span> PIONEER OFFER: UNLIMITED NOW
              </p>
              <p className="text-[10px] sm:text-xs text-red-700 dark:text-red-300 mt-1.5 font-medium leading-relaxed">
                The 5-product limit is not active yet! Sign up and publish without limits today to secure a lifetime <b>-50% VIP discount</b> when paid plans launch.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-white/5">
                <h4 className="font-black text-sm flex items-center gap-2 dark:text-white"><span className="text-lg">⭐</span> BASIC</h4>
                <p className="text-xs font-bold text-red-600 mt-1 mb-2">5,000 FCFA/mo</p>
                <ul className="text-[10px] space-y-1 text-slate-500 dark:text-slate-400 ml-4 list-disc">
                  <li>Up to 25 products</li>
                  <li>More visibility</li>
                  <li>Shop statistics</li>
                  <li>Promo tools</li>
                </ul>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-white/5">
                <h4 className="font-black text-sm flex items-center gap-2 dark:text-white"><span className="text-lg">👑</span> PRO</h4>
                <p className="text-xs font-bold text-red-600 mt-1 mb-2">10,000 FCFA/mo</p>
                <ul className="text-[10px] space-y-1 text-slate-500 dark:text-slate-400 ml-4 list-disc">
                  <li>Up to 100 products</li>
                  <li>Max visibility</li>
                  <li>Featured products</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto bg-zinc-900 dark:bg-black p-5 rounded-2xl text-center">
          <p className="text-white font-bold text-sm mb-1">🔥 Enjoy the free period now!</p>
          <p className="text-zinc-400 text-xs">WAGA SHOP — The digital market of Burkina Faso. 🇧🇫</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:w-[500px] shrink-0 bg-white dark:bg-zinc-900/90 p-8 md:p-12 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-center">
      <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
      <h2 className="text-3xl font-black text-red-600 dark:text-red-500 mb-6 tracking-tight leading-tight">
        🚀 WAGA SHOP — VENDEZ PLUS, DÉPENSEZ MOINS !
      </h2>
      
      <div className="bg-red-50 dark:bg-red-600/10 border border-indigo-200 dark:border-red-600/20 p-4 rounded-2xl mb-8">
        <p className="font-bold text-rose-700 dark:text-rose-300">🎉 ACCÈS GRATUIT POUR LE MOMENT !</p>
        <p className="text-sm text-red-600 dark:text-red-500 mt-2">
          Pendant la période de lancement, tous les vendeurs peuvent créer leur boutique et publier gratuitement leurs produits sur Waga Shop.
        </p>
      </div>

      <div className="space-y-6 mb-8 flex-1">
        <div className="space-y-2">
          <h3 className="font-black text-lg flex items-center gap-2 dark:text-white"><span className="text-2xl">🆓</span> PLAN GRATUIT</h3>
          <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400 ml-8 list-disc">
            <li>Jusqu'à 5 produits actifs</li>
            <li>Recevez des clients sans limite</li>
            <li>Contact direct avec vos clients via WhatsApp</li>
            <li>Créez votre boutique gratuitement</li>
            <li>Partagez facilement vos produits</li>
          </ul>
        </div>
        
        <div className="border-t border-zinc-200 dark:border-white/10 pt-6">
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 rounded-xl mb-4">
            <p className="font-bold text-[10px] sm:text-xs text-red-600 dark:text-red-400 tracking-wider uppercase flex items-center gap-2">
              <span className="text-sm">⏳</span> OFFRE PIONNIER : TOUT ILLIMITÉ MAINTENANT
            </p>
            <p className="text-[10px] sm:text-xs text-red-700 dark:text-red-300 mt-1.5 font-medium leading-relaxed">
              La limite de 5 produits du plan gratuit n'est pas encore activée ! Inscrivez-vous et publiez sans limites aujourd'hui pour sécuriser une réduction VIP de <b>-50% à vie</b> lors de la transition vers les plans payants.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-white/5">
              <h4 className="font-black text-sm flex items-center gap-2 dark:text-white"><span className="text-lg">⭐</span> BASIC</h4>
              <p className="text-xs font-bold text-red-600 mt-1 mb-2">5 000 FCFA/mois</p>
              <ul className="text-[10px] space-y-1 text-slate-500 dark:text-slate-400 ml-4 list-disc">
                <li>Jusqu'à 25 produits</li>
                <li>Plus de visibilité</li>
                <li>Stats de boutique</li>
                <li>Outils de promo</li>
              </ul>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-white/5">
              <h4 className="font-black text-sm flex items-center gap-2 dark:text-white"><span className="text-lg">👑</span> PRO</h4>
              <p className="text-xs font-bold text-red-600 mt-1 mb-2">10 000 FCFA/mois</p>
              <ul className="text-[10px] space-y-1 text-slate-500 dark:text-slate-400 ml-4 list-disc">
                <li>Jusqu'à 100 produits</li>
                <li>Visibilité renforcée</li>
                <li>Stats avancées</li>
                <li>Outils avancés</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto bg-zinc-900 dark:bg-black p-5 rounded-2xl text-center">
        <p className="text-white font-bold text-sm mb-1">🔥 Profitez-en dès maintenant !</p>
        <p className="text-zinc-400 text-[10px]">WAGA SHOP — Le marché digital du Burkina Faso. 🇧🇫</p>
      </div>
    </div>
  );
};

export default function SellerLogin({ initialIsLogin = true }: SellerLoginProps) {
  const { t, language } = useLanguageTheme();
  const { refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  
  const modeParam = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(() => {
    if (modeParam === 'signup') return false;
    if (modeParam === 'login') return true;
    return initialIsLogin;
  });

  useEffect(() => {
    if (modeParam === 'signup') setIsLogin(false);
    else if (modeParam === 'login') setIsLogin(true);
  }, [modeParam]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Onboarding fields
  const [businessName, setBusinessName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Téléphones & Accessoires']);
  const [city, setCity] = useState(BURKINA_CITIES[0]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const msg = language === 'FR' ? 'Erreur d\'authentification. Veuillez réessayer.' : 'Authentication error. Please try again.';
      setError(msg);
      setNotification({
        type: 'error',
        title: language === 'FR' ? 'Erreur de Connexion' : 'Login Error',
        message: msg,
      });
    }
  }, [searchParams, language]);

  const getFriendlyErrorMessage = (code: string, fallbackMessage: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return language === 'FR' 
          ? 'Cet email est déjà utilisé. Veuillez vous connecter.' 
          : 'This email is already in use. Please log in.';
      case 'auth/weak-password':
        return language === 'FR' 
          ? 'Le mot de passe doit contenir au moins 6 caractères.' 
          : 'Password must be at least 6 characters.';
      case 'auth/invalid-email':
        return language === 'FR' 
          ? 'Adresse email invalide.' 
          : 'Invalid email address.';
      case 'auth/operation-not-allowed':
        return language === 'FR'
          ? "L'inscription par Email/Mot de passe n'est pas activée dans votre console Firebase (Authentication > Sign-in method)."
          : 'Email/Password sign-in is not enabled in your Firebase Console (Authentication > Sign-in method).';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return language === 'FR' 
          ? 'Email ou mot de passe incorrect. (Avez-vous d\'abord créé votre boutique ?)' 
          : 'Incorrect email or password. (Have you created a shop yet?)';
      case 'auth/network-request-failed':
        return language === 'FR'
          ? 'Erreur réseau. Veuillez vérifier votre connexion internet.'
          : 'Network error. Please check your internet connection.';
      default:
        return fallbackMessage || (language === 'FR' ? 'Une erreur est survenue.' : 'An error occurred.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        refreshProfile().catch(() => {});
        navigate('/seller');
      } else {
        if (!businessName || !whatsapp) {
          throw new Error(t('shopNameWhatsappRequired'));
        }
        
        if (selectedCategories.length === 0) {
          throw new Error(language === 'FR' ? 'Veuillez sélectionner au moins 1 catégorie (jusqu\'à 5).' : 'Please select at least 1 category (up to 5).');
        }

        if (selectedCategories.length > 5) {
          throw new Error(language === 'FR' ? 'Vous pouvez sélectionner jusqu\'à 5 catégories au maximum.' : 'You can select up to 5 categories maximum.');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const isVerified = Boolean(whatsapp) && (Boolean(facebookUrl) || Boolean(instagramUrl));
        
        const newSellerData = {
          businessName,
          whatsappNumber: whatsapp,
          facebookUrl,
          instagramUrl,
          category: selectedCategories[0] || 'General',
          categories: selectedCategories,
          shopDescription: '',
          createdAt: Date.now(),
          isVerified,
          city,
        };

        await setDoc(doc(db, 'sellers', user.uid), newSellerData);
        try {
          localStorage.setItem(`waga_seller_profile_${user.uid}`, JSON.stringify({ id: user.uid, ...newSellerData }));
        } catch {}
        
        refreshProfile().catch(() => {});
        navigate('/seller');
      }
    } catch (err: any) {
      if (err.code !== 'auth/invalid-credential' && err.code !== 'auth/wrong-password' && err.code !== 'auth/user-not-found' && err.code !== 'auth/network-request-failed') {
        console.error("Auth submit error:", err);
      }
      const friendly = getFriendlyErrorMessage(err.code, err.message);
      setError(friendly);
      setNotification({
        type: 'error',
        title: isLogin 
          ? (language === 'FR' ? 'Erreur de Connexion' : 'Login Error')
          : (language === 'FR' ? 'Erreur d\'Inscription' : 'Signup Error'),
        message: friendly,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mx-auto pt-10 relative ${!isLogin ? 'max-w-6xl' : 'max-w-md'}`}>
      <NotificationBanner
        notification={notification}
        onClose={() => setNotification(null)}
      />
      <div className={`flex flex-col ${!isLogin ? 'lg:flex-row' : ''} gap-8 items-stretch`}>
        {!isLogin && <PromoBanner language={language} />}
        
        <div className={`bg-white dark:bg-zinc-900/90 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden border border-zinc-200 dark:border-white/10 shadow-2xl flex-1`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
          
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-white dark:bg-zinc-950 p-2 flex items-center justify-center border border-red-200 dark:border-red-600/30 shadow-md overflow-hidden">
              <img 
                src="/waga-logo.png" 
                alt="WAGA SHOP" 
                className="w-full h-full object-cover rounded-full" 
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://i.ibb.co/L71bdZZ/file-000000007d8081f69c0b33a9601d2c43.png";
                }}
              />
            </div>
          </div>
        
        <h1 className="text-3xl font-light tracking-tight text-center mb-2 text-zinc-900 dark:text-white">
          {isLogin ? (
            <span className="font-black italic text-red-600 dark:text-red-500">{t('welcomeBack')}</span>
          ) : (
            <span className="font-black italic text-red-600 dark:text-red-500">{t('startSellingFree')}</span>
          )}
        </h1>
        <p className="text-zinc-600 dark:text-white/40 text-center mb-10 font-medium text-sm">
          {isLogin ? t('shopTagline') : t('freeTagline')}
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-600/50 text-red-600 dark:text-red-500 p-4 rounded-2xl text-sm mb-8 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-widest">{t('businessName')} *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 focus:border-red-600 rounded-2xl p-4 text-zinc-900 dark:text-white outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-widest">{t('whatsappNum')} *</label>
                <input
                  type="tel"
                  required
                  placeholder="+226..."
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 focus:border-red-600 rounded-2xl p-4 text-zinc-900 dark:text-white outline-none transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-widest">
                  {language === 'FR' ? 'Ville' : 'City'} *
                </label>
                <div className="relative">
                  <select
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 focus:border-red-600 rounded-2xl p-4 text-zinc-900 dark:text-white outline-none transition-colors appearance-none pl-12"
                  >
                    {BURKINA_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">
                    {language === 'FR' ? 'Catégories de la boutique (1 à 5)' : 'Shop Categories (1 to 5)'} *
                  </label>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    selectedCategories.length === 5 
                      ? 'bg-red-500/15 text-amber-600 dark:text-red-400 border border-red-500/30' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}>
                    {selectedCategories.length} / 5 {language === 'FR' ? 'sélectionnée(s)' : 'selected'}
                  </span>
                </div>

                {/* Category tags grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-white/10">
                  {CATEGORIES.map(cat => {
                    const isSelected = selectedCategories.includes(cat.name);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (selectedCategories.length > 1) {
                              setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
                              setError('');
                            } else {
                              setError(language === 'FR' ? 'Veuillez sélectionner au moins 1 catégorie.' : 'Please keep at least 1 category.');
                            }
                          } else {
                            if (selectedCategories.length >= 5) {
                              setError(language === 'FR' ? 'Vous pouvez choisir au maximum 5 catégories.' : 'You can select a maximum of 5 categories.');
                              return;
                            }
                            setError('');
                            setSelectedCategories([...selectedCategories, cat.name]);
                          }
                        }}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold text-left transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-red-600/10 dark:bg-red-600/20 border-red-600 dark:border-red-600 text-red-600 dark:text-red-500 shadow-sm'
                            : selectedCategories.length >= 5
                              ? 'bg-zinc-100/50 dark:bg-zinc-900/40 border-transparent text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-50'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-base">{cat.icon}</span>
                        <span className="truncate flex-1">{getCategoryTranslation(cat, t)}</span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Pills list */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedCategories.map(catName => {
                      const catObj = CATEGORIES.find(c => c.name === catName);
                      return (
                        <span 
                          key={catName}
                          className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        >
                          {catObj?.icon} {catObj ? getCategoryTranslation(catObj, t) : catName}
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedCategories.length > 1) {
                                setSelectedCategories(selectedCategories.filter(c => c !== catName));
                                setError('');
                              } else {
                                setError(language === 'FR' ? 'Veuillez sélectionner au moins 1 catégorie.' : 'Please keep at least 1 category.');
                              }
                            }}
                            className="ml-0.5 hover:text-red-900 dark:hover:text-white font-bold cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-widest">{t('instagramUrl')}</label>
                <input
                  type="url"
                  placeholder={t('forVerifiedBadge')}
                  value={instagramUrl}
                  onChange={e => setInstagramUrl(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 focus:border-red-600 rounded-2xl p-4 text-zinc-900 dark:text-white outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-widest">{t('facebookUrl')}</label>
                <input
                  type="url"
                  placeholder={t('forVerifiedBadge')}
                  value={facebookUrl}
                  onChange={e => setFacebookUrl(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 focus:border-red-600 rounded-2xl p-4 text-zinc-900 dark:text-white outline-none transition-colors"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-widest">{t('emailLabel')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 focus:border-red-600 rounded-2xl p-4 text-zinc-900 dark:text-white outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-widest">{t('password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 focus:border-red-600 rounded-2xl p-4 text-zinc-900 dark:text-white outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xl uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-4 transition-transform active:scale-[0.98] disabled:opacity-50 mt-8 shadow-md shadow-red-600/30 cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? t('login') : t('createShop'))}
            {!loading && <ArrowRight size={24} />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-600 dark:text-white/60 hover:text-red-600 dark:hover:text-white font-bold text-[10px] uppercase tracking-widest transition-colors border-b border-transparent hover:border-red-600/30 pb-1"
          >
            {isLogin ? t('noShopCreateOne') : t('alreadyHaveShop')}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

