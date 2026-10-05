// ─── PeakForm pose types ─────────────────────────────────────────────
// MediaPipe Pose returns 33 landmarks. We normalize to this shape so the
// heuristic analyzers AND a future backend ML model share one contract.

export interface Keypoint {
  x: number; // 0..1 normalized
  y: number;
  z?: number;
  visibility?: number;
}

export type PoseLandmarks = Keypoint[]; // length 33

export type ExerciseId =
  | "squat"
  | "pushup"
  | "bicep_curl"
  | "plank"
  | "lunge";

export interface JointAngles {
  [joint: string]: number | null; // degrees, null = low visibility
}

export type RepPhase = "up" | "down" | "hold" | "transition" | "unknown";

export interface FormIssue {
  code: string;
  message: string;
  severity: "info" | "warn" | "critical";
  joint?: string;
}

export interface AnalysisResult {
  exerciseId: ExerciseId;
  angles: JointAngles;
  phase: RepPhase;
  feedback: FormIssue[];
  isGoodForm: boolean;
  formScore: number; // 0..100
  primaryAngle: number | null;
  cue: string; // single headline cue for UI
}

// BlazePose landmark indices (MediaPipe Pose)
export const LM = {
  nose: 0,
  leftEyeInner: 1,
  leftEye: 2,
  leftEyeOuter: 3,
  rightEyeInner: 4,
  rightEye: 5,
  rightEyeOuter: 6,
  leftEar: 7,
  rightEar: 8,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
} as const;
