import Link from "next/link";
import { Flame } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-base-950/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-neon-green shadow-glow">
            <Flame className="h-5 w-5 text-black" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Peak<span className="text-neon-green">Form</span>
          </span>
        </Link>
        <Link
          href="/tracker"
          className="rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/10"
        >
          ● LIVE
        </Link>
      </div>
    </header>
  );
}
