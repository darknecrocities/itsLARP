"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw } from "lucide-react";

interface DemoVideoPlayerProps {
  title: string;
  badge?: string;
  urlBar?: string;
  mp4Src: string;
  webmSrc?: string;
  posterSrc?: string;
  caption?: string;
  autoPlay?: boolean;
  className?: string;
}

export function DemoVideoPlayer({
  title,
  badge = "REAL DEMO RECORDING",
  urlBar = "itslarp.app/dashboard",
  mp4Src,
  webmSrc,
  posterSrc,
  caption,
  autoPlay = true,
  className = "",
}: DemoVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
        setDuration(video.duration);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const restartVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  return (
    <div className={`rounded-xl border border-line bg-bg shadow-xl overflow-hidden font-mono text-xs ${className}`}>
      {/* Mac Window Chrome / Header */}
      <div className="bg-bg2/90 border-b border-line px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Window Dots */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
        </div>

        {/* Browser Mock Address Bar */}
        <div className="flex-1 max-w-md mx-auto bg-bg border border-line rounded px-3 py-1 flex items-center justify-between text-[11px] text-muted truncate">
          <span className="truncate text-ink font-sans flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            https://{urlBar}
          </span>
          <span className="text-[10px] font-mono uppercase text-muted tracking-wider hidden sm:inline">
            720p HD
          </span>
        </div>

        {/* Recording Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono px-2 py-0.5 bg-black text-white rounded font-semibold tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-ping" />
            {badge}
          </span>
        </div>
      </div>

      {/* Video Viewport */}
      <div className="relative group bg-zinc-950 aspect-video overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={posterSrc}
          autoPlay={autoPlay}
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          onClick={togglePlay}
        >
          {webmSrc && <source src={webmSrc} type="video/webm" />}
          <source src={mp4Src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video Overlay Floating Controls on Hover */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end">
          {/* Scrubber Bar */}
          <div
            className="w-full h-1.5 bg-white/20 hover:h-2.5 rounded cursor-pointer transition-all mb-3 relative overflow-hidden"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-white transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="hover:text-emerald-400 transition-colors p-1"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={restartVideo}
                className="hover:text-emerald-400 transition-colors p-1"
                aria-label="Restart"
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
              <span className="text-[11px] font-sans font-medium text-white/90">
                {title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/70 font-mono">
                {Math.floor((progress / 100) * duration)}s / {Math.floor(duration || 0)}s
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

      {/* Caption footer bar */}
      {caption && (
        <div className="p-3 bg-bg border-t border-line flex items-center justify-between text-xs text-muted">
          <span className="text-ink font-sans text-xs">{caption}</span>
          <span className="font-mono text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Live System Capture
          </span>
        </div>
      )}
    </div>
  );
}
