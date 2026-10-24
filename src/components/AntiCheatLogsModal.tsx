import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, X, Download, Copy, Check } from 'lucide-react';
import { rejectionLogStore, RejectionLog } from '../game/anticheat/rejectionLogStore';
import { RejectionLogCard } from './RejectionLogCard';

interface AntiCheatLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AntiCheatLogsModal({ isOpen, onClose }: AntiCheatLogsModalProps) {
  const [logs, setLogs] = useState<RejectionLog[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    setLogs(rejectionLogStore.getLogs());
    const unsubscribe = rejectionLogStore.subscribe(() => {
      setLogs(rejectionLogStore.getLogs());
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleClear = () => {
    rejectionLogStore.clear();
  };

  const handleCopyAll = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = jsonStr;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `anticheat_rejections_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <div>
              <h2 className="text-base font-bold text-neutral-100">Logs de Rejeição do Anti-Cheat</h2>
              <p className="text-xs text-neutral-400">Diagnóstico técnico das ações e blocos bloqueados</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <>
                <button
                  onClick={handleCopyAll}
                  title="Copiar todos os logs para a área de transferência"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    copiedAll
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white'
                  }`}
                >
                  {copiedAll ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-amber-400" />}
                  <span>{copiedAll ? 'Copiado!' : 'Copiar Todos'}</span>
                </button>
                <button
                  onClick={handleExport}
                  title="Exportar logs como JSON"
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClear}
                  title="Limpar todos os logs"
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950/80 text-neutral-300 hover:text-red-300 border border-transparent hover:border-red-800/50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Logs List Container */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {logs.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-neutral-500">
              <ShieldAlert className="w-10 h-10 mb-2 opacity-40 text-emerald-400" />
              <p className="text-sm font-medium text-neutral-300">Nenhuma rejeição registrada</p>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">
                Quando o sistema de segurança bloquear uma tentativa de scaffold ou rotação irregular, ela aparecerá aqui.
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <RejectionLogCard key={log.id} log={log} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between text-xs text-neutral-400">
          <span>Total de rejeições capturadas: <strong className="text-neutral-200">{logs.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
