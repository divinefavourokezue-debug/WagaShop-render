import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Globe, 
  MapPin, 
  Bell, 
  HardDrive, 
  RefreshCw, 
  Trash2, 
  Heart, 
  Store, 
  Shield, 
  Phone, 
  LogOut, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { BURKINA_CITIES } from '../constants/cities';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getCachedProducts, saveProductsCache, clearAllProductsCache } from '../lib/productCache';
import { Product } from '../types';

export default function UserSettingsPage() {
  const { user, sellerProfile } = useAuth();
  const { language, theme, toggleLanguage, toggleTheme, setLanguage, setTheme, t } = useLanguageTheme();
  const navigate = useNavigate();

  const isDark = theme === 'dark';

  // Local preferences
  const [preferredCity, setPreferredCity] = useState<string>(() => {
    return localStorage.getItem('waga_user_city') || 'Ouagadougou';
  });

  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [isRefreshingCache, setIsRefreshingCache] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  useEffect(() => {
    // Check Notification status
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Count cached items
    getCachedProducts().then(cached => {
      setCacheSize(cached.length);
    }).catch(() => setCacheSize(0));

    // Count saved favorites
    try {
      const saved = JSON.parse(localStorage.getItem('waga_saved_products') || '[]');
      setSavedCount(saved.length);
    } catch {
      setSavedCount(0);
    }
  }, []);

  const handleCityChange = (newCity: string) => {
    setPreferredCity(newCity);
    localStorage.setItem('waga_user_city', newCity);
    setStatusMessage({
      type: 'success',
      text: language === 'FR' ? `Ville définie sur ${newCity}` : `City set to ${newCity}`
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleRequestNotifications = async () => {
    if (!('Notification' in window)) {
      alert(language === 'FR' ? 'Les notifications ne sont pas supportées sur ce navigateur.' : 'Notifications not supported on this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setStatusMessage({
          type: 'success',
          text: language === 'FR' ? 'Notifications activées avec succès !' : 'Notifications enabled successfully!'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefreshCache = async () => {
    setIsRefreshingCache(true);
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      await saveProductsCache(fetched);
      setCacheSize(fetched.length);
      setStatusMessage({
        type: 'success',
        text: language === 'FR' ? `${fetched.length} articles actualisés pour consultation hors-ligne !` : `${fetched.length} products refreshed for offline viewing!`
      });
    } catch (e) {
      console.warn("Could not refresh cache:", e);
      setStatusMessage({
        type: 'info',
        text: language === 'FR' ? 'Mode hors-ligne : données en cache préservées.' : 'Offline mode: cached data preserved.'
      });
    } finally {
      setIsRefreshingCache(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleClearCache = async () => {
    if (window.confirm(language === 'FR' ? 'Voulez-vous vider le cache des articles ? Vos favoris seront conservés.' : 'Clear cached product list? Your saved items will remain.')) {
      await clearAllProductsCache();
      setCacheSize(0);
      setStatusMessage({
        type: 'info',
        text: language === 'FR' ? 'Cache nettoyé.' : 'Cache cleared.'
      });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleLogout = async () => {
    if (window.confirm(language === 'FR' ? 'Voulez-vous vraiment vous déconnecter ?' : 'Are you sure you want to sign out?')) {
      try {
        await signOut(auth);
        navigate('/');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-900 dark:text-white cursor-pointer"
            aria-label="Retour"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <SettingsIcon className="text-red-600" size={24} />
              {language === 'FR' ? 'Paramètres & Préférences' : 'Settings & Preferences'}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              {language === 'FR' ? 'Gérez votre compte, votre affichage et vos options d\'achat' : 'Manage your account, display, and shopping options'}
            </p>
          </div>
        </div>
      </div>

      {/* Status Feedback Toast */}
      {statusMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* SECTION 1: USER ACCOUNT / PROFILE CARD */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 p-6 shadow-sm overflow-hidden relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-600/20 font-black text-xl shrink-0">
              {sellerProfile?.businessName ? (
                sellerProfile.businessName.charAt(0).toUpperCase()
              ) : user?.email ? (
                user.email.charAt(0).toUpperCase()
              ) : (
                <User size={26} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-zinc-900 dark:text-white">
                  {sellerProfile?.businessName || user?.email || (language === 'FR' ? 'Utilisateur Invité' : 'Guest User')}
                </h2>
                {sellerProfile && (
                  <span className="bg-red-600/10 text-red-600 dark:text-red-400 border border-red-600/20 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    {language === 'FR' ? 'Vendeur' : 'Seller'}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {user?.email 
                  ? user.email 
                  : (language === 'FR' ? 'Connectez-vous pour synchroniser vos favoris et vos ventes' : 'Sign in to sync your favorites and sales')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-bold transition-all cursor-pointer"
              >
                <LogOut size={15} />
                <span>{language === 'FR' ? 'Déconnexion' : 'Sign Out'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  to="/seller/login"
                  className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold transition-all"
                >
                  {language === 'FR' ? 'Connexion' : 'Sign In'}
                </Link>
                <Link
                  to="/seller/signup"
                  className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-red-600/20"
                >
                  {language === 'FR' ? 'S\'inscrire' : 'Sign Up'}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* If seller: quick link to seller settings */}
        {sellerProfile && (
          <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 bg-red-50/50 dark:bg-red-950/20 -mx-6 -mb-6 p-4 px-6">
            <div className="flex items-center gap-2.5">
              <Store size={18} className="text-red-600 dark:text-red-400" />
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">
                  {language === 'FR' ? 'Espace Vendeur & Boutique' : 'Seller Space & Shop'}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {sellerProfile.businessName} • {sellerProfile.city || 'Burkina Faso'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/seller"
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                {language === 'FR' ? 'Tableau de bord' : 'Dashboard'}
              </Link>
              <Link
                to="/seller/settings"
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-1.5"
              >
                <SettingsIcon size={13} />
                <span>{language === 'FR' ? 'Paramètres Vendeur' : 'Seller Settings'}</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: APPLICATION PREFERENCES */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Globe size={16} className="text-blue-500" />
          {language === 'FR' ? 'Préférences d\'Affichage & Langue' : 'Display & Language Preferences'}
        </h3>

        {/* Language Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
          <div>
            <span className="text-sm font-bold text-zinc-900 dark:text-white block">
              {language === 'FR' ? 'Langue de l\'application' : 'Application Language'}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {language === 'FR' ? 'Choisissez Français ou English' : 'Choose French or English'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage('FR')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                language === 'FR' 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300'
              }`}
            >
              🇧🇫 Français
            </button>
            <button
              onClick={() => setLanguage('EN')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                language === 'EN' 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
          <div>
            <span className="text-sm font-bold text-zinc-900 dark:text-white block">
              {language === 'FR' ? 'Mode Visuel (Thème)' : 'Visual Theme'}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {language === 'FR' ? 'Basculez entre le mode clair et sombre' : 'Switch between light and dark mode'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isDark 
                  ? 'bg-amber-500 text-white shadow-sm' 
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300'
              }`}
            >
              <Sun size={14} />
              <span>{language === 'FR' ? 'Clair' : 'Light'}</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isDark 
                  ? 'bg-zinc-700 text-white shadow-sm' 
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300'
              }`}
            >
              <Moon size={14} />
              <span>{language === 'FR' ? 'Sombre' : 'Dark'}</span>
            </button>
          </div>
        </div>

        {/* Preferred City / Delivery Location */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-1.5">
              <MapPin size={16} className="text-red-500" />
              <span className="text-sm font-bold text-zinc-900 dark:text-white">
                {language === 'FR' ? 'Ville Principale' : 'Preferred City'}
              </span>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {language === 'FR' ? 'Filtre automatiquement les offres près de chez vous' : 'Automatically filters deals near you in Burkina Faso'}
            </span>
          </div>

          <select
            value={preferredCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-bold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
          >
            {BURKINA_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 3: NOTIFICATIONS & OFFLINE CACHE */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <HardDrive size={16} className="text-emerald-500" />
          {language === 'FR' ? 'Données & Mode Hors-Ligne' : 'Data & Offline Mode'}
        </h3>

        {/* Offline Cache Info */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <HardDrive size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {language === 'FR' ? 'Catalogue Sauvegardé Hors-Ligne' : 'Offline Cached Catalog'}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {cacheSize} {language === 'FR' ? 'produits disponibles même sans connexion internet' : 'products available even without internet'}
                </p>
              </div>
            </div>

            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              {cacheSize > 0 ? (language === 'FR' ? 'Actif' : 'Ready') : (language === 'FR' ? 'Vide' : 'Empty')}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <button
              onClick={handleRefreshCache}
              disabled={isRefreshingCache}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-all disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw size={13} className={isRefreshingCache ? 'animate-spin' : ''} />
              <span>{isRefreshingCache ? (language === 'FR' ? 'Actualisation...' : 'Updating...') : (language === 'FR' ? 'Mettre à jour le cache' : 'Update Cache')}</span>
            </button>

            {cacheSize > 0 && (
              <button
                onClick={handleClearCache}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-600 dark:text-zinc-400 hover:text-red-600 text-xs font-bold transition-all cursor-pointer"
              >
                <Trash2 size={13} />
                <span>{language === 'FR' ? 'Vider' : 'Clear'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Bell size={18} />
            </div>
            <div>
              <span className="text-sm font-bold text-zinc-900 dark:text-white block">
                {language === 'FR' ? 'Notifications Push' : 'Push Notifications'}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {notificationPermission === 'granted' 
                  ? (language === 'FR' ? 'Vous recevez les alertes de nouveaux arrivages' : 'Receiving alerts for new arrivals') 
                  : (language === 'FR' ? 'Soyez alerté dès qu\'un nouvel article est publié' : 'Get notified when new deals drop')}
              </span>
            </div>
          </div>

          {notificationPermission !== 'granted' ? (
            <button
              onClick={handleRequestNotifications}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              {language === 'FR' ? 'Activer' : 'Enable'}
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
              <CheckCircle2 size={14} />
              {language === 'FR' ? 'Activé' : 'Enabled'}
            </span>
          )}
        </div>
      </div>

      {/* SECTION 4: BECOME A SELLER CALLOUT (IF NOT SELLER) */}
      {!sellerProfile && (
        <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-3xl p-6 text-white shadow-xl shadow-red-600/20 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider">
                <Sparkles size={12} />
                {language === 'FR' ? '0% Commission' : '0% Commission'}
              </div>
              <h3 className="text-xl font-black">
                {language === 'FR' ? 'Vous vendez au Burkina Faso ?' : 'Selling in Burkina Faso?'}
              </h3>
              <p className="text-xs text-white/90 max-w-md font-medium">
                {language === 'FR' 
                  ? 'Créez votre vitrine professionnelle en 1 minute. Publiez téléphones, mode, accessoires et services digitaux avec contact WhatsApp direct.' 
                  : 'Open your shop in 1 minute. List phones, fashion, gear, and digital services with direct WhatsApp buyer contacts.'}
              </p>
            </div>

            <Link
              to="/seller/signup"
              className="px-6 py-3 rounded-2xl bg-white text-red-700 hover:bg-zinc-100 font-black text-xs uppercase tracking-wider transition-all shadow-lg text-center shrink-0"
            >
              {language === 'FR' ? 'Créer ma Boutique Gratuite' : 'Open Free Shop'}
            </Link>
          </div>
        </div>
      )}

      {/* SECTION 5: SUPPORT & POLICIES */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Shield size={16} className="text-blue-500" />
          {language === 'FR' ? 'Assistance & Légal' : 'Support & Legal'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="https://wa.me/22666317245?text=Bonjour%20Support%20D.Vortex%20%2F%20WAGA"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 hover:border-red-500/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Phone size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white block group-hover:text-red-600 transition-colors">
                  {language === 'FR' ? 'Support Admin D.Vortex' : 'D.Vortex Admin Support'}
                </span>
                <span className="text-[11px] text-zinc-500">+226 66317245</span>
              </div>
            </div>
            <ExternalLink size={14} className="text-zinc-400" />
          </a>

          <Link
            to="/privacy"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 hover:border-red-500/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Shield size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white block group-hover:text-red-600 transition-colors">
                  {language === 'FR' ? 'Politique de Confidentialité' : 'Privacy Policy'}
                </span>
                <span className="text-[11px] text-zinc-500">{language === 'FR' ? 'Protection des données' : 'Data protection'}</span>
              </div>
            </div>
            <ChevronRight size={14} className="text-zinc-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
