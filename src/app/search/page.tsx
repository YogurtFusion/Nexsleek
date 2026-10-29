"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { searchMovies, Movie, getImageUrl } from "@/lib/tmdb/client";
import Image from "next/image";

const SearchContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 400);

  // Update URL query param as user types
  useEffect(() => {
    const url = new URL(window.location.href);
    if (debouncedQuery) {
      url.searchParams.set("q", debouncedQuery);
      router.push(url.pathname + url.search, { scroll: false });
    } else {
      router.push("/search", { scroll: false });
    }
  }, [debouncedQuery, router]);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim()) {
        setLoading(true);
        try {
          const data = await searchMovies(debouncedQuery);
          setResults(data.results);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
        setHasSearched(true);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8" role="search">
      {/* Search Input */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted" aria-hidden="true">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search movies, TV shows..."
            className="w-full bg-surface border border-surface rounded-xl py-4 pl-12 pr-12 text-lg text-text focus:outline-none focus:border-accent focus:bg-surface/80 transition-all placeholder-muted"
            autoFocus
            aria-label="Search movies and TV shows"
            aria-busy={loading}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                router.push("/search");
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted hover:text-text"
              aria-label="Clear search"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      {hasSearched && (
        <div className="mb-6" aria-live="polite">
          <p className="text-muted">
            {loading
              ? "Searching..."
              : `${results.length} result${results.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" aria-busy="true" aria-label="Loading search results">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="aspect-[2/3] bg-surface/30 rounded-lg animate-pulse" />
              <div className="h-4 w-3/4 bg-surface/30 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-surface/30 rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !hasSearched && (
        <div className="text-center py-20" role="status">
          <div className="mb-6 text-muted">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-lg">Search for movies and TV shows</p>
          </div>
          <p className="text-sm text-muted">
            Try searching for "Action", "Comedy", or a movie title
          </p>
        </div>
      )}

      {/* Results Grid */}
      {!loading && hasSearched && results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" aria-live="polite" aria-label="Search results">
          {results.map((movie) => (
            <a
              key={movie.id}
              href={`/movie/${movie.id}`}
              className="group block focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
              aria-label={`View details for ${movie.title || movie.name}`}
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg aspect-[2/3]">
                <Image
                  src={getImageUrl(movie.poster_path || null, "w500")}
                  alt={(movie.title || movie.name) as string | ""}
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h3 className="mt-3 text-sm font-medium text-text truncate group-hover:text-accent transition-colors">
                {movie.title || movie.name}
              </h3>
              <p className="text-xs text-muted">
                {movie.release_date?.split("-")[0] || "TBD"}
              </p>
            </a>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && hasSearched && results.length === 0 && (
        <div className="text-center py-20" role="status">
          <div className="mb-6 text-muted">
            <p className="text-lg">No results found</p>
          </div>
          <p className="text-sm text-muted">
            Try adjusting your search terms
          </p>
        </div>
      )}
    </div>
  );
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SearchContent />
    </Suspense>
  );
}