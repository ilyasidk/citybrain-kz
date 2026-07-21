import type { Incident } from "./types";

export interface Badge {
  key: string;
  label: string;
  emoji: string;
  description: string;
  earned: (stats: UserStats) => boolean;
}

export interface UserStats {
  reported: number;
  confirmed: number;
  resolved: number;
  confirmationsGiven: number;
}

export const BADGES: Badge[] = [
  {
    key: "first_report",
    label: "Первый шаг",
    emoji: "🌱",
    description: "Подано первое обращение",
    earned: (s) => s.reported >= 1,
  },
  {
    key: "reporter_5",
    label: "Активный житель",
    emoji: "🏅",
    description: "5 поданных обращений",
    earned: (s) => s.reported >= 5,
  },
  {
    key: "solver_10",
    label: "Помощник города",
    emoji: "🎯",
    description: "Помог решить 10 городских проблем",
    earned: (s) => s.resolved >= 10,
  },
  {
    key: "verifier",
    label: "Проверяющий",
    emoji: "🔎",
    description: "10 подтверждений чужих обращений",
    earned: (s) => s.confirmationsGiven >= 10,
  },
  {
    key: "guardian",
    label: "Страж района",
    emoji: "⭐",
    description: "3 подтверждённых обращения",
    earned: (s) => s.confirmed >= 3,
  },
];

export function computeUserStats(
  reporterName: string,
  incidents: Incident[],
  confirmationsGiven: number,
): UserStats {
  const mine = incidents.filter((i) => i.reporter === reporterName);
  return {
    reported: mine.length,
    confirmed: mine.filter((i) => i.confirmations >= 2).length,
    resolved: mine.filter((i) => i.status === "resolved").length,
    confirmationsGiven,
  };
}

export function activityScore(stats: UserStats): number {
  return stats.reported * 10 + stats.confirmed * 5 + stats.resolved * 15 + stats.confirmationsGiven * 3;
}
