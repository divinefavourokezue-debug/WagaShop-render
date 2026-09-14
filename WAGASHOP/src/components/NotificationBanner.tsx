import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Sparkles, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface NotificationState {
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface NotificationBannerProps {
  notification: NotificationState | null;
  onClose: () => void;
  autoCloseMs?: number;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onClose,
  autoCloseMs = 5000,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseMs);
    return () => clearTimeout(timer);
  }, [notification, onClose, autoCloseMs]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg shadow-2xl rounded-2xl overflow-hidden border backdrop-blur-xl"
        >
          <div
            className={`p-4 flex items-start justify-between gap-3 ${
              notification.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-100 border-emerald-500/50 dark:bg-emerald-950/95'
                : notification.type === 'error'
                ? 'bg-rose-900/90 text-red-100 border-red-600/50 dark:bg-rose-950/95'
                : 'bg-slate-900/90 text-slate-100 border-red-400/50 dark:bg-slate-950/95'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {notification.type === 'success' && (
                  <CheckCircle2 className="text-emerald-400 animate-bounce" size={22} />
                )}
                {notification.type === 'error' && (
                  <AlertCircle className="text-red-500 animate-pulse" size={22} />
                )}
                {notification.type === 'info' && (
                  <Sparkles className="text-red-400 animate-spin" size={22} />
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
                  {notification.title}
                </h4>
                {notification.message && (
                  <p className="text-xs opacity-90 mt-1 leading-relaxed font-medium">
                    {notification.message}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 text-white/70 hover:text-white"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
