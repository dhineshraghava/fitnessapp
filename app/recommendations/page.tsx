"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApp } from "@/lib/store/AppContext";
import { Card, Badge, Button, SectionTitle } from "@/components/ui";
import { recommendWorkouts, recommendPlan } from "@/lib/workouts/recommendations";
import { EXERCISES } from "@/lib/data/catalog";

export default function RecommendationsPage() {
  const { state } = useApp();
  const perf = useMemo(
    () =>
      EXERCISES.map((e) => {
        const rows = state.history.filter((h) => h.exerciseId === e.id);
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
    [state.history]
  );
  const recs = useMemo(() => recommendWorkouts(state.profile, perf), [state.profile, perf]);
  const plan = recommendPlan(state.profile);

  return (
    <div className="pt-5 space-y-4">
      <SectionTitle title="Your plan" sub={state.profile ? `${state.profile.goal.replace("_", " ")} · ${state.profile.level} · ${state.profile.daysPerWeek}x/week` : "default plan — onboard to personalize"} />
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold">{plan.title}</h3>
          <Badge tone="green">{plan.level}</Badge>
        </div>
        <div className="mt-3 space-y-2">
          {plan.sessions.map((s) => (
            <div key={s.day} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
              <p className="font-bold">{s.day}</p>
              <p className="text-slate-400">{s.exerciseIds.join(" · ")} — {s.sets} × {s.reps}</p>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle title="Exercise ranking" sub="why each is suggested" />
      {recs.map((r, i) => (
        <Card key={r.exercise.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-500">#{i + 1} PRIORITY {r.priority}</p>
              <h3 className="font-extrabold">{r.exercise.name}</h3>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {r.tags.map((t) => <Badge key={t} tone="gray">{t}</Badge>)}
              </div>
              <p className="mt-2 text-sm text-slate-300">{r.reason}</p>
              <p className="mt-1 text-sm font-bold text-neon-green">{r.suggestedSets} sets × {r.suggestedReps} reps</p>
            </div>
          </div>
          <Link href={`/tracker?ex=${r.exercise.id}`}>
            <Button variant="ghost" className="mt-3 w-full">Train this</Button>
          </Link>
        </Card>
      ))}
    </div>
  );
}
