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
  emeraldGens: THREE.Vector3[];
  redShopPos: THREE.Vector3;
  blueShopPos: THREE.Vector3;
  redUpgradePos: THREE.Vector3;
  blueUpgradePos: THREE.Vector3;
}

// Barreira invisível atrás de cada ilha base (|z| máximo permitido para andar/construir).
export const ARENA_BARRIER_Z = 33;

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
  buildIsland(0, 10, 22, 9, BlockType.RED_WOOL);
  // Red Bed
  world.setBlock(0, 11, 25, BlockType.BED_RED);
  world.setBlock(0, 11, 26, BlockType.BED_RED);
  // Red Generator
  world.setBlock(0, 10, 20, BlockType.IRON_BLOCK);
  world.setBlock(0, 11, 20, BlockType.AIR);
  // Red Shops
  world.setBlock(-4, 11, 22, BlockType.GOLD_BLOCK);
  world.setBlock(4, 11, 22, BlockType.DIAMOND_BLOCK);
  // Red Diamond & Emerald generators
  world.setBlock(-6, 11, 25, BlockType.DIAMOND_BLOCK);
  world.setBlock(-6, 12, 25, BlockType.GLOWSTONE);
  world.setBlock(6, 11, 25, BlockType.EMERALD_BLOCK);
  world.setBlock(6, 12, 25, BlockType.GLOWSTONE);

  // 2. Blue Base Island (Z = -22)
  buildIsland(0, 10, -22, 9, BlockType.BLUE_WOOL);
  // Blue Bed
  world.setBlock(0, 11, -25, BlockType.BED_BLUE);
  world.setBlock(0, 11, -26, BlockType.BED_BLUE);
  // Blue Generator
  world.setBlock(0, 10, -20, BlockType.IRON_BLOCK);
  world.setBlock(0, 11, -20, BlockType.AIR);
  // Blue Shops
  world.setBlock(-4, 11, -22, BlockType.GOLD_BLOCK);
  world.setBlock(4, 11, -22, BlockType.DIAMOND_BLOCK);
  // Blue Diamond & Emerald generators
  world.setBlock(-6, 11, -25, BlockType.DIAMOND_BLOCK);
  world.setBlock(-6, 12, -25, BlockType.GLOWSTONE);
  world.setBlock(6, 11, -25, BlockType.EMERALD_BLOCK);
  world.setBlock(6, 12, -25, BlockType.GLOWSTONE);

  // Barreira translúcida atrás de cada base (a colisão e o bloqueio de construção são feitos em ARENA_BARRIER_Z)
  const barrierMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false });
  for (const sign of [1, -1]) {
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(48, 40), barrierMat);
    pane.position.set(0, 10, sign * ARENA_BARRIER_Z);
    scene.add(pane);
  }

  return {
    redSpawn: new THREE.Vector3(0, 10.5, 21),
    blueSpawn: new THREE.Vector3(0, 10.5, -21),
    redBedPos: new THREE.Vector3(0, 11, 25),
    blueBedPos: new THREE.Vector3(0, 11, -25),
    redGenPos: new THREE.Vector3(0, 11, 20),
    blueGenPos: new THREE.Vector3(0, 11, -20),
    diamondGens: [new THREE.Vector3(-6, 12, 25), new THREE.Vector3(-6, 12, -25)],
    emeraldGens: [new THREE.Vector3(6, 12, 25), new THREE.Vector3(6, 12, -25)],
    redShopPos: new THREE.Vector3(-4, 12, 22),
    blueShopPos: new THREE.Vector3(-4, 12, -22),
    redUpgradePos: new THREE.Vector3(4, 12, 22),
    blueUpgradePos: new THREE.Vector3(4, 12, -22),
  };
}
