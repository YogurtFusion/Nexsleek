"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/browser";

const supabase = createClient();

interface FreeToWatchRowProps {
  className?: string;
}

const FreeToWatchRow = ({ className = "" }: FreeToWatchRowProps) => {
  const [videos, setVideos] = useState<
    { id: string; title: string; poster_url: string | null; tmdb_id: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreeToWatch = async () => {
      const { data: videos, error } = await supabase
        .from("videos")
        .select("id, title, poster_url, tmdb_id")
        .eq("is_public_domain", true)
        .limit(8);

      if (error) {
        console.error("Failed to fetch free to watch:", error);
        setLoading(false);
        return;
      }

      setVideos(videos);
      setLoading(false);
    };

    fetchFreeToWatch();
  }, []);

  if (loading) {
    return (
      <section className={`mb-12 ${className}`}>
        <div className="h-8 w-48 bg-surface/50 rounded mb-6 animate-pulse" />
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-none w-[200px] h-[300px] bg-surface/30 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (videos.length === 0) return null;

  return (
    <section className={`mb-12 ${className}`}>
      <h2 className="text-2xl font-bebas-neue text-text mb-6">
        Free to Watch
      </h2>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x">
        {videos.map((video) => (
          <div key={video.id} className="flex-none w-[200px] snap-start">
            <Link
              href={`/watch/${video.id}`}
              className="block group relative"
              aria-label={`Watch ${video.title}`}
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg aspect-[2/3]">
                <Image
                  src={video.poster_url || "/placeholder-movie.png"}
                  alt={video.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 left-3 bg-accent/90 text-text text-xs font-medium px-2 py-1 rounded">
                  Free
                </div>
              </div>
              <h3 className="mt-3 text-sm font-medium text-text truncate px-1">
                {video.title}
              </h3>
              <p className="text-xs text-muted px-1">Public Domain</p>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FreeToWatchRow;
