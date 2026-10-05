import { calculateAngle, torsoLean, horizontalDelta, clamp } from "./angles";
import { LM } from "./types";
import type {
  AnalysisResult,
  ExerciseId,
  FormIssue,
  PoseLandmarks,
} from "./types";

function scoreFromIssues(issues: FormIssue[]): number {
  let s = 100;
  for (const i of issues) {
    if (i.severity === "critical") s -= 25;
    else if (i.severity === "warn") s -= 12;
    else s -= 4;
  }
  return clamp(Math.round(s), 0, 100);
}

function headline(feedback: FormIssue[], good: string): string {
  const crit = feedback.find((f) => f.severity === "critical");
  if (crit) return crit.message;
  const warn = feedback.find((f) => f.severity === "warn");
  if (warn) return warn.message;
  return good;
}

// ─── Squat: knee angle (hip-knee-ankle), target bottom < 100°, top > 160° ───
export function analyzeSquat(lm: PoseLandmarks): AnalysisResult {
  const lk = calculateAngle(lm[LM.leftHip], lm[LM.leftKnee], lm[LM.leftAnkle]);
  const rk = calculateAngle(lm[LM.rightHip], lm[LM.rightKnee], lm[LM.rightAnkle]);
  const knee = lk != null && rk != null ? (lk + rk) / 2 : lk ?? rk;
  const hip = calculateAngle(lm[LM.leftShoulder], lm[LM.leftHip], lm[LM.leftKnee]);
  const lean = torsoLean(lm[LM.leftShoulder], lm[LM.leftHip]);
  const fb: FormIssue[] = [];

  if (knee == null) {
    fb.push({ code: "NO_POSE", message: "Step back — full body not visible", severity: "warn" });
  } else {
    if (knee < 70) fb.push({ code: "TOO_DEEP", message: "Too deep — stop at ~90° knee bend", severity: "warn", joint: "knee" });
    if ((lean ?? 0) > 35) fb.push({ code: "LEAN", message: "Chest up — lean less forward", severity: "warn", joint: "torso" });
    const kneeOverToe = (lm[LM.leftKnee]?.x ?? 0) - (lm[LM.leftAnkle]?.x ?? 0);
    if (Math.abs(kneeOverToe) > 0.12 && knee < 120)
      fb.push({ code: "KNEE_TRACK", message: "Keep knees stacked over ankles", severity: "info", joint: "knee" });
    if (hip != null && hip < 60 && knee > 130)
      fb.push({ code: "HINGE", message: "Bend knees more to reach depth", severity: "info" });
  }

  const phase = knee == null ? "unknown" : knee < 110 ? "down" : knee > 155 ? "up" : "transition";
  const isGoodForm = fb.filter((f) => f.severity !== "info").length === 0;
  return {
    exerciseId: "squat",
    angles: { kneeAngle: knee, hipAngle: hip, torsoLean: lean },
    phase,
    feedback: fb,
    isGoodForm,
    formScore: scoreFromIssues(fb),
    primaryAngle: knee,
    cue: headline(fb, phase === "down" ? "Good depth — drive up!" : "Stand tall, brace core"),
  };
}

// ─── Push-up: elbow angle (shoulder-elbow-wrist) ───
export function analyzePushup(lm: PoseLandmarks): AnalysisResult {
  const le = calculateAngle(lm[LM.leftShoulder], lm[LM.leftElbow], lm[LM.leftWrist]);
  const re = calculateAngle(lm[LM.rightShoulder], lm[LM.rightElbow], lm[LM.rightWrist]);
  const elbow = le != null && re != null ? (le + re) / 2 : le ?? re;
  const hipDrop = horizontalDelta(lm[LM.leftShoulder], lm[LM.leftHip]);
  const bodyLine = calculateAngle(lm[LM.leftShoulder], lm[LM.leftHip], lm[LM.leftAnkle]);
  const fb: FormIssue[] = [];

  if (elbow == null) {
    fb.push({ code: "NO_POSE", message: "Move sideways to camera for push-ups", severity: "warn" });
  } else {
    if (bodyLine != null && bodyLine < 150)
      fb.push({ code: "HIPS", message: "Hips sagging — squeeze glutes, flat back", severity: "critical" });
    if (elbow < 55)
      fb.push({ code: "TOO_LOW", message: "Chest nearly touching — push up!", severity: "info" });
    if (hipDrop != null && hipDrop > 0.18)
      fb.push({ code: "ALIGN", message: "Keep head–hips–heels in one line", severity: "warn" });
  }

  const phase = elbow == null ? "unknown" : elbow < 100 ? "down" : elbow > 150 ? "up" : "transition";
  const isGoodForm = fb.filter((f) => f.severity !== "info").length === 0;
  return {
    exerciseId: "pushup",
    angles: { elbowAngle: elbow, bodyLine },
    phase,
    feedback: fb,
    isGoodForm,
    formScore: scoreFromIssues(fb),
    primaryAngle: elbow,
    cue: headline(fb, phase === "down" ? "Push the floor away!" : "Lower with control"),
  };
}

