"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, apiGet } from "@/lib/api";
import { Badge, PageHeader, ErrorBox } from "@/components/ui";
import { OllamaManager } from "@/components/OllamaManager";
import { UpdateNotificationModal } from "@/components/UpdateNotificationModal";
import { WalkthroughSettingsCard } from "@/components/walkthrough";

type AIStatusResponse = {
  provider: string;
  model: string;
  connected: boolean;
  models: string[];
  providers: {
    id: string;
    name: string;
    connected: boolean;
    default_model: string;
  }[];
};

export default function SettingsPage() {
  const { data, isLoading, refetch } = useQuery<AIStatusResponse>({
    queryKey: ["ai_status"],
    queryFn: () => apiGet<AIStatusResponse>("/ai/status"),
    retry: false,
  });

  const [selectedProvider, setSelectedProvider] = useState<string>("ollama");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");
  const [showUpdatesModal, setShowUpdatesModal] = useState(false);
  const [updatesTab, setUpdatesTab] = useState<"merged" | "adds" | "fixes" | "verification" | "updater">("merged");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("updates") === "true") {
        setShowUpdatesModal(true);
        const t = params.get("tab");
        if (t === "merged" || t === "adds" || t === "fixes" || t === "verification" || t === "updater") {
          setUpdatesTab(t);
        }
      }
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    setSaveErr("");
    try {
      await api("/ai/configure", {
        provider: selectedProvider,
        model: selectedModel || (selectedProvider === "ollama" ? (data?.models[0] ?? "qwen2.5-coder:7b") : "gemini-1.5-flash"),
        api_key: apiKey || undefined,
      });
      setSaveMsg("AI Gateway configuration updated successfully.");
      refetch();
    } catch (err: any) {
      setSaveErr(err.message || "Failed to update configuration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div data-tour="settings-header">
        <PageHeader
          title="Settings & AI Gateway"
          sub="Local AI first. Ollama is a first-class provider. Multi-provider abstraction enables seamless switching without application rewrites."
          action={
            <button
              data-tour="settings-status-btn"
              className="btn"
              onClick={() => refetch()}
            >
              Re-check Status
            </button>
          }
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-4xl">
        {/* Provider Status Table */}
        <section data-tour="settings-provider-table" className="card p-6">
          <h2 className="text-lg font-semibold mb-3">AI Providers Overview</h2>
          <table className="w-full text-left text-sm">
            <thead className="label-xs border-b border-line">
              <tr>
                <th scope="col" className="py-2">Provider</th>
                <th scope="col">Status</th>
                <th scope="col">Active / Available Model</th>
              </tr>
            </thead>
            <tbody>
              {data?.providers?.map((p) => {
                const isActive = data.provider === p.id;
                return (
                  <tr key={p.id} className="border-b border-line">
                    <td className="py-3 font-medium">
                      {p.name} {isActive && <Badge tone="ok">ACTIVE</Badge>}
                    </td>
                    <td>
                      <Badge tone={p.connected ? "ok" : "n"}>
                        {p.connected ? "Connected" : "Offline"}
                      </Badge>
                    </td>
                    <td className="font-mono text-xs text-muted">
                      {p.id === "ollama" && data.models.length > 0
                        ? `${data.models.length} local models`
                        : p.default_model}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-4 p-3 bg-bg2 rounded text-xs text-muted">
            {data?.connected ? (
              <span className="text-ok font-medium inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-ok shrink-0 animate-pulse" />
                <span>Local Ollama is connected. {data.models.length} models detected.</span>
              </span>
            ) : (
              <span>
                Ollama not detected on port 11434. The deterministic engine is active as an immediate fallback.
              </span>
            )}
          </div>
        </section>

        {/* Configure Provider Form */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold mb-3">Configure Active Model</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label-xs" htmlFor="pv">AI Provider</label>
              <select
                id="pv"
                data-tour="settings-provider-select"
                className="input mt-1"
                value={selectedProvider}
                onChange={(e) => {
                  setSelectedProvider(e.target.value);
                  setSelectedModel("");
                }}
              >
                <option value="ollama">Ollama (Local AI First)</option>
                <option value="google">Google Gemini API</option>
                <option value="openai">OpenAI API</option>
                <option value="anthropic">Anthropic Claude</option>
              </select>
            </div>

            {selectedProvider === "ollama" ? (
              <div>
                <label className="label-xs" htmlFor="om">Installed Ollama Model</label>
                <select
                  id="om"
                  data-tour="settings-model-select"
                  className="input mt-1 font-mono text-xs"
                  value={selectedModel || data?.model || ""}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  {data?.models?.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                  {(!data?.models || data.models.length === 0) && (
                    <option value="qwen2.5-coder:7b">qwen2.5-coder:7b (default)</option>
                  )}
                </select>
              </div>
            ) : (
              <div>
                <label className="label-xs" htmlFor="cm">Model Name</label>
                <input
                  id="cm"
                  data-tour="settings-model-select"
                  className="input mt-1"
                  placeholder={
                    selectedProvider === "google"
                      ? "gemini-1.5-flash"
                      : selectedProvider === "openai"
                      ? "gpt-4o-mini"
                      : "claude-3-5-haiku"
                  }
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                />
              </div>
            )}

            {selectedProvider !== "ollama" && (
              <div>
                <label className="label-xs" htmlFor="key">Provider API Key</label>
                <input
                  id="key"
                  type="password"
                  className="input mt-1 font-mono text-xs"
                  placeholder="sk-... or AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-[11px] text-muted mt-1">
                  Cloud keys are securely configured server-side.
                </p>
              </div>
            )}

            {saveMsg && <p className="text-xs text-ok">{saveMsg}</p>}
            {saveErr && <ErrorBox msg={saveErr} />}

            <button
              type="submit"
              data-tour="settings-save-btn"
              className="btn btn-primary w-full py-2"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save AI Gateway Configuration"}
            </button>
          </form>
        </section>
      </div>

      {/* Local Ollama Engine & Model Hub */}
      <section data-tour="settings-ollama-hub" className="mt-10 max-w-4xl">
        <OllamaManager />
      </section>

      {/* Interactive App Walkthrough & Feature Spotlight Tour */}
      <WalkthroughSettingsCard />

      {/* Software Updates & Production Changelog */}
      <section
        data-tour="settings-changelog-card"
        className="mt-8 max-w-4xl card p-6 border border-line bg-card"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 bg-black text-white rounded font-bold">
                VERSION 1.0.0
              </span>
              <span className="font-mono text-xs px-2 py-0.5 bg-ok/10 text-ok border border-ok/30 rounded font-semibold">
                [STATUS: UP TO DATE]
              </span>
            </div>
            <h3 className="text-base font-semibold mt-2">Software Updates & Production Changelog</h3>
            <p className="text-xs text-muted mt-0.5">
              Review merged pull requests, architectural feature additions, stability fixes, and automated test verifications.
            </p>
          </div>
          <button
            type="button"
            data-tour="settings-changelog-btn"
            onClick={() => setShowUpdatesModal(true)}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <span>View Release Changelog</span>
          </button>
        </div>
      </section>

      <UpdateNotificationModal
        isOpen={showUpdatesModal}
        onClose={() => setShowUpdatesModal(false)}
        initialTab={updatesTab}
      />
    </>
  );
}
