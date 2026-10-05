"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store/AppContext";
import type { UserProfile } from "@/lib/workouts/recommendations";
import { Card, Button, SectionTitle } from "@/components/ui";

const STEPS = ["Basics", "Body", "Goal"];

export default function OnboardingPage() {
  const { dispatch } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<UserProfile>({
    age: 25,
    heightCm: 175,
    weightKg: 70,
    sex: "male",
    goal: "build_muscle",
    level: "beginner",
    daysPerWeek: 3,
    equipment: ["bodyweight"],
    name: "",
  });

  function set<K extends keyof UserProfile>(k: K, v: UserProfile[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function finish() {
    dispatch({ type: "SET_PROFILE", profile: form });
    router.push("/dashboard");
  }

  return (
    <div className="pt-6 space-y-4">
      <SectionTitle title="Set up your profile" sub={`Step ${step + 1} of 3 — ${STEPS[step]}`} />
      <div className="flex gap-1.5">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-neon-green" : "bg-white/10"}`} />
        ))}
      </div>

      <Card>
        {step === 0 && (
          <div className="space-y-4">
            <Field label="Name (optional)">
              <input
                value={form.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Alex"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 outline-none focus:border-neon-green/50"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Age">
                <Num value={form.age} min={10} max={100} onChange={(v) => set("age", v)} />
              </Field>
              <Field label="Sex">
                <div className="flex gap-2">
                  {(["male", "female", "other"] as const).map((s) => (
                    <Chip key={s} active={form.sex === s} onClick={() => set("sex", s)}>{s}</Chip>
                  ))}
                </div>
              </Field>
            </div>
            <Field label="Experience level">
              <div className="flex gap-2">
                {(["beginner", "intermediate", "advanced"] as const).map((l) => (
                  <Chip key={l} active={form.level === l} onClick={() => set("level", l)}>{l}</Chip>
                ))}
              </div>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Height (cm)">
                <Num value={form.heightCm} min={130} max={230} onChange={(v) => set("heightCm", v)} />
              </Field>
              <Field label="Weight (kg)">
                <Num value={form.weightKg} min={30} max={250} onChange={(v) => set("weightKg", v)} />
              </Field>
            </div>
            <Field label="Days per week">
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map((d) => (
                  <Chip key={d} active={form.daysPerWeek === d} onClick={() => set("daysPerWeek", d)}>
                    {d}x
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label="Equipment">
              <div className="flex flex-wrap gap-2">
                {["bodyweight", "dumbbell", "barbell", "resistance-band", "pull-up-bar"].map((e) => (
                  <Chip
                    key={e}
                    active={form.equipment.includes(e)}
                    onClick={() =>
                      set(
                        "equipment",
                        form.equipment.includes(e)
                          ? form.equipment.filter((x) => x !== e)
                          : [...form.equipment, e]
                      )
                    }
                  >
                    {e}
                  </Chip>
                ))}
              </div>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">What&apos;s your primary goal?</p>
            {(
              [
                ["build_muscle", "Build muscle", "Hypertrophy-focused volume"],
                ["lose_weight", "Lose weight", "Circuit + higher burn"],
                ["strength", "Get stronger", "Lower reps, strict form"],
                ["endurance", "Endurance", "Higher reps, short rests"],
                ["general", "General fitness", "Balanced mix"],
              ] as const
            ).map(([v, t, d]) => (
              <button
                key={v}
                onClick={() => set("goal", v)}
                className={`w-full rounded-2xl border p-3 text-left ${
                  form.goal === v ? "border-neon-green/50 bg-neon-green/10" : "border-white/10 bg-white/5"
                }`}
              >
                <div className="font-bold">{t}</div>
                <div className="text-xs text-slate-400">{d}</div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-2">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>
          )}
          {step < 2 ? (
            <Button className="flex-1" onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button className="flex-1" onClick={finish}>Create my plan →</Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function Num({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 outline-none focus:border-neon-green/50"
    />
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm font-semibold capitalize ${
        active ? "border-neon-green/50 bg-neon-green/15 text-neon-green" : "border-white/10 bg-white/5 text-slate-300"
      }`}
    >
      {children}
    </button>
  );
}
