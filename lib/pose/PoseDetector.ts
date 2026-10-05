// On-device MediaPipe Pose wrapper.
// - Loads @mediapipe/pose lazily (client-only)
// - drawSkeleton() helper using drawing_utils
// - Mock mode generates synthetic squat landmarks for testing without camera

import type { PoseLandmarks } from "./types";
import { LM } from "./types";

export type PoseCallback = (lm: PoseLandmarks | null, fps: number) => void;

function synthSquatLandmarks(t: number): PoseLandmarks {
  // Simulate a squat cycle: knee angle oscillates.
  const phase = (Math.sin(t / 900) + 1) / 2; // 0..1
  const lm: PoseLandmarks = Array.from({ length: 33 }, () => ({
    x: 0.5, y: 0.5, z: 0, visibility: 0.95,
  }));
  const depth = phase; // 0 top → 1 bottom
  lm[LM.leftShoulder] = { x: 0.5, y: 0.25 + depth * 0.12, z: 0, visibility: 0.98 };
  lm[LM.rightShoulder] = { x: 0.55, y: 0.25 + depth * 0.12, z: 0, visibility: 0.98 };
  lm[LM.leftHip] = { x: 0.5, y: 0.5 + depth * 0.08, z: 0, visibility: 0.98 };
  lm[LM.rightHip] = { x: 0.55, y: 0.5 + depth * 0.08, z: 0, visibility: 0.98 };
  lm[LM.leftKnee] = { x: 0.5 + depth * 0.06, y: 0.68, z: 0, visibility: 0.98 };
  lm[LM.rightKnee] = { x: 0.55 + depth * 0.06, y: 0.68, z: 0, visibility: 0.98 };
  lm[LM.leftAnkle] = { x: 0.5, y: 0.88, z: 0, visibility: 0.98 };
  lm[LM.rightAnkle] = { x: 0.55, y: 0.88, z: 0, visibility: 0.98 };
  lm[LM.leftElbow] = { x: 0.42, y: 0.4, z: 0, visibility: 0.9 };
  lm[LM.rightElbow] = { x: 0.62, y: 0.4, z: 0, visibility: 0.9 };
  lm[LM.leftWrist] = { x: 0.4, y: 0.55, z: 0, visibility: 0.9 };
  lm[LM.rightWrist] = { x: 0.64, y: 0.55, z: 0, visibility: 0.9 };
  return lm;
}

export class PoseDetector {
  private pose: any = null;
  private camera: any = null;
  private raf = 0;
  private lastT = 0;
  private frames = 0;
  private fps = 0;
  private mockTimer: any = null;
  private stream: MediaStream | null = null;

  async start(video: HTMLVideoElement, onResults: PoseCallback, opts?: { mock?: boolean }) {
    if (opts?.mock) {
      this.startMock(onResults);
      return;
    }
    const [{ Pose }, { Camera }] = await Promise.all([
      import("@mediapipe/pose"),
      import("@mediapipe/camera_utils"),
    ]);
    this.pose = new Pose({
      locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`,
    });
    this.pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    this.pose.onResults((res: any) => {
      this.frames++;
      const now = performance.now();
      if (now - this.lastT >= 1000) {
        this.fps = Math.round((this.frames * 1000) / (now - this.lastT));
        this.frames = 0;
        this.lastT = now;
      }
      const lm = (res.poseLandmarks ?? null) as PoseLandmarks | null;
      onResults(lm, this.fps);
    });

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
    video.srcObject = this.stream;
    await video.play();

    this.camera = new Camera(video, {
      onFrame: async () => {
        await this.pose?.send({ image: video });
      },
      width: 640,
      height: 480,
    });
    this.camera.start();
    this.lastT = performance.now();
  }

  private startMock(onResults: PoseCallback) {
    const t0 = Date.now();
    this.mockTimer = setInterval(() => {
      onResults(synthSquatLandmarks(Date.now() - t0), 30);
    }, 66);
  }

  async stop(video?: HTMLVideoElement) {
    try { this.camera?.stop(); } catch {}
    try { await this.pose?.close(); } catch {}
    if (this.mockTimer) clearInterval(this.mockTimer);
    this.stream?.getTracks().forEach((t) => t.stop());
    if (video) video.srcObject = null;
    cancelAnimationFrame(this.raf);
    this.pose = null;
    this.camera = null;
  }

  /** Draw skeleton overlay. Call inside rAF with canvas 2d ctx. */
  static async drawOverlay(
    canvas: HTMLCanvasElement,
    landmarks: PoseLandmarks | null,
    video?: HTMLVideoElement
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (video && video.videoWidth) {
      ctx.globalAlpha = 0.35;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }
    if (landmarks) {
      try {
        const mod: any = await import("@mediapipe/drawing_utils");
        mod.drawConnectors(ctx, landmarks as any, mod.POSE_CONNECTIONS, {
          color: "#22ff88",
          lineWidth: 3,
        });
        mod.drawLandmarks(ctx, landmarks as any, { color: "#ffffff", lineWidth: 1, radius: 3 });
      } catch {
        // fallback dots
        ctx.fillStyle = "#22ff88";
        for (const p of landmarks) {
          if ((p.visibility ?? 1) < 0.3) continue;
          ctx.beginPath();
          ctx.arc(p.x * canvas.width, p.y * canvas.height, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }
}
