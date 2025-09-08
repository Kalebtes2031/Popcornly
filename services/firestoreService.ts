import {
  db,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  orderBy,
  limit,
} from "@/firebaseConfig"; // Adjust this path to where you have firebase.ts

// Firestore collection name (same as your metrics collection)
const COLLECTION_ID = "metrics";

export const updateSearchCount = async (searchTerm: string, movie: Movie) => {
  try {
    console.log(`updateSearchCount called with searchTerm: "${searchTerm}" and movie:`, movie);

    const metricsRef = collection(db, "metrics");
    const q = query(metricsRef, where("searchTerm", "==", searchTerm));
    const querySnapshot = await getDocs(q);

    console.log("Query results count:", querySnapshot.size);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      console.log("Existing doc found:", docSnap.id, data);

      await updateDoc(doc(db, "metrics", docSnap.id), {
        count: (data.count ?? 0) + 1,
      });
      console.log("Document updated successfully");
    } else {
      console.log("No doc found, creating new document");
      await addDoc(metricsRef, {
        searchTerm,
        movie_id: movie.id,
        title: movie.title,
        count: 1,
        poster_url: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "",
      });
      console.log("New document created successfully");
    }
  } catch (error) {
    console.error("Error updating search count:", error);
  }
};



export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
  try {
    const colRef = collection(db, COLLECTION_ID);
    const q = query(colRef, orderBy("count", "desc"), limit(5));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => doc.data() as TrendingMovie);
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return undefined;
  }
};
