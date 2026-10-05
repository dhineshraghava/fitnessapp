"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ExerciseId, AnalysisResult, PoseLandmarks } from "@/lib/pose/types";
import { analyzePose } from "@/lib/pose/analyzers";
import { PoseDetector } from "@/lib/pose/PoseDetector";
import { AngleSmoother } from "@/lib/pose/angles";
import { RepCounter } from "@/lib/workouts/repCounter";
import { Badge, Button, Card, ProgressRing } from "@/components/ui";
import { estimateCaloriesBurned } from "@/lib/workouts/calories";
import { useApp } from "@/lib/store/AppContext";
import { uid } from "@/lib/utils";
import { EXERCISES } from "@/lib/data/catalog";

export function LiveTracker({ initialExercise = "squat" as ExerciseId }) {
  const { state } = useApp();
  const [exerciseId, setExerciseId] = useState<ExerciseId>(initialExercise);
  const [running, setRunning] = useState(false);
  const [mock, setMock] = useState(false);
  const [fps, setFps] = useState(0);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [reps, setReps] = useState({ totalReps: 0, goodReps: 0, badReps: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<PoseDetector | null>(null);
  const smootherRef = useRef(new AngleSmoother(0.35));
  const counterRef = useRef(new RepCounter(exerciseId));
  const timerRef = useRef<any>(null);
  const lastDrawRef = useRef(0);

  const exercise = useMemo(
    () => EXERCISES.find((e) => e.id === exerciseId)!,
    [exerciseId]
  );

  useEffect(() => {
    counterRef.current = new RepCounter(exerciseId);
    smootherRef.current.reset();
    setReps({ totalReps: 0, goodReps: 0, badReps: 0 });
    setAnalysis(null);
  }, [exerciseId]);

  useEffect(() => () => { stop(); }, []);

  async function start(useMock: boolean) {
    setError(null);
    setMock(useMock);
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    canvas.width = 640;
    canvas.height = 480;
    const det = new PoseDetector();
    detectorRef.current = det;
    const t0 = Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 1000);
    setRunning(true);
    try {
      await det.start(video, (lm: PoseLandmarks | null, f: number) => {
        setFps(f);
        const now = performance.now();
        // throttle overlay draw to ~20fps
        if (canvas && now - lastDrawRef.current > 50) {
          lastDrawRef.current = now;
          PoseDetector.drawOverlay(canvas, lm, useMock ? undefined : video);
        }
        if (!lm) return;
        const res = analyzePose(exerciseId, lm);
        const smooth = smootherRef.current.push(res.primaryAngle);
        const evt = counterRef.current.update(smooth, res.formScore);
        setAnalysis({ ...res, primaryAngle: smooth });
        setReps({ totalReps: evt.totalReps, goodReps: evt.goodReps, badReps: evt.badReps });
      }, { mock: useMock });
    } catch (e: any) {
      setError(e?.message ?? "Camera failed. Try mock mode or allow permissions.");
      setRunning(false);
    }
  }

  async function stop(save = false) {
    if (timerRef.current) clearInterval(timerRef.current);
    await detectorRef.current?.stop(videoRef.current ?? undefined);
    detectorRef.current = null;
    setRunning(false);
    if (save) saveSession();
  }

  function saveSession() {
    // dispatch logged in page wrapper via custom event to avoid circular import
    window.dispatchEvent(
      new CustomEvent("peakform:save-session", {
        detail: {
          id: uid("sess"),
          date: new Date().toISOString(),
          exerciseId,
          exerciseName: exercise.name,
          sets: 1,
          reps: reps.totalReps,
          goodReps: reps.goodReps,
          avgFormScore: analysis?.formScore ?? 75,
          calories: estimateCaloriesBurned(exerciseId, state.profile?.weightKg ?? 70, Math.max(reps.totalReps, 1)),
          durationSec: elapsed,
        },
      })
    );
  }

  const formTone =
    !analysis ? "gray" : analysis.formScore >= 80 ? "green" : analysis.formScore >= 60 ? "amber" : "red";

  return (
    <div className="space-y-4">
      {/* exercise picker */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {EXERCISES.map((e) => (
          <button
            key={e.id}
            disabled={running}
            onClick={() => setExerciseId(e.id as ExerciseId)}
            className={`shrink-0 rounded-2xl border px-4 py-2 text-sm font-bold ${
              e.id === exerciseId
                ? "border-neon-green/50 bg-neon-green/15 text-neon-green"
                : "border-white/10 bg-white/5 text-slate-300"
            }`}
          >
            {e.name}
          </button>
        ))}
      </div>

      <Card className="p-3">
        <div className="relative overflow-hidden rounded-2xl bg-black">
          <video ref={videoRef} playsInline muted className="hidden" />
          <canvas ref={canvasRef} className="h-auto w-full" width={640} height={480} />
          {!running && (
            <div className="absolute inset-0 grid place-items-center bg-black/60 p-6 text-center">
              <div>
                <p className="font-bold">{exercise.name}</p>
                <p className="mt-1 text-xs text-slate-400">{exercise.demoTip}</p>
                <p className="mt-2 text-[11px] text-slate-500">
                  Camera stays on-device. Use Mock mode to test without a camera.
                </p>
              </div>
            </div>
          )}
          {running && (
            <div className="absolute left-3 top-3 flex gap-2">
              <Badge tone="red">● REC</Badge>
              <Badge tone="gray">{mock ? "MOCK" : `${fps} FPS`}</Badge>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {!running ? (
            <>
              <Button onClick={() => start(false)}>Start camera</Button>
              <Button variant="ghost" onClick={() => start(true)}>Mock mode</Button>
            </>
          ) : (
            <>
              <Button variant="danger" onClick={() => stop(false)}>Stop</Button>
              <Button variant="ghost" onClick={() => stop(true)}>Stop + save</Button>
            </>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      </Card>

      {/* live stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <div className="text-3xl font-extrabold">{reps.totalReps}</div>
          <div className="text-[11px] uppercase tracking-wide text-slate-400">reps</div>
          <div className="mt-1 text-[11px] text-slate-500">✓ {reps.goodReps} · ✗ {reps.badReps}</div>
        </Card>
        <Card className="grid place-items-center">
          <ProgressRing value={analysis?.formScore ?? 0} label="form" />
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-extrabold">{elapsed}s</div>
          <div className="text-[11px] uppercase tracking-wide text-slate-400">time</div>
          <div className="mt-1 text-[11px] text-slate-500">
            {analysis?.primaryAngle != null ? `${Math.round(analysis.primaryAngle)}°` : "—"}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <span className="font-bold">Live feedback</span>
          {analysis && <Badge tone={formTone as any}>{analysis.formScore} / 100</Badge>}
        </div>
        <p className="mt-2 text-lg font-bold leading-snug">
          {analysis ? analysis.cue : "Start a session to get cues…"}
        </p>
        <div className="mt-2 space-y-1.5">
          {(analysis?.feedback ?? []).map((f) => (
            <div
              key={f.code}
              className={`rounded-xl border px-3 py-2 text-sm ${
                f.severity === "critical"
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : f.severity === "warn"
                  ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
                  : "border-white/10 bg-white/5 text-slate-300"
              }`}
            >
              {f.message}
            </div>
          ))}
          {analysis && analysis.feedback.length === 0 && (
            <div className="rounded-xl border border-neon-green/30 bg-neon-green/10 px-3 py-2 text-sm text-neon-green">
              Perfect form — keep going!
            </div>
          )}
        </div>
        {analysis && (
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
            {Object.entries(analysis.angles).map(([k, v]) => (
              <span key={k} className="rounded-lg bg-white/5 border border-white/10 px-2 py-1">
                {k}: {v == null ? "—" : `${Math.round(v)}°`}
              </span>
            ))}
            <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-1">
              phase: {analysis.phase}
            </span>
          </div>
        )}
      </Card>

      <Card>
        <p className="font-bold">Cues for {exercise.name}</p>
        <ul className="mt-2 grid gap-1.5 text-sm text-slate-300">
          {exercise.cues.map((c) => (
            <li key={c} className="flex gap-2"><span className="text-neon-green">▸</span>{c}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
