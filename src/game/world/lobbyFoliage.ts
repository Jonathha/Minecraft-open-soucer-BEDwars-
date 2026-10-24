import { BlockType } from '../../types/game';
import { VoxelWorld } from './voxelWorld';

const CHERRY_LEAVES = 19 as BlockType;

/**
 * Generates aesthetic details on the ground of the lobby, including
 * fallen cherry blossom petals, grass accents, and classic lamp posts.
 */
export function buildLobbyFoliage(world: VoxelWorld) {
  // 1. Classic glowstone lamp posts with wood supports
  const lampPositions = [
    [-6, -6], [6, -6], [-6, 6], [6, 6],
    [-15, -15], [15, -15], [-15, 15], [15, 15]
  ];
  for (const [lx, lz] of lampPositions) {
    world.setBlock(lx, 1, lz, BlockType.WOOD);
    world.setBlock(lx, 2, lz, BlockType.WOOD);
    world.setBlock(lx, 3, lz, BlockType.GLOWSTONE);
  }

  // 2. Scattering fallen pink petals on the grassy floor areas
  for (let x = -25; x <= 25; x++) {
    for (let z = -25; z <= 25; z++) {
      const dist = Math.hypot(x, z);
      if (dist > 14 && dist < 25) {
        // Only spawn on actual grass blocks
        if (world.getBlock(x, 0, z) === BlockType.GRASS) {
          // 8% chance to scatter a fallen cherry blossom petal group
          if (Math.random() < 0.08 && world.getBlock(x, 1, z) === BlockType.AIR) {
            world.setBlock(x, 1, z, CHERRY_LEAVES);
          }
        }
      }
    }
  }
}
