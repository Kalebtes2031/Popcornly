// contexts/FavoritesContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { db, collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from "@/firebaseConfig";
import { useAuth } from "./AuthContext";

export interface FavoriteMovie {
  id: string; // Firestore doc id
  movieId: number | string;
  title: string;
  poster?: string | null;
  savedAt: string; // ISO string
}

type FavoritesContextType = {
  favorites: FavoriteMovie[];
  loading: boolean;
  addFavorite: (movie: Omit<FavoriteMovie, "id" | "savedAt">) => Promise<void>;
  removeFavorite: (favoriteDocId: string) => Promise<void>;
  isFavorite: (movieId: number | string) => boolean;
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
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Firestore query for current user's favorites
    const q = query(collection(db, "favorites"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const favs: FavoriteMovie[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        favs.push({
          id: doc.id,
          movieId: data.movieId,
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

  const addFavorite = async (movie: Omit<FavoriteMovie, "id" | "savedAt">) => {
    if (!user?.uid) throw new Error("User not authenticated");
    // Avoid duplicate
    if (favorites.some((fav) => fav.movieId === movie.movieId)) return;

    await addDoc(collection(db, "favorites"), {
      userId: user.uid,
      movieId: movie.movieId,
      title: movie.title,
      poster: movie.poster || null,
      savedAt: new Date().toISOString(),
    });
  };

  const removeFavorite = async (favoriteDocId: string) => {
    await deleteDoc(doc(db, "favorites", favoriteDocId));
  };

  const isFavorite = (movieId: number | string) => {
    return favorites.some((fav) => fav.movieId === movieId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, loading, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
