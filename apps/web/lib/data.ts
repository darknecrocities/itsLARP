export type Job = {
  id: string;
  company: string;
  title: string;
  location: string;
  remote: boolean;
  salary: string;
  source: string;
  url?: string;
  domain: string;
  skills: string[];
  years: number;
  description: string;
  match?: {
    score: number;
    label: string;
    breakdown: Record<string, number>;
    strong: string[];
    missing: string[];
  };
};

export const FIELDS = [
  "Full name",
  "Email",
  "Location",
  "Years of experience",
  "Current title",
  "GitHub",
  "LinkedIn",
  "Portfolio",
  "Why do you want this role?"
];
