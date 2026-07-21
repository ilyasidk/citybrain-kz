import { CATEGORIES, SEVERITY_META, STATUS_META } from "@/lib/categories";
import { PRIORITY_META, type PriorityLevel } from "@/lib/priority";
import type { Category, Severity, Status } from "@/lib/types";

function DotPill({
  color,
  children,
  bold = false,
}: {
  color: string;
  children: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs ${bold ? "font-semibold" : "font-medium"}`}
      style={{ backgroundColor: `${color}14`, color }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}

export function CategoryBadge({ category }: { category: Category }) {
  const c = CATEGORIES[category];
  return <DotPill color={c.color}>{c.label}</DotPill>;
}

export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_META[status];
  return <DotPill color={s.color}>{s.label}</DotPill>;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const s = SEVERITY_META[severity];
  return <DotPill color={s.color}>{s.label}</DotPill>;
}

export function PriorityBadge({ level, score }: { level: PriorityLevel; score?: number }) {
  const p = PRIORITY_META[level];
  return (
    <DotPill color={p.color} bold>
      Приоритет: {p.label}
      {score != null && <span className="font-mono text-[10px] opacity-70">{score}</span>}
    </DotPill>
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
        background: `linear-gradient(135deg, ${c.color}1f, ${c.color}52)`,
      }}
    >
      <span className="text-4xl drop-shadow-sm" aria-hidden>
        {c.emoji}
      </span>
    </div>
  );
}
