"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useJobs } from "@/lib/useJobs";
import { useStore } from "@/lib/store";
import { useSwarm } from "@/lib/swarm";
import { apiGet } from "@/lib/api";
import { Badge, Empty, PageHeader, Reveal, Stat } from "@/components/ui";
import { LLMRecommendationsCard } from "@/components/LLMRecommendationsCard";
import { AgentQuestionsDrawer } from "@/components/AgentQuestionsDrawer";
import {
  FileText,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Check,
  Download,
  ExternalLink,
  Bot
} from "lucide-react";

export default function Dashboard() {
  const { apps, setApps, profile, fetchQuestions } = useStore();
  const { data: jobs, isLoading } = useJobs();
  const feed = useSwarm((s) => s.feed);
  const [activeTab, setActiveTab] = useState<"overview" | "resume">("overview");

  // Sync applications and pending questions from backend database
  useEffect(() => {
    apiGet<any[]>("/applications")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setApps(data);
        }
      })
      .catch(() => {});
    fetchQuestions();
  }, [setApps, fetchQuestions]);

  const topJobs = (jobs || [])
    .filter((j) => (j.match?.score ?? 0) >= 60)
    .sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0))
    .slice(0, 6);

  const count = (status: string) => apps.filter((a) => a.status === status).length;

  return (
    <>
      <PageHeader
        title="Command Workspace"
        sub="Monitor your 50,000-agent workforce, inspect structured Career DNA, review complete resumes, and auto-apply strategic recommendations."
        action={
          <div className="flex gap-2">
            <Link href="/agents" className="btn btn-primary flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              Launch Agents
            </Link>
            <Link href="/jobs" className="btn">
              Discover Jobs
            </Link>
          </div>
        }
      />

      {/* Active Agent Questions / Clarification Notifications */}
      <section className="mb-6">
        <AgentQuestionsDrawer />
      </section>

      {/* Strategic Metrics Overview */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Stat label="Applications Tracked" value={apps.length} />
        <Stat label="Interviews Scheduled" value={count("INTERVIEW")} i={1} />
        <Stat label="Offers Received" value={count("OFFER")} i={2} />
        <Stat label="Opportunities Scored" value={jobs?.length ?? 0} i={3} />
      </section>

      {/* LLM Strategic Recommendations Engine with 1-Click Auto-Apply */}
      <section className="mb-8">
        <LLMRecommendationsCard />
      </section>

      {/* Workspace Tabs: Overview vs Complete Resume Studio */}
      <div className="flex items-center gap-2 border-b border-line mb-6 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`text-xs font-mono py-1.5 px-3.5 rounded transition-all ${
            activeTab === "overview"
              ? "bg-black text-white font-semibold"
              : "text-muted hover:text-ink"
          }`}
        >
          High-Yield Opportunities & Live Workforce
        </button>
        <button
          onClick={() => setActiveTab("resume")}
          className={`text-xs font-mono py-1.5 px-3.5 rounded flex items-center gap-1.5 transition-all ${
            activeTab === "resume"
              ? "bg-black text-white font-semibold"
              : "text-muted hover:text-ink"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Complete Career DNA & Resume Preview
        </button>
      </div>

      {activeTab === "overview" ? (
        <div className="grid lg:grid-cols-2 gap-8">
          <Reveal i={1}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">High-Compatibility Roles</h2>
              <Link href="/jobs" className="text-xs text-muted hover:underline flex items-center gap-1">
                View all ({jobs?.length || 0}) <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {!profile.skills.length ? (
              <Empty title="No Career DNA" hint="Upload your resume to discover compatible roles.">
                <Link href="/onboarding" className="btn btn-primary">
                  Onboarding
                </Link>
              </Empty>
            ) : topJobs.length === 0 ? (
              <div className="card p-6 text-center text-muted text-sm">
                {isLoading ? "Searching live job feeds..." : "No roles scored above 60% yet. Search new roles."}
              </div>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {topJobs.map((j) => (
                  <li key={j.id}>
                    <Link
                      href={`/apply/${j.id}`}
                      className="flex justify-between items-center py-3 hover:bg-bg2 px-2 transition-colors rounded"
                    >
                      <div>
                        <span className="font-semibold">{j.title}</span>
                        <span className="text-muted text-sm"> · {j.company}</span>
                        <div className="text-xs text-dmuted">
                          {j.location} {j.remote && "· Remote"} {j.employment_type && `· ${j.employment_type}`}
                        </div>
                      </div>
                      {j.match && (
                        <Badge tone={j.match.score >= 80 ? "ok" : "n"}>
                          {j.match.score}% · {j.match.label}
                        </Badge>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>

          <Reveal i={2}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">Autonomous Workforce Telemetry</h2>
              <Link href="/agents" className="text-xs text-muted hover:underline flex items-center gap-1">
                Full control center <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="card font-mono text-xs p-3.5 h-64 overflow-y-auto space-y-2 bg-bg2/30">
              {feed.length > 0 ? (
                feed.slice(0, 15).map((l, i) => (
                  <div key={i} className="flex gap-2 truncate">
                    <span className="text-muted shrink-0">{l.t}</span>
                    <span className="text-fg font-semibold shrink-0">[{l.id}]</span>
                    <span className="text-dmuted truncate">{l.msg}</span>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-muted">
                  Workforce is currently idle.{" "}
                  <Link className="underline ml-1 text-fg" href="/agents">
                    Deploy workforce
                  </Link>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      ) : (
        /* Complete Career DNA and Resume In-Dashboard Preview */
        <div className="space-y-6">
          <div className="card p-6 bg-bg border border-line">
            <div className="flex justify-between items-start border-b border-line pb-4 mb-4">
              <div>
                <h3 className="text-2xl font-bold font-sans text-ink">
                  {profile.name || "Candidate Name"}
                </h3>
                <div className="text-sm font-medium text-muted mt-0.5">
                  {profile.headline || "Software / AI Systems Engineer"}
                </div>
                <div className="text-xs text-dmuted font-mono mt-1">
                  {profile.email} · {profile.location || "Remote"} {profile.phone ? `· ${profile.phone}` : ""} · {profile.years} years verified experience
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/profile" className="btn text-xs">
                  Edit in DNA Studio
                </Link>
                <Link href="/resume" className="btn btn-primary text-xs flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Full Export
                </Link>
              </div>
            </div>

            {profile.summary && (
              <div className="mb-4">
                <div className="label-xs mb-1">Professional Abstract</div>
                <p className="text-xs text-neutral-800 leading-relaxed font-serif">
                  {profile.summary}
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <div>
                <div className="label-xs mb-1.5">Verified Technical Stack</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-bg2 border border-line rounded text-xs font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="label-xs mb-1.5">Targeting & Scope</div>
                <div className="text-xs space-y-1 font-mono text-muted">
                  <div>Roles: {profile.target_roles?.join(", ") || "All Roles"}</div>
                  <div>Companies: {profile.target_companies?.join(", ") || "All Companies"}</div>
                  <div>Work Types: {profile.work_types?.join(", ") || "Full-time, Remote"}</div>
                </div>
              </div>
            </div>

            {profile.experience && profile.experience.length > 0 && (
              <div className="mt-6 pt-4 border-t border-line">
                <div className="label-xs mb-2">Employment History</div>
                <div className="space-y-3">
                  {profile.experience.map((exp, idx) => (
                    <div key={idx} className="p-3 bg-bg2 rounded border border-line text-xs">
                      <div className="flex justify-between font-bold text-ink">
                        <span>{exp.title} — {exp.company}</span>
                        <span className="text-muted font-normal font-mono">{exp.start_date || ""} – {exp.end_date || "Present"}</span>
                      </div>
                      <p className="text-muted mt-1 leading-relaxed">{exp.text}</p>
                      {exp.metrics && <div className="text-[11px] font-mono font-medium text-ink mt-0.5">Impact: {exp.metrics}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
