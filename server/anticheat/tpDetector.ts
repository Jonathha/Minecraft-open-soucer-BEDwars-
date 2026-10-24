import { ServerPlayerData, Vector3D, CheckResult } from './types';

/**
 * Server-Side Anti-Teleport Detector (Anti-TP)
 * Maintains a 3-second rolling position history buffer per player.
 * Validates whether a player moved an impossible distance in under 2 seconds.
 * Includes lag & network jitter protection to prevent false positives for legitimate players.
 */
export class TeleportDetector {
  private static readonly HISTORY_WINDOW_MS = 3000; // Keep player states for 3 seconds
  private static readonly CHECK_WINDOW_MS = 2000; // Validate teleports within a 2-second window
  private static readonly MAX_LEGIT_2S_DISTANCE = 18.0; // Max allowed distance in 2s (Sprint-Jump ~16m + margin)

  public static checkTeleport(player: ServerPlayerData, newPos: Vector3D, now: number): CheckResult {
    if (player.teleportBypassUntil && now < player.teleportBypassUntil) {
      player.posHistory = [{ pos: { ...newPos }, timestamp: now }];
      return { allowed: true };
    }

    if (!player.posHistory) {
      player.posHistory = [];
    }

    // 1. Maintain rolling history buffer for the last 3 seconds
    player.posHistory.push({ pos: { ...newPos }, timestamp: now });
    player.posHistory = player.posHistory.filter((entry) => now - entry.timestamp <= this.HISTORY_WINDOW_MS);

    // Need at least 2 state snapshots to analyze movement delta
    if (player.posHistory.length < 2) {
      return { allowed: true };
    }

    const timeSinceLastPacket = now - player.lastPosTime;

    // 2. Network Lag / Reconnect protection (packet stalls > 2.0s)
    if (timeSinceLastPacket > 2000) {
      player.posHistory = [{ pos: { ...newPos }, timestamp: now }];
      return { allowed: true };
    }

    // 3. Void Fall & Respawn Timer Reset protection (Y < 3 or packet pause >= 1000ms)
    const prevPos = player.lastPos;
    if (prevPos) {
      if (newPos.y < 3 || prevPos.y < 3 || timeSinceLastPacket >= 1000) {
        player.posHistory = [{ pos: { ...newPos }, timestamp: now }];
        return { allowed: true };
      }
    }

    // 4. Analyze position delta against states recorded within the 2-second window
    for (const pastEntry of player.posHistory) {
      const elapsedMs = now - pastEntry.timestamp;

      // Only check historical snapshots between 100ms and 2000ms ago
      if (elapsedMs >= 100 && elapsedMs <= this.CHECK_WINDOW_MS) {
        const dX = newPos.x - pastEntry.pos.x;
        const dY = newPos.y - pastEntry.pos.y;
        const dZ = newPos.z - pastEntry.pos.z;
        const elapsedSec = elapsedMs / 1000;

        // Horizontal displacement check (prevents horizontal teleport / speedhack)
        const distHoriz = Math.hypot(dX, dZ);
        const maxAllowedHoriz = Math.max(10.0 * elapsedSec + 3.6, 6.5); // Sprint speed + network buffer margin

        // Upward vertical displacement check (downward falls are governed by gravity and checked separately)
        const maxAllowedUpward = Math.max(8.5 * elapsedSec + 3.0, 4.0);
        const isUpwardTP = dY > maxAllowedUpward && !player.knockbackUntil;

        const isHorizTP = distHoriz > maxAllowedHoriz && distHoriz > Math.max(6.5, this.MAX_LEGIT_2S_DISTANCE * (elapsedSec / 2.0));

        if (isHorizTP || isUpwardTP) {
          const violationDist = isHorizTP ? distHoriz : dY;
          return {
            allowed: false,
            violation: {
              category: 'TELEPORT',
              rule: 'Auto-TP / Illegal Teleportation',
              weight: 12.0,
              details: `Auto-TP / Teleporte Ilícito: Movimentou ${violationDist.toFixed(1)}m em ${elapsedSec.toFixed(2)}s (Horizontal: ${distHoriz.toFixed(1)}m, dY: ${dY.toFixed(1)}m)`,
              timestamp: now,
            },
          };
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Clears position history for a player when a legitimate server teleport occurs (e.g., match start, respawn)
   */
  public static clearHistory(player: ServerPlayerData): void {
    player.posHistory = [];
  }
}
