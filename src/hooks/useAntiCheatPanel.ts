import { GameEngine } from '../game/gameEngine';
import { useAntiCheatPanelState } from './useAntiCheatPanelState';
import { useAntiCheatSync } from './useAntiCheatSync';
import * as Actions from './antiCheatPanelActions';
import { BotControlMode } from '../game/entities/botOpponent';

export function useAntiCheatPanel(engine: GameEngine | null) {
  const s = useAntiCheatPanelState();

  useAntiCheatSync({
    engine,
    setFlyEnabled: s.setFlyEnabled,
    setSpeedEnabled: s.setSpeedEnabled,
    setSpeedValue: s.setSpeedValue,
    setEspEnabled: s.setEspEnabled,
    setAntiEspEnabled: s.setAntiEspEnabled,
    setFakeFovBypass: s.setFakeFovBypass,
    setAimbotEnabled: s.setAimbotEnabled,
    setAimbotFov: s.setAimbotFov,
    setVlScore: s.setVlScore,
    setLogs: s.setLogs,
    setOcclusionStatus: s.setOcclusionStatus,
    setOpponentDistance: s.setOpponentDistance,
    setIsBotActive: s.setIsBotActive,
    setBotMode: s.setBotMode,
    setBotAttack: s.setBotAttack,
  });

  return {
    isOpen: s.isOpen, setIsOpen: s.setIsOpen,
    activeTab: s.activeTab, setActiveTab: s.setActiveTab,
    vlScore: s.vlScore, flyEnabled: s.flyEnabled,
    speedEnabled: s.speedEnabled, speedValue: s.speedValue,
    espEnabled: s.espEnabled, antiEspEnabled: s.antiEspEnabled,
    fakeFovBypass: s.fakeFovBypass, aimbotEnabled: s.aimbotEnabled,
    aimbotFov: s.aimbotFov, occlusionStatus: s.occlusionStatus,
    opponentDistance: s.opponentDistance, botMode: s.botMode,
    botAttack: s.botAttack, isBotActive: s.isBotActive,
    lastLog: s.lastLog, logs: s.logs, copied: s.copied,
    handleToggleFly: () => Actions.handleToggleFlyAction(engine, s.flyEnabled, s.setFlyEnabled, s.setLastLog),
    handleToggleSpeed: () => Actions.handleToggleSpeedAction(engine, s.speedEnabled, s.speedValue, s.setSpeedEnabled, s.setLastLog),
    handleSpeedChange: (v: number) => Actions.handleSpeedChangeAction(engine, v, s.speedEnabled, s.setSpeedValue, s.setLastLog),
    handleToggleEsp: () => Actions.handleToggleEspAction(engine, s.espEnabled, s.setEspEnabled, s.setLastLog),
    handleToggleAntiEsp: () => Actions.handleToggleAntiEspAction(engine, s.antiEspEnabled, s.setAntiEspEnabled, s.setLastLog),
    handleToggleFakeFovBypass: () => Actions.handleToggleFakeFovBypassAction(engine, s.fakeFovBypass, s.setFakeFovBypass, s.setLastLog),
    handleToggleAimbot: () => Actions.handleToggleAimbotAction(engine, s.aimbotEnabled, s.setAimbotEnabled, s.setLastLog),
    handleAimbotFovChange: (v: number) => Actions.handleAimbotFovChangeAction(engine, v, s.setAimbotFov, s.setLastLog),
    handleSetBotMode: (m: BotControlMode) => Actions.handleSetBotModeAction(engine, m, s.setBotMode, s.setLastLog),
    handleTeleportBotBehindWall: () => Actions.handleTeleportBotBehindWallAction(engine, s.setLastLog),
    handleTeleportBotNearPlayer: () => Actions.handleTeleportBotNearPlayerAction(engine, s.setLastLog),
    handleTeleportBotToCenter: () => Actions.handleTeleportBotToCenterAction(engine, s.setLastLog),
    handleToggleBotAttack: () => Actions.handleToggleBotAttackAction(engine, s.botAttack, s.setBotAttack, s.setLastLog),
    handleEnterTestArena: () => Actions.handleEnterTestArenaAction(engine, s.setLastLog),
    handleAutoTpBed: () => Actions.handleAutoTpBedAction(engine, s.setLastLog),
    handleSpawnVisualWool: () => Actions.handleSpawnVisualWoolAction(engine, s.setLastLog),
    handleSpawnFakeGhostBlock: () => Actions.handleSpawnFakeGhostBlockAction(engine, s.setLastLog),
    handleResetVL: () => Actions.handleResetVlAction(engine, s.setVlScore, s.setLastLog),
    handleCopyLogs: () => Actions.handleCopyLogsAction(engine, s.setCopied),
    handleClearLogs: () => Actions.handleClearLogsAction(engine, s.setLogs),
  };
}
