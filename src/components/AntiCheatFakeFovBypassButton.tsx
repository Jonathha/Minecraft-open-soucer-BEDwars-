import React from 'react';
import { Zap } from 'lucide-react';

interface AntiCheatFakeFovBypassButtonProps {
  fakeFovBypass: boolean;
  onToggleFakeFovBypass: () => void;
}

export function AntiCheatFakeFovBypassButton({
  fakeFovBypass,
  onToggleFakeFovBypass,
}: AntiCheatFakeFovBypassButtonProps) {
  return (
    <button
      id="btn-toggle-fake-fov-bypass"
      onClick={onToggleFakeFovBypass}
      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-medium border transition-colors ${
        fakeFovBypass
          ? 'bg-purple-950 text-purple-200 border-purple-500'
          : 'bg-neutral-800/80 text-neutral-400 border-neutral-700/80 hover:bg-neutral-700/80'
      }`}
    >
      <span className="flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-purple-400" />
        Simular Bypass de FOV
      </span>
      <span className="font-mono text-[10px] font-bold">
        {fakeFovBypass ? 'ATIVADO' : 'DESATIVADO'}
      </span>
    </button>
  );
}
