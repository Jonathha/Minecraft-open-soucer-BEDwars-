import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { ShopModal } from './ShopModal';
import { MatchOverlay } from './MatchOverlay';
import { AntiCheatTestPanel } from './AntiCheatTestPanel';
import { BanTestModal } from './BanTestModal';
import { AntiCheatLogsModal } from './AntiCheatLogsModal';
import { AntiCheatLogsButton } from './AntiCheatLogsButton';
import { MatchInfo, ResourceCounts, HotbarItem, GameState } from '../types/game';

interface GameModalsAndOverlaysProps {
  engine: GameEngine | null;
  gameState: GameState;
  activeShop: 'item_shop' | 'upgrade_shop' | null;
  setActiveShop: (shop: 'item_shop' | 'upgrade_shop' | null) => void;
  resources: ResourceCounts;
  hotbar: (HotbarItem | null)[];
  matchInfo: MatchInfo;
  inQueue: boolean;
  banModalOpen: boolean;
  setBanModalOpen: (open: boolean) => void;
  banReason: string;
  setBanReason: (reason: string) => void;
  banVL: number;
  setBanVL: (vl: number) => void;
  logsModalOpen: boolean;
  setLogsModalOpen: (open: boolean) => void;
  rejectionCount: number;
}

export const GameModalsAndOverlays: React.FC<GameModalsAndOverlaysProps> = ({
  engine,
  gameState,
  activeShop,
  setActiveShop,
  resources,
  hotbar,
  matchInfo,
  inQueue,
  banModalOpen,
  setBanModalOpen,
  banReason,
  setBanReason,
  banVL,
  setBanVL,
  logsModalOpen,
  setLogsModalOpen,
  rejectionCount,
}) => {
  return (
    <>
      {activeShop && (
        <ShopModal
          type={activeShop}
          resources={resources}
          hotbar={hotbar}
          myTeam={matchInfo.myTeam}
          onClose={() => setActiveShop(null)}
          onBuyItem={(item) => engine?.buyItem(item, matchInfo.myTeam) ?? false}
          onBuyUpgrade={(upgrade) => engine?.buyUpgrade(upgrade) ?? false}
        />
      )}

      <MatchOverlay
        inQueue={inQueue}
        matchInfo={matchInfo}
        isEnded={gameState === 'ended'}
        onCancelQueue={() => engine?.network.leaveQueue()}
        onReturnToLobby={() => engine?.enterLobby()}
      />

      <AntiCheatTestPanel
        engine={engine}
        onSimulateBanModal={() => {
          document.exitPointerLock?.();
          const currentVl = engine?.antiCheat.getViolationLevel() || 8.0;
          setBanReason('Scaffold / Colocação de blocos anormal');
          setBanVL(Math.max(currentVl, 8.0));
          setBanModalOpen(true);
        }}
        onOpenRejectionLogs={() => {
          document.exitPointerLock?.();
          setLogsModalOpen(true);
        }}
      />

      <AntiCheatLogsButton rejectionCount={rejectionCount} onOpen={() => setLogsModalOpen(true)} />
      <AntiCheatLogsModal isOpen={logsModalOpen} onClose={() => setLogsModalOpen(false)} />

      {banModalOpen && (
        <BanTestModal
          reason={banReason}
          vlScore={banVL}
          onClose={() => setBanModalOpen(false)}
          onResetVL={() => engine?.antiCheat.reset()}
        />
      )}
    </>
  );
};
