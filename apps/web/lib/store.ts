import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api, apiGet } from "./api";

export type ExperienceItem = {
  company: string;
  title?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  dates?: string;
  text?: string;
  metrics?: string;
  bullets?: string[];
};

export type ProjectItem = {
  name: string;
  tech: string[];
  text: string;
  url?: string;
};

export type Evidence = {
  source: string;
  text: string;
};

export type Profile = {
  name: string;
  headline: string;
  email: string;
  phone?: string;
  location: string;
  years: number;
  education: string;
  summary?: string;
  target_roles?: string[];
  target_companies?: string[];
  work_types?: string[];
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

export type App = {
  id: string;
  jobId: string;
  company: string;
  role: string;
  match: number;
  status: string;
  platform?: string;
  url?: string;
  screenshotUrl?: string;
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

export type EmailResponse = {
  company: string;
  subject: string;
  snippet: string;
  classification: string;
  date: string;
};

export type EmailIntegrationState = {
  connected: boolean;
  provider: "gmail" | "outlook" | "custom";
  email: string;
  monitoringEnabled: boolean;
  lastCheckedAt?: string;
  responses: EmailResponse[];
};

export type JobPreferences = {
  selectedPlatforms: string[];
  remoteOnly: boolean;
  minSalary: number;
  matchThreshold: number;
  dailyPace: number;
  blacklistedCompanies: string[];
};

export type ResumeFormatKey =
  | "apa_7th"
  | "harvard_executive"
  | "silicon_valley_modern"
  | "ieee_engineering"
  | "ats_strict";

export type ApplicationConfig = {
  // Group A: Resume Design & Tailoring (1-7)
  resumeFormat: ResumeFormatKey;
  bulletRewriteAggressiveness: "conservative" | "balanced" | "aggressive";
  skillGroupingMode: "categorized" | "flat" | "relevance_first";
  projectHighlightCount: number;
  quantifiableMetricsEmphasis: boolean;
  keywordMirroringLevel: "exact" | "semantic" | "minimal";
  pageDensity: "compact" | "comfortable";
  // Group B: Cover Letter & Screening Defaults (8-14)
  coverLetterTone: "formal" | "direct_technical" | "executive" | "none";
  coverLetterMaxWords: number;
  compensationStrategy: "market_aligned" | "explicit_floor" | "negotiable";
  minimumBaseSalary: number;
  workAuthorization:
    | "authorized_no_sponsor"
    | "requires_sponsorship"
    | "citizen_permanent"
    | "global_contractor";
  noticePeriod: "immediate" | "2_weeks" | "30_days" | "flexible";
  relocationWillingness: "no_remote_only" | "open_with_assistance" | "open_self_funded";
  // Group C: Job Filtering & Guardrails (15-18)
  minMatchThreshold: number;
  remoteWorkplacePreference: "remote_only" | "remote_preferred" | "hybrid_ok" | "onsite_ok";
  companyBlacklist: string;
  maxDailyApplications: number;
  // Group D: Autonomous Agent Behavior (19-20)
  autoApproveThreshold: number;
  humanInTheLoopPause: boolean;
};

export const DEFAULT_APP_CONFIG: ApplicationConfig = {
  resumeFormat: "apa_7th",
  bulletRewriteAggressiveness: "balanced",
  skillGroupingMode: "relevance_first",
  projectHighlightCount: 3,
  quantifiableMetricsEmphasis: true,
  keywordMirroringLevel: "semantic",
  pageDensity: "comfortable",
  coverLetterTone: "direct_technical",
  coverLetterMaxWords: 200,
  compensationStrategy: "market_aligned",
  minimumBaseSalary: 120000,
  workAuthorization: "authorized_no_sponsor",
  noticePeriod: "2_weeks",
  relocationWillingness: "no_remote_only",
  minMatchThreshold: 60,
  remoteWorkplacePreference: "remote_preferred",
  companyBlacklist: "",
  maxDailyApplications: 100,
  autoApproveThreshold: 70,
  humanInTheLoopPause: false,
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
    workspace?: string;
    connected: boolean;
    lastSyncedAt?: string;
    syncedCount?: number;
  };
  setNotion: (n: Partial<S["notion"]>) => void;
  fetchNotionStatus: () => Promise<void>;
  clearApps: () => Promise<void>;
  clearProfile: () => Promise<void>;
  emailIntegration: EmailIntegrationState;
  setEmailIntegration: (e: Partial<EmailIntegrationState>) => void;
  fetchEmailStatus: () => Promise<void>;
  jobPreferences: JobPreferences;
  setJobPreferences: (p: Partial<JobPreferences>) => void;
  appConfig: ApplicationConfig;
  setAppConfig: (c: Partial<ApplicationConfig>) => void;
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
          const res = await apiGet<{ profile: Profile | null }>("/profile");
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
          const res = await apiGet<App[]>("/applications");
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
          const res = await apiGet<{
            connected: boolean;
            database_id: string;
            database_name: string;
            database_url: string;
            workspace?: string;
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
                workspace: res.workspace,
                lastSyncedAt: res.last_synced_at,
                syncedCount: res.synced_count,
              },
            }));
          }
        } catch {}
      },
      clearApps: async () => {
        try {
          await api("/applications/clear", {});
        } catch {}
        set({ apps: [] });
      },
      clearProfile: async () => {
        set({ profile: EMPTY });
        api("/profile/save", { profile: EMPTY }).catch(() => {});
      },
      emailIntegration: {
        connected: false,
        provider: "gmail",
        email: "",
        monitoringEnabled: true,
        responses: [],
      },
      setEmailIntegration: (e) =>
        set((s) => ({ emailIntegration: { ...s.emailIntegration, ...e } })),
      fetchEmailStatus: async () => {
        try {
          const res = await apiGet<any>("/integrations/email/status");
          if (res) {
            set((s) => ({
              emailIntegration: {
                ...s.emailIntegration,
                connected: Boolean(res.connected),
                provider: res.provider || "gmail",
                email: res.email || "",
                monitoringEnabled: res.monitoring_enabled ?? true,
                lastCheckedAt: res.last_checked_at,
                responses: res.responses || [],
              },
            }));
          }
        } catch {}
      },
      jobPreferences: {
        selectedPlatforms: ["linkedin", "indeed", "glassdoor", "ziprecruiter", "wellfound"],
        remoteOnly: false,
        minSalary: 100000,
        matchThreshold: 75,
        dailyPace: 25,
        blacklistedCompanies: [],
      },
      setJobPreferences: (p) =>
        set((s) => ({ jobPreferences: { ...s.jobPreferences, ...p } })),
      appConfig: DEFAULT_APP_CONFIG,
      setAppConfig: (c) =>
        set((s) => ({ appConfig: { ...s.appConfig, ...c } })),
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
          emailIntegration: s.emailIntegration,
          jobPreferences: s.jobPreferences,
          appConfig: s.appConfig,
        }) as unknown as S,
    }
  )
);

