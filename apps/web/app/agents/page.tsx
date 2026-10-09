"use client";
import { useState } from "react";
import Link from "next/link";
import { STAGES, useSwarm, type Stage } from "@/lib/swarm";
import { useStore } from "@/lib/store";
import { Badge, PageHeader, Stat, Reveal } from "@/components/ui";

const STAGE_LABELS: Record<Stage, string> = {
  discovery: "Discovery Agents (Find jobs across sources)",
  analysis: "Analysis Agents (Extract technical requirements)",
  matching: "Matching Agents (Calculate candidate compatibility)",
  resumes: "Resume Agents (Draft evidence-backed resumes)",
  applications: "Application Agents (Prepare answers & cover letters)",
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
    start,
    stop,
    fetchResults,
  } = useSwarm();

  const profile = useStore((s) => s.profile);
  const [selectedWorkers, setSelectedWorkers] = useState(100);
  const [targetQuery, setTargetQuery] = useState(profile.headline || "AI Engineer");
  const [activeTab, setActiveTab] = useState<"stages" | "results">("stages");

  const totQ = Object.values(counts).reduce((acc, c) => acc + c.queued, 0);
  const totD = Object.values(counts).reduce((acc, c) => acc + c.done, 0);
  const totF = Object.values(counts).reduce((acc, c) => acc + c.failed, 0);

  const handleStart = async (num: number) => {
    setSelectedWorkers(num);
    const queries = targetQuery.split(",").map((s) => s.trim()).filter(Boolean);
    await start(num, queries.length ? queries : ["AI Engineer"]);
  };

  return (
    <>
      <PageHeader
        title="Agent Workforce"
        sub="1,000 concurrent task workers executing specialized jobs in parallel. Orchestrated asynchronously via backend task queues."
        action={
          <div className="flex items-center gap-2">
            {[10, 100, 1000].map((n) => (
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
              <button className="btn btn-primary bg-err text-white" onClick={stop}>
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

      {/* Target query configure */}
      {!running && (
        <div className="card p-4 mb-6 flex flex-wrap items-center justify-between gap-4 bg-bg2/40">
          <div className="flex-1 min-w-[280px]">
            <label className="label-xs" htmlFor="tq">Target Career Queries (comma-separated)</label>
            <input
              id="tq"
              className="input mt-1"
              value={targetQuery}
              onChange={(e) => setTargetQuery(e.target.value)}
              placeholder="AI Engineer, Full Stack, Machine Learning"
            />
          </div>
          <div className="text-xs text-muted max-w-sm">
            Workers pull these search targets, ingest public listings, analyze descriptions, evaluate against your Career DNA, and draft packages.
          </div>
        </div>
      )}

      {/* Workforce Top Summary */}
      <section aria-label="Workforce Totals" className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <Stat label="Workers Configured" value={running ? workers : selectedWorkers} />
        <Stat label="Active Workers" value={active} i={1} />
        <Stat label="Tasks Queued" value={totQ} i={2} />
        <Stat label="Completed Tasks" value={totD} i={3} />
        <Stat label="Ready Applications" value={readyCount} i={4} />
      </section>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-line mb-6">
        <button
          className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "stages" ? "border-black text-fg" : "border-transparent text-muted"
          }`}
          onClick={() => setActiveTab("stages")}
        >
          Task Stages & Live Stream
        </button>
        <button
          className={`pb-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "results" ? "border-black text-fg" : "border-transparent text-muted"
          }`}
          onClick={() => {
            setActiveTab("results");
            fetchResults();
          }}
        >
          Workforce Results
          {results.length > 0 && <Badge>{results.length}</Badge>}
        </button>
      </div>

      {activeTab === "stages" ? (
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
                {running && <span className="inline-block w-2 h-2 rounded-full bg-ok animate-pulse" />}
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Processed Opportunities & Applications</h2>
            <button className="btn text-xs" onClick={fetchResults}>
              Refresh Results
            </button>
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
                        <div className="text-xs text-muted">{r.job.location}</div>
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
