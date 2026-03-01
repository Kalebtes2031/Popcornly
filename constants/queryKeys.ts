export const queryKeys = {
  trendingMovies: () => ["trendingMovies"] as const,
  trendingTV: () => ["trendingTV"] as const,
  latestMoviesList: () => ["latestMovies", "list"] as const,
  latestMoviesInfinite: () => ["latestMovies", "infinite"] as const,
  latestTVList: () => ["latestTV", "list"] as const,
  latestTVInfinite: () => ["latestTV", "infinite"] as const,
  movieDetails: (id: string | number) => ["movie", String(id)] as const,
  tvDetails: (id: string | number) => ["tv", String(id)] as const,
} as const;
