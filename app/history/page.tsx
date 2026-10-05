"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "@/lib/store/AppContext";
import { Card, Badge, SectionTitle } from "@/components/ui";
import { formatDate, formatDuration } from "@/lib/utils";

export default function HistoryPage() {
  const { state } = useApp();
  const trend = useMemo(
    () => [...state.history].reverse().map((h) => ({ day: formatDate(h.date), cal: h.calories, form: h.avgFormScore })),
    [state.history]
  );

  return (
    <div className="pt-5 space-y-4">
      <SectionTitle title="Exercise history" sub={`${state.history.length} sessions logged`} />
      <Card>
        <p className="text-sm font-bold">Calories per session</p>
        <div className="h-40 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "#101828", border: "1px solid #ffffff22", borderRadius: 12 }} />
              <Line type="monotone" dataKey="cal" stroke="#22ff88" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="form" stroke="#22d3ee" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div className="space-y-2">
        {state.history.map((h) => (
          <Card key={h.id} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-bold">{h.exerciseName}</p>
                <p className="text-xs text-slate-400">
                  {formatDate(h.date)} · {h.sets} set{h.sets > 1 ? "s" : ""} · {formatDuration(h.durationSec)}
                </p>
              </div>
              <Badge tone={h.avgFormScore >= 80 ? "green" : h.avgFormScore >= 65 ? "amber" : "red"}>
                {Math.round(h.avgFormScore)}
              </Badge>
            </div>
            <div className="mt-2 flex gap-4 text-sm">
              <span><b>{h.reps}</b> <span className="text-slate-400">reps</span></span>
              <span><b className="text-neon-green">{h.goodReps}</b> <span className="text-slate-400">good</span></span>
              <span><b>{Math.round(h.calories)}</b> <span className="text-slate-400">kcal</span></span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
