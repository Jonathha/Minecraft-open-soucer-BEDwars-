import React from 'react';
import { Rocket } from 'lucide-react';
import { AntiCheatMovementFly } from './AntiCheatMovementFly';
import { AntiCheatMovementSpeed } from './AntiCheatMovementSpeed';
import { AntiCheatMovementSlider } from './AntiCheatMovementSlider';

interface AntiCheatMovementSectionProps {
  flyEnabled: boolean;
  speedEnabled: boolean;
  speedValue: number;
  onToggleFly: () => void;
  onToggleSpeed: () => void;
  onSpeedChange: (val: number) => void;
}

export function AntiCheatMovementSection({
  flyEnabled,
  speedEnabled,
  speedValue,
  onToggleFly,
  onToggleSpeed,
  onSpeedChange,
}: AntiCheatMovementSectionProps) {
  return (
    <div className="mb-2.5 p-2 bg-neutral-900/90 rounded border border-neutral-800 space-y-2">
      <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300 border-b border-neutral-800 pb-1">
        <span className="flex items-center gap-1.5 text-amber-400">
          <Rocket className="w-3.5 h-3.5" />
          <span>Testes de Movimento (Fly & Speed)</span>
        </span>
      </div>

      <AntiCheatMovementFly
        flyEnabled={flyEnabled}
        onToggleFly={onToggleFly}
      />

      <AntiCheatMovementSpeed
        speedEnabled={speedEnabled}
        speedValue={speedValue}
        onToggleSpeed={onToggleSpeed}
      />

      <AntiCheatMovementSlider
        speedValue={speedValue}
        onSpeedChange={onSpeedChange}
      />
    </div>
  );
}
