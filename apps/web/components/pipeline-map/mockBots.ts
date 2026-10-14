import { type BotTelemetry } from "@/lib/swarm";

export function generateSampleBots(running: boolean): BotTelemetry[] {
  const list: BotTelemetry[] = [];
  const platforms = ["LinkedIn", "JobStreet", "Indeed", "Glassdoor", "Wellfound", "RemoteOK"];

  // 300 Crawlers (sample subset of 30)
  for (let i = 1; i <= 30; i++) {
    const bid = `agent_scrape_${String(i).padStart(3, "0")}`;
    const plat = platforms[(i - 1) % platforms.length];
    list.push({
      id: bid,
      pool: "discovery",
      platform: plat,
      status: running ? (i % 5 === 0 ? "needs_verification" : i % 2 === 0 ? "browsing" : "completed") : "idle",
      current_task: running ? `Searching ${plat} for matching jobs you like` : "Ready on standby",
      cpu_pct: +(0.2 + (i % 6) * 0.1).toFixed(2),
      memory_mb: +(1.1 + (i % 5) * 0.2).toFixed(2),
      target_role: "Software Engineer",
      target_company: plat === "LinkedIn" ? "Tech Innovations" : "Global Systems",
      logs: [
        { t: "12:00:01", msg: `Started searching on ${plat}` },
        { t: "12:00:04", msg: `Found matching jobs matching your preferences` },
      ],
      verification_challenge:
        i % 5 === 0 && running
          ? { platform: plat, prompt: `Enter 2FA Code or Confirm login for ${plat}`, created_at: 1710000000000 }
          : null,
    });
  }

  // 300 Tailors (sample subset of 30)
  for (let i = 1; i <= 30; i++) {
    const bid = `agent_tailor_${String(i).padStart(3, "0")}`;
    list.push({
      id: bid,
      pool: "tailor",
      platform: "Local AI",
      status: running ? (i % 2 === 0 ? "tailoring" : "completed") : "idle",
      current_task: running ? "Creating custom APA resume for this job" : "Ready on standby",
      cpu_pct: +(0.5 + (i % 4) * 0.1).toFixed(2),
      memory_mb: +(1.4 + (i % 4) * 0.2).toFixed(2),
      target_company: "Apex Tech Corp",
      target_role: "Full Stack Developer",
      logs: [
        { t: "12:00:02", msg: "Read job requirements and checked skill match" },
        { t: "12:00:05", msg: "Generated customized APA-format resume" },
      ],
    });
  }

  // 400 Appliers (sample subset of 40)
  for (let i = 1; i <= 40; i++) {
    const bid = `agent_apply_${String(i).padStart(3, "0")}`;
    const plat = platforms[(i - 1) % platforms.length];
    list.push({
      id: bid,
      pool: "apply",
      platform: plat,
      status: running ? (i % 3 === 0 ? "applying" : "completed") : "idle",
      current_task: running ? `Filling application questions on ${plat}` : "Ready on standby",
      cpu_pct: +(0.3 + (i % 5) * 0.1).toFixed(2),
      memory_mb: +(1.2 + (i % 6) * 0.15).toFixed(2),
      target_company: "DeepSignal AI",
      target_role: "Software Developer",
      logs: [
        { t: "12:00:03", msg: `Filled application questions from your profile` },
        { t: "12:00:06", msg: `Application prepared and ready for your review` },
      ],
    });
  }

  // Notion Sync Bots (sample subset of 15)
  for (let i = 1; i <= 15; i++) {
    const bid = `agent_notion_${String(i).padStart(3, "0")}`;
    list.push({
      id: bid,
      pool: "notion",
      platform: "Notion API",
      status: running ? (i % 2 === 0 ? "applying" : "completed") : "idle",
      current_task: running ? "Syncing approved application to your Notion database" : "Standby for incoming applications",
      cpu_pct: +(0.15 + (i % 3) * 0.08).toFixed(2),
      memory_mb: +(1.0 + (i % 4) * 0.1).toFixed(2),
      target_company: "Notion Application Tracker",
      target_role: "Database Synchronization",
      logs: [
        { t: "12:00:04", msg: "Verified Notion database schema and column mappings" },
        { t: "12:00:07", msg: "Synchronized application record with two-way status hook" },
      ],
    });
  }

  return list;
}

