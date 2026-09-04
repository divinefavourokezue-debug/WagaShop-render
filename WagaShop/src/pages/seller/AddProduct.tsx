import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { compressImage, safeFileToDataUrl } from '../../lib/utils';
import { upsertProductInCache } from '../../lib/productCache';
import { Product } from '../../types';
import { ArrowLeft, Upload, X, Loader2, Sparkles, MapPin, Phone, Globe, Clock, CheckCircle2, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORIES, getCategoryTranslation } from '../../constants/categories';
import { useLanguageTheme } from '../../context/LanguageThemeContext';

export default function AddProduct() {
  const { user, sellerProfile } = useAuth();
  const { t, language } = useLanguageTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Téléphones & Accessoires');
  const [location, setLocation] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStepText, setUploadStepText] = useState(language === 'FR' ? 'Optimisation des photos...' : 'Optimizing photos...');

  // Digital services specific fields
  const [portfolioLink, setPortfolioLink] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [deliveryTimeDays, setDeliveryTimeDays] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sellerProfile) {
      if (sellerProfile.whatsappNumber) {
        setWhatsappNumber(sellerProfile.whatsappNumber);
      }
      if (sellerProfile.category && CATEGORIES.some(c => c.name === sellerProfile.category)) {
        setCategory(sellerProfile.category);
      }
      if (sellerProfile.city) {
        setLocation(sellerProfile.city);
      } else if (!location) {
        setLocation('Ouagadougou');
      }
    }
  }, [sellerProfile]);

  // Handle Share Target query params if user shared a photo/title
  useEffect(() => {
    const sharedTitle = searchParams.get('title') || searchParams.get('text');
    if (sharedTitle) {
      setName(sharedTitle);
    }
  }, [searchParams]);

  if (!user || !sellerProfile) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 max-w-lg mx-auto p-8 shadow-xl my-10 space-y-4">
        <Store className="mx-auto text-red-600 mb-2" size={48} />
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('sellerLoginRequired')}</h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">{t('sellerLoginRequiredDesc')}</p>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/seller/login?mode=signup" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full text-xs uppercase tracking-wider transition-colors shadow-md shadow-red-600/30">
            {t('createMyShopBtn')}
          </Link>
          <Link to="/seller/login?mode=login" className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold py-3 px-6 rounded-full text-xs uppercase tracking-wider transition-colors">
            {t('signInBtn')}
          </Link>
        </div>
      </div>
    );
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files) as File[];
      if (images.length + selected.length > 5) {
        alert("Maximum 5 photos autorisées.");
        return;
      }
      
      const compressedImages = await Promise.all(
        selected.map(file => compressImage(file))
      );
      
      setImages(prev => [...prev, ...(compressedImages as File[])]);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      const fileList = Array.from(e.dataTransfer.files) as File[];
      const selected = fileList.filter((f: File) => f.type.startsWith('image/'));
      if (images.length + selected.length > 5) {
        alert("Maximum 5 photos autorisées.");
        return;
      }
      const compressedImages = await Promise.all(
        selected.map(file => compressImage(file))
      );
      setImages(prev => [...prev, ...(compressedImages as File[])]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const [errorMessage, setErrorMessage] = useState('');

  const isDigitalService = category === 'Services Digitaux' || category === 'services-digitaux';

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const uploadSingleImage = async (file: File): Promise<string> => {
    try {
      const isVideo = file.type.startsWith('video/');
      const timeoutMs = isVideo ? 15000 : 8000;

      const storagePromise = (async () => {
        const safeFile = await compressImage(file);
        const safeName = safeFile.name ? safeFile.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'img.jpg';
        const fileRef = ref(storage, `products/${user.uid}/${Date.now()}_${safeName}`);
        await uploadBytes(fileRef, safeFile);
        return await getDownloadURL(fileRef);
      })();

      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('Storage upload timeout')), timeoutMs);
      });

      return await Promise.race([storagePromise, timeoutPromise]);
    } catch (err) {
      console.warn("Firebase Storage fallback to compressed data URL:", err);
      return await safeFileToDataUrl(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (images.length === 0) {
      setErrorMessage("Veuillez ajouter au moins 1 photo du produit ou logo du service.");
      return;
    }

    setLoading(true);
    setUploadProgress(15);
    setUploadStepText('Traitement & Compression des photos...');

    // Progress bar animation interval (animates from 15% to 90% over ~2.5 seconds)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 88) return prev;
        const next = prev + Math.floor(Math.random() * 8) + 4;
        if (next > 45 && next < 75) {
          setUploadStepText('Publication sur WAGA SHOP...');
        } else if (next >= 75) {
          setUploadStepText('Finalisation & Sécurisation...');
        }
        return next;
      });
    }, 150);

    try {
      const imageUrls = await Promise.all(
        images.map(file => uploadSingleImage(file))
      );

      const isDigital = category === 'Services Digitaux' || category === 'services-digitaux';

      const productPayload: any = {
        sellerId: user.uid,
        name,
        price: Number(price) || Number(startingPrice) || 0,
        description,
        category,
        imageUrls,
        createdAt: Date.now(),
        isFeatured: false,
        isAvailable: true,
        location: location || sellerProfile.city || 'Ouagadougou',
        city: sellerProfile.city || 'Ouagadougou',
        whatsappNumber: whatsappNumber || sellerProfile.whatsappNumber,
        status: 'published',
      };

      if (isDigital) {
        productPayload.portfolioLink = portfolioLink;
        productPayload.startingPrice = Number(startingPrice) || Number(price) || 0;
        productPayload.deliveryTimeDays = Number(deliveryTimeDays) || 1;
      }

      // Fast Firestore save with 3-second timeout
      const savePromise = addDoc(collection(db, 'products'), productPayload);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT_FIRESTORE')), 3000);
      });

      let docRefId = null;
      try {
        const result = await Promise.race([savePromise, timeoutPromise]) as any;
        docRefId = result?.id;
      } catch (saveErr) {
        console.warn("Firestore write slow/offline, saved locally for instant sync:", saveErr);
        // Fallback save to local storage queue so product is never lost
        try {
          const offlineQueue = JSON.parse(localStorage.getItem('waga_offline_products') || '[]');
          offlineQueue.push({ ...productPayload, id: 'local_' + Date.now() });
          localStorage.setItem('waga_offline_products', JSON.stringify(offlineQueue));
        } catch {}
      }

      // Prepend to product caches immediately so it appears instantly across homepage, seller dashboard, and search
      try {
        const fullItem = { ...productPayload, id: docRefId || ('local_' + Date.now()) } as Product;
        upsertProductInCache(fullItem).catch(console.warn);

        if (user) {
          const cachedSeller = JSON.parse(localStorage.getItem(`waga_cached_seller_prods_${user.uid}`) || '[]');
          const updatedSeller = [fullItem, ...cachedSeller.filter((p: any) => p.id !== fullItem.id)];
          localStorage.setItem(`waga_cached_seller_prods_${user.uid}`, JSON.stringify(updatedSeller));
        }
      } catch {}

      // Trigger local storage notification event for buyers
      try {
        localStorage.setItem('waga_last_new_product', JSON.stringify({
          name,
          category,
          time: Date.now()
        }));
      } catch {}

      // Complete progress smoothly to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStepText('Publication réussie !');
      setPublishedSuccess(true);

      setTimeout(() => {
        const productParam = docRefId ? `&productId=${docRefId}` : '';
        navigate('/seller?action=product_added&name=' + encodeURIComponent(name) + productParam, {
          state: {
            notification: {
              type: 'success',
              title: 'Produit publié avec succès !',
              message: `Votre article "${name}" est désormais en ligne.`,
            },
          },
        });
      }, 700);

    } catch (error: any) {
      clearInterval(progressInterval);
      console.error("Error adding product:", error);
      setErrorMessage(error?.message || "Échec de la publication du produit. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 px-2 sm:px-0">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/seller" className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors border border-zinc-300 dark:border-white/10 text-zinc-800 dark:text-white shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">
            {t('addProductTitle')}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{t('addProductSubtitle')}</p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-600/15 border border-red-600/30 text-rose-700 dark:text-rose-300 flex items-center gap-3 animate-fade-in">
          <X size={24} className="text-red-600 shrink-0 cursor-pointer" onClick={() => setErrorMessage('')} />
          <div>
            <p className="font-bold text-sm">{language === 'FR' ? 'Erreur de publication' : 'Publication error'}</p>
            <p className="text-xs opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="mb-6 p-5 rounded-2xl bg-zinc-900 text-white border border-red-600/30 shadow-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-2 text-red-500 uppercase tracking-wider">
              <Loader2 className="animate-spin" size={16} />
              {uploadStepText}
            </span>
            <span className="font-mono text-sm text-red-600 font-black">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className="bg-gradient-to-r from-red-600 to-rose-600 h-full rounded-full transition-all duration-300 ease-out shadow-xs shadow-red-600" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">
            {language === 'FR' ? 'Publication sécurisée ultra-rapide en cours (~3-5 secondes)...' : 'Fast, secure publishing in progress (~3-5 seconds)...'}
          </p>
        </div>
      )}

      {publishedSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
          <div>
            <p className="font-bold text-sm">{t('productPublishedSuccess')}</p>
            <p className="text-xs opacity-90">{t('redirectingToDashboard')}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900/90 p-6 sm:p-8 rounded-[2rem] border border-zinc-200 dark:border-white/10 relative overflow-hidden shadow-xl">
        {/* Photos Upload & Drag and Drop */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">
              {t('productOrServicePhotos')}
            </label>
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
              {images.length}/5 {t('photosCount')}
            </span>
          </div>

          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`grid grid-cols-3 sm:grid-cols-5 gap-3 p-3 rounded-2xl border-2 transition-all ${
              dragOver ? 'border-red-600 bg-red-600/10' : 'border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-950/40'
            }`}
          >
            {images.map((img, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-zinc-100 dark:bg-neutral-900 relative overflow-hidden group border border-zinc-200 dark:border-white/10 shadow-xs">
                {img.type.startsWith('video/') ? (
                  <video src={URL.createObjectURL(img)} className="w-full h-full object-cover" muted autoPlay loop />
                ) : (
                  <img src={URL.createObjectURL(img)} alt={`preview ${i}`} className="w-full h-full object-cover" />
                )}
                <button 
                  type="button" 
                  onClick={() => removeImage(i)} 
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-zinc-300 dark:border-white/20 hover:border-red-600 dark:hover:border-red-600 flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-500 transition-colors bg-white dark:bg-white/5"
              >
                <Upload size={22} />
                <span className="text-[10px] font-bold mt-1.5 uppercase tracking-wider">{language === 'FR' ? 'Ajouter' : 'Add'}</span>
              </button>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*,video/*" 
            multiple 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageSelect}
          />
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-2 italic">{t('dragDropHint')}</p>
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-widest">
            {t('productOrServiceName')}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 focus:border-red-600 rounded-2xl p-4 text-zinc-900 dark:text-white font-medium outline-none transition-colors"
            placeholder={t('productNamePlaceholder')}
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-widest">
            {t('category')} *
          </label>
          <select
            required
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 focus:border-red-600 rounded-2xl p-4 text-zinc-900 dark:text-white font-semibold outline-none transition-colors cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.name} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white py-2">
                {cat.icon} {getCategoryTranslation(cat, t)}
              </option>
            ))}
          </select>
        </div>

        {/* Digital Services Custom Dynamic Fields */}
        {isDigitalService && (
          <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-600/30 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-500 font-bold text-xs uppercase tracking-wider">
              <Sparkles size={16} /> {t('digitalServicesSpecial')}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-widest flex items-center gap-1">
                <Globe size={13} className="text-red-600" /> {t('portfolioLink')}
              </label>
              <input
                type="url"
                value={portfolioLink}
                onChange={e => setPortfolioLink(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 focus:border-red-600 rounded-xl p-3 text-sm text-zinc-900 dark:text-white outline-none"
                placeholder="https://behance.net/mon-portfolio"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-widest">
                  {t('startingPriceFCFA')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={startingPrice}
                  onChange={e => {
                    setStartingPrice(e.target.value);
                    if (!price) setPrice(e.target.value);
                  }}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 focus:border-red-600 rounded-xl p-3 font-mono font-bold text-zinc-900 dark:text-white outline-none"
                  placeholder="ex: 25000"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={13} className="text-red-600" /> {t('deliveryTimeDays')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={deliveryTimeDays}
                  onChange={e => setDeliveryTimeDays(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 focus:border-red-600 rounded-xl p-3 font-mono text-zinc-900 dark:text-white outline-none"
                  placeholder="ex: 3"
                />
              </div>
            </div>
          </div>
        )}

        {/* Price FCFA & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-widest">
              {t('priceFCFA')}
            </label>
            <input
              type="number"
              required
              min="0"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 focus:border-red-600 rounded-2xl p-4 text-red-600 dark:text-red-500 outline-none font-mono font-black text-lg transition-colors"
              placeholder="ex: 15000"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-widest flex items-center gap-1">
              <MapPin size={14} className="text-red-600" /> {t('locationLabel')}
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 focus:border-red-600 rounded-2xl p-4 text-zinc-900 dark:text-white font-medium outline-none transition-colors"
              placeholder="Ouagadougou, Bobo-Dioulasso..."
            />
          </div>
        </div>

        {/* WhatsApp Number Pre-filled */}
        <div>
          <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-widest flex items-center gap-1">
            <Phone size={14} className="text-emerald-500" /> {t('whatsappContactNum')}
          </label>
          <input
            type="tel"
            required
            value={whatsappNumber}
            onChange={e => setWhatsappNumber(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 focus:border-red-600 rounded-2xl p-4 text-zinc-900 dark:text-white font-mono font-bold outline-none transition-colors"
            placeholder="+22670000000"
          />
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">{t('whatsappContactHint')}</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-widest">
            {t('detailedDescription')}
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 focus:border-red-600 rounded-2xl p-4 text-zinc-900 dark:text-white font-medium outline-none resize-none transition-colors"
            placeholder={t('detailedDescriptionPlaceholder')}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || publishedSuccess}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-lg uppercase tracking-wider py-5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-8 shadow-md shadow-red-600/30 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={22} /> {uploadProgress}% - {uploadStepText}
            </>
          ) : (
            t('publishProductBtn')
          )}
        </button>
      </form>
    </div>
  );
}

