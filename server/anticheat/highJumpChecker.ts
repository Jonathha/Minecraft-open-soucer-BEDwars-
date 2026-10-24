import { ServerPlayerData, Vector3D, CheckResult } from './types';
import { getSafeSetbackPos } from './setbackHelper';
import { checkServerFootprint, getDetailedBlockSupport } from './groundCheck';
import { buildRichViolation } from './violationDetailsHelper';

export function checkHighJump(
  player: ServerPlayerData,
  newPos: Vector3D,
  prevPos: Vector3D,
  dY: number,
  isKnockbackActive: boolean,
  isStandingOnServerBlock: boolean,
  isGroundedClient: boolean,
  isFalling: boolean,
  now: number,
  roomBlocks?: Array<{ x: number; y: number; z: number }>
): CheckResult | null {
  if (isKnockbackActive) return null;

  const groundY = player.lastGroundY || (player.lastLegitGroundedPos ? player.lastLegitGroundedPos.y : prevPos.y);
  const heightInAir = newPos.y - groundY;

  // 1. Bloqueia pulos iniciados sobre bloco falso/inexistente no servidor
  const prevDY = player.lastDY !== undefined ? player.lastDY : 0;
  const isNewJumpLaunch = dY > 0.12 && (prevDY <= 0.08 || (player.airTicks || 0) <= 2);

  if (isNewJumpLaunch) {
    const hasPlacedSupport = Boolean(
      player.recentPlacedBlocks?.some(b => {
        const dx = Math.abs(prevPos.x - b.x);
        const dz = Math.abs(prevPos.z - b.z);
        const dy = prevPos.y - (b.y + 0.5);
        return dx <= 1.3 && dz <= 1.3 && dy >= -0.4 && dy <= 1.3;
      })
    );

    // O ponto de origem do pulo é legítimo se o jogador estava sobre um bloco do servidor ou a até 3.5m (sprint/lag)
    const isLegitGroundOrigin = Boolean(
      player.lastLegitGroundedPos &&
      Math.hypot(prevPos.x - player.lastLegitGroundedPos.x, prevPos.z - player.lastLegitGroundedPos.z) < 3.5 &&
      Math.abs(prevPos.y - player.lastLegitGroundedPos.y) <= 1.4
    );

    const prevSupport = getDetailedBlockSupport(prevPos.x, prevPos.y, prevPos.z, roomBlocks, false);
    const hasProximitySupport = Boolean(
      prevSupport.nearestBlock &&
      prevSupport.nearestBlock.distY <= 0.45 &&
      prevSupport.nearestBlock.distXZ <= 1.15
    );

    const startWasOnServerBlock = isStandingOnServerBlock || checkServerFootprint(prevPos.x, prevPos.y, prevPos.z, roomBlocks, false) || hasPlacedSupport || isLegitGroundOrigin || hasProximitySupport;

    if (!startWasOnServerBlock) {
      player.lastIllegalFlySpot = { x: newPos.x, y: newPos.y, z: newPos.z, timestamp: now };
      return {
        allowed: false,
        setbackPos: getSafeSetbackPos(player, newPos, prevPos, false),
        violation: buildRichViolation(
          player,
          'FLY',
          'Ghost Block Jump / Unverified Surface Jump',
          4.0,
          `Tentativa de pulo sem bloco real do servidor no ponto de origem (prevY=${prevPos.y.toFixed(2)}, dY=${dY.toFixed(2)})`,
          newPos,
          now,
          roomBlocks,
          'server/anticheat/highJumpChecker.ts',
          'ERR_GHOST_BLOCK_JUMP',
          'Pulo iniciado em coordenadas onde o servidor não possui registro de bloco de chão sólido.'
        ),
      };
    }
  }

  // 2. Bloqueia subidas de altura acima do limite físico (altura > 1.68 blocos acima do solo do pulo)
  if (heightInAir >= 1.68 && dY > 0.06) {
    player.lastIllegalFlySpot = { x: newPos.x, y: newPos.y, z: newPos.z, timestamp: now };
    return {
      allowed: false,
      setbackPos: getSafeSetbackPos(player, newPos, prevPos, isFalling),
      violation: buildRichViolation(
        player,
        'FLY',
        'High Jump / Impossible Jump Ascent',
        4.5,
        `Pulo impossível: subiu ${heightInAir.toFixed(2)} blocos no ar sem apoio (limite físico=1.68m, groundY=${groundY.toFixed(2)})`,
        newPos,
        now,
        roomBlocks,
        'server/anticheat/highJumpChecker.ts',
        'ERR_HIGH_JUMP',
        'Altura no ar excedeu o ápice de trajetória balística de um pulo normal.'
      ),
    };
  }

  return null;
}

