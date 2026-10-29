import { createClient } from "@/lib/supabase/server";
import { getMovieDetails, getImageUrl } from "@/lib/tmdb/server";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";

interface ContinueWatchingRowProps {
  className?: string;
}

export default async function ContinueWatchingRow({ className = "" }: ContinueWatchingRowProps) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: progress } = await supabase
    .from("watch_progress")
    .select("video_id, tmdb_id, seconds_watched")
    .eq("user_id", user.id)
    .gt("seconds_watched", 0 as number)
    .limit(8);

  if (!progress || progress.length === 0) {
    return null;
  }

  // Fetch movie details
  const movieIds = progress.map((p: { tmdb_id: number }) => p.tmdb_id);
  const uniqueIds = [...new Set(movieIds)];

  const moviePromises = uniqueIds.map(async (id: number) => {
    try {
      const movie = await getMovieDetails(id);
      const prog = progress.find((p: { tmdb_id: number }) => p.tmdb_id === id);
      return {
        ...movie,
        seconds_watched: prog?.seconds_watched || 0,
      };
    } catch (error) {
      console.error(`Failed to fetch movie ${id}:`, error);
      return null;
    }
  });

  const movies = await Promise.all(moviePromises);
  const validMovies = movies.filter(
    (m): m is typeof m & { seconds_watched: number } => m !== null && m.id !== undefined
  );

  if (validMovies.length === 0) return null;

  return (
    <section className={`mb-12 ${className}`}>
      <h2 className="text-2xl font-bebas-neue text-text mb-6">
        Continue Watching
      </h2>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x">
        {validMovies.map((movie) => (
          <div key={movie.id} className="flex-none w-[200px] snap-start">
            <Link
              href={`/watch/${movie.id}`}
              className="block group relative"
              aria-label={`Resume ${movie.title}`}
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg aspect-[2/3]">
                <Image
                  src={getImageUrl(movie.poster_path || null, "w500")}
                  alt={movie.title || ""}
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-108"
                />
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-accent/20">
                  <div
                    className="h-full bg-accent"
                    style={{
                      width: `${
                        Math.min((movie.seconds_watched / (movie.runtime || 60)) * 100, 100) || 5
                      }%`,
                    }}
                  />
                </div>
                {/* Resume Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-accent rounded-full p-3 shadow-lg">
                    <Play size={24} className="text-text ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
              <h3 className="mt-3 text-sm font-medium text-text truncate px-1">
                {movie.title}
              </h3>
              <p className="text-xs text-muted px-1">
                {movie.release_date?.split("-")[0] || "TBD"} •{" "}
                {Math.floor((movie.seconds_watched || 0) / 60)}min remaining
              </p>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
