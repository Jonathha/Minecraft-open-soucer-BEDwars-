import { ServerPlayerData, Vector3D, CheckResult } from './types';
import { getSafeSetbackPos } from './setbackHelper';
import { buildRichViolation } from './violationDetailsHelper';

export function checkRepeatedSetback(
  player: ServerPlayerData,
  newPos: Vector3D,
  prevPos: Vector3D,
  isStandingOnServerBlock: boolean,
  isGroundedClient: boolean,
  isFalling: boolean,
  now: number,
  roomBlocks?: Array<{ x: number; y: number; z: number }>
): CheckResult | null {
  if (player.lastSetbackTime && (now - player.lastSetbackTime < 4000)) {
    const streak = player.setbackStreak || 0;
    if (streak >= 3 && !isStandingOnServerBlock && !isGroundedClient) {
      return {
        allowed: false,
        setbackPos: getSafeSetbackPos(player, newPos, prevPos, isFalling),
        violation: buildRichViolation(
          player,
          'FLY',
          'Repeated Fly Attempt / Continuous Setback',
          5.0,
          `Re-tentativa persistente de movimento ilícito pós-puxão (sequência ${streak + 1})`,
          newPos,
          now,
          roomBlocks,
          'server/anticheat/repeatedSetbackChecker.ts',
          'ERR_REPEATED_SETBACK',
          'Tentativa contínua de movimentação no ar após setbacks consecutivos.'
        ),
      };
    }
  }
  return null;
}

