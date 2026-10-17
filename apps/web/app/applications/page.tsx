"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore, type App } from "@/lib/store";
import { api, apiGet } from "@/lib/api";
import { Badge, Empty, PageHeader, Stat } from "@/components/ui";
import { NotionSyncModal } from "@/components/NotionSyncModal";
import { RefreshCw, ExternalLink, Zap, RotateCcw, CheckCircle, Database, Search } from "lucide-react";

const STATUSES = ["SAVED", "ANALYZING", "PREPARING", "READY", "APPLIED", "SCREENING", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"];


export default function ApplicationsPage() {
  const { apps, setApps, upsertApp, clearApps, profile, notion, setNotion, fetchNotionStatus } = useStore();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showNotionModal, setShowNotionModal] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [dnaTargetCount, setDnaTargetCount] = useState<number>(25);
  const [syncingDna, setSyncingDna] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await apiGet<App[]>("/applications");
      if (Array.isArray(data)) {
        setApps(data);
      }
    } catch {}
    try {
      await fetchNotionStatus();
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearApplications = async () => {
    if (window.confirm("Clear all locally tracked applications?")) {
      await clearApps();
      setBannerNotice("Cleared all locally tracked applications.");
      setTimeout(() => setBannerNotice(null), 4000);
    }
  };

  const handleSyncNotion = async () => {
    setSyncing(true);
    try {
      const res = await api<{
        ok: boolean;
        pull?: { imported: number; updated: number; total: number };
        push?: { pushed: number };
      }>("/integrations/notion/sync", {});
      if (res.ok) {
        setBannerNotice(
          `Synced with Notion! ${res.pull?.imported || 0} imported, ${res.pull?.updated || 0} updated.`
        );
        setTimeout(() => setBannerNotice(null), 5000);
        await loadData();
      }
    } catch (e: any) {
      setBannerNotice(e.message || "Failed to sync with Notion.");
      setTimeout(() => setBannerNotice(null), 5000);
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncDnaToNotion = async () => {
    if (!profile.name || !profile.skills.length) {
      setBannerNotice("Please set up your Career DNA in Profile or upload your resume first before syncing.");
      setTimeout(() => setBannerNotice(null), 6000);
      return;
    }
    setSyncingDna(true);
    try {
      const res = await api<{
        ok: boolean;
        error?: string;
        total_generated: number;
        synced_to_notion: number;
        backfilled: number;
        database_url: string;
      }>("/integrations/notion/sync-dna-applications", {
        target_count: dnaTargetCount,
      });
      if (res.ok) {
        setBannerNotice(
          `Synchronized ${res.synced_to_notion} Career DNA applications into Notion!`
        );
        setTimeout(() => setBannerNotice(null), 7000);
        await loadData();
      } else {
        setBannerNotice(res.error || "Failed to sync Career DNA.");
        setTimeout(() => setBannerNotice(null), 6000);
      }
    } catch (e: any) {
      setBannerNotice(e.message || "Failed to sync Career DNA to Notion.");
      setTimeout(() => setBannerNotice(null), 6000);
    } finally {
      setSyncingDna(false);
    }
  };

  const handleStatusChange = async (app: App, newStatus: string) => {
    try {
      await api(`/applications/${app.id}`, { status: newStatus }, "PATCH");
    } catch {}

    upsertApp({
      ...app,
      status: newStatus,
      canReapply: newStatus === "REJECTED" || newStatus === "WITHDRAWN",
      events: [
        { at: new Date().toISOString(), text: `Status updated to ${newStatus}` },
        ...app.events,
      ],
    });
  };

  const handleReapply = async (app: App) => {
    try {
      const res = await api<{ ok: boolean; status: string; message: string }>(
        `/applications/${app.id}/reapply`,
        {}
      );
      if (res.ok) {
        upsertApp({
          ...app,
          status: "READY",
          canReapply: false,
          events: [
            {
              at: new Date().toISOString(),
              text: `Re-application initiated by user (previous: ${app.status})`,
            },
            ...app.events,
          ],
        });
        setBannerNotice(
          `Re-application initiated for ${app.company}! You can now review and submit in Studio.`
        );
        setTimeout(() => setBannerNotice(null), 6000);
      }
    } catch (e: any) {
      setBannerNotice(e.message || "Could not re-apply.");
      setTimeout(() => setBannerNotice(null), 5000);
    }
  };

  const rows = apps.filter(
    (a) =>
      (a.company + a.role).toLowerCase().includes(q.toLowerCase()) &&
      (!statusFilter || a.status === statusFilter)
  );

  const appliedCount = apps.filter((a) => a.status === "APPLIED").length;
  const interviewCount = apps.filter((a) => a.status === "INTERVIEW").length;
  const offerCount = apps.filter((a) => a.status === "OFFER").length;
  const rejectedCount = apps.filter((a) => a.status === "REJECTED").length;

  return (
    <>
      <PageHeader
        title="Application Tracker"
        sub="Track every job application, interview, and offer in real time. Directly linked to your Notion database."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {apps.length > 0 && (
              <button
                className="btn text-xs bg-white text-red-600 border border-neutral-300 hover:border-red-400"
                onClick={handleClearApplications}
                title="Clear all locally tracked applications"
              >
                Clear All ({apps.length})
              </button>
            )}
            <button
              className="btn text-xs bg-white border border-neutral-300 hover:border-black flex items-center gap-1.5"
              onClick={() => setShowNotionModal(true)}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{notion.connected ? "Notion Settings" : "Link Notion"}</span>
            </button>
            <Link href="/jobs" className="btn btn-primary text-xs">
              Discover More Jobs
            </Link>
          </div>
        }
      />

      {/* Notion Connection & Sync Bar */}
      <div className="card p-3 mb-6 bg-neutral-50 border border-neutral-300 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              notion.connected ? "bg-black animate-pulse" : "bg-neutral-400"
            }`}
          />
          <div>
            <span className="font-semibold text-black">
              {notion.connected
                ? `Connected to Notion: ${notion.databaseName || "Job Tracker"}`
                : "Notion Integration: Not Connected"}
            </span>
            <span className="text-neutral-500 text-[11px] ml-2">
              {notion.connected && notion.lastSyncedAt
                ? `Last synchronized: ${new Date(notion.lastSyncedAt).toLocaleTimeString()}`
                : "Connect your real Notion database to keep everything in sync"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {notion.connected ? (
            <>
              <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded p-0.5">
                <select
                  className="bg-transparent text-xs py-0.5 px-1.5 font-mono text-black outline-none cursor-pointer"
                  value={dnaTargetCount}
                  onChange={(e) => setDnaTargetCount(Number(e.target.value))}
                  disabled={syncingDna}
                >
                  <option value={10}>10 Targets</option>
                  <option value={25}>25 Targets</option>
                  <option value={50}>50 Targets</option>
                  <option value={100}>100 Targets</option>
                  <option value={1000}>1k Targets</option>
                  <option value={10000}>10k Targets</option>
                  <option value={50000}>50k Targets</option>
                </select>
                <button
                  className="btn btn-primary text-xs py-1 px-2.5 flex items-center gap-1 font-sans"
                  disabled={syncingDna}
                  onClick={handleSyncDnaToNotion}
                >
                  <Zap className={`w-3 h-3 ${syncingDna ? "animate-spin" : ""}`} />
                  <span>{syncingDna ? "Syncing..." : "Sync Career DNA to Notion"}</span>
                </button>
              </div>

              <button
                className="btn text-xs py-1 px-2.5 bg-white border border-neutral-300 hover:border-black flex items-center gap-1.5"
                disabled={syncing}
                onClick={handleSyncNotion}
              >
                <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
                <span>{syncing ? "Syncing..." : "Sync from Notion"}</span>
              </button>
              {notion.databaseUrl && (
                <a
                  href={notion.databaseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn text-xs py-1 px-2.5 bg-white border border-neutral-300 hover:border-black flex items-center gap-1"
                >
                  <span>Open in Notion</span>
                  <ExternalLink className="w-3 h-3 text-neutral-500" />
                </a>
              )}
            </>
          ) : (
            <button
              className="btn btn-primary text-xs py-1 px-3 flex items-center gap-1.5"
              onClick={() => setShowNotionModal(true)}
            >
              <Zap className="w-3 h-3" />
              <span>Connect Notion Database</span>
            </button>
          )}
        </div>
      </div>

      {bannerNotice && (
        <div className="p-3 mb-6 bg-black text-white text-xs font-mono rounded flex items-center justify-between">
          <span>{bannerNotice}</span>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-neutral-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Pipeline Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat label="Total Tracked" value={apps.length} />
        <Stat label="Applied" value={appliedCount} i={1} />
        <Stat label="In Interviews" value={interviewCount} i={2} />
        <Stat label="Offers Received" value={offerCount} i={3} />
      </section>

      {apps.length === 0 && !loading ? (
        <Empty
          title="No applications tracked yet"
          hint="Sync from your Notion database or discover opportunities to prepare and submit applications."
        >
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              className="btn text-xs bg-white border border-neutral-300 hover:border-black flex items-center gap-1.5"
              onClick={() => setShowNotionModal(true)}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Link Notion Database</span>
            </button>
            <Link href="/jobs" className="btn btn-primary text-xs">
              Browse Opportunities
            </Link>
          </div>
        </Empty>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 mb-6 font-mono text-xs">
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
              <input
                id="aq"
                className="input !pl-10 text-xs"
                style={{ paddingLeft: "2.5rem" }}
                placeholder="Search company or role..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <select
              id="af"
              className="input max-w-[190px]"
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

          <div className="overflow-x-auto border border-line rounded">
            <table className="w-full text-left font-sans text-xs">
              <thead className="label-xs border-b border-line bg-neutral-100 font-mono">
                <tr>
                  <th scope="col" className="py-2.5 px-3">Role</th>
                  <th scope="col" className="px-3">Company</th>
                  <th scope="col" className="px-3">Platform</th>
                  <th scope="col" className="px-3">Match</th>
                  <th scope="col" className="px-3">Application Status</th>
                  <th scope="col" className="px-3">Last Activity</th>
                  <th scope="col" className="px-3">Notion</th>
                  <th scope="col" className="text-right px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((a) => {
                  const isRejected = a.status === "REJECTED" || a.status === "WITHDRAWN";
                  const isOngoing =
                    a.status === "APPLIED" ||
                    a.status === "SCREENING" ||
                    a.status === "INTERVIEW" ||
                    a.status === "OFFER";

                  return (
                    <tr
                      key={a.id}
                      className={`hover:bg-neutral-50 transition-colors ${
                        isRejected ? "bg-neutral-50/50" : ""
                      }`}
                    >
                      <td className="py-3 px-3 font-semibold">
                        <Link href={`/apply/${a.jobId}`} className="hover:underline">
                          {a.role}
                        </Link>
                        {isRejected && (
                          <div className="text-[10px] text-neutral-500 font-mono">
                            Previous attempt ended ({a.status})
                          </div>
                        )}
                      </td>
                      <td className="px-3 text-neutral-700 font-medium">{a.company}</td>
                      <td className="px-3 font-mono text-[11px] text-neutral-500">
                        {a.platform || "Direct"}
                      </td>
                      <td className="px-3">
                        <Badge tone={a.match >= 80 ? "ok" : a.match >= 60 ? "n" : "warn"}>
                          {a.match}%
                        </Badge>
                      </td>
                      <td className="px-3">
                        <select
                          className="input !w-auto text-xs py-1 font-mono"
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
                      <td className="px-3 text-neutral-500 text-[11px] max-w-xs">
                        <div className="truncate">{a.events?.[0]?.text || "Recorded"}</div>
                        {a.events?.[0]?.at && (
                          <div className="text-[10px] text-neutral-400 font-mono">
                            {new Date(a.events[0].at).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-3">
                        {a.notionPageId ? (
                          <a
                            href={`https://notion.so/${a.notionPageId.replace(/-/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-600 hover:text-black underline"
                          >
                            <span>Synced</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-neutral-400 font-mono text-[11px]">—</span>
                        )}
                      </td>
                      <td className="text-right px-3 py-3">
                        <div className="inline-flex items-center gap-1.5">
                          {isRejected && (
                            <button
                              className="btn text-xs py-1 px-2.5 bg-black text-white hover:bg-neutral-800 flex items-center gap-1 font-mono"
                              onClick={() => handleReapply(a)}
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Re-Apply</span>
                            </button>
                          )}
                          <a
                            href={a.screenshotUrl || `http://localhost:8000/applications/${a.id}/screenshot`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn text-xs py-1 px-2 border border-neutral-300 hover:border-black font-mono text-neutral-600 hover:text-black"
                            title="View Pre-Submission Filled Form Proof"
                          >
                            Proof
                          </a>
                          <Link
                            href={`/apply/${a.jobId}`}
                            className="btn text-xs py-1 px-2.5 border border-neutral-300 hover:border-black font-mono"
                          >
                            Studio
                          </Link>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <p className="text-neutral-500 py-8 text-center text-xs font-mono">
              No applications match your search filter.
            </p>
          )}
        </>
      )}

      {/* Notion Connect / Select Modal */}
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
          setBannerNotice(`Successfully linked Notion database: ${data.database_name}`);
          setTimeout(() => setBannerNotice(null), 5000);
          loadData();
        }}
      />
    </>
  );
}
