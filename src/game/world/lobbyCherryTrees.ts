import { BlockType } from '../../types/game';
import { VoxelWorld } from './voxelWorld';

const CHERRY_LOG = 18 as BlockType;
const CHERRY_LEAVES = 19 as BlockType;

/**
 * Grows majestic cherry blossom trees framing the central spawn plaza,
 * giving immediate visual grandeur with blooming sakura canopies.
 */
export function buildLobbyCherryTrees(world: VoxelWorld) {
  const treePositions = [
    [-10, 0, -8], [10, 0, -8],
    [-10, 0, 8], [10, 0, 8],
    [-16, 0, 0], [16, 0, 0],
    [-14, 0, -16], [14, 0, -16],
    [0, 0, 14]
  ];

  for (const [tx, ty, tz] of treePositions) {
    // 1. Upright cherry wood trunk
    for (let h = 1; h <= 4; h++) {
      world.setBlock(tx, ty + h, tz, CHERRY_LOG);
    }
    // 2. Lateral stylized branches
    world.setBlock(tx + 1, ty + 4, tz, CHERRY_LOG);
    world.setBlock(tx + 2, ty + 5, tz, CHERRY_LOG);
    world.setBlock(tx - 1, ty + 4, tz, CHERRY_LOG);
    world.setBlock(tx - 2, ty + 5, tz, CHERRY_LOG);

    // 3. Dense, beautiful pink sakura canopies
    growCanopy(world, tx, ty + 5, tz, 3);
    growCanopy(world, tx + 2, ty + 6, tz, 2);
    growCanopy(world, tx - 2, ty + 6, tz, 2);
  }
}

function growCanopy(world: VoxelWorld, cx: number, cy: number, cz: number, radius: number) {
  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      for (let y = -1; y <= 2; y++) {
        if (Math.hypot(x, z) + Math.abs(y) * 0.7 <= radius + 0.3) {
          const rx = cx + x;
          const ry = cy + y;
          const rz = cz + z;
          if (world.getBlock(rx, ry, rz) === BlockType.AIR) {
            world.setBlock(rx, ry, rz, CHERRY_LEAVES);
          }
        }
      }
    }
  }
}
