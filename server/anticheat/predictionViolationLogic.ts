import { Vector3D } from './types';
import { isSolidBlockOnServer } from './serverWorldBlocks';
import { checkServerFootprint } from './groundCheck';

import { PredictionConstants } from './predictionConstants';

export interface ViolationFlags {
  isAscendingInAir: boolean;
  isClipping: boolean;
  isFloating: boolean;
  isPlatformUnreachable: boolean;
  isIllegalStep: boolean;
}

export function checkViolations(
  newPos: Vector3D,
  lastPos: Vector3D,
  lastLegitGroundedY: number,
  serverGrounded: boolean,
  jumpInput: boolean,
  isUnderKnockback: boolean,
  dt: number,
  roomBlocks?: any[],
  isSneaking = false
): ViolationFlags {
  const dy = newPos.y - lastPos.y;
  
  // A velocidade vertical máxima com margem de segurança para desníveis e saltos
  const maxPossibleAscent = (PredictionConstants.MAX_UPWARDS_VELOCITY * dt) + 0.6;
  const isAscendingInAir = !serverGrounded && dy > maxPossibleAscent;
  
  // Degraus legítimos (passo máximo é 1.0 bloco sem pular)
  const isIllegalStep = serverGrounded && !jumpInput && dy > 1.35;

  // Clipping checks: só detecta se o jogador estiver profundamente dentro de terreno sólido do mapa estático
  const r = 0.20;
  const h = 1.6;
  let isClipping = false;
  
  const minX = Math.floor(newPos.x - r + 0.5);
  const maxX = Math.floor(newPos.x + r + 0.4999);
  const minZ = Math.floor(newPos.z - r + 0.5);
  const maxZ = Math.floor(newPos.z + r + 0.4999);
  // O bloco de chão que sustenta os pés tem topo em y + 0.5. Apenas blocos no nível do tronco/cabeça do mapa estático contam como noclip
  const minY = Math.floor(newPos.y + 0.6);
  const maxY = Math.floor(newPos.y + h - 0.2);

  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      for (let y = minY; y <= maxY; y++) {
        // Verifica apenas blocos estáticos do mapa (sem roomBlocks dinâmicos) para evitar falsos positivos ao colocar blocos
        if (isSolidBlockOnServer(x, y, z, undefined)) {
          const blockTop = y + 0.5;
          const blockBottom = y - 0.5;
          const overlapX = Math.abs(newPos.x - x) < 0.25;
          const overlapZ = Math.abs(newPos.z - z) < 0.25;
          const overlapY = blockTop > newPos.y + 0.6 && blockBottom < newPos.y + h - 0.2;

          if (overlapX && overlapZ && overlapY) {
            isClipping = true;
          }
        }
      }
    }
  }
    
  const isNewGrounded = checkServerFootprint(newPos.x, newPos.y, newPos.z, roomBlocks, isSneaking);
  // Flutuando/Voando: se o jogador não tem suporte de bloco no servidor nem no ponto anterior nem no atual,
  // e sua altura permanece horizontal ou subindo (sem decair com a gravidade)
  const isFloating = !serverGrounded && !isNewGrounded && !isUnderKnockback && (newPos.y >= lastPos.y - 0.03 || dy > 0.05);

  const heightDiffFromGround = newPos.y - lastLegitGroundedY;
  
  // Considera inalcançável se o jogador estiver voando mais de 4.0 blocos acima de qualquer chão sólido
  const isPlatformUnreachable = !isUnderKnockback && heightDiffFromGround > 4.0;

  return { isAscendingInAir, isClipping, isFloating, isPlatformUnreachable, isIllegalStep };
}
