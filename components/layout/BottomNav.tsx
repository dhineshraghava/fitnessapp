"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Camera, History, Sparkles, User } from "lucide-react";
import { cx } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/tracker", label: "Train", icon: Camera },
  { href: "/history", label: "History", icon: History },
  { href: "/recommendations", label: "Plans", icon: Sparkles },
  { href: "/profile", label: "You", icon: User },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-base-950/90 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5 md:max-w-3xl">
        {TABS.map((t) => {
          const active = path === t.href || (t.href !== "/dashboard" && path?.startsWith(t.href));
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cx(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
                active ? "text-neon-green" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <t.icon className="h-5 w-5" />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
