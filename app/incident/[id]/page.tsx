"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { useStore } from "@/lib/store";
import { CATEGORIES, SEVERITY_META, STATUS_META } from "@/lib/categories";
import { computePriority } from "@/lib/priority";
import { CategoryBadge, PhotoPlaceholder, PriorityBadge, SeverityBadge, StatusBadge } from "@/components/ui";
import MapView from "@/components/MapView";
import type { Status } from "@/lib/types";

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AKIMAT_ACTIONS: { status: Status; label: string }[] = [
  { status: "in_progress", label: "В работу" },
  { status: "resolved", label: "Решено" },
  { status: "rejected", label: "Отклонить" },
];

export default function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { incidents, hydrated, user, confirmIncident, voteResolved, setStatus } = useStore();
  const incident = useMemo(() => incidents.find((i) => i.id === id), [incidents, id]);
  const priority = useMemo(() => (incident ? computePriority(incident) : null), [incident]);

  if (!hydrated) {
    return <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted">Загрузка…</div>;
  }

  if (!incident) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center">
        <p className="text-sm text-muted">Инцидент не найден.</p>
        <Link href="/" className="mt-3 inline-block text-sm font-semibold text-brand underline">
          ← На карту
        </Link>
      </div>
    );
  }

  const c = CATEGORIES[incident.category];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← Назад к карте
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CategoryBadge category={incident.category} />
        <StatusBadge status={incident.status} />
        <SeverityBadge severity={incident.severity} />
        {priority && <PriorityBadge level={priority.level} score={priority.score} />}
      </div>

      <h1 className="mt-2 text-2xl font-semibold">{incident.title}</h1>
      <p className="mt-1 text-sm text-muted">
        {incident.district} район · создано {fmt(incident.createdAt)} · автор {incident.reporter}
      </p>

      {/* Фото */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {incident.photos.length > 0 ? (
          incident.photos.map((p, i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="" className="h-full w-full object-cover" />
            </div>
          ))
        ) : (
          <PhotoPlaceholder
            category={incident.category}
            className="col-span-3 aspect-[3/1] rounded-lg"
          />
        )}
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{incident.description}</p>

      {priority?.nearSensitive && (
        <div
          className="mt-4 rounded-lg border p-3 text-sm"
          style={{ borderColor: "#ef444455", backgroundColor: "#ef44440d" }}
        >
          ⚠️ Рядом ({priority.nearSensitive.distance} м):{" "}
          <span className="font-medium">{priority.nearSensitive.name}</span> — повышенный приоритет.
        </div>
      )}

      {/* Community verification */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-3xl font-bold text-brand">{incident.confirmations}</div>
          <div className="text-xs text-muted">подтверждений жителей</div>
          <button
            onClick={() => confirmIncident(incident.id)}
            className="mt-3 w-full rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-[var(--brand-fg)]"
          >
            👍 Проблема ещё актуальна
          </button>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-3xl font-bold" style={{ color: STATUS_META.resolved.color }}>
            {incident.resolvedVotes}
          </div>
          <div className="text-xs text-muted">отметок «уже решено»</div>
          <button
            onClick={() => voteResolved(incident.id)}
            className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm font-semibold"
          >
            ✅ Отметить как решённую
          </button>
        </div>
      </div>

      {/* Панель акимата */}
      {user.role === "akimat" && (
        <div className="mt-5 rounded-xl border border-brand/30 bg-brand/5 p-4">
          <div className="text-sm font-semibold text-brand">Панель акимата — сменить статус</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {AKIMAT_ACTIONS.map((a) => (
              <button
                key={a.status}
                onClick={() => setStatus(incident.id, a.status)}
                disabled={incident.status === a.status}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
                style={{ borderColor: STATUS_META[a.status].color, color: STATUS_META[a.status].color }}
              >
                {STATUS_META[a.status].icon} {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Карта */}
      <div className="mt-5 h-56 overflow-hidden rounded-xl border border-border">
        <MapView incidents={[incident]} center={[incident.lat, incident.lng]} zoom={15} />
      </div>

      {/* История статусов */}
      <div className="mt-5">
        <div className="text-sm font-semibold">История статусов</div>
        <ol className="mt-2 space-y-2">
          {incident.statusHistory.map((ev, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_META[ev.status].color }}
              />
              <div>
                <span className="font-medium">{STATUS_META[ev.status].label}</span>
                <span className="text-muted"> · {fmt(ev.at)}</span>
                {ev.note && <div className="text-muted">{ev.note}</div>}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 text-xs text-muted" style={{ color: c.color }}>
        ID: <span className="font-mono">{incident.id}</span>
      </div>
    </div>
  );
}
