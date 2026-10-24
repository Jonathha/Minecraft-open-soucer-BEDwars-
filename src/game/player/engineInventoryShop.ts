import { BlockType, HotbarItem, ResourceCounts, ShopItem, Team, TeamUpgrade } from '../../types/game';
import { sounds } from '../audio/soundManager';
import { NetworkClient } from '../network/networkClient';
import { MatchManager } from '../match/matchManager';
import { syncResourcesToHotbar } from './hotbarSync';
import { applyBoughtItemToHotbar } from './hotbarItemApplier';

export function resetEngineMatchLoadout(
  inventory: ResourceCounts,
  hotbar: (HotbarItem | null)[],
  onSyncUI?: () => void
): number {
  inventory.iron = 18;
  inventory.gold = 4;
  inventory.diamond = 0;
  inventory.emerald = 0;
  for (let i = 0; i < 9; i++) hotbar[i] = null;
  hotbar[0] = { id: 'sword_wood', name: 'Espada de Madeira', type: 'weapon', count: 1, damage: 4 };
  hotbar[1] = { id: 'iron_ingot', name: 'Barra de Ferro', type: 'utility', count: 18 };
  hotbar[2] = { id: 'gold_ingot', name: 'Barra de Ouro', type: 'utility', count: 4 };
  onSyncUI?.();
  return 0;
}

export function addItemToEngineHotbar(hotbar: (HotbarItem | null)[], item: HotbarItem): number {
  for (let i = 0; i < 9; i++) {
    if (!hotbar[i] || hotbar[i]!.count <= 0) {
      hotbar[i] = item;
      return i;
    }
  }
  if (hotbar.length < 9) {
    hotbar.push(item);
    return hotbar.length - 1;
  }
  return 0;
}

export function buyEngineItem(
  item: ShopItem,
  myTeam: Team,
  inventory: ResourceCounts,
  hotbar: (HotbarItem | null)[],
  match: MatchManager,
  network: NetworkClient,
  onSyncUI?: () => void
): { success: boolean; selectedSlot?: number } {
  if (inventory[item.costType] < item.costAmount) {
    sounds.playClick();
    return { success: false };
  }

  inventory[item.costType] -= item.costAmount;
  sounds.playPickup();

  const itemToAdd: HotbarItem = { ...item.item };
  let blockTypeNum: number | undefined = undefined;
  if (itemToAdd.id === 'wool') {
    itemToAdd.blockType = myTeam === 'red' ? BlockType.RED_WOOL : BlockType.BLUE_WOOL;
    itemToAdd.name = myTeam === 'red' ? 'Lã Vermelha' : 'Lã Azul';
    blockTypeNum = itemToAdd.blockType;
  } else if (itemToAdd.type === 'block') {
    blockTypeNum = itemToAdd.blockType;
  }

  network.sendShopBuy({
    itemId: item.id,
    costType: item.costType,
    costAmount: item.costAmount,
    count: item.item.count || 1,
    blockType: blockTypeNum,
  });

  const newSlot = applyBoughtItemToHotbar(itemToAdd, hotbar, match);
  syncResourcesToHotbar(hotbar, inventory);
  onSyncUI?.();
  return { success: true, selectedSlot: newSlot };
}

export function buyEngineUpgrade(
  upgrade: TeamUpgrade,
  inventory: ResourceCounts,
  hotbar: (HotbarItem | null)[],
  onSyncUI?: () => void
): boolean {
  if (inventory[upgrade.costType] < upgrade.costAmount || upgrade.level >= upgrade.maxLevel) {
    sounds.playClick();
    return false;
  }
  inventory[upgrade.costType] -= upgrade.costAmount;
  upgrade.level++;
  sounds.playPickup();
  syncResourcesToHotbar(hotbar, inventory);
  onSyncUI?.();
  return true;
}
