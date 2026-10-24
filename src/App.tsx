import React, { useRef, useState } from 'react';
import { GameEngine } from './game/gameEngine';
import { MainMenu } from './components/MainMenu';
import { GameHud } from './components/GameHud';
import { MobileControls } from './components/MobileControls';
import { GameModalsAndOverlays } from './components/GameModalsAndOverlays';
import { useGameInput } from './hooks/useGameInput';
import { useGameStateSync } from './hooks/useGameStateSync';
import { useRejectionLogsListener } from './hooks/useRejectionLogsListener';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [activeShop, setActiveShop] = useState<'item_shop' | 'upgrade_shop' | null>(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState('Scaffold / Rotação impossível detectada');
  const [banVL, setBanVL] = useState(8.0);
  const [logsModalOpen, setLogsModalOpen] = useState(false);

  const {
    gameState, health, resources, matchInfo, hotbar, selectedSlot, setSelectedSlot, inQueue, isMobile
  } = useGameStateSync({
    canvasRef, engineRef, setActiveShop, setBanReason, setBanVL, setBanModalOpen
  });

  const { rejectionCount } = useRejectionLogsListener(setLogsModalOpen);
  useGameInput({ engineRef, canvasRef, activeShop, setActiveShop, setSelectedSlot });

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const engine = engineRef.current;
    if (!engine || activeShop || gameState === 'menu' || banModalOpen || logsModalOpen) return;
    if (!isMobile && document.pointerLockElement !== canvasRef.current) {
      try { canvasRef.current?.requestPointerLock?.()?.catch?.(() => {}); } catch {}
    }
  };

  const handleCanvasMouseUp = () => {};

  return (
    <div className="relative w-full h-screen overflow-hidden bg-neutral-950 font-sans select-none">
      <canvas
        ref={canvasRef}
        id="game-canvas"
        onMouseDown={handleCanvasMouseDown}
        onMouseUp={handleCanvasMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full block cursor-crosshair"
      />

      {gameState === 'menu' && (
        <MainMenu
          onEnter={() => engineRef.current?.enterLobby()}
          onPlay1v1={() => engineRef.current?.network.joinQueue('Jogador')}
        />
      )}

      {(gameState === 'match' || gameState === 'lobby') && (
        <GameHud
          health={health}
          resources={resources}
          hotbar={hotbar}
          selectedSlot={selectedSlot}
          matchInfo={matchInfo}
          gameState={gameState}
          onSelectSlot={(slot) => {
            if (engineRef.current) engineRef.current.selectedSlot = slot;
            setSelectedSlot(slot);
          }}
          onPlay1v1={() => engineRef.current?.network.joinQueue('Jogador')}
        />
      )}

      {isMobile && gameState === 'match' && (
        <MobileControls
          onMove={(x, y) => engineRef.current?.player.setMoveInput(x, y)}
          onLook={(dx, dy) => engineRef.current?.player.applyTouchLook(dx, dy)}
          onJump={(jumping) => engineRef.current?.player.setJump(jumping)}
          onAttack={() => {
            if (engineRef.current?.aimbot.aimbotEnabled) {
              engineRef.current.aimbot.triggerAimbot(engineRef.current, false);
            }
            engineRef.current?.interaction.handleAttackOrBreak();
          }}
          onAttackStart={() => {
            if (engineRef.current?.aimbot.aimbotEnabled) {
              engineRef.current.aimbot.triggerAimbot(engineRef.current, false);
            }
            engineRef.current?.interaction.startBreak();
          }}
          onAttackEnd={() => engineRef.current?.interaction.stopBreak()}
          onPlace={() => engineRef.current?.interaction.handlePlaceBlock()}
          onInteract={() => engineRef.current?.interaction.handleAttackOrBreak()}
        />
      )}

      <GameModalsAndOverlays
        engine={engineRef.current}
        gameState={gameState}
        activeShop={activeShop}
        setActiveShop={setActiveShop}
        resources={resources}
        hotbar={hotbar}
        matchInfo={matchInfo}
        inQueue={inQueue}
        banModalOpen={banModalOpen}
        setBanModalOpen={setBanModalOpen}
        banReason={banReason}
        setBanReason={setBanReason}
        banVL={banVL}
        setBanVL={setBanVL}
        logsModalOpen={logsModalOpen}
        setLogsModalOpen={setLogsModalOpen}
        rejectionCount={rejectionCount}
      />
    </div>
  );
}
