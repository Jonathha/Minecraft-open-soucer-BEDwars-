import { ServerPlayerData, CheckResult } from './types';
import { BlockPlacePayload } from './placementDetector';

export function checkPlacementReach(
  player: ServerPlayerData,
  block: BlockPlacePayload,
  now: number,
  maxReach: number
): CheckResult | null {
  const playerPos = player.lastPos;
  if (!playerPos) return null;

  let minDistance = Infinity;
  const dX = block.x - playerPos.x;
  const dY = block.y - playerPos.y;
  const dZ = block.z - playerPos.z;
  minDistance = Math.sqrt(dX * dX + dY * dY + dZ * dZ);

  if (player.posHistory && player.posHistory.length > 0) {
    for (let i = player.posHistory.length - 1; i >= 0; i--) {
      const entry = player.posHistory[i];
      if (now - entry.timestamp > 2500) break;
      const hX = block.x - entry.pos.x;
      const hY = block.y - entry.pos.y;
      const hZ = block.z - entry.pos.z;
      const hDist = Math.sqrt(hX * hX + hY * hY + hZ * hZ);
      if (hDist < minDistance) minDistance = hDist;
    }
  }

  const effectiveMaxReach = Math.max(maxReach, 7.5);
  if (minDistance > effectiveMaxReach) {
    return {
      allowed: false,
      violation: {
        category: 'PLACEMENT',
        rule: 'Placement Reach / Far Place',
        weight: 3.5,
        details: `Attempted to place block ${minDistance.toFixed(2)} blocks away (max: ${effectiveMaxReach}m)`,
        timestamp: now,
        file: 'server/anticheat/serverPlacementReach.ts',
        error: 'ERR_PLACEMENT_REACH',
        cause: `Distância entre a posição do jogador (${playerPos.x.toFixed(1)}, ${playerPos.y.toFixed(1)}, ${playerPos.z.toFixed(1)}) e o bloco (${block.x}, ${block.y}, ${block.z}) é ${minDistance.toFixed(2)}m (limite: ${effectiveMaxReach}m).`,
      },
    };
  }
  return null;
}

export function deductServerBlockInventory(player: ServerPlayerData, blockType: number, isWool: boolean, blockCount: number) {
  if (!player.blockInventory) return;
  if (isWool) {
    if ((player.blockInventory.get(blockType) || 0) > 0) {
      player.blockInventory.set(blockType, (player.blockInventory.get(blockType) || 0) - 1);
    } else if ((player.blockInventory.get(6) || 0) > 0) {
      player.blockInventory.set(6, (player.blockInventory.get(6) || 0) - 1);
    } else if ((player.blockInventory.get(7) || 0) > 0) {
      player.blockInventory.set(7, (player.blockInventory.get(7) || 0) - 1);
    } else if ((player.blockInventory.get(8) || 0) > 0) {
      player.blockInventory.set(8, (player.blockInventory.get(8) || 0) - 1);
    }
  } else {
    player.blockInventory.set(blockType, Math.max(0, blockCount - 1));
  }
}
