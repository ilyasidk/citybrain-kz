"use client";

import Link from "next/link";
import type { Incident } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import { CategoryBadge, PhotoPlaceholder, StatusBadge } from "./ui";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "сегодня";
  if (days === 1) return "вчера";
  if (days < 7) return `${days} дн. назад`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} нед. назад`;
  return `${Math.floor(days / 30)} мес. назад`;
}

export default function IncidentCard({ incident }: { incident: Incident }) {
  return (
    <Link
      href={`/incident/${incident.id}`}
      className="group relative flex shrink-0 gap-3 overflow-hidden rounded-xl border border-border bg-surface p-3 pl-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: CATEGORIES[incident.category].color }}
        aria-hidden
      />
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
        {incident.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={incident.photos[0]} alt="" className="h-full w-full object-cover" />
        ) : (
          <PhotoPlaceholder category={incident.category} className="h-full w-full" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <CategoryBadge category={incident.category} />
          <StatusBadge status={incident.status} />
        </div>
        <div className="mt-1 truncate text-sm font-medium text-foreground group-hover:text-brand">
          {incident.title}
        </div>
        <div className="mt-1 font-mono text-[10.5px] uppercase tracking-wide text-muted">
          {incident.district} · {timeAgo(incident.createdAt)} · 👍 {incident.confirmations}
        </div>
      </div>
    </Link>
  );
}
