"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/", label: "Карта" },
  { href: "/report", label: "Сообщить" },
  { href: "/profile", label: "Профиль" },
  { href: "/admin", label: "Акимат" },
];

/* Городская сетка узлов; один «загоревшийся» узел — инцидент на карте. */
function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="8" fill="var(--ink)" />
      {[7, 14, 21].flatMap((y) =>
        [7, 14, 21].map((x) =>
          x === 14 && y === 14 ? null : (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#ffffff" opacity="0.7" />
          ),
        ),
      )}
      <circle cx="14" cy="14" r="3.2" fill="var(--sun)" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { user, setRole, hydrated } = useStore();

  return (
    <header className="sticky top-0 z-30">
      <div className="stripe h-1.5" aria-hidden="true" />
      <div className="border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <LogoMark />
            <span className="hidden items-center gap-1.5 font-display text-[13px] font-semibold tracking-tight sm:flex">
              CityBrain
              <span className="rounded bg-sun px-1 py-px font-display text-[9px] font-bold text-ink">
                KZ
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-[13px]">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 transition-colors ${
                    active
                      ? "bg-ink font-medium text-white"
                      : "text-muted hover:bg-black/5 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 rounded-full border border-border bg-background p-0.5 text-xs">
            <button
              onClick={() => setRole("resident")}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                hydrated && user.role === "resident"
                  ? "bg-brand font-medium text-[var(--brand-fg)]"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Житель
            </button>
            <button
              onClick={() => setRole("akimat")}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                hydrated && user.role === "akimat"
                  ? "bg-brand font-medium text-[var(--brand-fg)]"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Акимат
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
