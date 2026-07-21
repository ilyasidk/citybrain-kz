"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { BADGES, activityScore, computeUserStats } from "@/lib/gamification";
import IncidentCard from "@/components/IncidentCard";

export default function ProfilePage() {
  const { incidents, user, hydrated, confirmationsGiven, setName, reset } = useStore();

  const stats = useMemo(
    () => computeUserStats(user.name, incidents, confirmationsGiven),
    [user.name, incidents, confirmationsGiven],
  );
  const mine = useMemo(
    () =>
      incidents
        .filter((i) => i.reporter === user.name)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [incidents, user.name],
  );
  const score = activityScore(stats);

  if (!hydrated) {
    return <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted">Загрузка…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-brand font-display text-2xl font-semibold text-[var(--brand-fg)]">
          {user.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1">
          <input
            value={user.name}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-xs rounded-md border border-border bg-surface px-2 py-1 text-lg font-semibold outline-none focus:border-brand"
          />
          <div className="mt-1 text-sm text-muted">
            Роль: {user.role === "akimat" ? "Сотрудник акимата" : "Житель"} · Рейтинг активности:{" "}
            <span className="font-semibold text-brand">{score}</span>
          </div>
        </div>
      </div>

      {/* Метрики */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Обращений" value={stats.reported} />
        <Metric label="Подтверждено" value={stats.confirmed} />
        <Metric label="Решено" value={stats.resolved} />
        <Metric label="Подтвердил чужих" value={stats.confirmationsGiven} />
      </div>

      {/* Бейджи */}
      <h2 className="mt-7 text-sm font-semibold">Бейджи и достижения</h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {BADGES.map((b) => {
          const earned = b.earned(stats);
          return (
            <div
              key={b.key}
              className={`rounded-xl border p-3 ${
                earned ? "border-brand/40 bg-brand/5" : "border-border bg-surface opacity-60"
              }`}
            >
              <div className="text-2xl">{earned ? b.emoji : "🔒"}</div>
              <div className="mt-1 text-sm font-medium">{b.label}</div>
              <div className="text-xs text-muted">{b.description}</div>
            </div>
          );
        })}
      </div>

      {/* Мои обращения */}
      <h2 className="mt-7 text-sm font-semibold">Мои обращения ({mine.length})</h2>
      <div className="mt-2 flex flex-col gap-2">
        {mine.length === 0 ? (
          <p className="text-sm text-muted">
            Пока нет обращений. Смените имя на то, которым подавали, или создайте новое обращение.
          </p>
        ) : (
          mine.map((i) => <IncidentCard key={i.id} incident={i} />)
        )}
      </div>

      <button
        onClick={reset}
        className="mt-8 text-xs text-muted underline hover:text-red-600"
      >
        Сбросить демо-данные
      </button>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="font-display text-[22px] font-semibold leading-none text-brand">{value}</div>
      <div className="mt-1.5 text-[11px] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}
