import React from 'react';
import { Shield, Lock, Eye, Server, MapPin, MessageCircle, FileText, UserCheck, Trash2 } from 'lucide-react';
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

        <div className="space-y-10 text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm md:text-base">
          
          <div className="bg-slate-50 dark:bg-black/20 p-5 rounded-2xl border border-slate-100 dark:border-white/5 text-sm">
            <p>
              {isFr 
                ? "Chez WAGA SHOP, nous accordons une importance primordiale à la confidentialité et à la sécurité de vos données personnelles. Cette politique de confidentialité détaille les types d'informations que nous recueillons, la manière dont nous les utilisons, les mesures que nous prenons pour les protéger, et vos droits en vertu des lois applicables sur la protection des données."
                : "At WAGA SHOP, we place paramount importance on the privacy and security of your personal data. This privacy policy details the types of information we collect, how we use it, the measures we take to protect it, and your rights under applicable data protection laws."}
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
              <Eye size={20} className="text-red-600" />
              {isFr ? '1. Collecte des Données Personnelles' : '1. Collection of Personal Data'}
            </h2>
            <p>
              {isFr 
                ? "Nous limitons la collecte de données aux informations strictement nécessaires au fonctionnement de la place de marché numérique. Ces informations sont collectées de manière transparente lors de votre utilisation du service." 
                : "We limit data collection to information strictly necessary for the operation of the digital marketplace. This information is collected transparently during your use of the service."}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">{isFr ? "Pour les Vendeurs :" : "For Sellers:"}</strong> {isFr ? "Lors de la création de votre compte, nous recueillons votre adresse e-mail, le nom de votre boutique, votre numéro de téléphone (WhatsApp), votre ville (ex: Ouagadougou), ainsi que les liens vers vos réseaux sociaux. Nous enregistrons également les détails des produits que vous mettez en ligne (descriptions, prix, images)." : "Upon account creation, we collect your email address, shop name, phone number (WhatsApp), city (e.g., Ouagadougou), as well as links to your social networks. We also record details of the products you upload (descriptions, prices, images)."}
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">{isFr ? "Pour les Acheteurs/Visiteurs :" : "For Buyers/Visitors:"}</strong> {isFr ? "Aucune création de compte n'est requise. Nous ne collectons aucune information personnelle d'identification de base. Cependant, nous collectons des données anonymes d'interaction (pages visitées, produits mis en favoris localement)." : "No account creation is required. We do not collect basic personally identifiable information. However, we collect anonymous interaction data (pages visited, locally favorited products)."}
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
              <FileText size={20} className="text-red-600" />
              {isFr ? '2. Utilisation de vos Informations' : '2. Use of Your Information'}
            </h2>
            <p>
              {isFr
                ? "Les données que nous collectons sont utilisées dans des buts précis et légitimes afin d'améliorer votre expérience sur WAGA SHOP :"
                : "The data we collect is used for specific and legitimate purposes to improve your experience on WAGA SHOP:"}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
              <li>{isFr ? "Fournir et maintenir la plateforme de mise en relation." : "To provide and maintain the matchmaking platform."}</li>
              <li>{isFr ? "Afficher les informations publiques de votre boutique aux acheteurs potentiels." : "To display your public shop information to potential buyers."}</li>
              <li>{isFr ? "Permettre aux acheteurs de vous contacter directement sur WhatsApp concernant un produit spécifique." : "To allow buyers to contact you directly on WhatsApp regarding a specific product."}</li>
              <li>{isFr ? "Comptabiliser anonymement les vues, clics et partages pour générer des statistiques de performance pour les vendeurs." : "To anonymously track views, clicks, and shares to generate performance statistics for sellers."}</li>
              <li>{isFr ? "Assurer la sécurité de la plateforme en prévenant les activités frauduleuses." : "To ensure platform security by preventing fraudulent activities."}</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
              <MessageCircle size={20} className="text-red-600" />
              {isFr ? '3. Communications, Partage et WhatsApp' : '3. Communications, Sharing, and WhatsApp'}
            </h2>
            <p>
              {isFr
                ? "La philosophie de WAGA SHOP est de faciliter le contact direct sans s'immiscer dans la transaction :"
                : "The philosophy of WAGA SHOP is to facilitate direct contact without interfering in the transaction:"}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              {isFr
                ? "Toutes les négociations, transactions financières et communications se font en dehors de notre application, exclusivement via WhatsApp ou par téléphone. Nous ne lisons, ne stockons, ni ne surveillons le contenu de vos messages WhatsApp. WAGA SHOP ne partage ni ne vend aucune de vos données professionnelles à des annonceurs tiers ou à des courtiers en données."
                : "All negotiations, financial transactions, and communications take place outside our application, exclusively via WhatsApp or by phone. We do not read, store, or monitor the content of your WhatsApp messages. WAGA SHOP does not share or sell any of your business data to third-party advertisers or data brokers."}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
              <Server size={20} className="text-red-600" />
              {isFr ? '4. Cookies, Stockage Local et Cache' : '4. Cookies, Local Storage, and Cache'}
            </h2>
            <p>
              {isFr
                ? "Pour garantir une navigation ultra-rapide (particulièrement adaptée aux réseaux mobiles fluctuants), notre application utilise de manière intensive les technologies de stockage local du navigateur :"
                : "To guarantee ultra-fast browsing (particularly suited to fluctuating mobile networks), our application intensively uses browser local storage technologies:"}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
              <li>{isFr ? "Vos préférences de langue (Français/Anglais) et de thème (Clair/Sombre) sont sauvegardées localement." : "Your language (French/English) and theme (Light/Dark) preferences are saved locally."}</li>
              <li>{isFr ? "Vos produits favoris sont stockés dans la mémoire de votre appareil." : "Your favorite products are stored in your device's memory."}</li>
              <li>{isFr ? "Le flux de produits est mis en cache pour vous permettre d'ouvrir l'application quasi-instantanément sans consommer de données supplémentaires." : "The product feed is cached to allow you to open the app almost instantly without consuming extra data."}</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
              <Lock size={20} className="text-red-600" />
              {isFr ? '5. Sécurité et Hébergement' : '5. Security and Hosting'}
            </h2>
            <p>
              {isFr
                ? "La protection de vos données est assurée par une infrastructure robuste :"
                : "The protection of your data is ensured by a robust infrastructure:"}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              {isFr
                ? "L'infrastructure de WAGA SHOP est hébergée sur Google Cloud et propulsée par Google Firebase. Les mots de passe des vendeurs sont cryptés grâce à des protocoles de hachage de pointe et ne sont jamais visibles, même par nos administrateurs. Toutes les transmissions de données (entre votre appareil et nos serveurs) sont chiffrées (HTTPS/SSL)."
                : "The WAGA SHOP infrastructure is hosted on Google Cloud and powered by Google Firebase. Seller passwords are encrypted using state-of-the-art hashing protocols and are never visible, even to our administrators. All data transmissions (between your device and our servers) are encrypted (HTTPS/SSL)."}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
              <Trash2 size={20} className="text-red-600" />
              {isFr ? '6. Conservation et Suppression des Données' : '6. Data Retention and Deletion'}
            </h2>
            <p>
              {isFr
                ? "Nous conservons vos données aussi longtemps que votre compte vendeur est actif. Vous avez le contrôle total sur vos publications :"
                : "We retain your data for as long as your seller account is active. You have full control over your publications:"}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
              <li>{isFr ? "Vous pouvez supprimer ou modifier vos produits à tout moment depuis votre tableau de bord. La suppression est définitive et immédiate sur nos serveurs." : "You can delete or modify your products at any time from your dashboard. Deletion is permanent and immediate on our servers."}</li>
              <li>{isFr ? "Si vous souhaitez supprimer définitivement votre compte vendeur et l'intégralité des données qui y sont associées, veuillez nous contacter." : "If you wish to permanently delete your seller account and all associated data, please contact us."}</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
              <UserCheck size={20} className="text-red-600" />
              {isFr ? '7. Modifications de la Politique' : '7. Policy Changes'}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {isFr
                ? "Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment pour refléter les évolutions de nos pratiques ou de la législation en vigueur. Toute modification majeure sera signalée par une notification sur l'application."
                : "We reserve the right to modify this privacy policy at any time to reflect changes in our practices or current legislation. Any major modification will be signaled by a notification on the app."}
            </p>
          </section>

          <section className="bg-slate-50 dark:bg-black/20 p-6 rounded-2xl border border-slate-200 dark:border-white/10 mt-12">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">
              {isFr ? 'Nous Contacter' : 'Contact Us'}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              {isFr
                ? "Pour toute question concernant cette politique de confidentialité, l'exercice de vos droits sur vos données, ou des préoccupations liées à la sécurité, vous pouvez nous contacter :"
                : "For any questions regarding this privacy policy, exercising your data rights, or security concerns, you can contact us:"}
            </p>
            <a 
              href="https://wa.me/22666317245" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 font-medium text-red-600 hover:text-red-700 transition-colors mt-4"
            >
              <MessageCircle size={18} />
              {isFr ? 'Contactez-nous sur WhatsApp : +226 66 31 72 45' : 'Contact us on WhatsApp: +226 66 31 72 45'}
            </a>
          </section>

        </div>
      </div>
    </div>
  );
}

