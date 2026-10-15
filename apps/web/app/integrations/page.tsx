"use client";
import React, { useState, useEffect } from "react";
import { api, apiGet } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Badge, ErrorBox, PageHeader } from "@/components/ui";
import { Check, Zap, ExternalLink, Mail, Bell, RefreshCw, Send, ShieldCheck } from "lucide-react";
import {
  NotionIcon,
  GmailIcon,
  OutlookIcon,
  LinkedInIcon,
  IndeedIcon,
  GlassdoorIcon,
  ZipRecruiterIcon,
  WellfoundIcon,
} from "@/components/BrandIcons";
import { sendDesktopNotification } from "@/lib/notifications";

export default function Integrations() {
  const {
    notion,
    setNotion,
    apps,
    emailIntegration,
    setEmailIntegration,
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

  // Email form state
  const [userEmail, setUserEmail] = useState(emailIntegration.email || "");
  const [emailProvider, setEmailProvider] = useState<"gmail" | "outlook">(
    emailIntegration.provider === "outlook" ? "outlook" : "gmail"
  );
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchEmailStatus();
  }, [fetchEmailStatus]);

  useEffect(() => {
    if (emailIntegration.email && !userEmail) {
      setUserEmail(emailIntegration.email);
    }
  }, [emailIntegration.email, userEmail]);

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
        `Connected to Notion workspace "${res.workspace}". Mirrored ${res.synced_count} job applications into your database.`
      );

      sendDesktopNotification({
        title: "Notion Sync Successful",
        body: `Created "HowToLarped Job Applications" and synced ${res.synced_count} records.`,
      });
    });

  const handleConnectEmail = async () => {
    if (!userEmail || !userEmail.includes("@")) {
      setErr("Please enter a valid candidate email address.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await api<{ ok: boolean }>("/integrations/email/connect", {
        provider: emailProvider,
        email: userEmail.trim(),
        monitoring_enabled: true,
      });
      if (res.ok) {
        setEmailIntegration({
          connected: true,
          email: userEmail.trim(),
          provider: emailProvider,
          monitoringEnabled: true,
        });
        setMsg(`Email monitoring active for ${userEmail.trim()} (${emailProvider.toUpperCase()}). Recruiter updates will auto-sync to Notion.`);
        sendDesktopNotification({
          title: "Email Monitoring Connected",
          body: `Now monitoring recruiter responses for ${userEmail.trim()}.`,
        });
      }
    } catch (e: any) {
      setErr(e.message || "Failed to connect email.");
    } finally {
      setBusy(false);
    }
  };

  const handleSimulateResponse = async (type: "interview" | "offer") => {
    setSimulating(true);
    setErr("");
    try {
      const company = type === "interview" ? "Stripe" : "Anthropic";
      const subject =
        type === "interview"
          ? "Interview Invitation: Lead AI Systems Engineer"
          : "Formal Offer Letter: Senior AI Architect";
      const snippet =
        type === "interview"
          ? "We were very impressed with your empirical skills and would like to schedule a technical chat this week."
          : "Congratulations! We are thrilled to extend an official job offer to join our engineering organization.";

      const res = await api<{
        ok: boolean;
        company: string;
        classification: string;
        matched_application_id: string | null;
        application_updated: boolean;
        notion_updated: boolean;
      }>("/integrations/email/simulate-response", {
        company,
        subject,
        snippet,
        sender: `recruiter@${company.toLowerCase()}.com`,
        status_override: type,
      });

      if (res.ok) {
        // Update local store application if matched
        if (res.matched_application_id) {
          const existing = apps.find((a) => a.id === res.matched_application_id);
          if (existing) {
            upsertApp({
              ...existing,
              status: type,
              events: [
                ...(existing.events || []),
                { at: new Date().toISOString(), text: `Email: ${subject}` },
              ],
            });
          }
        }
        await fetchEmailStatus();
        setMsg(
          `Detected ${type.toUpperCase()} from ${company}! Status updated${
            res.notion_updated ? " and mirrored to Notion database." : "."
          }`
        );

        sendDesktopNotification({
          title: `${type === "interview" ? "Interview Request" : "Job Offer"}: ${company}`,
          body: subject,
        });
      }
    } catch (e: any) {
      setErr(e.message || "Failed to simulate email response.");
    } finally {
      setSimulating(false);
    }
  };

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
    <div className="space-y-8">
      <PageHeader
        title="Integrations & Response Monitoring"
        sub="Connect Notion to track applications, link Gmail to auto-monitor recruiter replies, and select target job platforms."
      />

      {msg && (
        <div className="p-3 bg-neutral-100 border border-neutral-300 rounded text-black text-xs font-mono flex items-start gap-2">
          <Check className="w-4 h-4 text-ok shrink-0 mt-0.5" />
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

      {/* Grid of Core Integrations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 1. Notion Integration Card */}
        <section className="card p-6 bg-white border border-neutral-300 rounded-lg flex flex-col justify-between">
          <div>
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

            <div className="space-y-3 font-mono text-xs">
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
              </div>

              <div>
                <label htmlFor="np" className="label-xs block mb-1">
                  Parent Page URL or ID (Optional)
                </label>
                <input
                  id="np"
                  className="input text-xs"
                  value={parentPage}
                  onChange={(e) => setParentPage(e.target.value)}
                  placeholder="Auto-detects first shared page if left blank"
                />
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-neutral-200 mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              className="btn btn-primary text-xs py-2 px-4 font-semibold flex items-center gap-1.5"
              disabled={busy || token.length < 10}
              onClick={autoCreateList}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{busy ? "Syncing..." : "Auto-Create List & Sync"}</span>
            </button>
            {notion.connected && (
              <span className="text-[11px] font-mono text-neutral-500">
                Workspace: {notion.workspace || "Active"}
              </span>
            )}
          </div>
        </section>

        {/* 2. Gmail & Recruiter Response Monitor */}
        <section className="card p-6 bg-white border border-neutral-300 rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2.5">
                <GmailIcon className="w-6 h-6" />
                <h2 className="text-lg font-bold font-sans">Email Response Monitor</h2>
              </div>
              <Badge tone={emailIntegration.connected ? "ok" : "n"}>
                {emailIntegration.connected ? "Monitoring Active" : "Not Configured"}
              </Badge>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              Monitors recruiter replies, interview invitations, and status progressions. Automatically updates application statuses and triggers native desktop alerts.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="label-xs block mb-1">Email Provider</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEmailProvider("gmail")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-sans transition-colors ${
                      emailProvider === "gmail" ? "border-black bg-neutral-100 font-bold" : "border-neutral-200 bg-white"
                    }`}
                  >
                    <GmailIcon className="w-4 h-4" />
                    <span>Gmail</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailProvider("outlook")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-sans transition-colors ${
                      emailProvider === "outlook" ? "border-black bg-neutral-100 font-bold" : "border-neutral-200 bg-white"
                    }`}
                  >
                    <OutlookIcon className="w-4 h-4" />
                    <span>Outlook</span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="ue" className="label-xs block mb-1">
                  Candidate Email Address
                </label>
                <input
                  id="ue"
                  type="email"
                  className="input text-xs"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="e.g. candidate@gmail.com"
                />
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-neutral-200 mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              className="btn btn-primary text-xs py-2 px-4 font-semibold flex items-center gap-1.5"
              disabled={busy || !userEmail}
              onClick={handleConnectEmail}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{emailIntegration.connected ? "Update Email" : "Enable Monitoring"}</span>
            </button>

            {emailIntegration.connected && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={simulating}
                  onClick={() => handleSimulateResponse("interview")}
                  className="btn text-[11px] py-1.5 px-2.5 font-mono"
                  title="Simulate Interview Request and test Notion + Desktop alert"
                >
                  {simulating ? "Testing..." : "Test Interview Alert"}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

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

      {/* Recent Recruiter Response Feed */}
      {emailIntegration.responses && emailIntegration.responses.length > 0 && (
        <section className="card p-6 bg-neutral-50 border border-neutral-300 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-black" />
            <h3 className="text-sm font-bold font-sans">Detected Recruiter Responses</h3>
          </div>
          <div className="space-y-2">
            {emailIntegration.responses.slice(0, 5).map((r, i) => (
              <div
                key={i}
                className="p-3 bg-white rounded border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-black flex items-center gap-2">
                    <span>{r.company}</span>
                    <Badge tone={r.classification === "interview" || r.classification === "offer" ? "ok" : "warn"}>
                      {r.classification.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-neutral-700 font-mono text-[11px] mt-0.5">{r.subject}</div>
                  <div className="text-neutral-500 text-[11px] mt-1">{r.snippet}</div>
                </div>
                <div className="text-[10px] font-mono text-neutral-400 shrink-0">
                  {new Date(r.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
