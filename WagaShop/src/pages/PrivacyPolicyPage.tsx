import React from 'react';
import { Shield, Lock, Eye, Server, MapPin, MessageCircle } from 'lucide-react';
import { useLanguageTheme } from '../context/LanguageThemeContext';

export default function PrivacyPolicyPage() {
  const { language } = useLanguageTheme();
  const isFr = language === 'FR';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in space-y-8 mb-20 md:mb-0">
      <div className="bg-white dark:bg-zinc-900/80 p-6 md:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 shadow-sm">
        
        <div className="flex items-center gap-4 mb-8 border-b border-zinc-200 dark:border-white/10 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center shrink-0">
            <Shield size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
              {isFr ? 'Politique de Confidentialité' : 'Privacy Policy'}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">
              {isFr ? 'Dernière mise à jour : Septembre 2026' : 'Last updated: September 2026'}
            </p>
          </div>
        </div>

        <div className="space-y-8 text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm md:text-base">
          
          <section className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
              <Eye size={20} className="text-red-600" />
              {isFr ? '1. Collecte des Données' : '1. Data Collection'}
            </h2>
            <p>
              {isFr 
                ? "WAGA SHOP collecte uniquement les informations nécessaires au fonctionnement de la place de marché numérique. Pour les vendeurs, cela inclut le nom de la boutique, le numéro WhatsApp, la ville, et les informations sur les produits publiés. Pour les visiteurs, aucune création de compte n'est requise pour naviguer sur le site." 
                : "WAGA SHOP collects only the information necessary for the operation of the digital marketplace. For sellers, this includes the shop name, WhatsApp number, city, and information about published products. For visitors, no account creation is required to browse the site."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
              <MessageCircle size={20} className="text-red-600" />
              {isFr ? '2. Communications et WhatsApp' : '2. Communications and WhatsApp'}
            </h2>
            <p>
              {isFr
                ? "La plateforme WAGA SHOP met en relation directe les acheteurs et les vendeurs. Toutes les transactions et communications se font en dehors de l'application, via WhatsApp. Nous ne lisons, ne stockons ni ne surveillons vos conversations WhatsApp."
                : "The WAGA SHOP platform connects buyers and sellers directly. All transactions and communications take place outside the application, via WhatsApp. We do not read, store, or monitor your WhatsApp conversations."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
              <Server size={20} className="text-red-600" />
              {isFr ? '3. Stockage Local (Cookies et Cache)' : '3. Local Storage (Cookies and Cache)'}
            </h2>
            <p>
              {isFr
                ? "Afin d'offrir une expérience rapide et fluide (notamment avec des connexions internet lentes), nous utilisons le stockage local de votre navigateur. Cela permet de sauvegarder vos préférences linguistiques, le thème (clair/sombre), vos articles favoris, et de mettre en cache les images et produits récemment vus. Ces données restent sur votre appareil."
                : "To provide a fast and smooth experience (especially with slow internet connections), we use your browser's local storage. This saves your language preferences, theme (light/dark), favorite items, and caches images and recently viewed products. This data remains on your device."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
              <MapPin size={20} className="text-red-600" />
              {isFr ? '4. Statistiques et Visibilité' : '4. Analytics and Visibility'}
            </h2>
            <p>
              {isFr
                ? "Nous comptabilisons anonymement les vues, les clics et les partages des produits afin d'aider les vendeurs à analyser la popularité de leurs articles. Ces statistiques ne sont liées à aucune information personnelle d'identification de l'acheteur."
                : "We anonymously track product views, clicks, and shares to help sellers analyze the popularity of their items. These statistics are not linked to any personally identifiable information of the buyer."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
              <Lock size={20} className="text-red-600" />
              {isFr ? '5. Sécurité des Vendeurs' : '5. Seller Security'}
            </h2>
            <p>
              {isFr
                ? "L'authentification des vendeurs est sécurisée par Google Firebase. Les mots de passe et les identifiants de connexion sont cryptés et gérés de manière sécurisée par les serveurs d'authentification de Firebase. Nous ne vendons en aucun cas vos informations professionnelles à des tiers."
                : "Seller authentication is secured by Google Firebase. Passwords and login credentials are encrypted and managed securely by Firebase authentication servers. Under no circumstances do we sell your business information to third parties."}
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
