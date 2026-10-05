"use client";

import Link from "next/link";
import { useApp } from "@/lib/store/AppContext";
import { Card, Button, SectionTitle, Badge } from "@/components/ui";
import { bmi } from "@/lib/workouts/calories";

export default function ProfilePage() {
  const { state, dispatch } = useApp();
  const p = state.profile;

  return (
    <div className="pt-5 space-y-4">
      <SectionTitle title="Profile" sub="stored on-device (localStorage)" />
      {!p ? (
        <Card>
          <p className="text-sm text-slate-300">No profile yet.</p>
          <Link href="/onboarding"><Button className="mt-3">Set up profile</Button></Link>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold">{p.name || "Athlete"}</h3>
            <Badge>{p.level}</Badge>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <Row k="Goal" v={p.goal.replace("_", " ")} />
            <Row k="Age" v={`${p.age}`} />
            <Row k="Height" v={`${p.heightCm} cm`} />
            <Row k="Weight" v={`${p.weightKg} kg`} />
            <Row k="BMI" v={bmi(p.weightKg, p.heightCm).toFixed(1)} />
            <Row k="Days/week" v={`${p.daysPerWeek}`} />
          </dl>
          <div className="mt-4 flex gap-2">
            <Link href="/onboarding" className="flex-1"><Button variant="ghost" className="w-full">Edit</Button></Link>
            <Button variant="danger" onClick={() => { localStorage.removeItem("peakform:v1"); dispatch({ type: "CLEAR" }); }}>Reset</Button>
          </div>
        </Card>
      )}
      <Card>
        <h3 className="font-bold">Backend integration</h3>
        <p className="mt-1 text-sm text-slate-400">
          Swap points: <code className="text-neon-green">POST /api/analyze</code> (landmarks → scores),
          <code className="text-neon-green"> /api/plans</code>, <code className="text-neon-green"> /api/history</code>.
          Local heuristic engine in <code>lib/pose/analyzers.ts</code> keeps offline mode working.
        </p>
      </Card>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <dt className="text-[11px] uppercase tracking-wide text-slate-500">{k}</dt>
      <dd className="font-bold capitalize">{v}</dd>
    </div>
  );
}
