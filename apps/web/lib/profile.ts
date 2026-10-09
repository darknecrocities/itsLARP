import type { Profile, Evidence } from "./store";
import type { Job } from "./data";

const KNOWN = ["python","typescript","javascript","react","node","fastapi","django","flask","pytorch","tensorflow","sql","postgresql","redis","docker","kubernetes","aws","gcp","llm","rag","airflow","go","rust","java","next.js","tailwind","graphql","git"];

export function parseResume(text: string): Partial<Profile> {
  const lower = text.toLowerCase();
  const skills = KNOWN.filter((k) => new RegExp(`(^|[^a-z0-9])${k.replace(/[.+]/g, "\\$&")}([^a-z0-9]|$)`).test(lower));
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] ?? "";
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const name = lines[0] && lines[0].length < 50 && !lines[0].includes("@") ? lines[0] : "";
  const yrs = [...text.matchAll(/(\d{1,2})\+?\s*(?:years|yrs)/gi)].map((m) => +m[1]);
  const links = {
    github: text.match(/github\.com\/[\w-]+/i)?.[0], linkedin: text.match(/linkedin\.com\/in\/[\w-]+/i)?.[0],
  };
  return { name, email, skills, years: yrs.length ? Math.max(...yrs) : 0, links };
}

export function evidenceFromText(source: string, text: string): Evidence[] {
  return text.split(/\n+/).map((t) => t.trim()).filter((t) => t.split(" ").length >= 3).map((t) => ({ source, text: t }));
}

export async function importGithub(user: string) {
  const r = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=30&sort=updated`);
  if (!r.ok) throw new Error(r.status === 404 ? "GitHub user not found." : "GitHub is unavailable or rate-limited. Try again later.");
  const repos: { name: string; description: string | null; language: string | null; topics?: string[] }[] = await r.json();
  const skills = [...new Set(repos.map((x) => x.language?.toLowerCase()).filter(Boolean) as string[])];
  const projects = repos.filter((x) => !x.name.startsWith(".")).slice(0, 8).map((x) => ({
    name: x.name, tech: [x.language?.toLowerCase(), ...(x.topics ?? [])].filter(Boolean) as string[], text: x.description ?? "",
  }));
  const evidence = repos.map((x) => ({ source: `GitHub: ${x.name}`, text: `${x.name} ${x.description ?? ""} built with ${x.language ?? ""}` }));
  return { skills, projects, evidence };
}

export const candidateFor = (p: Profile) => ({
  skills: p.skills, years_experience: p.years, projects: p.projects.map((x) => ({ tech: x.tech })),
  education_level: p.education ? 2 : 1, domains: ["ai", "web", "data"], location: p.location,
});
export const jobFor = (j: Job) => ({ skills: j.skills, years_required: j.years, education_level: 1, domain: j.domain, remote: j.remote, location: j.location });

export type Change = { section: string; original: string; proposed: string; why: string; evidence: string; status: "pending" | "accepted" | "rejected" };

/** Deterministic tailoring: only reorders/emphasizes facts that already exist in Career DNA. */
export function tailor(p: Profile, j: Job): { changes: Change[]; summary: string } {
  const need = new Set(j.skills);
  const matched = p.skills.filter((s) => need.has(s.toLowerCase()));
  const rest = p.skills.filter((s) => !need.has(s.toLowerCase()));
  const changes: Change[] = [];
  if (matched.length) changes.push({
    section: "Skills", original: p.skills.join(", "), proposed: [...matched, ...rest].join(", "),
    why: `Moved skills required by this ${j.title} role to the front.`, evidence: "Career DNA skills list", status: "pending",
  });
  p.projects.filter((x) => x.tech.some((t) => need.has(t.toLowerCase()))).slice(0, 3).forEach((x) => changes.push({
    section: "Projects", original: x.name, proposed: `${x.name} (${x.tech.filter((t) => need.has(t.toLowerCase())).join(", ")})${x.text ? ": " + x.text : ""}`,
    why: "Project uses technologies listed in the job requirements.", evidence: `Project: ${x.name}`, status: "pending",
  }));
  const summary = `${p.headline || "Engineer"} with ${p.years || "relevant"} years of experience in ${matched.slice(0, 4).join(", ") || p.skills.slice(0, 4).join(", ")}.`;
  changes.unshift({ section: "Summary", original: p.headline, proposed: summary, why: "Summary built only from your recorded skills and years.", evidence: "Career DNA identity", status: "pending" });
  return { changes, summary };
}

export const coverLetter = (p: Profile, j: Job, matched: string[]) =>
  `Dear ${j.company} team,\n\nI am applying for the ${j.title} role. My background includes ${matched.join(", ") || p.skills.slice(0, 3).join(", ")}, which maps to what you list for this position. ${p.projects[0] ? `Relevant work: ${p.projects[0].name}.` : ""}\n\nThank you for your consideration.\n${p.name}`;

export function answerFields(p: Profile, j: Job): Record<string, string> {
  return {
    "Full name": p.name, "Email": p.email, "Location": p.location, "Years of experience": String(p.years),
    "Current title": p.experience[0]?.title ?? p.headline, "GitHub": p.links.github ?? "", "LinkedIn": p.links.linkedin ?? "",
    "Portfolio": p.links.portfolio ?? "", "Why do you want this role?": `The ${j.title} role at ${j.company} aligns with my experience in ${p.skills.filter((s) => j.skills.includes(s.toLowerCase())).join(", ") || "my field"}.`,
  };
}
