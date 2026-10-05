// Generic hysteresis rep counter. Counts a rep when the primary joint angle
// travels from the "extended" zone to the "contracted" zone and back.
// Thresholds are per-exercise and tunable.

import type { ExerciseId } from "@/lib/pose/types";

export interface RepThresholds {
  top: number; // extended angle (e.g. standing squat ~160)
  bottom: number; // contracted angle (e.g. deep squat ~95)
  minFormScore: number; // reps below this still count but flagged bad
}

export const REP_THRESHOLDS: Record<ExerciseId, RepThresholds> = {
  squat: { top: 155, bottom: 105, minFormScore: 55 },
  pushup: { top: 150, bottom: 95, minFormScore: 55 },
  bicep_curl: { top: 140, bottom: 65, minFormScore: 55 },
  lunge: { top: 155, bottom: 110, minFormScore: 55 },
  plank: { top: 999, bottom: -999, minFormScore: 60 }, // time-based, not reps
};

type State = "TOP" | "BOTTOM" | "MID";

export interface RepEvent {
  totalReps: number;
  goodReps: number;
  badReps: number;
  counted: boolean;
}

export class RepCounter {
  private state: State = "TOP";
  private reps = 0;
  private good = 0;
  private bad = 0;
  private bottomScoreSum = 0;
  private bottomFrames = 0;

  constructor(private exerciseId: ExerciseId) {}

  get thresholds() {
    return REP_THRESHOLDS[this.exerciseId];
  }

  reset() {
    this.state = "TOP";
    this.reps = 0;
    this.good = 0;
    this.bad = 0;
    this.bottomScoreSum = 0;
    this.bottomFrames = 0;
  }

  /** Feed one smoothed primary angle + form score per frame. */
  update(angle: number | null, formScore: number): RepEvent {
    if (angle == null) return { totalReps: this.reps, goodReps: this.good, badReps: this.bad, counted: false };
    const { top, bottom, minFormScore } = this.thresholds;
    if (this.exerciseId === "plank") return { totalReps: this.reps, goodReps: this.good, badReps: this.bad, counted: false };

    if (this.state === "TOP" && angle < bottom) {
      this.state = "BOTTOM";
      this.bottomScoreSum = formScore;
      this.bottomFrames = 1;
    } else if (this.state === "BOTTOM") {
      this.bottomScoreSum += formScore;
      this.bottomFrames += 1;
      if (angle > bottom + 12) this.state = "MID";
    } else if (this.state === "MID") {
      if (angle < bottom) this.state = "BOTTOM";
      else if (angle > top) {
        this.state = "TOP";
        this.reps += 1;
        const avg = this.bottomFrames ? this.bottomScoreSum / this.bottomFrames : formScore;
        if (avg >= minFormScore) this.good += 1;
        else this.bad += 1;
        this.bottomScoreSum = 0;
        this.bottomFrames = 0;
        return { totalReps: this.reps, goodReps: this.good, badReps: this.bad, counted: true };
      }
    } else {
      // MID init tolerance
      if (angle > top) this.state = "TOP";
      else if (angle < bottom) this.state = "BOTTOM";
    }
    return { totalReps: this.reps, goodReps: this.good, badReps: this.bad, counted: false };
  }

  snapshot() {
    return { totalReps: this.reps, goodReps: this.good, badReps: this.bad };
  }
}
