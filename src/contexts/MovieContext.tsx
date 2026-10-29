"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { MovieDetails, getMovieDetails, getTrailerKey, Movie } from "@/lib/tmdb";

interface MovieContextType {
  isOpen: boolean;
  movie: MovieDetails | null;
  trailerKey: string | null;
  openMovie: (id: number) => void;
  closeModal: () => void;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openMovie = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const [details, trailer] = await Promise.all([
        getMovieDetails(id),
        getTrailerKey(id),
      ]);
      setMovie(details);
      setTrailerKey(trailer);
      setIsOpen(true);
    } catch (error) {
      console.error("Failed to open movie:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setMovie(null);
    setTrailerKey(null);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeModal]);

  // Prevent body scroll when modal is open
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

  return (
    <MovieContext.Provider
      value={{ isOpen, movie, trailerKey, openMovie, closeModal }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovie = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error("useMovie must be used within a MovieProvider");
  }
  return context;
};
