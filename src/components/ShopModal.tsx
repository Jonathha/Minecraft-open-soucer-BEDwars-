import React from 'react';
import { X } from 'lucide-react';
import { HotbarItem, ResourceCounts, ShopItem, Team, TeamUpgrade } from '../types/game';
import { ItemShopView } from './ItemShopView';
import { UpgradeShopView } from './UpgradeShopView';

interface ShopModalProps {
  type: 'item_shop' | 'upgrade_shop';
  resources: ResourceCounts;
  hotbar: (HotbarItem | null)[];
  myTeam?: Team;
  onClose: () => void;
  onBuyItem: (item: ShopItem) => boolean;
  onBuyUpgrade: (upgrade: TeamUpgrade) => boolean;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  type, resources, onClose, onBuyItem, onBuyUpgrade
}) => {
  return (
    <div className="fixed inset-0 bg-black/75 z-40 flex items-center justify-center p-4">
      <div className="bg-stone-900 border-4 border-stone-700 rounded-lg w-full max-w-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b-2 border-stone-700 bg-stone-800">
          <h2 className="text-lg font-bold text-white tracking-wide">
            {type === 'item_shop' ? 'Loja de Itens' : 'Melhorias de Equipe'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded hover:bg-stone-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Resources Bar in Shop */}
        <div className="flex gap-4 px-4 py-2 bg-stone-950/80 text-xs font-bold border-b border-stone-800">
          <span className="text-stone-300">Ferro: {resources.iron}</span>
          <span className="text-amber-400">Ouro: {resources.gold}</span>
          <span className="text-cyan-400">Diamante: {resources.diamond}</span>
          <span className="text-emerald-400">Esmeralda: {resources.emerald}</span>
        </div>

        {/* Views */}
        {type === 'item_shop' ? (
          <ItemShopView resources={resources} onBuyItem={onBuyItem} />
        ) : (
          <UpgradeShopView resources={resources} onBuyUpgrade={onBuyUpgrade} />
        )}
      </div>
    </div>
  );
};
