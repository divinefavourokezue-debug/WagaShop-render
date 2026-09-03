import React, { useState, type FormEvent, useRef } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updatePassword, signOut } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { 
  ArrowLeft, 
  Store, 
  Lock, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Camera, 
  Share2, 
  Copy, 
  ExternalLink, 
  Globe, 
  LogOut, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useLanguageTheme } from '../../context/LanguageThemeContext';
import { BURKINA_CITIES } from '../../constants/cities';
import { CATEGORIES } from '../../constants/categories';

export default function SellerSettings() {
  const { user, sellerProfile, refreshProfile } = useAuth();
  const { language, t } = useLanguageTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [businessName, setBusinessName] = useState(sellerProfile?.businessName || '');
  const [category, setCategory] = useState(sellerProfile?.category || 'telephones');
  const [shopDescription, setShopDescription] = useState(sellerProfile?.shopDescription || '');
  const [city, setCity] = useState(sellerProfile?.city || 'Ouagadougou');
  const [whatsappNumber, setWhatsappNumber] = useState(sellerProfile?.whatsappNumber || '');
  const [facebookUrl, setFacebookUrl] = useState(sellerProfile?.facebookUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(sellerProfile?.instagramUrl || '');
  const [tiktokUrl, setTiktokUrl] = useState(sellerProfile?.tiktokUrl || '');
  const [logoUrl, setLogoUrl] = useState(sellerProfile?.logoUrl || '');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!user || !sellerProfile) {
    return (
      <div className="text-center py-20 text-slate-500">
        {t('loading') || 'Loading...'}
      </div>
    );
  }

  const shopUrl = `${window.location.origin}/shop/${user.uid}`;

  // Handle Logo Upload - Keeping original file without alteration per instruction
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use original file as base64 data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setLogoUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shopUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleLogout = async () => {
    if (window.confirm(language === 'FR' ? 'Voulez-vous vous déconnecter de votre compte vendeur ?' : 'Sign out of your seller account?')) {
      try {
        await signOut(auth);
        navigate('/');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword && newPassword !== confirmPassword) {
      setError(language === 'FR' ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError(language === 'FR' ? 'Le mot de passe doit comporter au moins 6 caractères.' : 'Password must be at least 6 characters.');
      return;
    }

    if (!businessName.trim()) {
      setError(language === 'FR' ? 'Le nom de la boutique ne peut pas être vide.' : 'Shop name cannot be empty.');
      return;
    }

    if (!whatsappNumber.trim()) {
      setError(language === 'FR' ? 'Le numéro WhatsApp est obligatoire pour recevoir les commandes.' : 'WhatsApp number is required to receive orders.');
      return;
    }

    setUpdating(true);

    try {
      const updatedFields: any = {
        businessName: businessName.trim(),
        category,
        shopDescription: shopDescription.trim(),
        city,
        whatsappNumber: whatsappNumber.trim(),
        facebookUrl: facebookUrl.trim(),
        instagramUrl: instagramUrl.trim(),
        tiktokUrl: tiktokUrl.trim(),
      };

      if (logoUrl) {
        updatedFields.logoUrl = logoUrl;
      }

      // 1. Update Firestore seller document
      await updateDoc(doc(db, 'sellers', user.uid), updatedFields);

      // 2. Sync to local storage for zero latency
      try {
        const cached = localStorage.getItem(`waga_seller_profile_${user.uid}`);
        const currentProfile = cached ? JSON.parse(cached) : {};
        const newMerged = { ...currentProfile, ...updatedFields, id: user.uid };
        localStorage.setItem(`waga_seller_profile_${user.uid}`, JSON.stringify(newMerged));
      } catch {}

      // 3. If city or business name changed, update seller's products as well
      if (city !== sellerProfile.city || businessName.trim() !== sellerProfile.businessName) {
        try {
          const q = query(collection(db, 'products'), where('sellerId', '==', user.uid));
          const snapshot = await getDocs(q);
          const updatePromises = snapshot.docs.map(productDoc => 
            updateDoc(doc(db, 'products', productDoc.id), {
              city,
              location: productDoc.data().location || city
            })
          );
          await Promise.all(updatePromises);
        } catch (syncErr) {
          console.warn("Could not sync city to all products:", syncErr);
        }
      }

      // 4. Update Password if specified
      if (newPassword) {
        await updatePassword(user, newPassword);
        setNewPassword('');
        setConfirmPassword('');
      }

      await refreshProfile();
      setSuccess(language === 'FR' ? 'Les paramètres de votre boutique ont été mis à jour avec succès !' : 'Your shop settings have been successfully updated!');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setError(language === 'FR' ? 'Pour des raisons de sécurité, veuillez vous déconnecter et vous reconnecter avant de modifier votre mot de passe.' : 'For security reasons, please log out and log back in before changing your password.');
      } else {
        setError(language === 'FR' ? 'Une erreur est survenue lors de la mise à jour.' : 'An error occurred during update.');
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-16">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            to="/seller" 
            className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-900 dark:text-white"
            title="Retour au tableau de bord"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <Store className="text-red-600" size={24} />
              {language === 'FR' ? 'Paramètres de la Boutique' : 'Shop Settings'}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              {sellerProfile.businessName} • {language === 'FR' ? 'Configuration publique & coordonnées' : 'Public configuration & contacts'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-bold transition-all cursor-pointer"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">{language === 'FR' ? 'Déconnexion' : 'Sign Out'}</span>
        </button>
      </div>

      {/* PUBLIC SHOP LINK SHARE HUB */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-5 text-white shadow-xl shadow-red-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
            {language === 'FR' ? 'Votre Vitrine Publique' : 'Your Public Storefront'}
          </span>
          <p className="text-sm font-bold truncate max-w-sm sm:max-w-md text-white/95">
            {shopUrl}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-red-600 hover:bg-zinc-100 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            {copiedLink ? <CheckCircle2 size={15} className="text-emerald-600" /> : <Copy size={15} />}
            <span>{copiedLink ? (language === 'FR' ? 'Copié !' : 'Copied!') : (language === 'FR' ? 'Copier Lien' : 'Copy Link')}</span>
          </button>

          <Link
            to={`/shop/${user.uid}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all"
          >
            <ExternalLink size={15} />
            <span className="hidden sm:inline">{language === 'FR' ? 'Voir ma Boutique' : 'View Shop'}</span>
          </Link>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-8">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400 text-xs font-bold animate-in fade-in">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-start gap-3 text-emerald-700 dark:text-emerald-400 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-8">
          {/* SECTION 1: SHOP BRANDING & LOGO */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <Sparkles size={18} className="text-red-600" />
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                {language === 'FR' ? 'Identité & Logo de la Boutique' : 'Shop Branding & Logo'}
              </h2>
            </div>

            {/* Logo Photo Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden shadow-inner">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo de la boutique" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="text-zinc-400" size={36} />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                  title="Changer le logo"
                >
                  <Camera size={14} />
                </button>
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {language === 'FR' ? 'Photo ou Logo de la Boutique' : 'Shop Photo or Logo'}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {language === 'FR' ? 'Utilisez votre photo ou le logo original de votre commerce pour inspirer confiance aux acheteurs.' : 'Upload your original shop picture or logo to build buyer trust.'}
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 text-xs font-black text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                >
                  {logoUrl ? (language === 'FR' ? 'Changer l\'image originale' : 'Change original photo') : (language === 'FR' ? '+ Sélectionner une image' : '+ Select an image')}
                </button>
              </div>
            </div>

            {/* Business Name & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'FR' ? 'Nom de la Boutique *' : 'Shop Name *'}
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="ex: Waga Tech Express"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={13} className="text-red-500" />
                  {language === 'FR' ? 'Ville d\'Activité (Burkina) *' : 'City (Burkina Faso) *'}
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none font-medium"
                >
                  {BURKINA_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Main Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                <Layers size={13} className="text-blue-500" />
                {language === 'FR' ? 'Catégorie Principale' : 'Primary Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Shop Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                {language === 'FR' ? 'Description & Présentation de la Boutique' : 'Shop Bio & Description'}
              </label>
              <textarea
                value={shopDescription}
                onChange={(e) => setShopDescription(e.target.value)}
                rows={3}
                placeholder={language === 'FR' ? 'Présentez votre commerce, vos horaires, vos garanties ou vos services de livraison...' : 'Describe your products, warranty, store hours, or delivery arrangements...'}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none resize-none font-medium"
              />
            </div>
          </div>

          {/* SECTION 2: WHATSAPP CONTACT & SOCIAL CHANNELS */}
          <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <Phone size={18} className="text-emerald-500" />
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                {language === 'FR' ? 'Contact WhatsApp & Réseaux Sociaux' : 'WhatsApp Contact & Social Links'}
              </h2>
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                <span>{language === 'FR' ? 'Numéro WhatsApp de Commande *' : 'Order WhatsApp Number *'}</span>
                <span className="text-[11px] text-emerald-600 font-bold lowercase">format direct: +226 70000000</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+226 70123456"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  required
                />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {language === 'FR' ? 'Les acheteurs cliquent sur ce numéro pour commander instantanément vos produits.' : 'Buyers tap this number on WAGA SHOP to buy directly on WhatsApp.'}
              </p>
            </div>

            {/* Social Media Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe size={13} className="text-blue-600" />
                  <span>Facebook</span>
                </label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 size={13} className="text-rose-500" />
                  <span>Instagram</span>
                </label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 size={13} className="text-zinc-400" />
                  <span>TikTok</span>
                </label>
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://tiktok.com/@..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: SECURITY & PASSWORD */}
          <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <Lock size={18} className="text-amber-500" />
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                {language === 'FR' ? 'Sécurité du Compte' : 'Account Security'}
              </h2>
            </div>
            
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {language === 'FR' 
                ? 'Laissez vide si vous ne souhaitez pas modifier votre mot de passe de connexion.' 
                : 'Leave blank if you do not want to change your login password.'}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'FR' ? 'Nouveau mot de passe' : 'New Password'}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'FR' ? 'Confirmer le mot de passe' : 'Confirm Password'}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <button
              type="submit"
              disabled={updating}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black py-4 px-10 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-red-600/30 disabled:opacity-70 uppercase tracking-widest text-xs cursor-pointer"
            >
              {updating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span>{language === 'FR' ? 'Enregistrer les Modifications' : 'Save Changes'}</span>
            </button>

            <Link
              to="/seller"
              className="w-full sm:w-auto text-center px-6 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold transition-all"
            >
              {language === 'FR' ? 'Retour au Tableau de Bord' : 'Return to Dashboard'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
