"use client";
import { useState } from "react";
import Link from "next/link";
import { STAGES, useSwarm, type Stage } from "@/lib/swarm";
import { useStore } from "@/lib/store";
import { Badge, PageHeader, Stat, Reveal, ErrorBox } from "@/components/ui";
import { HorizontalPipelineMap } from "@/components/HorizontalPipelineMap";
import { NotionSyncModal } from "@/components/NotionSyncModal";
import { WorkforceFleetCard } from "@/components/agents/WorkforceFleetCard";
import { PreSubmissionModal } from "@/components/agents/PreSubmissionModal";
import { PlatformGuardrailsModal } from "@/components/agents/PlatformGuardrailsModal";
import { Key, Zap, X, SlidersHorizontal, Eye, ArrowLeft, ShieldCheck } from "lucide-react";


const STAGE_LABELS: Record<Stage, string> = {
  discovery: "300 Discovery Agents (LinkedIn, JobStreet, Indeed, Glassdoor)",
  analysis: "Local LLM Analysis (Requirement extraction)",
  matching: "Candidate Compatibility (Deterministic 6-factor score)",
  resumes: "300 Resume Tailoring Agents (Multi-format per-job tailoring, anti-hallucination)",
  applications: "400 Independent Application Agents (Form autofill & parallel apply)",
};

