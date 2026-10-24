import React from 'react';
import { ShieldAlert, ShieldCheck, UserCheck } from 'lucide-react';
import { OcclusionStatus } from '../game/anticheat/espManager';

interface AntiCheatEspStatusProps {
  fakeFovBypass: boolean;
  antiEspEnabled: boolean;
  occlusionStatus: OcclusionStatus;
  opponentDistance: number;
}

export function AntiCheatEspStatus({
  fakeFovBypass,
  antiEspEnabled,
  occlusionStatus,
  opponentDistance,
}: AntiCheatEspStatusProps) {
  const isBlocked = antiEspEnabled && occlusionStatus === 'occluded';

  return (
    <div className="bg-neutral-950/90 rounded p-2 border border-neutral-800/90 space-y-1 text-[11px]">
      <div className="flex items-center justify-between">
        <span className="text-neutral-400">Validação Servidor:</span>
        {occlusionStatus === 'occluded' && (
          <span className="font-medium text-amber-400 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            Ocluso ({opponentDistance}m) {antiEspEnabled ? '• Ocultado' : '• Renderizado'}
          </span>
        )}
        {occlusionStatus === 'buffer' && (
          <span className="font-medium text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Buffer Proximidade ({opponentDistance}m &lt;5m)
          </span>
        )}
        {occlusionStatus === 'visible' && (
          <span className="font-medium text-cyan-300 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-cyan-400" />
            Linha de Visão Direta ({opponentDistance}m)
          </span>
        )}
        {occlusionStatus === 'no_opponent' && (
          <span className="text-neutral-500 italic">Sem oponente ativo</span>
        )}
      </div>
      {fakeFovBypass && (
        <div className="text-[10px] pt-1 border-t border-neutral-800/60 flex items-center justify-between text-purple-300">
          <span>Cheat: &quot;Alvo no FOV!&quot;</span>
          <span className="font-semibold text-emerald-400">
            {isBlocked ? 'Anti-ESP: Bloqueado' : 'Anti-ESP: Permitido'}
          </span>
        </div>
      )}
    </div>
  );
}
