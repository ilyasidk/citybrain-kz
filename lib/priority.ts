import type { Incident } from "./types";
import { SEVERITY_META } from "./categories";
import { nearestSensitive } from "./geo";

export type PriorityLevel = "low" | "medium" | "high";

export interface PriorityResult {
  score: number;
  level: PriorityLevel;
  nearSensitive: { name: string; type: string; distance: number } | null;
}

export function computePriority(incident: Incident, now: number = Date.now()): PriorityResult {
  const confirmations = (incident.confirmations ?? 0) * 2;
  const severity = SEVERITY_META[incident.severity].weight;

  const near = nearestSensitive(incident);
  const proximity = near && near.distance <= 200 ? 5 : 0;

  const days = Math.max(
    0,
    (now - new Date(incident.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  const aging = Math.min(10, days * 0.5);

  const score = Math.round((confirmations + severity + proximity + aging) * 10) / 10;

  let level: PriorityLevel = "low";
  if (score >= 14) level = "high";
  else if (score >= 7) level = "medium";

  return {
    score,
    level,
    nearSensitive:
      near && near.distance <= 200
        ? { name: near.object.name, type: near.object.type, distance: Math.round(near.distance) }
        : null,
  };
}

export const PRIORITY_META: Record<PriorityLevel, { label: string; color: string }> = {
  low: { label: "Низкий", color: "#16a34a" },
  medium: { label: "Средний", color: "#d97706" },
  high: { label: "Высокий", color: "#dc2626" },
};
