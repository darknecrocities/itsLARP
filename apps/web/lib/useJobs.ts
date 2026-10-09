import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { useStore } from "./store";
import type { Job } from "./data";

export type SearchResponse = {
  jobs: Job[];
  errors: string[];
};

export function useJobs(query: string = "", remoteOnly: boolean = false) {
  const profile = useStore((s) => s.profile);

  return useQuery({
    queryKey: ["jobs", query, remoteOnly, profile.skills.length, profile.years],
    queryFn: async () => {
      const res = await api<SearchResponse>("/jobs/search", {
        query,
        remote: remoteOnly,
        profile: {
          name: profile.name,
          headline: profile.headline,
          skills: profile.skills,
          years: profile.years,
          education: profile.education,
          location: profile.location,
          projects: profile.projects,
        },
      });
      return res.jobs;
    },
    staleTime: 30000,
    retry: 1,
  });
}
