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
  { id: "p1", fromId: 1, toId: 2, label: "Profile DNA", color: "#10b981", speed: 0.007, t: 0.1 },
  { id: "p2", fromId: 1, toId: 3, label: "Criteria", color: "#6366f1", speed: 0.006, t: 0.5 },
  { id: "p3", fromId: 2, toId: 4, label: "Job Query", color: "#059669", speed: 0.009, t: 0.35 },
  { id: "p4", fromId: 2, toId: 5, label: "Raw Feed", color: "#10b981", speed: 0.008, t: 0.75 },
  { id: "p5", fromId: 5, toId: 6, label: "96% Match", color: "#f59e0b", speed: 0.006, t: 0.45 },
  { id: "p6", fromId: 3, toId: 6, label: "APA CV Spec", color: "#8b5cf6", speed: 0.008, t: 0.25 },
  { id: "p7", fromId: 3, toId: 7, label: "Queue", color: "#6366f1", speed: 0.007, t: 0.65 },
  { id: "p8", fromId: 6, toId: 7, label: "Tailored APA", color: "#ec4899", speed: 0.008, t: 0.8 },
  { id: "p9", fromId: 7, toId: 1, label: "Notion Synced ✓", color: "#10b981", speed: 0.005, t: 0.1 },
];

export const PARENT_LEAF_OFFSETS: Record<number, { dx: number; dy: number }[]> = {
  4: [
    { dx: -40, dy: 85 },
    { dx: -15, dy: 110 },
    { dx: 15, dy: 110 },
    { dx: 40, dy: 85 },
  ],
  5: [
    { dx: -40, dy: 85 },
    { dx: -15, dy: 110 },
    { dx: 15, dy: 110 },
    { dx: 40, dy: 85 },
  ],
  6: [
    { dx: -40, dy: 85 },
    { dx: -15, dy: 110 },
    { dx: 15, dy: 110 },
    { dx: 40, dy: 85 },
  ],
  7: [
    { dx: -40, dy: 85 },
    { dx: -15, dy: 110 },
    { dx: 15, dy: 110 },
    { dx: 40, dy: 85 },
  ],
};

// Cubic / Quadratic Bezier point interpolation along tree branches
export function getEdgePoint(fromNode: GraphNode, toNode: GraphNode, t: number) {
  // Cross-subtree bridge from 5 to 6
  if (fromNode.id === 5 && toNode.id === 6) {
    const p0 = { x: 350, y: 295 };
    const p1 = { x: 450, y: 340 };
    const p2 = { x: 550, y: 295 };
    const mt = 1 - t;
    return {
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    };
  }
  // Feedback loop from 7 back to 1
  if (fromNode.id === 7 && toNode.id === 1) {
    const p0 = { x: 770, y: 295 };
    const p1 = { x: 870, y: 190 };
    const p2 = { x: 620, y: 25 };
    const p3 = { x: 450, y: 55 };
    const mt = 1 - t;
    return {
      x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
      y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
    };
  }
  // Standard tree branch cubic bezier
  const x1 = fromNode.x;
  const y1 = fromNode.y;
  const x2 = toNode.x;
  const y2 = toNode.y;
  const midY = (y1 + y2) / 2;
  const mt = 1 - t;
  return {
    x: mt * mt * mt * x1 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x2,
    y: mt * mt * mt * y1 + 3 * mt * mt * t * midY + 3 * mt * t * t * midY + t * t * t * y2,
  };
}

export function buildWorkerLeaves(
  bots: BotTelemetry[],
  spawnedCount: number
): WorkerLeaf[] {
  const leaves: WorkerLeaf[] = [];
  let botIdx = 0;

  [4, 5, 6, 7].forEach((parentId) => {
    const parent = GRAPH_NODES.find((n) => n.id === parentId)!;
    const offsets = PARENT_LEAF_OFFSETS[parentId] || [];

    offsets.forEach((off, idx) => {
      const bot =
        bots[botIdx % (bots.length || 1)] ||
        ({
          id: `BOT-${parentId}${idx + 1}`,
          platform: parentId <= 5 ? "LinkedIn" : "Notion",
          pool: parent.poolKey,
          status: "browsing",
          current_task: `Autonomous tree worker attached to Step ${parentId}`,
          cpu_pct: 12 + idx * 4,
          memory_mb: 180 + idx * 30,
          logs: [{ t: "Just now", msg: `Attached to Step ${parentId}` }],
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

  // Dynamic user-spawned nodes
  for (let i = 0; i < spawnedCount; i++) {
    const parentId = 4 + (i % 4);
    const parent = GRAPH_NODES.find((n) => n.id === parentId)!;
    const jitterX = ((i * 17) % 50) - 25;
    const spawnId = `SPAWNED-BOT-${i + 1}`;
    leaves.push({
      id: spawnId,
      parentId,
      x: parent.x + jitterX,
      y: parent.y + 135,
      bot: {
        id: spawnId,
        platform: "Ollama Local AI",
        pool: parent.poolKey,
        status: "applying",
        current_task: "Dynamically spawned autonomous tree agent evaluating listings",
        cpu_pct: 28,
        memory_mb: 240,
        logs: [{ t: "Just now", msg: "Spawned into binary search tree" }],
      } as BotTelemetry,
      isNew: true,
    });
  }

  return leaves;
}
