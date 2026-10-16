import { create } from "zustand";
import { api, apiGet } from "./api";
import { useStore, type Profile } from "./store";

export type Stage = "discovery" | "analysis" | "matching" | "resumes" | "applications";
export const STAGES: Stage[] = ["discovery", "analysis", "matching", "resumes", "applications"];

export type AgentLog = { t: string; id: string; msg: string };

export type BotTelemetry = {
  id: string;
  pool: "discovery" | "tailor" | "apply" | "notion";
  platform: string;

  status: "idle" | "browsing" | "analyzing" | "tailoring" | "applying" | "completed" | "needs_verification";
  current_task: string;
  cpu_pct: number;
  memory_mb: number;
  target_company?: string;
  target_role?: string;
  logs: { t: string; msg: string }[];
  verification_challenge?: { platform: string; prompt: string; created_at: number } | null;
};

export type SwarmSnapshot = {
  id: string;
  status: "running" | "completed" | "stopped";
  workers: number;
  target_jobs?: number;
  active: number;
  counts: Record<Stage, { queued: number; done: number; failed: number; retries?: number }>;
  total_queued?: number;
  total_done?: number;
  total_failed?: number;
  feed: AgentLog[];
  dead: number;
  elapsed: number;
  jobs: number;
  ready: number;
  blocked: number;
  pools?: {
    scrapers_count: number;
    tailors_count: number;
    appliers_count: number;
    scrapers_active: number;
    tailors_active: number;
    appliers_active: number;
  };
  alerts?: BotTelemetry[];
  sample_bots?: BotTelemetry[];
};

export type SwarmResultItem = {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    remote: boolean;
    salary: string;
    source: string;
    skills: string[];
    domain: string;
  };
  match?: {
    score: number;
    label: string;
    strong: string[];
    missing: string[];
  };
  state?: string;
  blocked?: number;
  cover?: string;
  resume_format?: string;
  resume_text?: string;
  app_id?: string;
};

const zeroCounts = () =>
  Object.fromEntries(
    STAGES.map((s) => [s, { queued: 0, done: 0, failed: 0 }])
  ) as Record<Stage, { queued: number; done: number; failed: number }>;

type SwarmState = {
  runId: string | null;
  running: boolean;
  workers: number;
  active: number;
  status: "idle" | "running" | "completed" | "stopped";
  counts: Record<Stage, { queued: number; done: number; failed: number }>;
  feed: AgentLog[];
  elapsed: number;
  discoveredCount: number;
  readyCount: number;
  blockedCount: number;
  results: SwarmResultItem[];
  bots: BotTelemetry[];
  selectedBotId: string | null;
  pools: {
    scrapers_count: number;
    tailors_count: number;
    appliers_count: number;
    scrapers_active: number;
    tailors_active: number;
    appliers_active: number;
  };
  alerts: BotTelemetry[];
  targetJobs: number;
  setSelectedBotId: (id: string | null) => void;
  setTargetJobs: (count: number) => void;
  start: (workers: number, customQueries?: string[], credentials?: Record<string, string>, targetJobs?: number) => Promise<void>;
  stop: () => Promise<void>;
  poll: () => Promise<void>;
  fetchResults: () => Promise<void>;
  fetchBots: () => Promise<void>;
  verifyBot: (botId: string, code: string) => Promise<boolean>;
};

let pollTimer: ReturnType<typeof setInterval> | null = null;

