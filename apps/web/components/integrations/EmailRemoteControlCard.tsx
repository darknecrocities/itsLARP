"use client";
import React, { useState, useEffect } from "react";
import { api, apiGet } from "@/lib/api";
import { Mail, Bell, RefreshCw, Send, ShieldCheck, CheckCircle2, Play, Pause, Terminal } from "lucide-react";
import { GmailIcon, OutlookIcon } from "@/components/BrandIcons";
import { sendDesktopNotification } from "@/lib/notifications";

interface EmailIntegrationState {
  connected: boolean;
  provider: string;
  email: string;
  monitoring_enabled: boolean;
  device_notifications_enabled: boolean;
  swarm_paused: boolean;
  last_checked_at: string | null;
  responses: Array<{ company: string; subject: string; snippet: string; classification: string; date: string }>;
  commands_log: Array<{ command: string; sender: string; subject: string; executed_at: string; response: string }>;
  device_notifications: Array<{ id: string; event_type: string; title: string; message: string; timestamp: string }>;
}

export function EmailRemoteControlCard() {
  const [data, setData] = useState<EmailIntegrationState | null>(null);
  const [emailInput, setEmailInput] = useState("parejasarronkian@gmail.com");
  const [provider, setProvider] = useState<"gmail" | "outlook">("gmail");
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [testCmd, setTestCmd] = useState("STATUS");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await apiGet<EmailIntegrationState>("/integrations/email/status");
      if (res) {
        setData(res);
        if (res.email) setEmailInput(res.email);
        if (res.provider === "outlook") setProvider("outlook");
      }
    } catch {
      // Non-blocking fallback
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    setErr(null);
    try {
      await api("/integrations/email/connect", {
        provider,
        email: emailInput.trim(),
        monitoring_enabled: true,
      });
      setStatusMsg(`Connected ${emailInput} for notifications and remote control.`);
      await fetchStatus();
    } catch (e: any) {
      setErr(e?.message || "Could not save email settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await api<{ ok: boolean; notification: any }>("/integrations/email/send-notification", {
        event_type: "job_search_complete",
        title: "Job Search Complete",
        message: "Swarm discovered 10 verified engineering roles matching your profile.",
        recipient: emailInput.trim(),
      });
      if (res?.ok) {
        sendDesktopNotification({
          title: "Job Search Complete",
          body: "Swarm discovered 10 verified engineering roles matching your profile.",
          priority: "high",
          bypassAntiSpam: true,
        });
        setStatusMsg("Alert dispatched to your computer and logged for " + emailInput);
        await fetchStatus();
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to dispatch test notification.");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteCommand = async (command: string) => {
    setSimulating(true);
    setStatusMsg(null);
    setErr(null);
    try {
      const res = await api<{
        ok: boolean;
        command: string;
        response_message: string;
        swarm_paused: boolean;
      }>("/integrations/email/command", {
        sender: emailInput.trim(),
        subject: command,
        body: `Command sent from ${emailInput}`,
      });
      if (res?.ok) {
        setStatusMsg(`Command [${res.command}] executed: ${res.response_message}`);
        await fetchStatus();
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to execute email command.");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div data-tour="integrations-email-card" className="card p-5 mb-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-black text-white">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-black">Email & Device Remote Control</h3>
            <p className="text-xs text-neutral-500">
              Receive live milestone alerts and command your application swarm directly from your email.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            data-tour="integrations-email-badge"
            className={`text-[11px] px-2.5 py-1 rounded font-medium flex items-center gap-1.5 ${
              data?.connected
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-neutral-100 text-neutral-700 border border-neutral-300 font-mono"
            }`}
          >
            {data?.connected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active · {data.email || emailInput}</span>
              </>
            ) : (
              <span>Candidate: {emailInput}</span>
            )}
          </span>
          <button
            type="button"
            onClick={fetchStatus}
            className="p-1 text-neutral-500 hover:text-black rounded"
            title="Refresh status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Email Connection Configuration */}
      <form onSubmit={handleSaveEmail} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="text-[11px] text-neutral-600 block mb-1">Candidate Email Address</label>
          <input
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="parejasarronkian@gmail.com"
            className="input text-xs w-full font-mono"
          />
        </div>

        <div>
          <label className="text-[11px] text-neutral-600 block mb-1">Provider Protocol</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setProvider("gmail")}
              className={`flex-1 py-1.5 px-2.5 rounded border text-xs flex items-center justify-center gap-1.5 transition ${
                provider === "gmail" ? "border-black bg-neutral-100 font-semibold" : "border-neutral-200 bg-white"
              }`}
            >
              <GmailIcon className="w-3.5 h-3.5" />
              <span>Gmail API</span>
            </button>
            <button
              type="button"
              onClick={() => setProvider("outlook")}
              className={`flex-1 py-1.5 px-2.5 rounded border text-xs flex items-center justify-center gap-1.5 transition ${
                provider === "outlook" ? "border-black bg-neutral-100 font-semibold" : "border-neutral-200 bg-white"
              }`}
            >
              <OutlookIcon className="w-3.5 h-3.5" />
              <span>Outlook / IMAP</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn btn-primary text-xs py-2 flex-1">
            {loading ? "Saving..." : "Save Email"}
          </button>
          <button
            type="button"
            data-tour="integrations-notify-toggle"
            onClick={handleSendTestNotification}
            disabled={loading}
            className="btn text-xs py-2 px-3 border border-neutral-300 hover:bg-neutral-100 flex items-center gap-1"
            title="Trigger a test alert to your browser and device"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Test Alert</span>
          </button>
        </div>
      </form>

      {/* Remote Swarm Control Console */}
      <div className="p-4 bg-neutral-50 rounded border border-neutral-200 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
            <Terminal className="w-4 h-4 text-black" />
            <span>Email Remote Control Console (parejasarronkian@gmail.com)</span>
          </div>
          <span className="text-[11px] text-neutral-500">
            Swarm Status: <strong className={data?.swarm_paused ? "text-amber-600" : "text-emerald-600"}>
              {data?.swarm_paused ? "PAUSED" : "ACTIVE"}
            </strong>
          </span>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          Send an email from <strong>{emailInput}</strong> to your connected itsLARP address with subjects:
          <code className="mx-1 px-1.5 py-0.5 rounded bg-neutral-200 text-black font-mono text-[11px]">STATUS</code>
          <code className="mx-1 px-1.5 py-0.5 rounded bg-neutral-200 text-black font-mono text-[11px]">PAUSE</code>
          <code className="mx-1 px-1.5 py-0.5 rounded bg-neutral-200 text-black font-mono text-[11px]">RESUME</code>
          <code className="mx-1 px-1.5 py-0.5 rounded bg-neutral-200 text-black font-mono text-[11px]">APPLY 10</code>
        </p>

        {/* Quick Test Action Buttons */}
        <div data-tour="integrations-command-input" className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            data-tour="integrations-command-btn"
            onClick={() => handleExecuteCommand("STATUS")}
            disabled={simulating}
            className="btn text-xs py-1 px-2.5 bg-white border border-neutral-300 hover:border-black font-mono"
          >
            Simulate "STATUS"
          </button>
          <button
            type="button"
            onClick={() => handleExecuteCommand("PAUSE")}
            disabled={simulating}
            className="btn text-xs py-1 px-2.5 bg-white border border-neutral-300 hover:border-black font-mono flex items-center gap-1"
          >
            <Pause className="w-3 h-3 text-amber-600" />
            <span>Simulate "PAUSE"</span>
          </button>
          <button
            type="button"
            onClick={() => handleExecuteCommand("RESUME")}
            disabled={simulating}
            className="btn text-xs py-1 px-2.5 bg-white border border-neutral-300 hover:border-black font-mono flex items-center gap-1"
          >
            <Play className="w-3 h-3 text-emerald-600" />
            <span>Simulate "RESUME"</span>
          </button>
          <button
            type="button"
            onClick={() => handleExecuteCommand("APPLY 10")}
            disabled={simulating}
            className="btn text-xs py-1 px-2.5 bg-white border border-neutral-300 hover:border-black font-mono"
          >
            Simulate "APPLY 10"
          </button>
        </div>

        {/* Device Alerts Dispatch Log */}
        <div data-tour="integrations-alerts-log" className="pt-2 border-t border-neutral-200">
          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-600 mb-1.5">
            <span className="flex items-center gap-1">
              <Bell className="w-3 h-3 text-black" />
              <span>Device Alerts Dispatch Log ({emailInput}):</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">Live Sync</span>
          </div>
          {data?.device_notifications && data.device_notifications.length > 0 ? (
            <div className="space-y-1 font-mono text-[11px]">
              {data.device_notifications.slice(0, 2).map((n) => (
                <div key={n.id} className="p-2 bg-white rounded border border-neutral-200 flex justify-between">
                  <span className="font-semibold text-black">{n.title}: {n.message}</span>
                  <span className="text-[10px] text-neutral-400">{new Date(n.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2 bg-white rounded border border-neutral-200 text-[11px] text-neutral-500 font-mono">
              Ready to stream alerts. Click "Test Alert" above to dispatch a browser alert.
            </div>
          )}
        </div>

        {/* Recent Commands Log */}
        <div data-tour="integrations-command-history" className="pt-2 border-t border-neutral-200">
          <div className="text-[11px] font-semibold text-neutral-600 mb-1.5">Executed Remote Email Commands:</div>
          {data?.commands_log && data.commands_log.length > 0 ? (
            <div className="max-h-36 overflow-y-auto space-y-1.5 font-mono text-[11px]">
              {data.commands_log.slice(0, 4).map((c, i) => (
                <div key={i} className="p-2 bg-white rounded border border-neutral-200 text-neutral-700">
                  <div className="flex justify-between items-center text-[10px] text-neutral-500 mb-0.5">
                    <span className="font-bold text-black">{c.command} from {c.sender}</span>
                    <span>{new Date(c.executed_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-neutral-800 font-sans">{c.response}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2 bg-white rounded border border-neutral-200 text-[11px] text-neutral-500 font-mono">
              No remote commands yet. Dispatch STATUS or APPLY to test execution.
            </div>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className="p-2.5 rounded bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
          {statusMsg}
        </div>
      )}
      {err && (
        <div className="p-2.5 rounded bg-red-50 text-red-800 text-xs font-medium border border-red-200">
          {err}
        </div>
      )}
    </div>
  );
}
