import { NextRequest, NextResponse } from "next/server";
import { analyzePose } from "@/lib/pose/analyzers";
import type { ExerciseId, PoseLandmarks } from "@/lib/pose/types";

/**
 * POST /api/analyze — backend swap point.
 * Body: { exerciseId, landmarks }
 * Today: runs the same heuristic engine server-side.
 * Later: replace with hosted ML model, keep response shape.
 */
export async function POST(req: NextRequest) {
  try {
    const { exerciseId, landmarks } = (await req.json()) as {
      exerciseId: ExerciseId;
      landmarks: PoseLandmarks;
    };
    if (!exerciseId || !landmarks) {
      return NextResponse.json({ error: "exerciseId + landmarks required" }, { status: 400 });
    }
    const result = analyzePose(exerciseId, landmarks);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "analyze failed" }, { status: 500 });
  }
}
