import * as THREE from 'three';
import { createFaceTexture } from './officialSteveSkin';

export type BoxFaceUV = [number, number, number, number]; // [u, v, w, h]

/**
 * Creates an array of 6 materials for a BoxGeometry corresponding to
 * [+X, -X, +Y, -Y, +Z, -Z] in standard Three.js order.
 */
export function createBoxMaterials(
  texture: THREE.Texture,
  faces: [BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV]
): THREE.Material[] {
  return faces.map(([u, v, w, h]) => {
    const map = createFaceTexture(texture, u, v, w, h);
    return new THREE.MeshLambertMaterial({
      map,
      transparent: false,
      alphaTest: 0.5,
    });
  });
}

// Authentic UV coordinates in 64x64 official Minecraft player skin format
export const STEVE_HEAD_UV: [BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV] = [
  [16, 8, 8, 8],  // +X (Right)
  [0, 8, 8, 8],   // -X (Left)
  [8, 0, 8, 8],   // +Y (Top)
  [16, 0, 8, 8],  // -Y (Bottom)
  [8, 8, 8, 8],   // +Z (Front face)
  [24, 8, 8, 8],  // -Z (Back)
];

export const STEVE_TORSO_UV: [BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV] = [
  [28, 20, 4, 12], // +X (Left side)
  [16, 20, 4, 12], // -X (Right side)
  [20, 16, 8, 4],  // +Y (Top)
  [28, 16, 8, 4],  // -Y (Bottom)
  [20, 20, 8, 12], // +Z (Front)
  [32, 20, 8, 12], // -Z (Back)
];

export const STEVE_ARM_R_UV: [BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV] = [
  [48, 20, 4, 12], [40, 20, 4, 12], [44, 16, 4, 4], [48, 16, 4, 4], [44, 20, 4, 12], [52, 20, 4, 12]
];

export const STEVE_ARM_L_UV: [BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV] = [
  [40, 52, 4, 12], [32, 52, 4, 12], [36, 48, 4, 4], [40, 48, 4, 4], [36, 52, 4, 12], [44, 52, 4, 12]
];

export const STEVE_LEG_R_UV: [BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV] = [
  [8, 20, 4, 12], [0, 20, 4, 12], [4, 16, 4, 4], [8, 16, 4, 4], [4, 20, 4, 12], [12, 20, 4, 12]
];

export const STEVE_LEG_L_UV: [BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV, BoxFaceUV] = [
  [24, 52, 4, 12], [16, 52, 4, 12], [20, 48, 4, 4], [24, 48, 4, 4], [20, 52, 4, 12], [28, 52, 4, 12]
];
