import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, CheckCircle2, Globe, 
  ShoppingBag, Store, Smartphone, Truck, CreditCard, Award, 
  Lock, Compass
} from 'lucide-react';
import { useLanguageTheme } from '../context/LanguageThemeContext';

export function Splash({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const { language, setLanguage } = useLanguageTheme();

  // Subtle architectural market pillars for ambient depth
  const marketPillars = useMemo(() => [
    { id: 1, Icon: Store, label: "Commerces Partenaires", x: 8, y: 20, delay: 0 },
    { id: 2, Icon: ShoppingBag, label: "Catalogue National", x: 84, y: 18, delay: 1 },
    { id: 3, Icon: CreditCard, label: "Paiements Mobiles", x: 10, y: 76, delay: 0.6 },
    { id: 4, Icon: Truck, label: "Réseau Logistique", x: 86, y: 74, delay: 1.4 },
    { id: 5, Icon: Smartphone, label: "Connexion WhatsApp Directe", x: 48, y: 12, delay: 2 },
  ], []);

  // Subtle ambient micro-particles
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 5 + 6,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.35 + 0.1,
    }));
  }, []);

  // Mature, sophisticated value pillars in French
  const matureStatements = useMemo(() => [
    {
      badge: "ÉCOSYSTÈME CERTIFIÉ",
      title: "La Référence du Commerce Digital au Burkina Faso",
      description: "Une infrastructure moderne reliant acheteurs et commerçants vérifiés à travers tout le territoire.",
      code: "BF-COMMERCE-01"
    },
    {
      badge: "RELATION DIRECTE",
      title: "Échanges Instantanés et Négociation Transparente",
      description: "Contact direct avec chaque vendeur via WhatsApp, sans commission ni intermédiaire.",
      code: "BF-COMMERCE-02"
    },
    {
      badge: "SOLUTIONS MULTI-CANAUX",
      title: "Paiements Flexibles et Logistique Intégrée",
      description: "Compatible Orange Money, Moov Money, Wave et règlement sécurisé à la réception.",
      code: "BF-COMMERCE-03"
    },
    {
      badge: "EXPÉRIENCE PREMIUM",
      title: "Plateforme Optimisée, Fiable et Performante",
      description: "Naviguez parmi des milliers d'articles soigneusement répertoriés avec réactivité maximale.",
      code: "BF-COMMERCE-04"
    },
  ], []);

  // Dynamic status text based on progress
  const statusPhase = useMemo(() => {
    if (progress < 30) return "Initialisation de l'écosystème sécurisé...";
    if (progress < 65) return "Synchronisation du catalogue et des marchands...";
    if (progress < 90) return "Optimisation de votre session de navigation...";
    return "Plateforme prête. Bienvenue sur Waga Shop.";
  }, [progress]);

  useEffect(() => {
    const totalDuration = 5000; // 5 seconds exactly

    // Countdown interval (10 to 0)
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    // Step transition (every 2.5 seconds for 4 steps)
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 1250);

    // Precision smooth progress
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(p);
      if (p >= 100) clearInterval(progressInterval);
    }, 30);

    // Close splash after exactly 10s
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, totalDuration);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, []);

  const handleSkip = () => {
    setShowSplash(false);
  };

  // Circular Loading Calculations:
  // r = 96 => circumference = 2 * PI * 96 ~= 603.18
  const circleRadius = 96;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      {children}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            id="app-cinematic-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-[#040608] text-zinc-100 overflow-hidden select-none px-6 py-8"
          >
            {/* Ambient Lighting & Architectural Minimalist Depth */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Subtle top warm radial halo */}
              <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-b from-rose-600/15 via-red-700/10 to-transparent rounded-full blur-[140px]" />
              
              {/* Subtle bottom cool ambient light */}
              <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[130px]" />

              {/* Minimalist Grid Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:32px_32px] opacity-40"></div>

              {/* Refined Ambient Micro-Particles */}
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full bg-zinc-200"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    opacity: p.opacity,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5],
                  }}
                  transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: "easeInOut",
                  }}
                />
              ))}

              {/* Ambient Perimeter Architecture Badges */}
              {marketPillars.map((pillar) => {
                const Icon = pillar.Icon;
                return (
                  <motion.div
                    key={pillar.id}
                    className="absolute hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md text-zinc-400"
                    style={{ left: `${pillar.x}%`, top: `${pillar.y}%` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.65 }}
                    transition={{ duration: 1.5, delay: pillar.delay }}
                  >
                    <Icon size={14} className="text-zinc-300" />
                    <span className="text-[11px] font-medium tracking-wide text-zinc-400">
                      {pillar.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Top Navigation Bar: Refined Location & Language & Skip */}
            <header className="w-full max-w-5xl flex items-center justify-between z-20">
              {/* Refined Location Indicator */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800 backdrop-blur-md"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] font-medium tracking-widest text-zinc-300 uppercase">
                  Burkina Faso • Hub Commercial
                </span>
              </motion.div>

              {/* Controls */}
              <div className="flex items-center gap-2.5">
                {/* Language Switch */}
                <button
                  onClick={() => setLanguage(language === 'FR' ? 'EN' : 'FR')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/70 hover:bg-zinc-800/90 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 transition-colors cursor-pointer"
                  title="Langue / Language"
                >
                  <Globe size={13} className="text-zinc-400" />
                  <span>{language}</span>
                </button>

                {/* Mature Skip Button */}
                <button
                  id="splash-skip-btn"
                  onClick={handleSkip}
                  className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-medium border border-zinc-700/80 shadow-sm transition-all active:scale-98 cursor-pointer"
                >
                  <span>Passer</span>
                  <span className="font-mono text-[11px] text-zinc-400">
                    {countdown}s
                  </span>
                  <ArrowRight size={13} className="text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </header>

            {/* Center Stage: Mature Precision Circular Loading & Brand Statement */}
            <main className="relative w-full max-w-2xl flex flex-col items-center justify-center text-center z-10 my-auto py-4">
              
              {/* Sub-Brand Tagline */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mb-5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-[11px] font-medium tracking-wider uppercase"
              >
                <Compass size={12} className="text-rose-400" />
                <span>Plateforme Commerciale Officielle</span>
              </motion.div>

              {/* REFINED CHRONOMETER CIRCULAR LOGO & LOADING ARC */}
              <div className="relative flex items-center justify-center my-2">
                
                {/* Subtle Ambient Backlight Glow */}
                <div className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-red-600/20 via-rose-500/15 to-transparent blur-2xl pointer-events-none" />

                {/* SVG High-Precision Circular Arc */}
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 210 210">
                    <defs>
                      <linearGradient id="matureProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E11D48" />
                        <stop offset="50%" stopColor="#F43F5E" />
                        <stop offset="100%" stopColor="#FB7185" />
                      </linearGradient>

                      {/* Tick Marks Pattern */}
                      <pattern id="ticks" width="10" height="10" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      </pattern>
                    </defs>

                    {/* Outer Reference Ring */}
                    <circle
                      cx="105"
                      cy="105"
                      r={circleRadius + 4}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                      fill="transparent"
                      strokeDasharray="2 4"
                    />

                    {/* Base Background Track */}
                    <circle
                      cx="105"
                      cy="105"
                      r={circleRadius}
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="3.5"
                      fill="transparent"
                    />

                    {/* Active Loading Progress Arc */}
                    <circle
                      cx="105"
                      cy="105"
                      r={circleRadius}
                      stroke="url(#matureProgressGrad)"
                      strokeWidth="4"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-100 ease-linear"
                    />
                  </svg>

                  {/* High-Precision Circular Logo Encasement */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-4 rounded-full overflow-hidden flex items-center justify-center bg-[#07090E] border border-zinc-700/60 shadow-[0_12px_32px_rgba(0,0,0,0.8)]"
                  >
                    {/* Subtle Specular Highlight Sweep */}
                    <motion.div
                      animate={{
                        x: ['-120%', '160%'],
                        opacity: [0, 0.4, 0],
                      }}
                      transition={{
                        duration: 3.2,
                        repeat: Infinity,
                        repeatDelay: 2.5,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none z-10"
                    />

                    {/* Clean Round Logo */}
                    <img
                      src="/waga-logo.png"
                      alt="WAGA SHOP"
                      className="w-full h-full object-cover select-none rounded-full"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://i.ibb.co/L71bdZZ/file-000000007d8081f69c0b33a9601d2c43.png";
                      }}
                    />
                  </motion.div>

                  {/* Refined Numerical Progress Chip */}
                  <div className="absolute -bottom-3 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700/80 text-[10px] font-mono font-medium text-zinc-300 shadow-lg z-20">
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>

              {/* Brand Typography */}
              <div className="space-y-1 mt-4">
                <div className="flex items-center justify-center gap-3">
                  <span className="h-px w-6 bg-zinc-700"></span>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-widest uppercase">
                    <span className="text-white">WAGA</span>{' '}
                    <span className="text-rose-500">SHOP</span>
                  </h1>
                  <span className="h-px w-6 bg-zinc-700"></span>
                </div>
                <p className="text-xs font-semibold tracking-[0.25em] text-zinc-400 uppercase">
                  Marché Digital & Commerce Direct
                </p>
              </div>

              {/* Mature Dynamic Information Module */}
              <div className="w-full max-w-lg h-24 mt-5 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="w-full p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md text-left flex flex-col justify-between h-full"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono tracking-wider font-semibold text-rose-400">
                        {matureStatements[activeStep].badge}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        0{activeStep + 1} / 04
                      </span>
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-zinc-100 line-clamp-1">
                        {matureStatements[activeStep].title}
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                        {matureStatements[activeStep].description}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

            </main>

            {/* Bottom Section: Precision Status & Security Indicators */}
            <footer className="w-full max-w-lg flex flex-col items-center gap-3 z-20">
              {/* Linear Progress Bar */}
              <div className="w-full space-y-1.5">
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <motion.div
                    style={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-rose-600 to-red-500 rounded-full transition-all duration-75"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 px-0.5 font-medium">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {statusPhase}
                  </span>
                  <span className="font-mono text-zinc-400 text-xs">
                    {countdown}s
                  </span>
                </div>
              </div>

              {/* Refined Trust Bar */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-400 font-medium">
                <span className="flex items-center gap-1 text-zinc-400">
                  <ShieldCheck size={13} className="text-zinc-300" />
                  Accès Direct & Sécurisé
                </span>
                <span className="text-zinc-700">•</span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <Award size={13} className="text-zinc-300" />
                  Qualité Certifiée
                </span>
                <span className="text-zinc-700">•</span>
                <span className="text-zinc-400">
                  Par D.Vortex
                </span>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
