import * as THREE from 'three';
import { PlayerController } from '../player/playerController';
import { ViolationManager } from './violationManager';
import { MovementLogger } from './movementLogger';
import { VoxelWorld } from '../world/voxelWorld';
import { checkBlockOverlap, getBlockBounds, findNearestSafeOpenPosition } from '../player/voxelCollision';

export function checkClientSpeed(
  player: PlayerController,
  speedXZ: number,
  velocityMagXZ: number,
  lastValidPos: THREE.Vector3,
  speedViolationCooldown: number,
  violationManager: ViolationManager,
  movementLogger: MovementLogger,
  onRollback?: () => void
): { cooldown: number } {
  const isSneaking = player.isSneaking || player.keys.sneak;
  // Durante ponte legítima (ninja bridge/shift bridge), a velocidade varia entre 1.3 e 4.5 m/s na desaceleração.
  // Somente velocidades genuinamente anormais (> 5.2 m/s no shift, ou > 9.5 m/s em sprint normal) são infrações.
  const maxAllowedSpeed = isSneaking ? 5.2 : 9.5;
  const effectiveSpeed = Math.max(speedXZ, velocityMagXZ);
  let newCooldown = speedViolationCooldown;

  if (effectiveSpeed > maxAllowedSpeed) {
    if (speedViolationCooldown <= 0) {
      newCooldown = 0.3;
      const ratio = effectiveSpeed / maxAllowedSpeed;
      const weight = isSneaking ? 4.5 : Math.min(6.0, 2.0 * ratio);
      const details = isSneaking
        ? `Sneak Speed: Velocidade anormal no Shift (${effectiveSpeed.toFixed(1)} m/s > 5.2 m/s)`
        : `Speed Hack: Velocidade ${effectiveSpeed.toFixed(1)} m/s (Máx permitido: ${maxAllowedSpeed} m/s)`;
      violationManager.addViolation({ module: 'speed', weight, details });
      movementLogger.logViolation('speed', details, violationManager.getScore());
    }
    // Puxa o jogador de volta em caso de Speed Hack ilícito
    player.position.copy(lastValidPos);
    player.velocity.set(0, 0, 0);

    // Remove qualquer bloco colocado durante a ação ilícita
    if (onRollback) onRollback();
  } else {
    lastValidPos.copy(player.position);
  }
  return { cooldown: newCooldown };
}

export function checkClientFly(
  player: PlayerController,
  dY: number,
  airtime: number,
  timeRisingInAir: number,
  lastValidPos: THREE.Vector3,
  lastGroundedPos: THREE.Vector3,
  flyViolationCooldown: number,
  violationManager: ViolationManager,
  movementLogger: MovementLogger,
  onRollback?: () => void
): { cooldown: number } {
  let isFlyDetected = false;
  let flyReason = '';
  let newCooldown = flyViolationCooldown;

  const heightAboveGround = player.position.y - lastGroundedPos.y;

  // 1. Subida impossível no ar sem apoio (pulo máximo físico no jogo é ~1.64m)
  if (!player.isGrounded && heightAboveGround > 1.68 && (dY > 0.06 || timeRisingInAir > 0.40)) {
    isFlyDetected = true;
    flyReason = `Fly Hack: Subiu ${heightAboveGround.toFixed(1)} blocos no ar sem apoio`;
  } else if (!player.isGrounded && timeRisingInAir > 0.42) {
    // Subida contínua anormal no ar (pulo normal sobe por apenas ~0.386s)
    isFlyDetected = true;
    flyReason = `Fly Hack: Subida contínua no ar por ${timeRisingInAir.toFixed(2)}s`;
  } else if (!player.isGrounded && airtime > 0.85 && Math.abs(player.velocity.y) < 0.2 && Math.abs(dY) < 0.05) {
    // Flutuação imóvel no ar sem gravidade (hovering)
    isFlyDetected = true;
    flyReason = `Fly Hack: Flutuando no ar por ${airtime.toFixed(2)}s (vy: ${player.velocity.y.toFixed(1)})`;
  } else if (player.velocity.y > 9.8) {
    // Impulso vertical ilícito (pulo normal é 8.5 m/s)
    isFlyDetected = true;
    flyReason = `Y-Fly: Subida vertical anormal (vy: ${player.velocity.y.toFixed(1)} m/s)`;
  }

  if (isFlyDetected) {
    if (flyViolationCooldown <= 0) {
      newCooldown = 0.3;
      violationManager.addViolation({ module: 'fly', weight: 4.5, details: flyReason });
      movementLogger.logViolation('fly', flyReason, violationManager.getScore());
    }
    // Puxa o jogador de volta
    if (player.position.y > lastGroundedPos.y + 1.25) {
      player.position.copy(lastGroundedPos);
    } else {
      player.position.copy(lastValidPos);
    }
    player.velocity.set(0, -8.0, 0);

    if (onRollback) onRollback();
  }
  return { cooldown: newCooldown };
}

