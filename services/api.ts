// services/api.ts
import { ENV } from "../config/env";
import { TMDBResponse, TMDBMovie, TMDBTVShow } from "../types/tmdb";

export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: ENV.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${ENV.EXPO_PUBLIC_MOVIE_ACCESS_TOKEN}`,
  },
};

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

export type ContentItem = {
  id: number;
  title: string;               // movie.title OR tv.name
  poster_path?: string | null;
  vote_average?: number;
  release_date?: string | null; // movie.release_date OR tv.first_air_date
  overview?: string;
  genres?: string[];            // Added genres
  type?: "movie" | "tv";        // normalized type
};

export type TrendingItem = {
  id: number | string;
  title: string;
  poster_url: string;
  vote_average?: number;
  type: "movie" | "tv";
  count?: number;
};

export const fetchMovies = async ({ query, page = 1 }: { query: string; page?: number }): Promise<ContentItem[]> => {
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
    : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

  const response = await fetch(endpoint, { method: "GET", headers: TMDB_CONFIG.headers });
  if (!response.ok) throw new Error(`Failed to fetch movies: ${response.statusText}`);

  const data: TMDBResponse<TMDBMovie> = await response.json();
  const results = asArray<TMDBMovie>(data?.results);

  return results.map((m) => ({
    id: m.id,
    title: m.title,
    poster_path: m.poster_path,
    vote_average: m.vote_average,
    release_date: m.release_date,
    overview: m.overview,
    genres: m.genre_ids?.map(String) ?? [], // TMDB gives genre_ids
    type: "movie",
  }));
};

export const fetchTVShows = async ({ query, page = 1 }: { query: string; page?: number }): Promise<ContentItem[]> => {
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/tv?query=${encodeURIComponent(query)}&page=${page}`
    : `${TMDB_CONFIG.BASE_URL}/discover/tv?sort_by=popularity.desc&page=${page}`;

  const response = await fetch(endpoint, { method: "GET", headers: TMDB_CONFIG.headers });
  if (!response.ok) throw new Error(`Failed to fetch TV shows: ${response.statusText}`);

  const data: TMDBResponse<TMDBTVShow> = await response.json();
  const results = asArray<TMDBTVShow>(data?.results);

  return results.map((t) => ({
    id: t.id,
    title: t.name,
    poster_path: t.poster_path,
    vote_average: t.vote_average,
    release_date: t.first_air_date,
    overview: t.overview,
    genres: t.genre_ids?.map(String) ?? [],
    type: "tv",
  }));
};

// Fetch movie details
export const fetchMovieDetails = async (movieId: string): Promise<any> => {
  const response = await fetch(
    `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`,
    { method: "GET", headers: TMDB_CONFIG.headers }
  );
  if (!response.ok) throw new Error(`Failed to fetch movie details: ${response.statusText}`);
  return await response.json();
};

// Fetch TV details
export const fetchTVDetails = async (tvId: string): Promise<any> => {
  const response = await fetch(
    `${TMDB_CONFIG.BASE_URL}/tv/${tvId}?api_key=${TMDB_CONFIG.API_KEY}`,
    { method: "GET", headers: TMDB_CONFIG.headers }
  );
  if (!response.ok) throw new Error(`Failed to fetch TV details: ${response.statusText}`);
  return await response.json();
};


// Fetch detailed info for genres
export const fetchMovieGenres = async (): Promise<Record<number, string>> => {
  const response = await fetch(`${TMDB_CONFIG.BASE_URL}/genre/movie/list?api_key=${TMDB_CONFIG.API_KEY}`, { headers: TMDB_CONFIG.headers });
  if (!response.ok) throw new Error("Failed to fetch movie genres");
  const data: { genres: Array<{ id: number; name: string }> } = await response.json();
  return asArray<{ id: number; name: string }>(data?.genres).reduce(
    (acc: Record<number, string>, g) => ({ ...acc, [g.id]: g.name }),
    {}
  );
};

export const fetchTVGenres = async (): Promise<Record<number, string>> => {
  const response = await fetch(`${TMDB_CONFIG.BASE_URL}/genre/tv/list?api_key=${TMDB_CONFIG.API_KEY}`, { headers: TMDB_CONFIG.headers });
  if (!response.ok) throw new Error("Failed to fetch TV genres");
  const data: { genres: Array<{ id: number; name: string }> } = await response.json();
  return asArray<{ id: number; name: string }>(data?.genres).reduce(
    (acc: Record<number, string>, g) => ({ ...acc, [g.id]: g.name }),
    {}
  );
};
