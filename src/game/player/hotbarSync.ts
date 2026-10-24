import { HotbarItem, ResourceCounts } from '../../types/game';

export function syncResourcesToHotbar(hotbar: (HotbarItem | null)[], inventory: ResourceCounts): void {
  // 1. Sync Iron Ingot
  let ironIdx = hotbar.findIndex(h => h && h.id === 'iron_ingot');
  if (inventory.iron > 0) {
    if (ironIdx !== -1 && hotbar[ironIdx]) {
      hotbar[ironIdx]!.count = inventory.iron;
    } else {
      // Find empty slot (index 1 is preferred for iron)
      if (!hotbar[1] || hotbar[1].count <= 0) {
        hotbar[1] = { id: 'iron_ingot', name: 'Barra de Ferro', type: 'utility', count: inventory.iron };
      } else {
        const emptyIdx = hotbar.findIndex((h, idx) => idx > 0 && (!h || h.count <= 0));
        if (emptyIdx !== -1) {
          hotbar[emptyIdx] = { id: 'iron_ingot', name: 'Barra de Ferro', type: 'utility', count: inventory.iron };
        } else if (hotbar.length < 9) {
          hotbar.push({ id: 'iron_ingot', name: 'Barra de Ferro', type: 'utility', count: inventory.iron });
        }
      }
    }
  } else if (ironIdx !== -1) {
    // Clear slot instead of splicing to preserve slot indices
    hotbar[ironIdx] = null;
  }

  // 2. Sync Gold Ingot
  let goldIdx = hotbar.findIndex(h => h && h.id === 'gold_ingot');
  if (inventory.gold > 0) {
    if (goldIdx !== -1 && hotbar[goldIdx]) {
      hotbar[goldIdx]!.count = inventory.gold;
    } else {
      // Find empty slot (index 2 is preferred for gold)
      if (!hotbar[2] || hotbar[2].count <= 0) {
        hotbar[2] = { id: 'gold_ingot', name: 'Barra de Ouro', type: 'utility', count: inventory.gold };
      } else {
        const emptyIdx = hotbar.findIndex((h, idx) => idx > 0 && (!h || h.count <= 0));
        if (emptyIdx !== -1) {
          hotbar[emptyIdx] = { id: 'gold_ingot', name: 'Barra de Ouro', type: 'utility', count: inventory.gold };
        } else if (hotbar.length < 9) {
          hotbar.push({ id: 'gold_ingot', name: 'Barra de Ouro', type: 'utility', count: inventory.gold });
        }
      }
    }
  } else if (goldIdx !== -1) {
    // Clear slot instead of splicing to preserve slot indices
    hotbar[goldIdx] = null;
  }
}
