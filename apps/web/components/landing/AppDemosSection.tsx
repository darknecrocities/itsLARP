"use client";
import { useState } from "react";
import { DemoVideoPlayer } from "@/components/DemoVideoPlayer";

export function AppDemosSection() {
  const [videoTab, setVideoTab] = useState<"swarm" | "resume" | "notion">("swarm");

  return (
    <section id="app-demos" className="py-16 border-b border-line bg-bg2/40 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
              Watch How It Works
            </h2>
            <p className="text-dmuted text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Real screen recordings of the app in action. See how your AI team searches job boards, writes tailored resumes, and keeps your job search organized.
            </p>
          </div>

          {/* Video Selector Tabs */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 text-xs w-full md:w-auto">
            <button
              onClick={() => setVideoTab("swarm")}
              className={`w-full sm:w-auto px-3.5 py-2 border rounded transition-all flex items-center justify-center sm:justify-start gap-2 ${
                videoTab === "swarm"
                  ? "bg-black text-white border-black shadow-sm font-semibold"
                  : "bg-white text-muted border-line hover:text-ink hover:border-black/30"
              }`}
            >
              <span>1. Finding Jobs Automatically</span>
            </button>
            <button
              onClick={() => setVideoTab("resume")}
              className={`w-full sm:w-auto px-3.5 py-2 border rounded transition-all flex items-center justify-center sm:justify-start gap-2 ${
                videoTab === "resume"
                  ? "bg-black text-white border-black shadow-sm font-semibold"
                  : "bg-white text-muted border-line hover:text-ink hover:border-black/30"
              }`}
            >
              <span>2. Tailoring Resumes</span>
            </button>
            <button
              onClick={() => setVideoTab("notion")}
              className={`w-full sm:w-auto px-3.5 py-2 border rounded transition-all flex items-center justify-center sm:justify-start gap-2 ${
                videoTab === "notion"
                  ? "bg-black text-white border-black shadow-sm font-semibold"
                  : "bg-white text-muted border-line hover:text-ink hover:border-black/30"
              }`}
            >
              <span>3. Automatic Notion Tracking</span>
            </button>
          </div>
        </div>

        {/* Video Player Display (Always visible with full opacity) */}
        <div>
          {videoTab === "swarm" && (
            <DemoVideoPlayer
              key="swarm"
              mp4Src="/demos/workforce-swarm-demo.mp4"
              webmSrc="/demos/workforce-swarm-demo.webm"
              posterSrc="/demos/workforce-swarm-demo-poster.jpg"
              title="AI Assistants Searching Jobs on LinkedIn, JobStreet & Indeed"
              urlBar="itslarp.app/agents"
              autoPlay={true}
              caption="Your AI team searches job platforms 24/7, filters out spam, and matches openings based on your salary and location goals."
            />
          )}

          {videoTab === "resume" && (
            <DemoVideoPlayer
              key="resume"
              mp4Src="/demos/apa-resume-demo.mp4"
              webmSrc="/demos/apa-resume-demo.webm"
              posterSrc="/demos/apa-resume-demo-poster.jpg"
              title="Resume Studio Creating Tailored Resumes for Each Job"
              urlBar="itslarp.app/resume"
              autoPlay={true}
              caption="For each job, the AI customizes your resume bullet points to emphasize relevant projects—with 100% honest work history."
            />
          )}

          {videoTab === "notion" && (
            <DemoVideoPlayer
              key="notion"
              mp4Src="/demos/notion-pipeline-demo.mp4"
              webmSrc="/demos/notion-pipeline-demo.webm"
              posterSrc="/demos/notion-pipeline-demo-poster.jpg"
              title="Job Applications Automatically Synced to Your Notion Board"
              urlBar="itslarp.app/applications"
              autoPlay={true}
              caption="Every job applied to is automatically organized into your personal Notion workspace with status updates, match scores, and interview invites."
            />
          )}
        </div>
      </div>
    </section>
  );
}
