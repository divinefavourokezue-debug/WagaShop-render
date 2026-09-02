import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'FR' | 'EN';
export type Theme = 'dark' | 'light';

export const translations = {
  FR: {
    // Header & Footer
    launchOffer: "🎉 Offre de Lancement : ",
    freeUntil: "GRATUIT SANS LIMITE JUSQU'EN SEPTEMBRE 2028",
    subTagline: "Le Marché Digital N°1 au Burkina",
    home: "Accueil",
    search: "Recherche",
    saved: "Favoris",
    seller: "Vendeur",
    sell: "Vendre",
    poweredBy: "Propulsé par D.Vortex",
    adminContact: "Contact Admin D.Vortex & Support WAGA : +226 66317245",
    adminNumber: "+226 66317245",
    allRightsReserved: "Tous droits réservés.",
    contactAdminSupport: "Support Admin / D.Vortex (+226 66317245)",
    newProductNotification: "Nouveau produit en ligne !",
    french: "Français",
    english: "English",
    switchLanguage: "Changer de langue",

    // Homepage
    welcomeBadge: "🚀 Propulsé par D.Vortex",
    heroTitle: "Le Marché du Burkina Faso en 1 Clic sur WhatsApp",
    welcomeTagline: "La plateforme idéale pour booster vos ventes au Burkina Faso ! Achetez et Vendez sans intermédiaire ni commission.",
    becomeSellerFree: "Devenir Vendeur Gratuit",
    exploreMarket: "Explorer le Marché",
    searchPlaceholderHome: "Rechercher produit, téléphone, service web...",
    voiceSearchListening: "Écoute en cours... Parlez maintenant",
    voiceSearchNotSupported: "La recherche vocale n'est pas supportée sur ce navigateur.",
    pullToRefresh: "Tirez pour actualiser",
    releaseToRefresh: "Relâchez pour actualiser",
    refreshing: "Actualisation en cours...",
    filters: "Filtres",
    filterTitle: "Filtrer les Produits",
    all: "Tous",
    priceRange: "Tranche de Prix (FCFA)",
    minPrice: "Prix Min",
    maxPrice: "Prix Max",
    category: "Catégorie",
    location: "Localisation",
    allLocations: "Toutes Villes",
    allCategories: "Toutes les Catégories",
    clear: "Effacer",
    apply: "Appliquer",
    wagaPicks: "WAGA PICKS",
    premiumSelection: "Sélection Premium",
    newSellersThisWeek: "NOUVEAUX VENDEURS CETTE SEMAINE - BURKINA FASO",
    digitalServicesHeader: "Services Digitaux, Développeurs & Designers",
    digitalServicesDesc: "Découvrez les talents freelances, développeurs d'applications, webmasters et créateurs au Burkina Faso.",
    viewAll: "Voir tout",
    trending: "Tendances",
    current: "Actuelles",
    articles: "Articles",
    noProductsMatch: "Aucun produit ne correspond à votre recherche.",
    tryChangingFilters: "Essayez de changer de catégorie ou réinitialisez vos filtres.",
    resetFilters: "Réinitialiser tous les filtres",
    contactSeller: "Contacter Vendeur",
    availableIn: "Offres disponibles à",

    // Stories & Install Banner
    wagaStoriesTitle: "WAGA STORIES (24h)",
    publishStory: "Publier Story",
    publishStoryTitle: "Publier une Story (24h)",
    storyCaptionPlaceholder: "Légende ou description rapide...",
    publish: "Publier",
    cancel: "Annuler",
    myStory: "Ma Story",
    activeStoryDesc: "Aucune story active. Les vendeurs peuvent publier des stories de 24h.",
    publishMyStory: "Publier ma Story",
    storyPhoto: "Photo de la Story *",
    storyCaption: "Légende / Offre spéciale (Optionnel)",
    pwaTitle: "Application WAGA SHOP",
    pwaDesc: "Installez l'application WAGA SHOP pour une navigation ultra rapide !",
    install: "Installer",
    later: "Plus tard",

    // ShareBar
    shareMyShop: "Partager ma Boutique",
    linkCopied: "📋 Lien copié dans le presse-papier !",
    copied: "Copié !",
    copy: "Copier",
    shareOnWhatsApp: "Partager sur WhatsApp",
    shareOnFacebook: "Partager sur Facebook",
    downloadInstagramCard: "Télécharger Carte Instagram",
    shareOnTikTok: "Partager sur TikTok",
    copyLink: "Copier le lien",

    // Product Page
    inStock: "En Stock",
    chatWhatsApp: "Discuter sur WhatsApp",
    shareWhatsApp: "Partager sur WhatsApp",
    negotiate: "Peut-on négocier ?",
    verifiedSeller: "Vendeur Vérifié",
    unverifiedSeller: "Vendeur",
    productNotFound: "Produit introuvable.",
    noImage: "Sans Image",
    photoCount: "Photos",
    description: "Description",
    sellerInfo: "Informations Vendeur",
    supportWaga: "Support WAGA / D.Vortex (+226 66317245)",

    // Seller & Auth & Dashboard
    login: "Connexion",
    createShop: "Créer ma boutique",
    businessName: "Nom de la Boutique",
    whatsappNum: "Numéro WhatsApp",
    instagramUrl: "URL Instagram (Optionnel)",
    facebookUrl: "URL Facebook (Optionnel)",
    forVerifiedBadge: "Pour le badge Vérifié",
    emailLabel: "Email",
    password: "Mot de passe",
    mainCategory: "Catégorie Principale",
    completeProfile: "Compléter le Profil",
    sellerDashboard: "Tableau de bord Vendeur",
    myProducts: "Mes Produits",
    addProduct: "Ajouter Produit",
    noSellerProducts: "Vous n'avez pas encore ajouté de produits.",
    addFirstProduct: "Ajouter le premier produit",
    views: "Vues Profil",
    waClicks: "Clics WA",
    freePlan: "Plan Gratuit",
    logout: "Déconnexion",
    sellerArea: "Espace Vendeur",
    sellerLoginNotice: "Veuillez vous connecter ou créer un compte vendeur pour gérer votre boutique.",
    loginOrCreateAccount: "S'inscrire / Se connecter",
    profileCreationInProgress: "Création du profil en cours...",
    profileCreationNotice: "Votre profil vendeur est en cours de configuration. Si cela dure, vous pouvez créer votre profil ci-dessous.",
    verifiedSellerBadge: "Vendeur Vérifié",
    unverifiedSellerBadge: "Vendeur",
    deleteProductConfirm: "Êtes-vous sûr de vouloir supprimer ce produit ?",
    guaranteeTagline: "Toutes les ventes se font directement sur votre WhatsApp.",
    addProductTitle: "Ajouter Produit ou Service",
    addProductSubtitle: "Mettez en ligne votre offre sur WAGA SHOP Burkina",
    productPublishedSuccess: "Produit publié avec succès !",
    redirectingToDashboard: "Redirection vers votre tableau de bord...",
    productOrServicePhotos: "Photos du Produit / Service (Max 5) *",
    photosCount: "photos",
    dragDropHint: "Glissez-déposez vos images ici ou cliquez pour choisir.",
    productOrServiceName: "Nom du Produit ou Service *",
    productNamePlaceholder: "ex: iPhone 15 Pro Max 256GB ou Création Site Web e-commerce",
    digitalServicesSpecial: "Options Spéciales 'Services Digitaux'",
    portfolioLink: "Lien du Portfolio / Réalisations",
    startingPriceFCFA: "Prix de Départ (FCFA)",
    deliveryTimeDays: "Délai de Livraison (Jours)",
    priceFCFA: "Prix (FCFA) *",
    locationLabel: "Localisation *",
    whatsappContactNum: "Numéro WhatsApp de Contact *",
    whatsappContactHint: "Les acheteurs vous contacteront directement sur ce numéro WhatsApp.",
    detailedDescription: "Description Détaillée *",
    detailedDescriptionPlaceholder: "Décrivez l'état du produit, les spécifications techniques, la garantie ou la méthode de livraison...",
    publishProductBtn: "Publier le Produit",
    publishing: "Publication en cours...",
    sellerLoginRequired: "Connexion Vendeur Requise",
    sellerLoginRequiredDesc: "Vous devez être connecté avec votre compte vendeur pour publier des articles sur WAGA SHOP.",
    createMyShopBtn: "Créer ma Boutique",
    signInBtn: "Se Connecter",

    // Categories Translations
    cat_telephones: "Téléphones & Accessoires",
    cat_ordinateurs: "Ordinateurs & Gaming",
    cat_services_digitaux: "Services Digitaux",
    cat_logiciels_formation: "Logiciels & Formation",
    cat_mode_homme: "Mode Homme",
    cat_mode_femme: "Mode Femme",
    cat_chaussures_sacs: "Chaussures & Sacs",
    cat_beaute: "Beauté & Cosmétiques",
    cat_maison_deco: "Maison & Décoration",
    cat_electromenager: "Électroménager",
    cat_nourriture: "Nourriture & Boissons",
    cat_bebe_enfant: "Bébé & Enfant",
    cat_sport_gym: "Sport & Gym",
    cat_sante: "Santé & Bien-être",
    cat_vehicules: "Voitures & Motos",
    cat_immobilier: "Immobilier",
    cat_construction: "Matériel de Construction",
    cat_services: "Services Généraux",
    cat_agriculture: "Agriculture & Élevage",
    cat_evenementiel: "Événementiel",
    cat_artisanat: "Art & Artisanat",
    cat_autres: "Autres",

    // Search & Saved
    searchPlaceholder: "Rechercher des produits au Burkina...",
    searchResults: "Résultats de",
    searchTitle: "Recherche",
    noProductsFound: "Aucun produit trouvé pour",
    mySaved: "Vos",
    savedTitle: "Favoris",
    noSaved: "Aucun produit sauvegardé pour le moment.",
    browseOffers: "Parcourir les offres",
    loading: "Chargement...",
    startSelling: "Commencez à Vendre",
    startSellingFree: "Vendre Gratuitement",
    shopTagline: "Gérez votre boutique WAGA SHOP",
    freeTagline: "Zéro frais. Discutez directement avec les acheteurs.",
    noShopCreateOne: "Pas de boutique ? Créez-en une",
    alreadyHaveShop: "Déjà une boutique ? Connectez-vous",
    shopNameWhatsappRequired: "Le nom de la boutique et WhatsApp sont requis",
    allSalesWhatsApp: "Toutes les ventes se font directement sur votre WhatsApp.",
    welcomeBack: "Bonjour",
    welcomeTitle: "Bienvenue sur WAGA SHOP 👋",
    sellerHeading: "Vous êtes vendeur ? Découvrez pourquoi vous allez adorer WAGA SHOP :",
    sellerPerk1Title: "⚡ 0 FCFA de Commission",
    sellerPerk1Desc: "Conservez 100% de vos bénéfices. Aucun frais caché, pour toujours !",
    sellerPerk2Title: "💬 Ventes Directes sur WhatsApp",
    sellerPerk2Desc: "Vos acheteurs vous contactent directement. Concluez vos affaires instantanément.",
    sellerPerk3Title: "⏱️ Boutique Prête en 60s",
    sellerPerk3Desc: "Inscrivez-vous rapidement et commencez à publier vos articles en un clic.",
    sellerCta: "Créer Ma Boutique Gratuitement",
    buyerHeading: "🛍️ Vous êtes Acheteur ? Faites de bonnes affaires en 1 clic :",
    buyerPerk1Title: "🛒 Aucune Inscription",
    buyerPerk1Desc: "Parcourez les offres librement. Aucun compte requis pour contacter un vendeur !",
    buyerPerk2Title: "💬 Négociation Directe",
    buyerPerk2Desc: "Discutez directement sur WhatsApp et proposez votre prix en un clic.",
    buyerPerk3Title: "⚡ Offres Locales Vérifiées",
    buyerPerk3Desc: "Découvrez des pépites et soutenez les meilleurs commerçants du Burkina Faso.",
    startShoppingCta: "Explorer les Produits",
    buyerDesc: "Aucune inscription requise ! Parcourez les offres, cliquez sur 'Peut-on négocier ?' et discutez en direct avec le vendeur sur WhatsApp.",
    view: "Voir",
    delete: "Supprimer"
  },
  EN: {
    // Header & Footer
    launchOffer: "🎉 Launch Offer: ",
    freeUntil: "UNLIMITEDLY FREE TILL SEPTEMBER 2028",
    subTagline: "#1 Digital Marketplace in Burkina Faso",
    home: "Home",
    search: "Search",
    saved: "Saved",
    seller: "Seller",
    sell: "Sell",
    poweredBy: "Powered by D.Vortex",
    adminContact: "D.Vortex Admin & WAGA Support Contact: +226 66317245",
    adminNumber: "+226 66317245",
    allRightsReserved: "All rights reserved.",
    contactAdminSupport: "Admin / D.Vortex Support (+226 66317245)",
    newProductNotification: "New product online!",
    french: "Français",
    english: "English",
    switchLanguage: "Switch Language",

    // Homepage
    welcomeBadge: "🚀 Powered by D.Vortex",
    heroTitle: "Burkina Faso Market in 1 Click on WhatsApp",
    welcomeTagline: "The perfect platform to boost your sales in Burkina Faso! Buy and sell directly with zero middleman or fees.",
    becomeSellerFree: "Become a Free Seller",
    exploreMarket: "Explore the Market",
    searchPlaceholderHome: "Search products, phones, web services...",
    voiceSearchListening: "Listening... Speak now",
    voiceSearchNotSupported: "Voice search is not supported on this browser.",
    pullToRefresh: "Pull to refresh",
    releaseToRefresh: "Release to refresh",
    refreshing: "Refreshing...",
    filters: "Filters",
    filterTitle: "Filter Products",
    all: "All",
    priceRange: "Price Range (XOF)",
    minPrice: "Min Price",
    maxPrice: "Max Price",
    category: "Category",
    location: "Location",
    allLocations: "All Cities",
    allCategories: "All Categories",
    clear: "Clear",
    apply: "Apply",
    wagaPicks: "WAGA PICKS",
    premiumSelection: "Premium Selection",
    newSellersThisWeek: "NEW SELLERS THIS WEEK - BURKINA FASO",
    digitalServicesHeader: "Digital Services, Developers & Designers",
    digitalServicesDesc: "Discover freelance talents, app developers, webmasters and creators in Burkina Faso.",
    viewAll: "View all",
    trending: "Trending",
    current: "Now",
    articles: "Items",
    noProductsMatch: "No products match your search.",
    tryChangingFilters: "Try changing category or reset your filters.",
    resetFilters: "Reset all filters",
    contactSeller: "Contact Seller",
    availableIn: "Deals available in",

    // Stories & Install Banner
    wagaStoriesTitle: "WAGA STORIES (24h)",
    publishStory: "Publish Story",
    publishStoryTitle: "Publish a Story (24h)",
    storyCaptionPlaceholder: "Caption or quick description...",
    publish: "Publish",
    cancel: "Cancel",
    myStory: "My Story",
    activeStoryDesc: "No active story. Sellers can publish 24h stories.",
    publishMyStory: "Publish my Story",
    storyPhoto: "Story Photo *",
    storyCaption: "Caption / Special Offer (Optional)",
    pwaTitle: "WAGA SHOP App",
    pwaDesc: "Install the WAGA SHOP app for ultra-fast browsing!",
    install: "Install",
    later: "Later",

    // ShareBar
    shareMyShop: "Share my Shop",
    linkCopied: "📋 Link copied to clipboard!",
    copied: "Copied!",
    copy: "Copy",
    shareOnWhatsApp: "Share on WhatsApp",
    shareOnFacebook: "Share on Facebook",
    downloadInstagramCard: "Download Instagram Card",
    shareOnTikTok: "Share on TikTok",
    copyLink: "Copy link",

    // Product Page
    inStock: "In Stock",
    chatWhatsApp: "Chat on WhatsApp",
    shareWhatsApp: "Share on WhatsApp",
    negotiate: "Can we negotiate?",
    verifiedSeller: "Verified Seller",
    unverifiedSeller: "Seller",
    productNotFound: "Product not found.",
    noImage: "No Image",
    photoCount: "Photos",
    description: "Description",
    sellerInfo: "Seller Information",
    supportWaga: "WAGA / D.Vortex Support (+226 66317245)",

    // Seller & Auth & Dashboard
    login: "Login",
    createShop: "Create Shop",
    businessName: "Shop Name",
    whatsappNum: "WhatsApp Number",
    instagramUrl: "Instagram URL (Optional)",
    facebookUrl: "Facebook URL (Optional)",
    forVerifiedBadge: "For Verified badge",
    emailLabel: "Email",
    password: "Password",
    mainCategory: "Main Category",
    completeProfile: "Complete Profile",
    sellerDashboard: "Seller Dashboard",
    myProducts: "My Products",
    addProduct: "Add Product",
    noSellerProducts: "You haven't added any products yet.",
    addFirstProduct: "Add your first product",
    views: "Profile Views",
    waClicks: "WA Clicks",
    freePlan: "Free Plan",
    logout: "Log Out",
    sellerArea: "Seller Area",
    sellerLoginNotice: "Please log in or create a seller account to manage your shop.",
    loginOrCreateAccount: "Sign Up / Log In",
    profileCreationInProgress: "Profile creation in progress...",
    profileCreationNotice: "Your seller profile is being configured. If this persists, you can complete your profile below.",
    verifiedSellerBadge: "Verified Seller",
    unverifiedSellerBadge: "Seller",
    deleteProductConfirm: "Are you sure you want to delete this product?",
    guaranteeTagline: "All sales happen directly on your WhatsApp.",
    addProductTitle: "Add Product or Service",
    addProductSubtitle: "Put your deal online on WAGA SHOP Burkina",
    productPublishedSuccess: "Product published successfully!",
    redirectingToDashboard: "Redirecting to your dashboard...",
    productOrServicePhotos: "Product / Service Photos (Max 5) *",
    photosCount: "photos",
    dragDropHint: "Drag and drop your images here or click to choose.",
    productOrServiceName: "Product or Service Name *",
    productNamePlaceholder: "e.g.: iPhone 15 Pro Max 256GB or E-commerce Website Creation",
    digitalServicesSpecial: "Special Options 'Digital Services'",
    portfolioLink: "Portfolio / Work Link",
    startingPriceFCFA: "Starting Price (FCFA)",
    deliveryTimeDays: "Delivery Time (Days)",
    priceFCFA: "Price (FCFA) *",
    locationLabel: "Location *",
    whatsappContactNum: "WhatsApp Contact Number *",
    whatsappContactHint: "Buyers will contact you directly on this WhatsApp number.",
    detailedDescription: "Detailed Description *",
    detailedDescriptionPlaceholder: "Describe the item condition, technical specs, warranty, or delivery method...",
    publishProductBtn: "Publish Product",
    publishing: "Publishing...",
    sellerLoginRequired: "Seller Login Required",
    sellerLoginRequiredDesc: "You must be logged in with your seller account to publish items on WAGA SHOP.",
    createMyShopBtn: "Create My Shop",
    signInBtn: "Log In",

    // Categories Translations
    cat_telephones: "Phones & Accessories",
    cat_ordinateurs: "Computers & Gaming",
    cat_services_digitaux: "Digital Services",
    cat_logiciels_formation: "Software & Training",
    cat_mode_homme: "Men's Fashion",
    cat_mode_femme: "Women's Fashion",
    cat_chaussures_sacs: "Shoes & Bags",
    cat_beaute: "Beauty & Cosmetics",
    cat_maison_deco: "Home & Decor",
    cat_electromenager: "Home Appliances",
    cat_nourriture: "Food & Drinks",
    cat_bebe_enfant: "Baby & Kids",
    cat_sport_gym: "Sport & Fitness",
    cat_sante: "Health & Wellness",
    cat_vehicules: "Cars & Bikes",
    cat_immobilier: "Real Estate",
    cat_construction: "Construction Materials",
    cat_services: "General Services",
    cat_agriculture: "Agriculture & Livestock",
    cat_evenementiel: "Events & Party",
    cat_artisanat: "Art & Crafts",
    cat_autres: "Others",

    // Search & Saved
    searchPlaceholder: "Search products in Burkina Faso...",
    searchResults: "Search Results for",
    searchTitle: "Search",
    noProductsFound: "No products found for",
    mySaved: "Your",
    savedTitle: "Saved Items",
    noSaved: "No saved items yet.",
    browseOffers: "Browse Offers",
    loading: "Loading...",
    startSelling: "Start Selling",
    startSellingFree: "Start Selling Free",
    shopTagline: "Manage your WAGA SHOP",
    freeTagline: "Zero fees. Chat directly with buyers.",
    noShopCreateOne: "No shop? Create one",
    alreadyHaveShop: "Already have a shop? Log in",
    shopNameWhatsappRequired: "Shop name and WhatsApp number are required",
    allSalesWhatsApp: "All sales happen directly on your WhatsApp.",
    welcomeBack: "Welcome Back",
    welcomeTitle: "Welcome to WAGA SHOP 👋",
    sellerHeading: "Are you a seller? Here is why you'll love WAGA SHOP:",
    sellerPerk1Title: "⚡ 0 FCFA Commission",
    sellerPerk1Desc: "Keep 100% of your profits. Zero hidden fees, forever!",
    sellerPerk2Title: "💬 Direct WhatsApp Sales",
    sellerPerk2Desc: "Buyers reach out to you directly. Close deals instantly on your phone.",
    sellerPerk3Title: "⏱️ Shop Ready in 60s",
    sellerPerk3Desc: "Sign up in seconds and start uploading your articles with a single click.",
    sellerCta: "Create My Free Shop Now",
    buyerHeading: "🛍️ Shopping as a Buyer? Grab the best deals in 1 click:",
    buyerPerk1Title: "🛒 No Account Needed",
    buyerPerk1Desc: "Browse freely! Contact sellers instantly without filling long registration forms.",
    buyerPerk2Title: "💬 Direct Negotiation",
    buyerPerk2Desc: "Chat live on WhatsApp and negotiate the price directly with the store owner.",
    buyerPerk3Title: "⚡ Verified Local Deals",
    buyerPerk3Desc: "Find unique items and support top local merchants in Burkina Faso.",
    startShoppingCta: "Explore All Products",
    buyerDesc: "No account required! Browse deals, click 'Can we negotiate?' and chat live with sellers on WhatsApp.",
    view: "View",
    delete: "Delete"
  }
};

