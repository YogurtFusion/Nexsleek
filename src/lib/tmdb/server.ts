export interface Movie {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  backdrop_path?: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
}

export interface MovieDetails {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  backdrop_path?: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  runtime?: number;
  status: string;
  tagline?: string;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path?: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { iso_639_1: string; name: string }[];
  budget: number;
  revenue: number;
  homepage?: string;
  imdb_id?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface GenreResponse {
  genres: Genre[];
}

export interface TrailersResponse {
  results: { key: string; name: string; site: string; type: string }[];
}

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";

if (!API_KEY) {
  console.warn("TMDB_API_KEY is not set in environment variables");
}

const BASE_HEADERS = {
  accept: "application/json",
};

const revalidate = 3600;

async function tmdbFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...BASE_HEADERS,
      ...(options?.headers || {}),
    },
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function getGenres(): Promise<Genre[]> {
  try {
    const data = await tmdbFetch<GenreResponse>("/genre/movie/list");
    return data.genres;
  } catch (error) {
    console.error("Failed to fetch genres:", error);
    return [];
  }
}

export async function getTrending(type: "movie" | "tv" = "movie") {
  return tmdbFetch<{ results: Movie[] }>(
    `/trending/${type}/week?api_key=${API_KEY}`
  );
}

export async function getPopular(type: "movie" | "tv" = "movie") {
  return tmdbFetch<{ results: Movie[] }>(
    `/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
  );
}

export async function getTopRated(type: "movie" | "tv" = "movie") {
  return tmdbFetch<{ results: Movie[] }>(
    `/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`
  );
}

export async function getByGenre(
  genreId: number,
  type: "movie" | "tv" = "movie"
) {
  return tmdbFetch<{ results: Movie[] }>(
    `/discover/${type}?api_key=${API_KEY}&with_genres=${genreId}&language=en-US&page=1`
  );
}

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  return tmdbFetch<MovieDetails>(
    `/movie/${id}?api_key=${API_KEY}&language=en-US&append_to_response=credits,credits`
  );
}

export async function getTrailerKey(id: number): Promise<string | null> {
  try {
    const data = await tmdbFetch<TrailersResponse>(
      `/movie/${id}/videos?api_key=${API_KEY}&language=en-US`
    );
    const trailer = data.results.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );
    return trailer?.key || null;
  } catch (error) {
    console.error("Failed to fetch trailer:", error);
    return null;
  }
}

export function getImageUrl(path: string | null, size: "w500" | "original" = "w500"): string {
  if (!path) return "/placeholder-movie.png";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getPosterUrl(path: string | null, size: "w500" | "original" = "w500"): string {
  return getImageUrl(path, size);
}

export function getBackdropUrl(path: string | null, size: "original" = "original"): string {
  return getImageUrl(path, size);
}
