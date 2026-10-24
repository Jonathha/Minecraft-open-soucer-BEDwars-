import React, { useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { MovementLogEntry } from '../game/anticheat/movementLogger';

interface AntiCheatLogsViewerProps {
  logs: MovementLogEntry[];
}

function getLogColor(entry: MovementLogEntry): string {
  if (entry.text.includes('==========')) {
    return 'text-amber-400 font-bold bg-amber-950/40 px-1 py-0.5 rounded block my-1 border-l-2 border-amber-400';
  }
  if (entry.text.includes('--- ⏱️ HISTÓRICO')) {
    return 'text-cyan-400 font-semibold my-0.5 block';
  }
  if (entry.category === 'PLACE_OK') {
    return 'text-emerald-400 font-semibold bg-emerald-950/30 px-1 py-0.5 rounded block border-l-2 border-emerald-500';
  }
  if (entry.category === 'PLACE_BLOCK') {
    return 'text-red-400 font-semibold bg-red-950/30 px-1 py-0.5 rounded block border-l-2 border-red-500';
  }
  if (entry.category === 'SNEAK') return 'text-emerald-300/90';
  return 'text-neutral-300';
}

export function AntiCheatLogsViewer({ logs }: AntiCheatLogsViewerProps) {
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={logsContainerRef}
      className="w-full h-72 bg-neutral-950 border border-neutral-800 rounded p-2 overflow-y-auto font-mono text-[10.5px] leading-relaxed space-y-0.5 select-text"
    >
      {logs.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 py-6 space-y-2">
          <Terminal className="w-6 h-6 text-neutral-600" />
          <p>Nenhum log gravado ainda.</p>
          <p className="text-[10px] text-neutral-600">
            Ao colocar um bloco no jogo, os 3s de movimentação + ação aparecerão aqui!
          </p>
        </div>
      ) : (
        logs.map((entry) => (
          <div key={entry.id} className={`${getLogColor(entry)} whitespace-pre-wrap break-all`}>
            {entry.text}
          </div>
        ))
      )}
    </div>
  );
}
