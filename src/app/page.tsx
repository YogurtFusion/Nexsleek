
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import FreeToWatchRow from "@/components/FreeToWatchRow";
import MovieRow from "@/components/MovieRow";
import {
  getTrending,
  getPopular,
  getTopRated,
  getGenres,
  getByGenre,
} from "@/lib/tmdb/server";
import Link from "next/link";

async function HomeContent() {
  const [genres, trending, popular, topRated, actionMovies, dramaMovies] =
    await Promise.all([
      getGenres(),
      getTrending("movie"),
      getPopular("movie"),
      getTopRated("movie"),
      getByGenre(28),
      getByGenre(18),
    ]);

  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />

      <main className="pt-16">
        <Hero />
        <ContinueWatchingRow />
        <FreeToWatchRow />

        <div className="container mx-auto px-4">
          {trending.results.length > 0 && (
            <MovieRow
              title="Trending Movies"
              movies={trending.results}
              href="/movies"
            />
          )}

          {popular.results.length > 0 && (
            <MovieRow
              title="Popular Movies"
              movies={popular.results}
              href="/movies/popular"
            />
          )}

          {topRated.results.length > 0 && (
            <MovieRow
              title="Top Rated"
              movies={topRated.results}
              href="/movies/top-rated"
            />
          )}

          {actionMovies.results.length > 0 && (
            <MovieRow
              title="Action Movies"
              movies={actionMovies.results}
              href={`/movies/genre/${
                genres.find((g) => g.id === 28)?.name?.toLowerCase()
              }`}
            />
          )}

          {dramaMovies.results.length > 0 && (
            <MovieRow
              title="Drama Movies"
              movies={dramaMovies.results}
              href={`/movies/genre/${
                genres.find((g) => g.id === 18)?.name?.toLowerCase()
              }`}
            />
          )}

          {genres.length > 0 && (
            <div className="mt-12 text-center">
              <Link
                href="/movies"
                className="inline-block px-8 py-3 bg-surface border border-surface text-text font-medium rounded-lg hover:bg-accent hover:text-text transition-colors"
              >
                Browse All Movies
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background" />
      }
    >
      <HomeContent />
    </Suspense>
  );
}
