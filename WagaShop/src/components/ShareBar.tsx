import React, { useState } from 'react';
import { Link2, Check, Sparkles, Copy } from 'lucide-react';
import { useLanguageTheme } from '../context/LanguageThemeContext';

interface ShareBarProps {
  title?: string;
  sellerName?: string;
  sellerSlug?: string;
  url?: string;
  imageUrl?: string;
}

export const ShareBar: React.FC<ShareBarProps> = ({
  title = "WAGA SHOP - Le Marché du Burkina Faso",
  sellerName = "Boutique WAGA SHOP",
  sellerSlug = "boutique",
  url,
}) => {
  const { t, language } = useLanguageTheme();
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const shareUrl = url || (sellerSlug ? `${window.location.origin}/s/${sellerSlug}` : window.location.href);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast(language === 'FR' ? "📋 Lien copié dans le presse-papier !" : "📋 Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Lien : " + shareUrl);
    }
  };

  return (
    <div className="relative space-y-3">
      <div className="p-4 rounded-3xl bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white font-extrabold text-xs uppercase tracking-wider shrink-0">
          <Sparkles size={16} className="text-red-500 animate-pulse" />
          <span>{t('shareMyShop')}</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopyLink}
            title={t('copyLink')}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all transform active:scale-95 shadow-md ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? (language === 'FR' ? 'Lien Copié !' : 'Link Copied!') : (language === 'FR' ? 'Copier le Lien' : 'Copy Link')}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center animate-fade-in shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

