import { useState, useCallback, useEffect, RefObject, MutableRefObject } from 'react';
import { GameEngine } from '../game/gameEngine';
import { GameState, HotbarItem, MatchInfo, ResourceCounts } from '../types/game';

interface UseGameStateSyncParams {
  canvasRef: RefObject<HTMLCanvasElement>;
  engineRef: MutableRefObject<GameEngine | null>;
  setActiveShop: (shop: 'item_shop' | 'upgrade_shop' | null) => void;
  setBanReason: (reason: string) => void;
  setBanVL: (vl: number) => void;
  setBanModalOpen: (open: boolean) => void;
}

export function useGameStateSync({
  canvasRef,
  engineRef,
  setActiveShop,
  setBanReason,
  setBanVL,
  setBanModalOpen,
}: UseGameStateSyncParams) {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [health, setHealth] = useState(20);
  const [resources, setResources] = useState<ResourceCounts>({ iron: 18, gold: 4, diamond: 0, emerald: 0 });
  const [matchInfo, setMatchInfo] = useState<MatchInfo>({
    roomId: 'test_match', myTeam: 'red', opponentName: 'Bot Azul',
    redBed: true, blueBed: true, redAlive: true, blueAlive: true
  });
  const [hotbar, setHotbar] = useState<(HotbarItem | null)[]>([]);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [inQueue, setInQueue] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const syncUI = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.syncResourcesToHotbar();
    setGameState(engine.state);
    setHealth(engine.match.health);
    setResources({ ...engine.inventory });
    setMatchInfo({ ...engine.match.matchInfo });
    setHotbar([...engine.hotbar]);
    setSelectedSlot(engine.selectedSlot);
  }, [engineRef]);

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    engine.onSyncUI = syncUI;
    engine.onOpenShop = (shopType) => {
      document.exitPointerLock?.();
      setActiveShop(shopType);
    };

    engine.antiCheat.setCallbacks({
      onWarning: (msg) => console.warn(msg),
      onAction: (reason, vl) => {
        document.exitPointerLock?.();
        setBanReason(reason);
        setBanVL(vl);
        setBanModalOpen(true);
      }
    });

    engine.network.callbacks.onQueueStatus = (queued) => {
      setInQueue(queued);
    };

    const handleResize = () => {
      engine.handleResize();
    };
    window.addEventListener('resize', handleResize);
    engine.handleResize();

    engine.startMenu();
    setGameState('menu');
    setHotbar([...engine.hotbar]);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  return {
    gameState,
    setGameState,
    health,
    resources,
    matchInfo,
    hotbar,
    setHotbar,
    selectedSlot,
    setSelectedSlot,
    inQueue,
    isMobile,
    syncUI,
  };
}
