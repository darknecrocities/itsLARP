"use client";
import React, { useState, useEffect } from "react";
import { api, apiGet } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Badge, ErrorBox, PageHeader } from "@/components/ui";
import { Check, Zap, ExternalLink, Mail, Bell, RefreshCw, Send, ShieldCheck } from "lucide-react";
import {
  NotionIcon,
  LinkedInIcon,
  IndeedIcon,
  GlassdoorIcon,
  ZipRecruiterIcon,
  WellfoundIcon,
} from "@/components/BrandIcons";
import { EmailRemoteControlCard } from "@/components/integrations/EmailRemoteControlCard";

export default function Integrations() {
  const {
    notion,
    setNotion,
    apps,
    emailIntegration,
    fetchEmailStatus,
    jobPreferences,
    setJobPreferences,
    upsertApp,
  } = useStore();

  const [token, setToken] = useState(notion.token);
  const [parentPage, setParentPage] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [dbUrl, setDbUrl] = useState(notion.databaseUrl || "");

  useEffect(() => {
    fetchEmailStatus();
  }, [fetchEmailStatus]);

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
          platform: a.platform || "LinkedIn",
          url: a.url || "",
          notes: a.events?.[0]?.text || "Synced from itsLARP OS",
        })),
      });

      if (!res.ok) throw new Error("Failed to auto-create Notion database.");
      setNotion({
        token: token.trim(),
        databaseId: res.database_id,
        databaseUrl: res.database_url,
        connected: true,
        workspace: res.workspace,
      });
      setDbUrl(res.database_url);
      setMsg(
        `Auto-created Notion database "${res.workspace || "Job Applications"}" and synced ${
          res.synced_count
        } applications!`
      );
    });

  const syncAllToNotion = () =>
    run(async () => {
      const res = await api<{
        ok: boolean;
        synced_count: number;
        results: Array<{ app_id: string; notion_page_id: string; action: string }>;
      }>("/integrations/notion/sync-all", {
        applications: apps.map((a) => ({
          id: a.id,
          company: a.company,
          role: a.role,
          match: a.match,
          status: a.status,
          platform: a.platform || "LinkedIn",
          url: a.url || "",
          applied_date: a.appliedDate || new Date().toISOString().slice(0, 10),
          notion_page_id: a.notionPageId,
        })),
      });

      if (!res.ok) throw new Error("Failed to sync applications to Notion.");

      res.results.forEach((r) => {
        const existing = apps.find((a) => a.id === r.app_id);
        if (existing) {
          upsertApp({
            ...existing,
            notionPageId: r.notion_page_id,
          });
        }
      });

      setMsg(`Successfully synchronized ${res.synced_count} applications to Notion.`);
    });

  const togglePlatform = (p: string) => {
    const current = jobPreferences.selectedPlatforms || [];
    const next = current.includes(p) ? current.filter((x) => x !== p) : [...current, p];
    setJobPreferences({ selectedPlatforms: next });
  };

  const platforms = [
    { id: "linkedin", label: "LinkedIn", icon: LinkedInIcon },
    { id: "indeed", label: "Indeed", icon: IndeedIcon },
    { id: "glassdoor", label: "Glassdoor", icon: GlassdoorIcon },
    { id: "ziprecruiter", label: "ZipRecruiter", icon: ZipRecruiterIcon },
    { id: "wellfound", label: "Wellfound", icon: WellfoundIcon },
  ];

  return (
    <div className="space-y-6" data-tour="integrations-header">
      <PageHeader
        title="Integrations & Response Monitoring"
        sub="Connect Notion to track applications, configure email remote control for your candidate email, and select target job platforms."
      />

      {msg && (
        <div className="p-3 bg-neutral-100 border border-neutral-300 rounded text-black text-xs font-mono flex items-start gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div>{msg}</div>
            {dbUrl && (
              <a
                href={dbUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-1.5 font-bold underline text-ink"
              >
                <span>View Database in Notion</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {err && <ErrorBox msg={err} />}

      {/* Email Remote Control & Device Alerts Card */}
      <EmailRemoteControlCard />

      {/* Notion Integration Card */}
      <section data-tour="integrations-notion-card" className="card p-6 bg-white border border-neutral-300 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2.5">
            <NotionIcon className="w-6 h-6" />
            <h2 className="text-lg font-bold font-sans">Notion Integration</h2>
          </div>
          <Badge tone={notion.connected ? "ok" : "n"}>
            {notion.connected ? "Connected" : "Not Connected"}
          </Badge>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed mb-4">
          Two-way live database synchronization. Creates a structured tracker with <strong>Company</strong>, <strong>Position</strong>, <strong>Platform</strong>, <strong>Status</strong>, and <strong>Match Score</strong>.
        </p>

        <div className="grid md:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label htmlFor="nt" className="label-xs block mb-1">
              Notion Internal Integration Token
            </label>
            <input
              id="nt"
              type="password"
              autoComplete="off"
              className="input text-xs w-full"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ntn_... or secret_..."
            />
          </div>

          <div>
            <label htmlFor="np" className="label-xs block mb-1">
              Parent Page URL or ID (Optional)
            </label>
            <input
              id="np"
              className="input text-xs w-full"
              value={parentPage}
              onChange={(e) => setParentPage(e.target.value)}
              placeholder="https://notion.so/my-page-..."
            />
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-200 mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              data-tour="integrations-notion-btn"
              className="btn btn-primary text-xs py-2 px-4 font-semibold flex items-center gap-1.5"
              disabled={busy || !token.trim()}
              onClick={autoCreateList}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Auto-Create Notion Board</span>
            </button>

            {notion.connected && (
              <button
                className="btn text-xs py-2 px-3 font-semibold flex items-center gap-1.5 border border-neutral-300 hover:border-black"
                disabled={busy}
                onClick={syncAllToNotion}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} />
                <span>Sync Applications Now</span>
              </button>
            )}
          </div>

          {notion.databaseUrl && (
            <a
              href={notion.databaseUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-neutral-800 underline inline-flex items-center gap-1 hover:text-black"
            >
              <span>Open Notion Workspace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </section>

      {/* Target Job Platforms Configuration */}
      <section className="card p-6 bg-white border border-neutral-300 rounded-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold font-sans">Target Job Platforms</h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              Select which platforms the auto-apply workforce should discover and submit applications to.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            {(jobPreferences.selectedPlatforms || []).length} Platforms Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {platforms.map((p) => {
            const active = (jobPreferences.selectedPlatforms || []).includes(p.id);
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePlatform(p.id)}
                className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                  active
                    ? "border-black bg-neutral-100 shadow-xs"
                    : "border-neutral-200 bg-neutral-50 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold font-sans text-black">{p.label}</span>
                </div>
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    active ? "bg-black border-black text-white" : "border-neutral-400 bg-white"
                  }`}
                >
                  {active && <Check className="w-2.5 h-2.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
