import { BlockType, ShopItem } from '../../types/game';
import { EQUIPMENT_ITEMS } from './equipmentShopData';
import { TEAM_UPGRADES } from './teamUpgradesData';

export { TEAM_UPGRADES };

export const SHOP_ITEMS: ShopItem[] = [
  // BLOCKS
  {
    id: 'wool_16',
    name: 'Lã (16x)',
    category: 'blocks',
    costType: 'iron',
    costAmount: 4,
    item: { id: 'wool', name: 'Lã', type: 'block', blockType: BlockType.WHITE_WOOL, count: 16 }
  },
  {
    id: 'wood_16',
    name: 'Madeira (16x)',
    category: 'blocks',
    costType: 'gold',
    costAmount: 4,
    item: { id: 'wood', name: 'Madeira', type: 'block', blockType: BlockType.WOOD, count: 16 }
  },
  {
    id: 'endstone_12',
    name: 'Pedra do Fim (12x)',
    category: 'blocks',
    costType: 'iron',
    costAmount: 24,
    item: { id: 'endstone', name: 'Pedra do Fim', type: 'block', blockType: BlockType.STONE, count: 12 }
  },
  {
    id: 'obsidian_4',
    name: 'Obsidiana (4x)',
    category: 'blocks',
    costType: 'emerald',
    costAmount: 4,
    item: { id: 'obsidian', name: 'Obsidiana', type: 'block', blockType: BlockType.OBSIDIAN, count: 4 }
  },

  ...EQUIPMENT_ITEMS
];
