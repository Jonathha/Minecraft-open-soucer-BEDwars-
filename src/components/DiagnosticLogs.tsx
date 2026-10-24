import React, { useEffect, useState } from 'react';

interface LogEntry {
  id: number;
  text: string;
  time: number;
}

export function DiagnosticLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    let nextId = 0;
    (window as any).addGameLog = (text: string) => {
      setLogs(prev => {
        const now = Date.now();
        const newLogs = [...prev, { id: nextId++, text, time: now }];
        const filtered = newLogs.filter(l => now - l.time <= 10000).slice(-100);
        return filtered;
      });
    };

    const interval = setInterval(() => {
      setLogs(prev => {
        const now = Date.now();
        return prev.filter(l => now - l.time <= 10000);
      });
    }, 100);

    return () => {
      clearInterval(interval);
      delete (window as any).addGameLog;
    };
  }, []);

  if (logs.length === 0) return null;

  const handleCopy = () => {
    const text = logs.map(l => l.text).join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 p-4 rounded-lg pointer-events-auto z-[999] min-w-[400px] border border-white/20 select-text">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white text-xs font-bold font-mono">NET LOGS (3s)</h3>
        <button onClick={handleCopy} className="bg-white/20 hover:bg-white/30 text-white text-[10px] px-2 py-1 rounded">
          COPY
        </button>
      </div>
      <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
        {logs.map(log => (
          <div key={log.id} className="text-green-400 font-mono text-[10px] leading-tight break-all">
            {log.text}
          </div>
        ))}
      </div>
    </div>
  );
}