/**
 * Phase / In-Block Detector:
 * Identifica atravessamento ilícito de blocos sólidos.
 * Ignora micro-penetrações de alguns centímetros (bordas e cantos) de acordo com a velocidade,
 * e em caso de invasão profunda real (> 0.20m), puxa o jogador para a posição segura de segundos antes
 * ou para o local livre mais próximo.
 */
export function checkClientPhase(
  player: PlayerController,
  world: VoxelWorld,
  safeHistory: Array<{ pos: THREE.Vector3; time: number }>,
  violationManager: ViolationManager,
  movementLogger: MovementLogger,
  onRollback?: () => void
): boolean {
  const r = 0.28;
  const h = 1.7;

  // Calcula se o centro ou grande parte da hitbox do jogador está profundamente inserida em blocos sólidos
  const pMinX = player.position.x - r;
  const pMaxX = player.position.x + r;
  const pMinY = player.position.y;
  const pMaxY = player.position.y + h;
  const pMinZ = player.position.z - r;
  const pMaxZ = player.position.z + r;

  const minX = Math.floor(pMinX + 0.5);
  const maxX = Math.floor(pMaxX + 0.4999);
  const minZ = Math.floor(pMinZ + 0.5);
  const maxZ = Math.floor(pMaxZ + 0.4999);
  const minY = Math.floor(pMinY + 0.5);
  const maxY = Math.floor(pMaxY + 0.4999);

  let maxPenetration = 0;
  let deeplyPenetratedBlock: { x: number; y: number; z: number } | null = null;

  // Limiar de tolerância dinâmico com base na velocidade do jogador
  const currentSpeed = player.velocity.length();
  // Em alta velocidade (sprint/knockback), tolera até 0.18m de borda transitória
  const penetrationThreshold = Math.min(0.24, 0.18 + currentSpeed * 0.005);

  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      for (let y = minY; y <= maxY; y++) {
        const bounds = getBlockBounds(x, y, z, world);
        if (!bounds) continue;

        // Mede penetração em cada dimensão
        const penX = Math.min(pMaxX - bounds.minX, bounds.maxX - pMinX);
        const penY = Math.min(pMaxY - bounds.minY, bounds.maxY - pMinY);
        const penZ = Math.min(pMaxZ - bounds.minZ, bounds.maxZ - pMinZ);

        if (penX > 0.01 && penY > 0.01 && penZ > 0.01) {
          const blockPen = Math.min(penX, penY, penZ);
          if (blockPen > maxPenetration) {
            maxPenetration = blockPen;
            deeplyPenetratedBlock = { x, y, z };
          }
        }
      }
    }
  }

  // Se a penetração for apenas de alguns centímetros (borda/quinas), não há violação
  if (maxPenetration < penetrationThreshold || !deeplyPenetratedBlock) {
    return false;
  }

  // Violação de Phase / Atravessar blocos confirmada
  const details = `Phase / Block Penetration: Penetrou ${(maxPenetration * 100).toFixed(0)}cm no bloco sólido em (${deeplyPenetratedBlock.x}, ${deeplyPenetratedBlock.y}, ${deeplyPenetratedBlock.z})`;
  violationManager.addViolation({ module: 'phase', weight: 5.0, details });
  movementLogger.logViolation('phase', details, violationManager.getScore());

  // 1. Tenta recuperar a posição de segundos antes de ter entrado
  const now = Date.now();
  let targetPos: THREE.Vector3 | null = null;

  // Busca uma posição segura registrada entre 0.4s e 2.0s atrás
  for (let i = safeHistory.length - 1; i >= 0; i--) {
    const entry = safeHistory[i];
    const age = (now - entry.time) / 1000;
    if (age >= 0.35 && age <= 2.2) {
      // Verifica se aquela área ainda está limpa e sem blocos
      if (!checkBlockOverlap(entry.pos.x, entry.pos.y, entry.pos.z, r, h, world, 0.02)) {
        targetPos = entry.pos.clone();
        break;
      }
    }
  }

  // 2. Se a posição anterior também tiver blocos (ex: tentativa de bugar/trancar em blocos),
  // o anti-cheat analisa e encontra um local próximo naquele bloco onde não há nada
  if (!targetPos) {
    targetPos = findNearestSafeOpenPosition(player.position, world, r, h);
  }

  if (targetPos) {
    player.position.copy(targetPos);
    player.velocity.set(0, 0, 0);
  }

  if (onRollback) onRollback();
  return true;
}
