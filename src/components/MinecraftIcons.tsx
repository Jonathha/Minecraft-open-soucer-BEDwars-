import React from 'react';
import { BlockType } from '../types/game';
import { WoolBlockIcon } from './MinecraftSvgIcons';

export { HeartIcon, ArmorIcon, HungerIcon } from './MinecraftHudIcons';
export {
  WoodenSwordIcon, IronIngotIcon, GoldIngotIcon,
  DiamondIcon, EmeraldIcon, WoolBlockIcon
} from './MinecraftSvgIcons';

export const GenericItemIcon: React.FC<{ id: string; name?: string; blockType?: BlockType }> = ({
  id, name, blockType
}) => {
  let src: string | null = null;
  if (id === 'sword_stone') src = '/textures/items/swordStone.png';
  else if (id === 'sword_iron') src = '/textures/items/swordIron.png';
  else if (id === 'sword_diamond') src = '/textures/items/swordDiamond.png';
  else if (id.includes('sword')) src = '/textures/items/swordWood.png';
  else if (id === 'iron_ingot' || id === 'iron') src = '/textures/items/ingotIron.png';
  else if (id === 'gold_ingot' || id === 'gold') src = '/textures/items/ingotGold.png';
  else if (id === 'diamond') src = '/textures/items/diamond.png';
  else if (id === 'emerald') src = '/textures/items/emerald.png';
  else if (id === 'armor_chain') src = '/textures/items/chestplateChain.png';
  else if (id === 'armor_iron') src = '/textures/items/chestplateIron.png';
  else if (id === 'armor_diamond') src = '/textures/items/chestplateDiamond.png';
  else if (id === 'pickaxe_wood') src = '/textures/items/pickaxeWood.png';
  else if (id === 'pickaxe_iron') src = '/textures/items/pickaxeIron.png';
  else if (id === 'pickaxe_diamond') src = '/textures/items/pickaxeDiamond.png';
  else if (id.includes('pickaxe')) src = '/textures/items/pickaxeWood.png';
  else if (id.includes('shears')) src = '/textures/items/shears.png';
  else if (id === 'golden_apple' || id.includes('apple')) src = '/textures/items/appleGold.png';
  else if (id === 'fireball') src = '/textures/items/fireball.png';
  else if (id === 'ender_pearl') src = '/textures/items/ender_pearl.png';
  else if (id === 'wood' || blockType === BlockType.WOOD) src = '/textures/blocks/wood.png';
  else if (id === 'endstone') src = '/textures/blocks/whiteStone.png';
  else if (id === 'obsidian' || blockType === BlockType.OBSIDIAN) src = '/textures/blocks/obsidian.png';
  else if (id === 'wool' || blockType === BlockType.RED_WOOL) src = '/textures/blocks/red_wool.png';
  else if (blockType === BlockType.BLUE_WOOL) src = '/textures/blocks/blue_wool.png';
  else if (blockType === BlockType.WHITE_WOOL) src = '/textures/blocks/white_wool.png';
  else if (id.includes('bed') || blockType === BlockType.BED_RED || blockType === BlockType.BED_BLUE) src = '/textures/items/bed.png';

  if (src) {
    return (
      <img
        src={src}
        alt={name || id}
        className="w-7 h-7 md:w-8 md:h-8 object-contain select-none"
        style={{ imageRendering: 'pixelated' }}
        draggable={false}
      />
    );
  }
  return <WoolBlockIcon blockType={blockType || BlockType.WOOD} />;
};
