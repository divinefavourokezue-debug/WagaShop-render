import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useLanguageTheme } from '../context/LanguageThemeContext';

export const OfflineIndicator: React.FC = () => {
  const { language } = useLanguageTheme();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div 
        id="network-reconnected-toast"
        className="fixed bottom-20 md:bottom-6 left-4 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-fade-in backdrop-blur-md"
      >
        <Wifi size={16} className="text-white" />
        <span>{language === 'FR' ? 'Connexion rétablie' : 'Connection restored'}</span>
      </div>
    );
  }

  return (
    <div 
      id="network-offline-banner"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 sm:right-auto z-50 flex items-center justify-between sm:justify-start gap-2.5 rounded-2xl bg-zinc-900/95 border border-amber-500/40 px-4 py-2.5 text-xs font-medium text-white shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        <WifiOff size={15} className="text-amber-400" />
        <span className="font-semibold text-zinc-200">
          {language === 'FR' 
            ? 'Mode hors-ligne — Consultation des articles en cache active' 
            : 'Offline mode — Browsing cached products'}
        </span>
      </div>
    </div>
  );
};
