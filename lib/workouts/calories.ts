export function caloriesForExercise(
  met: number,
  weightKg: number,
  seconds: number
): number {
  return met * 3.5 * weightKg * (seconds / 60 / 200);
}

export const METS: Record<string, number> = {
  squat: 5.0,
  pushup: 8.0,
  bicep_curl: 3.5,
  plank: 4.0,
  lunge: 5.5,
  bench_press: 6.0,
  deadlift: 6.5,
  running: 9.8,
  cycling: 7.5,
  rest: 1.0,
};

export function estimateCaloriesBurned(
  exerciseId: string,
  weightKg: number,
  reps: number,
  secondsPerRep = 3
): number {
  const met = METS[exerciseId] ?? 5;
  return caloriesForExercise(met, weightKg, reps * secondsPerRep);
}

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function bmrMifflin(weightKg: number, heightCm: number, age: number, sex: "male" | "female" | "other"): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === "female") return base - 161;
  if (sex === "male") return base + 5;
  return base - 78; // average
}
