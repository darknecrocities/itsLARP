"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Badge, ErrorBox, PageHeader } from "@/components/ui";

export default function Integrations() {
  const { notion, setNotion, apps } = useStore();
  const [token, setToken] = useState(notion.token); const [page, setPage] = useState("");
  const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<void>) => { setBusy(true); setErr(""); setMsg(""); try { await fn(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); } };

  const connect = () => run(async () => {
    const r = await api<{ connected: boolean; workspace?: string; error?: string }>("/integrations/notion/test", { token });
    if (!r.connected) throw new Error(r.error ?? "Connection failed.");
    setNotion({ token, connected: true }); setMsg(`Connected to ${r.workspace ?? "Notion"}.`);
  });
  const create = () => run(async () => {
    const r = await api<{ database_id: string }>("/integrations/notion/database", { token: notion.token, parent_page_id: page.replace(/.*-/, "").replace(/\?.*/, "") });
    setNotion({ databaseId: r.database_id }); setMsg("Database “HowToLarped Applications” created.");
  });
  const syncAll = () => run(async () => {
    for (const a of apps) await api("/integrations/notion/sync", { token: notion.token, database_id: notion.databaseId, application: { company: a.company, role: a.role, match: a.match, status: a.status } });
    setMsg(`Synced ${apps.length} applications.`);
  });
  return (
    <>
      <PageHeader title="Integrations" sub="Bring your own keys. PostgreSQL stays the source of truth; Notion is a mirror." />
      <section className="card p-6 max-w-xl hover:!transform-none">
        <div className="flex justify-between"><h2 className="text-xl font-semibold">Notion</h2><Badge tone={notion.connected ? "ok" : "n"}>{notion.connected ? "Connected" : "Not connected"}</Badge></div>
        <ol className="text-dmuted text-sm list-decimal pl-5 mt-3 space-y-1"><li>Create an internal integration at notion.so/profile/integrations.</li><li>Share a Notion page with it, and copy that page URL.</li><li>Paste the integration token below.</li></ol>
        <label htmlFor="nt" className="label-xs block mt-5">Integration token</label>
        <input id="nt" type="password" autoComplete="off" className="input mt-1" value={token} onChange={(e) => setToken(e.target.value)} placeholder="ntn_… or secret_…" />
        <p className="text-xs text-muted mt-1">Kept in this browser session only. Never stored in local storage or logged.</p>
        <button className="btn btn-primary mt-3" disabled={busy || token.length < 10} onClick={connect}>Connect</button>
        {notion.connected && <div className="mt-6 border-t border-line pt-5">
          <label htmlFor="np" className="label-xs">Parent page URL</label><input id="np" className="input mt-1" value={page} onChange={(e) => setPage(e.target.value)} />
          <div className="flex gap-2 mt-3"><button className="btn" disabled={busy || !page} onClick={create}>Create database</button><button className="btn" disabled={busy || !notion.databaseId || !apps.length} onClick={syncAll}>Sync {apps.length} applications</button></div>
          {notion.databaseId && <p className="text-xs text-muted mt-2">Database linked.</p>}</div>}
        {msg && <p role="status" className="text-ok mt-4">{msg}</p>}{err && <div className="mt-4"><ErrorBox msg={err} /></div>}
      </section>
    </>
  );
}
