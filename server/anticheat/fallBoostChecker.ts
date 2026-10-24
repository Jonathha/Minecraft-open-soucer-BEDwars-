import { ServerPlayerData, Vector3D, CheckResult } from './types';
import { buildRichViolation } from './violationDetailsHelper';
import { checkServerFootprint, getDetailedBlockSupport } from './groundCheck';

export function checkFallBoost(
  player: ServerPlayerData,
  newPos: Vector3D,
  prevPos: Vector3D,
  dY: number,
  prevDY: number,
  dXZ: number,
  isKnockbackActive: boolean,
  isStandingOnServerBlock: boolean,
  now: number,
  roomBlocks?: Array<{ x: number; y: number; z: number }>
): CheckResult | null {
  if (isKnockbackActive || isStandingOnServerBlock) {
    return null;
  }

  // Se o jogador estava sobre um bloco no tick anterior ou no tick atual, não é impulso no ar
  if (
    checkServerFootprint(prevPos.x, prevPos.y, prevPos.z, roomBlocks, false) ||
    checkServerFootprint(newPos.x, newPos.y, newPos.z, roomBlocks, false)
  ) {
    return null;
  }

  // 1. Detecta inversão vertical / impulso para cima no ar sem bloco
  // Evita falsos positivos de lag, variação de FPS ou arrasto físico durante a queda (especialmente no void)
  const isVoid = newPos.y < -2;
  const isReversingFall = !isVoid && prevDY < -0.05 && dY > (prevDY + 0.04) && dY > -0.05;
  const isIllegalUpwardInAir = prevDY < 0 && dY > 0.01;

  if (isReversingFall || isIllegalUpwardInAir) {
    // Tolerância cirúrgica de latência para pouso e decolagem:
    // Se há bloco imediatamente sob os pés (distY <= 0.45m e distXZ <= 1.15m) e o impulso é de pulo normal (dY <= 0.65), é pulo legítimo
    const prevSupport = getDetailedBlockSupport(prevPos.x, prevPos.y, prevPos.z, roomBlocks, false);
    const newSupport = getDetailedBlockSupport(newPos.x, newPos.y, newPos.z, roomBlocks, false);
    const nearestBelow = (prevSupport.nearestBlock && prevSupport.nearestBlock.distY <= 0.45 && prevSupport.nearestBlock.distXZ <= 1.15)
      || (newSupport.nearestBlock && newSupport.nearestBlock.distY <= 0.45 && newSupport.nearestBlock.distXZ <= 1.15);

    if (nearestBelow && dY <= 0.65) {
      return null;
    }

    player.lastIllegalFlySpot = { x: newPos.x, y: newPos.y, z: newPos.z, timestamp: now };
    
    const voidSetbackPos: Vector3D = {
      x: prevPos.x,
      y: Math.min(prevPos.y, newPos.y),
      z: prevPos.z,
    };

    return {
      allowed: false,
      setbackPos: voidSetbackPos,
      violation: buildRichViolation(
        player,
        'FLY',
        'Fall Boost / Mid-Air Fly Activation',
        3.0,
        `Impulso/Subida ilegal no ar sem bloco (prevDY=${prevDY.toFixed(2)}, dY=${dY.toFixed(2)})`,
        newPos,
        now,
        roomBlocks,
        'server/anticheat/fallBoostChecker.ts',
        'ERR_FALL_BOOST_FLY',
        'O jogador reverteu a aceleração da gravidade ou subiu no ar sem bloco sólido de apoio abaixo dos pés.'
      ),
    };
  }

  // 2. Detecta impulso/deslocamento horizontal para frente no ar acima do limite físico
  const airTicks = player.airTicks || 0;

  // Curva progressiva baseada na física real de arrasto (0.98) para tolerar picos de lag no início do pulo,
  // mas reduzindo de forma implacável para limitar voos longos e glides ilícitos.
  // Durante os primeiros 10 ticks do pulo normal (arco ascendente e ápice), a velocidade horizontal de sprint (0.60-0.70) é mantida.
  const rawDelta = (now - player.lastPosTime) / 1000;
  const isBurstPacket = rawDelta < 0.035;
  const baseMaxSpeed = isBurstPacket ? 0.75 : 0.70;
  const decayTicks = Math.max(0, airTicks - 10);
  const decay = Math.pow(0.98, decayTicks);
  const maxAirSpeed = Math.max(0.42, baseMaxSpeed * decay);

  const isExcessiveAirHorizontalSpeed = dXZ > maxAirSpeed;

  // Distância horizontal acumulada no ar sem tocar no solo (exige arTicks prolongado > 14 para evitar falsos positivos em pulos normais)
  let isExcessiveAirDistance = false;
  if (player.lastLegitGroundedPos && airTicks > 14) {
    const distGrounded = Math.hypot(newPos.x - player.lastLegitGroundedPos.x, newPos.z - player.lastLegitGroundedPos.z);
    if (distGrounded > 12.0) {
      isExcessiveAirDistance = true;
    }
  }

  if (isExcessiveAirHorizontalSpeed || isExcessiveAirDistance) {
    player.lastIllegalFlySpot = { x: newPos.x, y: newPos.y, z: newPos.z, timestamp: now };
    
    return {
      allowed: false,
      setbackPos: player.lastLegitGroundedPos ? { ...player.lastLegitGroundedPos } : { x: prevPos.x, y: Math.min(prevPos.y, newPos.y), z: prevPos.z },
      violation: buildRichViolation(
        player,
        'FLY',
        'Air Glide / Forward Air Boost',
        3.0,
        `Impulso horizontal no ar sem apoio (dXZ=${dXZ.toFixed(2)}, limit=${maxAirSpeed.toFixed(2)}, airTicks=${airTicks})`,
        newPos,
        now,
        roomBlocks,
        'server/anticheat/fallBoostChecker.ts',
        'ERR_AIR_GLIDE',
        'Velocidade horizontal no ar acima da desaceleração permitida pelo atrito do ar.'
      ),
    };
  }

  return null;
}


