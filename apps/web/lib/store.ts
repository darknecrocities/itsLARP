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
  experience: { company: string; title: string; text: string }[];
  projects: { name: string; tech: string[]; text: string }[];
  education: string;
  links: { github?: string; linkedin?: string; portfolio?: string };
  evidence: Evidence[];
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
};

export const EMPTY: Profile = DEFAULT_PROFILE;

export type App = {
  id: string;
  jobId: string;
  company: string;
  role: string;
  match: number;
  status: string;
  resume?: string;
  cover?: string;
  answers?: Record<string, string>;
  verified?: boolean;
  events: { at: string; text: string }[];
};

type S = {
  profile: Profile;
  setProfile: (p: Partial<Profile>) => void;
  addEvidence: (e: Evidence[]) => void;
  apps: App[];
  setApps: (apps: App[]) => void;
  upsertApp: (a: App) => void;
  activeSwarmId: string | null;
  setActiveSwarmId: (id: string | null) => void;
  notion: { token: string; databaseId: string; connected: boolean };
  setNotion: (n: Partial<S["notion"]>) => void;
};

export const DEFAULT_APPS: App[] = [
  {
    id: "app_demo_001",
    jobId: "job_anthropic_01",
    company: "Anthropic Labs",
    role: "Lead AI Engineer",
    match: 94,
    status: "APPLIED",
    verified: true,
    events: [
      { at: new Date().toISOString(), text: "Applied via 400 Independent Application Bots (staged review approved)" },
      { at: new Date(Date.now() - 3600000).toISOString(), text: "APA 7th resume tailored with 0% hallucinations" },
    ],
  },
  {
    id: "app_demo_002",
    jobId: "job_fintech_02",
    company: "FinTech Systems",
    role: "Senior Full Stack Lead",
    match: 88,
    status: "READY",
    verified: true,
    events: [
      { at: new Date().toISOString(), text: "Application questions autofilled by Agent #214 · Ready to Submit" },
    ],
  },
  {
    id: "app_demo_003",
    jobId: "job_cloudscale_03",
    company: "CloudScale AI",
    role: "Staff Backend Engineer",
    match: 91,
    status: "INTERVIEW",
    verified: true,
    events: [
      { at: new Date().toISOString(), text: "Interview invitation synced to Notion tracker" },
    ],
  },
  {
    id: "app_demo_004",
    jobId: "job_tomo_04",
    company: "TomoCredit",
    role: "Senior Distributed Systems Engineer",
    match: 95,
    status: "APPLIED",
    verified: true,
    events: [
      { at: new Date().toISOString(), text: "Applied via LinkedIn bot pool with 2FA verification pass" },
    ],
  },
];

export const useStore = create<S>()(
  persist(
    (set, get) => ({
      profile: EMPTY,
      setProfile: (p) => {
        const next = { ...get().profile, ...p };
        set({ profile: next });
        // Background sync to backend database
        api("/profile/save", { profile: next }).catch(() => {});
      },
      addEvidence: (e) => {
        const next = { ...get().profile, evidence: [...get().profile.evidence, ...e] };
        set({ profile: next });
        api("/profile/save", { profile: next }).catch(() => {});
      },
      apps: DEFAULT_APPS,
      setApps: (apps) => set({ apps }),
      upsertApp: (a) => {
        const existing = get().apps.filter((x) => x.id !== a.id);
        set({ apps: [a, ...existing] });
      },
      activeSwarmId: null,
      setActiveSwarmId: (id) => set({ activeSwarmId: id }),
      notion: { token: "", databaseId: "", connected: false },
      setNotion: (n) => set((s) => ({ notion: { ...s.notion, ...n } })),
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
