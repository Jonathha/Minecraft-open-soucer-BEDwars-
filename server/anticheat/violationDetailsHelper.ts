import { ServerPlayerData, Vector3D, ServerViolation, CheckCategory } from './types';
import { getDetailedBlockSupport } from './groundCheck';

export function buildRichViolation(
  player: ServerPlayerData,
  category: CheckCategory,
  rule: string,
  weight: number,
  baseDetails: string,
  newPos: Vector3D,
  now: number,
  roomBlocks?: Array<{ x: number; y: number; z: number }>,
  file = 'server/anticheat/flyDetector.ts',
  error = 'ERR_ILLEGAL_MOVEMENT',
  cause = 'Movimentação inconsistente com a física do servidor.'
): ServerViolation {
  const isSneaking = player.sneakViolationScore !== undefined && player.sneakViolationScore > 0;
  const support = getDetailedBlockSupport(newPos.x, newPos.y, newPos.z, roomBlocks, isSneaking);
  const pingVal = player.lastPing !== undefined ? player.lastPing : 0;
  const fpsVal = player.lastFps !== undefined ? player.lastFps : 60;
  const rttInfo = `Latência Data Center (us-east1): ${pingVal}ms`;

  const fullDetails = `${baseDetails} | Pos: (${newPos.x.toFixed(2)}, ${newPos.y.toFixed(2)}, ${newPos.z.toFixed(2)}) | Apoio: ${support.description} | Chão(Cli/Srv): ${player.lastClientGrounded ? 'SIM' : 'NÃO'}/${support.isSupported ? 'SIM' : 'NÃO'} | Ping: ${pingVal}ms | FPS: ${fpsVal} | RTT: ${pingVal}ms (us-east1)`;

  return {
    category,
    rule,
    weight,
    details: fullDetails,
    timestamp: now,
    file,
    error,
    cause,
    playerPos: { x: Number(newPos.x.toFixed(2)), y: Number(newPos.y.toFixed(2)), z: Number(newPos.z.toFixed(2)) },
    blockSupport: support.description,
    ping: pingVal,
    fps: fpsVal,
    rttInfo,
  };
}
