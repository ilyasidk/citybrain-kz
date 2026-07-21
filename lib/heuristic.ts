import type { Category, Severity } from "./types";

const KEYWORDS: Record<Category, string[]> = {
  roads: ["дорог", "яма", "асфальт", "разметк", "тротуар", "трещин", "проезжая", "жол", "ойық"],
  garbage: ["мусор", "свалк", "контейнер", "отход", "урна", "қоқыс", "мусорн"],
  lighting: ["фонар", "освещен", "свет", "лампа", "тёмн", "темн", "жарық", "плафон"],
  ecology: ["эколог", "дым", "запах", "арык", "слив", "дерев", "загрязн", "воздух", "выброс"],
  transport: ["автобус", "остановк", "транспорт", "маршрут", "павильон", "метро", "көлік", "пандус"],
  landscaping: ["скамейк", "газон", "сквер", "площадк", "клумб", "благоустрой", "качел", "лавочк"],
  safety: ["люк", "провод", "опасн", "перил", "яма глубок", "оголён", "оголен", "электр", "обрыв"],
  other: [],
};

const HIGH_WORDS = ["опасн", "провод", "люк", "глубок", "оголён", "оголен", "обрыв", "школ", "больниц", "детск", "падает", "упасть", "ток"];
const LOW_WORDS = ["скамейк", "газон", "трав", "мигает", "покрас", "неухожен"];

export interface HeuristicResult {
  category: Category;
  severity: Severity;
  confidence: number;
  source: "heuristic";
}

export function classifyHeuristic(text: string): HeuristicResult {
  const t = (text || "").toLowerCase();
  let best: Category = "other";
  let bestScore = 0;
  (Object.keys(KEYWORDS) as Category[]).forEach((cat) => {
    let score = 0;
    for (const kw of KEYWORDS[cat]) if (t.includes(kw)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = cat;
    }
  });

  let severity: Severity = "medium";
  if (HIGH_WORDS.some((w) => t.includes(w))) severity = "high";
  else if (LOW_WORDS.some((w) => t.includes(w))) severity = "low";

  const confidence = bestScore === 0 ? 0.35 : Math.min(0.9, 0.5 + bestScore * 0.15);
  return { category: best, severity, confidence, source: "heuristic" };
}
