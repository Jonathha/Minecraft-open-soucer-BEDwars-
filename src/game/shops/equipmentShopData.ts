import { ShopItem } from '../../types/game';

export const EQUIPMENT_ITEMS: ShopItem[] = [
  // WEAPONS
  {
    id: 'sword_stone',
    name: 'Espada de Pedra',
    category: 'weapons',
    costType: 'iron',
    costAmount: 10,
    item: { id: 'sword_stone', name: 'Espada de Pedra', type: 'weapon', count: 1, damage: 5 }
  },
  {
    id: 'sword_iron',
    name: 'Espada de Ferro',
    category: 'weapons',
    costType: 'gold',
    costAmount: 7,
    item: { id: 'sword_iron', name: 'Espada de Ferro', type: 'weapon', count: 1, damage: 6 }
  },
  {
    id: 'sword_diamond',
    name: 'Espada de Diamante',
    category: 'weapons',
    costType: 'emerald',
    costAmount: 4,
    item: { id: 'sword_diamond', name: 'Espada de Diamante', type: 'weapon', count: 1, damage: 7 }
  },

  // ARMOR
  {
    id: 'armor_chain',
    name: 'Armadura de Cota',
    category: 'armor',
    costType: 'iron',
    costAmount: 40,
    item: { id: 'armor_chain', name: 'Armadura de Cota', type: 'utility', count: 1 }
  },
  {
    id: 'armor_iron',
    name: 'Armadura de Ferro',
    category: 'armor',
    costType: 'gold',
    costAmount: 12,
    item: { id: 'armor_iron', name: 'Armadura de Ferro', type: 'utility', count: 1 }
  },
  {
    id: 'armor_diamond',
    name: 'Armadura de Diamante',
    category: 'armor',
    costType: 'emerald',
    costAmount: 6,
    item: { id: 'armor_diamond', name: 'Armadura de Diamante', type: 'utility', count: 1 }
  },

  // TOOLS
  {
    id: 'shears',
    name: 'Tesoura',
    category: 'tools',
    costType: 'iron',
    costAmount: 20,
    item: { id: 'shears', name: 'Tesoura', type: 'tool', count: 1 }
  },
  {
    id: 'pickaxe_wood',
    name: 'Picareta de Madeira',
    category: 'tools',
    costType: 'iron',
    costAmount: 10,
    item: { id: 'pickaxe_wood', name: 'Picareta de Madeira', type: 'tool', count: 1 }
  },
  {
    id: 'pickaxe_iron',
    name: 'Picareta de Ferro',
    category: 'tools',
    costType: 'gold',
    costAmount: 3,
    item: { id: 'pickaxe_iron', name: 'Picareta de Ferro', type: 'tool', count: 1 }
  },

  // UTILITY
  {
    id: 'golden_apple',
    name: 'Maçã Dourada',
    category: 'utility',
    costType: 'gold',
    costAmount: 3,
    item: { id: 'golden_apple', name: 'Maçã Dourada (+Cura)', type: 'utility', count: 1 }
  },
  {
    id: 'fireball',
    name: 'Bola de Fogo',
    category: 'utility',
    costType: 'iron',
    costAmount: 40,
    item: { id: 'fireball', name: 'Bola de Fogo', type: 'utility', count: 1 }
  },
  {
    id: 'ender_pearl',
    name: 'Pérola do Fim',
    category: 'utility',
    costType: 'emerald',
    costAmount: 0,
    item: { id: 'ender_pearl', name: 'Pérola do Fim', type: 'utility', count: 1 }
  }
];
