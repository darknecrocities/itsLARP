"use client";
import { useState } from "react";
import Link from "next/link";
import { STAGES, useSwarm, type Stage } from "@/lib/swarm";
import { useStore } from "@/lib/store";
import { Badge, PageHeader, Stat, Reveal, ErrorBox } from "@/components/ui";
import { HorizontalPipelineMap } from "@/components/HorizontalPipelineMap";
import { api } from "@/lib/api";

const STAGE_LABELS: Record<Stage, string> = {
  discovery: "300 Discovery Bots (LinkedIn, JobStreet, Indeed, Glassdoor)",
  analysis: "Local LLM Analysis (Requirement extraction)",
  matching: "Candidate Compatibility (Deterministic 6-factor score)",
  resumes: "300 Resume Tailoring Bots (APA 7th format, anti-hallucination)",
  applications: "400 Independent Application Bots (Form autofill & staged review)",
};

export default function AgentsPage() {
  const {
    running,
    status,
    workers,
    active,
    counts,
    feed,
    elapsed,
    discoveredCount,
    readyCount,
    blockedCount,
    results,
    bots,
    pools,
    alerts,
    start,
    stop,
    fetchResults,
    verifyBot,
  } = useSwarm();

  const profile = useStore((s) => s.profile);
  const notion = useStore((s) => s.notion);
  const setNotion = useStore((s) => s.setNotion);
  const apps = useStore((s) => s.apps);

  const [selectedWorkers, setSelectedWorkers] = useState(1000);
  const [targetQuery, setTargetQuery] = useState(profile.headline || "AI Engineer, Full Stack, Machine Learning");
  const [activeTab, setActiveTab] = useState<"diagram" | "stages" | "results">("diagram");

  // Platform Login Credentials Modal
  const [showCreds, setShowCreds] = useState(false);
  const [linkedInUser, setLinkedInUser] = useState("");
  const [jobstreetUser, setJobstreetUser] = useState("");
  const [indeedUser, setIndeedUser] = useState("");

  // Notion 1-click modal
  const [showNotionModal, setShowNotionModal] = useState(false);
  const [notionToken, setNotionToken] = useState(notion.token || "");
  const [notionMsg, setNotionMsg] = useState("");
  const [notionBusy, setNotionBusy] = useState(false);
  const [notionError, setNotionError] = useState("");

  const totQ = Object.values(counts).reduce((acc, c) => acc + c.queued, 0);
  const totD = Object.values(counts).reduce((acc, c) => acc + c.done, 0);

  const handleStart = async (num: number) => {
    setSelectedWorkers(num);
    const queries = targetQuery.split(",").map((s) => s.trim()).filter(Boolean);
    const creds: Record<string, string> = {};
    if (linkedInUser) creds["linkedin"] = linkedInUser;
    if (jobstreetUser) creds["jobstreet"] = jobstreetUser;
    if (indeedUser) creds["indeed"] = indeedUser;

    await start(num, queries.length ? queries : ["AI Engineer"], creds);
  };

  const handleNotionAutoSync = async () => {
    if (!notionToken.trim()) {
      setNotionError("Please enter your Notion Integration Token.");
      return;
    }
    setNotionBusy(true);
    setNotionError("");
    setNotionMsg("");
    try {
      const res = await api<{ ok: boolean; database_id: string; database_url: string; synced_count: number }>(
        "/integrations/notion/auto-create-and-sync",
        {
          token: notionToken.trim(),
          applications: results.length
            ? results.map((r) => ({
                company: r.job.company,
                role: r.job.title,
                match: r.match?.score || 0,
                status: r.state || "APPLIED",
                source: r.job.source,
                url: r.job.id ? `http://localhost:3000/apply/${r.job.id}` : "",
              }))
            : apps.map((a) => ({
                company: a.company,
                role: a.role,
                match: a.match,
                status: a.status,
              })),
        }
      );

      if (res.ok) {
        setNotion({ token: notionToken, databaseId: res.database_id, connected: true });
        setNotionMsg(`Success! Created database in Notion with ${res.synced_count} synced applications.`);
      }
    } catch (e: any) {
      setNotionError(e.message || "Failed to connect to Notion.");
    } finally {
      setNotionBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Agent Workforce"
        sub="1,000 concurrent task workers operating in parallel: 300 Crawlers (LinkedIn/JobStreet), 300 LLM Tailors, 400 Independent Application Bots."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn text-xs"
              onClick={() => setShowCreds(true)}
            >
              🔑 Platform Logins
            </button>
            <button
              className="btn text-xs bg-bg2 border border-line"
              onClick={() => setShowNotionModal(true)}
            >
              ⚡ Notion 1-Click Sync
            </button>
            {[100, 500, 1000].map((n) => (
              <button
                key={n}
                className={`btn text-xs ${selectedWorkers === n ? "bg-black text-white" : ""}`}
                disabled={running}
                onClick={() => setSelectedWorkers(n)}
              >
                {n.toLocaleString()} Workers
              </button>
            ))}
            {running ? (
              <button className="btn btn-primary bg-black text-white hover:bg-neutral-800" onClick={stop}>
                Stop Workforce
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => handleStart(selectedWorkers)}
              >
                Deploy {selectedWorkers.toLocaleString()} Workers
              </button>
            )}
          </div>
        }
      />

      {/* Target query & platform liking configure */}
      {!running && (
        <div className="card p-4 mb-6 flex flex-wrap items-center justify-between gap-4 bg-bg2/40">
          <div className="flex-1 min-w-[280px]">
            <label className="label-xs" htmlFor="tq">Target Career Queries & User Preferences (comma-separated)</label>
            <input
              id="tq"
              className="input mt-1"
              value={targetQuery}
              onChange={(e) => setTargetQuery(e.target.value)}
              placeholder="Senior AI Engineer, Full Stack Developer, Machine Learning"
            />
          </div>
          <div className="text-xs text-muted max-w-sm">
            300 Crawlers pull these preferences across LinkedIn, JobStreet, and Indeed. 300 Tailoring bots synthesize APA resumes via Local LLM, and 400 bots prepare applications independently.
          </div>
        </div>
      )}

      {/* Platform Login Credentials Modal */}
      {showCreds && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 bg-bg border border-line shadow-2xl rise">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">Platform Accounts & 2FA Setup</h3>
              <button className="text-muted hover:text-ink text-sm" onClick={() => setShowCreds(false)}>
                ✕
              </button>
            </div>
            <p className="text-xs text-muted mb-4 font-sans">
              Provide your session or username for job platforms so the 300 crawler bots can browse your preferences. If a bot encounters a 2FA challenge, it will notify you on the node diagram.
            </p>
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="label-xs block mb-1">LinkedIn Username / Session Email</label>
                <input
                  className="input text-xs"
                  placeholder="linkedin.user@example.com"
                  value={linkedInUser}
                  onChange={(e) => setLinkedInUser(e.target.value)}
                />
              </div>
              <div>
                <label className="label-xs block mb-1">JobStreet Account Email</label>
                <input
                  className="input text-xs"
                  placeholder="jobstreet.user@example.com"
                  value={jobstreetUser}
                  onChange={(e) => setJobstreetUser(e.target.value)}
                />
              </div>
              <div>
                <label className="label-xs block mb-1">Indeed Account Email</label>
                <input
                  className="input text-xs"
                  placeholder="indeed.user@example.com"
                  value={indeedUser}
                  onChange={(e) => setIndeedUser(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button className="btn text-xs" onClick={() => setShowCreds(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary text-xs"
                onClick={() => {
                  setShowCreds(false);
                }}
              >
                Save Credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notion 1-Click Auto-Create Modal */}
      {showNotionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-6 bg-bg border border-line shadow-2xl rise">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">Notion 1-Click Self-Create List</h3>
              <button className="text-muted hover:text-ink text-sm" onClick={() => setShowNotionModal(false)}>
                ✕
              </button>
            </div>
            <p className="text-xs text-muted mb-4">
              Enter your Notion integration token. This button will automatically create a dedicated database with columns (Company Name, Position, Platform, Status, Match Score, Applied Date) and mirror your opportunities!
            </p>
            <div className="space-y-3">
              <div>
                <label htmlFor="n-token" className="label-xs block mb-1">Notion Integration Token</label>
                <input
                  id="n-token"
                  type="password"
                  className="input text-xs"
                  placeholder="ntn_... or secret_..."
                  value={notionToken}
                  onChange={(e) => setNotionToken(e.target.value)}
                />
              </div>

              {notionError && <ErrorBox msg={notionError} />}
              {notionMsg && <p className="text-ok text-xs font-mono">{notionMsg}</p>}

              <div className="flex justify-end gap-2 mt-4">
                <button className="btn text-xs" onClick={() => setShowNotionModal(false)}>
                  Close
                </button>
                <button
                  className="btn btn-primary text-xs"
                  disabled={notionBusy || !notionToken.trim()}
                  onClick={handleNotionAutoSync}
                >
                  {notionBusy ? "Creating Database & Mirroring..." : "⚡ Connect & Auto-Create List"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workforce Top Summary */}
      <section aria-label="Workforce Totals" className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Stat label="Workers Configured" value={running ? workers : selectedWorkers} />
        <Stat label="Active Parallel Bots" value={active} i={1} />
        <Stat label="Tasks Queued" value={totQ} i={2} />
        <Stat label="Tasks Completed" value={totD} i={3} />
        <Stat label="Applications Ready" value={readyCount} i={4} />
      </section>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-line mb-6 font-mono text-xs">
        <button
          className={`pb-2.5 font-bold border-b-2 transition-colors ${
            activeTab === "diagram" ? "border-black text-ink" : "border-transparent text-muted hover:text-ink"
          }`}
          onClick={() => setActiveTab("diagram")}
        >
          Swarm Node Graph & Bot Matrix
        </button>
        <button
          className={`pb-2.5 font-bold border-b-2 transition-colors ${
            activeTab === "stages" ? "border-black text-ink" : "border-transparent text-muted hover:text-ink"
          }`}
          onClick={() => setActiveTab("stages")}
        >
          Task Stages & Live Feed
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
          Discovered Opportunities & Applications
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
              <p className="text-xs text-muted">Generated by the 1,000-bot parallel workforce.</p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn text-xs bg-bg2 border border-line"
                onClick={() => setShowNotionModal(true)}
              >
                ⚡ Mirror to Notion
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
                        <Badge tone={r.state === "READY_FOR_REVIEW" ? "ok" : r.state === "BLOCKED" ? "err" : "n"}>
                          {r.state || "PROCESSING"}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <Link href={`/apply/${r.job.id}`} className="btn text-xs py-1 px-3">
                          Review in Studio
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}
