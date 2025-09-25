// contexts/FavoritesContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { db, collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from "@/firebaseConfig";
import { useAuth } from "./AuthContext";

export type FavoriteType = "movie" | "tv";

export interface FavoriteItem {
  id: string; // Firestore doc id
  itemId: number | string; // movieId or tvId
  type: FavoriteType;
  title: string;
  poster?: string | null;
  savedAt: string; // ISO string
}

type FavoritesContextType = {
  favorites: FavoriteItem[];
  loading: boolean;
  addFavorite: (item: Omit<FavoriteItem, "id" | "savedAt">) => Promise<void>;
  removeFavorite: (favoriteDocId: string) => Promise<void>;
  isFavorite: (itemId: number | string, type: FavoriteType) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  loading: true,
  addFavorite: async () => {},
  removeFavorite: async () => {},
  isFavorite: () => false,
});

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(collection(db, "favorites"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const favs: FavoriteItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        favs.push({
          id: doc.id,
          itemId: data.itemId,
          type: data.type,
          title: data.title,
          poster: data.poster || null,
          savedAt: data.savedAt,
        });
      });
      setFavorites(favs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const addFavorite = async (item: Omit<FavoriteItem, "id" | "savedAt">) => {
    if (!user?.uid) throw new Error("User not authenticated");

    // Avoid duplicate of same type and id
    if (favorites.some((fav) => fav.itemId === item.itemId && fav.type === item.type)) return;

    await addDoc(collection(db, "favorites"), {
      userId: user.uid,
      itemId: item.itemId,
      type: item.type,
      title: item.title,
      poster: item.poster || null,
      savedAt: new Date().toISOString(),
    });
  };

  const removeFavorite = async (favoriteDocId: string) => {
    await deleteDoc(doc(db, "favorites", favoriteDocId));
  };

  const isFavorite = (itemId: number | string, type: FavoriteType) => {
    return favorites.some((fav) => fav.itemId === itemId && fav.type === type);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, loading, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);