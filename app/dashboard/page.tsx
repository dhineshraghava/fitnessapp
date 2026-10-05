"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { Flame, Timer, Dumbbell, Target, Play } from "lucide-react";
import { useApp } from "@/lib/store/AppContext";
import { Card, Badge, ProgressRing, SectionTitle, Button } from "@/components/ui";
import { recommendWorkouts, recommendPlan } from "@/lib/workouts/recommendations";
import { formatDate } from "@/lib/utils";
import { EXERCISES } from "@/lib/data/catalog";

export default function DashboardPage() {
  const { state } = useApp();
  const { history, profile } = state;

  const stats = useMemo(() => {
    const totalReps = history.reduce((a, h) => a + h.reps, 0);
    const totalCal = Math.round(history.reduce((a, h) => a + h.calories, 0));
    const totalMin = Math.round(history.reduce((a, h) => a + h.durationSec, 0) / 60);
    const avgForm = history.length
      ? Math.round(history.reduce((a, h) => a + h.avgFormScore, 0) / history.length)
      : 0;
    const days = new Set(history.map((h) => h.date.slice(0, 10))).size;
    return { totalReps, totalCal, totalMin, avgForm, days };
  }, [history]);

  const volumeByDay = useMemo(() => {
    const map = new Map<string, number>();
    [...history].reverse().forEach((h) => {
      const k = formatDate(h.date);
      map.set(k, (map.get(k) ?? 0) + h.reps);
    });
    return [...map.entries()].slice(-7).map(([day, reps]) => ({ day, reps }));
  }, [history]);

  const formTrend = useMemo(
    () => [...history].reverse().slice(-8).map((h) => ({ day: formatDate(h.date), score: h.avgFormScore })),
    [history]
  );

  const perf = useMemo(
    () =>
      EXERCISES.map((e) => {
        const rows = history.filter((h) => h.exerciseId === e.id);
        if (!rows.length) return null;
        return {
          exerciseId: e.id,
          avgFormScore: rows.reduce((a, r) => a + r.avgFormScore, 0) / rows.length,
          totalReps: rows.reduce((a, r) => a + r.reps, 0),
          sessions: rows.length,
          lastVolume: rows[0].reps,
          trend: "up" as const,
        };
      }).filter(Boolean) as any[],
    [history]
  );

  const recs = useMemo(() => recommendWorkouts(profile, perf).slice(0, 3), [profile, perf]);
  const plan = recommendPlan(profile);

  return (
    <div className="pt-5 space-y-5">
      <div>
        <p className="text-sm text-slate-400">
          {profile?.name ? `Hey ${profile.name} —` : "Welcome back —"} ready to hit a PR?
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Today&apos;s <span className="text-gradient">overview</span>
        </h1>
      </div>

      {!profile && (
        <Card className="border-neon-green/30">
          <p className="text-sm"><b>Personalize PeakForm.</b> Add age, weight & goal for calorie + plan accuracy.</p>
          <Link href="/onboarding"><Button className="mt-3">Complete onboarding</Button></Link>
        </Card>
      )}

      {/* stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Dumbbell} label="Total reps" value={`${stats.totalReps}`} />
        <Stat icon={Flame} label="Calories" value={`${stats.totalCal}`} />
        <Stat icon={Timer} label="Minutes" value={`${stats.totalMin}`} />
        <Stat icon={Target} label="Avg form" value={`${stats.avgForm}`} />
      </div>

      <Card>
        <SectionTitle title={plan.title} sub={`${plan.daysPerWeek}x / week · ${profile?.goal?.replace("_", " ") ?? "general"}`} right={<Badge>{stats.days} active days</Badge>} />
        <div className="mt-3 space-y-2">
          {plan.sessions.slice(0, 3).map((s) => (
            <div key={s.day} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
              <span className="font-semibold">{s.day}</span>
              <span className="text-slate-400">{s.sets} × {s.reps}</span>
            </div>
          ))}
        </div>
        <Link href="/tracker">
          <Button className="mt-4 w-full"><Play className="mr-2 inline h-4 w-4" />Start live workout</Button>
        </Link>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <SectionTitle title="Volume" sub="reps per session" />
          <div className="h-44 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeByDay}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "#101828", border: "1px solid #ffffff22", borderRadius: 12 }} />
                <Bar dataKey="reps" fill="#22ff88" radius={[8, 8, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <SectionTitle title="Form score" sub="avg per session" />
          <div className="h-44 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formTrend}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip contentStyle={{ background: "#101828", border: "1px solid #ffffff22", borderRadius: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div>
        <SectionTitle title="Recommended today" sub="adaptive engine" right={<Link href="/recommendations" className="text-xs font-bold text-neon-green">View all →</Link>} />
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {recs.map((r) => (
            <Card key={r.exercise.id}>
              <div className="flex items-center justify-between">
                <Badge tone="cyan">{r.exercise.muscle}</Badge>
                <ProgressRing value={perf.find((p: any) => p.exerciseId === r.exercise.id)?.avgFormScore ?? 70} size={56} />
              </div>
              <h3 className="mt-2 font-extrabold">{r.exercise.name}</h3>
              <p className="mt-1 text-xs text-slate-400">{r.reason}</p>
              <p className="mt-2 text-sm font-bold text-neon-green">{r.suggestedSets} × {r.suggestedReps}</p>
              <Link href={`/tracker?ex=${r.exercise.id}`}>
                <Button variant="ghost" className="mt-3 w-full">Train now</Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      <FormDonut good={history.reduce((a, h) => a + h.goodReps, 0)} total={stats.totalReps} />
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="p-4">
      <Icon className="h-5 w-5 text-neon-green" />
      <div className="mt-2 text-2xl font-extrabold">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
    </Card>
  );
}

function FormDonut({ good, total }: { good: number; total: number }) {
  const bad = Math.max(total - good, 0);
  const data = [{ name: "Good", value: good }, { name: "Off-form", value: bad }];
  return (
    <Card className="flex items-center gap-4">
      <div className="h-28 w-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={32} outerRadius={48} paddingAngle={3} strokeWidth={0}>
              <Cell fill="#22ff88" />
              <Cell fill="#ffffff18" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="font-extrabold">Form quality</h3>
        <p className="text-sm text-slate-400">{total ? Math.round((good / total) * 100) : 0}% of reps with good form ({good}/{total}). Keep chasing green cues in the live tracker.</p>
      </div>
    </Card>
  );
}

export function CaloriesLine() { return null; }
