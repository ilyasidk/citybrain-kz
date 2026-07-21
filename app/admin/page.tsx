"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "@/lib/store";
import { CATEGORIES, CATEGORY_LIST, STATUS_META } from "@/lib/categories";
import { computePriority, PRIORITY_META } from "@/lib/priority";
import { CategoryBadge } from "@/components/ui";
import type { Category, Status } from "@/lib/types";

export default function AdminPage() {
  const { incidents, hydrated, setStatus } = useStore();

  const byCategory = useMemo(
    () =>
      CATEGORY_LIST.map((c) => ({
        name: c.label,
        value: incidents.filter((i) => i.category === c.key).length,
        color: c.color,
      })).filter((d) => d.value > 0),
    [incidents],
  );

  const byStatus = useMemo(
    () =>
      (Object.keys(STATUS_META) as Status[]).map((s) => ({
        name: STATUS_META[s].label,
        value: incidents.filter((i) => i.status === s).length,
        color: STATUS_META[s].color,
      })),
    [incidents],
  );

  const byDistrict = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of incidents) map.set(i.district, (map.get(i.district) ?? 0) + 1);
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [incidents]);

  const dynamics = useMemo(() => {
    const now = Date.now();
    const weeks: { name: string; value: number }[] = [];
    for (let w = 8; w >= 0; w--) {
      const end = now - w * 7 * 86400000;
      const start = end - 7 * 86400000;
      const value = incidents.filter((i) => {
        const t = new Date(i.createdAt).getTime();
        return t >= start && t < end;
      }).length;
      weeks.push({
        name: new Date(end).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
        value,
      });
    }
    return weeks;
  }, [incidents]);

  const sla = useMemo(() => {
    const acc = new Map<Category, { sum: number; n: number }>();
    for (const i of incidents) {
      if (i.status !== "resolved") continue;
      const resolved = i.statusHistory.find((e) => e.status === "resolved");
      if (!resolved) continue;
      const days = (new Date(resolved.at).getTime() - new Date(i.createdAt).getTime()) / 86400000;
      const cur = acc.get(i.category) ?? { sum: 0, n: 0 };
      cur.sum += days;
      cur.n += 1;
      acc.set(i.category, cur);
    }
    return CATEGORY_LIST.filter((c) => acc.has(c.key)).map((c) => {
      const a = acc.get(c.key)!;
      return { category: c.key, label: c.label, avg: Math.round((a.sum / a.n) * 10) / 10, n: a.n };
    });
  }, [incidents]);

  const ranked = useMemo(() => {
    const now = Date.now();
    return incidents
      .map((i) => ({ incident: i, priority: computePriority(i, now) }))
      .sort((a, b) => b.priority.score - a.priority.score);
  }, [incidents]);

  if (!hydrated) {
    return <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted">Загрузка дашборда…</div>;
  }

  const openCount = incidents.filter((i) => i.status === "new" || i.status === "in_progress").length;
  const resolvedCount = incidents.filter((i) => i.status === "resolved").length;
  const avgResolve =
    sla.length > 0 ? Math.round((sla.reduce((s, x) => s + x.avg * x.n, 0) / sla.reduce((s, x) => s + x.n, 0)) * 10) / 10 : 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        Служебная панель
      </p>
      <h1 className="mt-1 font-display text-xl font-semibold tracking-tight">Дашборд акимата</h1>
      <p className="mt-1 text-sm text-muted">
        Аналитика обращений и приоритизация. Всего инцидентов: {incidents.length}.
      </p>

      {/* KPI */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Всего обращений" value={incidents.length} />
        <Kpi label="Открытых" value={openCount} color={STATUS_META.in_progress.color} />
        <Kpi label="Решено" value={resolvedCount} color={STATUS_META.resolved.color} />
        <Kpi label="Ср. срок закрытия" value={`${avgResolve} дн.`} />
      </div>

      {/* Графики */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Обращения по категориям">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCategory} margin={{ top: 8, right: 8, bottom: 8, left: -20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {byCategory.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Статусы обращений">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={80} label>
                {byStatus.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Динамика обращений (по неделям)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dynamics} margin={{ top: 8, right: 8, bottom: 8, left: -20 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0c6a8d" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#0c6a8d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#0c6a8d" fill="url(#g)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Топ районов по числу жалоб">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byDistrict} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 30 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#0c6a8d" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* SLA */}
      {sla.length > 0 && (
        <Card title="Средний срок закрытия по категориям (SLA)" className="mt-4">
          <div className="flex flex-wrap gap-2">
            {sla.map((s) => (
              <div key={s.category} className="rounded-lg border border-border px-3 py-2 text-sm">
                <CategoryBadge category={s.category} />
                <span className="ml-2 font-semibold">{s.avg} дн.</span>
                <span className="text-muted"> ({s.n})</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Таблица приоритизации */}
      <Card title="Инциденты по AI-приоритету" className="mt-4">
        <button
          onClick={() => exportCsv(ranked)}
          className="mb-3 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-brand hover:text-brand"
        >
          ⬇ Экспорт в CSV
        </button>
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-wider text-muted">
                <th className="px-3 py-2 font-medium">Проблема</th>
                <th className="px-3 py-2 font-medium">Район</th>
                <th className="px-3 py-2 font-medium">Подтв.</th>
                <th className="px-3 py-2 font-medium">Приоритет</th>
                <th className="px-3 py-2 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {ranked.slice(0, 30).map(({ incident, priority }) => (
                <tr key={incident.id} className="border-b border-border/60 hover:bg-black/[0.02]">
                  <td className="px-3 py-2">
                    <Link href={`/incident/${incident.id}`} className="font-medium hover:text-brand">
                      {incident.title}
                    </Link>
                    <div className="mt-0.5">
                      <CategoryBadge category={incident.category} />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted">{incident.district}</td>
                  <td className="px-3 py-2">👍 {incident.confirmations}</td>
                  <td className="px-3 py-2">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: `${PRIORITY_META[priority.level].color}22`,
                        color: PRIORITY_META[priority.level].color,
                      }}
                    >
                      {PRIORITY_META[priority.level].label} · {priority.score}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={incident.status}
                      onChange={(e) => setStatus(incident.id, e.target.value as Status)}
                      className="rounded-md border border-border bg-surface px-2 py-1 text-xs"
                    >
                      {(Object.keys(STATUS_META) as Status[]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_META[s].label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function exportCsv(
  ranked: { incident: import("@/lib/types").Incident; priority: { score: number; level: string } }[],
) {
  const header = ["ID", "Проблема", "Категория", "Район", "Статус", "Подтверждений", "Приоритет", "Скор", "Создано"];
  const rows = ranked.map(({ incident: i, priority: p }) => [
    i.id,
    i.title,
    CATEGORIES[i.category].label,
    i.district,
    STATUS_META[i.status].label,
    i.confirmations,
    p.level,
    p.score,
    new Date(i.createdAt).toLocaleDateString("ru-RU"),
  ]);
  const csv =
    "﻿" +
    [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(";"))
      .join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "citybrain-incidents.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function Kpi({ label, value, color = "#0c6a8d" }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="font-display text-[22px] font-semibold leading-none" style={{ color }}>
        {value}
      </div>
      <div className="mt-1.5 text-[11px] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border bg-surface p-4 ${className}`}>
      <div className="mb-3 text-sm font-semibold">{title}</div>
      {children}
    </div>
  );
}
