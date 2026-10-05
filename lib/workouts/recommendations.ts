import { EXERCISES, PLANS } from "@/lib/data/catalog";
import type { Exercise } from "@/lib/data/catalog";
import type { ExerciseId } from "@/lib/pose/types";

export interface UserProfile {
  age: number;
  heightCm: number;
  weightKg: number;
  sex: "male" | "female" | "other";
  goal: "lose_weight" | "build_muscle" | "strength" | "endurance" | "general";
  level: "beginner" | "intermediate" | "advanced";
  daysPerWeek: number;
  equipment: string[];
  name?: string;
}

export interface PerformanceSummary {
  exerciseId: string;
  avgFormScore: number;
  totalReps: number;
  sessions: number;
  lastVolume: number; // sets*reps approx
  trend: "up" | "flat" | "down";
}

export interface Recommendation {
  exercise: Exercise;
  reason: string;
  suggestedSets: number;
  suggestedReps: number;
  priority: number; // higher = show first
  tags: string[];
}

const GOAL_MAP: Record<UserProfile["goal"], ExerciseId[]> = {
  build_muscle: ["squat", "pushup", "bicep_curl", "lunge"],
  lose_weight: ["squat", "lunge", "pushup", "plank"],
  strength: ["squat", "pushup", "lunge", "plank"],
  endurance: ["squat", "lunge", "plank", "pushup"],
  general: ["squat", "pushup", "plank", "bicep_curl"],
};

const LEVEL_VOLUME: Record<string, { sets: number; reps: number }> = {
  beginner: { sets: 3, reps: 8 },
  intermediate: { sets: 4, reps: 12 },
  advanced: { sets: 5, reps: 15 },
} as const;

/**
 * Pure, testable recommendation engine.
 * Backend can later replace/augment with an ML ranker — keep the same
 * (profile, performance) => Recommendation[] contract.
 */
export function recommendWorkouts(
  profile: UserProfile | null,
  performance: PerformanceSummary[] = []
): Recommendation[] {
  if (!profile) {
    return EXERCISES.slice(0, 4).map((e, i) => ({
      exercise: e,
      reason: "Popular starter exercise. Complete onboarding for personalization.",
      suggestedSets: 3,
      suggestedReps: 10,
      priority: 10 - i,
      tags: ["starter"],
    }));
  }

  const perfById = new Map(performance.map((p) => [p.exerciseId, p]));
  const preferred = GOAL_MAP[profile.goal];
  const base = LEVEL_VOLUME[profile.level];

  const recs: Recommendation[] = EXERCISES.map((ex) => {
    const perf = perfById.get(ex.id);
    let priority = 5;
    const tags: string[] = [];
    let { sets, reps } = base;
    let reason = `Matches your goal (${profile.goal.replace("_", " ")}) at ${profile.level} volume.`;

    if (preferred.includes(ex.id as ExerciseId)) {
      priority += 4;
      tags.push("goal-match");
    }
    if (ex.equipment === "bodyweight" || profile.equipment.includes(ex.equipment)) {
      priority += 1;
    } else {
      priority -= 3;
      tags.push("needs-equipment");
      reason = `Requires ${ex.equipment}. Substitute or skip if unavailable.`;
    }
    if (perf) {
      if (perf.avgFormScore < 65) {
        priority += 3;
        reps = Math.max(5, reps - 4);
        tags.push("form-focus");
        reason = `Form score ${Math.round(perf.avgFormScore)} — lower reps to rebuild technique.`;
      } else if (perf.trend === "up") {
        priority += 2;
        reps += 2;
        tags.push("progressing");
        reason = `Trending up (${perf.totalReps} reps logged) — progressive overload +2 reps.`;
      } else if (perf.sessions >= 4 && perf.avgFormScore > 85) {
        sets += 1;
        tags.push("overload");
        reason = `Mastered (score ${Math.round(perf.avgFormScore)}) — adding a set.`;
      }
    } else {
      priority += 1;
      tags.push("new");
      reason += " Not tried yet — great for variety.";
    }
    if (ex.id === "plank") {
      reps = Math.min(reps, 5);
    }
    return { exercise: ex, reason, suggestedSets: sets, suggestedReps: reps, priority, tags };
  });

  return recs.sort((a, b) => b.priority - a.priority);
}

export function recommendPlan(profile: UserProfile | null) {
  if (!profile) return PLANS[0];
  const byGoal = PLANS.find((p) => p.goal === profile.goal);
  return byGoal ?? PLANS[0];
}
