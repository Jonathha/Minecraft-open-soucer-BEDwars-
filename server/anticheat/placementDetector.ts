import { ServerPlayerData, CheckResult } from './types';
import { isSolidBlockOnServer } from './serverWorldBlocks';
import { checkPlacementReach, deductServerBlockInventory } from './serverPlacementReach';
import { hasFaceSupport, hasAnyNeighbor, isAimingAtPlacement } from './serverPlacementAim';

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
  private static readonly MAX_PLACES_PER_SEC = 14;

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

    // Alvo já ocupado: rejeita sem punir
    if (isSolidBlockOnServer(block.x, block.y, block.z, roomBlocks)) return { allowed: false };

    // O bloco precisa encostar numa FACE de um bloco sólido; só diagonal é rejeitada sem punir (evita efeito dominó)
    if (!hasFaceSupport(block, roomBlocks)) {
      if (hasAnyNeighbor(block, roomBlocks)) return { allowed: false };
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

    // Mira conferida pela rotação (yaw/pitch) que o servidor conhece, nunca pelo que vem no pacote do bloco
    if (player.lastPitch !== undefined && player.lastPos && !isAimingAtPlacement(player, block, roomBlocks)) {
      return {
        allowed: false,
        violation: {
          category: 'PLACEMENT',
          rule: 'Scaffold / No-Look Placement',
          weight: 2.0,
          details: `Colocou bloco em (${block.x}, ${block.y}, ${block.z}) sem estar mirando nele`,
          timestamp: now,
          file: 'server/anticheat/placementDetector.ts',
          error: 'ERR_SERVER_SCAFFOLD_NOLOOK',
          cause: 'A mira conhecida pelo servidor não aponta para o local do bloco colocado.',
        },
      };
    }

    deductServerBlockInventory(player, block.type, isWool, blockCount);
    player.lastPlaceTime = now;
    return { allowed: true };
  }
}
