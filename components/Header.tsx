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

export default function Header() {
  const pathname = usePathname();
  const { user, setRole, hydrated } = useStore();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-brand">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-[var(--brand-fg)]">
            🧠
          </span>
          <span className="hidden sm:inline">CityBrain&nbsp;KZ</span>
        </Link>

        <nav className="ml-2 flex items-center gap-1 text-sm">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-2.5 py-1.5 transition-colors ${
                  active
                    ? "bg-brand/10 font-medium text-brand"
                    : "text-muted hover:bg-black/5 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-0.5 text-xs">
            <button
              onClick={() => setRole("resident")}
              className={`rounded-md px-2 py-1 transition-colors ${
                hydrated && user.role === "resident"
                  ? "bg-brand text-[var(--brand-fg)]"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Житель
            </button>
            <button
              onClick={() => setRole("akimat")}
              className={`rounded-md px-2 py-1 transition-colors ${
                hydrated && user.role === "akimat"
                  ? "bg-brand text-[var(--brand-fg)]"
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
