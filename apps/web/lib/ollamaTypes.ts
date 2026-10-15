export interface OllamaStatus {
  installed: boolean;
  running: boolean;
  version: string | null;
  binary_path: string | null;
  port: number;
  host: string;
  models: string[];
  models_count: number;
  os: string;
  hardware_tier: string;
}

export interface RecommendedModel {
  name: string;
  category: "performance" | "balanced" | "ability";
  tier: string;
  size: string;
  params: string;
  min_ram: string;
  rec_ram: string;
  speed_score: number;
  ability_score: number;
  best_for: string;
  is_default: boolean;
}

export const DEFAULT_RECOMMENDED: RecommendedModel[] = [
  {
    name: "qwen2.5:1.5b",
    category: "performance",
    tier: "Ultra-Fast / Low RAM",
    size: "0.9 GB",
    params: "1.5B",
    min_ram: "4 GB",
    rec_ram: "8 GB",
    speed_score: 9.8,
    ability_score: 7.5,
    best_for: "Ultra-fast matching, low-resource laptops, instant response",
    is_default: false,
  },
  {
    name: "llama3.2:3b",
    category: "performance",
    tier: "Ultra-Fast / Low RAM",
    size: "2.0 GB",
    params: "3.2B",
    min_ram: "6 GB",
    rec_ram: "8 GB",
    speed_score: 9.3,
    ability_score: 8.1,
    best_for: "Lightweight reasoning and general text summarization",
    is_default: false,
  },
  {
    name: "qwen2.5-coder:7b",
    category: "balanced",
    tier: "Balanced Sweet Spot (Recommended Default)",
    size: "4.7 GB",
    params: "7.6B",
    min_ram: "8 GB",
    rec_ram: "16 GB",
    speed_score: 8.9,
    ability_score: 9.4,
    best_for: "itsLARP primary engine: APA resume tailoring, skill matching, ATS optimization",
    is_default: true,
  },
  {
    name: "llama3.1:8b",
    category: "balanced",
    tier: "Balanced Sweet Spot",
    size: "4.9 GB",
    params: "8.0B",
    min_ram: "8 GB",
    rec_ram: "16 GB",
    speed_score: 8.5,
    ability_score: 9.1,
    best_for: "General career analysis, job role evaluation, and cover letter generation",
    is_default: false,
  },
  {
    name: "deepseek-r1:8b",
    category: "ability",
    tier: "Maximum Ability / Heavyweight",
    size: "4.9 GB",
    params: "8.0B",
    min_ram: "10 GB",
    rec_ram: "16 GB",
    speed_score: 7.8,
    ability_score: 9.5,
    best_for: "Chain-of-thought reasoning and complex interview question preparation",
    is_default: false,
  },
];
