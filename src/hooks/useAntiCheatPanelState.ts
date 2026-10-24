import { useState } from 'react';
import { MovementLogEntry } from '../game/anticheat/movementLogger';
import { BotControlMode } from '../game/entities/botOpponent';
import { OcclusionStatus } from '../game/anticheat/espManager';

export function useAntiCheatPanelState() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'controls' | 'logs'>('controls');
  const [vlScore, setVlScore] = useState(0);
  const [flyEnabled, setFlyEnabled] = useState(false);
  const [speedEnabled, setSpeedEnabled] = useState(false);
  const [speedValue, setSpeedValue] = useState(2.5);
  const [espEnabled, setEspEnabled] = useState(false);
  const [antiEspEnabled, setAntiEspEnabled] = useState(true);
  const [fakeFovBypass, setFakeFovBypass] = useState(false);
  const [aimbotEnabled, setAimbotEnabled] = useState(false);
  const [aimbotFov, setAimbotFov] = useState(70);
  const [occlusionStatus, setOcclusionStatus] = useState<OcclusionStatus>('no_opponent');
  const [opponentDistance, setOpponentDistance] = useState(0);
  const [botMode, setBotMode] = useState<BotControlMode>('behind_wall');
  const [botAttack, setBotAttack] = useState(false);
  const [isBotActive, setIsBotActive] = useState(false);
  const [lastLog, setLastLog] = useState<string>('Pronto para testes');
  const [logs, setLogs] = useState<MovementLogEntry[]>([]);
  const [copied, setCopied] = useState(false);

  return {
    isOpen, setIsOpen,
    activeTab, setActiveTab,
    vlScore, setVlScore,
    flyEnabled, setFlyEnabled,
    speedEnabled, setSpeedEnabled,
    speedValue, setSpeedValue,
    espEnabled, setEspEnabled,
    antiEspEnabled, setAntiEspEnabled,
    fakeFovBypass, setFakeFovBypass,
    aimbotEnabled, setAimbotEnabled,
    aimbotFov, setAimbotFov,
    occlusionStatus, setOcclusionStatus,
    opponentDistance, setOpponentDistance,
    botMode, setBotMode,
    botAttack, setBotAttack,
    isBotActive, setIsBotActive,
    lastLog, setLastLog,
    logs, setLogs,
    copied, setCopied,
  };
}
