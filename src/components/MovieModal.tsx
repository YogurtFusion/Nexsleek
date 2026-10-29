"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, X } from "lucide-react";
import { useMovie } from "@/contexts/MovieContext";
import { getImageUrl } from "@/lib/tmdb";

const MovieModal = () => {
  const { isOpen, movie, trailerKey, closeModal } = useMovie();

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!movie) return null;

  const backdropUrl = getImageUrl((movie.backdrop_path || movie.poster_path) as string | null, "original");
  const posterUrl = getImageUrl(movie.poster_path as string | null, "w500");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeModal}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-5xl bg-surface rounded-xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-surface/50 backdrop-blur rounded-full flex items-center justify-center text-text hover:bg-accent hover:text-text transition-colors"
              >
                <X size={24} />
              </button>

              {/* Trailer Section */}
              {trailerKey && (
                <div className="relative w-full aspect-video bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${trailerKey}`}
                    title="Movie Trailer"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Poster */}
                  <div className="hidden md:block flex-none w-48 aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    {/* Title and Rating */}
                    <div className="mb-6">
                      <h2 className="text-3xl md:text-4xl font-bebas-neue text-text mb-4 leading-tight">
                        {movie.title || movie.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                        <span className="text-accent font-medium">
                          {movie.vote_average * 10}% Match
                        </span>
                        <span>{movie.release_date?.split("-")[0]}</span>
                        <span>{movie.runtime?.toString()} min</span>
                        {movie.genres.length > 0 && (
                          <span className="flex gap-2">
                            {movie.genres.slice(0, 3).map((g) => (
                              <span key={g.id} className="text-muted/70">
                                {g.name}
                              </span>
                            ))}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Overview */}
                    <p className="text-base text-text/90 leading-relaxed mb-6">
                      {movie.overview}
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-4">
                      <button className="flex items-center gap-2 px-8 py-3 bg-accent text-text font-medium rounded-lg hover:bg-accent/90 transition-colors">
                        <Play size={20} fill="currentColor" />
                        Play
                      </button>
                      <button className="flex items-center gap-2 px-8 py-3 bg-surface/50 backdrop-blur border border-surface text-text font-medium rounded-lg hover:bg-surface transition-colors">
                        <Plus size={20} />
                        Add to My List
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MovieModal;
