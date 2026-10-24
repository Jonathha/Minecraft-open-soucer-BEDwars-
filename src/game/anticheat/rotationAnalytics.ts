import { RotationSample } from './types';

/**
 * Robotic Rotation / AI Aim Analyzer:
 * Detects unnatural robotic head snaps, zero-acceleration snaps,
 * and perfectly linear or instant angular changes that human hands cannot produce.
 */
export class RotationAnalytics {
  private history: RotationSample[] = [];
  private readonly MAX_SAMPLES = 12;

  public recordSample(yaw: number, pitch: number): void {
    const now = performance.now();
    this.history.push({ yaw, pitch, time: now });
    if (this.history.length > this.MAX_SAMPLES) {
      this.history.shift();
    }
  }

  /**
   * Checks if recent head movement matches impossible instant snap / robotic aimbot.
   * Legitimate fast flicks have acceleration and deceleration curves.
   * AI/Scaffold bots snap in exactly 1 frame without prior acceleration and lock instantly.
   */
  public checkRoboticRotation(): { isRobotic: boolean; score: number; reason: string } {
    if (this.history.length < 3) {
      return { isRobotic: false, score: 0, reason: '' };
    }

    const n = this.history.length;
    const latest = this.history[n - 1];
    const prev = this.history[n - 2];
    const dt = Math.max(0.001, (latest.time - prev.time) / 1000);

    if (dt > 0.15) {
      return { isRobotic: false, score: 0, reason: '' };
    }

    // Angular delta
    const dyaw = Math.abs(latest.yaw - prev.yaw);
    const dpitch = Math.abs(latest.pitch - prev.pitch);
    const deltaTotal = dyaw + dpitch;
    const angularSpeed = deltaTotal / dt;

    // Instant snap-on-hit / zero-acceleration flick (> 27° in < 55ms without ramp-up)
    if (deltaTotal > 0.48 && dt < 0.055) {
      const p3 = this.history.length >= 3 ? this.history[n - 3] : null;
      const prevSpeed = p3 ? (Math.abs(prev.yaw - p3.yaw) + Math.abs(prev.pitch - p3.pitch)) / Math.max(0.001, (prev.time - p3.time) / 1000) : 0;
      if (prevSpeed < 1.5) {
        return { isRobotic: true, score: 3.5, reason: 'Instant zero-acceleration snap' };
      }
    }

    // Sustained extreme robotic angular speed (> 65 rad/s)
    if (angularSpeed > 65) {
      const p3 = this.history.length >= 3 ? this.history[n - 3] : null;
      const prevSpeed = p3 ? (Math.abs(prev.yaw - p3.yaw) + Math.abs(prev.pitch - p3.pitch)) / Math.max(0.001, (prev.time - p3.time) / 1000) : 0;
      if (prevSpeed < 1.0) {
        return { isRobotic: true, score: 3.0, reason: 'Instant zero-acceleration snap' };
      }
    }

    // Unnatural pitch lock (Disabled: legitimate players lock pitch to speedbridge)
    let identicalPitchCount = 0;
    for (let i = 1; i < this.history.length; i++) {
      if (Math.abs(this.history[i].pitch - this.history[i - 1].pitch) < 0.00001 && Math.abs(this.history[i].yaw - this.history[i - 1].yaw) > 0.05) {
        identicalPitchCount++;
      }
    }

    if (identicalPitchCount >= 6) {
      // Allowed for human speedbridging
      return { isRobotic: false, score: 0, reason: '' };
    }

    return { isRobotic: false, score: 0, reason: '' };
  }

  public reset(): void {
    this.history = [];
  }
}
