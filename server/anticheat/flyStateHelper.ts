import { ServerPlayerData, Vector3D } from './types';
import { checkServerFootprint } from './groundCheck';

export interface FlyState {
  prevPos: Vector3D;
  dXZ: number;
  dY: number;
  prevDY: number;
  timeDelta: number;
  speed: number;
  isSneaking: boolean;
  isKnockbackActive: boolean;
  isBurstPacket: boolean;
  isStandingOnServerBlock: boolean;
  isFalling: boolean;
}

export function updateFlyState(
  player: ServerPlayerData,
  newPos: Vector3D,
  now: number,
  roomBlocks?: Array<{ x: number; y: number; z: number }>,
  keys?: { sneak?: boolean },
  isGroundedClient?: boolean
): FlyState | null {
  const prevPos = player.lastPos;
  if (!prevPos) return null;

  const dX = newPos.x - prevPos.x;
  const dY = newPos.y - prevPos.y;
  const dZ = newPos.z - prevPos.z;
  const dXZ = Math.hypot(dX, dZ);
  const rawDelta = (now - player.lastPosTime) / 1000;
  const timeDelta = Math.max(rawDelta, 0.045);
  const speed = dXZ / timeDelta;

  if (dXZ > 35.0 || Math.abs(dY) > 35.0) {
    player.airTicks = 0;
    return null;
  }

  const isKnockbackActive = Boolean(player.knockbackUntil && now < player.knockbackUntil);
  const isBurstPacket = rawDelta < 0.035;
  const isSneaking = Boolean(keys?.sneak);

  const hasRecentPlaced = Boolean(
    player.recentPlacedBlocks?.some(b => {
      const dx = Math.abs(newPos.x - b.x);
      const dz = Math.abs(newPos.z - b.z);
      const dy = newPos.y - (b.y + 0.5);
      return dx <= (isSneaking ? 0.92 : 0.65) && dz <= (isSneaking ? 0.92 : 0.65) && dy >= -0.25 && dy <= 0.8;
    })
  );
  const isStandingOnServerBlock = checkServerFootprint(newPos.x, newPos.y, newPos.z, roomBlocks, isSneaking) || hasRecentPlaced;
  const isFalling = dY < -0.05 && !isStandingOnServerBlock;

  // Servidor só considera solo legítimo se houver bloco real do servidor sob os pés
  if (isStandingOnServerBlock) {
    player.airTicks = 0;
    player.lastGroundY = newPos.y;
    player.lastLegitGroundedPos = { ...newPos };
    player.setbackStreak = 0;
  } else if (isKnockbackActive) {
    player.airTicks = 0;
  } else {
    // No ar, incrementa ticks no ar continuamente
    player.airTicks = (player.airTicks || 0) + 1;
  }
  const prevDY = player.lastDY ?? 0;
  player.lastDY = dY;

  return {
    prevPos,
    dXZ,
    dY,
    prevDY,
    timeDelta,
    speed,
    isSneaking,
    isKnockbackActive,
    isBurstPacket,
    isStandingOnServerBlock,
    isFalling,
  };
}
