"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

  const toggleCat = (c: Category) =>
    setCats((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  const filtered = useMemo(() => {
    const now = Date.now();
    return incidents.filter((i) => {
      if (cats.size && !cats.has(i.category)) return false;
      if (status !== "all" && i.status !== status) return false;
      if (district !== "all" && i.district !== district) return false;
      if (periodDays > 0 && now - new Date(i.createdAt).getTime() > periodDays * 86400000)
        return false;
      return true;
    });
  }, [incidents, cats, status, district, periodDays]);

  const counts = useMemo(() => {
    const c = { total: filtered.length, new: 0, in_progress: 0, resolved: 0 };
    for (const i of filtered) {
      if (i.status === "new") c.new++;
      else if (i.status === "in_progress") c.in_progress++;
      else if (i.status === "resolved") c.resolved++;
    }
    return c;
  }, [filtered]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-4 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-lg font-semibold tracking-tight">Карта обращений</h1>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          Алматы · обновляется жителями
        </span>
      </div>

      {/* Фильтры категорий */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
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

        <div className="ml-auto flex flex-wrap items-center gap-2 text-xs">
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
        </div>
      </div>

      {/* Сводка */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Stat label="Всего" value={counts.total} color="#0c6a8d" />
        <Stat label="Новые" value={counts.new} color={STATUS_META.new.color} />
        <Stat label="В работе" value={counts.in_progress} color={STATUS_META.in_progress.color} />
        <Stat label="Решено" value={counts.resolved} color={STATUS_META.resolved.color} />
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_380px]">
        <div className="order-2 h-[50vh] overflow-hidden rounded-2xl border border-border shadow-sm lg:order-1 lg:h-[calc(100vh-14rem)]">
          <MapView incidents={filtered} />
        </div>

        <div className="order-1 flex flex-col gap-2 lg:order-2 lg:h-[calc(100vh-14rem)] lg:overflow-y-auto lg:pr-1">
          {!hydrated ? (
            <div className="text-sm text-muted">Загрузка обращений…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
              Нет обращений под выбранные фильтры.
            </div>
          ) : (
            filtered
              .slice()
              .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
              .map((i) => <IncidentCard key={i.id} incident={i} />)
          )}
        </div>
      </div>

      <Link
        href="/report"
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2.5 rounded-full bg-brand py-2.5 pl-3 pr-5 text-sm font-semibold text-[var(--brand-fg)] shadow-lg shadow-brand/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
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
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-2">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-display text-base font-semibold leading-none">{value}</span>
      <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>
    </div>
  );
}
