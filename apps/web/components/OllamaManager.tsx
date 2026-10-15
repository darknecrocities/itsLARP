"use client";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, apiGet } from "@/lib/api";
import { Badge } from "./ui";
import { Cpu, Download, CheckCircle, AlertCircle, RefreshCw, Zap, Sparkles } from "lucide-react";

interface OllamaStatus {
  installed: boolean;
  running: boolean;
  version: string | null;
  binary_path: string | null;
  port: number;
  host: string;
  models: string[];
  models_count: number;
  os: string;
  hardware_tier: string;
}

interface RecommendedModel {
  name: string;
  category: "performance" | "balanced" | "ability";
  tier: string;
  size: string;
  params: string;
  min_ram: string;
  rec_ram: string;
  speed_score: number;
  ability_score: number;
  best_for: string;
  is_default: boolean;
}

export function OllamaManager() {
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useQuery<OllamaStatus>({
    queryKey: ["ollama_status"],
    queryFn: () => apiGet<OllamaStatus>("/ai/ollama/status"),
    refetchInterval: 5000,
  });

  const { data: recData } = useQuery<{ recommended: RecommendedModel[] }>({
    queryKey: ["recommended_models"],
    queryFn: () => apiGet<{ recommended: RecommendedModel[] }>("/ai/models/recommended"),
  });

  const [activeCategory, setActiveCategory] = useState<"all" | "performance" | "balanced" | "ability">("all");
  const [pullingModel, setPullingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<{ status: string; completed?: number; total?: number; pct?: number } | null>(null);
  const [installing, setInstalling] = useState(false);
  const [installMsg, setInstallMsg] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string>("qwen2.5-coder:7b");

  // Load current configured model
  useEffect(() => {
    apiGet<any>("/ai/status")
      .then((res) => {
        if (res?.model) setActiveModel(res.model);
      })
      .catch(() => {});
  }, []);

  const handleAutomatedInstall = async () => {
    setInstalling(true);
    setInstallMsg("Contacting installer service...");
    try {
      const res = await api<{ ok: boolean; installer_url: string; instructions: string }>("/ai/ollama/install", {});
      setInstallMsg(`Installer ready: ${res.instructions}`);
      if (typeof window !== "undefined" && res.installer_url) {
        window.open(res.installer_url, "_blank");
      }
      // Poll status continuously
      const poll = setInterval(async () => {
        const s = await refetchStatus();
        if (s.data?.running) {
          clearInterval(poll);
          setInstalling(false);
          setInstallMsg("✓ Ollama detected and running!");
        }
      }, 3000);
    } catch (err: any) {
      setInstallMsg("Install trigger completed. Follow on-screen instructions.");
      setInstalling(false);
    }
  };

  const handlePullModel = async (modelName: string) => {
    setPullingModel(modelName);
    setPullProgress({ status: "Starting pull..." });

    try {
      const res = await fetch("http://localhost:8000/ai/ollama/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelName }),
      });

      if (!res.body) throw new Error("No readable stream response");
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.total && data.completed) {
              const pct = Math.round((data.completed / data.total) * 100);
              setPullProgress({ status: data.status, completed: data.completed, total: data.total, pct });
            } else if (data.status) {
              setPullProgress({ status: data.status });
            }
          } catch {}
        }
      }

      setPullProgress({ status: "Complete!", pct: 100 });
      await refetchStatus();
      await handleSelectModel(modelName);
    } catch (e: any) {
      setPullProgress({ status: `Pull failed: ${e.message}` });
    } finally {
      setTimeout(() => {
        setPullingModel(null);
        setPullProgress(null);
      }, 2500);
    }
  };

  const handleSelectModel = async (modelName: string) => {
    try {
      await api("/ai/configure", { provider: "ollama", model: modelName });
      setActiveModel(modelName);
    } catch {}
  };

  const isModelInstalled = (name: string) => {
    if (!status?.models) return false;
    const clean = name.split(":")[0];
    return status.models.some((m) => m === name || m.startsWith(`${clean}:`));
  };

  const filteredModels = (recData?.recommended || []).filter((m) => {
    if (activeCategory === "all") return true;
    return m.category === activeCategory;
  });

  return (
    <div className="card p-6 bg-white text-black border border-neutral-300 font-sans space-y-6">
      {/* Header & Status Indicator */}
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-200 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center font-bold font-mono">
            🦙
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Local Ollama Engine</h3>
              {status?.running ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-[11px] font-mono text-black font-semibold">
                  <span className="w-2 h-2 rounded-full bg-ok inline-block animate-pulse" />
                  ONLINE · {status.version || "v0.33"}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-neutral-200 border border-neutral-400 rounded text-[11px] font-mono text-black font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  NOT CONNECTED
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">
              {status?.running
                ? `${status.models.length} model(s) installed on localhost:11434 · ${status.hardware_tier}`
                : "Local Ollama daemon not running. Automated installer available below."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!status?.running && (
            <button
              onClick={handleAutomatedInstall}
              disabled={installing}
              className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{installing ? "Setting up..." : "1-Click Auto Install"}</span>
            </button>
          )}
          <button
            onClick={() => refetchStatus()}
            className="btn text-xs py-1.5 px-2.5 font-mono flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${statusLoading ? "animate-spin" : ""}`} />
            <span>Check</span>
          </button>
        </div>
      </div>

      {/* Installer Message Banner */}
      {installMsg && (
        <div className="p-3 bg-neutral-100 border border-black rounded text-xs font-mono flex items-center justify-between">
          <span>{installMsg}</span>
          <button className="text-neutral-500 hover:text-black" onClick={() => setInstallMsg(null)}>✕</button>
        </div>
      )}

      {/* Active Model & Hardware Badge */}
      <div className="p-3 bg-neutral-50 border border-neutral-200 rounded flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div>
          <span className="text-neutral-500">ACTIVE MODEL: </span>
          <strong className="text-black">{activeModel}</strong>
        </div>
        <div className="text-neutral-600">
          HARDWARE ACCELERATION: <strong className="text-ok">{status?.hardware_tier || "Detected System"}</strong>
        </div>
      </div>

      {/* Filter Tabs by Performance vs Ability */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="label-xs text-neutral-500">RECOMMENDED MODELS FOR PERFORMANCE & ABILITY</div>
          <div className="flex gap-1.5 text-xs font-mono">
            {(["all", "performance", "balanced", "ability"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                  activeCategory === cat
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-white border-neutral-300 text-neutral-800 hover:border-black"
                }`}
              >
                {cat === "all" ? "All Models" : cat === "performance" ? "⚡ High Performance (Low RAM)" : cat === "balanced" ? "★ Sweet Spot" : "🧠 Maximum Ability"}
              </button>
            ))}
          </div>
        </div>

        {/* Model Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredModels.map((m) => {
            const installed = isModelInstalled(m.name);
            const isActive = activeModel === m.name;
            const isPulling = pullingModel === m.name;

            return (
              <div
                key={m.name}
                className={`p-4 rounded border flex flex-col justify-between transition-all ${
                  isActive
                    ? "border-black bg-neutral-100 shadow-sm"
                    : installed
                    ? "border-neutral-300 bg-white"
                    : "border-neutral-200 bg-neutral-50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-black">{m.name}</span>
                    {m.is_default && <Badge tone="ok">RECOMMENDED</Badge>}
                  </div>

                  <div className="text-[11px] text-neutral-500 font-mono mb-2">{m.tier}</div>
                  <p className="text-xs text-neutral-700 leading-snug mb-3">{m.best_for}</p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono p-2 bg-white rounded border border-neutral-200 mb-3">
                    <div>Size: <strong>{m.size}</strong></div>
                    <div>Min RAM: <strong>{m.min_ram}</strong></div>
                    <div>Speed: <strong>{m.speed_score}/10</strong></div>
                    <div>Ability: <strong>{m.ability_score}/10</strong></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-200">
                  {isPulling ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="truncate">{pullProgress?.status || "Pulling..."}</span>
                        <span>{pullProgress?.pct ? `${pullProgress.pct}%` : ""}</span>
                      </div>
                      <div className="w-full bg-neutral-200 h-1.5 rounded overflow-hidden">
                        <div
                          className="bg-black h-full transition-all duration-300"
                          style={{ width: `${pullProgress?.pct || 20}%` }}
                        />
                      </div>
                    </div>
                  ) : isActive ? (
                    <div className="text-center py-1 text-xs font-mono font-bold text-black bg-neutral-200 rounded">
                      ✓ Active Engine
                    </div>
                  ) : installed ? (
                    <button
                      onClick={() => handleSelectModel(m.name)}
                      className="btn w-full text-xs py-1.5 font-medium border border-neutral-300 hover:border-black"
                    >
                      Set Active
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePullModel(m.name)}
                      className="btn btn-primary w-full text-xs py-1.5 flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>1-Click Download ({m.size})</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
