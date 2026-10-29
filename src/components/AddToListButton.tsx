"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useMyList } from "@/hooks/useMyList";

interface AddToListButtonProps {
  tmdbId: number;
  mediaType?: "movie" | "tv";
}

const AddToListButton = ({
  tmdbId,
  mediaType = "movie",
}: AddToListButtonProps) => {
  const { toggleItem, isInList } = useMyList();
  const [isInListState, setIsInListState] = useState(false);

  useEffect(() => {
    setIsInListState(isInList(tmdbId));
  }, [tmdbId, isInList]);

  const handleToggle = async () => {
    await toggleItem(tmdbId, mediaType);
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isInListState
          ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
          : "bg-surface/50 text-text hover:bg-surface hover:text-red-500"
      }`}
    >
      <Heart
        size={18}
        fill={isInListState ? "currentColor" : "none"}
      />
      <span className="font-medium">
        {isInListState ? "In My List" : "Add to My List"}
      </span>
    </button>
  );
};

export default AddToListButton;
