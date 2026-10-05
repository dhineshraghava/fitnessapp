import { cx } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("glass rounded-3xl p-5 shadow-card", className)}>
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  className,
  type,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const styles =
    variant === "primary"
      ? "bg-neon-green text-black font-bold shadow-glow hover:brightness-110 disabled:opacity-40"
      : variant === "danger"
      ? "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25"
      : "border border-white/15 bg-white/5 hover:bg-white/10 font-semibold";
  return (
    <button
      type={type ?? "button"}
      disabled={disabled}
      onClick={onClick}
      className={cx("rounded-2xl px-5 py-3 text-sm transition", styles, className)}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "red" | "amber" | "gray" | "cyan" }) {
  const map = {
    green: "border-neon-green/30 bg-neon-green/10 text-neon-green",
    red: "border-red-500/30 bg-red-500/10 text-red-300",
    amber: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    cyan: "border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan",
    gray: "border-white/15 bg-white/5 text-slate-300",
  };
  return (
    <span className={cx("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", map[tone])}>
      {children}
    </span>
  );
}

export function ProgressRing({
  value,
  size = 84,
  label,
}: {
  value: number; // 0..100
  size?: number;
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <div className="ring-conic absolute inset-0 rounded-full" style={{ ["--p" as any]: `${v}%` }} />
      <div className="absolute rounded-full bg-base-900" style={{ inset: 7 }} />
      <div className="relative text-center">
        <div className="text-lg font-extrabold leading-none">{Math.round(v)}</div>
        {label && <div className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">{label}</div>}
      </div>
    </div>
  );
}

export function SectionTitle({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
        {sub && <p className="text-sm text-slate-400">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