// ─── Bicep curl: elbow angle, shoulder should stay fixed ───
export function analyzeBicepCurl(lm: PoseLandmarks): AnalysisResult {
  const elbow = calculateAngle(lm[LM.rightShoulder], lm[LM.rightElbow], lm[LM.rightWrist]);
  const shoulderDrift = horizontalDelta(lm[LM.rightShoulder], lm[LM.rightElbow]);
  const fb: FormIssue[] = [];
  if (elbow == null) {
    fb.push({ code: "NO_POSE", message: "Show your right arm side-on", severity: "warn" });
  } else {
    if ((shoulderDrift ?? 0) > 0.12)
      fb.push({ code: "ELBOW_FLARE", message: "Pin elbow to your side", severity: "warn", joint: "elbow" });
    if (elbow < 30)
      fb.push({ code: "OVER_CURL", message: "Don't swing past full contraction", severity: "info" });
  }
  const phase = elbow == null ? "unknown" : elbow < 70 ? "up" : elbow > 140 ? "down" : "transition";
  const isGoodForm = fb.filter((f) => f.severity !== "info").length === 0;
  return {
    exerciseId: "bicep_curl",
    angles: { elbowAngle: elbow },
    phase,
    feedback: fb,
    isGoodForm,
    formScore: scoreFromIssues(fb),
    primaryAngle: elbow,
    cue: headline(fb, phase === "up" ? "Squeeze at the top!" : "Lower slowly — 2 seconds"),
  };
}

// ─── Plank: body line should stay ~180° ───
export function analyzePlank(lm: PoseLandmarks): AnalysisResult {
  const bodyLine = calculateAngle(lm[LM.leftShoulder], lm[LM.leftHip], lm[LM.leftAnkle]);
  const lean = torsoLean(lm[LM.leftShoulder], lm[LM.leftHip]);
  const fb: FormIssue[] = [];
  if (bodyLine == null) {
    fb.push({ code: "NO_POSE", message: "Show full side profile for plank", severity: "warn" });
  } else {
    if (bodyLine < 155)
      fb.push({ code: "HIPS_LOW", message: "Lift hips — flat line head to heels", severity: "critical" });
    else if (bodyLine < 168)
      fb.push({ code: "HIPS_SOFT", message: "Hips dropping slightly — brace harder", severity: "warn" });
    if (bodyLine > 192)
      fb.push({ code: "HIPS_HIGH", message: "Lower hips — don't pike up", severity: "warn" });
  }
  const isGoodForm = fb.length === 0;
  return {
    exerciseId: "plank",
    angles: { bodyLine, torsoLean: lean },
    phase: "hold",
    feedback: fb,
    isGoodForm,
    formScore: scoreFromIssues(fb),
    primaryAngle: bodyLine,
    cue: headline(fb, "Solid plank — breathe steady"),
  };
}

// ─── Lunge: front knee ~90° at bottom ───
export function analyzeLunge(lm: PoseLandmarks): AnalysisResult {
  const knee = calculateAngle(lm[LM.leftHip], lm[LM.leftKnee], lm[LM.leftAnkle]);
  const lean = torsoLean(lm[LM.leftShoulder], lm[LM.leftHip]);
  const fb: FormIssue[] = [];
  if (knee == null) {
    fb.push({ code: "NO_POSE", message: "Show full side profile for lunges", severity: "warn" });
  } else {
    if ((lean ?? 0) > 25)
      fb.push({ code: "LEAN", message: "Torso tall — don't lean forward", severity: "warn" });
    if (knee < 65)
      fb.push({ code: "OVER_STRIDE", message: "Shorten stance slightly", severity: "info" });
  }
  const phase = knee == null ? "unknown" : knee < 115 ? "down" : knee > 155 ? "up" : "transition";
  const isGoodForm = fb.filter((f) => f.severity !== "info").length === 0;
  return {
    exerciseId: "lunge",
    angles: { kneeAngle: knee, torsoLean: lean },
    phase,
    feedback: fb,
    isGoodForm,
    formScore: scoreFromIssues(fb),
    primaryAngle: knee,
    cue: headline(fb, phase === "down" ? "Drive through front heel!" : "Step controlled, chest tall"),
  };
}

export const ANALYZERS: Record<ExerciseId, (lm: PoseLandmarks) => AnalysisResult> = {
  squat: analyzeSquat,
  pushup: analyzePushup,
  bicep_curl: analyzeBicepCurl,
  plank: analyzePlank,
  lunge: analyzeLunge,
};

export function analyzePose(exerciseId: ExerciseId, lm: PoseLandmarks): AnalysisResult {
  return ANALYZERS[exerciseId](lm);
}

/**
 * Backend swap point: POST landmarks to /api/analyze and return the same
 * AnalysisResult shape. Keep heuristic fallback for offline use.
 */
export async function analyzePoseRemote(
  exerciseId: ExerciseId,
  lm: PoseLandmarks,
  endpoint = "/api/analyze"
): Promise<AnalysisResult> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId, landmarks: lm }),
    });
    if (!res.ok) throw new Error("remote failed");
    return (await res.json()) as AnalysisResult;
  } catch {
    return analyzePose(exerciseId, lm);
  }
}
