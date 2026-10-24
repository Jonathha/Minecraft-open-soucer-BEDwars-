import React from 'react';
import { ShieldAlert, X, AlertTriangle, RefreshCw } from 'lucide-react';

interface BanTestModalProps {
  reason: string;
  vlScore: number;
  onClose: () => void;
  onResetVL: () => void;
}

export function BanTestModal({ reason, vlScore, onClose, onResetVL }: BanTestModalProps) {
  return (
    <div
      id="ban-test-modal-overlay"
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div
        id="ban-test-modal-card"
        className="w-full max-w-md bg-neutral-950 border-2 border-red-600/80 rounded-xl shadow-2xl p-6 text-neutral-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="w-16 h-16 rounded-full bg-red-950/70 border border-red-500/50 flex items-center justify-center mb-4 text-red-500 shadow-lg shadow-red-950/50">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/80 text-red-400 text-xs font-mono font-semibold mb-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          SIMULAÇÃO DE BANIMENTO (TESTE)
        </div>

        <h2 className="text-xl font-bold text-red-100 tracking-tight mb-2">
          Você foi detectado pelo Anti-Cheat!
        </h2>

        <p className="text-sm text-neutral-400 mb-4 max-w-xs">
          O sistema detectou movimentação ou colocação de blocos anormal/impossível.
        </p>

        <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-lg p-3 text-left mb-6 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between border-b border-neutral-800/80 pb-1">
            <span className="text-neutral-500">Módulo Ativado:</span>
            <span className="text-red-400 font-semibold">
              {reason.includes('Auto-TP') || reason.includes('Teleporte') ? 'Auto-TP (Movement)' :
               reason.includes('Speed') ? 'Speed Hack' :
               reason.includes('Fly') ? 'Fly Hack' :
               'Anti-Scaffold / FastPlace'}
            </span>
          </div>
          <div className="flex justify-between border-b border-neutral-800/80 pb-1">
            <span className="text-neutral-500">Nível de Violação (VL):</span>
            <span className="text-amber-400 font-bold">{vlScore.toFixed(1)} / 10.0</span>
          </div>
          <div className="pt-0.5">
            <span className="text-neutral-500 block mb-0.5">Detalhe Técnico:</span>
            <span className="text-neutral-300 break-words">{reason || 'Padrão anormal de blocos/mira detectado.'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full">
          <button
            id="btn-close-ban-modal"
            onClick={() => {
              onResetVL();
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Desbanir & Continuar Testando
          </button>
        </div>

        <p className="text-[11px] text-neutral-500 mt-4">
          Este aviso é apenas para testes do sistema e não altera registros no servidor.
        </p>
      </div>
    </div>
  );
}
