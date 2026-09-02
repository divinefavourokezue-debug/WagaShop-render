import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';

interface SavedStore {
  savedItems: Product[];
  toggleSaved: (product: Product) => void;
  isSaved: (productId: string) => boolean;
}

export const useSavedStore = create<SavedStore>()(
  persist(
    (set, get) => ({
      savedItems: [],
      toggleSaved: (product) => set((state) => {
        const exists = state.savedItems.some(item => item.id === product.id);
        if (exists) {
          return { savedItems: state.savedItems.filter(item => item.id !== product.id) };
        }
        return { savedItems: [...state.savedItems, product] };
      }),
      isSaved: (productId) => get().savedItems.some(item => item.id === productId),
    }),
    {
      name: 'waga-shop-saved',
    }
  )
);
