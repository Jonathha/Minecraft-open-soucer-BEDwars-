import { VoxelWorld } from '../world/voxelWorld';
import { BlockPlacePacket } from './types';
import { RotationAnalytics } from './rotationAnalytics';
import { ScaffoldDetector } from './scaffoldDetector';
import { RateLimiter } from './rateLimiter';
import { ViolationManager } from './violationManager';
import { MovementLogger } from './movementLogger';
import { rejectionLogStore } from './rejectionLogStore';

export function evaluateBlockPlacementCheck(
  packet: BlockPlacePacket,
  world: VoxelWorld,
  isVisual: boolean,
  rotationAnalytics: RotationAnalytics,
  rateLimiter: RateLimiter,
  violationManager: ViolationManager,
  movementLogger: MovementLogger
): boolean {
  if (isVisual) {
    const details = `Tentativa de colocação de bloco fantasma / item não verificado (${packet.position.x.toFixed(0)}, ${packet.position.y.toFixed(0)}, ${packet.position.z.toFixed(0)})`;
    violationManager.addViolation({ module: 'scaffold_rotation', weight: 4.5, details });
    movementLogger.logPlacement(packet, false, details);
    rejectionLogStore.addLog({
      origin: 'client',
      rule: 'Ghost Block / Unverified Item',
      reason: details,
      file: 'src/game/anticheat/placementEvaluator.ts',
      error: 'ERR_CLIENT_GHOST_BLOCK',
      cause: 'Bloco marcado como isVisual no cliente.',
      blockType: packet.blockType,
      blockPos: { x: packet.position.x, y: packet.position.y, z: packet.position.z },
      playerPos: {
        x: Number(packet.playerPos.x.toFixed(2)),
        y: Number(packet.playerPos.y.toFixed(2)),
        z: Number(packet.playerPos.z.toFixed(2)),
      },
      condition: 'isVisual === true',
    });
    return false;
  }

  let isAllowed = true;
  let failReason = '';
  let failRule = '';
  let failFile = 'src/game/anticheat/placementEvaluator.ts';
  let failError = 'ERR_CLIENT_REJECTION';
  let failCause = '';

  const rotCheck = rotationAnalytics.checkRoboticRotation();
  if (rotCheck.isRobotic) {
    const { shouldBlock } = violationManager.addViolation({
      module: 'robotic_snap',
      weight: rotCheck.score,
      details: rotCheck.reason,
    });
    if (shouldBlock) {
      isAllowed = false;
      failRule = 'Robotic Snap / Scaffold Rotation';
      failReason = rotCheck.reason;
      failFile = 'src/game/anticheat/rotationAnalytics.ts';
      failError = 'ERR_ROBOTIC_ROTATION';
      failCause = `Rotação instantânea ou padrão robótico detectado na amostragem da câmera (${rotCheck.reason}).`;
    }
  }

  if (isAllowed) {
    const rateViolation = rateLimiter.checkRate();
    if (rateViolation) {
      const { shouldBlock } = violationManager.addViolation(rateViolation);
      if (shouldBlock) {
        isAllowed = false;
        failRule = 'FastPlace / Nuker Rate Limit';
        failReason = rateViolation.details;
        failFile = 'src/game/anticheat/rateLimiter.ts';
        failError = 'ERR_CLIENT_FAST_PLACE';
        failCause = `Taxa de cliques ou posicionamentos de bloco excedeu a janela de segurança local.`;
      }
    }
  }

  if (isAllowed) {
    const scaffoldViolation = ScaffoldDetector.validatePlacement(packet, world);
    if (scaffoldViolation) {
      violationManager.addViolation(scaffoldViolation);
      isAllowed = false;
      failRule = scaffoldViolation.module === 'scaffold_nolook'
        ? 'Scaffold / No-Look Placement'
        : (scaffoldViolation.module || 'Scaffold / Reach / Air Place');
      failReason = scaffoldViolation.details;
      failFile = 'src/game/anticheat/scaffoldDetector.ts';
      failError = scaffoldViolation.module === 'reach'
        ? 'ERR_CLIENT_REACH'
        : scaffoldViolation.module === 'air_place'
        ? 'ERR_CLIENT_AIR_PLACE'
        : 'ERR_CLIENT_SCAFFOLD';
      failCause = scaffoldViolation.details;
    }
  }

  if (!isAllowed) {
    rejectionLogStore.addLog({
      origin: 'client',
      rule: failRule || 'Client Anti-Cheat Rejection',
      reason: failReason,
      file: failFile,
      error: failError,
      cause: failCause || failReason,
      blockType: packet.blockType,
      blockPos: { x: packet.position.x, y: packet.position.y, z: packet.position.z },
      playerPos: {
        x: Number(packet.playerPos.x.toFixed(2)),
        y: Number(packet.playerPos.y.toFixed(2)),
        z: Number(packet.playerPos.z.toFixed(2)),
      },
      condition: failReason,
    });
  }

  movementLogger.logPlacement(packet, isAllowed, failReason);
  return isAllowed;
}
