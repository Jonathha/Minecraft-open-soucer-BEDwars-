import { ServerPlayerData, CheckResult, Vector3D } from './types';
import { CombatDetector, CombatHitPayload } from './combatDetector';
import { PlacementDetector, BlockPlacePayload } from './placementDetector';
import { runAimbotCombatAnalysis } from './aimbotCheckHandler';

export { runMovementCheck } from './serverMovementChecker';

export function runCombatCheck(
  player: ServerPlayerData,
  hitData: CombatHitPayload,
  team?: 'red' | 'blue',
  targetPlayerPos?: Vector3D,
  targetPlayer?: ServerPlayerData,
  roomBlocks?: Array<{ x: number; y: number; z: number }>
): CheckResult {
  const now = Date.now();
  const result = CombatDetector.checkHit(player, player.lastPos, hitData, team, now, targetPlayerPos, roomBlocks);
  if (!result.allowed && result.violation) return result;

  // Modern Server-Side Anti-Aimbot Analysis (No instant ban, statistical evaluation)
  const aimbotResult = runAimbotCombatAnalysis(player, hitData, targetPlayerPos);
  if (!aimbotResult.allowed && aimbotResult.violation) return aimbotResult;

  if (targetPlayer) {
    targetPlayer.knockbackUntil = now + 750;
    targetPlayer.airTicks = 0;
  }
  return { allowed: true };
}

export function runPlacementCheck(
  player: ServerPlayerData,
  block: BlockPlacePayload,
  roomBlocks?: Array<{ x: number; y: number; z: number }>
): CheckResult {
  return PlacementDetector.checkPlacement(player, block, Date.now(), roomBlocks);
}

