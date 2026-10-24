import * as THREE from 'three';
import { BlockType } from '../../types/game';
import { loadBlockTexture, textureCache, getNoise, getGrassSideTexture } from './textureLoaderUtil';
import { getBedMaterials } from './bedMaterials';
import { loadBlockTextureByType } from './textureLoader';

export { loadBlockTexture, getBedMaterials };

const materialCache = new Map<BlockType, THREE.Material | THREE.Material[]>();

export function getGrassMaterials(): THREE.Material[] {
  let top = textureCache.get('grass_top');
  if (!top) {
    top = loadBlockTexture('/textures/blocks/grass_top.png', (ctx) => ctx.drawImage(getNoise([87, 166, 56], 18).image, 0, 0));
    textureCache.set('grass_top', top);
  }
  let side = textureCache.get('grass_side');
  if (!side) {
    side = loadBlockTexture('/textures/blocks/grass_side.png', (ctx) => ctx.drawImage(getGrassSideTexture().image, 0, 0));
    textureCache.set('grass_side', side);
  }
  let bot = textureCache.get('dirt');
  if (!bot) {
    bot = loadBlockTexture('/textures/blocks/dirt.png', (ctx) => ctx.drawImage(getNoise([134, 96, 67], 20).image, 0, 0));
    textureCache.set('dirt', bot);
  }
  const matTop = new THREE.MeshLambertMaterial({ map: top });
  const matSide = new THREE.MeshLambertMaterial({ map: side });
  const matBot = new THREE.MeshLambertMaterial({ map: bot });
  return [matSide, matSide, matTop, matBot, matSide, matSide];
}

export function getBlockMaterial(type: BlockType, pos?: { x: number; y: number; z: number }): THREE.Material | THREE.Material[] {
  if (type === BlockType.BED_RED) {
    return getBedMaterials('red', pos ? pos.z > 25 : true);
  }
  if (type === BlockType.BED_BLUE) {
    return getBedMaterials('blue', pos ? pos.z < -25 : true);
  }

  const cached = materialCache.get(type);
  if (cached) return cached;

  if (type === BlockType.GRASS) {
    const grassMats = getGrassMaterials();
    materialCache.set(type, grassMats);
    return grassMats;
  }

  const key = `tex_${type}`;
  let tex = textureCache.get(key);
  if (!tex) {
    tex = loadBlockTextureByType(type);
    textureCache.set(key, tex);
  }

  const mat = new THREE.MeshLambertMaterial({ map: tex });
  materialCache.set(type, mat);
  return mat;
}
