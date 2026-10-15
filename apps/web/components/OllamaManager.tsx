"use client";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, apiGet, API } from "@/lib/api";
import { Download, RefreshCw, Play, Cpu } from "lucide-react";
import {
  type OllamaStatus,
  type RecommendedModel,
  DEFAULT_RECOMMENDED,
} from "@/lib/ollamaTypes";
import { OllamaModelCard } from "./OllamaModelCard";

export function OllamaManager() {
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useQuery<OllamaStatus>({
    queryKey: ["ollama_status"],
    queryFn: async () => {
      if (typeof window !== "undefined" && (window as any).electronAPI) {
        try {
          const res = await (window as any).electronAPI.checkOllamaStatus();
          const hw = await (window as any).electronAPI.getHardwareSpecs();
          return {
            installed: Boolean(res.installed),
            running: Boolean(res.running),
            version: "0.33",
            binary_path: res.binaryPath || null,
            port: 11434,
            host: "http://127.0.0.1:11434",
            models: res.models || [],
            models_count: (res.models || []).length,
            os: hw.platform,
            hardware_tier: hw.tier,
          };
        } catch {}
      }
      try {
        return await apiGet<OllamaStatus>("/ai/ollama/status");
      } catch {
        try {
          const direct = await fetch("http://127.0.0.1:11434/api/tags");
          if (direct.ok) {
            const data = await direct.json();
            return {
              installed: true,
              running: true,
              version: "0.33",
              binary_path: null,
              port: 11434,
              host: "http://127.0.0.1:11434",
              models: (data.models || []).map((m: any) => m.name),
              models_count: (data.models || []).length,
              os: "local",
              hardware_tier: "On-Device Ollama Engine",
            };
          }
        } catch {}
        return {
          installed: false,
          running: false,
          version: null,
          binary_path: null,
          port: 11434,
          host: "http://127.0.0.1:11434",
          models: [],
          models_count: 0,
          os: "unknown",
          hardware_tier: "Engine Offline",
        };
      }
    },
    refetchInterval: 5000,
  });

  const { data: recData } = useQuery<{ recommended: RecommendedModel[] }>({
    queryKey: ["recommended_models"],
    queryFn: async () => {
      try {
        return await apiGet<{ recommended: RecommendedModel[] }>("/ai/models/recommended");
      } catch {
        return { recommended: DEFAULT_RECOMMENDED };
      }
    },
  });

  const [activeCategory, setActiveCategory] = useState<"all" | "performance" | "balanced" | "ability">("all");
  const [pullingModel, setPullingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<{ status: string; completed?: number; total?: number; pct?: number } | null>(null);
  const [installing, setInstalling] = useState(false);
  const [installMsg, setInstallMsg] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string>("qwen2.5-coder:7b");

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

    if (typeof window !== "undefined" && (window as any).electronAPI?.installOllama) {
      try {
        const res = await (window as any).electronAPI.installOllama();
        setInstallMsg(res.message || "Installer launched. Complete setup to start Ollama.");
      } catch (err: any) {
        setInstallMsg(`Install error: ${err.message}`);
      } finally {
        setInstalling(false);
      }
      return;
    }

    try {
      const res = await api<{ ok: boolean; installer_url: string; instructions: string }>("/ai/ollama/install", {});
      setInstallMsg(`Installer ready: ${res.instructions}`);
      if (typeof window !== "undefined" && res.installer_url) {
        window.open(res.installer_url, "_blank");
      }
      const poll = setInterval(async () => {
        const s = await refetchStatus();
        if (s.data?.running) {
          clearInterval(poll);
          setInstalling(false);
          setInstallMsg("✓ Ollama detected and running!");
        }
      }, 3000);
    } catch {
      setInstallMsg("Install trigger completed. Follow on-screen instructions.");
      setInstalling(false);
    }
  };

  const handleStartDaemon = async () => {
    setInstallMsg("Starting Ollama background daemon...");
    if (typeof window !== "undefined" && (window as any).electronAPI?.startOllama) {
      await (window as any).electronAPI.startOllama();
      setTimeout(async () => {
        await refetchStatus();
        setInstallMsg("✓ Ollama daemon started.");
      }, 1500);
      return;
    }
    try {
      await api("/ai/ollama/start");
      setTimeout(async () => {
        await refetchStatus();
        setInstallMsg("✓ Ollama service running.");
      }, 1500);
    } catch (err: any) {
      setInstallMsg(err.message || "Failed to start Ollama service.");
    }
  };

  const handlePullModel = async (modelName: string) => {
    setPullingModel(modelName);
    setPullProgress({ status: "Starting pull..." });

    if (typeof window !== "undefined" && (window as any).electronAPI?.pullModel) {
      const unsub = (window as any).electronAPI.onPullProgress((data: any) => {
        if (data.total && data.completed) {
          const pct = Math.round((data.completed / data.total) * 100);
          setPullProgress({ status: data.status, completed: data.completed, total: data.total, pct });
        } else if (data.status) {
          setPullProgress({ status: data.status });
        }
      });

      try {
        const res = await (window as any).electronAPI.pullModel(modelName);
        if (res.ok) {
          setPullProgress({ status: "Complete!", pct: 100 });
          await refetchStatus();
          await handleSelectModel(modelName);
        } else {
          setPullProgress({ status: `Pull failed: ${res.error}` });
        }
      } catch (e: any) {
        setPullProgress({ status: `Pull failed: ${e.message}` });
      } finally {
        if (typeof unsub === "function") unsub();
        setTimeout(() => {
          setPullingModel(null);
          setPullProgress(null);
        }, 2500);
      }
      return;
    }

    try {
      const res = await fetch(`${API}/ai/ollama/pull`, {
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
    } catch {
      setActiveModel(modelName);
    }
  };

  const isModelInstalled = (name: string) => {
    if (!status?.models) return false;
    const clean = name.split(":")[0];
    return status.models.some((m) => m === name || m.startsWith(`${clean}:`));
  };

  const filteredModels = (recData?.recommended || DEFAULT_RECOMMENDED).filter((m) => {
    if (activeCategory === "all") return true;
    return m.category === activeCategory;
  });

  return (
    <div className="card p-6 bg-white text-black border border-neutral-300 font-sans space-y-6">
      {/* Header & Status Indicator */}
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-200 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center font-bold font-mono">
            <Cpu className="w-5 h-5 text-white" />
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
                  {status?.installed ? "STOPPED" : "NOT CONNECTED"}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">
              {status?.running
                ? `${status.models.length} model(s) installed on localhost:11434 · ${status.hardware_tier}`
                : "Local Ollama daemon not running. Automated installer & starter available."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status?.installed && !status?.running && (
            <button
              onClick={handleStartDaemon}
              className="btn text-xs py-1.5 px-3 flex items-center gap-1.5 font-semibold bg-black text-white"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Daemon</span>
            </button>
          )}
          {!status?.installed && !status?.running && (
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
                {cat === "all" ? "All Models" : cat === "performance" ? "High Speed (Low RAM)" : cat === "balanced" ? "Balanced Spec" : "Deep Reasoning"}
              </button>
            ))}
          </div>
        </div>

        {/* Model Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredModels.map((m) => (
            <OllamaModelCard
              key={m.name}
              model={m}
              installed={isModelInstalled(m.name)}
              isActive={activeModel === m.name}
              isPulling={pullingModel === m.name}
              pullProgress={pullProgress}
              onSelect={handleSelectModel}
              onPull={handlePullModel}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
