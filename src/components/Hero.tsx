"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Info } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getTrending, getMovieDetails, getImageUrl, Movie, MovieDetails } from "@/lib/tmdb";

interface HeroProps {
  className?: string;
}

const Hero = async ({ className = "" }: HeroProps) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const trending = await getTrending("movie");
        if (trending.results.length > 0) {
          const firstMovie = trending.results[0];
          setMovie(firstMovie);

          const movieDetails = await getMovieDetails(firstMovie.id);
          setDetails(movieDetails);
        }
      } catch (err) {
        console.error("Failed to fetch hero data:", err);
        setError("Failed to load hero content");
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  if (loading) {
    return (
      <section className={`relative h-[80vh] flex items-center justify-center ${className}`}>
        <div className="text-text text-lg animate-pulse">Loading trending movie...</div>
      </section>
    );
  }

  if (error || !movie || !details) {
    return (
      <section className={`relative h-[80vh] flex items-center justify-center ${className}`}>
        <div className="text-muted text-lg">No trending movies available</div>
      </section>
    );
  }

  const backdropPath = movie.backdrop_path || movie.poster_path;
  const imageUrl = getImageUrl(backdropPath as string | null, "original");
  const posterUrl = getImageUrl(movie.poster_path || null, "w500");

  return (
    <div className="relative h-[80vh] w-full overflow-hidden">
      {/* Backdrop Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={movie.title || movie.name || "Movie backdrop"}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-surface/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-medium mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Trending #1 Today
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-6xl font-bebas-neue text-text mb-4 leading-tight"
          >
            {movie.title || movie.name}
          </motion.h1>

          {/* Meta */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center gap-4 text-sm text-muted mb-4"
          >
            <span>{movie.release_date?.split("-")[0] || "TBD"}</span>
            <span className="w-1 h-1 rounded-full bg-muted" />
            <span>{details.runtime?.toString()} min</span>
            <span className="w-1 h-1 rounded-full bg-muted" />
            <span className="text-accent">{movie.vote_average * 10}% Match</span>
          </motion.div>

          {/* Overview */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-base md:text-lg text-text/90 mb-6 line-clamp-3 leading-relaxed"
          >
            {movie.overview}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href={`/watch/${movie.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-text font-medium rounded-lg hover:bg-accent/90 transition-colors"
              aria-label={`Play ${movie.title || movie.name}`}
            >
              <Play size={20} fill="currentColor" />
              Play
            </Link>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-surface/80 backdrop-blur border border-surface text-text font-medium rounded-lg hover:bg-surface transition-colors"
              aria-label={`More info about ${movie.title || movie.name}`}
            >
              <Info size={20} />
              More Info
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
