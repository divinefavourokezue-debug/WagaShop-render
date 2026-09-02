import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from './AuthProvider';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { safeFileToDataUrl, compressImage } from '../lib/utils';
import { Plus, X, MessageCircle, Sparkles, Clock, Loader2, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface Story {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerLogo?: string;
  whatsappNumber: string;
  imageUrl: string;
  caption?: string;
  createdAt: number;
}

export const WagaStories: React.FC = () => {
  const { user, sellerProfile } = useAuth();
  const { t } = useLanguageTheme();
  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const cached = localStorage.getItem('waga_stories_cache');
      if (cached) {
        const parsed: Story[] = JSON.parse(cached);
        const twentyFourHours = 24 * 60 * 60 * 1000;
        return parsed.filter(s => Date.now() - s.createdAt < twentyFourHours);
      }
      return [];
    } catch {
      return [];
    }
  });
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    let validStories: Story[] = [];
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    try {
      const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      validStories = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Story))
        .filter(s => now - s.createdAt < twentyFourHours);
    } catch (err) {
      console.error("Error fetching stories:", err);
    }

    // Merge local stories
    try {
      const localStories: Story[] = JSON.parse(localStorage.getItem('waga_local_stories') || '[]');
      const validLocal = localStories.filter(s => now - s.createdAt < twentyFourHours);
      const existingIds = new Set(validStories.map(s => s.id));
      const newLocals = validLocal.filter(s => !existingIds.has(s.id));
      validStories = [...newLocals, ...validStories];
    } catch {}

    setStories(validStories);
    try {
      localStorage.setItem('waga_stories_cache', JSON.stringify(validStories));
    } catch {}
  };

  const handleDeleteStory = async (storyId: string) => {
    if (confirm("Voulez-vous vraiment supprimer cette story ?")) {
      try {
        if (!storyId.startsWith('local_')) {
          await deleteDoc(doc(db, 'stories', storyId));
        }
        try {
          const localStories: Story[] = JSON.parse(localStorage.getItem('waga_local_stories') || '[]');
          const updated = localStories.filter(s => s.id !== storyId);
          localStorage.setItem('waga_local_stories', JSON.stringify(updated));
        } catch {}

        setActiveStory(null);
        fetchStories();
      } catch (err) {
        console.error("Error deleting story:", err);
        alert("Erreur lors de la suppression de la story.");
      }
    }
  };

  const handleUploadStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyFile || !user || !sellerProfile) return;

    setUploading(true);
    try {
      let url = '';
      try {
        const timeoutMs = storyFile.type.startsWith('video/') ? 15000 : 8000;
        const storagePromise = (async () => {
          const safeFile = await compressImage(storyFile);
          const fileRef = ref(storage, `stories/${user.uid}_${Date.now()}`);
          await uploadBytes(fileRef, safeFile);
          return await getDownloadURL(fileRef);
        })();

        const timeoutPromise = new Promise<string>((_, reject) => {
          setTimeout(() => reject(new Error('Storage timeout')), timeoutMs);
        });

        url = await Promise.race([storagePromise, timeoutPromise]);
      } catch {
        // Fast, ultra-safe data URL fallback
        url = await safeFileToDataUrl(storyFile);
      }

      const newStory = {
        sellerId: user.uid,
        sellerName: sellerProfile.businessName || 'Boutique WAGA',
        sellerLogo: sellerProfile.logoUrl || '',
        whatsappNumber: sellerProfile.whatsappNumber || '',
        imageUrl: url,
        caption: caption,
        createdAt: Date.now()
      };

      const savePromise = addDoc(collection(db, 'stories'), newStory);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Firestore timeout')), 3000);
      });

      try {
        await Promise.race([savePromise, timeoutPromise]);
      } catch {
        // Fallback local save if offline
        const localStories = JSON.parse(localStorage.getItem('waga_local_stories') || '[]');
        localStories.unshift({ ...newStory, id: 'local_' + Date.now() });
        localStorage.setItem('waga_local_stories', JSON.stringify(localStories));
      }

      setShowAddModal(false);
      setCaption('');
      setStoryFile(null);
      fetchStories();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la publication de la story.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
          <Sparkles size={14} className="text-red-600 dark:text-red-500" />
          <span>WAGA STORIES <span className="text-[10px] text-red-600 dark:text-red-500 font-bold">(24h)</span></span>
        </h3>

        {sellerProfile && (
          <button
            onClick={() => setShowAddModal(true)}
            className="text-[11px] font-bold text-red-600 dark:text-red-500 hover:underline flex items-center gap-1"
          >
            <Plus size={14} /> {t('publishStory')}
          </button>
        )}
      </div>

      {/* Horizontal Stories List */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x touch-pan-x">
        {/* Add Story Button for Seller */}
        {sellerProfile && (
          <button
            onClick={() => setShowAddModal(true)}
            className="snap-start shrink-0 flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-red-600/80 bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-500 group-hover:scale-105 transition-transform shadow-xs">
              <Plus size={24} />
            </div>
            <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[70px]">
              {t('myStory')}
            </span>
          </button>
        )}

        {/* Stories List */}
        {stories.length === 0 && !sellerProfile && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400 italic py-2">
            {t('activeStoryDesc')}
          </div>
        )}

        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => setActiveStory(story)}
            className="snap-start shrink-0 flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            {/* Circular Avatar with Red-to-Blue Ring */}
            <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-red-600 via-rose-500 to-blue-500 shadow-[0_0_12px_rgba(225,29,72,0.3)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 border border-black relative">
                <img
                  src={story.imageUrl}
                  alt={story.sellerName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[70px]">
              {story.sellerName}
            </span>
          </button>
        ))}
      </div>

      {/* STORY VIEWER MODAL */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-sm h-[80vh] bg-zinc-950 rounded-3xl overflow-hidden border border-red-600/40 flex flex-col justify-between p-4 shadow-2xl">
              {/* Top Bar with Timer Bar */}
              <div className="space-y-3 z-10">
                {/* Timer Bar */}
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 7, ease: "linear" }}
                    onAnimationComplete={() => setActiveStory(null)}
                    className="h-full bg-red-600"
                  />
                </div>

                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    {activeStory.sellerLogo ? (
                      <img src={activeStory.sellerLogo} alt="" className="w-8 h-8 rounded-full object-cover border border-red-600" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white font-black flex items-center justify-center text-xs">
                        {activeStory.sellerName[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-xs text-white">{activeStory.sellerName}</h4>
                      <p className="text-[9px] text-red-300 flex items-center gap-1">
                        <Clock size={10} /> Story 24h
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {user && activeStory.sellerId === user.uid && (
                      <button
                        onClick={() => handleDeleteStory(activeStory.id)}
                        className="p-1.5 rounded-full bg-red-600/80 text-white hover:bg-red-600 transition-colors"
                        title="Supprimer ma story"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => setActiveStory(null)}
                      className="p-1.5 rounded-full bg-black/40 text-white hover:bg-white/20"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Story Image */}
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <img
                  src={activeStory.imageUrl}
                  alt={activeStory.caption || 'Story'}
                  className="max-h-full max-w-full object-contain rounded-2xl"
                />
              </div>

              {/* Bottom Caption + WhatsApp CTA */}
              <div className="relative z-10 space-y-3 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent p-4 -mx-4 -mb-4">
                {activeStory.caption && (
                  <p className="text-xs text-white font-medium text-center line-clamp-2">
                    {activeStory.caption}
                  </p>
                )}

                <a
                  href={`https://wa.me/${activeStory.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${activeStory.sellerName}, j'ai vu votre Story WAGA SHOP !`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle size={18} /> {t('chatWhatsApp')}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPLOAD STORY MODAL FOR SELLER */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-zinc-900 border border-red-600/40 rounded-3xl p-6 w-full max-w-md space-y-4 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 text-red-500">
                  <Sparkles size={16} /> {t('publishStoryTitle')}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUploadStory} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300 mb-2">
                    {t('storyPhoto')}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setStoryFile(e.target.files?.[0] || null)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-zinc-300"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300 mb-2">
                    {t('storyCaption')}
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder={t('storyCaptionPlaceholder')}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading || !storyFile}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="animate-spin" size={18} /> : t('publishMyStory')}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
