import { HotbarItem } from '../../types/game';
import { MatchManager } from '../match/matchManager';
import { addItemToEngineHotbar } from './engineInventoryShop';

export function applyBoughtItemToHotbar(
  itemToAdd: HotbarItem,
  hotbar: (HotbarItem | null)[],
  match: MatchManager
): number | undefined {
  let newSlot: number | undefined = undefined;
  if (itemToAdd.type === 'block') {
    const existing = hotbar.find(h => h && h.type === 'block' && h.blockType === itemToAdd.blockType);
    if (existing) {
      existing.count += itemToAdd.count;
      newSlot = hotbar.indexOf(existing);
    } else {
      newSlot = addItemToEngineHotbar(hotbar, itemToAdd);
    }
  } else if (itemToAdd.type === 'weapon') {
    const weaponIdx = hotbar.findIndex(h => h && h.type === 'weapon');
    if (weaponIdx !== -1) {
      hotbar[weaponIdx] = itemToAdd;
      newSlot = weaponIdx;
    } else {
      newSlot = addItemToEngineHotbar(hotbar, itemToAdd);
    }
  } else if (itemToAdd.type === 'tool' && (itemToAdd.id.includes('pickaxe') || itemToAdd.name.toLowerCase().includes('picareta'))) {
    const pickIdx = hotbar.findIndex(h => h && (h.id.includes('pickaxe') || h.name.toLowerCase().includes('picareta')));
    if (pickIdx !== -1) {
      hotbar[pickIdx] = itemToAdd;
      newSlot = pickIdx;
    } else {
      newSlot = addItemToEngineHotbar(hotbar, itemToAdd);
    }
  } else if (itemToAdd.type === 'tool' && itemToAdd.id.includes('shears')) {
    const shearsIdx = hotbar.findIndex(h => h && h.id.includes('shears'));
    if (shearsIdx !== -1) {
      hotbar[shearsIdx] = itemToAdd;
      newSlot = shearsIdx;
    } else {
      newSlot = addItemToEngineHotbar(hotbar, itemToAdd);
    }
  } else if (itemToAdd.id.startsWith('armor_')) {
    if (itemToAdd.id === 'armor_chain') match.armorTier = 1;
    else if (itemToAdd.id === 'armor_iron') match.armorTier = 2;
    else if (itemToAdd.id === 'armor_diamond') match.armorTier = 3;
  } else {
    const existing = hotbar.find(h => h && h.id === itemToAdd.id);
    if (existing) {
      existing.count += itemToAdd.count;
      newSlot = hotbar.indexOf(existing);
    } else {
      newSlot = addItemToEngineHotbar(hotbar, itemToAdd);
    }
  }
  return newSlot;
}
