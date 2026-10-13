"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Badge, ErrorBox, PageHeader } from "@/components/ui";
import { Check, Zap, ExternalLink } from "lucide-react";

export default function Integrations() {
  const { notion, setNotion, apps } = useStore();
  const [token, setToken] = useState(notion.token);
  const [parentPage, setParentPage] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [dbUrl, setDbUrl] = useState("");

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await fn();
    } catch (e: any) {
      setErr(e.message || "Operation failed.");
    } finally {
      setBusy(false);
    }
  };

  const autoCreateList = () =>
    run(async () => {
      const res = await api<{
        ok: boolean;
        database_id: string;
        database_url: string;
        synced_count: number;
        workspace: string;
      }>("/integrations/notion/auto-create-and-sync", {
        token: token.trim(),
        parent_page_id: parentPage.trim() || undefined,
        applications: apps.map((a) => ({
          company: a.company,
          role: a.role,
          match: a.match,
          status: a.status,
          notes: a.events?.[0]?.text || "Synced from itsLARP",
        })),
      });

      if (!res.ok) throw new Error("Failed to auto-create Notion database.");
      setNotion({ token: token.trim(), databaseId: res.database_id, connected: true });
      setDbUrl(res.database_url);
      setMsg(
        `Success! Self-created “itsLARP Job Applications” in Notion with columns (Company Name, Position, Platform, Status, Match Score, Applied Date) and mirrored ${res.synced_count} applications!`
      );
    });

  const testConnect = () =>
    run(async () => {
      const r = await api<{ connected: boolean; workspace?: string; error?: string }>("/integrations/notion/test", {
        token: token.trim(),
      });
      if (!r.connected) throw new Error(r.error ?? "Connection failed.");
      setNotion({ token: token.trim(), connected: true });
      setMsg(`Connected to ${r.workspace ?? "Notion"}.`);
    });

  return (
    <>
      <PageHeader
        title="App Integrations"
        sub="Connect Notion to automatically organize and track every job application in your personal workspace."
      />

      <section className="card p-6 max-w-2xl bg-bg border border-line">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-sans">Notion Integration</h2>
            <Badge tone={notion.connected ? "ok" : "n"}>
              {notion.connected ? "Connected" : "Not connected"}
            </Badge>
          </div>
          {notion.databaseId && (
            <span className="text-xs font-mono text-muted">DB: {notion.databaseId.slice(0, 8)}...</span>
          )}
        </div>

        <p className="text-xs text-muted leading-relaxed mb-4">
          1-click self-creating list: Generates a Notion database with fields for <strong>Company Name</strong>, <strong>Position</strong>, <strong>Platform</strong>, <strong>Applied Date</strong>, <strong>Status</strong>, <strong>Match Score</strong>, and <strong>Resume Format</strong>, and automatically populates all your applications.
        </p>

        <div className="space-y-4 font-mono text-xs">
          <div>
            <label htmlFor="nt" className="label-xs block mb-1">
              Notion Internal Integration Token
            </label>
            <input
              id="nt"
              type="password"
              autoComplete="off"
              className="input text-xs"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ntn_... or secret_..."
            />
            <p className="text-[11px] text-muted mt-1 font-sans">
              Create an internal integration at{" "}
              <a href="https://notion.so/profile/integrations" target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-0.5">
                <span>notion.so/profile/integrations</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              . Kept in browser session only.
            </p>
          </div>

          <div>
            <label htmlFor="np" className="label-xs block mb-1">
              Parent Page URL or Page ID (Optional)
            </label>
            <input
              id="np"
              className="input text-xs"
              value={parentPage}
              onChange={(e) => setParentPage(e.target.value)}
              placeholder="Leave blank to auto-detect first shared page, or paste page link"
            />
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              className="btn btn-primary text-xs py-2 px-4 font-semibold flex items-center gap-1.5"
              disabled={busy || token.length < 10}
              onClick={autoCreateList}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{busy ? "Creating Database in Notion..." : "1-Click: Self-Create List & Sync All"}</span>
            </button>
            <button
              className="btn text-xs py-2 px-3"
              disabled={busy || token.length < 10}
              onClick={testConnect}
            >
              Test Connection
            </button>
          </div>
        </div>

        {msg && (
          <div className="mt-4 p-3 bg-neutral-100 border border-neutral-300 rounded text-black text-xs font-mono flex items-start gap-2">
            <Check className="w-4 h-4 text-ok shrink-0 mt-0.5" />
            <div>
              <div>{msg}</div>
              {dbUrl && (
                <a
                  href={dbUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-2 font-bold underline"
                >
                  <span>Open in Notion</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {err && (
          <div className="mt-4">
            <ErrorBox msg={err} />
          </div>
        )}
      </section>
    </>
  );
}
