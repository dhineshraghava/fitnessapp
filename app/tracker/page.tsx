"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LiveTracker } from "@/components/tracker/LiveTracker";
import { SectionTitle } from "@/components/ui";
import { useApp } from "@/lib/store/AppContext";
import type { HistorySession } from "@/lib/data/catalog";
import type { ExerciseId } from "@/lib/pose/types";

function TrackerInner() {
  const params = useSearchParams();
  const { dispatch } = useApp();
  const ex = (params.get("ex") as ExerciseId) || "squat";

  useEffect(() => {
    const handler = (e: Event) => {
      const s = (e as CustomEvent).detail as HistorySession;
      dispatch({ type: "LOG_SESSION", session: s });
    };
    window.addEventListener("peakform:save-session", handler);
    return () => window.removeEventListener("peakform:save-session", handler);
  }, [dispatch]);

  return (
    <div className="pt-5">
      <SectionTitle title="Live workout" sub="on-device pose AI · nothing uploaded" />
      <div className="mt-3">
        <LiveTracker initialExercise={["squat","pushup","bicep_curl","plank","lunge"].includes(ex) ? ex : "squat"} />
      </div>
    </div>
  );
}

export default function TrackerPage() {
  return (
    <Suspense fallback={<div className="pt-10 text-center text-slate-400">Loading tracker…</div>}>
      <TrackerInner />
    </Suspense>
  );
}
