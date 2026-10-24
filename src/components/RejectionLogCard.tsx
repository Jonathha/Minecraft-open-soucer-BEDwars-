import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { RejectionLog } from '../game/anticheat/rejectionLogStore';

interface RejectionLogCardProps {
  key?: React.Key;
  log: RejectionLog;
}

export function RejectionLogCard({ log }: RejectionLogCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = [
      `[${log.origin.toUpperCase()}] ${log.rule} (${log.timeStr})`,
      log.error ? `Erro: ${log.error}` : null,
      log.file ? `Arquivo Fonte: ${log.file}` : null,
      `Mensagem: ${log.reason}`,
      log.cause ? `Causa Provada: ${log.cause}` : null,
      log.blockSupport ? `Diagnóstico de Bloco/Apoio: ${log.blockSupport}` : null,
      (log.ping !== undefined || log.fps !== undefined)
        ? `Telemetria: Ping: ${log.ping ?? 0}ms | FPS: ${log.fps ?? 60} | ${log.rttInfo || `Latência Data Center: ${log.ping ?? 0}ms`}`
        : null,
      `Posição do Bloco: X: ${log.blockPos.x}, Y: ${log.blockPos.y}, Z: ${log.blockPos.z}` + (log.blockType !== undefined ? ` (Tipo: ${log.blockType})` : ''),
      log.playerPos ? `Posição do Jogador: X: ${log.playerPos.x}, Y: ${log.playerPos.y}, Z: ${log.playerPos.z}` : null,
      log.condition && log.condition !== log.reason && log.condition !== log.cause ? `Condição: ${log.condition}` : null,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-3.5 rounded-lg bg-neutral-900/70 border border-neutral-800 flex flex-col gap-2.5 font-mono relative group">
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider bg-red-950/80 text-red-400 border border-red-800/50">
            {log.origin.toUpperCase()}
          </span>
          {log.error && (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider bg-amber-950/80 text-amber-300 border border-amber-800/50">
              {log.error}
            </span>
          )}
          <span className="font-semibold text-neutral-100 text-sm font-sans">{log.rule}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 text-[11px]">{log.timeStr}</span>
          <button
            onClick={handleCopy}
            title="Copiar este log"
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-sans transition ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {log.file && (
        <div className="bg-neutral-950/80 px-2.5 py-1.5 rounded border border-neutral-800 text-[11px] flex items-center gap-1.5 text-neutral-300">
          <span className="text-neutral-500 font-semibold select-none">Arquivo Fonte:</span>
          <code className="text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/40 font-mono">
            {log.file}
          </code>
        </div>
      )}

      <div className="bg-neutral-900/90 p-2.5 rounded border border-neutral-800 text-neutral-300 text-xs">
        <span className="text-neutral-500 select-none font-semibold">Mensagem de Erro: </span>
        <span className="text-red-300 font-medium">{log.reason}</span>
      </div>

      {log.cause && (
        <div className="bg-neutral-950/90 p-2.5 rounded border border-red-900/30 text-xs">
          <span className="text-red-400 select-none font-semibold">Causa Provada: </span>
          <span className="text-neutral-200">{log.cause}</span>
        </div>
      )}

      {log.blockSupport && (
        <div className="bg-neutral-950/90 p-2.5 rounded border border-blue-900/40 text-xs">
          <span className="text-blue-400 select-none font-semibold">Diagnóstico de Bloco/Apoio: </span>
          <span className="text-neutral-200">{log.blockSupport}</span>
        </div>
      )}

      {(log.ping !== undefined || log.fps !== undefined || log.rttInfo) && (
        <div className="bg-neutral-950/70 px-2.5 py-1.5 rounded border border-neutral-800 text-[11px] flex items-center justify-between flex-wrap gap-2 text-neutral-300">
          <div className="flex items-center gap-3">
            {log.ping !== undefined && (
              <span>
                <span className="text-neutral-500 font-semibold">Ping: </span>
                <span className={log.ping < 80 ? 'text-emerald-400 font-bold' : log.ping < 160 ? 'text-amber-400 font-bold' : 'text-red-400 font-bold'}>
                  {log.ping}ms
                </span>
              </span>
            )}
            {log.fps !== undefined && (
              <span>
                <span className="text-neutral-500 font-semibold">FPS: </span>
                <span className={log.fps >= 50 ? 'text-emerald-400 font-bold' : log.fps >= 30 ? 'text-amber-400 font-bold' : 'text-red-400 font-bold'}>
                  {log.fps}
                </span>
              </span>
            )}
          </div>
          {log.rttInfo && (
            <span className="text-neutral-400 text-[10px]">
              🌐 {log.rttInfo}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        <div className="bg-neutral-900/60 p-2 rounded border border-neutral-800/80">
          <span className="text-neutral-500 select-none">Posição do Bloco: </span>
          <span className="text-neutral-200">
            X: {log.blockPos.x}, Y: {log.blockPos.y}, Z: {log.blockPos.z}
          </span>
          {log.blockType !== undefined && (
            <span className="text-neutral-400 ml-2">(Tipo: {log.blockType})</span>
          )}
        </div>

        <div className="bg-neutral-900/60 p-2 rounded border border-neutral-800/80">
          <span className="text-neutral-500 select-none">Posição do Jogador: </span>
          <span className="text-neutral-200">
            {log.playerPos
              ? `X: ${log.playerPos.x}, Y: ${log.playerPos.y}, Z: ${log.playerPos.z}`
              : 'Não disponível'}
          </span>
        </div>
      </div>

      {log.condition && log.condition !== log.reason && log.condition !== log.cause && (
        <div className="bg-neutral-900/40 px-2.5 py-1.5 rounded border border-neutral-800/60 text-[11px] text-neutral-400 break-all">
          <span className="text-neutral-500 select-none">Condição/Detalhes: </span>
          {log.condition}
        </div>
      )}
    </div>
  );
}
