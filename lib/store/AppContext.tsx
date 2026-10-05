"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type { UserProfile } from "@/lib/workouts/recommendations";
import type { HistorySession } from "@/lib/data/catalog";
import { SAMPLE_HISTORY } from "@/lib/data/catalog";

export interface WorkoutSet {
  reps: number;
  goodReps: number;
  avgFormScore: number;
  calories: number;
  durationSec: number;
}

export interface ActiveSession {
  exerciseId: string;
  exerciseName: string;
  startedAt: number;
  sets: WorkoutSet[];
}

interface State {
  profile: UserProfile | null;
  onboarded: boolean;
  history: HistorySession[];
  active: ActiveSession | null;
  hydrated: boolean;
}

type Action =
  | { type: "HYDRATE"; state: Partial<State> }
  | { type: "SET_PROFILE"; profile: UserProfile }
  | { type: "LOG_SESSION"; session: HistorySession }
  | { type: "START_ACTIVE"; session: ActiveSession }
  | { type: "END_ACTIVE" }
  | { type: "CLEAR" };

const initial: State = {
  profile: null,
  onboarded: false,
  history: SAMPLE_HISTORY,
  active: null,
  hydrated: false,
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "HYDRATE":
      return { ...s, ...a.state, hydrated: true };
    case "SET_PROFILE":
      return { ...s, profile: a.profile, onboarded: true };
    case "LOG_SESSION":
      return { ...s, history: [a.session, ...s.history] };
    case "START_ACTIVE":
      return { ...s, active: a.session };
    case "END_ACTIVE":
      return { ...s, active: null };
    case "CLEAR":
      return { ...initial, hydrated: true, history: [] };
    default:
      return s;
  }
}

const Ctx = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

const KEY = "peakform:v1";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({
          type: "HYDRATE",
          state: {
            profile: parsed.profile ?? null,
            onboarded: !!parsed.profile,
            history: parsed.history?.length ? parsed.history : SAMPLE_HISTORY,
          },
        });
        return;
      }
    } catch {}
    dispatch({ type: "HYDRATE", state: {} });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ profile: state.profile, history: state.history.slice(0, 100) })
      );
    } catch {}
  }, [state.profile, state.history, state.hydrated]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}

export function useProfile() {
  return useApp().state.profile;
}
