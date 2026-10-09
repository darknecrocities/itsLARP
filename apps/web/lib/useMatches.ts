import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { candidateFor, jobFor } from "./profile";
import { useStore } from "./store";
import type { Job } from "./data";

export type Match = {
  score: number;
  label: string;
  breakdown: Record<string, number>;
  strong: string[];
  missing: string[];
};

export function useJobMatch(job: Job | null) {
  const p = useStore((s) => s.profile);
  return useQuery({
    queryKey: ["match", job?.id, p.skills.length, p.years],
    queryFn: async () => {
      if (!job) return null;
      return await api<Match>("/match", {
        candidate: candidateFor(p),
        job: jobFor(job),
      });
    },
    enabled: Boolean(job && p.skills.length > 0),
    retry: false,
  });
}