export default function AgentsPage() {
  const {
    running,
    workers,
    active,
    counts,
    feed,
    elapsed,
    readyCount,
    results,
    bots,
    pools,
    start,
    stop,
    fetchResults,
    verifyBot,
  } = useSwarm();

  const profile = useStore((s) => s.profile);
  const setNotion = useStore((s) => s.setNotion);
  const appConfig = useStore((s) => s.appConfig);

  const [selectedWorkers, setSelectedWorkers] = useState(1000);
  const [targetQuery, setTargetQuery] = useState(profile.headline || "AI Engineer, Full Stack, Machine Learning");
  const [activeTab, setActiveTab] = useState<"diagram" | "stages" | "results">("diagram");

  // Platform Login Credentials Modal
  const [showCreds, setShowCreds] = useState(false);

  // Notion database modal
  const [showNotionModal, setShowNotionModal] = useState(false);
  const [targetJobsGoal, setTargetJobsGoal] = useState<number>(1000);
  const [previewApp, setPreviewApp] = useState<{ id: string; company: string; role: string; matchScore: number } | null>(null);

  const totQ = Object.values(counts).reduce((acc, c) => acc + c.queued, 0);
  const totD = Object.values(counts).reduce((acc, c) => acc + c.done, 0);

  const handleStart = async (num: number) => {
    setSelectedWorkers(num);
    const queries = targetQuery.split(",").map((s) => s.trim()).filter(Boolean);
    const creds: Record<string, string> = { mode: "guardrails_active" };

    await start(num, queries.length ? queries : ["AI Engineer"], creds, targetJobsGoal);
  };

  return (
    <>
      <PageHeader
        title="Your Auto-Apply Agents"
        sub="Parallel dynamic workforce scaling up to 50,000 agents: live discovery, per-job multi-format resume construction, parallel application submission, and Notion synchronization."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard"
              className="btn text-xs flex items-center gap-1.5 hover:border-black"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <Link
              href="/resume"
              className="btn text-xs flex items-center gap-1.5 hover:border-black"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Resume & Apply Configs</span>
            </Link>

            <button className="btn text-xs flex items-center gap-1.5" onClick={() => setShowCreds(true)}>
              <Key className="w-3.5 h-3.5" />
              <span>Logins</span>
            </button>
            <button
              className="btn text-xs bg-bg2 border border-line flex items-center gap-1.5"
              onClick={() => setShowNotionModal(true)}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Notion Sync</span>
            </button>
          </div>
        }
      />

      {/* Workforce Fleet Scaler */}
      <div className="mb-4">
        <WorkforceFleetCard
          workers={selectedWorkers}
          onWorkersChange={setSelectedWorkers}
          targetJobs={targetJobsGoal}
          onTargetJobsChange={setTargetJobsGoal}
          running={running}
          onStart={handleStart}
          onStop={stop}
          activeCount={active}
          discoveredCount={totD}
        />
      </div>

      {/* Target query & platform liking configure */}
      {!running && (
        <div className="card p-3.5 mb-4 bg-bg2/40 border border-line">
          <label className="label-xs" htmlFor="tq">Target Roles & Domain Keywords (Comma-Separated)</label>
          <input
            id="tq"
            className="input mt-1 w-full text-xs font-mono"
            value={targetQuery}
            onChange={(e) => setTargetQuery(e.target.value)}
            placeholder="AI Systems Engineer, Principal Architect, Full Stack Developer"
          />
        </div>
      )}


      {/* Platform Login Credentials & Guardrails Modal */}
      {showCreds && (
        <PlatformGuardrailsModal onClose={() => setShowCreds(false)} />
      )}

      {/* Notion Database Link & Sync Modal */}
      <NotionSyncModal
        show={showNotionModal}
        onClose={() => setShowNotionModal(false)}
        onSuccess={(data) => {
          setNotion({
            connected: true,
            databaseId: data.database_id,
            databaseName: data.database_name,
            databaseUrl: data.database_url,
          });
        }}
      />

      {/* Workforce Top Summary */}
      <section aria-label="Workforce Totals" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-4">
        <Stat label="Workers Configured" value={running ? workers : selectedWorkers} />
        <Stat label="Active Parallel Agents" value={active} i={1} />
        <Stat label="Tasks Queued" value={totQ} i={2} />
        <Stat label="Tasks Completed" value={totD} i={3} />
        <Stat label="Applications Ready" value={readyCount} i={4} />
      </section>

      {/* Tabs */}
      <div className="flex gap-3 sm:gap-4 border-b border-line mb-4 font-mono text-xs overflow-x-auto">
        <button
          className={`pb-2 font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "diagram" ? "border-black text-ink" : "border-transparent text-muted hover:text-ink"
          }`}
          onClick={() => setActiveTab("diagram")}
        >
          Interactive Agent Network
        </button>
        <button
          className={`pb-2.5 font-bold border-b-2 transition-colors ${
            activeTab === "stages" ? "border-black text-ink" : "border-transparent text-muted hover:text-ink"
          }`}
          onClick={() => setActiveTab("stages")}
        >
          Application Steps & Live Feed
        </button>
        <button
          className={`pb-2.5 font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "results" ? "border-black text-ink" : "border-transparent text-muted hover:text-ink"
          }`}
          onClick={() => {
            setActiveTab("results");
            fetchResults();
          }}
        >
          Discovered Jobs & Applications
          {results.length > 0 && <Badge>{results.length}</Badge>}
        </button>
      </div>

      {activeTab === "diagram" ? (
        <HorizontalPipelineMap
          running={running}
          activeCount={active}
          totalWorkers={running ? workers : selectedWorkers}
          pools={pools}
          sampleBots={bots}
          onVerifyBot={verifyBot}
        />
      ) : activeTab === "stages" ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Stage breakdown */}
          <section aria-label="Stages">
            <h2 className="label-xs mb-3">Workforce Task Stages</h2>
            <div className="space-y-3">
              {STAGES.map((stage) => {
                const s = counts[stage];
                const total = s.queued + s.done + s.failed;
                const percent = total > 0 ? Math.round((s.done / total) * 100) : 0;
                return (
                  <div key={stage} className="card p-3.5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm capitalize">{stage} Agents</span>
                      <span className="font-mono text-xs text-muted">
                        {s.done} completed · {s.queued} queued
                      </span>
                    </div>
                    <p className="text-xs text-muted mb-2">{STAGE_LABELS[stage]}</p>
                    <div className="w-full bg-line/40 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-black h-full transition-all duration-300"
                        style={{ width: `${s.queued > 0 ? Math.max(10, percent) : percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-muted text-xs mt-4">
              Principle 05: Prepared applications stop at "Ready for Review". No application is submitted without explicit human approval.
            </p>
          </section>

          {/* Real Live Activity Feed */}
          <section aria-label="Live Stream">
            <h2 className="label-xs mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                Live Worker Activity Stream
                {running && <span className="inline-block w-2 h-2 rounded-full bg-black animate-pulse" />}
              </span>
              <span className="text-xs font-mono text-muted">Elapsed: {elapsed}s</span>
            </h2>

            <div className="card font-mono text-xs h-[420px] overflow-y-auto p-3 space-y-2 bg-bg2/40">
              {feed.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted">
                  Workforce idle. Click "Deploy Workers" above to start processing.
                </div>
              ) : (
                feed.map((l, i) => (
                  <div key={`${l.t}-${l.id}-${i}`} className="flex items-start gap-2.5 leading-snug">
                    <span className="text-muted shrink-0">{l.t}</span>
                    <span className="text-fg font-semibold shrink-0">[{l.id}]</span>
                    <span className="text-dmuted break-words">{l.msg}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      ) : (
        /* Results Table */
        <section>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Processed Opportunities & Applications</h2>
              <p className="text-xs text-muted">Generated by the 1,000-Agent parallel workforce.</p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn text-xs bg-bg2 border border-line flex items-center gap-1.5"
                onClick={() => setShowNotionModal(true)}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Mirror to Notion</span>
              </button>
              <button className="btn text-xs" onClick={fetchResults}>
                Refresh Results
              </button>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="card p-8 text-center text-muted text-sm">
              No results gathered yet. Run the workforce or wait for workers to process discovered listings.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="label-xs border-b border-line">
                  <tr>
                    <th scope="col" className="py-2.5">Role</th>
                    <th scope="col">Company</th>
                    <th scope="col">Compatibility</th>
                    <th scope="col">Stage Status</th>
                    <th scope="col" className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-b border-line hover:bg-bg2 transition-colors">
                      <td className="py-3 font-medium">
                        <Link href={`/apply/${r.job.id}`} className="hover:underline font-semibold">
                          {r.job.title}
                        </Link>
                        <div className="text-xs text-muted">{r.job.location} · {r.job.source}</div>
                      </td>
                      <td className="text-dmuted">{r.job.company}</td>
                      <td>
                        {r.match ? (
                          <Badge tone={r.match.score >= 80 ? "ok" : r.match.score >= 60 ? "n" : "warn"}>
                            {r.match.score}% · {r.match.label}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <div className="flex flex-col gap-1 items-start">
                          <Badge tone={r.state === "READY_FOR_REVIEW" || r.state === "APPLIED" ? "ok" : r.state === "BLOCKED" ? "err" : "n"}>
                            {r.state || "PROCESSING"}
                          </Badge>
                          {r.resume_format && <span className="text-[10px] font-mono text-muted">{r.resume_format}</span>}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewApp({
                                id: r.app_id || `a-${r.job.id}`,
                                company: r.job.company,
                                role: r.job.title,
                                matchScore: r.match?.score || 94,
                              })
                            }
                            className="btn text-xs py-1 px-2.5 flex items-center gap-1 bg-bg2 border border-line hover:bg-neutral-200 dark:hover:bg-neutral-800"
                            title="View Pre-Submission Filled Form Proof"
                          >
                            <Eye className="w-3 h-3 text-muted" />
                            <span>Form Proof</span>
                          </button>
                          <Link href={`/apply/${r.job.id}`} className="btn text-xs py-1 px-3">
                            Review in Studio
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {previewApp && (
        <PreSubmissionModal
          appId={previewApp.id}
          company={previewApp.company}
          role={previewApp.role}
          matchScore={previewApp.matchScore}
          onClose={() => setPreviewApp(null)}
        />
      )}
    </>
  );
}

