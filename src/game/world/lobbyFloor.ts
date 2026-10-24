import { BlockType } from '../../types/game';
import { VoxelWorld } from './voxelWorld';

/**
 * Builds the floating island base with a refined spawn plaza,
 * warm wooden promenades, and lush green gardens for cherry trees.
 */
export function buildLobbyFloor(world: VoxelWorld) {
  for (let x = -28; x <= 28; x++) {
    for (let z = -28; z <= 28; z++) {
      const dist = Math.hypot(x, z);
      if (dist > 28) continue; // Elegant circular boundary

      let topBlock = BlockType.GRASS;

      // 1. Central Spawn Plaza
      if (dist < 2.5) {
        topBlock = BlockType.GOLD_BLOCK; // Central emblem
      } else if (dist < 5.5) {
        topBlock = BlockType.WHITE_WOOL; // Clean marble/wool plaza
      } else if (dist < 7) {
        topBlock = BlockType.WOOD; // Plaza wooden border
      } else if (Math.abs(x) <= 2 && z < 0 && z >= -16) {
        // Grand avenue leading directly to the 1v1 Portal
        topBlock = (Math.abs(x) === 2) ? BlockType.STONE : BlockType.WOOD;
      } else if (Math.abs(z) <= 1 && Math.abs(x) >= 7 && Math.abs(x) <= 20) {
        // East-West walking promenades
        topBlock = BlockType.WOOD;
      } else if (dist >= 25) {
        // Outer island parapet
        topBlock = BlockType.STONE;
      }

      world.setBlock(x, 0, z, topBlock);

      // Natural floating island underside cone (only generating the visible outer shell)
      if (dist <= 8) {
        world.setBlock(x, -5, z, BlockType.OBSIDIAN);
      } else if (dist <= 18) {
        world.setBlock(x, -3, z, BlockType.STONE);
      } else if (dist <= 28) {
        world.setBlock(x, -1, z, BlockType.DIRT);
      }
    }
  }
}
