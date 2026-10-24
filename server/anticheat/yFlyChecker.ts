import { ServerPlayerData, Vector3D, CheckResult } from './types';
import { getSafeSetbackPos } from './setbackHelper';
import { buildRichViolation } from './violationDetailsHelper';

const MAX_SINGLE_TICK_UPWARDS_Y = 3.25;

export function checkYFly(
  player: ServerPlayerData,
  newPos: Vector3D,
  prevPos: Vector3D,
  dY: number,
  timeDelta: number,
  isKnockbackActive: boolean,
  isBurstPacket: boolean,
  now: number,
  roomBlocks?: Array<{ x: number; y: number; z: number }>
): CheckResult | null {
  if (!isKnockbackActive) {
    const recentlyPlacedNear = player.recentPlacedBlocks?.some(
      b => Math.abs(b.x - newPos.x) <= 1.8 && Math.abs(b.z - newPos.z) <= 1.8 && (newPos.y - b.y) >= -0.5 && (newPos.y - b.y) <= 3.5
    );
    const maxYLimit = isBurstPacket ? 10.0 : (recentlyPlacedNear ? 4.2 : MAX_SINGLE_TICK_UPWARDS_Y);
    const effectiveDelta = Math.max(0.05, timeDelta);

    if ((dY > maxYLimit && timeDelta < 0.25) || (dY > 2.85 && (dY / effectiveDelta) > 28.0 && !isBurstPacket && !recentlyPlacedNear)) {
      player.lastIllegalFlySpot = { x: newPos.x, y: newPos.y, z: newPos.z, timestamp: now };
      return {
        allowed: false,
        setbackPos: getSafeSetbackPos(player, newPos, prevPos, false),
        violation: buildRichViolation(
          player,
          'FLY',
          'Y-Fly / Instant Vertical Ascend',
          4.0,
          `Subida vertical extrema: subiu ${dY.toFixed(2)}m em ${Math.round(timeDelta * 1000)}ms (limite=${maxYLimit.toFixed(2)}m)`,
          newPos,
          now,
          roomBlocks,
          'server/anticheat/yFlyChecker.ts',
          'ERR_Y_FLY',
          'Subida instantânea no eixo Y acima do limite máximo físico permitido.'
        ),
      };
    }
  }
  return null;
}

