import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Store, ArrowRight, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageTheme } from '../context/LanguageThemeContext';

export const WelcomeGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, setLanguage } = useLanguageTheme();

  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/promo') {
      return true;
    }
    return localStorage.getItem('waga_welcome_v2') === 'true';
  });

  
  const [showOptions, setShowOptions] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    if (window.location.pathname === '/promo') {
      setHasSeenWelcome(true);
      localStorage.setItem('waga_welcome_v2', 'true');
    }
  }, []);


  const handleChoice = (path: string) => {
    localStorage.setItem('waga_welcome_v2', 'true');
    setHasSeenWelcome(true);
    navigate(path);
  };

  const t = {
    buyTitle: language === 'FR' ? 'Explorer comme Acheteur' : 'Browse as Buyer',
    buySub: language === 'FR' ? 'Aucun compte requis. Achetez via WhatsApp.' : 'No account needed. Buy via WhatsApp.',
    sellTitle: language === 'FR' ? 'Créer une Boutique' : 'Register as Seller',
    sellSub: language === 'FR' ? 'Ouvrez votre boutique 100% gratuite' : 'Open your 100% free store',
    description: language === 'FR' 
      ? 'Le marché digital N°1. Achetez directement via WhatsApp sans créer de compte, ou ouvrez votre boutique gratuitement en 60 secondes pour toucher des milliers de clients locaux.'
      : 'The #1 digital marketplace. Buy directly via WhatsApp without creating an account, or open your free store in 60 seconds to reach thousands of local customers.',
  };

  return (
    <>
      {hasSeenWelcome && children}
      
      <AnimatePresence>
        {!hasSeenWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050811] overflow-y-auto overflow-x-hidden select-none px-4 py-8"
          >
            {/* Language Toggle for Welcome Page */}
            {!hasSeenWelcome && showOptions && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-6 right-6 flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/10 z-50"
              >
                <button
                  onClick={() => setLanguage('FR')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${language === 'FR' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  FR
                </button>
                <button
                  onClick={() => setLanguage('EN')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${language === 'EN' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  EN
                </button>
              </motion.div>
            )}

            {/* Background glowing light spots */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600/25 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className={`relative w-full max-w-lg mx-auto flex flex-col items-center justify-center text-center z-10 transition-all duration-1000 ${showOptions ? 'md:-translate-y-8' : ''}`}
            >
              {/* Circular Living Logo Container */}
              <div className="relative mb-6 flex items-center justify-center">
                {/* Living Organic Aura */}
                <motion.div
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-blue-500 blur-2xl pointer-events-none"
                />

                {/* Circular Form Logo */}
                <motion.div
                  animate={{
                    scale: [1, 1.05, 0.98, 1.03, 1],
                    y: [0, -6, 0, 4, 0],
                    rotate: [0, 2, -1.5, 1, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative z-10 w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-amber-400 via-rose-500 to-blue-500 shadow-[0_12px_28px_rgba(225,29,72,0.4)]"
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-zinc-950/90 flex items-center justify-center">
                    <img
                      src="/waga-logo.png"
                      alt="WAGA SHOP"
                      className="w-full h-full object-cover select-none rounded-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://i.ibb.co/L71bdZZ/file-000000007d8081f69c0b33a9601d2c43.png";
                      }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Title */}
              <div className="space-y-1 mb-6">
                <h1 className="text-4xl md:text-5xl font-black tracking-widest uppercase italic flex items-center justify-center gap-2">
                  <span className="text-blue-500">WAGA</span> <span className="italic font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-red-600">SHOP</span>
                </h1>
              </div>

              {/* Loading Bar (Only for returning users or before options show) */}
              <AnimatePresence>
                {(!showOptions) && (
                  <motion.div 
                    initial={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="w-52 h-1.5 bg-slate-800/90 rounded-full overflow-hidden mt-2 border border-white/10 p-0.5 shadow-inner"
                  >
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: hasSeenWelcome ? 0.4 : 1.5, ease: "linear" }}
                      className="h-full rounded-full bg-gradient-to-r from-red-600 via-sky-400 to-red-600 shadow-[0_0_12px_#3B82F6]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Call to Action Cards for New Users */}
              <AnimatePresence>
                {showOptions && !hasSeenWelcome && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="w-full max-w-md space-y-5"
                  >
                    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 mb-8 shadow-xl backdrop-blur-md">
                      <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium">
                        {t.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleChoice('/')}
                      className="w-full group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-600/50 p-5 rounded-3xl flex items-center gap-5 text-left transition-all duration-300 backdrop-blur-md"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/0 to-red-600/0 group-hover:from-red-600/10 group-hover:via-transparent group-hover:to-transparent transition-all duration-500"></div>
                      <div className="w-12 h-12 rounded-2xl bg-red-600/20 flex items-center justify-center border border-red-600/30 group-hover:scale-110 transition-transform duration-300">
                        <ShoppingBag size={22} className="text-red-500" />
                      </div>
                      <div className="flex-1 relative z-10">
                        <h3 className="font-bold text-lg text-white group-hover:text-red-500 transition-colors">{t.buyTitle}</h3>
                        <p className="text-xs md:text-sm font-medium text-slate-400 mt-1">{t.buySub}</p>
                      </div>
                      <ArrowRight size={20} className="text-slate-500 group-hover:text-red-500 transition-all transform group-hover:translate-x-1" />
                    </button>

                    <button
                      onClick={() => handleChoice('/seller/signup')}
                      className="w-full group relative overflow-hidden bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-600 hover:to-pink-500 border border-red-500/50 p-5 rounded-3xl flex items-center gap-5 text-left transition-all duration-300 shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)]"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                        <Store size={22} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-white">{t.sellTitle}</h3>
                        <p className="text-xs md:text-sm font-medium text-red-100 mt-1">{t.sellSub}</p>
                      </div>
                      <ArrowRight size={20} className="text-white transition-transform transform group-hover:translate-x-1" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
