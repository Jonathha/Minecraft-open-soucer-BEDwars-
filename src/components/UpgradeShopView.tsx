import React, { useState } from 'react';
import { ResourceCounts, TeamUpgrade } from '../types/game';
import { TEAM_UPGRADES } from '../game/shops/shopData';

interface UpgradeShopViewProps {
  resources: ResourceCounts;
  onBuyUpgrade: (upgrade: TeamUpgrade) => boolean;
}

export function UpgradeShopView({ resources, onBuyUpgrade }: UpgradeShopViewProps) {
  const [upgrades, setUpgrades] = useState<TeamUpgrade[]>(TEAM_UPGRADES);

  const buyUpgrade = (upgrade: TeamUpgrade) => {
    const success = onBuyUpgrade(upgrade);
    if (success) {
      setUpgrades([...upgrades]);
    }
  };

  return (
    <div className="p-4 grid grid-cols-1 gap-3 overflow-y-auto max-h-[50vh]">
      {upgrades.map(up => {
        const canAfford = resources[up.costType] >= up.costAmount && up.level < up.maxLevel;
        const isMax = up.level >= up.maxLevel;
        return (
          <div
            key={up.id}
            className="flex justify-between items-center p-3 rounded bg-stone-800/80 border border-stone-700"
          >
            <div>
              <div className="font-bold text-sm text-stone-100 flex items-center gap-2">
                {up.name}
                <span className="text-xs px-2 py-0.5 rounded bg-stone-700 text-stone-300 font-mono">
                  Nível {up.level}/{up.maxLevel}
                </span>
              </div>
              <div className="text-xs text-stone-400 mt-0.5">{up.description}</div>
              <div className="text-xs text-cyan-400 mt-1 font-semibold">
                {isMax ? 'Máximo Atingido' : `Custo: ${up.costAmount} ${up.costType}`}
              </div>
            </div>
            <button
              onClick={() => buyUpgrade(up)}
              disabled={!canAfford}
              className={`px-4 py-2 rounded text-xs font-bold transition ${
                canAfford
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95'
                  : 'bg-stone-700 text-stone-500 cursor-not-allowed'
              }`}
            >
              {isMax ? 'Completo' : 'Melhorar'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
