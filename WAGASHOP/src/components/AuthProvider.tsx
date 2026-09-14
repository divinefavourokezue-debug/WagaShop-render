import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Seller } from '../types';

interface AuthContextType {
  user: User | null;
  sellerProfile: Seller | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  sellerProfile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sellerProfile, setSellerProfile] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    // Instant cache lookup for zero lag
    try {
      const cached = localStorage.getItem(`waga_seller_profile_${uid}`);
      if (cached) {
        setSellerProfile(JSON.parse(cached));
      }
    } catch {}

    try {
      const docRef = doc(db, 'sellers', uid);
      let docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        // Quick 300ms fallback check for brand new signups
        await new Promise(res => setTimeout(res, 300));
        docSnap = await getDoc(docRef);
      }
      if (docSnap.exists()) {
        const profile = { id: docSnap.id, ...docSnap.data() } as Seller;
        setSellerProfile(profile);
        try {
          localStorage.setItem(`waga_seller_profile_${uid}`, JSON.stringify(profile));
        } catch {}
      } else {
        setSellerProfile(null);
      }
    } catch (error: any) {
      if (error?.code !== 'unavailable') {
        console.warn("Notice: seller profile unavailable offline:", error?.message || error);
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Unblock UI instantly

      if (currentUser) {
        fetchProfile(currentUser.uid);
      } else {
        setSellerProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, sellerProfile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
