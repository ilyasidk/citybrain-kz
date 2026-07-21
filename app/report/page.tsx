"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { classifyInput } from "@/lib/classify";
import { CATEGORY_LIST, CATEGORIES, SEVERITY_META } from "@/lib/categories";
import { districtForPoint, ALMATY_CENTER } from "@/lib/geo";
import MapPicker from "@/components/MapPicker";
import { CategoryBadge, PhotoPlaceholder, StatusBadge } from "@/components/ui";
import type { Category, Incident, Severity } from "@/lib/types";

function splitDataUrl(dataUrl: string): { mediaType: string; base64: string } {
  const [head, data] = dataUrl.split(",");
  const m = /data:(.*?);base64/.exec(head);
  return { mediaType: m?.[1] ?? "image/jpeg", base64: data ?? "" };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function ReportPage() {
  const router = useRouter();
  const { addIncident, confirmIncident, findDuplicates } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [severity, setSeverity] = useState<Severity>("medium");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInfo, setAiInfo] = useState<{ source: string; confidence: number } | null>(null);
  const [point, setPoint] = useState({ lat: ALMATY_CENTER.lat, lng: ALMATY_CENTER.lng });
  const [dups, setDups] = useState<Incident[] | null>(null);
  const [created, setCreated] = useState<Incident | null>(null);
  const [error, setError] = useState<string | null>(null);

  const district = districtForPoint(point);

  async function runClassify(nextPhotos = photos, text = description) {
    if (!nextPhotos.length && !text.trim()) return;
    setAiLoading(true);
    try {
      const img = nextPhotos[0] ? splitDataUrl(nextPhotos[0]) : undefined;
      const res = await classifyInput({
        text,
        imageBase64: img?.base64,
        mediaType: img?.mediaType,
      });
      setCategory(res.category);
      setSeverity(res.severity);
      setAiInfo({ source: res.source, confidence: res.confidence });
    } finally {
      setAiLoading(false);
    }
  }

  async function handleFiles(list: FileList | null) {
    if (!list) return;
    const files = Array.from(list).slice(0, 3 - photos.length);
    const urls = await Promise.all(files.map(fileToDataUrl));
    const next = [...photos, ...urls].slice(0, 3);
    setPhotos(next);
    void runClassify(next, description);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setPoint({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Не удалось получить геолокацию — укажите точку на карте."),
    );
  }

  function doCreate() {
    if (!category) return;
    const inc = addIncident({
      category,
      severity,
      title: description.trim().slice(0, 60) || `${CATEGORIES[category].label}: обращение`,
      description: description.trim() || "Без описания",
      lat: Math.round(point.lat * 1e6) / 1e6,
      lng: Math.round(point.lng * 1e6) / 1e6,
      district,
      photos,
      aiConfidence: aiInfo?.confidence,
    });
    setCreated(inc);
  }

  function handleSubmit() {
    setError(null);
    if (!category) {
      setError("Выберите категорию (можно определить через AI).");
      return;
    }
    if (!description.trim() && photos.length === 0) {
      setError("Добавьте фото или описание проблемы.");
      return;
    }
    const found = findDuplicates(category, point.lat, point.lng);
    if (found.length > 0) {
      setDups(found);
      return;
    }
    doCreate();
  }

  if (created) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-10">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="stripe h-2" aria-hidden />
          <div className="p-6 text-center">
            <div className="text-4xl">✅</div>
            <h1 className="mt-3 font-display text-lg font-semibold">Обращение принято</h1>
            <p className="mt-1 text-sm text-muted">Талон обращения</p>
            <div className="mx-auto mt-3 w-fit rounded-lg border border-dashed border-border bg-background px-4 py-2 font-mono text-sm font-semibold tracking-wider">
              {created.id}
            </div>
            <div className="mt-3 flex justify-center">
              <StatusBadge status={created.status} />
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 text-center">
          <Link
            href={`/incident/${created.id}`}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-[var(--brand-fg)]"
          >
            Открыть карточку инцидента
          </Link>
          <Link href="/" className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm">
            Вернуться на карту
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="font-display text-xl font-semibold tracking-tight">Сообщить о проблеме</h1>
      <p className="mt-1 text-sm text-muted">
        Прикрепите фото — AI предложит категорию. Точку можно уточнить на карте.
      </p>

      {/* Фото */}
      <section className="mt-5 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[11px] font-semibold text-muted">01</span>
          <label className="text-sm font-semibold">Фото (до 3)</label>
        </div>
        <div className="mt-2 flex gap-2">
          {photos.map((p, idx) => (
            <div key={idx} className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
          {photos.length < 3 && (
            <button
              onClick={() => fileRef.current?.click()}
              className="grid h-24 w-24 place-items-center rounded-lg border border-dashed border-border text-2xl text-muted hover:bg-black/5"
            >
              ＋
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </section>

      {/* Описание */}
      <section className="mt-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[11px] font-semibold text-muted">02</span>
          <label className="text-sm font-semibold">Описание</label>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => !category && runClassify()}
          rows={3}
          placeholder="Опишите проблему: что, где, насколько срочно…"
          className="mt-2 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-brand"
        />
      </section>

      {/* AI-категория */}
      <section className="mt-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[11px] font-semibold text-muted">03</span>
            <span className="text-sm font-semibold">Категория</span>
          </div>
          <button
            onClick={() => runClassify()}
            disabled={aiLoading}
            className="rounded-md bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand disabled:opacity-50"
          >
            {aiLoading ? "Анализ…" : "🤖 Определить (AI)"}
          </button>
        </div>

        {aiInfo && category && (
          <p className="mt-2 text-xs text-muted">
            {aiInfo.source === "ai" ? "Claude" : "Эвристика"} предлагает:{" "}
            <CategoryBadge category={category} /> · уверенность {Math.round(aiInfo.confidence * 100)}%
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {CATEGORY_LIST.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
              style={{
                borderColor: category === c.key ? c.color : "var(--border)",
                backgroundColor: category === c.key ? `${c.color}1a` : "var(--surface)",
                color: category === c.key ? c.color : "var(--muted)",
              }}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm">Серьёзность:</span>
          {(Object.keys(SEVERITY_META) as Severity[]).map((s) => (
            <button
              key={s}
              onClick={() => setSeverity(s)}
              className="rounded-md border px-2 py-1 text-xs"
              style={{
                borderColor: severity === s ? SEVERITY_META[s].color : "var(--border)",
                backgroundColor: severity === s ? `${SEVERITY_META[s].color}1a` : "transparent",
                color: severity === s ? SEVERITY_META[s].color : "var(--muted)",
              }}
            >
              {SEVERITY_META[s].label}
            </button>
          ))}
        </div>
      </section>

      {/* Геолокация */}
      <section className="mt-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[11px] font-semibold text-muted">04</span>
            <label className="text-sm font-semibold">Местоположение</label>
          </div>
          <button onClick={useMyLocation} className="text-xs font-semibold text-brand underline">
            📍 Моё местоположение
          </button>
        </div>
        <div className="mt-2 h-56 overflow-hidden rounded-xl border border-border">
          <MapPicker value={point} onChange={(lat, lng) => setPoint({ lat, lng })} />
        </div>
        <p className="mt-1.5 font-mono text-[10.5px] uppercase tracking-wide text-muted">
          {district} район · {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
        </p>
      </section>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        className="mt-5 w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-[var(--brand-fg)] shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:shadow-xl"
      >
        Отправить обращение
      </button>

      {/* Дедупликация */}
      {dups && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-surface p-5">
            <h2 className="text-lg font-semibold">Похоже, проблема уже есть</h2>
            <p className="mt-1 text-sm text-muted">
              Рядом ({"≤"}100 м) найдены обращения той же категории. Это та же проблема?
            </p>
            <div className="mt-3 flex max-h-64 flex-col gap-2 overflow-y-auto">
              {dups.map((d) => (
                <div key={d.id} className="flex gap-3 rounded-lg border border-border p-2">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md">
                    {d.photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.photos[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <PhotoPlaceholder category={d.category} className="h-full w-full" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{d.title}</div>
                    <div className="text-xs text-muted">👍 {d.confirmations} · {d.district}</div>
                  </div>
                  <button
                    onClick={() => {
                      confirmIncident(d.id);
                      router.push(`/incident/${d.id}`);
                    }}
                    className="self-center rounded-md bg-brand px-2.5 py-1.5 text-xs font-semibold text-[var(--brand-fg)]"
                  >
                    Это она
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setDups(null);
                  doCreate();
                }}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
              >
                Нет, создать новое
              </button>
              <button
                onClick={() => setDups(null)}
                className="rounded-lg px-3 py-2 text-sm text-muted"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
