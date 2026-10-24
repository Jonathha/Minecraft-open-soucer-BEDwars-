import { WebSocket } from 'ws';
import { ServerPlayerData, CheckResult } from './types';

export interface ServerShopItem {
  id: string;
  costType: 'iron' | 'gold' | 'diamond' | 'emerald';
  costAmount: number;
  count: number;
  blockType?: number;
}

export const SERVER_SHOP_CATALOG: Record<string, ServerShopItem> = {
  wool_16: { id: 'wool_16', costType: 'iron', costAmount: 4, count: 16, blockType: 8 },
  wood_16: { id: 'wood_16', costType: 'gold', costAmount: 4, count: 16, blockType: 4 },
  endstone_12: { id: 'endstone_12', costType: 'iron', costAmount: 24, count: 12, blockType: 3 },
  obsidian_4: { id: 'obsidian_4', costType: 'emerald', costAmount: 4, count: 4, blockType: 12 },
  sword_stone: { id: 'sword_stone', costType: 'iron', costAmount: 10, count: 1 },
  sword_iron: { id: 'sword_iron', costType: 'gold', costAmount: 7, count: 1 },
  sword_diamond: { id: 'sword_diamond', costType: 'emerald', costAmount: 4, count: 1 },
  gapple: { id: 'gapple', costType: 'gold', costAmount: 3, count: 1 },
  iron_armor: { id: 'iron_armor', costType: 'gold', costAmount: 12, count: 1 },
  diamond_armor: { id: 'diamond_armor', costType: 'emerald', costAmount: 6, count: 1 },
  ender_pearl: { id: 'ender_pearl', costType: 'emerald', costAmount: 0, count: 1 },
};

export function validateAndProcessShopBuy(
  ws: WebSocket & { id?: string; team?: 'red' | 'blue' },
  player: ServerPlayerData,
  purchase: { itemId: string; costType?: string; costAmount?: number; count?: number; blockType?: number }
): CheckResult {
  const catalogItem = SERVER_SHOP_CATALOG[purchase.itemId];
  if (!catalogItem) {
    return {
      allowed: false,
      violation: {
        category: 'PLACEMENT',
        rule: 'Shop Spoofing / Unknown Item',
        weight: 4.5,
        details: `Attempted to buy uncatalogued item ${purchase.itemId}`,
        timestamp: Date.now(),
        file: 'server/anticheat/serverShopValidator.ts',
        error: 'ERR_SHOP_UNKNOWN_ITEM',
        cause: `Item '${purchase.itemId}' não existe no catálogo oficial do servidor.`,
      },
    };
  }

  const now = Date.now();
  const elapsedSinceLastSync = Math.max(0, (now - (player.lastResourceSyncTime || player.matchStartTime)) / 1000);
  const passiveIron = Math.floor(elapsedSinceLastSync / 2.2);
  const passiveGold = Math.floor(elapsedSinceLastSync / 6.5);

  player.resources.iron += passiveIron;
  player.resources.gold += passiveGold;
  player.lastResourceSyncTime = now;

  const costType = catalogItem.costType;
  const costAmount = catalogItem.costAmount;
  const margin = costType === 'iron' ? 16 : costType === 'gold' ? 4 : 0;
  const availableResource = player.resources[costType];

  if (availableResource + margin < costAmount) {
    return {
      allowed: false,
      violation: {
        category: 'PLACEMENT',
        rule: 'Shop Spoofing / Insufficient Funds',
        details: `Attempted to buy item ${catalogItem.id} costing ${costAmount} ${costType} with available balance ${availableResource}`,
        weight: 4.0,
        timestamp: now,
        file: 'server/anticheat/serverShopValidator.ts',
        error: 'ERR_SHOP_INSUFFICIENT_FUNDS',
        cause: `Saldo de ${costType} no servidor (${availableResource} + margem ${margin}) é insuficiente para comprar '${catalogItem.id}' que custa ${costAmount} ${costType}.`,
      },
    };
  }

  player.resources[costType] = Math.max(0, player.resources[costType] - costAmount);

  let targetBlockType = catalogItem.blockType;
  if (catalogItem.id === 'wool_16') {
    if (purchase.blockType === 6 || purchase.blockType === 7 || purchase.blockType === 8) {
      targetBlockType = purchase.blockType;
    } else if (ws.team) {
      targetBlockType = ws.team === 'red' ? 6 : 7;
    }
    if (!ws.team && targetBlockType) {
      ws.team = targetBlockType === 6 ? 'red' : targetBlockType === 7 ? 'blue' : undefined;
    }
  } else if (purchase.blockType && purchase.blockType === catalogItem.blockType) {
    targetBlockType = purchase.blockType;
  }

  if (typeof targetBlockType === 'number' && targetBlockType > 0) {
    const current = player.blockInventory.get(targetBlockType) || 0;
    const newCount = current + catalogItem.count;
    player.blockInventory.set(targetBlockType, newCount);
    if (catalogItem.id === 'wool_16' || targetBlockType === 6 || targetBlockType === 7 || targetBlockType === 8) {
      player.blockInventory.set(6, Math.max(player.blockInventory.get(6) || 0, newCount));
      player.blockInventory.set(7, Math.max(player.blockInventory.get(7) || 0, newCount));
      player.blockInventory.set(8, Math.max(player.blockInventory.get(8) || 0, newCount));
    }
  }

  return { allowed: true };
}
