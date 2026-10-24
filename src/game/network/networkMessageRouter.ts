import { BlockType, Team } from '../../types/game';
import { NetworkCallbacks } from './networkClient';

export function routeIncomingNetworkMessage(
  msg: Record<string, unknown>,
  callbacks: NetworkCallbacks,
  onClearQueueTimer?: () => void
) {
  if (msg.type === 'queue:status') {
    callbacks.onQueueStatus?.(!!msg.inQueue, typeof msg.position === 'number' ? msg.position : undefined);
  } else if (msg.type === 'match:found') {
    onClearQueueTimer?.();
    callbacks.onMatchFound?.(msg.roomId as string, msg.team as Team, (msg.opponentName as string) || 'Player 2');
  } else if (msg.type === 'player:moved') {
    callbacks.onOpponentMove?.(
      msg.pos as { x: number; y: number; z: number } | undefined,
      typeof msg.rot === 'number' ? msg.rot : 0,
      typeof msg.occluded === 'boolean' ? msg.occluded : undefined
    );
  } else if (msg.type === 'player:teleport') {
    callbacks.onPlayerTeleport?.(msg.pos as { x: number; y: number; z: number });
  } else if (msg.type === 'block:placed') {
    callbacks.onBlockPlaced?.(msg.block as { x: number; y: number; z: number; type: BlockType });
  } else if (msg.type === 'block:confirmed') {
    callbacks.onBlockConfirmed?.(msg.block as { x: number; y: number; z: number; type: BlockType });
  } else if (msg.type === 'block:rejected') {
    callbacks.onBlockRejected?.({
      pos: msg.pos as { x: number; y: number; z: number },
      rule: msg.rule as string | undefined,
      reason: msg.reason as string | undefined,
      file: msg.file as string | undefined,
      error: msg.error as string | undefined,
      cause: msg.cause as string | undefined,
      details: msg.details as Record<string, unknown> | undefined,
    });
  } else if (msg.type === 'block:broken') {
    callbacks.onBlockBroken?.(msg.pos as { x: number; y: number; z: number });
  } else if (msg.type === 'bed:broken') {
    callbacks.onBedBroken?.(msg.team as Team, msg.by as Team);
  } else if (msg.type === 'combat:damage') {
    callbacks.onCombatDamage?.(
      msg.targetTeam as Team,
      msg.damage as number,
      msg.dir as { x: number; y: number; z: number }
    );
  } else if (msg.type === 'anticheat:flag') {
    callbacks.onAntiCheatFlag?.(msg as any);
  } else if (msg.type === 'ping:reply') {
    if (typeof msg.clientTime === 'number') {
      const ping = Math.round(performance.now() - msg.clientTime);
      callbacks.onPingUpdate?.(ping);
    }
  } else if (msg.type === 'opponent:left') {
    callbacks.onOpponentLeft?.();
  }
}
