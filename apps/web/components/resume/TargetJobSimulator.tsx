"use client";

import React, { useState, useMemo } from "react";
import {
  Briefcase,
  Sparkles,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  FileText,
  RotateCcw,
  Building,
  Target,
  ExternalLink,
} from "lucide-react";
import { type Profile, type App, type ApplicationConfig } from "@/lib/store";

interface TargetJobSimulatorProps {
  activeProfile: Profile;
  availableJobs: any[];
  apps: App[];
  selectedJob: any | null;
  onSelectJob: (job: any | null) => void;
  appConfig: ApplicationConfig;
  loading?: boolean;
}

export function TargetJobSimulator({
  activeProfile,
  availableJobs,
  apps,
  selectedJob,
  onSelectJob,
  appConfig,
  loading = false,
}: TargetJobSimulatorProps) {
  const [activeTab, setActiveTab] = useState<"curated" | "applications" | "custom">("curated");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Custom JD State
  const [customTitle, setCustomTitle] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [customText, setCustomText] = useState("");

  const candidateSkills = useMemo(() => {
    return (activeProfile.skills || []).map((s) => s.toLowerCase());
  }, [activeProfile.skills]);

  // Filtered jobs from live openings
  const filteredJobs = useMemo(() => {
    return availableJobs.filter((j) => {
      const matchSearch =
        !searchQuery ||
        j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.skills?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat =
        categoryFilter === "all" ||
        (categoryFilter === "ai" && /ai|machine learning|ml|vision|llm/i.test(j.title || "")) ||
        (categoryFilter === "fullstack" && /fullstack|full-stack|frontend|react/i.test(j.title || "")) ||
        (categoryFilter === "backend" && /backend|systems|distributed|platform|devops/i.test(j.title || ""));

      return matchSearch && matchCat;
    });
  }, [availableJobs, searchQuery, categoryFilter]);

  // Match Analytics
  const analytics = useMemo(() => {
    if (!selectedJob) return null;
    const requiredSkills: string[] = selectedJob.skills || [];
    const jobText = `${selectedJob.title || ""} ${selectedJob.description || ""} ${requiredSkills.join(" ")}`.toLowerCase();

    const matched = candidateSkills.filter((s) => jobText.includes(s));
    const missing = requiredSkills.filter((rs) => !candidateSkills.includes(rs.toLowerCase()));

    const totalWeight = Math.max(requiredSkills.length, 5);
    const score = Math.min(98, Math.max(45, Math.round((matched.length / totalWeight) * 100)));

    return {
      score,
      matched,
      missing: missing.slice(0, 6),
      jobTitle: selectedJob.title || "Target Role",
      company: selectedJob.company || "Target Company",
    };
  }, [selectedJob, candidateSkills]);

  const handleApplyCustomJob = () => {
    if (!customTitle.trim() && !customText.trim()) return;
    const mockCustomJob = {
      id: "custom_" + Date.now(),
      title: customTitle.trim() || "Software Engineer",
      company: customCompany.trim() || "Target Enterprise",
      description: customText.trim(),
      skills: customText
        .toLowerCase()
        .match(/\b(python|typescript|react|fastapi|docker|kubernetes|pytorch|sql|aws|go)\b/g) || [],
      location: "Worldwide",
      source: "Custom Paste",
    };
    onSelectJob(mockCustomJob);
  };

  return (
    <div className="space-y-3">
      {/* Header and Renamed Feature Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-2">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-black" />
            Target Job Simulation & Real-Time Tailoring Engine
          </div>
          <p className="text-xs text-neutral-600 mt-0.5">
            Test how autonomous apply bots dynamically re-rank skills, emphasize relevant projects, and tailor your executive summary to any job description.
          </p>
        </div>
        {selectedJob && (
          <button
            type="button"
            onClick={() => onSelectJob(null)}
            className="flex items-center gap-1 text-xs font-mono text-neutral-600 hover:text-black hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to Master DNA
          </button>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex p-0.5 bg-neutral-100 border border-neutral-200 rounded-md text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("curated")}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === "curated" ? "bg-white text-black font-semibold shadow-xs" : "text-neutral-600 hover:text-black"
            }`}
          >
            Curated Openings ({availableJobs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("applications")}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === "applications" ? "bg-white text-black font-semibold shadow-xs" : "text-neutral-600 hover:text-black"
            }`}
          >
            Tracked Applications ({apps.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === "custom" ? "bg-white text-black font-semibold shadow-xs" : "text-neutral-600 hover:text-black"
            }`}
          >
            Paste Custom JD
          </button>
        </div>

        <div className="text-xs font-mono text-neutral-500">
          Active: <strong className="text-black">{selectedJob ? `${selectedJob.title} @ ${selectedJob.company}` : "Master Baseline"}</strong>
        </div>
      </div>

      {/* Mode 1: Curated Openings Selector */}
      {activeTab === "curated" && (
        <div className="space-y-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search live openings by title, company, or skill..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded font-mono focus:outline-none focus:border-black"
              />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono">
              {["all", "ai", "fullstack", "backend"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-1 rounded border uppercase ${
                    categoryFilter === cat ? "bg-black text-white border-black" : "bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
            {filteredJobs.slice(0, 30).map((j) => {
              const isSelected = selectedJob?.id === j.id;
              return (
                <div
                  key={j.id}
                  onClick={() => onSelectJob(j)}
                  className={`p-2.5 rounded border text-left cursor-pointer transition ${
                    isSelected ? "bg-black text-white border-black shadow-xs" : "bg-white text-black border-neutral-200 hover:border-black"
                  }`}
                >
                  <div className="text-xs font-semibold truncate">{j.title}</div>
                  <div className={`text-[11px] truncate flex items-center justify-between ${isSelected ? "text-neutral-300" : "text-neutral-500"}`}>
                    <span>{j.company}</span>
                    <span className="font-mono text-[10px]">{j.location || "Remote"}</span>
                  </div>
                  {j.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {j.skills.slice(0, 3).map((sk: string) => (
                        <span
                          key={sk}
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                            isSelected ? "bg-neutral-800 text-neutral-200 border-neutral-700" : "bg-neutral-100 text-neutral-600 border-neutral-200"
                          }`}
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Tracked Applications */}
      {activeTab === "applications" && (
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
          {apps.length === 0 ? (
            <div className="text-xs text-neutral-500 font-mono text-center py-4">
              No tracked job applications found yet. Browse openings in Jobs or launch Auto-Apply bots to populate this list.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {apps.map((a) => {
                const isSelected = selectedJob?.id === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => onSelectJob({ id: a.id, title: a.role, company: a.company, description: a.role, skills: [] })}
                    className={`p-2.5 rounded border text-left cursor-pointer transition ${
                      isSelected ? "bg-black text-white border-black shadow-xs" : "bg-white text-black border-neutral-200 hover:border-black"
                    }`}
                  >
                    <div className="text-xs font-semibold truncate">{a.role}</div>
                    <div className={`text-[11px] truncate flex items-center justify-between ${isSelected ? "text-neutral-300" : "text-neutral-500"}`}>
                      <span>{a.company}</span>
                      <span className="font-mono text-[10px] uppercase font-semibold">{a.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Custom JD Paste */}
      {activeTab === "custom" && (
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-mono uppercase text-neutral-600 block mb-0.5">Target Role Title</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Senior Machine Learning Engineer"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded font-mono focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-neutral-600 block mb-0.5">Target Company</label>
              <input
                type="text"
                value={customCompany}
                onChange={(e) => setCustomCompany(e.target.value)}
                placeholder="e.g. Anthropic / Scale AI"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded font-mono focus:outline-none focus:border-black"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase text-neutral-600 block mb-0.5">Paste Raw Job Description</label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={3}
              placeholder="Paste job description requirements, qualifications, and responsibilities..."
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded font-mono focus:outline-none focus:border-black"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleApplyCustomJob}
              className="px-4 py-1.5 bg-black text-white text-xs font-mono font-semibold rounded hover:bg-neutral-800 transition"
            >
              Simulate Tailoring for Custom JD
            </button>
          </div>
        </div>
      )}

      {/* Target Job Intelligence & Tailoring Delta Card */}
      {analytics && (
        <div className="p-3 bg-white border border-neutral-300 rounded-lg space-y-2 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded border border-emerald-300">
                {analytics.score}% Match
              </span>
              <span className="text-xs font-semibold text-black">
                {analytics.jobTitle} @ {analytics.company}
              </span>
            </div>
            <div className="text-[11px] font-mono text-neutral-500">
              {loading ? "Re-synthesizing tailored resume..." : "Live Tailored & Evidence-Grounding Active"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[10px] font-mono uppercase text-neutral-500 mb-1">
                Matched Stack ({analytics.matched.length} Skills)
              </div>
              <div className="flex flex-wrap gap-1">
                {analytics.matched.map((sk) => (
                  <span key={sk} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px]">
                    ✓ {sk}
                  </span>
                ))}
                {analytics.matched.length === 0 && (
                  <span className="text-neutral-400 font-mono text-[11px]">No exact keyword overlap</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase text-neutral-500 mb-1">
                Targeted Bot Adjustments
              </div>
              <ul className="space-y-1 text-[11px] text-neutral-700 font-mono">
                <li className="flex items-start gap-1">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Summary:</strong> Aligned with {analytics.company} engineering requirements.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Skills:</strong> Re-ranked matched keywords to top of competency hierarchy.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Projects:</strong> Re-prioritized most relevant technical software artifacts.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
