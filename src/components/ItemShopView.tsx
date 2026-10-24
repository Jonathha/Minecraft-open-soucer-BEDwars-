import React, { useState } from 'react';
import { ResourceCounts, ShopItem } from '../types/game';
import { SHOP_ITEMS } from '../game/shops/shopData';
import { GenericItemIcon } from './MinecraftIcons';

interface ItemShopViewProps {
  resources: ResourceCounts;
  onBuyItem: (item: ShopItem) => boolean;
}

export function ItemShopView({ resources, onBuyItem }: ItemShopViewProps) {
  const [activeCategory, setActiveCategory] = useState<'blocks' | 'weapons' | 'armor' | 'tools' | 'utility'>('blocks');
  const filteredItems = SHOP_ITEMS.filter(i => i.category === activeCategory);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Category Tabs */}
      <div className="flex border-b border-stone-800 bg-stone-800/50">
        {(['blocks', 'weapons', 'armor', 'tools', 'utility'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 py-2 text-xs font-bold uppercase transition ${
              activeCategory === cat
                ? 'bg-stone-700 text-white border-b-2 border-amber-400'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {cat === 'blocks' ? 'Blocos' : cat === 'weapons' ? 'Armas' : cat === 'armor' ? 'Armadura' : cat === 'tools' ? 'Ferramentas' : 'Utilidade'}
          </button>
        ))}
      </div>

      {/* Item List */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[50vh]">
        {filteredItems.map(item => {
          const canAfford = resources[item.costType] >= item.costAmount;
          return (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 rounded bg-stone-800/80 border border-stone-700"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 flex items-center justify-center bg-stone-900/80 rounded border border-stone-700/60 shrink-0">
                  <GenericItemIcon id={item.item.id} name={item.name} blockType={item.item.blockType} />
                </div>
                <div>
                  <div className="font-bold text-sm text-stone-100">{item.name}</div>
                  <div className="text-xs text-stone-400">
                    Custo:{' '}
                    {item.costAmount === 0 ? (
                      <span className="font-semibold text-emerald-400">Grátis</span>
                    ) : (
                      <span className="font-semibold text-amber-300">{item.costAmount} {item.costType}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onBuyItem(item)}
                disabled={!canAfford}
                className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                  canAfford
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95'
                    : 'bg-stone-700 text-stone-500 cursor-not-allowed'
                }`}
              >
                Comprar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
