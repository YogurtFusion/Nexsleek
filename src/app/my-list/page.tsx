"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMyList } from "@/hooks/useMyList";
import { createClient } from "@/lib/supabase/browser";
import { Movie, getImageUrl } from "@/lib/tmdb/client";
import Image from "next/image";

const supabase = createClient();

const MyListPage = () => {
  const { isInList } = useMyList();
  const [savedMovies, setSavedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


interface MyListItem {
  tmdb_id: number;
  media_type: string;
}
  useEffect(() => {
    const fetchMyList = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: myList, error } = await supabase
        .from("my_list")
        .select("tmdb_id, media_type")
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to fetch my list:", error);
        setError("Failed to load your list. Please try again.");
        setLoading(false);
        return;
      }

      if (myList.length > 0) {
        const movieIds = myList.map((item: MyListItem) => item.tmdb_id);
        
        // Batch fetch movies
        const moviePromises = movieIds.map(async (id: number) => {
          try {
            const response = await fetch(
              `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`
            );
            const data = await response.json();
            return data;
          } catch (error) {
            console.error(`Failed to fetch movie ${id}:`, error);
            return null;
          }
        });

        const movies = await Promise.all(moviePromises);
        setSavedMovies(movies.filter((m): m is Movie => !!m));
      }

      setLoading(false);
    };

    fetchMyList();
  }, []);

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("my_list")
      .select("tmdb_id, media_type")
      .eq("user_id", user.id);

    if (error) {
      setError("Failed to load your list. Please try again.");
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      const movieIds = data.map((item: MyListItem) => item.tmdb_id);
      try {
        const movies = await Promise.all(
          movieIds.map(async (id: number) => {
            const response = await fetch(
              `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`
            );
            return response.json();
          })
        );
        setSavedMovies(movies.filter((m): m is Movie => !!m));
      } catch (error) {
        console.error("Failed to fetch movies:", error);
        setError("Failed to load your list. Please try again.");
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-surface/50 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-[2/3] bg-surface/30 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bebas-neue text-text">My List</h1>
        <span className="text-muted">
          {savedMovies.length} {savedMovies.length === 1 ? "movie" : "movies"}
        </span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/20 border border-destructive/50 rounded-lg flex items-center justify-between">
          <p className="text-destructive">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-accent text-text rounded hover:bg-accent/90 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {savedMovies.length === 0 ? (
        <div className="text-center py-20">
          <div className="mb-4 text-muted">
            Your list is empty
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-accent text-text font-medium rounded-lg hover:bg-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {savedMovies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movie/${movie.id}`}
              className="group block focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
              aria-label={`View details for ${movie.title}`}
            >
              <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={getImageUrl(movie.poster_path || null, "w500")}
                  alt={movie.title || ""}
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-medium text-text group-hover:text-accent transition-colors line-clamp-2">
                  {movie.title}
                </h3>
                <p className="text-xs text-muted">
                  {movie.release_date?.split("-")[0] || "TBD"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListPage;
