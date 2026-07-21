"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { CATEGORY_LIST, STATUS_META } from "@/lib/categories";
import { DISTRICTS } from "@/lib/geo";
import MapView from "@/components/MapView";
import IncidentCard from "@/components/IncidentCard";
import type { Category, Status } from "@/lib/types";

const PERIODS = [
  { label: "Всё время", days: 0 },
  { label: "7 дней", days: 7 },
  { label: "30 дней", days: 30 },
  { label: "60 дней", days: 60 },
];

export default function HomePage() {
  const { incidents, hydrated } = useStore();
  const [cats, setCats] = useState<Set<Category>>(new Set());
  const [status, setStatus] = useState<Status | "all">("all");
  const [district, setDistrict] = useState<string>("all");
  const [periodDays, setPeriodDays] = useState<number>(0);
  const [query, setQuery] = useState("");
  const [mapMode, setMapMode] = useState<"markers" | "heat">("markers");
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("citybrain.intro.v1")) setShowIntro(true);
    } catch {}
  }, []);

  const dismissIntro = () => {
    setShowIntro(false);
    try {
      localStorage.setItem("citybrain.intro.v1", "1");
    } catch {}
  };

  const toggleCat = (c: Category) =>
    setCats((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  const filtered = useMemo(() => {
    const now = Date.now();
    const q = query.trim().toLowerCase();
    return incidents.filter((i) => {
      if (cats.size && !cats.has(i.category)) return false;
      if (status !== "all" && i.status !== status) return false;
      if (district !== "all" && i.district !== district) return false;
      if (periodDays > 0 && now - new Date(i.createdAt).getTime() > periodDays * 86400000)
        return false;
      if (q && !`${i.title} ${i.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [incidents, cats, status, district, periodDays, query]);

  const counts = useMemo(() => {
    const c = { total: filtered.length, new: 0, in_progress: 0, resolved: 0 };
    for (const i of filtered) {
      if (i.status === "new") c.new++;
      else if (i.status === "in_progress") c.in_progress++;
      else if (i.status === "resolved") c.resolved++;
    }
    return c;
  }, [filtered]);

  const sorted = useMemo(
    () =>
      filtered.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [filtered],
  );

  return (
    <div className="relative flex flex-1 flex-col gap-3 px-4 py-4 lg:block lg:p-0">
      {/* Карта — на десктопе во весь экран */}
      <div className="relative order-2 h-[55vh] shrink-0 overflow-hidden rounded-2xl border border-border shadow-sm lg:absolute lg:inset-0 lg:h-auto lg:rounded-none lg:border-0 lg:shadow-none">
        <MapView incidents={filtered} mode={mapMode} />
        <div className="absolute right-3 top-3 z-[500] flex rounded-lg border border-border bg-surface/95 p-0.5 text-xs shadow-sm backdrop-blur lg:right-[424px] lg:top-4">
          <button
            onClick={() => setMapMode("markers")}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              mapMode === "markers"
                ? "bg-ink font-medium text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            Маркеры
          </button>
          <button
            onClick={() => setMapMode("heat")}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              mapMode === "heat"
                ? "bg-ink font-medium text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            🔥 Теплокарта
          </button>
        </div>
      </div>

      {/* Панель управления поверх карты */}
      <div className="glass order-1 rounded-2xl p-3.5 lg:absolute lg:left-4 lg:right-[424px] lg:top-4 lg:z-[500] lg:max-w-4xl">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-display text-lg font-semibold tracking-tight">Карта обращений</h1>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Алматы · обновляется жителями
          </span>
        </div>

        {showIntro && (
          <div className="mt-2 flex items-center gap-3 rounded-lg bg-background/70 px-3 py-2 text-[13px]">
            <span className="min-w-0 flex-1 text-muted">
              <span className="font-medium text-foreground">Как это работает:</span> фото → AI
              определяет категорию → обращение попадает на карту, объединяется с похожими и
              приоритизируется для акимата.
            </span>
            <button
              onClick={dismissIntro}
              aria-label="Скрыть подсказку"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted hover:bg-black/5 hover:text-foreground"
            >
              ×
            </button>
          </div>
        )}

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {CATEGORY_LIST.map((c) => {
            const active = cats.has(c.key);
            return (
              <button
                key={c.key}
                onClick={() => toggleCat(c.key)}
                className="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
                style={{
                  borderColor: active ? c.color : "var(--border)",
                  backgroundColor: active ? `${c.color}1a` : "var(--surface)",
                  color: active ? c.color : "var(--muted)",
                }}
              >
                {c.emoji} {c.label}
              </button>
            );
          })}
          {cats.size > 0 && (
            <button
              onClick={() => setCats(new Set())}
              className="rounded-full px-2.5 py-1 text-xs text-muted underline"
            >
              сбросить
            </button>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Поиск по обращениям…"
            className="w-44 rounded-md border border-border bg-surface px-2 py-1.5 outline-none focus:border-brand"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status | "all")}
            className="rounded-md border border-border bg-surface px-2 py-1.5"
          >
            <option value="all">Все статусы</option>
            {(Object.keys(STATUS_META) as Status[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-md border border-border bg-surface px-2 py-1.5"
          >
            <option value="all">Все районы</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={periodDays}
            onChange={(e) => setPeriodDays(Number(e.target.value))}
            className="rounded-md border border-border bg-surface px-2 py-1.5"
          >
            {PERIODS.map((p) => (
              <option key={p.days} value={p.days}>
                {p.label}
              </option>
            ))}
          </select>

          <div className="ml-auto flex flex-wrap gap-1.5">
            <Stat label="всего" value={counts.total} color="#0c6a8d" />
            <Stat label="новые" value={counts.new} color={STATUS_META.new.color} />
            <Stat label="в работе" value={counts.in_progress} color={STATUS_META.in_progress.color} />
            <Stat label="решено" value={counts.resolved} color={STATUS_META.resolved.color} />
          </div>
        </div>
      </div>

      {/* Список обращений */}
      <div className="glass order-3 flex flex-col gap-2 rounded-2xl p-3 lg:absolute lg:bottom-4 lg:right-4 lg:top-4 lg:z-[500] lg:w-[400px] lg:overflow-y-auto">
        <div className="flex items-baseline justify-between px-1">
          <span className="text-sm font-semibold">Обращения</span>
          <span className="font-mono text-[11px] text-muted">{sorted.length}</span>
        </div>
        {!hydrated ? (
          <div className="px-1 text-sm text-muted">Загрузка обращений…</div>
        ) : sorted.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Нет обращений под выбранные фильтры.
          </div>
        ) : (
          sorted.map((i, idx) => (
            <div key={i.id} className="cb-fade" style={{ animationDelay: `${Math.min(idx, 12) * 35}ms` }}>
              <IncidentCard incident={i} />
            </div>
          ))
        )}
      </div>

      <Link
        href="/report"
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2.5 rounded-full bg-brand py-2.5 pl-3 pr-5 text-sm font-semibold text-[var(--brand-fg)] shadow-lg shadow-brand/30 transition-all hover:-translate-y-0.5 hover:shadow-xl lg:right-[424px]"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-sun text-base font-bold leading-none text-ink">
          ＋
        </span>
        Сообщить о проблеме
      </Link>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-display text-[13px] font-semibold leading-none">{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-muted">{label}</span>
    </div>
  );
}
