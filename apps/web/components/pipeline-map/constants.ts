import { GraphNode } from "./types";

export const GRAPH_NODES: GraphNode[] = [
  {
    id: 1,
    x: 450,
    y: 55,
    labelY: 22,
    label: "1: ROOT DISPATCHER",
    title: "Master Orchestrator (Career DNA)",
    role: "Root of the Swarm Tree",
    badge: "Level 0: Root",
    desc: "The central intelligence hub and root of the binary agent tree. Stores your verified Career DNA, skills vectors, and dispatches target criteria down the search and synthesis subtrees without inventing fake skills.",
    stats: [
      { label: "Tree Role", val: "Root Dispatcher" },
      { label: "Career DNA", val: "Verified Projects" },
      { label: "Honesty Policy", val: "Zero Fake Skills" },
      { label: "Dispatch Rate", val: "Sub-10ms Traversal" },
    ],
    poolKey: "all",
  },
  {
    id: 2,
    x: 240,
    y: 175,
    labelY: 140,
    label: "2: DISCOVERY SWARM",
    title: "Job Discovery Subtree (Left Branch)",
    role: "Left Subtree Root",
    badge: "300 Agents",
    desc: "Orchestrates 300 autonomous web crawlers searching LinkedIn, Indeed, and JobStreet around the clock, streaming raw openings down into scraping and filtering branches.",
    stats: [
      { label: "Subtree", val: "Left Branch (Discovery)" },
      { label: "Active Crawlers", val: "300 Workers" },
      { label: "Target Platforms", val: "LinkedIn, JobStreet, Indeed" },
      { label: "Throughput", val: "1,200 postings/hr" },
    ],
    poolKey: "discovery",
  },
  {
    id: 3,
    x: 660,
    y: 175,
    labelY: 140,
    label: "3: SYNTHESIS SWARM",
    title: "Application & Execution Subtree (Right Branch)",
    role: "Right Subtree Root",
    badge: "700 Agents",
    desc: "Oversees 700 specialized agents generating tailored APA 7th edition resumes, staging 1-click application forms, and synchronizing real-time pipeline status to your Notion workspace.",
    stats: [
      { label: "Subtree", val: "Right Branch (Execution)" },
      { label: "Active Workers", val: "700 Workers" },
      { label: "Output Quality", val: "APA 7th Format" },
      { label: "Verification", val: "Anti-Hallucination" },
    ],
    poolKey: "tailor",
  },
  {
    id: 4,
    x: 130,
    y: 295,
    labelY: 338,
    label: "4: LIVE CRAWLERS",
    title: "Board Scrapers & Anti-Bot Ingestion",
    role: "Left-Left Leaf Hub",
    badge: "Raw Ingestion",
    desc: "High-concurrency scraping nodes that parse job specifications, salary ranges, and requirement lists from major ATS systems (Greenhouse, Lever, Workday) with stealth rate-limiting.",
    stats: [
      { label: "Node Type", val: "Leaf Hub (Left-Left)" },
      { label: "Supported ATS", val: "Greenhouse, Lever, Workday" },
      { label: "Anti-Bot", val: "Stealth Proxies" },
      { label: "Payload", val: "Structured Job JSON" },
    ],
    poolKey: "discovery",
  },
  {
    id: 5,
    x: 350,
    y: 295,
    labelY: 338,
    label: "5: SMART MATCHER",
    title: "Neural Matcher & Vector Filter",
    role: "Left-Right Leaf Hub",
    badge: "100% Private",
    desc: "Locally computes cosine similarity between your verified Career DNA and job requirements using quantized Ollama LLM embeddings. Filters out low-match or irrelevant postings.",
    stats: [
      { label: "Node Type", val: "Leaf Hub (Left-Right)" },
      { label: "Inference Engine", val: "Local Ollama Qwen2.5" },
      { label: "Threshold", val: ">= 80% Compatibility" },
      { label: "Privacy", val: "100% On-Device" },
    ],
    poolKey: "tailor",
  },
  {
    id: 6,
    x: 550,
    y: 295,
    labelY: 338,
    label: "6: RESUME MAKER",
    title: "APA 7th Resume & Cover Letter Generator",
    role: "Right-Left Leaf Hub",
    badge: "Evidence Aligned",
    desc: "300 specialized agents craft targeted APA 7th edition CVs and empirical cover letters, citing only verifiable evidence from your GitHub and work history for each qualified role.",
    stats: [
      { label: "Node Type", val: "Leaf Hub (Right-Left)" },
      { label: "Citations", val: "APA 7th Software Citations" },
      { label: "Tailoring", val: "Role-Specific Focus" },
      { label: "Integrity", val: "Zero Fake Skills" },
    ],
    poolKey: "tailor",
  },
  {
    id: 7,
    x: 770,
    y: 295,
    labelY: 338,
    label: "7: AUTO-APPLIER",
    title: "1-Click Submitter & Notion Sync",
    role: "Right-Right Leaf Hub",
    badge: "400 Agents",
    desc: "400 agents pre-fill repetitive application forms and stage them for your instant review, while simultaneously creating records in your connected Notion job tracker board.",
    stats: [
      { label: "Node Type", val: "Leaf Hub (Right-Right)" },
      { label: "Sync Target", val: "Notion Kanban & Sheets" },
      { label: "User Control", val: "Human-in-the-Loop Review" },
      { label: "Automation", val: "Form Pre-fill" },
    ],
    poolKey: "apply",
  },
];

// Binary Search Tree Branch Edges + Inter-subtree Data Bridge
export const GRAPH_EDGES: [number, number][] = [
  // Tree Branches (Root -> Level 1)
  [1, 2], // Root -> Discovery Swarm
  [1, 3], // Root -> Synthesis Swarm

  // Left Subtree Branches (Level 1 -> Level 2)
  [2, 4], // Discovery -> Live Crawlers
  [2, 5], // Discovery -> Smart Matcher

  // Right Subtree Branches (Level 1 -> Level 2)
  [3, 6], // Synthesis -> Resume Maker
  [3, 7], // Synthesis -> Auto-Applier

  // Inter-Tree Data Bridge (High-scoring match sent from Matcher to Resume Maker)
  [5, 6],

  // Feedback Loop (Confirmation sent from Auto-Applier back to Root Dispatcher)
  [7, 1],
];
