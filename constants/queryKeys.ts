export const queryKeys = {
  trendingMovies: () => ["trendingMovies"] as const,
  trendingTV: () => ["trendingTV"] as const,
  latestMoviesList: () => ["latestMovies", "list"] as const,
  latestMoviesInfinite: () => ["latestMovies", "infinite"] as const,
  latestTVList: () => ["latestTV", "list"] as const,
  latestTVInfinite: () => ["latestTV", "infinite"] as const,
  movieDetails: (id: string | number) => ["movie", String(id)] as const,
  tvDetails: (id: string | number) => ["tv", String(id)] as const,
  movieTrailer: (id: string | number) => ["movie", String(id), "trailer"] as const,
  tvTrailer: (id: string | number) => ["tv", String(id), "trailer"] as const,
  movieWatchProviders: (id: string | number) => ["movie", String(id), "watchProviders"] as const,
  tvWatchProviders: (id: string | number) => ["tv", String(id), "watchProviders"] as const,
} as const;
