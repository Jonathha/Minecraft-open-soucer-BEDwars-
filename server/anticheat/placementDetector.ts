import { ServerPlayerData, CheckResult } from './types';
import { isSolidBlockOnServer } from './serverWorldBlocks';
import { checkPlacementReach, deductServerBlockInventory } from './serverPlacementReach';

export { isSolidBlockOnServer };

export interface BlockPlacePayload {
  x: number;
  y: number;
  z: number;
  type: number;
  isVisual?: boolean;
  faceNormal?: { x: number; y: number; z: number };
  cameraDir?: { x: number; y: number; z: number };
  cameraPos?: { x: number; y: number; z: number };
}

export class PlacementDetector {
  private static readonly MAX_PLACE_REACH = 6.8;
  private static readonly MAX_PLACES_PER_SEC = 25;

  public static checkPlacement(
    player: ServerPlayerData,
    block: BlockPlacePayload,
    now: number = Date.now(),
    roomBlocks?: Array<{ x: number; y: number; z: number }>
  ): CheckResult {
    if (block.isVisual) {
      return {
        allowed: false,
        violation: {
          category: 'PLACEMENT',
          rule: 'Ghost Block / Unverified Item',
          weight: 4.5,
          details: `Attempted placement of unverified visual/fake block at (${block.x}, ${block.y}, ${block.z})`,
          timestamp: now,
          file: 'server/anticheat/placementDetector.ts',
          error: 'ERR_GHOST_BLOCK_UNVERIFIED',
          cause: 'Bloco marcado como isVisual ou não verificado pela loja do servidor.',
        },
      };
    }

    if (block.cameraDir && block.cameraPos) {
      const cPos = block.cameraPos;
      const cDir = block.cameraDir;
      const targetX = block.x;
      const targetY = block.y;
      const targetZ = block.z;

      const normFaceX = block.faceNormal ? Math.round(block.faceNormal.x) : 0;
      const normFaceY = block.faceNormal ? Math.round(block.faceNormal.y) : 0;
      const normFaceZ = block.faceNormal ? Math.round(block.faceNormal.z) : 0;

      const sourceX = targetX - normFaceX;
      const sourceY = targetY - normFaceY;
      const sourceZ = targetZ - normFaceZ;

      const dTargetX = targetX - cPos.x;
      const dTargetY = targetY - cPos.y;
      const dTargetZ = targetZ - cPos.z;
      const lenTarget = Math.sqrt(dTargetX * dTargetX + dTargetY * dTargetY + dTargetZ * dTargetZ) || 1;
      const dotTarget = (cDir.x * dTargetX + cDir.y * dTargetY + cDir.z * dTargetZ) / lenTarget;

      const dSourceX = sourceX - cPos.x;
      const dSourceY = sourceY - cPos.y;
      const dSourceZ = sourceZ - cPos.z;
      const lenSource = Math.sqrt(dSourceX * dSourceX + dSourceY * dSourceY + dSourceZ * dSourceZ) || 1;
      const dotSource = (cDir.x * dSourceX + cDir.y * dSourceY + cDir.z * dSourceZ) / lenSource;

      if (dotTarget < 0.25 && dotSource < 0.25) {
        return {
          allowed: false,
          violation: {
            category: 'PLACEMENT',
            rule: 'Scaffold / No-Look Placement',
            weight: 3.0,
            details: `Server detected placement without looking at block at (${targetX}, ${targetY}, ${targetZ})`,
            timestamp: now,
            file: 'server/anticheat/placementDetector.ts',
            error: 'ERR_SERVER_SCAFFOLD_NOLOOK',
            cause: 'O servidor detectou colocação de bloco sem alinhamento de mira (Scaffold No-Look).',
          },
        };
      }
    }

    const isWool = block.type === 6 || block.type === 7 || block.type === 8;
    const woolCount = isWool && player.blockInventory
      ? (player.blockInventory.get(6) || 0) + (player.blockInventory.get(7) || 0) + (player.blockInventory.get(8) || 0)
      : 0;
    const blockCount = isWool ? Math.max(64, woolCount) : (player.blockInventory ? player.blockInventory.get(block.type) || 0 : 0);
    if (blockCount <= 0) {
      return {
        allowed: false,
        violation: {
          category: 'PLACEMENT',
          rule: 'Unauthorized Block / Inventory Spoofing',
          weight: 4.5,
          details: `Player attempted to place block type ${block.type} without server inventory balance`,
          timestamp: now,
          file: 'server/anticheat/placementDetector.ts',
          error: 'ERR_INVENTORY_SPOOF',
          cause: `Saldo de inventário no servidor do bloco tipo ${block.type} é ${blockCount} (saldo zerado após morte ou compra não sincronizada).`,
        },
      };
    }

    const reachResult = checkPlacementReach(player, block, now, this.MAX_PLACE_REACH);
    if (reachResult) return reachResult;

    if (now - player.lastPlaceResetTime > 1000) {
      player.placeCountWindow = 0;
      player.lastPlaceResetTime = now;
    }
    player.placeCountWindow += 1;

    if (player.placeCountWindow > this.MAX_PLACES_PER_SEC) {
      return {
        allowed: false,
        violation: {
          category: 'PLACEMENT',
          rule: 'FastPlace / Nuker Burst',
          weight: 3.0,
          details: `Placed ${player.placeCountWindow} blocks in 1 second window`,
          timestamp: now,
          file: 'server/anticheat/placementDetector.ts',
          error: 'ERR_FAST_PLACE',
          cause: `Taxa de colocação de blocos (${player.placeCountWindow}/s) excedeu o limite máximo de ${this.MAX_PLACES_PER_SEC}/s.`,
        },
      };
    }

    let hasDirectNeighbor = false;
    // Busca em uma área de 3x3x3 ao redor do bloco alvo (incluindo diagonais e quinas)
    // Isso evita o efeito dominó onde um único bloco rejeitado por lag arruina toda a ponte do jogador
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          if (dx === 0 && dy === 0 && dz === 0) continue;
          if (isSolidBlockOnServer(block.x + dx, block.y + dy, block.z + dz, roomBlocks)) {
            hasDirectNeighbor = true;
            break;
          }
        }
        if (hasDirectNeighbor) break;
      }
      if (hasDirectNeighbor) break;
    }

    // Checa se é adjacente a blocos recentemente colocados pelo jogador (evita dessincronização por lag)
    if (!hasDirectNeighbor && player.recentPlacedBlocks && player.recentPlacedBlocks.length > 0) {
      for (const b of player.recentPlacedBlocks) {
        if (now - b.timestamp < 3000) {
          const dx = Math.abs(block.x - b.x);
          const dy = Math.abs(block.y - b.y);
          const dz = Math.abs(block.z - b.z);
          if (dx <= 1 && dy <= 1 && dz <= 1 && (dx + dy + dz > 0)) {
            hasDirectNeighbor = true;
            break;
          }
        }
      }
    }

    // Checa se é um pillar jump legítimo (bloco colocado sob os pés iniciando a partir de solo legítimo)
    if (!hasDirectNeighbor && player.lastLegitGroundedPos && player.lastPos) {
      const isUnderFeet = Math.abs(block.x - player.lastPos.x) <= 1.25 && Math.abs(block.z - player.lastPos.z) <= 1.25;
      const isNearGroundedBase = Math.abs(block.x - player.lastLegitGroundedPos.x) <= 1.5 &&
        Math.abs(block.z - player.lastLegitGroundedPos.z) <= 1.5 &&
        (block.y >= player.lastLegitGroundedPos.y - 1.5 && block.y <= player.lastLegitGroundedPos.y + 2.5);
      if (isUnderFeet && isNearGroundedBase) {
        hasDirectNeighbor = true;
      }
    }

    if (!hasDirectNeighbor) {
      return {
        allowed: false,
        violation: {
          category: 'PLACEMENT',
          rule: 'Air Place / Ghost Block Scaffold',
          weight: 3.0,
          details: `Tentativa de colocar bloco no ar ou sobre bloco falso em (${block.x}, ${block.y}, ${block.z}) sem bloco adjacente no servidor`,
          timestamp: now,
          file: 'server/anticheat/placementDetector.ts',
          error: 'ERR_SCAFFOLD_AIR_PLACE',
          cause: 'O bloco está sendo colocado no ar ou sobre uma superfície não existente no servidor.',
        },
      };
    }

    deductServerBlockInventory(player, block.type, isWool, blockCount);
    player.lastPlaceTime = now;
    return { allowed: true };
  }
}
