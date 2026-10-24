import { ServerPlayerData, Vector3D, CheckResult } from './types';
import { buildRichViolation } from './violationDetailsHelper';

export function checkHoverFly(
  player: ServerPlayerData,
  newPos: Vector3D,
  prevPos: Vector3D,
  dXZ: number,
  dY: number,
  isStandingOnServerBlock: boolean,
  isGroundedClient: boolean,
  isKnockbackActive: boolean,
  now: number,
  roomBlocks?: Array<{ x: number; y: number; z: number }>
): CheckResult | null {
  if (isStandingOnServerBlock || isKnockbackActive) {
    player.hoverTicks = 0;
    return null;
  }

  const airTicks = player.airTicks || 0;

  // No ar sem apoio: se o jogador não cai com a aceleração da gravidade (dY >= -0.04)
  if (dY >= -0.04) {
    player.hoverTicks = (player.hoverTicks || 0) + 1;
  } else {
    player.hoverTicks = Math.max(0, (player.hoverTicks || 0) - 1);
  }

  const hoverTicks = player.hoverTicks || 0;
  
  // Flutuando/Voando para frente no ar:
  // 1) 3 ticks sem queda quando já está no ar (airTicks > 4)
  // 2) Subida ilegal no ar (dY > 0.05 com airTicks > 4)
  const isHoveringForward = hoverTicks >= 3 && airTicks > 4;
  const isAirAscending = airTicks > 4 && dY > 0.05;

  if (isHoveringForward || isAirAscending) {
    player.lastIllegalFlySpot = { x: newPos.x, y: newPos.y, z: newPos.z, timestamp: now };
    
    // Setback imediato para a posição de solo legítima confirmada no servidor
    const setbackPos = player.lastLegitGroundedPos
      ? { ...player.lastLegitGroundedPos }
      : { x: prevPos.x, y: player.lastGroundY || prevPos.y, z: prevPos.z };

    return {
      allowed: false,
      setbackPos,
      violation: buildRichViolation(
        player,
        'FLY',
        'Float / Forward Mid-Air Fly',
        4.0,
        `Flutuando/Voando para frente no ar (hoverTicks=${hoverTicks}, airTicks=${airTicks}, dY=${dY.toFixed(2)})`,
        newPos,
        now,
        roomBlocks,
        'server/anticheat/hoverFlyChecker.ts',
        'ERR_FORWARD_FLY_FLOAT',
        'Jogador se manteve flutuando ou se deslocando no ar sem perder altitude por gravidade.'
      ),
    };
  }

  if (airTicks > 24 && dXZ > 0.45 && !isGroundedClient) {
    return {
      allowed: false,
      setbackPos: { x: prevPos.x, y: Math.min(prevPos.y - 0.35, newPos.y - 0.35), z: prevPos.z },
      violation: buildRichViolation(
        player,
        'FLY',
        'Air Speed / Glide Teleport',
        3.0,
        `Movimento no ar estendido sem apoio de bloco (dXZ=${dXZ.toFixed(2)}, airTicks=${airTicks})`,
        newPos,
        now,
        roomBlocks,
        'server/anticheat/hoverFlyChecker.ts',
        'ERR_AIR_SPEED_GLIDE',
        'Deslocamento horizontal no ar por período prolongado sem tocar no solo.'
      ),
    };
  }

  return null;
}


