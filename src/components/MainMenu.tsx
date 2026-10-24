import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../game/audio/soundManager';

interface MainMenuProps {
  onEnter: () => void;
  onPlay1v1?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onEnter, onPlay1v1 }) => {
  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const enabled = sounds.toggleMute();
    setSoundEnabled(enabled);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between p-8 pointer-events-none select-none z-10">
      {/* Top Bar with Audio Control */}
      <div className="w-full flex justify-end pointer-events-auto">
        <button
          id="btn-sound-toggle"
          onClick={handleToggleSound}
          className="p-3 bg-black/50 hover:bg-black/70 border-2 border-stone-600 rounded text-stone-200 hover:text-white transition active:scale-95 cursor-pointer"
          title={soundEnabled ? 'Mudo' : 'Ativar Som'}
        >
          {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </div>

      {/* Center Game Title & Action Buttons */}
      <div className="flex flex-col items-center gap-6 pointer-events-auto my-auto max-w-md w-full">
        <div className="text-center drop-shadow-[0_6px_8px_rgba(0,0,0,0.8)]">
          <h1 className="text-5xl md:text-7xl font-black tracking-wider text-amber-300 drop-shadow-[0_4px_0_#78350f]">
            MINECRAFT
          </h1>
          <div className="text-xl md:text-2xl font-extrabold tracking-widest text-emerald-400 mt-1 uppercase">
            BedWars 1v1
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full px-4">
          <button
            id="btn-play-1v1"
            onClick={onPlay1v1 || onEnter}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xl md:text-2xl tracking-widest uppercase rounded border-b-4 border-emerald-800 shadow-2xl hover:scale-102 active:scale-98 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>⚔️</span> JOGAR 1v1 BEDWARS
          </button>

          <button
            id="btn-enter-lobby"
            onClick={onEnter}
            className="w-full py-3 bg-stone-800/90 hover:bg-stone-700/90 active:bg-stone-900 text-stone-200 hover:text-white font-bold text-lg tracking-widest uppercase rounded border-2 border-stone-600 shadow-xl hover:scale-102 active:scale-98 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🏰</span> ENTRAR NO LOBBY
          </button>
        </div>
      </div>

      {/* Footer controls guide */}
      <div className="text-stone-300/80 text-xs font-mono bg-black/60 px-4 py-2 rounded pointer-events-auto text-center max-w-lg">
        <span className="text-emerald-400 font-bold">Controles:</span> WASD para mover | Espaço para pular | Mouse para olhar | Clique esquerdo para atacar/quebrar | Clique direito para colocar bloco | [E] Interagir
      </div>
    </div>
  );
};
