import { AntiCheatViolation } from './types';

/**
 * FastPlace / Nuker / Placement Rate Limiter:
 * Uses a token bucket algorithm to tolerate legitimate fast bursts
 * (e.g. Speedbridge / Drag-click / Butterfly clicking up to 8 blocks/sec in bursts),
 * while punishing sustained impossible rates (Nuker / 15+ blocks/sec).
 */
export class RateLimiter {
  private placeTimestamps: number[] = [];
  private readonly WINDOW_MS = 1000;
  private readonly MAX_BURST_PER_SECOND = 9;   // Allowed burst for legitimate fastbridgers
  private readonly MIN_INTERVAL_MS = 15;       // Minimum delta between individual placements (lowered to tolerate lag spikes)

  public checkRate(): AntiCheatViolation | null {
    const now = performance.now();

    // Remove placements older than 1 second
    this.placeTimestamps = this.placeTimestamps.filter((t) => now - t <= this.WINDOW_MS);

    // Check minimum interval between consecutive placements
    if (this.placeTimestamps.length > 0) {
      const last = this.placeTimestamps[this.placeTimestamps.length - 1];
      const delta = now - last;
      if (delta < this.MIN_INTERVAL_MS) {
        return {
          module: 'fast_place',
          weight: 2.0,
          details: `Placement interval too low: ${delta.toFixed(1)}ms (Min: ${this.MIN_INTERVAL_MS}ms)`,
        };
      }
    }

    this.placeTimestamps.push(now);

    // Check sustained throughput
    if (this.placeTimestamps.length > this.MAX_BURST_PER_SECOND) {
      return {
        module: 'fast_place',
        weight: 3.0,
        details: `Exceeded max placements/sec: ${this.placeTimestamps.length} > ${this.MAX_BURST_PER_SECOND}`,
      };
    }

    return null;
  }

  public reset(): void {
    this.placeTimestamps = [];
  }
}
