import { BlockType } from '../../types/game';
import { VoxelWorld } from './voxelWorld';

/**
 * Generates an exciting, vertical floating parkour challenge leading to
 * the grand towers. Uses a variety of block rewards and glowstones.
 */
export function buildLobbyParkour(world: VoxelWorld) {
  // Floating parkour blocks ascending towards the south-east tower
  const jumps = [
    [10, 1, 10, BlockType.GOLD_BLOCK],
    [7, 2, 11, BlockType.BRICKS],
    [8, 3, 14, BlockType.STONE],
    [11, 4, 15, BlockType.BRICKS],
    [14, 5, 14, BlockType.STONE],
    [15, 6, 11, BlockType.GOLD_BLOCK],
    [14, 7, 8, BlockType.BRICKS],
    [11, 8, 7, BlockType.STONE],
    [8, 9, 8, BlockType.DIAMOND_BLOCK],
    [8, 10, 12, BlockType.BRICKS],
    [11, 11, 14, BlockType.GLOWSTONE],
    [14, 11, 15, BlockType.DIAMOND_BLOCK]
  ];

  for (const [x, y, z, block] of jumps) {
    // Check if destination block is empty air
    if (world.getBlock(x, y, z) === BlockType.AIR) {
      world.setBlock(x, y, z, block);
    }
  }

  // Final victory landing pad under tower
  world.setBlock(15, 12, 15, BlockType.GOLD_BLOCK);
}
