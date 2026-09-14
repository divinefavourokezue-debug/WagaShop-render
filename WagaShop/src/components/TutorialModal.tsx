import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { X, ShoppingBag, MessageCircle, Store, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const { isDark, language } = useLanguageTheme();
  const [currentStep, setCurrentStep] = useState(0);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const steps = [
    {
      icon: <ShoppingBag className="w-12 h-12 text-rose-500" />,
      title: language === 'FR' ? 'Bienvenue sur WAGA SHOP' : 'Welcome to WAGA SHOP',
      description: language === 'FR' 
        ? 'Le marché digital N°1 au Burkina Faso. Découvrez comment ça marche en 3 étapes simples.'
        : 'The #1 digital market in Burkina Faso. Discover how it works in 3 simple steps.',
    },
    {
      icon: <MessageCircle className="w-12 h-12 text-emerald-500" />,
      title: language === 'FR' ? 'Pour les Acheteurs' : 'For Buyers',
      description: language === 'FR'
        ? 'Trouvez l\'article parfait, cliquez sur "Commander sur WhatsApp", et discutez directement avec le vendeur pour finaliser l\'achat.'
        : 'Find the perfect item, click "Order on WhatsApp", and chat directly with the seller to finalize the purchase.',
      bullets: language === 'FR' 
        ? ['Pas de paiement en ligne', 'Négociation directe', 'Achat sécurisé en personne']
        : ['No online payments', 'Direct negotiation', 'Secure in-person purchase']
    },
    {
      icon: <Store className="w-12 h-12 text-blue-500" />,
      title: language === 'FR' ? 'Pour les Vendeurs' : 'For Sellers',
      description: language === 'FR'
        ? 'Créez votre boutique gratuitement. Ajoutez vos articles avec photos et prix, et recevez les commandes directement sur votre WhatsApp privé.'
        : 'Create your shop for free. Add items with photos and prices, and receive orders directly on your private WhatsApp.',
      bullets: language === 'FR'
        ? ['Création 100% gratuite', '0% de commission', 'Visibilité instantanée']
        : ['100% free creation', '0% commission', 'Instant visibility']
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            "relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col",
            isDark ? "bg-[#18181B] border border-white/10" : "bg-white"
          )}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors z-20"
          >
            <X className={cn("w-5 h-5", isDark ? "text-gray-400" : "text-gray-500")} />
          </button>

          {/* Progress Bar */}
          <div className="w-full flex h-1.5 bg-gray-100 dark:bg-zinc-800">
            <motion.div 
              className="h-full bg-gradient-to-r from-rose-500 to-rose-600"
              initial={{ width: '33%' }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center space-y-6"
              >
                {/* Icon Circle */}
                <div className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center shadow-lg",
                  isDark ? "bg-zinc-900 shadow-black/50" : "bg-slate-50 shadow-slate-200/50"
                )}>
                  {steps[currentStep].icon}
                </div>

                <div className="space-y-3">
                  <h2 className={cn("text-2xl font-black font-display", isDark ? "text-white" : "text-slate-900")}>
                    {steps[currentStep].title}
                  </h2>
                  <p className={cn("text-base font-medium leading-relaxed", isDark ? "text-gray-300" : "text-slate-600")}>
                    {steps[currentStep].description}
                  </p>
                </div>

                {/* Bullets */}
                {steps[currentStep].bullets && (
                  <div className="w-full space-y-3 mt-4 text-left">
                    {steps[currentStep].bullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className={cn("font-medium", isDark ? "text-gray-300" : "text-slate-700")}>
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Actions */}
            <div className="mt-10 flex gap-3">
              <button
                onClick={handleNext}
                className={cn(
                  "w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98]",
                  "bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50"
                )}
              >
                {currentStep === steps.length - 1 
                  ? (language === 'FR' ? "C'est parti !" : "Let's go!") 
                  : (language === 'FR' ? "Suivant" : "Next")}
                {currentStep !== steps.length - 1 && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
