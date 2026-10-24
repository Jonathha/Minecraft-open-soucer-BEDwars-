import * as THREE from 'three';
import { BlockType } from '../../types/game';
import { VoxelWorld } from './voxelWorld';

export interface ArenaLocations {
  redSpawn: THREE.Vector3;
  blueSpawn: THREE.Vector3;
  redBedPos: THREE.Vector3;
  blueBedPos: THREE.Vector3;
  redGenPos: THREE.Vector3;
  blueGenPos: THREE.Vector3;
  diamondGens: THREE.Vector3[];
  emeraldGen: THREE.Vector3;
  redShopPos: THREE.Vector3;
  blueShopPos: THREE.Vector3;
  redUpgradePos: THREE.Vector3;
  blueUpgradePos: THREE.Vector3;
}

export function buildBedWarsArena(scene: THREE.Scene, world: VoxelWorld): ArenaLocations {
  scene.background = new THREE.Color(0x38bdf8);
  scene.fog = new THREE.FogExp2(0x38bdf8, 0.015);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x475569, 1.0);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffedd5, 1.4);
  dirLight.position.set(30, 50, 10);
  scene.add(dirLight);

  // Helper to build a floating teardrop island
  const buildIsland = (centerX: number, centerY: number, centerZ: number, radius: number, topBlock: BlockType) => {
    for (let x = -radius; x <= radius; x++) {
      for (let z = -radius; z <= radius; z++) {
        const d = Math.hypot(x, z);
        if (d <= radius) {
          const depth = Math.max(1, Math.round((radius - d) * 1.5) + 1);
          for (let y = 0; y >= -depth; y--) {
            const b = y === 0 ? topBlock : y >= -2 ? BlockType.DIRT : BlockType.STONE;
            world.setBlock(centerX + x, centerY + y, centerZ + z, b);
          }
        }
      }
    }
  };

  // 1. Red Base Island (Z = +22)
  buildIsland(0, 10, 22, 6, BlockType.RED_WOOL);
  // Red Bed
  world.setBlock(0, 11, 25, BlockType.BED_RED);
  world.setBlock(0, 11, 26, BlockType.BED_RED);
  // Red Generator
  world.setBlock(0, 10, 20, BlockType.IRON_BLOCK);
  world.setBlock(0, 11, 20, BlockType.AIR);
  // Red Shops
  world.setBlock(-4, 11, 22, BlockType.GOLD_BLOCK);
  world.setBlock(4, 11, 22, BlockType.DIAMOND_BLOCK);

  // 2. Blue Base Island (Z = -22)
  buildIsland(0, 10, -22, 6, BlockType.BLUE_WOOL);
  // Blue Bed
  world.setBlock(0, 11, -25, BlockType.BED_BLUE);
  world.setBlock(0, 11, -26, BlockType.BED_BLUE);
  // Blue Generator
  world.setBlock(0, 10, -20, BlockType.IRON_BLOCK);
  world.setBlock(0, 11, -20, BlockType.AIR);
  // Blue Shops
  world.setBlock(-4, 11, -22, BlockType.GOLD_BLOCK);
  world.setBlock(4, 11, -22, BlockType.DIAMOND_BLOCK);

  // 3. Center Emerald Island (X = 0, Z = 0)
  buildIsland(0, 12, 0, 5, BlockType.STONE);
  world.setBlock(0, 13, 0, BlockType.EMERALD_BLOCK);
  world.setBlock(0, 14, 0, BlockType.GLOWSTONE);
  // Center pillars
  world.setBlock(-3, 13, -3, BlockType.BRICKS);
  world.setBlock(3, 13, -3, BlockType.BRICKS);
  world.setBlock(-3, 13, 3, BlockType.BRICKS);
  world.setBlock(3, 13, 3, BlockType.BRICKS);

  // 4. Side Diamond Islands (East & West)
  buildIsland(-18, 11, 0, 4, BlockType.STONE);
  world.setBlock(-18, 12, 0, BlockType.DIAMOND_BLOCK);
  world.setBlock(-18, 13, 0, BlockType.GLOWSTONE);

  buildIsland(18, 11, 0, 4, BlockType.STONE);
  world.setBlock(18, 12, 0, BlockType.DIAMOND_BLOCK);
  world.setBlock(18, 13, 0, BlockType.GLOWSTONE);

  return {
    redSpawn: new THREE.Vector3(0, 10.5, 21),
    blueSpawn: new THREE.Vector3(0, 10.5, -21),
    redBedPos: new THREE.Vector3(0, 11, 25),
    blueBedPos: new THREE.Vector3(0, 11, -25),
    redGenPos: new THREE.Vector3(0, 11, 20),
    blueGenPos: new THREE.Vector3(0, 11, -20),
    diamondGens: [new THREE.Vector3(-18, 13, 0), new THREE.Vector3(18, 13, 0)],
    emeraldGen: new THREE.Vector3(0, 14, 0),
    redShopPos: new THREE.Vector3(-4, 12, 22),
    blueShopPos: new THREE.Vector3(-4, 12, -22),
    redUpgradePos: new THREE.Vector3(4, 12, 22),
    blueUpgradePos: new THREE.Vector3(4, 12, -22),
  };
}
