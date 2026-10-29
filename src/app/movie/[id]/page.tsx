import { createClient } from "@/lib/supabase/server";
import { getMovieDetails, getImageUrl } from "@/lib/tmdb/server";
import Navbar from "@/components/Navbar";
import AddToListButton from "@/components/AddToListButton";
import Image from "next/image";
import { redirect } from "next/navigation";

interface MoviePageProps {
  params: {
    id: string;
  };
}

const MoviePage = async ({ params }: MoviePageProps) => {
  const supabase = createClient();

  // Get movie details from TMDB
  const movieDetails = await getMovieDetails(Number(params.id));

  if (!movieDetails) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            {/* Backdrop */}
            <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden mb-8 shadow-xl">
              <Image
                src={getImageUrl((movieDetails.backdrop_path || movieDetails.poster_path) as string | null, "original")}
                alt={movieDetails.title || movieDetails.name || ""}
                fill
                className="w-full h-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* Poster */}
              <div className="hidden md:block flex-none w-64 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={getImageUrl(movieDetails.poster_path as string | null, "w500")}
                  alt={movieDetails.title || movieDetails.name || ""}
                  width={256}
                  height={384}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bebas-neue text-text mb-4">
                  {movieDetails.title || movieDetails.name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-6">
                  <span className="text-accent font-medium">
                    {movieDetails.vote_average * 10}% Match
                  </span>
                  <span>{movieDetails.release_date?.split("-")[0]}</span>
                  <span>{movieDetails.runtime?.toString()} min</span>
                  {movieDetails.genres.length > 0 && (
                    <span className="flex gap-2">
                      {movieDetails.genres.slice(0, 3).map((g) => (
                        <span key={g.id} className="text-muted/70">
                          {g.name}
                        </span>
                      ))}
                    </span>
                  )}
                </div>

                <AddToListButton tmdbId={movieDetails.id} mediaType="movie" />

                <div className="mt-8">
                  <h2 className="text-2xl font-bebas-neue text-text mb-4">Overview</h2>
                  <p className="text-base text-text/90 leading-relaxed">
                    {movieDetails.overview}
                  </p>
                </div>

                {movieDetails.spoken_languages.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bebas-neue text-text mb-4">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {movieDetails.spoken_languages.map((lang) => (
                        <span key={lang.iso_639_1} className="px-3 py-1 bg-surface rounded text-sm text-text">
                          {lang.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {movieDetails.production_countries.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-bebas-neue text-text mb-4">Countries</h3>
                    <div className="flex flex-wrap gap-2">
                      {movieDetails.production_countries.map((country) => (
                        <span key={country.iso_3166_1} className="px-3 py-1 bg-surface rounded text-sm text-text">
                          {country.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MoviePage;
