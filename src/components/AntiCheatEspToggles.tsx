import React from 'react';
import { Eye, Shield } from 'lucide-react';

interface AntiCheatEspTogglesProps {
  espEnabled: boolean;
  antiEspEnabled: boolean;
  onToggleEsp: () => void;
  onToggleAntiEsp: () => void;
}

export function AntiCheatEspToggles({
  espEnabled,
  antiEspEnabled,
  onToggleEsp,
  onToggleAntiEsp,
}: AntiCheatEspTogglesProps) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <button
        id="btn-toggle-esp"
        onClick={onToggleEsp}
        className={`flex items-center justify-between px-2 py-1.5 rounded text-[11px] font-medium border transition-colors ${
          espEnabled
            ? 'bg-red-950 text-red-200 border-red-500 shadow-sm'
            : 'bg-neutral-800/80 text-neutral-400 border-neutral-700/80 hover:bg-neutral-700/80'
        }`}
      >
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-red-400" />
          ESP (Chams 3D)
        </span>
        <span className="font-mono text-[10px] font-bold">
          {espEnabled ? 'LIGADO' : 'OFF'}
        </span>
      </button>

      <button
        id="btn-toggle-anti-esp"
        onClick={onToggleAntiEsp}
        className={`flex items-center justify-between px-2 py-1.5 rounded text-[11px] font-medium border transition-colors ${
          antiEspEnabled
            ? 'bg-emerald-950 text-emerald-200 border-emerald-500 shadow-sm'
            : 'bg-neutral-800/80 text-neutral-400 border-neutral-700/80 hover:bg-neutral-700/80'
        }`}
      >
        <span className="flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          Anti-ESP (Voxel)
        </span>
        <span className="font-mono text-[10px] font-bold">
          {antiEspEnabled ? 'LIGADO' : 'OFF'}
        </span>
      </button>
    </div>
  );
}
