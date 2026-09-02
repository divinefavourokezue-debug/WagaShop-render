export interface Category {
  id: number;
  name: string;
  icon: string;
  slug: string;
  group?: string;
}

export function getCategoryTranslation(cat: Category, t: (key: any) => string): string {
  if (!cat) return '';
  const key = `cat_${cat.slug.replace(/-/g, '_')}`;
  return t(key) || cat.name;
}

export const CATEGORIES: Category[] = [
  // TECH & DIGITAL - YOUR SECTION 🔥
  { id: 1, name: "Téléphones & Accessoires", icon: "📱", slug: "telephones", group: "Tech & Digital" },
  { id: 2, name: "Ordinateurs & Gaming", icon: "💻", slug: "ordinateurs", group: "Tech & Digital" },
  { id: 3, name: "Services Digitaux", icon: "💻", slug: "services-digitaux", group: "Tech & Digital" },
  { id: 4, name: "Logiciels & Formation", icon: "🎓", slug: "logiciels-formation", group: "Tech & Digital" },

  // MODE & BEAUTÉ
  { id: 5, name: "Mode Homme", icon: "👔", slug: "mode-homme", group: "Mode & Beauté" },
  { id: 6, name: "Mode Femme", icon: "👗", slug: "mode-femme", group: "Mode & Beauté" },
  { id: 7, name: "Chaussures & Sacs", icon: "👟", slug: "chaussures-sacs", group: "Mode & Beauté" },
  { id: 8, name: "Beauté & Cosmétiques", icon: "💄", slug: "beaute", group: "Mode & Beauté" },

  // MAISON & VIE
  { id: 9, name: "Maison & Décoration", icon: "🏠", slug: "maison-deco", group: "Maison & Vie" },
  { id: 10, name: "Électroménager", icon: "🔌", slug: "electromenager", group: "Maison & Vie" },
  { id: 11, name: "Nourriture & Boissons", icon: "🍗", slug: "nourriture", group: "Maison & Vie" },
  { id: 12, name: "Bébé & Enfant", icon: "🍼", slug: "bebe-enfant", group: "Maison & Vie" },

  // SPORT & SANTÉ
  { id: 13, name: "Sport & Gym", icon: "💪", slug: "sport-gym", group: "Sport & Santé" },
  { id: 14, name: "Santé & Bien-être", icon: "💊", slug: "sante", group: "Sport & Santé" },

  // AUTO & IMMOBILIER
  { id: 15, name: "Voitures & Motos", icon: "🏍️", slug: "vehicules", group: "Auto & Immobilier" },
  { id: 16, name: "Immobilier", icon: "🏡", slug: "immobilier", group: "Auto & Immobilier" },
  { id: 17, name: "Matériel de Construction", icon: "🧱", slug: "construction", group: "Auto & Immobilier" },

  // BUSINESS & AUTRES
  { id: 18, name: "Services Généraux", icon: "🛠️", slug: "services", group: "Business & Autres" },
  { id: 19, name: "Agriculture & Élevage", icon: "🌾", slug: "agriculture", group: "Business & Autres" },
  { id: 20, name: "Événementiel", icon: "🎉", slug: "evenementiel", group: "Business & Autres" },
  { id: 21, name: "Art & Artisanat", icon: "🎨", slug: "artisanat", group: "Business & Autres" },
  { id: 22, name: "Autres", icon: "📦", slug: "autres", group: "Business & Autres" },
];

