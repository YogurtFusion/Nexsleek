import { createClient } from "@/lib/supabase/server";
import { getMovieDetails } from "@/lib/tmdb/server";
import VideoPlayer from "@/components/VideoPlayer";
import { redirect } from "next/navigation";

interface WatchPageProps {
  params: {
    id: string;
  };
}

const WatchPage = async ({ params }: WatchPageProps) => {
  const supabase = await createClient();

  // Get video from Supabase
  const { data: video, error } = await supabase
    .from("videos")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !video) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bebas-neue text-text mb-4">Video Not Found</h2>
        <p className="text-muted">The requested video could not be found.</p>
      </div>
    );
  }

  // Get movie details from TMDB
  const movieDetails = await getMovieDetails(Number(video.tmdb_id));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Video Player */}
        <VideoPlayer src={video.stream_url} title={video.title} videoId={video.id} />

        {/* Video Details */}
        <div className="mt-8">
          <h1 className="text-3xl md:text-4xl font-bebas-neue text-text mb-4">
            {video.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-6">
            <span>{video.is_public_domain ? "Public Domain" : "Licensed"}</span>
            <span>•</span>
            <span>{movieDetails.release_date?.split("-")[0]}</span>
            <span>•</span>
            <span>{movieDetails.runtime?.toString()} min</span>
          </div>

          <p className="text-base text-text/90 leading-relaxed">
            {video.description || movieDetails.overview}
          </p>

          {/* Watch Progress */}
          <div className="mt-8 p-6 bg-surface/50 rounded-xl">
            <h3 className="text-lg font-medium text-text mb-4">Watch Progress</h3>
            <p className="text-sm text-muted">
              Your watch progress is automatically saved. You can resume from
              where you left off.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
