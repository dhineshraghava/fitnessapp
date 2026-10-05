import type { Keypoint } from "./types";

/** Angle ABC (degrees) at vertex B. Returns null if points missing. */
export function calculateAngle(
  a: Keypoint | undefined,
  b: Keypoint | undefined,
  c: Keypoint | undefined
): number | null {
  if (!a || !b || !c) return null;
  if (
    (a.visibility ?? 1) < 0.3 ||
    (b.visibility ?? 1) < 0.3 ||
    (c.visibility ?? 1) < 0.3
  ) {
    return null;
  }
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.hypot(ab.x, ab.y);
  const magCB = Math.hypot(cb.x, cb.y);
  if (magAB === 0 || magCB === 0) return null;
  const cos = Math.min(1, Math.max(-1, dot / (magAB * magCB)));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Torso lean vs vertical (degrees). 0 = upright. */
export function torsoLean(
  shoulder: Keypoint | undefined,
  hip: Keypoint | undefined
): number | null {
  if (!shoulder || !hip) return null;
  const dx = shoulder.x - hip.x;
  const dy = shoulder.y - hip.y; // y grows downward in image space
  if (dy === 0) return 90;
  return (Math.atan2(Math.abs(dx), Math.abs(dy)) * 180) / Math.PI;
}

/** Horizontal alignment of two points (0 = level). */
export function horizontalDelta(
  a: Keypoint | undefined,
  b: Keypoint | undefined
): number | null {
  if (!a || !b) return null;
  return Math.abs(a.y - b.y);
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** EMA smoothing helper for noisy angle streams. */
export class AngleSmoother {
  private v: number | null = null;
  constructor(private alpha = 0.35) {}
  push(x: number | null): number | null {
    if (x == null) return this.v;
    this.v = this.v == null ? x : this.alpha * x + (1 - this.alpha) * this.v;
    return this.v;
  }
  reset() {
    this.v = null;
  }
}
