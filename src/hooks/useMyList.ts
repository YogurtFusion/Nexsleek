import { useState, useCallback, useOptimistic } from "react";
import { createClient } from "@/lib/supabase/browser";
import { toast } from "sonner";

const supabase = createClient();

interface MyListItem {
  tmdb_id: number;
  media_type: "movie" | "tv";
}

export function useMyList() {
  const [optimisticItems, addOptimisticItem] = useOptimistic<
    MyListItem[],
    { tmdb_id: number; media_type: "movie" | "tv" }
  >([], (state, item) => [...state, item]);

  const [removeOptimisticItems, removeOptimisticItem] = useOptimistic<
    MyListItem[],
    number
  >([], (state, tmdbId) => state.filter((item) => item.tmdb_id !== tmdbId));

  const toggleItem = useCallback(
    async (tmdbId: number, mediaType: "movie" | "tv") => {
      const item = { tmdb_id: tmdbId, media_type: mediaType };

      // Optimistic add
      addOptimisticItem(item);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save to My List");
        removeOptimisticItem(tmdbId);
        return;
      }

      try {
        // Check if exists
        const { data: existing } = await supabase
          .from("my_list")
          .select("id")
          .eq("user_id", user.id)
          .eq("tmdb_id", tmdbId)
          .eq("media_type", mediaType)
          .single();

        if (existing) {
          // Remove
          const { error } = await supabase
            .from("my_list")
            .delete()
            .eq("id", existing.id);

          if (error) throw error;

          // Optimistic remove after successful delete
          removeOptimisticItem(tmdbId);
          toast.success("Removed from My List");
        } else {
          // Add
          const { error } = await supabase
            .from("my_list")
            .insert([{ user_id: user.id, ...item }]);

          if (error) throw error;

          toast.success("Added to My List");
        }
      } catch (error) {
        console.error("MyList error:", error);
        toast.error("Failed to update My List");
        removeOptimisticItem(tmdbId);
      }
    },
    [addOptimisticItem, removeOptimisticItem]
  );

  const isInList = useCallback(
    (tmdbId: number) => {
      return optimisticItems.some(
        (item) => item.tmdb_id === tmdbId
      );
    },
    [optimisticItems]
  );

  return { toggleItem, isInList };
}
