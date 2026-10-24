import { ServerPlayerData, Vector3D, CheckResult } from './types';

/**
 * Server-side Fake Lag, Blink & Timer Detector
 * Detects:
 * - Blink (withholding movement packets to teleport suddenly)
 * - Timer (accelerating client game clock to move faster)
 * - High packet frequency bursts
 * 
 * Includes Latency & Lag Compensation to prevent false positives for high ping players.
 */
export class FakeLagDetector {
  private static readonly MAX_PACKETS_PER_SEC = 85; // High refresh rate & network batching safety
  private static readonly MAX_BLINK_TELEPORT_DIST = 25.0; // Max allowed distance after packet starvation

  public static checkPacketRateAndBlink(
    player: ServerPlayerData,
    newPos: Vector3D,
    now: number
  ): CheckResult {
    if (player.teleportBypassUntil && now < player.teleportBypassUntil) {
      player.packetTimestamps = [];
      return { allowed: true };
    }

    const prevPos = player.lastPos;
    const timeSinceLastPacket = (now - player.lastPosTime) / 1000;

    // Track rolling packet timestamps in 1-second window
    player.packetTimestamps.push(now);
    player.packetTimestamps = player.packetTimestamps.filter((t) => now - t <= 1000);

    // 1. Timer / Speed Hack (Too many movement packets per second)
    if (player.packetTimestamps.length > this.MAX_PACKETS_PER_SEC) {
      return {
        allowed: false,
        violation: {
          category: 'FAKE_LAG',
          rule: 'Timer / High Packet Frequency',
          weight: 3.0,
          details: `Received ${player.packetTimestamps.length} packets in 1s window`,
          timestamp: now,
        },
      };
    }

    if (!prevPos) return { allowed: true };

    const dX = newPos.x - prevPos.x;
    const dY = newPos.y - prevPos.y;
    const dZ = newPos.z - prevPos.z;
    const distSq = dX * dX + dY * dY + dZ * dZ;
    const dist = Math.sqrt(distSq);

    // 2. Blink / Fake Lag (Suspended packets followed by huge movement jump)
    if (timeSinceLastPacket > 1.5) {
      // Calculate average speed over the full elapsed time (ping compensation)
      const avgSpeed = dist / timeSinceLastPacket;
      const MAX_LEGIT_SPEED = 14.0;

      // If average speed over the silent duration exceeds max sprint speed -> Fake Lag / Blink hack
      if (avgSpeed > MAX_LEGIT_SPEED && dist > this.MAX_BLINK_TELEPORT_DIST) {
        return {
          allowed: false,
          violation: {
            category: 'FAKE_LAG',
            rule: 'Blink / Suspended Teleportation',
            weight: 4.5,
            details: `Covered ${dist.toFixed(2)}m after ${timeSinceLastPacket.toFixed(2)}s silent window (avg speed: ${avgSpeed.toFixed(2)}m/s)`,
            timestamp: now,
          },
        };
      }
    }

    return { allowed: true };
  }
}
