import { ServerPlayerData, Vector3D, CheckResult } from './types';
import { getSafeSetbackPos } from './setbackHelper';
import { buildRichViolation } from './violationDetailsHelper';

const MAX_LEGIT_SPEED = 9.5;

export function checkSpeedHack(
  player: ServerPlayerData,
  newPos: Vector3D,
  prevPos: Vector3D,
  speed: number,
  dXZ: number,
  isKnockbackActive: boolean,
  isBurstPacket: boolean,
  now: number,
  roomBlocks?: Array<{ x: number; y: number; z: number }>
): CheckResult | null {
  const maxSpeedLimit = isKnockbackActive ? 22.0 : (isBurstPacket ? 28.0 : MAX_LEGIT_SPEED);
  
  if (player.speedViolationScore === undefined) {
    player.speedViolationScore = 0;
  }

  if (speed > maxSpeedLimit && dXZ > 1.2) {
    const excess = speed - maxSpeedLimit;
    // Incrementa o score proporcionalmente ao excesso de velocidade detectado nesta amostra
    player.speedViolationScore += Math.min(excess / 4.0, 1.5);

    // Se o score cumulativo passar de 3.0, aplica o recuo (setback)
    if (player.speedViolationScore > 3.0) {
      // Amortece o score após a punição para evitar recuos infinitos em loop por lag residual
      player.speedViolationScore = 2.0;

      return {
        allowed: false,
        setbackPos: getSafeSetbackPos(player, newPos, prevPos, false),
        violation: buildRichViolation(
          player,
          'SPEED',
          'Speed Hack / Movement Speed Exceeded',
          4.0,
          `Velocidade excessiva: ${speed.toFixed(1)} m/s (Max: ${maxSpeedLimit} m/s) [Score: ${player.speedViolationScore.toFixed(1)}]`,
          newPos,
          now,
          roomBlocks,
          'server/anticheat/speedHackChecker.ts',
          'ERR_SPEED_HACK',
          'Deslocamento horizontal por segundo acima da velocidade permitida em sprint.'
        ),
      };
    }
  } else {
    // Decai gradualmente e rapidamente o score quando o jogador está se movendo legalmente
    player.speedViolationScore = Math.max(0, player.speedViolationScore - 0.5);
  }
  return null;
}

