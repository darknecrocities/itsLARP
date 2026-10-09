import { create } from "zustand";
import { api, apiGet } from "./api";
import { useStore, type Profile } from "./store";

export type Stage = "discovery" | "analysis" | "matching" | "resumes" | "applications";
export const STAGES: Stage[] = ["discovery", "analysis", "matching", "resumes", "applications"];

export type AgentLog = { t: string; id: string; msg: string };

export type SwarmSnapshot = {
  id: string;
  status: "running" | "completed" | "stopped";
  workers: number;
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
  start: (workers: number, customQueries?: string[]) => Promise<void>;
  stop: () => Promise<void>;
  poll: () => Promise<void>;
  fetchResults: () => Promise<void>;
};

let pollTimer: ReturnType<typeof setInterval> | null = null;

export const useSwarm = create<SwarmState>((set, get) => ({
  runId: null,
  running: false,
  workers: 0,
  active: 0,
  status: "idle",
  counts: zeroCounts(),
  feed: [],
  elapsed: 0,
  discoveredCount: 0,
  readyCount: 0,
  blockedCount: 0,
  results: [],

  start: async (workerCount: number, customQueries?: string[]) => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }

    const profile = useStore.getState().profile;
    const defaultQueries = profile.headline
      ? [profile.headline]
      : ["AI Engineer", "Software Engineer", "Backend Developer"];
    const queries = customQueries && customQueries.length > 0 ? customQueries : defaultQueries;

    try {
      const snap = await api<SwarmSnapshot>("/swarm/start", {
        profile,
        queries,
        workers: workerCount,
      });

      set({
        runId: snap.id,
        running: true,
        status: snap.status,
        workers: snap.workers,
        active: snap.active,
        counts: snap.counts,
        feed: snap.feed,
        elapsed: snap.elapsed,
        discoveredCount: snap.jobs,
        readyCount: snap.ready,
        blockedCount: snap.blocked,
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
      });

      if (!isStillRunning && pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
        get().fetchResults();
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
  },

  fetchResults: async () => {
    const { runId } = get();
    if (!runId) return;
    try {
      const rows = await apiGet<SwarmResultItem[]>(`/swarm/${runId}/results`);
      set({ results: rows });
    } catch (err) {
      console.error("Failed to fetch swarm results:", err);
    }
  },
}));
