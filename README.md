# PeakForm — AI Gym Tracker

Next.js 14 + TypeScript + Tailwind. On-device pose detection via MediaPipe Pose,
heuristic joint-angle analyzers, hysteresis rep counting, adaptive recommendations.

## Quickstart

```bash
npm.cmd install
npm.cmd run dev   # → http://localhost:3000
```

> Windows note: `npm.ps1` may be blocked by ExecutionPolicy — use `npm.cmd`.

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing |
| `/onboarding` | Age/height/weight/goal/level → localStorage |
| `/dashboard` | Stats, volume + form charts, plan, recommendations |
| `/tracker?ex=squat` | Live camera + skeleton overlay + cues + rep count |
| `/history` | Session log + calorie trend |
| `/recommendations` | Plan + ranked exercises with reasons |
| `/profile` | Body metrics, reset |
| `POST /api/analyze` | Backend swap point (`{exerciseId, landmarks}` → `AnalysisResult`) |

## Architecture

```
app/                  App Router pages + /api/analyze
components/
  ui.tsx              Card/Button/Badge/ProgressRing
  layout/             Header, BottomNav (mobile-first)
  tracker/            LiveTracker (camera + overlay + analyzer loop)
lib/
  pose/
    types.ts          Keypoint/PoseLandmarks/AnalysisResult contract
    angles.ts         calculateAngle, torsoLean, AngleSmoother
    analyzers.ts      squat/pushup/curl/plank/lunge rules ← swap with ML later
    PoseDetector.ts   MediaPipe wrapper + mock mode + drawOverlay
  workouts/
    repCounter.ts     hysteresis state machine (TOP→BOTTOM→MID→TOP)
    recommendations.ts pure (profile, performance) → ranked list
    calories.ts       MET-based burn, BMI, BMR
  data/catalog.ts     exercises, plans, SAMPLE_HISTORY
  store/AppContext.tsx  profile + history, persisted to localStorage
```

## Pose pipeline (per frame)

1. `PoseDetector` → 33 landmarks (or mock synth in test mode)
2. `analyzePose(exerciseId, lm)` → joint angles + `FormIssue[]` + score + cue
3. `AngleSmoother` (EMA α=0.35) → `RepCounter.update(angle, score)` → reps
4. UI: canvas overlay + cue cards + `ProgressRing` + save → history

## Backend integration

- Keep `AnalysisResult` shape; replace `analyzePoseRemote()` endpoint with your model.
- Auth/DB: persist `UserProfile` + `HistorySession` server-side; current store already serializes both.
- `POST /api/analyze` is the single seam — point the client at your GPU service.

## Production notes

- Camera requires HTTPS + user gesture (`Start camera` button).
- Pose libs load lazily, client-only — no SSR issues.
- Charts: recharts; icons: lucide-react. Dark mobile-first (`max-w-md` → expands on desktop).
