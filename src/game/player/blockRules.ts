import * as THREE from 'three';
import { BlockType, GameState, HotbarItem, Team } from '../../types/game';
import { VoxelWorld } from '../world/voxelWorld';
import { ArenaLocations, ARENA_BARRIER_Z } from '../world/arenaBuilder';

export function getBlockHardness(type: BlockType, heldItem?: HotbarItem): number {
  let baseHardness = 1.2;

  switch (type) {
    case BlockType.BED_RED:
    case BlockType.BED_BLUE:
      baseHardness = 0.5;
      break;
    case BlockType.WHITE_WOOL:
    case BlockType.RED_WOOL:
    case BlockType.BLUE_WOOL:
      baseHardness = 0.8;
      if (heldItem?.id === 'shears') return 0.15;
      break;
    case BlockType.LEAVES:
      baseHardness = 0.3;
      if (heldItem?.id === 'shears') return 0.1;
      break;
    case BlockType.WOOD:
      baseHardness = 1.8;
      if (heldItem?.id === 'axe') return 0.45;
      break;
    case BlockType.DIRT:
    case BlockType.GRASS:
      baseHardness = 0.7;
      break;
    case BlockType.STONE:
    case BlockType.BRICKS:
      baseHardness = 2.8;
      if (heldItem?.id === 'pickaxe') return 0.6;
      break;
    case BlockType.OBSIDIAN:
      baseHardness = 8.0;
      if (heldItem?.id === 'pickaxe') return 2.5;
      break;
    case BlockType.GLOWSTONE:
      baseHardness = 0.4;
      break;
    default:
      baseHardness = 1.2;
  }

  if (heldItem?.type === 'tool' && heldItem.id === 'pickaxe') {
    return Math.max(0.2, baseHardness * 0.4);
  }
  if (heldItem?.type === 'weapon') {
    return Math.max(0.25, baseHardness * 0.7);
  }

  return baseHardness;
}

export function canBreakBlock(
  state: GameState,
  blockType: BlockType,
  blockPos: THREE.Vector3,
  world: VoxelWorld,
  myTeam: Team
): boolean {
  if (state !== 'match') return false;
  if (blockType === BlockType.BED_RED) return myTeam === 'blue';
  if (blockType === BlockType.BED_BLUE) return myTeam === 'red';
  return world.isPlayerPlaced(blockPos.x, blockPos.y, blockPos.z);
}

export function canPlaceBlock(
  state: GameState,
  placePos: THREE.Vector3,
  arenaLocs: ArenaLocations | null,
  playerPos: THREE.Vector3
): boolean {
  if (state !== 'match') return false;
  if (Math.abs(placePos.z) > ARENA_BARRIER_Z - 1) return false;

  // Block bounding box (1x1x1 cube at placePos)
  const bMinX = placePos.x - 0.49;
  const bMaxX = placePos.x + 0.49;
  const bMinZ = placePos.z - 0.49;
  const bMaxZ = placePos.z + 0.49;
  const bMinY = placePos.y - 0.49;
  const bMaxY = placePos.y + 0.49;

  // Player body bounding box for block placement collision
  const pMinX = playerPos.x - 0.25;
  const pMaxX = playerPos.x + 0.25;
  const pMinZ = playerPos.z - 0.25;
  const pMaxZ = playerPos.z + 0.25;
  const pMinY = playerPos.y + 0.01;
  const pMaxY = playerPos.y + 1.8;

  const overlapsX = pMinX < bMaxX && pMaxX > bMinX;
  const overlapsZ = pMinZ < bMaxZ && pMaxZ > bMinZ;
  const overlapsY = pMinY < bMaxY && pMaxY > bMinY;

  // If the proposed block deeply collides with the player's core body, block placement (must jump to tower up)
  if (overlapsX && overlapsZ && overlapsY) {
    return false;
  }

  if (arenaLocs) {
    const isInsideNPC = (npcPos: THREE.Vector3) =>
      Math.abs(placePos.x - npcPos.x) < 0.6 &&
      Math.abs(placePos.z - npcPos.z) < 0.6 &&
      placePos.y >= npcPos.y &&
      placePos.y <= npcPos.y + 1.8;

    if (isInsideNPC(arenaLocs.redShopPos)) return false;
    if (isInsideNPC(arenaLocs.blueShopPos)) return false;
    if (isInsideNPC(arenaLocs.redUpgradePos)) return false;
    if (isInsideNPC(arenaLocs.blueUpgradePos)) return false;
  }

  return true;
}
