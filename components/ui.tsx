import { CATEGORIES, SEVERITY_META, STATUS_META } from "@/lib/categories";
import { PRIORITY_META, type PriorityLevel } from "@/lib/priority";
import type { Category, Severity, Status } from "@/lib/types";

export function CategoryBadge({ category }: { category: Category }) {
  const c = CATEGORIES[category];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${c.color}1a`, color: c.color }}
    >
      <span aria-hidden>{c.emoji}</span>
      {c.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${s.color}1a`, color: s.color }}
    >
      <span aria-hidden>{s.icon}</span>
      {s.label}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const s = SEVERITY_META[severity];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${s.color}1a`, color: s.color }}
    >
      {s.label}
    </span>
  );
}

export function PriorityBadge({ level, score }: { level: PriorityLevel; score?: number }) {
  const p = PRIORITY_META[level];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: `${p.color}22`, color: p.color }}
    >
      Приоритет: {p.label}
      {score != null && <span className="opacity-70">({score})</span>}
    </span>
  );
}

export function PhotoPlaceholder({
  category,
  className = "",
}: {
  category: Category;
  className?: string;
}) {
  const c = CATEGORIES[category];
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{
        background: `linear-gradient(135deg, ${c.color}22, ${c.color}55)`,
      }}
    >
      <span className="text-4xl drop-shadow-sm" aria-hidden>
        {c.emoji}
      </span>
    </div>
  );
}
