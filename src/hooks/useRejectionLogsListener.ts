import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { rejectionLogStore } from '../game/anticheat/rejectionLogStore';

export function useRejectionLogsListener(setLogsModalOpen: Dispatch<SetStateAction<boolean>>) {
  const [rejectionCount, setRejectionCount] = useState(0);

  useEffect(() => {
    setRejectionCount(rejectionLogStore.getLogs().length);
    const unsubscribe = rejectionLogStore.subscribe(() => {
      setRejectionCount(rejectionLogStore.getLogs().length);
    });

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP' || e.key === 'p' || e.key === 'P') {
        document.exitPointerLock?.();
        setLogsModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [setLogsModalOpen]);

  return { rejectionCount };
}
