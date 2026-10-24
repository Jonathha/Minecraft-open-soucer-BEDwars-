import * as THREE from 'three';
import { BlockType } from '../../types/game';

export interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export function getParticleColor(blockType: BlockType): number {
  switch (blockType) {
    case BlockType.STONE: return 0x777777;
    case BlockType.GRASS: return 0x5b8c32;
    case BlockType.DIRT: return 0x866043;
    case BlockType.RED_WOOL: return 0xdc2626;
    case BlockType.BLUE_WOOL: return 0x2563eb;
    case BlockType.WHITE_WOOL: return 0xededed;
    case BlockType.WOOD: return 0x935b2e;
    case BlockType.LEAVES: return 0x2e7d32;
    case BlockType.BRICKS: return 0x9a3412;
    case BlockType.OBSIDIAN: return 0x18122B;
    case BlockType.DIAMOND_BLOCK: return 0x38bdf8;
    case BlockType.EMERALD_BLOCK: return 0x22c55e;
    case BlockType.GOLD_BLOCK: return 0xeab308;
    case BlockType.IRON_BLOCK: return 0xd1d5db;
    case BlockType.GLOWSTONE: return 0xfef08a;
    default: return 0x888888;
  }
}
