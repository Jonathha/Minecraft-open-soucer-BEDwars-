export type GameState = 'menu' | 'lobby' | 'queue' | 'countdown' | 'match' | 'ended';

export type Team = 'red' | 'blue';

export type ResourceType = 'iron' | 'gold' | 'diamond' | 'emerald';

export interface ResourceCounts {
  iron: number;
  gold: number;
  diamond: number;
  emerald: number;
}

export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  WOOD = 4,
  LEAVES = 5,
  RED_WOOL = 6,
  BLUE_WOOL = 7,
  WHITE_WOOL = 8,
  BRICKS = 9,
  DIAMOND_BLOCK = 10,
  EMERALD_BLOCK = 11,
  OBSIDIAN = 12,
  BED_RED = 13,
  BED_BLUE = 14,
  GOLD_BLOCK = 15,
  IRON_BLOCK = 16,
  GLOWSTONE = 17,
}

export interface HotbarItem {
  id: string;
  name: string;
  type: 'block' | 'weapon' | 'tool' | 'utility';
  blockType?: BlockType;
  count: number;
  color?: string;
  damage?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'blocks' | 'weapons' | 'armor' | 'tools' | 'utility';
  costType: ResourceType;
  costAmount: number;
  item: HotbarItem;
}

export interface TeamUpgrade {
  id: string;
  name: string;
  costType: ResourceType;
  costAmount: number;
  level: number;
  maxLevel: number;
  description: string;
}

export interface MatchInfo {
  roomId: string;
  myTeam: Team;
  opponentName: string;
  redBed: boolean;
  blueBed: boolean;
  redAlive: boolean;
  blueAlive: boolean;
  winner?: Team;
}
