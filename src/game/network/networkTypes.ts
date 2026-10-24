import { BlockType, Team } from '../../types/game';

export interface NetworkCallbacks {
  onQueueStatus?: (inQueue: boolean, pos?: number) => void;
  onMatchFound?: (roomId: string, myTeam: Team, opponentName: string) => void;
  onOpponentMove?: (pos?: { x: number; y: number; z: number }, rot?: number, occluded?: boolean) => void;
  onPlayerTeleport?: (pos: { x: number; y: number; z: number }) => void;
  onBlockPlaced?: (block: { x: number; y: number; z: number; type: BlockType }) => void;
  onBlockConfirmed?: (block: { x: number; y: number; z: number; type: BlockType }) => void;
  onBlockRejected?: (data: { pos: { x: number; y: number; z: number }; rule?: string; reason?: string; file?: string; error?: string; cause?: string; details?: Record<string, unknown> }) => void;
  onBlockBroken?: (pos: { x: number; y: number; z: number }) => void;
  onBedBroken?: (team: Team, by: Team) => void;
  onCombatDamage?: (targetTeam: Team, damage: number, dir: { x: number; y: number; z: number }) => void;
  onOpponentLeft?: () => void;
  onConnectionChange?: (connected: boolean) => void;
  onAntiCheatFlag?: (data: { rule: string; details: string; vl: number; category?: string; error?: string; file?: string; cause?: string; playerPos?: { x: number; y: number; z: number }; blockSupport?: string; ping?: number; fps?: number; rttInfo?: string; timestamp?: number }) => void;
  onPingUpdate?: (ping: number) => void;
}
