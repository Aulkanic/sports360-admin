// src/components/SplashVideo.tsx
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import { Play } from "lucide-react";

export interface SplashVideoProps {
  /** Video source URL */
  src: string;
  /** Whether to show the video overlay */
  show: boolean;
  /** Called exactly once when the video finishes (or guard timeout fires) */
  onEnd: () => void;

  /** Optional callbacks */
  onPlay?: () => void;
  onError?: () => void;

  /** UI text */
  loadingText?: string;
  playButtonText?: string;

  /** UI visibility toggles */
  showLoadingOverlay?: boolean;
  showPlayButton?: boolean;

  /** Styling */
  className?: string;
  videoClassName?: string;

  /** Video behavior */
  autoplay?: boolean;
  controls?: boolean;
  preload?: "none" | "metadata" | "auto";
  muted?: boolean;
  playsInline?: boolean;

  /**
   * Optional guard timeout in ms.
   * If > 0, we’ll end the video once this time passes after metadata is known
   * (duration + small buffer). Prevents being stuck if 'ended' doesn't fire.
   */
  timeoutMs?: number;
}

const SplashVideo: React.FC<SplashVideoProps> = memo(({
  src,
  show,
  onEnd,
  onPlay,
  onError,
  loadingText = "Loading...",
  playButtonText = "Click to Play Video",
  showLoadingOverlay = true,
  showPlayButton = true,
  className = "",
  videoClassName = "",
  autoplay = true,
  controls = false,
  preload = "auto",
  muted = true,
  playsInline = true,
  timeoutMs = 0,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const hasPlayedRef = useRef(false);
  const hasEndedRef = useRef(false);

  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const clearGuardTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const endOnce = useCallback(() => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    clearGuardTimeout();

    // Ensure video is paused
    if (videoRef.current) {
      videoRef.current.pause();
    }

    setIsPlaying(false);
    onEnd();
  }, [clearGuardTimeout, onEnd]);

  const tryPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;

    // Only try once; browsers may block, and that’s okay
    if (!hasPlayedRef.current) {
      v.play().then(
        () => {
          /* started */
        },
        () => {
          /* autoplay blocked; user can click to play */
        }
      );
    }
  }, []);

  const handleVideoClick = useCallback(() => {
    const v = videoRef.current;
    if (!v || hasEndedRef.current) return;
    if (v.paused) {
      v.play().catch(() => {});
    }
  }, []);

  // Build <video> element (no onTimeUpdate end hacks)
  const videoElement = useMemo(
    () => (
      <video
        ref={videoRef}
        autoPlay={autoplay}
        muted={muted}
        playsInline={playsInline}
        loop={false}
        controls={controls}
        preload={preload}
        className={`w-full h-full object-cover ${videoClassName}`}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    ),
    [src, autoplay, muted, playsInline, controls, preload, videoClassName]
  );

  // Wire up events once
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onCanPlay = () => {
      setVideoLoaded(true);
      if (autoplay && !hasPlayedRef.current) {
        tryPlay();
      }
    };

    const onPlayEvt = () => {
      hasPlayedRef.current = true;
      setIsPlaying(true);
      onPlay?.();
    };

    const onLoadedMetadata = () => {
      // Arm a single guard timeout (optional)
      if (timeoutMs > 0) {
        clearGuardTimeout();
        // Use known duration + buffer (or just timeoutMs if duration unknown)
        const durationMs =
          Number.isFinite(v.duration) && v.duration > 0 ? v.duration * 1000 : timeoutMs;
        const guard = Math.max(500, durationMs + 300);
        timeoutRef.current = window.setTimeout(() => {
          // If 'ended' never fired, end gracefully
          endOnce();
        }, guard);
      }

      // If we want autoplay and haven't played yet, try again after metadata
      if (autoplay && !hasPlayedRef.current) {
        tryPlay();
      }
    };

    const onEndedEvt = () => {
      endOnce();
    };

    const onErrorEvt = () => {
      clearGuardTimeout();
      onError?.();
      // Optionally end anyway to avoid being stuck
      endOnce();
    };

    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("play", onPlayEvt);
    v.addEventListener("loadedmetadata", onLoadedMetadata);
    v.addEventListener("ended", onEndedEvt, { once: true } as AddEventListenerOptions);
    v.addEventListener("error", onErrorEvt);

    return () => {
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("play", onPlayEvt);
      v.removeEventListener("loadedmetadata", onLoadedMetadata);
      v.removeEventListener("ended", onEndedEvt as any);
      v.removeEventListener("error", onErrorEvt);
      clearGuardTimeout();
    };
  }, [autoplay, timeoutMs, onPlay, onError, endOnce, tryPlay, clearGuardTimeout]);

  // Reset state whenever we show the overlay
  useEffect(() => {
    const v = videoRef.current;
    hasEndedRef.current = false;
    if (show) {
      setVideoLoaded(false);
      setIsPlaying(false);
      hasPlayedRef.current = false;
      clearGuardTimeout();

      if (v) {
        // Reset to start, ensure muted flag set
        v.currentTime = 0;
        v.muted = muted;

        if (autoplay) {
          // Let the event cycle start the actual play to avoid race conditions
          requestAnimationFrame(() => tryPlay());
        }
      }
    } else {
      clearGuardTimeout();
      if (v) v.pause();
    }
  }, [show, muted, autoplay, tryPlay, clearGuardTimeout]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center ${className}`}
      onClick={handleVideoClick}
      // Prevent accidental clicks on the video re-toggling play/pause
      style={{ cursor: isPlaying ? "default" : "pointer" }}
    >
      {videoElement}

      {/* Loading overlay */}
      {showLoadingOverlay && !videoLoaded && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-pulse text-2xl font-bold mb-4">{loadingText}</div>
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          </div>
        </div>
      )}

      {/* Click-to-play overlay (shown only if loaded but not playing yet) */}
      {showPlayButton && videoLoaded && !isPlaying && !hasEndedRef.current && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto hover:bg-white/30 transition-colors">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
            <div className="text-lg font-semibold">{playButtonText}</div>
          </div>
        </div>
      )}
    </div>
  );
});

SplashVideo.displayName = "SplashVideo";
export default SplashVideo;
