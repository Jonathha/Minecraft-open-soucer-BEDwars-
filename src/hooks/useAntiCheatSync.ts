import { useEffect } from 'react';
import { GameEngine } from '../game/gameEngine';
import { MovementLogEntry } from '../game/anticheat/movementLogger';
import { BotControlMode } from '../game/entities/botOpponent';
import { OcclusionStatus } from '../game/anticheat/espManager';

interface SyncProps {
  engine: GameEngine | null;
  setFlyEnabled: (v: boolean) => void;
  setSpeedEnabled: (v: boolean) => void;
  setSpeedValue: (v: number) => void;
  setEspEnabled: (v: boolean) => void;
  setAntiEspEnabled: (v: boolean) => void;
  setFakeFovBypass: (v: boolean) => void;
  setAimbotEnabled: (v: boolean) => void;
  setAimbotFov: (v: number) => void;
  setVlScore: (v: number) => void;
  setLogs: (logs: MovementLogEntry[]) => void;
  setOcclusionStatus: (s: OcclusionStatus) => void;
  setOpponentDistance: (d: number) => void;
  setIsBotActive: (b: boolean) => void;
  setBotMode: (m: BotControlMode) => void;
  setBotAttack: (b: boolean) => void;
}

export function useAntiCheatSync(props: SyncProps): void {
  const { engine } = props;

  useEffect(() => {
    if (!engine) return;
    props.setFlyEnabled(engine.player.isFlyEnabled);
    props.setSpeedEnabled(engine.player.isSpeedEnabled);
    props.setSpeedValue(engine.player.speedMultiplier);
    props.setEspEnabled(engine.esp.espEnabled);
    props.setAntiEspEnabled(engine.esp.antiEspEnabled);
    props.setFakeFovBypass(engine.esp.fakeFovBypass);
    props.setAimbotEnabled(engine.aimbot.aimbotEnabled);
    props.setAimbotFov(engine.aimbot.fov);

    const interval = setInterval(() => {
      props.setVlScore(Math.round(engine.antiCheat.getViolationLevel() * 10) / 10);
      props.setLogs(engine.antiCheat.movementLogger.getLogs());

      const espState = engine.esp.getState();
      props.setEspEnabled(espState.espEnabled);
      props.setAntiEspEnabled(espState.antiEspEnabled);
      props.setFakeFovBypass(espState.fakeFovBypass);
      props.setOcclusionStatus(espState.status);
      props.setOpponentDistance(espState.distance);

      if (engine.bot) {
        props.setIsBotActive(true);
        props.setBotMode(engine.bot.mode);
        props.setBotAttack(engine.bot.attackEnabled);
      } else {
        props.setIsBotActive(false);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [engine]);
}
