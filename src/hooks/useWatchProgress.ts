import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/browser";

const supabase = createClient();

export function useWatchProgress(videoId: string, duration: number) {
  const [progress, setProgress] = useState(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: progress } = await supabase
        .from("watch_progress")
        .select("seconds_watched")
        .eq("user_id", user.id)
        .eq("video_id", videoId)
        .single();

      if (progress) {
        setProgress(progress.seconds_watched);
      }
    };

    loadProgress();
  }, [videoId]);

  // Save progress with debounce
  const saveProgress = useCallback(
    (time: number) => {
      if (!saveTimeoutRef.current) {
        saveTimeoutRef.current = setTimeout(async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // First check if record exists
          const { data: existing } = await supabase
            .from("watch_progress")
            .select("id")
            .eq("user_id", user.id)
            .eq("video_id", videoId)
            .single();

          if (existing) {
            // Update existing record
            await supabase
              .from("watch_progress")
              .update({
                seconds_watched: Math.floor(time),
                duration,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existing.id);
          } else {
            // Insert new record
            await supabase
              .from("watch_progress")
              .insert({
                user_id: user.id,
                video_id: videoId,
                seconds_watched: Math.floor(time),
                duration,
                updated_at: new Date().toISOString(),
              });
          }

          saveTimeoutRef.current = null;
        }, 1000);
      }
    },
    [videoId, duration]
  );

  // Track progress every 10 seconds and on pause
  const handleTimeUpdate = (time: number) => {
    setProgress(time);
    // Save every 10 seconds
    if (Math.floor(time) % 10 === 0) {
      saveProgress(time);
    }
  };

  const handlePause = (time: number) => {
    saveProgress(time);
  };

  const handleUnmount = async (time: number) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    saveProgress(time);
  };

  return { progress, saveProgress, handleTimeUpdate, handlePause, handleUnmount };
}
