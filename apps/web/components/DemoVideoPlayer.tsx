"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw } from "lucide-react";

interface DemoVideoPlayerProps {
  title: string;
  urlBar?: string;
  mp4Src: string;
  webmSrc?: string;
  posterSrc?: string;
  caption?: string;
  autoPlay?: boolean;
  className?: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function DemoVideoPlayer({
  title,
  urlBar = "itslarp.app/dashboard",
  mp4Src,
  webmSrc,
  posterSrc,
  caption,
  autoPlay = true,
  className = "",
}: DemoVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Play video safely on mount and when source changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    setIsMuted(true);

    const tryAutoPlay = () => {
      const p = video.play();
      if (p !== undefined) {
        p.then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // If browser policy blocks autoplay, we show the clear center play button
          setIsPlaying(false);
        });
      }
    };

    // If already loaded or metadata ready
    if (video.readyState >= 2) {
      tryAutoPlay();
    } else {
      video.addEventListener("loadeddata", tryAutoPlay, { once: true });
    }
  }, [mp4Src, webmSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const restartVideo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = Math.max(0, Math.min(1, pos)) * duration;
  };

  const handleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`rounded-xl border border-line bg-bg shadow-xl overflow-hidden font-sans text-xs ${className}`}>
      {/* Clean Mac Window Header (No Badges) */}
      <div className="bg-bg2/90 border-b border-line px-4 py-2.5 flex items-center justify-between gap-3 select-none">
        {/* Window Dots */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 inline-block" />
        </div>

        {/* Minimal Address Bar */}
        <div className="flex-1 max-w-sm mx-auto bg-bg border border-line rounded px-3 py-1 flex items-center justify-center text-[11px] text-muted truncate">
          <span className="truncate text-ink font-mono flex items-center gap-1.5">
            https://{urlBar}
          </span>
        </div>

        {/* Subtle Play Status */}
        <div className="text-[11px] font-mono text-muted shrink-0 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"}`} />
          <span className="hidden sm:inline">{isPlaying ? "Playing" : "Paused"}</span>
        </div>
      </div>

      {/* Video Viewport with Instant Click-to-Play */}
      <div
        className="relative group bg-zinc-950 aspect-video overflow-hidden cursor-pointer"
        onClick={togglePlay}
      >
        <video
          key={mp4Src}
          ref={videoRef}
          src={mp4Src}
          className="w-full h-full object-cover"
          poster={posterSrc}
          autoPlay={autoPlay}
          loop
          muted={isMuted}
          playsInline
          preload="auto"
        >
          {webmSrc && <source src={webmSrc} type="video/webm" />}
          <source src={mp4Src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Big Center Play Button Overlay when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 transition-opacity">
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
              aria-label="Play Demo Video"
            >
              <Play className="w-7 h-7 translate-x-0.5 fill-black" />
            </button>
            <span className="mt-3 text-xs font-semibold text-white tracking-wide bg-black/60 px-3 py-1 rounded-full border border-white/10">
              Click to Play Demo
            </span>
          </div>
        )}

        {/* Subtle persistent progress bar at very bottom (visible even when controls hidden) */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10 z-10">
          <div
            className="h-full bg-emerald-500 transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Controls Bar on Hover or Pause */}
        <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-200 z-20 flex flex-col justify-end ${
          isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        }`}>
          {/* Interactive Scrubber Bar */}
          <div
            className="w-full h-2 bg-white/20 hover:h-3 rounded cursor-pointer transition-all mb-3 relative overflow-hidden"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-white transition-all duration-75 relative"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-white text-xs select-none">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="hover:text-emerald-400 transition-colors p-1"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={17} /> : <Play size={17} className="fill-white" />}
              </button>
              <button
                onClick={restartVideo}
                className="hover:text-emerald-400 transition-colors p-1"
                aria-label="Restart Video"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={toggleMute}
                className="hover:text-emerald-400 transition-colors p-1"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <span className="text-xs text-white/90 font-medium truncate max-w-xs">
                {title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Live Time Counter: Clearly displays advancing seconds */}
              <span className="text-xs text-white/80 font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <button
                onClick={handleFullscreen}
                className="hover:text-emerald-400 transition-colors p-1"
                aria-label="Fullscreen"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Description Footer (No Badges) */}
      {caption && (
        <div className="p-3.5 bg-bg border-t border-line text-xs text-muted">
          <p className="text-ink leading-relaxed">{caption}</p>
        </div>
      )}
    </div>
  );
}
