import { BlockType } from '../../types/game';
import { VoxelWorld } from './voxelWorld';

/**
 * Constructs the grand Bedwars Gateway portal and the NPC podium.
 */
export function buildLobbyStructures(world: VoxelWorld) {
  const pz = -16;

  // 1. Obsidian portal pillars and lintel
  for (let y = 1; y <= 8; y++) {
    world.setBlock(-3, y, pz, BlockType.OBSIDIAN);
    world.setBlock(3, y, pz, BlockType.OBSIDIAN);
  }
  for (let x = -3; x <= 3; x++) {
    world.setBlock(x, 8, pz, BlockType.OBSIDIAN);
    world.setBlock(x, 9, pz, BlockType.GOLD_BLOCK);
  }

  // 2. Gateway Lanterns and Wing Accents
  world.setBlock(-4, 7, pz, BlockType.GLOWSTONE);
  world.setBlock(4, 7, pz, BlockType.GLOWSTONE);
  world.setBlock(-4, 6, pz, BlockType.WOOD);
  world.setBlock(4, 6, pz, BlockType.WOOD);

  // 3. Portal vortex interior (Modern blue wool)
  for (let x = -2; x <= 2; x++) {
    for (let y = 1; y <= 7; y++) {
      world.setBlock(x, y, pz, BlockType.BLUE_WOOL);
    }
  }

  // 4. Pedestal for the 1v1 Matchmaker NPC
  world.setBlock(0, 1, -11, BlockType.GOLD_BLOCK);
  world.setBlock(0, 2, -11, BlockType.DIAMOND_BLOCK);
  world.setBlock(-1, 1, -11, BlockType.WOOD);
  world.setBlock(1, 1, -11, BlockType.WOOD);
  world.setBlock(0, 1, -12, BlockType.WOOD);
  world.setBlock(0, 1, -10, BlockType.WOOD);

  // Decorative glowstone under pedestal steps
  world.setBlock(-1, 0, -11, BlockType.GLOWSTONE);
  world.setBlock(1, 0, -11, BlockType.GLOWSTONE);
}
