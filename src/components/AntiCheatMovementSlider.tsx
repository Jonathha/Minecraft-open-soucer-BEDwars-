import React from 'react';

interface AntiCheatMovementSliderProps {
  speedValue: number;
  onSpeedChange: (val: number) => void;
}

export function AntiCheatMovementSlider({
  speedValue,
  onSpeedChange,
}: AntiCheatMovementSliderProps) {
  const presets = [1.5, 2.5, 4.0, 8.0];

  return (
    <div className="bg-neutral-950/60 p-2 rounded border border-neutral-800/80 space-y-1.5">
      <div className="flex items-center justify-between text-[10.5px]">
        <span className="text-neutral-400">Multiplicador:</span>
        <span className="font-mono font-bold text-blue-400">
          {speedValue.toFixed(1)}x ({(6.2 * speedValue).toFixed(1)} m/s)
        </span>
      </div>
      <input
        type="range"
        min="1.2"
        max="8.0"
        step="0.2"
        value={speedValue}
        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        className="w-full accent-blue-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
      />
      <div className="grid grid-cols-4 gap-1 pt-0.5">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => onSpeedChange(preset)}
            className={`py-0.5 text-[10px] font-mono rounded border transition-colors ${
              speedValue === preset
                ? 'bg-blue-600 border-blue-400 text-white font-bold'
                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            {preset.toFixed(1)}x
          </button>
        ))}
      </div>
    </div>
  );
}
