import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import FreeToWatchRow from "@/components/FreeToWatchRow";
import MovieRow from "@/components/MovieRow";
import { getTrending, getPopular, getTopRated, getGenres, Movie } from "@/lib/tmdb/server";
import Link from "next/link";

async function getMoviesForGenre(genreId: number, type: "movie" | "tv" = "movie") {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/${type}?api_key=${process.env.TMDB_API_KEY}&with_genres=${genreId}&language=en-US&page=1`,
      { next: { revalidate: 3600 } }
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(`Failed to fetch movies for genre ${genreId}:`, error);
    return [];
  }
}

export default async function Home() {
  const genres = await getGenres();
  const trending = await getTrending("movie");
  const popular = await getPopular("movie");
  const topRated = await getTopRated("movie");
  const actionMovies = await getMoviesForGenre(28);
  const dramaMovies = await getMoviesForGenre(18);

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

          {actionMovies.length > 0 && (
            <MovieRow
              title="Action Movies"
              movies={actionMovies}
              href={`/movies/genre/${genres.find(g => g.id === 28)?.name?.toLowerCase()}`}
            />
          )}

          {dramaMovies.length > 0 && (
            <MovieRow
              title="Drama Movies"
              movies={dramaMovies}
              href={`/movies/genre/${genres.find(g => g.id === 18)?.name?.toLowerCase()}`}
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
