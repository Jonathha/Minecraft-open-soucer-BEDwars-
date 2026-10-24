import React from 'react';
import { GameState, HotbarItem, MatchInfo, ResourceCounts } from '../types/game';
import { GameStatusBars } from './GameStatusBars';
import { GameHotbar } from './GameHotbar';

interface GameHudProps {
  state: GameState;
  health: number;
  resources: ResourceCounts;
  matchInfo: MatchInfo;
  hotbar: (HotbarItem | null)[];
  selectedSlot: number;
  onSelectSlot: (index: number) => void;
  onPlay1v1?: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  state, health, resources, matchInfo, hotbar, selectedSlot, onSelectSlot, onPlay1v1
}) => {
  const isMatch = state === 'match' || state === 'ended';

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 md:p-4 z-20 font-sans">
      {/* Top Section: Bed Status & Resource Counter */}
      <div className="w-full flex justify-between items-start">
        {isMatch ? (
          <div className="bg-stone-900/85 border-2 border-stone-700/80 rounded px-3 py-1 flex flex-col text-xs md:text-sm font-bold shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 text-red-400">
                <img src="/textures/items/bed.png" alt="Cama" className="w-4 h-4 object-contain inline-block" style={{ imageRendering: 'pixelated' }} />
                Vermelho: {matchInfo.redBed ? 'Cama [✓]' : 'Destruída [✗]'}
              </span>
              <span className="text-stone-500">|</span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <img src="/textures/items/bed.png" alt="Cama" className="w-4 h-4 object-contain inline-block filter hue-rotate-180" style={{ imageRendering: 'pixelated' }} />
                Azul: {matchInfo.blueBed ? 'Cama [✓]' : 'Destruída [✗]'}
              </span>
            </div>
            <div className="text-stone-300 text-[11px] font-normal">
              Sua equipe: <strong className={matchInfo.myTeam === 'red' ? 'text-red-400' : 'text-blue-400'}>
                {matchInfo.myTeam === 'red' ? 'VERMELHO' : 'AZUL'}
              </strong>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="bg-stone-900/85 border-2 border-stone-700/80 rounded px-3 py-1 text-xs text-stone-200 font-bold shadow">
              🏰 LOBBY PRINCIPAL
            </div>
            {onPlay1v1 && (
              <button
                id="btn-hud-play-1v1"
                onClick={onPlay1v1}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm px-4 py-1.5 rounded border border-emerald-400 shadow cursor-pointer transition flex items-center gap-1.5 active:scale-95"
              >
                <span>⚔️</span> JOGAR 1v1 BEDWARS
              </button>
            )}
          </div>
        )}

        {isMatch && (
          <div className="bg-stone-900/85 border-2 border-stone-700/80 rounded px-3 py-1.5 flex items-center gap-2.5 text-xs md:text-sm font-bold shadow-lg">
            <span className="text-stone-300 flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-stone-300 rounded-xs inline-block" /> {resources.iron}
            </span>
            <span className="text-amber-400 flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-xs inline-block" /> {resources.gold}
            </span>
            <span className="text-cyan-400 flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-cyan-400 rounded-xs inline-block" /> {resources.diamond}
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-xs inline-block" /> {resources.emerald}
            </span>
          </div>
        )}
      </div>

      {/* Center Reticle / Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
        <div className="w-4 h-[2px] bg-white/80 shadow-[0_0_1px_#000]" />
        <div className="h-4 w-[2px] bg-white/80 absolute shadow-[0_0_1px_#000]" />
      </div>

      {/* Bottom Section: Minecraft Status Bars & Hotbar */}
      <div className="w-full flex flex-col items-center gap-1 mb-1 pointer-events-auto">
        {isMatch && <GameStatusBars health={health} />}
        <GameHotbar hotbar={hotbar} selectedSlot={selectedSlot} onSelectSlot={onSelectSlot} />
      </div>
    </div>
  );
};
