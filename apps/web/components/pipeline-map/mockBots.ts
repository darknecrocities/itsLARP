import { type BotTelemetry } from "@/lib/swarm";

/**
 * Generates standby agent worker topology placeholders when no live telemetry is active.
 * Avoids fabricated companies or fake activity logs.
 */
export function generateSampleBots(running: boolean): BotTelemetry[] {
  const list: BotTelemetry[] = [];
  const platforms = ["LinkedIn", "Indeed", "Glassdoor", "ZipRecruiter", "Wellfound"];

  // Discovery Crawler Nodes
  for (let i = 1; i <= 20; i++) {
    const plat = platforms[(i - 1) % platforms.length];
    list.push({
      id: `agent_crawl_${String(i).padStart(3, "0")}`,
      pool: "discovery",
      platform: plat,
      status: running ? "browsing" : "idle",
      current_task: running ? `Scanning ${plat} feeds` : "Standby for swarm activation",
      cpu_pct: running ? 0.4 : 0.0,
      memory_mb: running ? 1.2 : 0.5,
      target_role: "Configured via Profile",
      target_company: plat,
      logs: running ? [{ t: new Date().toLocaleTimeString(), msg: `Browsing ${plat}` }] : [],
      verification_challenge: null,
    });
  }

  // Tailoring Nodes
  for (let i = 1; i <= 20; i++) {
    list.push({
      id: `agent_tailor_${String(i).padStart(3, "0")}`,
      pool: "tailor",
      platform: "Local LLM",
      status: running ? "tailoring" : "idle",
      current_task: running ? "Evaluating requirements" : "Standby for matching jobs",
      cpu_pct: running ? 0.6 : 0.0,
      memory_mb: running ? 1.5 : 0.5,
      target_role: "Dynamic Career DNA",
      target_company: "Local Inference",
      logs: running ? [{ t: new Date().toLocaleTimeString(), msg: "Model ready for alignment" }] : [],
      verification_challenge: null,
    });
  }

  // Application Staging Nodes
  for (let i = 1; i <= 25; i++) {
    const plat = platforms[(i - 1) % platforms.length];
    list.push({
      id: `agent_apply_${String(i).padStart(3, "0")}`,
      pool: "apply",
      platform: plat,
      status: running ? "applying" : "idle",
      current_task: running ? `Staging application on ${plat}` : "Standby for review approval",
      cpu_pct: running ? 0.3 : 0.0,
      memory_mb: running ? 1.0 : 0.5,
      target_role: "Dynamic Candidate Match",
      target_company: plat,
      logs: running ? [{ t: new Date().toLocaleTimeString(), msg: `Prepared staging worker for ${plat}` }] : [],
      verification_challenge: null,
    });
  }

  // Notion Sync Nodes
  for (let i = 1; i <= 10; i++) {
    list.push({
      id: `agent_notion_${String(i).padStart(3, "0")}`,
      pool: "notion",
      platform: "Notion API",
      status: running ? "applying" : "idle",
      current_task: running ? "Syncing to Notion" : "Standby for database sync",
      cpu_pct: running ? 0.2 : 0.0,
      memory_mb: running ? 0.8 : 0.5,
      target_role: "Database Synchronization",
      target_company: "Connected Workspace",
      logs: running ? [{ t: new Date().toLocaleTimeString(), msg: "Database connection verified" }] : [],
      verification_challenge: null,
    });
  }

  return list;
}
