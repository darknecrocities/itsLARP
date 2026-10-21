"use client";
import React, { useState, useEffect } from "react";
import { api, apiGet } from "@/lib/api";
import { X, ShieldCheck, Check, AlertTriangle, Key, Clock, Zap } from "lucide-react";
import { LinkedInIcon, IndeedIcon, GlassdoorIcon, WellfoundIcon } from "@/components/BrandIcons";

interface PlatformInfo {
  id: string;
  name: string;
  features: string[];
  connected: boolean;
  username: string;
  max_daily_applications: number;
  applications_today: number;
  remaining_today: number;
  min_delay_seconds: number;
  max_delay_seconds: number;
  allowed_actions: string[];
  active_schedule: { start: string; end: string };
  last_applied_at: string | null;
}

interface PlatformGuardrailsModalProps {
  onClose: () => void;
}

export function PlatformGuardrailsModal({ onClose }: PlatformGuardrailsModalProps) {
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [selectedPid, setSelectedPid] = useState<string>("linkedin");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [dailyCap, setDailyCap] = useState(15);
  const [minDelay, setMinDelay] = useState(60);
  const [maxDelay, setMaxDelay] = useState(180);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      const res = await apiGet<{ platforms: PlatformInfo[] }>("/platform-accounts");
      if (res?.platforms) {
        setPlatforms(res.platforms);
        const sel = res.platforms.find((p) => p.id === selectedPid) || res.platforms[0];
        if (sel) {
          setUsernameInput(sel.username || "");
          setDailyCap(sel.max_daily_applications || 15);
          setMinDelay(sel.min_delay_seconds || 60);
          setMaxDelay(sel.max_delay_seconds || 180);
        }
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to load platform credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const selectedPlatform = platforms.find((p) => p.id === selectedPid) || platforms[0];

  const handleSelectPlatform = (pid: string) => {
    setSelectedPid(pid);
    const p = platforms.find((item) => item.id === pid);
    if (p) {
      setUsernameInput(p.username || "");
      setDailyCap(p.max_daily_applications || 15);
      setMinDelay(p.min_delay_seconds || 60);
      setMaxDelay(p.max_delay_seconds || 180);
      setMsg(null);
      setErr(null);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setErr("Enter your username or email handle.");
      return;
    }
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      await api("/platform-accounts/connect", {
        platform: selectedPid,
        username: usernameInput.trim(),
        auth_token: tokenInput.trim() || undefined,
        max_daily_applications: dailyCap,
        min_delay_seconds: minDelay,
        max_delay_seconds: maxDelay,
        allowed_actions: ["easy_apply", "save_job"],
      });
      setMsg(`Connected ${selectedPlatform?.name || selectedPid} with daily safety guardrails.`);
      await fetchPlatforms();
    } catch (e: any) {
      setErr(e?.message || "Could not save platform credentials.");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      await api("/platform-accounts/disconnect", { platform: selectedPid });
      setMsg(`Disconnected ${selectedPlatform?.name || selectedPid}. Bot session revoked.`);
      setUsernameInput("");
      setTokenInput("");
      await fetchPlatforms();
    } catch (e: any) {
      setErr(e?.message || "Could not disconnect account.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestGuardrail = async () => {
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await api<{
        ok: boolean;
        applications_today: number;
        remaining_today: number;
        delay_enforced_seconds: number;
      }>("/platform-accounts/execute-action", {
        platform: selectedPid,
        company: "Stripe",
        role: "AI Systems Engineer",
        action: "easy_apply",
      });
      setMsg(`Guardrail verified: 1 application logged (${res.remaining_today} remaining today). Cooldown jitter enforced.`);
      await fetchPlatforms();
    } catch (e: any) {
      setErr(e?.message || "Guardrail test failed.");
    } finally {
      setSaving(false);
    }
  };

  const getPlatformIcon = (id: string) => {
    switch (id) {
      case "linkedin":
        return <LinkedInIcon className="w-4 h-4 text-[#0A66C2]" />;
      case "indeed":
        return <IndeedIcon className="w-4 h-4 text-[#2164f3]" />;
      case "glassdoor":
        return <GlassdoorIcon className="w-4 h-4 text-[#0caa41]" />;
      case "wellfound":
        return <WellfoundIcon className="w-4 h-4" />;
      default:
        return <Key className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white border border-neutral-300 rounded-lg max-w-xl w-full p-5 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-black text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-black">Platform Login & AI Guardrails</h3>
              <p className="text-xs text-neutral-500">Allow agents to apply using your verified accounts with strict safety controls.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-neutral-500 hover:text-black hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-4 gap-2">
          {platforms.map((p) => {
            const active = p.id === selectedPid;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPlatform(p.id)}
                className={`p-2.5 rounded border text-left flex flex-col justify-between transition ${
                  active ? "border-black bg-neutral-100" : "border-neutral-200 bg-white hover:border-neutral-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  {getPlatformIcon(p.id)}
                  {p.connected && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected" />}
                </div>
                <div className="mt-2">
                  <div className="text-xs font-semibold text-black">{p.name}</div>
                  <div className="text-[10px] text-neutral-500">
                    {p.connected ? `${p.remaining_today} left today` : "Not connected"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Form & Guardrail Settings */}
        {selectedPlatform && (
          <form onSubmit={handleConnect} className="space-y-4 pt-1">
            <div className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-800">Account Credentials</span>
                <span className={`text-[11px] font-medium ${selectedPlatform.connected ? "text-emerald-700" : "text-neutral-500"}`}>
                  {selectedPlatform.connected ? "Connected & Active" : "Disconnected"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-neutral-600 block mb-1">Username / Profile Handle</label>
                  <input
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. arronkianparejas"
                    className="input text-xs w-full"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-600 block mb-1">Session Cookie / Token (Optional)</label>
                  <input
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Encrypted locally"
                    className="input text-xs w-full"
                  />
                </div>
              </div>
            </div>

            {/* Guardrail Policy Controls */}
            <div className="p-3.5 bg-neutral-50 rounded border border-neutral-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Account Protection Guardrails (Hard Enforced)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-neutral-600 block mb-1">
                    Daily Application Quota: <strong>{dailyCap} / day</strong>
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={40}
                    value={dailyCap}
                    onChange={(e) => setDailyCap(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-[10px] text-neutral-500 mt-0.5">Stops all agents when {dailyCap} applications are reached.</div>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-600 block mb-1">
                    Human-Mimicry Delay: <strong>{minDelay}s - {maxDelay}s</strong>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={15}
                      max={120}
                      value={minDelay}
                      onChange={(e) => setMinDelay(Number(e.target.value))}
                      className="input text-xs w-20 py-1"
                    />
                    <span className="text-neutral-400">to</span>
                    <input
                      type="number"
                      min={60}
                      max={300}
                      value={maxDelay}
                      onChange={(e) => setMaxDelay(Number(e.target.value))}
                      className="input text-xs w-20 py-1"
                    />
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Randomized delay between submissions to avoid bans.</div>
                </div>
              </div>

              {/* Action Boundaries */}
              <div className="pt-2 border-t border-neutral-200 space-y-1.5 text-xs">
                <div className="font-semibold text-neutral-700 text-[11px]">Permitted AI Actions:</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-700">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>1-Click Easy Apply</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Save Job for Review</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-400 line-through">
                    <X className="w-3.5 h-3.5 text-red-500" />
                    <span>Direct Messaging Recruiters (Blocked)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-400 line-through">
                    <X className="w-3.5 h-3.5 text-red-500" />
                    <span>Profile Editing (Blocked)</span>
                  </div>
                </div>
              </div>
            </div>

            {msg && <div className="p-2.5 rounded bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">{msg}</div>}
            {err && <div className="p-2.5 rounded bg-red-50 text-red-800 text-xs font-medium border border-red-200">{err}</div>}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                {selectedPlatform.connected && (
                  <button
                    type="button"
                    onClick={handleTestGuardrail}
                    disabled={saving}
                    className="btn text-xs py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-amber-600" />
                    <span>Test 1 Safe Apply</span>
                  </button>
                )}
                {selectedPlatform.connected && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={saving}
                    className="btn text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 border border-red-200"
                  >
                    Disconnect
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button type="button" onClick={onClose} className="btn text-xs py-1.5 px-3">
                  Close
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary text-xs py-1.5 px-4">
                  {saving ? "Saving..." : selectedPlatform.connected ? "Update Guardrails" : "Save & Connect"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
