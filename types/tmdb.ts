// types/tmdb.ts

export interface TMDBMovie {
    id: number;
    title: string;
    original_title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
    overview: string;
    genre_ids: number[];
    popularity: number;
    adult: boolean;
    video: boolean;
    original_language: string;
}

export interface TMDBTVShow {
    id: number;
    name: string;
    original_name: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    vote_average: number;
    vote_count: number;
    overview: string;
    genre_ids: number[];
    popularity: number;
    origin_country: string[];
    original_language: string;
}

export interface TMDBTrendingItem extends Partial<TMDBMovie>, Partial<TMDBTVShow> {
    id: number;
    media_type: 'movie' | 'tv';
}

export interface TMDBResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}

export interface TMDBGenre {
    id: number;
    name: string;
}

export interface TMDBGenresResponse {
    genres: TMDBGenre[];
}
