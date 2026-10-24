import { ServerPlayerData, CheckResult, Vector3D } from './types';
import { CombatHitPayload } from './combatDetector';
import { ServerAimbotDetector } from './serverAimbotDetector';

export function runAimbotMovementAnalysis(player: ServerPlayerData, rot: number): void {
  // Passively track rotation deltas and decay suspicion buffer on human movement
  ServerAimbotDetector.analyze(player, rot);
}

export function runAimbotCombatAnalysis(
  player: ServerPlayerData,
  hitData: CombatHitPayload,
  targetPos?: Vector3D
): CheckResult {
  const currentYaw = hitData.dir
    ? Math.atan2(-hitData.dir.x, -hitData.dir.z)
    : (player.lastRot || 0);

  const result = ServerAimbotDetector.analyze(
    player,
    currentYaw,
    hitData.dir,
    targetPos,
    true
  );

  // Does not ban immediately. Gathers statistical proof across multiple hits
  if (result.detected) {
    return {
      allowed: false,
      violation: {
        category: 'COMBAT',
        rule: 'Aimbot / Unnatural Aim Mechanics',
        weight: 2.0,
        details: `${result.reason} (Confidence: ${(result.confidence * 100).toFixed(0)}%, Buffer: ${result.suspicionScore})`,
        file: 'server/anticheat/serverAimbotDetector.ts',
        error: 'ERR_AIMBOT_PATTERN_DETECTED',
        cause: 'Análise estatística do servidor confirmou padrão mecânico de mira automatizada.',
        timestamp: Date.now(),
      },
    };
  }

  return { allowed: true };
}
