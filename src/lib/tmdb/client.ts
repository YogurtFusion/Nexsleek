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

export interface SearchResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.themoviedb.org/3";

if (!API_KEY) {
  console.warn("NEXT_PUBLIC_TMDB_API_KEY is not set in environment variables");
}

const BASE_HEADERS = {
  accept: "application/json",
};

export async function searchMovies(query: string) {
  if (!API_KEY) {
    return { results: [], total_pages: 0, total_results: 0, page: 1 };
  }

  if (!query.trim()) {
    return { results: [], total_pages: 0, total_results: 0, page: 1 };
  }

  const encodedQuery = encodeURIComponent(query);
  const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodedQuery}&page=1&include_adult=false`;

  try {
    const response = await fetch(url, {
      headers: BASE_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }

    const data = await response.json() as SearchResponse;
    return data;
  } catch (error) {
    console.error("Search error:", error);
    return { results: [], total_pages: 0, total_results: 0, page: 1 };
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
