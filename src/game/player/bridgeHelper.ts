import * as THREE from 'three';
import { VoxelWorld } from '../world/voxelWorld';

export interface BridgePlaceTarget {
  placePos: THREE.Vector3;
  sourceBlockPos: THREE.Vector3;
  faceNormal: THREE.Vector3;
  hitPoint: THREE.Vector3;
}

const tempTargetPoint = new THREE.Vector3();
const tempBox = new THREE.Box3();

/**
 * Standard Minecraft-faithful block placement:
 * 1. If ray directly hits a solid block face:
 *    - Places directly against the hit face (hit.blockPos + hit.normal).
 *    - If placing on the top face would collide with the player's own body (looking down at feet while standing on it),
 *      it places against the outer edge face in the aimed direction.
 * 2. If ray misses the exact voxel mesh (aiming at the block edge silhouette into the air):
 *    - Finds the adjacent empty space next to the block under feet in the aimed direction.
 */
export function findBridgePlacement(
  raycaster: THREE.Raycaster,
  world: VoxelWorld,
  maxDistance = 5.2,
  playerPos?: THREE.Vector3,
  isSneaking = false
): BridgePlaceTarget | null {
  const hit = world.raycast(raycaster, maxDistance);

  if (hit) {
    if (playerPos) {
      const feetBlockY = Math.round(playerPos.y - 0.5);

      if (hit.normal.y === 1) {
        const topTargetPos = new THREE.Vector3(hit.blockPos.x, hit.blockPos.y + 1, hit.blockPos.z);
        if (!world.isSolid(topTargetPos.x, topTargetPos.y, topTargetPos.z)) {
          let collidesWithPlayer = false;
          if (playerPos) {
            const bMinX = topTargetPos.x - 0.49;
            const bMaxX = topTargetPos.x + 0.49;
            const bMinZ = topTargetPos.z - 0.49;
            const bMaxZ = topTargetPos.z + 0.49;
            const bMinY = topTargetPos.y - 0.49;
            const bMaxY = topTargetPos.y + 0.49;

            const pMinX = playerPos.x - 0.25;
            const pMaxX = playerPos.x + 0.25;
            const pMinZ = playerPos.z - 0.25;
            const pMaxZ = playerPos.z + 0.25;
            const pMinY = playerPos.y + 0.01;
            const pMaxY = playerPos.y + 1.8;

            collidesWithPlayer = (pMinX < bMaxX && pMaxX > bMinX) &&
                               (pMinZ < bMaxZ && pMaxZ > bMinZ) &&
                               (pMinY < bMaxY && pMaxY > bMinY);
          }

          if (!collidesWithPlayer) {
            return {
              placePos: topTargetPos,
              sourceBlockPos: hit.blockPos.clone(),
              faceNormal: new THREE.Vector3(0, 1, 0),
              hitPoint: hit.point.clone(),
            };
          }

          const relX = hit.point.x - hit.blockPos.x;
          const relZ = hit.point.z - hit.blockPos.z;
          const offX = playerPos ? playerPos.x - hit.blockPos.x : 0;
          const offZ = playerPos ? playerPos.z - hit.blockPos.z : 0;
          const camDir = raycaster.ray.direction;

          const candidates: Array<{ nx: number; nz: number; score: number }> = [];

          if (Math.abs(relX) > 0.05) candidates.push({ nx: Math.sign(relX) || 1, nz: 0, score: Math.abs(relX) + 1.0 });
          if (Math.abs(relZ) > 0.05) candidates.push({ nx: 0, nz: Math.sign(relZ) || 1, score: Math.abs(relZ) + 1.0 });

          if (Math.abs(offX) > 0.15) candidates.push({ nx: Math.sign(offX) || 1, nz: 0, score: Math.abs(offX) + 0.8 });
          if (Math.abs(offZ) > 0.15) candidates.push({ nx: 0, nz: Math.sign(offZ) || 1, score: Math.abs(offZ) + 0.8 });

          if (Math.abs(camDir.x) > 0.05) candidates.push({ nx: Math.sign(camDir.x) || 1, nz: 0, score: Math.abs(camDir.x) });
          if (Math.abs(camDir.z) > 0.05) candidates.push({ nx: 0, nz: Math.sign(camDir.z) || 1, score: Math.abs(camDir.z) });

          candidates.sort((a, b) => b.score - a.score);

          for (const cand of candidates) {
            const sidePos = new THREE.Vector3(hit.blockPos.x + cand.nx, hit.blockPos.y, hit.blockPos.z + cand.nz);
            if (!world.isSolid(sidePos.x, sidePos.y, sidePos.z)) {
              return {
                placePos: sidePos,
                sourceBlockPos: hit.blockPos.clone(),
                faceNormal: new THREE.Vector3(cand.nx, 0, cand.nz),
                hitPoint: hit.point.clone(),
              };
            }
          }
        }
      }
    }

    if (!world.isSolid(hit.placePos.x, hit.placePos.y, hit.placePos.z)) {
      return {
        placePos: hit.placePos.clone(),
        sourceBlockPos: hit.blockPos.clone(),
        faceNormal: hit.normal.clone(),
        hitPoint: hit.point.clone(),
      };
    }
  }

  // 2. Air bridge assist: when looking down towards empty air near the edge of solid ground
  if (playerPos) {
    const ray = raycaster.ray;
    const feetBlockY = Math.round(playerPos.y - 0.5);
    const px = playerPos.x;
    const pz = playerPos.z;
    const baseFeetX = Math.floor(px + 0.5);
    const baseFeetZ = Math.floor(pz + 0.5);

    // Find the solid block currently under / nearest to player's feet
    let supportBlock: THREE.Vector3 | null = null;
    let bestDistSq = 999;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const bx = baseFeetX + dx;
        const bz = baseFeetZ + dz;
        if (world.isSolid(bx, feetBlockY, bz)) {
          const distSq = (px - bx) ** 2 + (pz - bz) ** 2;
          if (distSq < bestDistSq) {
            bestDistSq = distSq;
            supportBlock = new THREE.Vector3(bx, feetBlockY, bz);
          }
        }
      }
    }

    if (supportBlock && ray.direction.y < -0.05) {
      const dirX = ray.direction.x;
      const dirZ = ray.direction.z;

      const candidates: Array<{ dx: number; dz: number; score: number }> = [];
      if (Math.abs(dirX) > 0.05) {
        candidates.push({ dx: Math.sign(dirX), dz: 0, score: Math.abs(dirX) });
      }
      if (Math.abs(dirZ) > 0.05) {
        candidates.push({ dx: 0, dz: Math.sign(dirZ), score: Math.abs(dirZ) });
      }
      const offX = px - supportBlock.x;
      const offZ = pz - supportBlock.z;
      if (Math.abs(offX) > 0.2) {
        candidates.push({ dx: Math.sign(offX), dz: 0, score: Math.abs(offX) * 0.9 });
      }
      if (Math.abs(offZ) > 0.2) {
        candidates.push({ dx: 0, dz: Math.sign(offZ), score: Math.abs(offZ) * 0.9 });
      }

      candidates.sort((a, b) => b.score - a.score);

      for (const cand of candidates) {
        const placeX = supportBlock.x + cand.dx;
        const placeY = supportBlock.y;
        const placeZ = supportBlock.z + cand.dz;

        if (!world.isSolid(placeX, placeY, placeZ)) {
          const hitPoint = new THREE.Vector3(
            placeX + (cand.dx !== 0 ? -cand.dx * 0.5 : 0),
            placeY + 0.5,
            placeZ + (cand.dz !== 0 ? -cand.dz * 0.5 : 0)
          );
          return {
            placePos: new THREE.Vector3(placeX, placeY, placeZ),
            sourceBlockPos: supportBlock.clone(),
            faceNormal: new THREE.Vector3(cand.dx, 0, cand.dz),
            hitPoint,
          };
        }
      }
    }
  }

  return null;
}

