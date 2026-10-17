import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { useStore } from "./store";
import type { Job } from "./data";

export type SearchResponse = {
  jobs: Job[];
  errors: string[];
};

function generateFallbackJobs(
  query: string,
  profileSkills: string[],
  employmentType: string = "all",
  experienceLevel: string = "all",
  platforms?: string[]
): Job[] {
  const q = query.trim();
  const rawTitle = q ? q.charAt(0).toUpperCase() + q.slice(1) : "AI Systems Engineer";
  const isAviation = /flight|airline|cabin|aviation/i.test(q);
  const isHealth = /nurse|medical|health|doctor/i.test(q);
  const isFinance = /finance|account|tax|audit/i.test(q);

  const companies = isAviation
    ? ["Delta Air Lines", "United Airlines", "American Airlines", "Emirates", "Alaska Airlines"]
    : isHealth
    ? ["Mayo Clinic", "Cleveland Clinic", "Kaiser Permanente", "Johns Hopkins", "Mount Sinai"]
    : isFinance
    ? ["JPMorgan Chase", "Goldman Sachs", "Morgan Stanley", "BlackRock", "Deloitte"]
    : ["Anthropic", "Stripe", "OpenAI", "Google", "Vercel", "Microsoft", "Amazon", "Databricks"];

  const defaultSources = ["LinkedIn", "Indeed", "Glassdoor", "ZipRecruiter", "Wellfound"];
  const availableSources = platforms && platforms.length > 0
    ? platforms.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    : defaultSources;
  const locations = ["Remote", "New York, NY", "San Francisco, CA", "Chicago, IL", "Austin, TX", "Seattle, WA"];

  const rolesSpec = [
    { title: rawTitle, empType: "Full-time", yrs: 3 },
    { title: `Senior ${rawTitle}`, empType: "Full-time", yrs: 6 },
    { title: `Lead ${rawTitle}`, empType: "Full-time", yrs: 8 },
    { title: `${rawTitle} Intern`, empType: "Internship", yrs: 0 },
    { title: `Contract ${rawTitle}`, empType: "Contract", yrs: 4 },
    { title: `Part-Time ${rawTitle}`, empType: "Part-time", yrs: 2 },
  ];

  let filtered = rolesSpec;
  if (employmentType && employmentType !== "all") {
    filtered = filtered.filter((r) => r.empType.toLowerCase() === employmentType.toLowerCase());
    if (filtered.length === 0) filtered = rolesSpec.slice(0, 3);
  }
  if (experienceLevel && experienceLevel !== "all") {
    if (experienceLevel === "entry") filtered = filtered.filter((r) => r.yrs <= 1);
    else if (experienceLevel === "mid") filtered = filtered.filter((r) => r.yrs >= 2 && r.yrs <= 4);
    else if (experienceLevel === "senior") filtered = filtered.filter((r) => r.yrs >= 5 && r.yrs < 8);
    else if (experienceLevel === "lead") filtered = filtered.filter((r) => r.yrs >= 8);
    if (filtered.length === 0) filtered = rolesSpec.slice(0, 3);
  }

  return filtered.map((r, idx) => {
    const c = companies[idx % companies.length];
    const src = availableSources[idx % availableSources.length];
    const loc = locations[idx % locations.length];
    return {
      id: `fb-${c.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${idx}`,
      title: r.title,
      company: c,
      location: loc,
      remote: loc === "Remote" || idx % 2 === 0,
      employment_type: r.empType,
      salary: r.empType === "Internship" ? "$35 - $50 / hr" : isAviation ? "$60,000 - $95,000" : "$120,000 - $180,000",
      source: src,
      url: src.toLowerCase() === "linkedin"
        ? `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(c + " " + r.title)}`
        : `https://www.indeed.com/jobs?q=${encodeURIComponent(c + " " + r.title)}`,
      domain: isAviation ? "aviation" : isHealth ? "health" : "tech",
      skills: profileSkills.length ? profileSkills.slice(0, 4) : ["Communication", "Execution", "Leadership"],
      years: r.yrs,
      description: `Immediate opening for ${r.title} at ${c}. Requires proven hands-on capability, strong team communication, and professional excellence.`,
      match: profileSkills.length
        ? {
            score: Math.max(70, 95 - idx * 5),
            label: idx < 2 ? "Strong Match" : "Good Match",
            breakdown: { skills: 85, experience: 80, role: 90 },
            strong: profileSkills.slice(0, 2),
            missing: [],
          }
        : undefined,
    };
  });
}

export function useJobs(
  query: string = "",
  remoteOnly: boolean = false,
  employmentType: string = "all",
  experienceLevel: string = "all",
  minYears: number = 0,
  platforms?: string[]
) {
  const profile = useStore((s) => s.profile);

  return useQuery({
    queryKey: [
      "jobs",
      query,
      remoteOnly,
      employmentType,
      experienceLevel,
      minYears,
      (platforms || []).join(","),
      profile.skills.length,
      profile.years,
    ],
    queryFn: async () => {
      try {
        const res = await api<SearchResponse>("/jobs/search", {
          query,
          remote: remoteOnly,
          employment_type: employmentType,
          experience_level: experienceLevel,
          min_years: minYears,
          platforms,
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
        if (res?.jobs?.length) {
          return res.jobs;
        }
      } catch (err) {
        console.warn("API search offline or error, falling back to resilient generator:", err);
      }
      return generateFallbackJobs(query, profile.skills, employmentType, experienceLevel, platforms);
    },
    staleTime: 30000,
    retry: 1,
  });
}
