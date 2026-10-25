"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PersonSwitcher } from "./PersonSwitcher";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/budget", label: "Budget" },
  { href: "/expenses", label: "Expenses" },
  { href: "/month-end", label: "Month-End" },
  { href: "/goals", label: "Goals" },
  { href: "/savings", label: "Savings" },
  { href: "/history", label: "History" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-amber-200 bg-white/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="font-semibold text-amber-900">
            🏡 Our Household
          </Link>
          <div className="sm:hidden">
            <PersonSwitcher />
          </div>
        </div>
        <nav className="flex flex-wrap gap-1 text-sm">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(`${l.href}/`));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 transition ${
                  active ? "bg-amber-600 text-white" : "text-amber-800 hover:bg-amber-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden sm:block">
          <PersonSwitcher />
        </div>
      </div>
    </header>
  );
}
