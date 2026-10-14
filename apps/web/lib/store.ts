import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api, apiGet } from "./api";

export type Evidence = { source: string; text: string };

export type ExperienceItem = {
  company: string;
  title: string;
  start_date?: string;
  end_date?: string;
  text: string;
  metrics?: string;
};

export type ProjectItem = {
  name: string;
  tech: string[];
  text: string;
  url?: string;
};

export type Profile = {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  years: number;
  education: string;
  summary: string;
  target_roles: string[];
  target_companies: string[];
  work_types: string[];
  skills: string[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  links: { github?: string; linkedin?: string; portfolio?: string };
  evidence: Evidence[];
};

export const EMPTY: Profile = {
  name: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  years: 0,
  education: "",
  summary: "",
  target_roles: ["all"],
  target_companies: ["all"],
  work_types: ["fulltime", "remote"],
  skills: [],
  experience: [],
  projects: [],
  links: {},
  evidence: [],
};

export const DEFAULT_PROFILE: Profile = {
  name: "Jane Doe",
  headline: "Lead AI Systems & Full Stack Engineer",
  email: "jane.doe@example.com",
  phone: "+1 (555) 234-5678",
  location: "San Francisco, CA (Remote)",
  years: 5,
  education: "B.S. in Computer Science, Stanford University",
  summary: "Empirical technical practitioner with 5+ years contributing to scalable software systems and artificial intelligence.",
  target_roles: ["Lead AI Engineer", "Senior Full Stack Engineer"],
  target_companies: ["all"],
  work_types: ["fulltime", "remote"],
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

export type AgentQuestion = {
  id: string;
  run_id?: string;
  bot_id?: string;
  job_id?: string;
  company: string;
  role: string;
  question: string;
  context?: string;
  status: string;
  created_at?: string;
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
  questions: AgentQuestion[];
  setQuestions: (q: AgentQuestion[]) => void;
  fetchQuestions: () => Promise<void>;
  answerQuestion: (id: string, answer: string) => Promise<boolean>;
  dismissQuestion: (id: string) => Promise<boolean>;
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
      questions: [],
      setQuestions: (questions) => set({ questions }),
      fetchQuestions: async () => {
        try {
          const qs = await apiGet<AgentQuestion[]>("/notifications/questions");
          if (Array.isArray(qs)) {
            set({ questions: qs });
          }
        } catch {}
      },
      answerQuestion: async (id: string, answer: string) => {
        try {
          const res = await api<{ ok: boolean }>(`/notifications/questions/${id}/answer`, { answer });
          if (res.ok) {
            set((s) => ({
              questions: s.questions.filter((q) => q.id !== id),
            }));
            apiGet<{ profile: Profile }>("/profile")
              .then((pData) => {
                if (pData?.profile) set({ profile: { ...get().profile, ...pData.profile } });
              })
              .catch(() => {});
            return true;
          }
        } catch {}
        return false;
      },
      dismissQuestion: async (id: string) => {
        try {
          await api(`/notifications/questions/${id}/dismiss`, {});
          set((s) => ({ questions: s.questions.filter((q) => q.id !== id) }));
          return true;
        } catch {}
        return false;
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

