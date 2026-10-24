import { ServerPlayerData, Vector3D, CheckResult } from './types';
import { getSafeSetbackPos } from './setbackHelper';
import { buildRichViolation } from './violationDetailsHelper';

export function checkSneakSpeed(
  player: ServerPlayerData,
  newPos: Vector3D,
  prevPos: Vector3D,
  speed: number,
  dXZ: number,
  isSneaking: boolean,
  isKnockbackActive: boolean,
  now: number,
  roomBlocks?: Array<{ x: number; y: number; z: number }>
): CheckResult | null {
  if (player.sneakViolationScore === undefined) {
    player.sneakViolationScore = 0;
  }

  if (isSneaking && !isKnockbackActive && speed > 5.2 && dXZ > 0.6) {
    const excess = speed - 5.2;
    // Incrementa o score de violação do agachamento
    player.sneakViolationScore += Math.min(excess / 2.0, 1.5);

    // Se violar consistentemente por mais de 3 medições próximas, recua
    if (player.sneakViolationScore > 3.0) {
      player.sneakViolationScore = 2.0;

      return {
        allowed: false,
        setbackPos: getSafeSetbackPos(player, newPos, prevPos, false),
        violation: buildRichViolation(
          player,
          'SPEED',
          'Sneak Speed Hack / Shift Speed Exceeded',
          4.5,
          `Velocidade excessiva no Sneak: ${speed.toFixed(1)} m/s (Máximo permitido: 5.2 m/s) [Score: ${player.sneakViolationScore.toFixed(1)}]`,
          newPos,
          now,
          roomBlocks,
          'server/anticheat/sneakSpeedChecker.ts',
          'ERR_SNEAK_SPEED',
          'Velocidade horizontal com shift/agachamento ativo acima do limite físico.'
        ),
      };
    }
  } else {
    // Reduz rapidamente o score sob movimento legítimo
    player.sneakViolationScore = Math.max(0, player.sneakViolationScore - 0.5);
  }
  return null;
}

