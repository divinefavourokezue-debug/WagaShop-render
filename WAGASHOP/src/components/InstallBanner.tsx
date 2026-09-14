import React, { useEffect, useState } from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';
import { useLanguageTheme } from '../context/LanguageThemeContext';

export const InstallBanner: React.FC = () => {
  const { t } = useLanguageTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show bottom banner after 3 seconds on homepage
      const timer = setTimeout(() => {
        const isDismissed = localStorage.getItem('waga_pwa_dismissed');
        if (!isDismissed) {
          setShowBanner(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('waga_pwa_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-lg mx-auto z-50 animate-slide-up">
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-red-600/40 shadow-[0_10px_30px_rgba(225,29,72,0.25)] backdrop-blur-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 via-rose-500 to-blue-600 p-[1.5px] shrink-0 overflow-hidden">
            <div className="w-full h-full rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center p-0.5 overflow-hidden">
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
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-red-600 dark:text-red-500 flex items-center gap-1">
              <Sparkles size={13} /> {t('pwaAppTitle')}
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-200 font-medium leading-snug mt-0.5">
              📱 {t('pwaAppDesc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Download size={14} /> {t('installBtn')}
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
