import { GraphNode } from "./types";
import { GRAPH_NODES } from "./constants";
import { type BotTelemetry } from "@/lib/swarm";

export interface DataPacket {
  id: string;
  fromId: number;
  toId: number;
  label: string;
  color: string;
  speed: number;
  t: number;
}

export interface WorkerLeaf {
  id: string;
  parentId: number;
  x: number;
  y: number;
  bot: BotTelemetry;
  isNew?: boolean;
}

export const INITIAL_PACKETS: DataPacket[] = [
  { id: "p1", fromId: 1, toId: 4, label: "JOB FEED", color: "#10b981", speed: 0.005, t: 0.1 },
  { id: "p2", fromId: 2, toId: 4, label: "SKILLS VEC", color: "#3b82f6", speed: 0.005, t: 0.4 },
  { id: "p3", fromId: 3, toId: 5, label: "CRITERIA", color: "#6366f1", speed: 0.005, t: 0.7 },
  { id: "p4", fromId: 4, toId: 6, label: "PARSED ATS", color: "#059669", speed: 0.006, t: 0.25 },
  { id: "p5", fromId: 5, toId: 8, label: "GUARD OK", color: "#10b981", speed: 0.006, t: 0.6 },
  { id: "p6", fromId: 6, toId: 9, label: "94% MATCH", color: "#f59e0b", speed: 0.005, t: 0.5 },
  { id: "p7", fromId: 7, toId: 8, label: "VERIFIED", color: "#8b5cf6", speed: 0.006, t: 0.35 },
  { id: "p8", fromId: 8, toId: 9, label: "TAILORED CV", color: "#6366f1", speed: 0.006, t: 0.8 },
  { id: "p9", fromId: 9, toId: 10, label: "NOTION ✓", color: "#10b981", speed: 0.004, t: 0.45 },
  { id: "p10", fromId: 9, toId: 2, label: "FEEDBACK", color: "#ec4899", speed: 0.004, t: 0.15 },
];

export const PARENT_LEAF_OFFSETS: Record<number, { dx: number; dy: number }[]> = {
  4: [
    { dx: -24, dy: 36 },
    { dx: 24, dy: 36 },
  ],
  5: [
    { dx: -24, dy: 36 },
    { dx: 24, dy: 36 },
  ],
  6: [
    { dx: -24, dy: 36 },
    { dx: 24, dy: 36 },
  ],
  7: [
    { dx: -24, dy: 36 },
    { dx: 24, dy: 36 },
  ],
  8: [
    { dx: -24, dy: 36 },
    { dx: 24, dy: 36 },
  ],
  9: [
    { dx: -24, dy: 36 },
    { dx: 24, dy: 36 },
  ],
  10: [
    { dx: -24, dy: 36 },
    { dx: 24, dy: 36 },
  ],
};

// Smooth cubic Bezier interpolation across neural synapses
export function getEdgePoint(fromNode: GraphNode, toNode: GraphNode, t: number) {
  // Feedback loop from Output Submitter (9) back to Profile (2)
  if (fromNode.id === 9 && toNode.id === 2) {
    const p0 = { x: 830, y: 150 };
    const p1 = { x: 800, y: 440 };
    const p2 = { x: 160, y: 440 };
    const p3 = { x: 110, y: 220 };
    const mt = 1 - t;
    return {
      x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
      y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
    };
  }

  // Standard forward synaptic cubic bezier between layers
  const x1 = fromNode.x;
  const y1 = fromNode.y;
  const x2 = toNode.x;
  const y2 = toNode.y;
  const midX = x1 + (x2 - x1) * 0.5;
  const mt = 1 - t;

  return {
    x: mt * mt * mt * x1 + 3 * mt * mt * t * midX + 3 * mt * t * t * midX + t * t * t * x2,
    y: mt * mt * mt * y1 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y2,
  };
}

export function buildWorkerLeaves(
  bots: BotTelemetry[],
  spawnedCount: number
): WorkerLeaf[] {
  const leaves: WorkerLeaf[] = [];
  let botIdx = 0;
  const targetParentIds = [4, 5, 6, 7, 8, 9, 10];

  targetParentIds.forEach((parentId) => {
    const parent = GRAPH_NODES.find((n) => n.id === parentId);
    if (!parent) return;
    const offsets = PARENT_LEAF_OFFSETS[parentId] || [];

    offsets.forEach((off, idx) => {
      const bot =
        bots[botIdx % (bots.length || 1)] ||
        ({
          id: `BOT-${parentId}-${idx + 1}`,
          platform: parentId <= 5 ? "LinkedIn" : "Notion",
          pool: parent.poolKey === "all" ? "discovery" : parent.poolKey,
          status: "browsing",
          current_task: `Active neural synapse agent attached to ${parent.title}`,
          cpu_pct: 14 + idx * 4,
          memory_mb: 190 + idx * 25,
          logs: [{ t: "Just now", msg: `Attached to ${parent.title}` }],
        } as BotTelemetry);

      leaves.push({
        id: bot.id || `LEAF-${parentId}-${idx}`,
        parentId,
        x: parent.x + off.dx,
        y: parent.y + off.dy,
        bot,
      });
      botIdx++;
    });
  });

  // Dynamic user-spawned neural nodes
  for (let i = 0; i < spawnedCount; i++) {
    const parentId = targetParentIds[i % targetParentIds.length];
    const parent = GRAPH_NODES.find((n) => n.id === parentId);
    if (!parent) continue;
    const jitterX = ((i * 17) % 40) - 20;
    const jitterY = 40 + ((i * 13) % 20);

    leaves.push({
      id: `DYNAMIC-${i + 1}`,
      parentId,
      x: parent.x + jitterX,
      y: parent.y + jitterY,
      isNew: true,
      bot: {
        id: `SPAWNED-BOT-${i + 1}`,
        platform: "LinkedIn",
        pool: parent.poolKey === "all" ? "discovery" : parent.poolKey,
        status: "browsing",
        current_task: `Dynamically provisioned neural worker for ${parent.title}`,
        cpu_pct: 22,
        memory_mb: 240,
        logs: [
          { t: "Just now", msg: `Initialized in ${parent.title} pool.` },
          { t: "Just now", msg: "Awaiting next batch of opportunity vectors." },
        ],
      },
    });
  }

  return leaves;
}
