import { type BotTelemetry } from "@/lib/swarm";

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
  poolKey: "all" | "discovery" | "tailor" | "apply";
}

export const GRAPH_NODES: GraphNode[] = [
  {
    id: 1,
    x: 570,
    y: 180,
    labelY: 232,
    label: "1: YOUR PROFILE",
    title: "Your Real Profile",
    role: "100% Honest Experience",
    badge: "Never Lies",
    desc: "You upload your resume and connect your profiles once. The Agents strictly use your real experience and verified projects—they never make things up or invent fake skills.",
    stats: [
      { label: "Your Info", val: "Resume & Profiles" },
      { label: "Honesty", val: "Only Real Skills" },
      { label: "Format", val: "Clean APA Style" },
      { label: "Setup", val: "One-Time Upload" },
    ],
    poolKey: "all",
  },
  {
    id: 2,
    x: 450,
    y: 280,
    labelY: 332,
    label: "2: JOB FINDERS",
    title: "300 Job Finders",
    role: "Searching 24/7",
    badge: "300 Agents",
    desc: "300 Agents constantly search LinkedIn, JobStreet, and Indeed around the clock to find job openings that match the roles, locations, and salaries you want.",
    stats: [
      { label: "Platforms", val: "LinkedIn, JobStreet, Indeed" },
      { label: "Agents Working", val: "300 Active Agents" },
      { label: "Account Safety", val: "Safe & Secure" },
      { label: "Speed", val: "Finds Jobs Instantly" },
    ],
    poolKey: "discovery",
  },
  {
    id: 3,
    x: 250,
    y: 300,
    labelY: 352,
    label: "3: SMART MATCHER",
    title: "Smart Job Matcher",
    role: "Understands Requirements",
    badge: "100% Private",
    desc: "Our AI reads each job description, figures out what the company is really looking for, and checks how well your background fits—keeping your data safe and private.",
    stats: [
      { label: "Privacy", val: "Stays on Your Device" },
      { label: "Job Reading", val: "Understands Requirements" },
      { label: "Match Score", val: "Ranked by Compatibility" },
      { label: "Best Matches", val: "Highlights Your Strengths" },
    ],
    poolKey: "tailor",
  },
  {
    id: 4,
    x: 210,
    y: 150,
    labelY: 202,
    label: "4: RESUME MAKER",
    title: "300 Resume Makers",
    role: "Custom Resumes for Every Job",
    badge: "300 Agents",
    desc: "Instead of sending the same generic resume, 300 Agents build a tailored APA-format resume highlighting your relevant projects for each specific role.",
    stats: [
      { label: "Resume Style", val: "Clean APA Format" },
      { label: "Customization", val: "Tailored Per Job" },
      { label: "Honesty", val: "Zero Fake Skills" },
      { label: "Download", val: "PDF & Text Ready" },
    ],
    poolKey: "tailor",
  },
  {
    id: 5,
    x: 410,
    y: 120,
    labelY: 75,
    label: "5: AUTO-APPLIER",
    title: "400 Auto-Appliers",
    role: "Fills & Prepares Applications",
    badge: "400 Agents",
    desc: "400 Agents do the boring work: filling out repetitive application questions and forms. Everything is staged for your quick review so you stay in total control.",
    stats: [
      { label: "Applying Team", val: "400 Active Agents" },
      { label: "Repetitive Forms", val: "Filled Automatically" },
      { label: "Your Control", val: "Review Before Sending" },
      { label: "Time Saved", val: "Hours Every Day" },
    ],
    poolKey: "apply",
  },
  {
    id: 6,
    x: 80,
    y: 70,
    labelY: 28,
    label: "6: NOTION TRACKER",
    title: "Notion Job Tracker",
    role: "Auto-Organized List",
    badge: "1-Click Setup",
    desc: "In one click, creates a clean Notion spreadsheet tracking every applied job: company name, title, date applied, match score, and current status.",
    stats: [
      { label: "Database", val: "Auto-Created in Notion" },
      { label: "Tracked Details", val: "Company, Role, Status" },
      { label: "Spreadsheets", val: "No Manual Copying" },
      { label: "Live Updates", val: "Always Up to Date" },
    ],
    poolKey: "all",
  },
];

export const GRAPH_EDGES: [number, number][] = [
  [6, 4],
  [4, 3],
  [4, 5],
  [3, 2],
  [5, 2],
  [5, 1],
  [2, 1],
];

export function generateSampleBots(running: boolean): BotTelemetry[] {
  const list: BotTelemetry[] = [];
  const platforms = ["LinkedIn", "JobStreet", "Indeed", "Glassdoor", "Wellfound", "RemoteOK"];

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
          ? { platform: plat, prompt: `Enter 2FA Code or Confirm login for ${plat}`, created_at: Date.now() }
          : null,
    });
  }

  for (let i = 1; i <= 30; i++) {
    const bid = `agent_tailor_${String(i).padStart(3, "0")}`;
    list.push({
      id: bid,
      pool: "tailor",
      platform: "Local AI",
      status: running ? (i % 2 === 0 ? "tailoring" : "completed") : "idle",
      current_task: running ? "Creating custom APA resume for this opening" : "Ready on standby",
      cpu_pct: +(0.4 + (i % 4) * 0.15).toFixed(2),
      memory_mb: +(2.2 + (i % 3) * 0.4).toFixed(2),
      target_role: "AI / Full-Stack Engineer",
      target_company: "Apex Technologies",
      logs: [
        { t: "12:01:00", msg: "Read requirements for AI Engineer" },
        { t: "12:01:03", msg: "Created custom APA resume highlighting real projects" },
      ],
      verification_challenge: null,
    });
  }

  for (let i = 1; i <= 40; i++) {
    const bid = `agent_apply_${String(i).padStart(3, "0")}`;
    const plat = platforms[(i - 1) % platforms.length];
    list.push({
      id: bid,
      pool: "apply",
      platform: plat,
      status: running ? (i % 7 === 0 ? "needs_verification" : i % 2 === 0 ? "applying" : "completed") : "idle",
      current_task: running ? "Filling application questions for your review" : "Ready on standby",
      cpu_pct: +(0.3 + (i % 5) * 0.1).toFixed(2),
      memory_mb: +(1.5 + (i % 4) * 0.3).toFixed(2),
      target_role: "Senior Developer",
      target_company: "NextGen Software",
      logs: [
        { t: "12:02:10", msg: `Filled application form on ${plat}` },
        { t: "12:02:14", msg: "Staged application for 1-click review" },
      ],
      verification_challenge:
        i % 7 === 0 && running
          ? { platform: plat, prompt: `Confirm application submission for ${plat}`, created_at: Date.now() }
          : null,
    });
  }

  return list;
}
