"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Movie, getImageUrl } from "@/lib/tmdb/client";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  href: string;
  isLoading?: boolean;
}

const MovieRow = ({ title, movies, href, isLoading = false }: MovieRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  }, [movies, isHovered]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    const targetScroll = direction === "left"
      ? scrollRef.current.scrollLeft - scrollAmount
      : scrollRef.current.scrollLeft + scrollAmount;
    scrollRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
  };

  const handleScrollChange = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
  };

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-surface/50 rounded animate-pulse" />
          <div className="h-4 w-16 bg-surface/50 rounded animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex-none w-[200px] h-[300px] bg-surface/30 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (movies.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6 group">
        <h2 className="text-2xl font-bebas-neue text-text hover:text-accent transition-colors">
          {title}
        </h2>
        <Link
          href={href}
          className="text-sm font-medium text-muted hover:text-accent transition-colors hidden md:block"
        >
          View All
        </Link>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left Arrow */}
        <button
          onClick={() => handleScroll("left")}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface/80 backdrop-blur rounded-full flex items-center justify-center text-text hover:text-accent hover:bg-accent hover:text-text transition-all ${
            showLeftArrow && isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[-50%] pointer-events-none"
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Movie Grid */}
        <div
          ref={scrollRef}
          onScroll={handleScrollChange}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-none w-[200px] snap-start">
              <Link
                href={`/movie/${movie.id}`}
                className="block group relative"
                aria-label={`View details for ${movie.title || movie.name}`}
              >
                <div className="relative overflow-hidden rounded-lg shadow-lg aspect-[2/3]">
                  <Image
                    src={getImageUrl(movie.poster_path || null, "w500")}
                    alt={movie.title || movie.name || "Movie poster"}
                    fill
                    sizes="(max-width: 768px) 50vw, 200px"
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="mt-3 text-sm font-medium text-text truncate px-1">
                  {movie.title || movie.name}
                </h3>
                <p className="text-xs text-muted px-1">
                  {movie.release_date?.split("-")[0] || "TBD"}
                </p>
              </Link>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => handleScroll("right")}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface/80 backdrop-blur rounded-full flex items-center justify-center text-text hover:text-accent hover:bg-accent hover:text-text transition-all ${
            showRightArrow && isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[50%] pointer-events-none"
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

export default MovieRow;
