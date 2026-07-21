import type { Category, Severity } from "./types";
import { classifyHeuristic } from "./heuristic";

export interface ClassifyResult {
  category: Category;
  severity: Severity;
  confidence: number;
  source: "ai" | "heuristic";
}

export async function classifyInput(params: {
  text?: string;
  imageBase64?: string;
  mediaType?: string;
}): Promise<ClassifyResult> {
  try {
    const res = await fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as ClassifyResult;
    return data;
  } catch {
    return classifyHeuristic(params.text ?? "");
  }
}
