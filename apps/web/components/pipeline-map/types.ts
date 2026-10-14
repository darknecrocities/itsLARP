import { type BotTelemetry } from "@/lib/swarm";

export interface HorizontalPipelineMapProps {
  running: boolean;
  activeCount: number;
  totalWorkers: number;
  pools?: {
    scrapers_count: number;
    tailors_count: number;
    appliers_count: number;
    scrapers_active: number;
    tailors_active: number;
    appliers_active: number;
  };
  sampleBots?: BotTelemetry[];
  onSelectBot?: (bot: BotTelemetry) => void;
  onVerifyBot?: (botId: string, code: string) => Promise<boolean>;
}

export interface GraphNode {
  id: number;
  x: number;
  y: number;
  labelY: number;
  label: string;
  title: string;
  role: string;
  badge: string;
  desc: string;
  stats: { label: string; val: string }[];
  poolKey: "all" | "discovery" | "tailor" | "apply" | "notion";
}

