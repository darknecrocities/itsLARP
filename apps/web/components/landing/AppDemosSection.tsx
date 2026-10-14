"use client";
import { useState } from "react";
import { FadeIn } from "@/components/motion";
import { DemoVideoPlayer } from "@/components/DemoVideoPlayer";

export function AppDemosSection() {
  const [videoTab, setVideoTab] = useState<"swarm" | "resume" | "notion">("swarm");

  return (
    <section id="app-demos" className="py-20 border-b border-line bg-bg2/40 relative">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn distance={18}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 font-mono text-[11px] font-semibold mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE APPLICATION SCREEN RECORDINGS
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                See itsLARP in Real Action
              </h2>
              <p className="text-dmuted text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Watch actual high-definition screen recordings of itsLARP in operation. See how 1,000 bots coordinate, how APA 7th resumes are verified with zero hallucinations, and how applications auto-mirror directly into Notion.
              </p>
            </div>

            {/* Video Selector Tabs */}
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              <button
                onClick={() => setVideoTab("swarm")}
                className={`px-3 py-2 border rounded transition-all flex items-center gap-2 ${
                  videoTab === "swarm"
                    ? "bg-black text-white border-black shadow-sm font-semibold"
                    : "bg-white text-muted border-line hover:text-ink hover:border-black/30"
                }`}
              >
                <span>1. 1,000-Bot Workforce Swarm</span>
              </button>
              <button
                onClick={() => setVideoTab("resume")}
                className={`px-3 py-2 border rounded transition-all flex items-center gap-2 ${
                  videoTab === "resume"
                    ? "bg-black text-white border-black shadow-sm font-semibold"
                    : "bg-white text-muted border-line hover:text-ink hover:border-black/30"
                }`}
              >
                <span>2. APA 7th Resume Studio</span>
              </button>
              <button
                onClick={() => setVideoTab("notion")}
                className={`px-3 py-2 border rounded transition-all flex items-center gap-2 ${
                  videoTab === "notion"
                    ? "bg-black text-white border-black shadow-sm font-semibold"
                    : "bg-white text-muted border-line hover:text-ink hover:border-black/30"
                }`}
              >
                <span>3. Applications & Notion Sync</span>
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Video Frame */}
        <FadeIn delay={0.15} distance={15}>
          {videoTab === "swarm" && (
            <div>
              <DemoVideoPlayer
                srcMp4="/demos/workforce-swarm-demo.mp4"
                srcWebm="/demos/workforce-swarm-demo.webm"
                poster="/demos/workforce-swarm-demo-poster.jpg"
                title="itsLARP — 1,000 Concurrent Autonomous Bot Swarm (Live Matrix & 2FA Handler)"
                simulatedUrl="https://itslarp.local/agents"
                autoPlay={true}
              />
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-muted px-1">
                <span>Real capture: 300 Discovery Crawlers scanning LinkedIn/JobStreet, 300 Resume Tailors, and 400 Appliers with live 2FA OTP prompt handling.</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live System Capture
                </span>
              </div>
            </div>
          )}

          {videoTab === "resume" && (
            <div>
              <DemoVideoPlayer
                srcMp4="/demos/apa-resume-demo.mp4"
                srcWebm="/demos/apa-resume-demo.webm"
                poster="/demos/apa-resume-demo-poster.jpg"
                title="itsLARP — APA 7th Edition Resume Studio & Tailoring Diff Viewer"
                simulatedUrl="https://itslarp.local/resume"
                autoPlay={true}
              />
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-muted px-1">
                <span>Real capture: Generating academic running heads, formal software project citations, and tailoring skill diffs with 0% hallucinations.</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live System Capture
                </span>
              </div>
            </div>
          )}

          {videoTab === "notion" && (
            <div>
              <DemoVideoPlayer
                srcMp4="/demos/notion-pipeline-demo.mp4"
                srcWebm="/demos/notion-pipeline-demo.webm"
                poster="/demos/notion-pipeline-demo-poster.jpg"
                title="itsLARP — Live Application Tracker & 1-Click Notion Mirror Database"
                simulatedUrl="https://itslarp.local/applications"
                autoPlay={true}
              />
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-muted px-1">
                <span>Real capture: Reviewing staged application answers, tracking live applications, and 1-click database synchronization to Notion.</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live System Capture
                </span>
              </div>
            </div>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
