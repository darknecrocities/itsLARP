import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api } from "./api";

export type Evidence = { source: string; text: string };
export type Profile = {
  name: string;
  headline: string;
  email: string;
  location: string;
  years: number;
  skills: string[];
  experience: { company: string; title: string; text: string; period?: string }[];
  projects: { name: string; tech: string[]; text: string }[];
  education: string;
  links: { github?: string; linkedin?: string; portfolio?: string };
  evidence: Evidence[];
  target_roles?: string[];
};

export const EMPTY: Profile = {
  name: "",
  headline: "",
  email: "",
  location: "",
  years: 0,
  skills: [],
  experience: [],
  projects: [],
  education: "",
  links: {},
  evidence: [],
  target_roles: [],
};

export const DEFAULT_PROFILE: Profile = {
  name: "Jane Doe",
  headline: "Lead AI Systems & Full Stack Engineer",
  email: "jane.doe@example.com",
  location: "San Francisco, CA (Remote)",
  years: 5,
  skills: [
    "Python",
    "FastAPI",
    "React",
    "TypeScript",
    "Docker",
    "PostgreSQL",
    "PyTorch",
    "Tailwind CSS",
  ],
  education: "B.S. in Computer Science, Stanford University",
  experience: [
    {
      company: "Anthropic Labs",
      title: "Senior AI Systems Engineer",
      text: "Architected distributed agent runtime executing 100,000+ autonomous parallel tasks with verifiable zero-hallucination gates.",
    },
    {
      company: "FinTech Scale",
      title: "Full Stack Engineer",
      text: "Engineered real-time reactive event pipelines in TypeScript, Next.js, and Postgres.",
    },
  ],
  projects: [
    {
      name: "Autonomous Task Engine",
      tech: ["Python", "FastAPI", "React", "Docker"],
      text: "High-throughput parallel workforce crawler and application staging pipeline executing 1,000 concurrent bots.",
    },
    {
      name: "Career DNA Synthesizer",
      tech: ["Python", "PostgreSQL", "PyTorch"],
      text: "Structured citation and evidence extraction compiler adhering to APA 7th publication standards.",
    },
  ],
  links: {
    github: "github.com/janedoe",
    linkedin: "linkedin.com/in/janedoe",
  },
  evidence: [
    {
      source: "GitHub: Autonomous Task Engine",
      text: "Implemented 1,000 parallel worker swarm with async task queues and 2FA challenge handling.",
    },
    {
      source: "Verified APA Repository",
      text: "0% hallucination verification gate preventing exaggeration or fabrication of skills.",
    },
  ],
  target_roles: ["Lead AI Engineer", "Senior Full Stack Engineer"],
};

export type App = {
  id: string;
  jobId: string;
  company: string;
  role: string;
  match: number;
  status: string;
  platform?: string;
  url?: string;
  notionPageId?: string;
  notionDatabaseId?: string;
  appliedDate?: string;
  resume?: string;
  cover?: string;
  answers?: Record<string, string>;
  verified?: boolean;
  events: { at: string; text: string }[];
  canReapply?: boolean;
  isOngoing?: boolean;
};

type S = {
  profile: Profile;
  setProfile: (p: Partial<Profile>) => void;
  addEvidence: (e: Evidence[]) => void;
  fetchProfile: () => Promise<void>;
  apps: App[];
  setApps: (apps: App[]) => void;
  upsertApp: (a: App) => void;
  fetchApps: () => Promise<void>;
  activeSwarmId: string | null;
  setActiveSwarmId: (id: string | null) => void;
  notion: {
    token: string;
    databaseId: string;
    databaseName?: string;
    databaseUrl?: string;
    connected: boolean;
    lastSyncedAt?: string;
    syncedCount?: number;
  };
  setNotion: (n: Partial<S["notion"]>) => void;
  fetchNotionStatus: () => Promise<void>;
};

export const useStore = create<S>()(
  persist(
    (set, get) => ({
      profile: EMPTY,
      setProfile: (p) => {
        const next = { ...get().profile, ...p };
        set({ profile: next });
        api("/profile/save", { profile: next }).catch(() => {});
      },
      addEvidence: (e) => {
        const next = { ...get().profile, evidence: [...get().profile.evidence, ...e] };
        set({ profile: next });
        api("/profile/save", { profile: next }).catch(() => {});
      },
      fetchProfile: async () => {
        try {
          const res = await api<{ profile: Profile | null }>("/profile");
          if (res?.profile && (res.profile.name || res.profile.skills?.length)) {
            set({ profile: { ...get().profile, ...res.profile } });
          }
        } catch {}
      },
      apps: [],
      setApps: (apps) => set({ apps }),
      upsertApp: (a) => {
        const existing = get().apps.filter((x) => x.id !== a.id);
        set({ apps: [a, ...existing] });
      },
      fetchApps: async () => {
        try {
          const res = await api<App[]>("/applications");
          if (Array.isArray(res)) {
            set({ apps: res });
          }
        } catch {}
      },
      activeSwarmId: null,
      setActiveSwarmId: (id) => set({ activeSwarmId: id }),
      notion: { token: "", databaseId: "", connected: false },
      setNotion: (n) => set((s) => ({ notion: { ...s.notion, ...n } })),
      fetchNotionStatus: async () => {
        try {
          const res = await api<{
            connected: boolean;
            database_id: string;
            database_name: string;
            database_url: string;
            last_synced_at?: string;
            synced_count?: number;
          }>("/integrations/notion/status");
          if (res) {
            set((s) => ({
              notion: {
                ...s.notion,
                connected: res.connected,
                databaseId: res.database_id,
                databaseName: res.database_name,
                databaseUrl: res.database_url,
                lastSyncedAt: res.last_synced_at,
                syncedCount: res.synced_count,
              },
            }));
          }
        } catch {}
      },
    }),
    {
      name: "howtolarped_state",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) =>
        ({
          profile: s.profile,
          apps: s.apps,
          activeSwarmId: s.activeSwarmId,
          notion: { ...s.notion, token: "" },
        }) as unknown as S,
    }
  )
);

