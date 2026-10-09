"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useJobs } from "@/lib/useJobs";
import { useStore } from "@/lib/store";
import { useSwarm } from "@/lib/swarm";
import { apiGet } from "@/lib/api";
import { Badge, Empty, PageHeader, Reveal, Stat } from "@/components/ui";

export default function Dashboard() {
  const { apps, setApps, profile } = useStore();
  const { data: jobs, isLoading } = useJobs();
  const feed = useSwarm((s) => s.feed);

  // Sync applications from backend database
  useEffect(() => {
    apiGet<any[]>("/applications")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setApps(data);
        }
      })
      .catch(() => {});
  }, [setApps]);

  const topJobs = (jobs || [])
    .filter((j) => (j.match?.score ?? 0) >= 60)
    .sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0))
    .slice(0, 6);

  const count = (status: string) => apps.filter((a) => a.status === status).length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        sub="Your centralized career command center. All applications, evidence, and active AI workers in real time."
        action={
          <div className="flex gap-2">
            <Link href="/agents" className="btn btn-primary">
              Deploy Workforce
            </Link>
            <Link href="/jobs" className="btn">
              Discover Jobs
            </Link>
          </div>
        }
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat label="Applications Tracked" value={apps.length} />
        <Stat label="Interviews" value={count("INTERVIEW")} i={1} />
        <Stat label="Offers" value={count("OFFER")} i={2} />
        <Stat label="Opportunities Scored" value={jobs?.length ?? 0} i={3} />
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <Reveal i={1}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">High-Compatibility Roles</h2>
            <Link href="/jobs" className="text-xs text-muted hover:underline">
              View all ({jobs?.length || 0}) →
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
                      <div className="text-xs text-dmuted">{j.location} {j.remote && "· Remote"}</div>
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
            <h2 className="text-xl font-semibold">Agent Workforce Feed</h2>
            <Link href="/agents" className="text-xs text-muted hover:underline">
              Full control center →
            </Link>
          </div>

          <div className="card font-mono text-xs p-3.5 h-64 overflow-y-auto space-y-2 bg-bg2/30">
            {feed.length > 0 ? (
              feed.slice(0, 10).map((l, i) => (
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
    </>
  );
}
