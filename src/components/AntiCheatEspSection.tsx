import React from 'react';
import { Eye } from 'lucide-react';
import { OcclusionStatus } from '../game/anticheat/espManager';
import { AntiCheatEspToggles } from './AntiCheatEspToggles';
import { AntiCheatFakeFovBypassButton } from './AntiCheatFakeFovBypassButton';
import { AntiCheatEspStatus } from './AntiCheatEspStatus';

interface AntiCheatEspSectionProps {
  espEnabled: boolean;
  antiEspEnabled: boolean;
  fakeFovBypass: boolean;
  occlusionStatus: OcclusionStatus;
  opponentDistance: number;
  onToggleEsp: () => void;
  onToggleAntiEsp: () => void;
  onToggleFakeFovBypass: () => void;
}

export function AntiCheatEspSection({
  espEnabled,
  antiEspEnabled,
  fakeFovBypass,
  occlusionStatus,
  opponentDistance,
  onToggleEsp,
  onToggleAntiEsp,
  onToggleFakeFovBypass,
}: AntiCheatEspSectionProps) {
  return (
    <div className="bg-neutral-900/90 rounded-lg p-2.5 border border-neutral-800 space-y-2 mb-2.5">
      <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300 border-b border-neutral-800 pb-1">
        <span className="flex items-center gap-1.5 text-cyan-400">
          <Eye className="w-3.5 h-3.5" />
          <span>ESP 3D & Anti-ESP (Oclusão Voxel)</span>
        </span>
      </div>

      <AntiCheatEspToggles
        espEnabled={espEnabled}
        antiEspEnabled={antiEspEnabled}
        onToggleEsp={onToggleEsp}
        onToggleAntiEsp={onToggleAntiEsp}
      />

      <AntiCheatFakeFovBypassButton
        fakeFovBypass={fakeFovBypass}
        onToggleFakeFovBypass={onToggleFakeFovBypass}
      />

      <AntiCheatEspStatus
        fakeFovBypass={fakeFovBypass}
        antiEspEnabled={antiEspEnabled}
        occlusionStatus={occlusionStatus}
        opponentDistance={opponentDistance}
      />
    </div>
  );
}
