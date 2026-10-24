import { BlockType } from '../../types/game';
import { VoxelWorld } from './voxelWorld';

export function buildLobbyTowers(world: VoxelWorld) {
  const towers = [
    [-18, -18],
    [18, -18],
    [-18, 18],
    [18, 18],
  ];

  for (const [tx, tz] of towers) {
    // Build vertical cylinder towers
    for (let y = 1; y <= 12; y++) {
      for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
          const d = Math.hypot(dx, dz);
          if (d > 2.2) continue; // Round towers

          // Hollow inside for a nice tower feel
          if (d < 1.2 && y < 11) continue;

          const block = y % 4 === 0 ? BlockType.STONE : BlockType.BRICKS;
          world.setBlock(tx + dx, y, tz + dz, block);
        }
      }
    }

    // Crown battlements and decorations
    for (let dx = -3; dx <= 3; dx++) {
      for (let dz = -3; dz <= 3; dz++) {
        const d = Math.hypot(dx, dz);
        if (d > 3.2 || d < 2.2) continue;

        if ((dx + dz) % 2 === 0) {
          world.setBlock(tx + dx, 13, tz + dz, BlockType.STONE);
        }
      }
    }

    // Tower lights
    world.setBlock(tx, 12, tz, BlockType.GLOWSTONE);
  }
}
