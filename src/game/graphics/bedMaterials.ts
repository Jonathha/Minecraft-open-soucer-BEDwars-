import * as THREE from 'three';
import { loadBlockTexture } from './textureLoaderUtil';
import { createBedPartTexture } from './bedTextures';

const bedMaterialCache = new Map<string, THREE.Material[]>();

export function getBedMaterials(team: 'red' | 'blue', isHead: boolean): THREE.Material[] {
  const cacheKey = `bed_mats_${team}_${isHead ? 'head' : 'feet'}`;
  const cached = bedMaterialCache.get(cacheKey);
  if (cached) return cached;

  const matWood = new THREE.MeshLambertMaterial({
    map: loadBlockTexture('/textures/blocks/wood.png', (ctx) => {
      ctx.fillStyle = '#8c6832';
      ctx.fillRect(0, 0, 16, 16);
    })
  });

  if (isHead) {
    const topTex = createBedPartTexture('head_top', team);
    const sidePosX = createBedPartTexture('head_side_posX', team);
    const sideNegX = createBedPartTexture('head_side_negX', team);
    const endTex = createBedPartTexture('head_end', team);

    const matTop = new THREE.MeshLambertMaterial({ map: topTex });
    const matSidePosX = new THREE.MeshLambertMaterial({ map: sidePosX });
    const matSideNegX = new THREE.MeshLambertMaterial({ map: sideNegX });
    const matEnd = new THREE.MeshLambertMaterial({ map: endTex });

    const mats = team === 'red'
      ? [matSidePosX, matSideNegX, matTop, matWood, matEnd, matWood]
      : [matSidePosX, matSideNegX, matTop, matWood, matWood, matEnd];

    bedMaterialCache.set(cacheKey, mats);
    return mats;
  } else {
    const topTex = createBedPartTexture('feet_top', team);
    const sidePosX = createBedPartTexture('feet_side_posX', team);
    const sideNegX = createBedPartTexture('feet_side_negX', team);
    const endTex = createBedPartTexture('feet_end', team);

    const matTop = new THREE.MeshLambertMaterial({ map: topTex });
    const matSidePosX = new THREE.MeshLambertMaterial({ map: sidePosX });
    const matSideNegX = new THREE.MeshLambertMaterial({ map: sideNegX });
    const matEnd = new THREE.MeshLambertMaterial({ map: endTex });

    const mats = team === 'red'
      ? [matSidePosX, matSideNegX, matTop, matWood, matWood, matEnd]
      : [matSidePosX, matSideNegX, matTop, matWood, matEnd, matWood];

    bedMaterialCache.set(cacheKey, mats);
    return mats;
  }
}
