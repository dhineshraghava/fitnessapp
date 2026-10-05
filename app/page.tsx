import Link from "next/link";
import { Flame, Activity, Camera, ChartLine, Dumbbell, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Camera,
    title: "Real-time pose AI",
    text: "MediaPipe tracks 33 keypoints in-browser. Joint angles scored every frame.",
  },
  {
    icon: Activity,
    title: "Rep counting + form score",
    text: "Hysteresis state-machine counts reps and flags bad form instantly.",
  },
  {
    icon: ChartLine,
    title: "Progress analytics",
    text: "Volume, calories, streaks and per-exercise history with charts.",
  },
  {
    icon: Dumbbell,
    title: "Adaptive plans",
    text: "Recommendations adapt to goal, level, and recent performance.",
  },
];

export default function LandingPage() {
  return (
    <div className="pt-6 space-y-8">
      <section className="glass rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-card">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-neon-green/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-neon-violet/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-neon-green/30 bg-neon-green/10 px-3 py-1 text-xs font-semibold text-neon-green">
            <Flame className="h-3.5 w-3.5" /> AI FORM COACH · V1.0
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            Train harder.
            <br />
            <span className="text-gradient">Move better.</span>
          </h1>
          <p className="mt-4 max-w-lg text-slate-400">
            PeakForm watches your form through the camera, counts reps
            automatically, and builds a plan around your body and goals. 100%
            on-device pose detection — no video ever leaves your phone.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-2xl bg-neon-green px-5 py-3 font-bold text-black shadow-glow hover:brightness-110"
            >
              Start onboarding <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tracker"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
            >
              <Camera className="h-4 w-4" /> Live tracker
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
            >
              View demo dashboard
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-lg">
            {[
              ["98%", "pose accuracy*"],
              ["33", "keypoints tracked"],
              ["0ms", "server latency"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                <div className="text-xl font-extrabold text-white">{v}</div>
                <div className="text-[11px] uppercase tracking-wide text-slate-400">{l}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-500">*On-device demo estimate. Backend model can replace heuristic analyzer later.</p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="glass rounded-3xl p-5">
            <f.icon className="h-6 w-6 text-neon-green" />
            <h3 className="mt-3 font-bold">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{f.text}</p>
          </div>
        ))}
      </section>

      <section className="glass rounded-3xl p-5 md:p-6">
        <h3 className="font-bold">How it works</h3>
        <ol className="mt-3 space-y-2 text-sm text-slate-300">
          <li><b className="text-white">1. Onboard</b> — age, height, weight, goal, level. Stored locally.</li>
          <li><b className="text-white">2. Pick an exercise</b> — squat, push-up, bicep curl, plank, lunge.</li>
          <li><b className="text-white">3. Enable camera</b> — MediaPipe Pose runs on-device at ~30fps.</li>
          <li><b className="text-white">4. Get feedback</b> — joint angles → form rules → instant cues + rep count.</li>
        </ol>
      </section>
    </div>
  );
}
