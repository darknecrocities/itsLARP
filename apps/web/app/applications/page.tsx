"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore, type App } from "@/lib/store";
import { api, apiGet } from "@/lib/api";
import { Badge, Empty, PageHeader, Stat } from "@/components/ui";

const STATUSES = [
  "SAVED",
  "ANALYZING",
  "PREPARING",
  "READY",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
];

export default function ApplicationsPage() {
  const { apps, setApps, upsertApp } = useStore();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiGet<App[]>("/applications")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setApps(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setApps]);

  const handleStatusChange = async (app: App, newStatus: string) => {
    try {
      await api(`/applications/${app.id}`, { status: newStatus }, "PATCH");
    } catch {}

    upsertApp({
      ...app,
      status: newStatus,
      events: [
        { at: new Date().toISOString(), text: `Status updated to ${newStatus}` },
        ...app.events,
      ],
    });
  };

  const rows = apps.filter(
    (a) =>
      (a.company + a.role).toLowerCase().includes(q.toLowerCase()) &&
      (!statusFilter || a.status === statusFilter)
  );

  const appliedCount = apps.filter((a) => a.status === "APPLIED").length;
  const screeningCount = apps.filter((a) => a.status === "SCREENING").length;
  const interviewCount = apps.filter((a) => a.status === "INTERVIEW").length;
  const offerCount = apps.filter((a) => a.status === "OFFER").length;

  return (
    <>
      <PageHeader
        title="Application Tracker"
        sub="Track every job application, interview, and offer in real time. Automatically synced with your Notion list."
        action={
          <div className="flex gap-2">
            <Link href="/jobs" className="btn btn-primary">
              Discover More Jobs
            </Link>
          </div>
        }
      />

      {/* Summary Pipeline Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat label="Total Tracked" value={apps.length} />
        <Stat label="Applied" value={appliedCount} i={1} />
        <Stat label="In Interviews" value={interviewCount} i={2} />
        <Stat label="Offers Received" value={offerCount} i={3} />
      </section>

      {apps.length === 0 && !loading ? (
        <Empty
          title="No applications tracked yet"
          hint="Select any opportunity from Jobs and click 'Approve & Submit' to start tracking."
        >
          <Link href="/jobs" className="btn btn-primary">
            Browse Opportunities
          </Link>
        </Empty>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 mb-6">
            <label className="sr-only" htmlFor="aq">Search</label>
            <input
              id="aq"
              className="input max-w-xs"
              placeholder="Search by company or role..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <label className="sr-only" htmlFor="af">Status</label>
            <select
              id="af"
              className="input max-w-[180px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses ({apps.length})</option>
              {STATUSES.map((s) => {
                const count = apps.filter((a) => a.status === s).length;
                return (
                  <option key={s} value={s}>
                    {s} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="label-xs border-b border-line">
                <tr>
                  <th scope="col" className="py-2.5">Role</th>
                  <th scope="col">Company</th>
                  <th scope="col">Compatibility</th>
                  <th scope="col">Application Status</th>
                  <th scope="col">Last Event</th>
                  <th scope="col" className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className="border-b border-line hover:bg-bg2 transition-colors">
                    <td className="py-3 font-semibold">
                      <Link href={`/apply/${a.jobId}`} className="hover:underline">
                        {a.role}
                      </Link>
                    </td>
                    <td className="text-dmuted">{a.company}</td>
                    <td>
                      <Badge tone={a.match >= 80 ? "ok" : a.match >= 60 ? "n" : "warn"}>
                        {a.match}%
                      </Badge>
                    </td>
                    <td>
                      <label className="sr-only" htmlFor={`s-${a.id}`}>
                        Status for {a.role}
                      </label>
                      <select
                        id={`s-${a.id}`}
                        className="input !w-auto text-xs py-1"
                        value={a.status}
                        onChange={(e) => handleStatusChange(a, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="text-muted text-xs">
                      <div>{a.events?.[0]?.text || "Application recorded"}</div>
                      {a.events?.[0]?.at && (
                        <div className="text-[10px] text-muted">
                          {new Date(a.events[0].at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="text-right">
                      <Link href={`/apply/${a.jobId}`} className="btn text-xs py-1 px-2.5">
                        View Studio
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <p className="text-muted py-8 text-center text-sm">
              No applications match your search filter.
            </p>
          )}
        </>
      )}
    </>
  );
}