interface LanguageThemeContextType {
  language: Language;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  t: (key: keyof typeof translations['FR']) => string;
}

const LanguageThemeContext = createContext<LanguageThemeContextType | undefined>(undefined);

export const LanguageThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('waga_lang');
    if (saved === 'EN' || saved === 'FR') return saved as Language;
    
    // Fallback to browser language if no saved preference
    const browserLang = navigator.language || (navigator as any).userLanguage || '';
    if (browserLang.toLowerCase().startsWith('en')) {
      return 'EN';
    }
    return 'FR'; // Default to FR for all other cases including French
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('waga_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem('waga_lang', language);
    document.documentElement.lang = language.toLowerCase();
  }, [language]);

  useEffect(() => {
    localStorage.setItem('waga_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setLanguage = (lang: Language) => setLanguageState(lang);
  const setTheme = (th: Theme) => setThemeState(th);

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'FR' ? 'EN' : 'FR'));
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const t = (key: keyof typeof translations['FR']): string => {
    return translations[language][key] || translations['FR'][key] || key;
  };

  return (
    <LanguageThemeContext.Provider
      value={{
        language,
        theme,
        setLanguage,
        setTheme,
        toggleLanguage,
        toggleTheme,
        t,
      }}
    >
      {children}
    </LanguageThemeContext.Provider>
  );
};

export const useLanguageTheme = () => {
  const context = useContext(LanguageThemeContext);
  if (!context) {
    throw new Error('useLanguageTheme must be used within a LanguageThemeProvider');
  }
  return context;
};
