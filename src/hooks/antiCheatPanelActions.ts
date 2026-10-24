/**
 * Exportador consolidado de todas as ações e manipuladores do painel Anti-Cheat.
 * Agrupa funções divididas em módulos menores de 32 a 63 linhas.
 */

export {
  handleToggleFlyAction,
  handleResetFlyState,
} from './panelFlyActions';

export {
  handleToggleSpeedAction,
  handleSpeedChangeAction,
} from './panelSpeedActions';

export {
  handleToggleEspAction,
  handleToggleAntiEspAction,
  handleToggleFakeFovBypassAction,
} from './panelEspActions';

export {
  handleToggleAimbotAction,
  handleAimbotFovChangeAction,
} from './panelAimbotActions';

export {
  handleSetBotModeAction,
  handleToggleBotAttackAction,
  handleEnterTestArenaAction,
} from './panelBotModeActions';

export {
  handleTeleportBotBehindWallAction,
  handleTeleportBotNearPlayerAction,
  handleTeleportBotToCenterAction,
} from './panelBotTeleportActions';

export {
  handleAutoTpBedAction,
  handleSpawnFakeGhostBlockAction,
} from './panelExploitActions';

export {
  handleSpawnVisualWoolAction,
} from './panelInventoryActions';

export {
  handleCopyLogsAction,
  handleResetVlAction,
  handleClearLogsAction,
} from './panelLogsActions';
