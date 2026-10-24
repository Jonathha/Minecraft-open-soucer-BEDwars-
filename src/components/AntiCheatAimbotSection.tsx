import React from 'react';
import { Target, Crosshair } from 'lucide-react';

interface AntiCheatAimbotSectionProps {
  aimbotEnabled: boolean;
  aimbotFov: number;
  onToggleAimbot: () => void;
  onAimbotFovChange: (fov: number) => void;
}

export const AntiCheatAimbotSection: React.FC<AntiCheatAimbotSectionProps> = ({
  aimbotEnabled,
  aimbotFov,
  onToggleAimbot,
  onAimbotFovChange,
}) => {
  return (
    <div className="space-y-2 border-t border-neutral-800 pt-2.5">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-neutral-300 flex items-center gap-1.5 text-xs">
          <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
          Aimbot FOV
        </span>
        <button
          id="btn-toggle-aimbot"
          onClick={onToggleAimbot}
          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${
            aimbotEnabled
              ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/40'
              : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-750'
          }`}
        >
          {aimbotEnabled ? 'ATIVO' : 'DESATIVADO'}
        </button>
      </div>

      <div className="bg-neutral-900/60 rounded p-2 border border-neutral-800/80 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-400 flex items-center gap-1">
            <Target className="w-3 h-3 text-neutral-400" />
            Ângulo FOV:
          </span>
          <span className="text-neutral-200 font-mono font-medium">{aimbotFov}°</span>
        </div>
        <input
          id="slider-aimbot-fov"
          type="range"
          min="15"
          max="360"
          step="5"
          value={aimbotFov}
          onChange={(e) => onAimbotFovChange(Number(e.target.value))}
          className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="text-[10px] text-neutral-400 leading-tight pt-0.5">
          Ativação: <span className="text-neutral-300 font-semibold">Botão de Ataque</span> ou{' '}
          <span className="text-neutral-300 font-semibold">Tecla L</span>
        </div>
      </div>
    </div>
  );
};