export const useSwarm = create<SwarmState>((set, get) => ({
  runId: null,
  running: false,
  workers: 1000,
  targetJobs: 1000,
  active: 0,
  status: "idle",
  counts: zeroCounts(),
  feed: [],
  elapsed: 0,
  discoveredCount: 0,
  readyCount: 0,
  blockedCount: 0,
  results: [],
  bots: [],
  selectedBotId: null,
  pools: {
    scrapers_count: 300,
    tailors_count: 300,
    appliers_count: 400,
    scrapers_active: 0,
    tailors_active: 0,
    appliers_active: 0,
  },
  alerts: [],

  setSelectedBotId: (id) => set({ selectedBotId: id }),
  setTargetJobs: (count) => set({ targetJobs: Math.max(1, Math.min(count, 50000)) }),

  start: async (workerCount: number, customQueries?: string[], credentials?: Record<string, string>, targetJobs?: number) => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }

    const finalTarget = Math.max(1, Math.min(targetJobs || get().targetJobs || workerCount, 50000));
    const { profile, appConfig } = useStore.getState();
    const defaultQueries = profile.headline
      ? [profile.headline]
      : ["AI Engineer", "Software Engineer", "Full Stack Developer"];
    const queries = customQueries && customQueries.length > 0 ? customQueries : defaultQueries;

    try {
      const snap = await api<SwarmSnapshot>("/swarm/start", {
        profile,
        queries,
        workers: workerCount,
        credentials: credentials || {},
        target_jobs: finalTarget,
        target_roles: profile.target_roles || ["all"],
        target_companies: profile.target_companies || ["all"],
        work_types: profile.work_types || ["fulltime", "remote"],
        app_config: appConfig,
      });

      set({
        runId: snap.id,
        running: true,
        status: snap.status,
        workers: snap.workers,
        targetJobs: snap.target_jobs || finalTarget,
        active: snap.active,
        counts: snap.counts,
        feed: snap.feed,
        elapsed: snap.elapsed,
        discoveredCount: snap.jobs,
        readyCount: snap.ready,
        blockedCount: snap.blocked,
        pools: snap.pools || get().pools,
        alerts: snap.alerts || [],
        bots: snap.sample_bots || [],
      });

      useStore.getState().setActiveSwarmId(snap.id);

      // Start live polling of the real backend worker swarm
      pollTimer = setInterval(() => {
        get().poll();
      }, 1000);
    } catch (err) {
      console.error("Failed to start swarm:", err);
      throw err;
    }
  },

  poll: async () => {
    const { runId } = get();
    if (!runId) return;

    try {
      const snap = await apiGet<SwarmSnapshot>(`/swarm/${runId}`);
      const isStillRunning = snap.status === "running";

      set({
        status: snap.status,
        running: isStillRunning,
        active: snap.active,
        counts: snap.counts,
        feed: snap.feed,
        elapsed: snap.elapsed,
        discoveredCount: snap.jobs,
        readyCount: snap.ready,
        blockedCount: snap.blocked,
        pools: snap.pools || get().pools,
        alerts: snap.alerts || [],
        bots: snap.sample_bots?.length ? snap.sample_bots : get().bots,
      });

      if (!isStillRunning && pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
        get().fetchResults();
        get().fetchBots();
        useStore.getState().fetchApps();
      }
    } catch (err) {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      set({ running: false, status: "stopped" });
    }
  },

  stop: async () => {
    const { runId } = get();
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (runId) {
      try {
        await api(`/swarm/${runId}/stop`, {});
      } catch {}
    }
    set({ running: false, status: "stopped" });
    get().fetchResults();
    get().fetchBots();
    useStore.getState().fetchApps();
  },

  fetchResults: async () => {
    const { runId } = get();
    if (!runId) return;
    try {
      const rows = await apiGet<SwarmResultItem[]>(`/swarm/${runId}/results`);
      set({ results: rows });
      useStore.getState().fetchApps();
    } catch (err) {
      console.error("Failed to fetch swarm results:", err);
    }
  },

  fetchBots: async () => {
    const { runId } = get();
    if (!runId) return;
    try {
      const res = await apiGet<{ bots: BotTelemetry[] }>(`/swarm/${runId}/bots`);
      if (res && res.bots) {
        set({ bots: res.bots });
      }
    } catch (err) {
      console.error("Failed to fetch bots:", err);
    }
  },

  verifyBot: async (botId: string, code: string) => {
    const { runId } = get();
    if (!runId) return false;
    try {
      const res = await api<{ ok: boolean }>(`/swarm/${runId}/bots/${botId}/verify`, { code });
      if (res.ok) {
        // Remove from alerts
        set((s) => ({
          alerts: s.alerts.filter((a) => a.id !== botId),
          bots: s.bots.map((b) => (b.id === botId ? { ...b, status: "browsing", verification_challenge: null } : b)),
        }));
        return true;
      }
    } catch (err) {
      console.error("Failed to verify bot:", err);
    }
    return false;
  },
}));
