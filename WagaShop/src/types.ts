export interface Seller {
  id: string; // auth uid
  businessName: string;
  category: string;
  categories?: string[];
  shopDescription: string;
  logoUrl?: string;
  whatsappNumber: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  createdAt: number;
  isVerified: boolean;
  city?: string;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrls: string[];
  createdAt: number;
  isFeatured: boolean;
  isAvailable: boolean;
  location?: string;
  city?: string;
  whatsappNumber?: string;
  portfolioLink?: string;
  startingPrice?: number;
  deliveryTimeDays?: number;
  status?: 'published' | 'pending';
  
  // Analytics
  views?: number;
  shares?: number;
  whatsappShares?: number;
  facebookShares?: number;
  linkCopies?: number;
}
