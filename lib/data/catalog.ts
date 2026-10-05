import type { ExerciseId } from "@/lib/pose/types";

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  met: number;
  cues: string[];
  targetAngles: { joint: string; top: number; bottom: number };
  demoTip: string;
}

export const EXERCISES: Exercise[] = [
  {
    id: "squat",
    name: "Bodyweight Squat",
    muscle: "Quads · Glutes",
    equipment: "bodyweight",
    difficulty: "beginner",
    met: 5.0,
    cues: ["Chest up", "Knees over ankles", "Depth to ~90°", "Drive through heels"],
    targetAngles: { joint: "kneeAngle", top: 155, bottom: 105 },
    demoTip: "Stand facing camera, full body visible.",
  },
  {
    id: "pushup",
    name: "Push-Up",
    muscle: "Chest · Triceps",
    equipment: "bodyweight",
    difficulty: "intermediate",
    met: 8.0,
    cues: ["Flat back", "Hips in line", "Chest to fist-height", "Push floor away"],
    targetAngles: { joint: "elbowAngle", top: 150, bottom: 95 },
    demoTip: "Side view to camera works best.",
  },
  {
    id: "bicep_curl",
    name: "Bicep Curl",
    muscle: "Biceps",
    equipment: "dumbbell",
    difficulty: "beginner",
    met: 3.5,
    cues: ["Elbow pinned", "No swinging", "Squeeze at top", "2s lower"],
    targetAngles: { joint: "elbowAngle", top: 140, bottom: 65 },
    demoTip: "Show right arm side-on.",
  },
  {
    id: "plank",
    name: "Plank Hold",
    muscle: "Core",
    equipment: "bodyweight",
    difficulty: "beginner",
    met: 4.0,
    cues: ["Head–hips–heels line", "Squeeze glutes", "Breathe steady", "Don't pike hips"],
    targetAngles: { joint: "bodyLine", top: 190, bottom: 168 },
    demoTip: "Side profile, hold as long as form stays green.",
  },
  {
    id: "lunge",
    name: "Forward Lunge",
    muscle: "Quads · Glutes",
    equipment: "bodyweight",
    difficulty: "intermediate",
    met: 5.5,
    cues: ["Torso tall", "Front knee ~90°", "Step controlled", "Drive through heel"],
    targetAngles: { joint: "kneeAngle", top: 155, bottom: 110 },
    demoTip: "Side view, alternate legs each session.",
  },
];

export interface WorkoutPlan {
  id: string;
  title: string;
  goal: string;
  level: string;
  daysPerWeek: number;
  sessions: { day: string; exerciseIds: string[]; sets: number; reps: string }[];
}

export const PLANS: WorkoutPlan[] = [
  {
    id: "muscle-builder",
    title: "Muscle Builder · 4-day",
    goal: "build_muscle",
    level: "intermediate",
    daysPerWeek: 4,
    sessions: [
      { day: "Mon — Lower", exerciseIds: ["squat", "lunge"], sets: 4, reps: "10–12" },
      { day: "Tue — Push", exerciseIds: ["pushup", "plank"], sets: 4, reps: "8–12" },
      { day: "Thu — Legs+Arms", exerciseIds: ["squat", "bicep_curl"], sets: 4, reps: "10–12" },
      { day: "Sat — Full body", exerciseIds: ["lunge", "pushup", "plank"], sets: 3, reps: "10 / 30s" },
    ],
  },
  {
    id: "fat-burn",
    title: "Fat Burn · 3-day",
    goal: "lose_weight",
    level: "beginner",
    daysPerWeek: 3,
    sessions: [
      { day: "Mon", exerciseIds: ["squat", "plank"], sets: 3, reps: "12 / 30s" },
      { day: "Wed", exerciseIds: ["lunge", "pushup"], sets: 3, reps: "10 each" },
      { day: "Fri", exerciseIds: ["squat", "lunge", "plank"], sets: 3, reps: "circuit" },
    ],
  },
  {
    id: "general",
    title: "General Fitness · 3-day",
    goal: "general",
    level: "beginner",
    daysPerWeek: 3,
    sessions: [
      { day: "Mon", exerciseIds: ["squat", "pushup"], sets: 3, reps: "8–10" },
      { day: "Wed", exerciseIds: ["lunge", "plank"], sets: 3, reps: "10 / 30s" },
      { day: "Fri", exerciseIds: ["bicep_curl", "squat"], sets: 3, reps: "10–12" },
    ],
  },
];

export interface HistorySession {
  id: string;
  date: string; // ISO
  exerciseId: ExerciseId | string;
  exerciseName: string;
  sets: number;
  reps: number;
  goodReps: number;
  avgFormScore: number;
  calories: number;
  durationSec: number;
}

// 14 days of believable demo data
export const SAMPLE_HISTORY: HistorySession[] = [
  { id: "h1", date: daysAgo(13), exerciseId: "squat", exerciseName: "Bodyweight Squat", sets: 3, reps: 24, goodReps: 18, avgFormScore: 68, calories: 42, durationSec: 480 },
  { id: "h2", date: daysAgo(12), exerciseId: "pushup", exerciseName: "Push-Up", sets: 3, reps: 18, goodReps: 12, avgFormScore: 62, calories: 38, durationSec: 420 },
  { id: "h3", date: daysAgo(10), exerciseId: "squat", exerciseName: "Bodyweight Squat", sets: 3, reps: 27, goodReps: 22, avgFormScore: 74, calories: 46, durationSec: 500 },
  { id: "h4", date: daysAgo(9), exerciseId: "plank", exerciseName: "Plank Hold", sets: 3, reps: 3, goodReps: 3, avgFormScore: 80, calories: 30, durationSec: 360 },
  { id: "h5", date: daysAgo(7), exerciseId: "lunge", exerciseName: "Forward Lunge", sets: 3, reps: 20, goodReps: 16, avgFormScore: 71, calories: 44, durationSec: 460 },
  { id: "h6", date: daysAgo(6), exerciseId: "pushup", exerciseName: "Push-Up", sets: 4, reps: 26, goodReps: 21, avgFormScore: 76, calories: 52, durationSec: 540 },
  { id: "h7", date: daysAgo(4), exerciseId: "squat", exerciseName: "Bodyweight Squat", sets: 4, reps: 36, goodReps: 32, avgFormScore: 84, calories: 61, durationSec: 620 },
  { id: "h8", date: daysAgo(2), exerciseId: "bicep_curl", exerciseName: "Bicep Curl", sets: 3, reps: 30, goodReps: 27, avgFormScore: 88, calories: 35, durationSec: 480 },
  { id: "h9", date: daysAgo(1), exerciseId: "pushup", exerciseName: "Push-Up", sets: 4, reps: 32, goodReps: 29, avgFormScore: 86, calories: 58, durationSec: 560 },
  { id: "h10", date: daysAgo(0), exerciseId: "squat", exerciseName: "Bodyweight Squat", sets: 4, reps: 40, goodReps: 37, avgFormScore: 90, calories: 66, durationSec: 640 },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
