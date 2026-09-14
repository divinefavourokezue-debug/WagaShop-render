import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Store, MessageCircle, Rocket, Clock, ArrowRight, Zap, Gift, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function PromoVideo() {
  const { isDark } = useLanguageTheme();
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const scenes = [
    {
      id: 0,
      duration: 4000,
      icon: <Smartphone className="w-20 h-20 text-slate-800 dark:text-white" />,
      tagline: "VENDEURS DE OUAGA...",
      headline: "Fatigué de publier sur WhatsApp ?",
      subline: "Vos statuts disparaissent après 24h et vous perdez des clients...",
      bgColor: "bg-slate-50 dark:bg-zinc-950",
      accent: "text-rose-600"
    },
    {
      id: 1,
      duration: 4500,
      icon: <Store className="w-24 h-24 text-rose-500" />,
      tagline: "LA SOLUTION",
      headline: "Découvrez WAGA SHOP",
      subline: "Le 1er marché digital du Burkina connecté directement à votre WhatsApp.",
      bgColor: "bg-rose-50 dark:bg-rose-950/20",
      accent: "text-rose-600"
    },
    {
      id: 2,
      duration: 5000,
      icon: <MessageCircle className="w-24 h-24 text-emerald-500" />,
      tagline: "COMMENT ÇA MARCHE ?",
      headline: "0% Commission. 100% Direct.",
      subline: "Les clients découvrent vos articles et commandent d'un seul clic sur votre WhatsApp privé.",
      bullets: ["Pas de paiement en ligne", "Négociation directe", "Votre propre lien boutique"],
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      accent: "text-emerald-600"
    },
    {
      id: 3,
      duration: 5500,
      icon: <Rocket className="w-24 h-24 text-amber-500" />,
      tagline: "OFFRE DE LANCEMENT 🚀",
      headline: "Devenez Pionnier !",
      subline: "Créez votre boutique maintenant et profitez du forfait VIP gratuit.",
      bullets: ["Articles ILLIMITÉS", "Boutique 100% Gratuite", "Badge Pionnier Exclusif"],
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      accent: "text-amber-600"
    },
    {
      id: 4,
      duration: 5000,
      icon: <AlertTriangle className="w-24 h-24 text-red-500" />,
      tagline: "ATTENTION ⏱️",
      headline: "L'offre expire bientôt !",
      subline: "Après le lancement, le plan gratuit sera limité à seulement 5 articles. Les pionniers gardent l'avantage !",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      accent: "text-red-600"
    },
    {
      id: 5,
      duration: 6000,
      icon: <Zap className="w-24 h-24 text-blue-500" />,
      tagline: "PASSEZ À L'ACTION",
      headline: "Lancez vos ventes aujourd'hui.",
      subline: "Cliquez sur le lien et créez votre boutique WAGA SHOP en 2 minutes chrono.",
      isEnd: true,
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      accent: "text-blue-600"
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    let timeoutId: NodeJS.Timeout;

    const runScene = (index: number) => {
      if (index >= scenes.length) {
        setIsPlaying(false);
        return;
      }
      setCurrentScene(index);
      timeoutId = setTimeout(() => {
        runScene(index + 1);
      }, scenes[index].duration);
    };

    runScene(currentScene);

    return () => clearTimeout(timeoutId);
  }, [isPlaying]);

  const handleStart = () => {
    setCurrentScene(0);
    setIsPlaying(true);
  };

  const scene = scenes[currentScene];

  return (
    <div className={cn("w-full h-screen overflow-hidden flex flex-col justify-center items-center transition-colors duration-1000", scene.bgColor)}>
      
      {!isPlaying && currentScene === 0 && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="bg-white p-4 rounded-3xl mb-4">
            <img src="/waga-logo.png" alt="WAGA SHOP" className="w-20 h-20 rounded-2xl" />
          </div>
          <h1 className="text-3xl font-black text-white font-display">Générateur de Vidéo Promo</h1>
          <p className="text-gray-300 max-w-md text-lg">
            Appuyez sur "Enregistrer l'écran" sur votre téléphone, puis cliquez sur le bouton ci-dessous. L'animation se jouera automatiquement pendant 30 secondes.
          </p>
          <button 
            onClick={handleStart}
            className="mt-8 px-10 py-5 bg-rose-600 text-white rounded-full font-black text-xl hover:bg-rose-700 active:scale-95 transition-all shadow-[0_0_40px_rgba(225,29,72,0.5)] flex items-center gap-3"
          >
            Lancer l'Animation <ArrowRight />
          </button>
        </div>
      )}

      {/* Animation Canvas */}
      <div className="relative w-full max-w-md mx-auto aspect-[9/16] flex flex-col items-center justify-center p-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -50 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="flex flex-col items-center w-full space-y-8"
          >
            
            {/* Icon Box */}
            <motion.div 
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] shadow-2xl mb-4"
            >
              {scene.icon}
            </motion.div>

            {/* Tagline */}
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={cn("font-black tracking-[0.2em] text-sm px-4 py-1 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md", scene.accent)}
            >
              {scene.tagline}
            </motion.span>

            {/* Headline */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-4xl sm:text-5xl font-black font-display text-slate-900 dark:text-white leading-tight"
            >
              {scene.headline}
            </motion.h2>

            {/* Subline */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xl sm:text-2xl font-medium text-slate-700 dark:text-gray-300 leading-relaxed"
            >
              {scene.subline}
            </motion.p>

            {/* Bullets */}
            {scene.bullets && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="w-full flex flex-col gap-3 mt-4"
              >
                {scene.bullets.map((bullet, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + (idx * 0.2) }}
                    className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-black/5 dark:border-white/5"
                  >
                    <CheckCircle2 className={cn("w-8 h-8 shrink-0", scene.accent)} />
                    <span className="text-lg font-bold text-slate-800 dark:text-gray-200 text-left leading-tight">
                      {bullet}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* CTA Button (Only on End Scene) */}
            {scene.isEnd && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="pt-8 w-full"
              >
                <Link to="/seller/signup" className="flex w-full items-center justify-center p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[30px] font-black text-2xl shadow-xl shadow-blue-600/30">
                  Ouvrir ma boutique
                </Link>
                <p className="mt-4 text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">Lien dans la bio / Click le lien</p>
              </motion.div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar (Hidden during recording unless you want it) */}
      <div className="absolute bottom-0 left-0 h-1.5 bg-black/10 dark:bg-white/10 w-full">
        <motion.div 
          className={cn("h-full", isDark ? "bg-white" : "bg-black")}
          initial={{ width: 0 }}
          animate={{ width: isPlaying ? '100%' : 0 }}
          transition={{ duration: 30, ease: "linear" }}
        />
      </div>
      
    </div>
  );
}
