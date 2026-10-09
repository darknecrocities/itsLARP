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
};

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
      apps: [],
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
