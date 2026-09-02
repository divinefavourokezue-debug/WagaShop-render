import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Heart, Globe, Sun, Moon, Bell, PlusCircle, Phone, Menu, X } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { OfflineIndicator } from './OfflineIndicator';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { language, theme, toggleLanguage, toggleTheme, t } = useLanguageTheme();

  const [whatsappClicksCount, setWhatsappClicksCount] = useState<number>(0);
  const [notificationBanner, setNotificationBanner] = useState<{ title: string; body: string } | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);



  const isDark = theme === 'dark';

  // Listen for share target parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('share_target') || searchParams.get('title') || searchParams.get('text')) {
      if (location.pathname !== '/seller/add-product') {
        navigate('/seller/add-product' + location.search);
      }
    }
  }, [location.search, location.pathname, navigate]);

  // Track WhatsApp clicks and listen for push notification simulation
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const clicks = Number(localStorage.getItem('waga_whatsapp_clicks') || 0);
        setWhatsappClicksCount(clicks);

        const lastProd = localStorage.getItem('waga_last_new_product');
        if (lastProd) {
          const parsed = JSON.parse(lastProd);
          if (Date.now() - parsed.time < 10000) {
            setNotificationBanner({
              title: `🔔 ${t('newProductNotification') || 'Nouveau produit en ligne !'}`,
              body: `Nouveau produit dans "${parsed.category}": ${parsed.name}`
            });
            setTimeout(() => setNotificationBanner(null), 6000);
          }
        }
      } catch {}
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('waga_whatsapp_click', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('waga_whatsapp_click', handleStorageChange);
    };
  }, [t]);

  // Request Push Notification permission if supported
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const navItems = [
    { name: t('home'), path: '/', icon: Home },
    { name: t('search'), path: '/search', icon: Search },
    { name: t('saved'), path: '/saved', icon: Heart },
    { name: t('sell'), path: '/seller/add-product', icon: PlusCircle },
  ];

  return (
    <div className={cn(
      "min-h-screen pb-20 md:pb-0 flex flex-col font-sans transition-colors duration-300",
      isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
    )}>
      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Push Notification Banner Overlay */}
      {notificationBanner && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 max-w-sm bg-slate-900/95 text-white p-4 rounded-2xl border border-red-600/50 shadow-2xl backdrop-blur-md flex items-start gap-3 animate-slide-down">
          <Bell className="text-red-600 shrink-0 mt-0.5 animate-bounce" size={20} />
          <div className="flex-1">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-red-500">{notificationBanner.title}</h4>
            <p className="text-xs text-slate-200 mt-0.5 font-medium">{notificationBanner.body}</p>
          </div>
          <button onClick={() => setNotificationBanner(null)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
        </div>
      )}

      {/* Top Header */}
      <header className={cn(
        "sticky top-0 z-40 backdrop-blur-md border-b px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors",
        isDark ? "bg-zinc-950/90 border-white/10" : "bg-white/95 border-red-100 shadow-xs"
      )}>
        <Link to="/" className="flex items-center gap-3 group">
          {/* Artistic Emblem Badge with WhatsApp Click Counter */}
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-600 via-rose-500 to-blue-600 p-[1.5px] shadow-[0_0_15px_rgba(225,29,72,0.35)] group-hover:scale-105 transition-transform overflow-hidden">
              <div className={cn(
                "w-full h-full rounded-full flex items-center justify-center overflow-hidden p-0.5",
                isDark ? "bg-zinc-950" : "bg-white"
              )}>
                <img 
                  src="/waga-logo.png" 
                  alt="WAGA SHOP" 
                  className="w-full h-full object-cover rounded-full drop-shadow-sm" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "https://i.ibb.co/L71bdZZ/file-000000007d8081f69c0b33a9601d2c43.png";
                  }}
                />
              </div>
            </div>
            {whatsappClicksCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950 shadow-md">
                {whatsappClicksCount}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-black tracking-wider uppercase flex items-center gap-1.5 leading-none">
              <span className="text-blue-600 dark:text-blue-400 font-black">WAGA</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-red-700 italic font-black">SHOP</span>
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                {t('poweredBy')}
              </span>
            </div>
          </div>
        </Link>
        
        <div className="flex items-center gap-3 md:gap-6">
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/seller' && location.pathname.startsWith('/seller'));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all py-2 px-3.5 rounded-xl",
                    isActive 
                      ? (isDark ? "bg-red-600/20 text-red-500 border border-red-600/30" : "bg-red-600 text-white shadow-sm")
                      : (isDark ? "text-zinc-300 hover:text-white hover:bg-white/5" : "text-zinc-700 hover:text-red-600 hover:bg-red-50")
                  )}
                >
                  <item.icon size={16} className={isActive ? (isDark ? "text-red-500" : "text-white") : ""} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Quick Controls: Compact Language Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              title={language === 'FR' ? "Switch to English" : "Passer en Français"}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border cursor-pointer",
                isDark 
                  ? "bg-zinc-900 border-white/10 hover:border-red-600/50 text-zinc-300 hover:text-white" 
                  : "bg-zinc-100 border-zinc-200 hover:border-red-400 text-zinc-700 hover:text-red-700"
              )}
            >
              <Globe size={12} className="text-blue-500 dark:text-blue-400" />
              <span>{language}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto md:p-8 p-4">
        <Outlet />
      </main>

      {/* FLOATING DARK / LIGHT THEME TOGGLE (FAB) */}
      <button
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        title={isDark ? (language === 'FR' ? "Passer en mode Clair" : "Switch to Light Mode") : (language === 'FR' ? "Passer en mode Sombre" : "Switch to Dark Mode")}
        className={cn(
          "fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 flex items-center justify-center border cursor-pointer hover:scale-110 active:scale-95 group",
          isDark 
            ? "bg-zinc-900/95 border-white/15 text-amber-400 hover:text-amber-300 hover:border-amber-400/40 shadow-zinc-950/60 backdrop-blur-xl" 
            : "bg-white/95 border-zinc-200 text-slate-700 hover:text-red-600 hover:border-red-300 shadow-slate-300/80 backdrop-blur-xl"
        )}
      >
        {isDark ? (
          <Sun size={20} className="transition-transform group-hover:rotate-45" />
        ) : (
          <Moon size={20} className="transition-transform group-hover:-rotate-12" />
        )}
      </button>

      {/* Footer */}
      <footer className={cn(
        "py-6 px-4 text-center border-t text-xs transition-colors mt-auto mb-20 md:mb-0 space-y-2",
        isDark ? "border-white/5 text-zinc-400" : "border-red-100 text-zinc-700 bg-white shadow-xs"
      )}>
        <p className="font-bold tracking-wider uppercase text-[11px] flex items-center justify-center gap-1.5 text-zinc-800 dark:text-zinc-300">
          <span><span className="text-blue-600 dark:text-blue-400">WAGA</span> <span className="text-red-600 dark:text-red-500">SHOP</span></span>
          <span>•</span>
          <span className="text-blue-600 dark:text-blue-400 font-black">
            {t('poweredBy')}
          </span>
        </p>
        
        {/* Admin Support Contact Link */}
        <div className="flex justify-center items-center gap-4">
          <a
            href="https://wa.me/22666317245?text=Bonjour%20Support%20D.Vortex%20%2F%20WAGA"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-500 hover:underline bg-red-600/10 border border-red-600/20 px-3 py-1 rounded-full transition-all"
          >
            <Phone size={13} />
            <span>{t('adminContact')}</span>
          </a>
          
          <Link to="/privacy" className="text-xs font-semibold text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500 transition-colors">
            {language === 'FR' ? 'Confidentialité' : 'Privacy'}
          </Link>
        </div>

        <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">© {new Date().getFullYear()} D.Vortex. {t('allRightsReserved')}</p>
      </footer>

      {/* MOBILE NAV TOGGLE (FAB & SPEED DIAL) */}
      <div className="md:hidden fixed top-[72px] right-4 z-[60] flex flex-col items-end gap-3">
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-3 rounded-full shadow-[0_4px_20px_rgba(225,29,72,0.5)] active:scale-95 transition-transform flex items-center justify-center border-2 border-white dark:border-zinc-950 hover:scale-105"
        >
          {isMobileNavOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex flex-col gap-2 p-2.5 rounded-3xl backdrop-blur-xl border shadow-2xl",
                isDark ? "bg-zinc-950/95 border-white/10" : "bg-white/95 border-red-100"
              )}
            >
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path === '/seller' && location.pathname.startsWith('/seller'));
                const isSellBtn = item.path.includes('add-product');

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={cn(
                      "flex items-center gap-3 transition-all p-3 rounded-2xl relative",
                      isSellBtn 
                        ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md hover:scale-105 active:scale-95" 
                        : (isActive 
                            ? "bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-500" 
                            : (isDark ? "text-zinc-300 hover:bg-zinc-800" : "text-zinc-700 hover:bg-zinc-100"))
                    )}
                  >
                    <item.icon size={20} className={isActive && !isSellBtn ? "text-red-600 dark:text-red-500" : ""} />
                    <span className={cn(
                      "text-xs font-black uppercase tracking-wider pr-4",
                      isSellBtn ? "text-white" : ""
                    )}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}




