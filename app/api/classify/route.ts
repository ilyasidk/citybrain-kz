import Anthropic from "@anthropic-ai/sdk";
import { classifyHeuristic } from "@/lib/heuristic";
import type { Category, Severity } from "@/lib/types";

export const runtime = "nodejs";

const VALID_CATEGORIES: Category[] = [
  "roads",
  "garbage",
  "lighting",
  "ecology",
  "transport",
  "landscaping",
  "safety",
  "other",
];
const VALID_SEVERITY: Severity[] = ["low", "medium", "high"];

const SYSTEM = `Ты классификатор городских обращений для платформы CityBrain KZ.
На вход ты получаешь текст обращения жителя Казахстана и опционально фотографию проблемы.
Если есть фото — сначала определи, что на нём изображено (яма, мусор, сломанный фонарь и т.п.).
Верни ТОЛЬКО JSON без пояснений и без markdown в формате:
{"category":"roads|garbage|lighting|ecology|transport|landscaping|safety|other","severity":"low|medium|high","confidence":0.0-1.0}`;

type ImageMedia = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

function normalizeMedia(m?: string): ImageMedia {
  if (m === "image/png" || m === "image/gif" || m === "image/webp") return m;
  return "image/jpeg";
}

function extractJson(raw: string): { category: Category; severity: Severity; confidence: number } | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    const obj = JSON.parse(raw.slice(start, end + 1));
    const category: Category = VALID_CATEGORIES.includes(obj.category) ? obj.category : "other";
    const severity: Severity = VALID_SEVERITY.includes(obj.severity) ? obj.severity : "medium";
    const confidence =
      typeof obj.confidence === "number" ? Math.max(0, Math.min(1, obj.confidence)) : 0.7;
    return { category, severity, confidence };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let text = "";
  let imageBase64: string | undefined;
  let mediaType: string | undefined;
  try {
    const body = await req.json();
    text = typeof body.text === "string" ? body.text : "";
    imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64 : undefined;
    mediaType = typeof body.mediaType === "string" ? body.mediaType : undefined;
  } catch {
    /* empty body */
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(classifyHeuristic(text));
  }

  try {
    const client = new Anthropic({ apiKey });
    const content: Anthropic.MessageParam["content"] = [];
    if (imageBase64) {
      content.push({
        type: "image",
        source: { type: "base64", media_type: normalizeMedia(mediaType), data: imageBase64 },
      });
    }
    content.push({
      type: "text",
      text: `Текст обращения: ${text || "(текста нет, только фото)"}`,
    });

    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: SYSTEM,
      messages: [{ role: "user", content }],
    });

    const raw = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const parsed = extractJson(raw);
    if (!parsed) return Response.json(classifyHeuristic(text));
    return Response.json({ ...parsed, source: "ai" });
  } catch {
    return Response.json(classifyHeuristic(text));
  }
}
