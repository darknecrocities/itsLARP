"use client";
import { useState } from "react";
import { useStore } from "../../lib/store";
import { api } from "../../lib/api";
import { ChevronDown, ChevronUp, Sparkles, Globe } from "lucide-react";

export function CareerDnaLlmBuilder() {
  const { profile, setProfile } = useStore();
  const [githubUrl, setGithubUrl] = useState(profile.links?.github || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.links?.linkedin || "");
  const [portfolioUrl, setPortfolioUrl] = useState(profile.links?.portfolio || "");
  const [linkedinText, setLinkedinText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [crawling, setCrawling] = useState(false);
  const [refining, setRefining] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [crawlMeta, setCrawlMeta] = useState<{
    github_found?: boolean;
    portfolio_found?: boolean;
    linkedin_found?: boolean;
    engine?: string;
  } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  async function handleCrawlAndConstruct() {
    if (!githubUrl.trim() && !linkedinUrl.trim() && !portfolioUrl.trim() && !linkedinText.trim()) {
      setStatusMsg("Provide at least one source link (GitHub, LinkedIn, or Portfolio URL) or bio text.");
      return;
    }
    setCrawling(true);
    setStatusMsg("Crawling live sources (GitHub API, Portfolio HTML, LinkedIn) and constructing Career DNA with LLM...");
    try {
      const res = await api<{
        ok: boolean;
        engine: string;
        crawl_summary: { github_found: boolean; portfolio_found: boolean; linkedin_found: boolean };
        profile: any;
      }>("/profile/crawl-and-construct", {
        github_url: githubUrl.trim(),
        linkedin_url: linkedinUrl.trim(),
        linkedin_text: linkedinText.trim(),
        portfolio_url: portfolioUrl.trim(),
        custom_instructions: instructions.trim(),
      });
      if (res?.profile) {
        const p = res.profile;
        setProfile({
          name: p.name || profile.name,
          headline: p.headline || profile.headline,
          email: p.email || profile.email,
          phone: p.phone || profile.phone,
          location: p.location || profile.location,
          years: typeof p.years === "number" ? p.years : profile.years,
          education: p.education || profile.education,
          summary: p.summary || profile.summary,
          skills: Array.isArray(p.skills) && p.skills.length > 0 ? p.skills : profile.skills,
          experience: Array.isArray(p.experience) && p.experience.length > 0 ? p.experience : profile.experience,
          projects: Array.isArray(p.projects) && p.projects.length > 0 ? p.projects : profile.projects,
          links: {
            github: p.links?.github || githubUrl || profile.links?.github,
            linkedin: p.links?.linkedin || linkedinUrl || profile.links?.linkedin,
            portfolio: p.links?.portfolio || portfolioUrl || profile.links?.portfolio,
          },
          evidence: Array.isArray(p.evidence) && p.evidence.length > 0 ? p.evidence : profile.evidence,
        });
        setCrawlMeta({ ...res.crawl_summary, engine: res.engine });
        setStatusMsg(
          `Career DNA constructed via ${res.engine === "llm" ? "Local/Cloud LLM" : "Deterministic Evidence Synthesis"}. All fields are editable below.`
        );
      }
    } catch (e: any) {
      setStatusMsg(`Failed to crawl sources: ${e?.message || "Network error"}`);
    } finally {
      setCrawling(false);
    }
  }

  async function handleRefineSummary() {
    setRefining(true);
    setStatusMsg("Refining executive summary with LLM...");
    try {
      const res = await api<{ ok: boolean; refined_text: string }>("/profile/refine-section", {
        section: "Professional Summary",
        current_value: profile.summary || profile.headline || "",
        instruction: instructions || "Write a high-impact, factual engineering summary grounded in verified skills.",
        profile_context: {
          name: profile.name,
          headline: profile.headline,
          years: profile.years,
          skills: profile.skills,
        },
      });
      if (res?.refined_text) {
        setProfile({ summary: res.refined_text });
        setStatusMsg("Executive summary refined with LLM and saved.");
      }
    } catch (e: any) {
      setStatusMsg(`Could not refine summary: ${e?.message || "Error"}`);
    } finally {
      setRefining(false);
    }
  }

  return (
    <div className="border border-neutral-300 bg-white rounded-lg overflow-hidden transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 bg-neutral-50/70 border-b border-neutral-200">
        <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="p-1.5 rounded bg-black text-white">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-black">
                Import Background from Online Links
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 font-medium">
                Auto-fill
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Extract verified achievements from GitHub, LinkedIn, and personal portfolio.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              type="button"
              onClick={() => setEditMode(!editMode)}
              className="px-3 py-1.5 text-xs font-medium border border-neutral-300 bg-white text-black hover:bg-neutral-100 rounded transition"
            >
              {editMode ? "Hide Full Field Editor" : "Edit All Career Fields"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200 rounded transition"
            aria-label={isExpanded ? "Collapse section" : "Expand section"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-4">

      {/* Source URLs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
            GitHub Profile URL or Username
          </label>
          <input
            data-tour="profile-crawler-input"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/torvalds or username"
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white text-black focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
            LinkedIn Profile URL
          </label>
          <input
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/your-handle"
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white text-black focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
            Portfolio / Personal Website URL
          </label>
          <input
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://yourportfolio.dev"
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white text-black focus:outline-none focus:border-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
            Optional LinkedIn Bio / Experience Paste
          </label>
          <textarea
            value={linkedinText}
            onChange={(e) => setLinkedinText(e.target.value)}
            rows={2}
            placeholder="Paste LinkedIn About/Experience text if profile is private..."
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white text-black focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
            LLM Construction Focus / Custom Prompt
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            placeholder="e.g. Emphasize distributed systems, AI agent orchestration, and backend scalability..."
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white text-black focus:outline-none focus:border-black"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-tour="profile-crawler-btn"
            disabled={crawling}
            onClick={handleCrawlAndConstruct}
            className="px-4 py-2 text-xs font-semibold bg-black text-white hover:bg-neutral-800 rounded disabled:opacity-50 transition"
          >
            {crawling ? "Crawling Links & Synthesizing DNA..." : "Crawl Links & Construct Career DNA with LLM"}
          </button>
          <button
            type="button"
            disabled={refining}
            onClick={handleRefineSummary}
            className="px-3 py-2 text-xs font-medium border border-neutral-300 bg-white text-black hover:bg-neutral-100 rounded disabled:opacity-50 transition"
          >
            {refining ? "Refining Summary..." : "LLM Refine Summary"}
          </button>
        </div>

        {crawlMeta && (
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className={`px-2 py-0.5 rounded border ${crawlMeta.github_found ? "bg-black text-white border-black" : "bg-neutral-100 text-neutral-500 border-neutral-300"}`}>
              GitHub: {crawlMeta.github_found ? "Verified" : "None"}
            </span>
            <span className={`px-2 py-0.5 rounded border ${crawlMeta.portfolio_found ? "bg-black text-white border-black" : "bg-neutral-100 text-neutral-500 border-neutral-300"}`}>
              Portfolio: {crawlMeta.portfolio_found ? "Scraped" : "None"}
            </span>
            <span className={`px-2 py-0.5 rounded border ${crawlMeta.linkedin_found ? "bg-black text-white border-black" : "bg-neutral-100 text-neutral-500 border-neutral-300"}`}>
              LinkedIn: {crawlMeta.linkedin_found ? "Linked" : "None"}
            </span>
          </div>
        )}
      </div>

      {statusMsg && (
        <div className="p-2.5 bg-neutral-100 border border-neutral-300 rounded text-xs text-black font-mono">
          {statusMsg}
        </div>
      )}

      {/* Full Inline Career DNA Field Editor */}
      {editMode && (
        <div className="border-t border-neutral-200 pt-4 mt-3 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-black">
            Direct Career DNA Identity & Credentials Editor
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-neutral-600 block mb-1">Full Name</label>
              <input
                value={profile.name || ""}
                onChange={(e) => setProfile({ name: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white text-black"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-600 block mb-1">Professional Headline</label>
              <input
                value={profile.headline || ""}
                onChange={(e) => setProfile({ headline: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white text-black"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-600 block mb-1">Email Address</label>
              <input
                value={profile.email || ""}
                onChange={(e) => setProfile({ email: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white text-black"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-600 block mb-1">Phone</label>
              <input
                value={profile.phone || ""}
                onChange={(e) => setProfile({ phone: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white text-black"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-600 block mb-1">Location</label>
              <input
                value={profile.location || ""}
                onChange={(e) => setProfile({ location: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white text-black"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-600 block mb-1">Years of Experience</label>
              <input
                type="number"
                min={0}
                max={50}
                value={profile.years ?? 0}
                onChange={(e) => setProfile({ years: Number(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white text-black"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-neutral-600 block mb-1">Academic Credentials / Education</label>
            <input
              value={profile.education || ""}
              onChange={(e) => setProfile({ education: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white text-black"
            />
          </div>
          <div>
            <label className="text-[11px] text-neutral-600 block mb-1">Executive / Professional Summary</label>
            <textarea
              rows={3}
              value={profile.summary || ""}
              onChange={(e) => setProfile({ summary: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white text-black"
            />
          </div>
        </div>
      )}
      </div>
    )}
    </div>
  );
}
