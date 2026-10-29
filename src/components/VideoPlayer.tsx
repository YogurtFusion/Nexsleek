"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Hls from "hls.js";
import { useWatchProgress } from "@/hooks/useWatchProgress";

interface VideoPlayerProps {
  src: string;
  title: string;
  videoId: string;
}

const VideoPlayer = ({ src, title, videoId }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Watch progress tracking
  const { progress, saveProgress, handleTimeUpdate, handlePause, handleUnmount } =
    useWatchProgress(videoId, duration);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Load saved progress on mount
    if (progress > 0) {
      video.currentTime = progress;
    }

    // Initialize HLS if needed
    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      
      hlsRef.current = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current.loadSource(src);
      hlsRef.current.attachMedia(video);

      hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (!progress) {
          video.play().catch(() => setIsPlaying(false));
        }
      });

      hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setHasError(true);
          hlsRef.current?.destroy();
        }
      });

      hlsRef.current.on(Hls.Events.LEVEL_LOADED, () => {
        setIsLoading(false);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        if (!progress) {
          video.play().catch(() => setIsPlaying(false));
        }
      });
      video.addEventListener("error", () => setHasError(true));
    } else {
      // Fallback to native video
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        if (!progress) {
          video.play().catch(() => setIsPlaying(false));
        }
      });
      video.addEventListener("error", () => setHasError(true));
    }

    // Video event listeners
    const handlePlay = () => {
      setIsPlaying(true);
      resetControlsTimeout();
    };

    const handlePause = () => {
      setIsPlaying(false);
      resetControlsTimeout();
      handlePause();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
      saveProgress(video.currentTime);
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered(bufferedEnd);
      }
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleRateChange = () => {
      setPlaybackRate(video.playbackRate);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("ratechange", handleRateChange);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("ratechange", handleRateChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      // Save on unmount
      handleUnmount(currentTime);
    };
  }, [src, progress, resetControlsTimeout, handlePause, handleTimeUpdate, handlePause, handleUnmount, currentTime]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showControls && e.key !== " ") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          seek(10);
          break;
        case "ArrowLeft":
          seek(-10);
          break;
        case "ArrowUp":
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "m":
        case "M":
          toggleMute();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showControls, isPlaying, volume]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const seek = (offset: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + offset));
    setCurrentTime(video.currentTime);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const adjustVolume = (offset: number) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = Math.max(0, Math.min(1, volume + offset));
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (isFullscreen) {
      await document.exitFullscreen();
    } else {
      await containerRef.current.requestFullscreen();
    }
  };

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Playback rate options
  const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-black rounded-lg">
        <div className="text-center text-text">
          <p className="text-lg font-medium mb-2">Playback Error</p>
          <p className="text-sm text-muted mb-4">Please try a different stream</p>
          <button
            onClick={() => {
              setHasError(false);
              if (videoRef.current) {
                videoRef.current.load();
              }
            }}
            className="px-6 py-2 bg-accent text-text rounded-lg hover:bg-accent/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden group"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full max-h-[70vh] object-contain"
        playsInline
        poster="/placeholder-video.jpg"
        aria-label={title}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50" aria-busy="true" aria-label="Loading video">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Bar */}
        <div className="relative mb-3 group/progress">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
            aria-label="Video progress"
            aria-valuenow={Math.round(currentTime)}
            aria-valuemin={0}
            aria-valuemax={Math.round(duration || 100)}
          />
          {/* Buffered progress */}
          {duration > 0 && (
            <div
              className="absolute top-0 left-0 h-1.5 bg-white/20 rounded-lg pointer-events-none"
              style={{
                width: `${(buffered / duration) * 100}%`,
              }}
            />
          )}
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* Left: Play, Volume */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="text-text hover:text-accent transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="text-text hover:text-accent transition-colors"
                aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  const video = videoRef.current;
                  if (video) {
                    video.volume = v;
                    video.muted = v === 0;
                    setIsMuted(v === 0);
                  }
                }}
                className="w-24 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
                aria-label="Volume"
                aria-valuenow={Math.round((isMuted ? 0 : volume) * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>

            <span className="text-sm text-text">
              {new Date(currentTime * 1000).toISOString().substr(14, 5)} /{" "}
              {new Date(duration * 1000).toISOString().substr(14, 5)}
            </span>
          </div>

          {/* Right: Speed, Fullscreen */}
          <div className="flex items-center gap-4">
            <div className="relative group/speed">
              <select
                value={playbackRate}
                onChange={(e) => {
                  const rate = parseFloat(e.target.value);
                  const video = videoRef.current;
                  if (video) {
                    video.playbackRate = rate;
                    setPlaybackRate(rate);
                  }
                }}
                className="appearance-none bg-transparent text-sm text-text hover:text-accent cursor-pointer focus:outline-none"
                aria-label="Playback speed"
              >
                {rates.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}x
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={toggleFullscreen}
              className="text-text hover:text-accent transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {isFullscreen ? (
                  <path d="M1 8l3-3m0 0L7 4m-7 3h14M1 16l3 3m0 0L7 20m-7-3h14" />
                ) : (
                  <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Title Overlay */}
      <div
        className={`absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded text-sm text-text transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {title}
      </div>
    </div>
  );
};

export default VideoPlayer;
