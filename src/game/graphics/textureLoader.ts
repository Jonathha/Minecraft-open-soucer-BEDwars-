import * as THREE from 'three';
import { BlockType } from '../../types/game';
import { loadBlockTexture, getNoise, getBrickTexture } from './textureLoaderUtil';

export function loadBlockTextureByType(type: BlockType): THREE.Texture {
  switch (type) {
    case BlockType.DIRT:
      return loadBlockTexture('/textures/blocks/dirt.png', (ctx) => ctx.drawImage(getNoise([134, 96, 67], 20).image, 0, 0));
    case BlockType.STONE:
      return loadBlockTexture('/textures/blocks/stone.png', (ctx) => ctx.drawImage(getNoise([125, 125, 125], 22).image, 0, 0));
    case BlockType.WOOD:
      return loadBlockTexture('/textures/blocks/wood.png', (ctx) => ctx.drawImage(getNoise([150, 110, 70], 18).image, 0, 0));
    case BlockType.LEAVES:
      return loadBlockTexture('/textures/blocks/leaves.png', (ctx) => ctx.drawImage(getNoise([45, 115, 35], 25).image, 0, 0));
    case 18 as BlockType: // Cherry Log
      return loadBlockTexture('/textures/blocks/cherry_log.png', (ctx) => ctx.drawImage(getNoise([48, 25, 33], 15).image, 0, 0));
    case 19 as BlockType: // Cherry Leaves
      return loadBlockTexture('/textures/blocks/cherry_leaves.png', (ctx) => ctx.drawImage(getNoise([243, 161, 186], 18).image, 0, 0));
    case BlockType.RED_WOOL:
      return loadBlockTexture('/textures/blocks/red_wool.png', (ctx) => ctx.drawImage(getNoise([175, 40, 35], 18).image, 0, 0));
    case BlockType.BLUE_WOOL:
      return loadBlockTexture('/textures/blocks/blue_wool.png', (ctx) => ctx.drawImage(getNoise([40, 70, 180], 18).image, 0, 0));
    case BlockType.WHITE_WOOL:
      return loadBlockTexture('/textures/blocks/white_wool.png', (ctx) => ctx.drawImage(getNoise([220, 220, 220], 15).image, 0, 0));
    case BlockType.BRICKS:
      return loadBlockTexture('/textures/blocks/brick.png', (ctx) => ctx.drawImage(getBrickTexture().image, 0, 0));
    case BlockType.DIAMOND_BLOCK:
      return loadBlockTexture('/textures/blocks/blockDiamond.png', (ctx) => ctx.drawImage(getNoise([75, 225, 215], 25).image, 0, 0));
    case BlockType.EMERALD_BLOCK:
      return loadBlockTexture('/textures/blocks/blockEmerald.png', (ctx) => ctx.drawImage(getNoise([45, 200, 80], 25).image, 0, 0));
    case BlockType.GOLD_BLOCK:
      return loadBlockTexture('/textures/blocks/blockGold.png', (ctx) => ctx.drawImage(getNoise([235, 200, 50], 25).image, 0, 0));
    case BlockType.IRON_BLOCK:
      return loadBlockTexture('/textures/blocks/blockIron.png', (ctx) => ctx.drawImage(getNoise([210, 210, 215], 15).image, 0, 0));
    case BlockType.OBSIDIAN:
      return loadBlockTexture('/textures/blocks/obsidian.png', (ctx) => ctx.drawImage(getNoise([25, 15, 35], 15).image, 0, 0));
    case BlockType.GLOWSTONE:
      return loadBlockTexture('/textures/blocks/lightgem.png', (ctx) => ctx.drawImage(getNoise([230, 190, 90], 30).image, 0, 0));
    default:
      return loadBlockTexture('/textures/blocks/stone.png', (ctx) => ctx.drawImage(getNoise([120, 120, 120], 20).image, 0, 0));
  }
}
