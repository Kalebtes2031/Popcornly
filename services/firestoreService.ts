// services/firestoreService.ts
import { db, collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, limit } from "@/firebaseConfig";
import { ContentItem } from "./api";

const METRICS_COLLECTION = "metrics";
const TV_METRICS_COLLECTION = "tvMetrics";

export type TrendingMovieDoc = {
  movie_id: number;
  title: string;
  poster_url: string;
  count: number;
};

export type TrendingTVDoc = {
  tv_id: number;
  title: string;
  poster_url: string;
  count: number;
};

export const updateSearchCount = async (searchTerm: string, item: ContentItem) => {
  try {
    const colRef = collection(db, item.type === "movie" ? METRICS_COLLECTION : TV_METRICS_COLLECTION);
    const q = query(colRef, where("searchTerm", "==", searchTerm));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      console.log("Existing document data:", data);
      console.log("this is colref.path",colRef.path)
      await updateDoc(doc(db, colRef.path, docSnap.id), {
        count: (data.count ?? 0) + 1,
      });
    } else {
      await addDoc(colRef, {
        searchTerm,
        [`${item.type === "movie" ? "movie_id" : "tv_id"}`]: item.id,
        title: item.title,
        poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
        count: 1,
      });
    }
  } catch (err) {
    console.error("Error updating search count:", err);
  }
};

export const getTrendingMovies = async (): Promise<TrendingMovieDoc[]> => {
  const colRef = collection(db, METRICS_COLLECTION);
  const snapshot = await getDocs(query(colRef));
  return snapshot.docs.map((doc) => doc.data() as TrendingMovieDoc);
};

export const getTrendingTVShows = async (): Promise<TrendingTVDoc[]> => {
  const colRef = collection(db, TV_METRICS_COLLECTION);
  const snapshot = await getDocs(query(colRef));
  return snapshot.docs.map((doc) => doc.data() as TrendingTVDoc);
};