import { BlockType, Team } from '../../types/game';
import { routeIncomingNetworkMessage } from './networkMessageRouter';
import type { NetworkCallbacks } from './networkTypes';

export type { NetworkCallbacks };

export class NetworkClient {
  private ws: WebSocket | null = null;
  public callbacks: NetworkCallbacks = {};
  private queueTimer: number | null = null;
  private pingInterval: number | null = null;
  public isConnected = false;
  private pendingMatchStart: { roomId: string, spawnPos?: { x: number; y: number; z: number } } | null = null;
  private currentPing = 0;
  private currentFps = 60;

  constructor(callbacks: NetworkCallbacks) {
    this.callbacks = callbacks;
    this.connect();
    this.startPingLoop();
  }

  public getPing(): number { return this.currentPing; }
  public getFps(): number { return this.currentFps; }
  public setFps(fps: number) { if (fps > 0) this.currentFps = Math.round(fps); }

  private startPingLoop() {
    if (typeof window === 'undefined') return;
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = window.setInterval(() => {
      if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('ping:check', { clientTime: performance.now() });
      }
    }, 1500);
  }

  public connect() {
    if (typeof window === 'undefined') return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host || 'localhost:3000';
    try {
      this.ws = new WebSocket(`${protocol}//${host}/ws`);
      this.ws.onopen = () => {
        this.isConnected = true;
        this.callbacks.onConnectionChange?.(true);
        if (this.pendingMatchStart) {
          this.send('match:start', this.pendingMatchStart);
          this.pendingMatchStart = null;
        }
        // Send instant ping check on connect
        this.send('ping:check', { clientTime: performance.now() });
      };
      this.ws.onmessage = (event) => {
        try {
          this.handleMessage(JSON.parse(event.data));
        } catch {}
      };
      this.ws.onclose = () => {
        this.isConnected = false;
        this.callbacks.onConnectionChange?.(false);
        setTimeout(() => this.connect(), 2000);
      };
    } catch {
      this.isConnected = false;
      this.callbacks.onConnectionChange?.(false);
    }
  }

  private handleMessage(msg: Record<string, unknown>) {
    if ((window as any).addGameLog) (window as any).addGameLog(`[RECV] ${msg.type} ${JSON.stringify(msg)}`);
    if (msg.type === 'ping:reply' && typeof msg.clientTime === 'number') {
      const samplePing = Math.max(1, Math.round(performance.now() - msg.clientTime));
      this.currentPing = this.currentPing === 0 ? samplePing : Math.round(this.currentPing * 0.6 + samplePing * 0.4);
      this.callbacks.onPingUpdate?.(this.currentPing);
    }
    routeIncomingNetworkMessage(msg, this.callbacks, () => {
      if (this.queueTimer) clearTimeout(this.queueTimer);
    });
  }

  public send(type: string, data: Record<string, unknown> = {}) {
    if ((window as any).addGameLog) (window as any).addGameLog(`[SEND] ${type} ${JSON.stringify(data)}`);
    if (this.ws && this.isConnected) this.ws.send(JSON.stringify({ type, ...data }));
  }

  public joinQueue(playerName = 'Player') {
    this.send('queue:join', { name: playerName });
    this.callbacks.onQueueStatus?.(true, 1);
    if (this.queueTimer) clearTimeout(this.queueTimer);
    this.queueTimer = window.setTimeout(() => {
      this.callbacks.onMatchFound?.(`practice_${Date.now()}`, 'red', 'Alex (Bot)');
    }, 3500);
  }

  public leaveQueue() {
    if (this.queueTimer) clearTimeout(this.queueTimer);
    this.send('queue:leave');
    this.callbacks.onQueueStatus?.(false);
  }

  public sendMove(
    pos: { x: number; y: number; z: number },
    rot: number,
    keys?: { forward: boolean; backward: boolean; left: boolean; right: boolean; jump: boolean; sneak: boolean; flyKey: boolean },
    isGrounded?: boolean,
    dt?: number,
    velocity?: { x: number; y: number; z: number },
    isTeleport?: boolean,
    pitch?: number
  ) {
    this.send('player:move', {
      pos,
      rot,
      keys,
      isGrounded,
      dt,
      velocity,
      isTeleport,
      pitch,
      ping: this.currentPing,
      fps: this.currentFps
    });
  }
  public sendTeleport(pos: { x: number; y: number; z: number }) { this.send('player:teleport', { pos }); }
  public sendBlockPlace(block: { x: number; y: number; z: number; type: BlockType; isVisual?: boolean }) { this.send('block:place', { block }); }
  public sendShopBuy(purchase: { itemId: string; costType: string; costAmount: number; count: number; blockType?: number }) { this.send('shop:buy', { purchase }); }
  public sendRespawn(spawnPos?: { x: number; y: number; z: number }) { this.send('player:respawn', { spawnPos }); }
  public sendBlockBreak(pos: { x: number; y: number; z: number }) { this.send('block:break', { pos }); }
  public sendBedBreak(team: Team) { this.send('bed:break', { team }); }
  public sendHit(targetTeam: Team, damage: number, dir: { x: number; y: number; z: number }, targetPos?: { x: number; y: number; z: number }) { this.send('combat:hit', { targetTeam, damage, dir, targetPos }); }
  public sendDeath() { this.send('player:death'); }
  public leaveMatch() {
    if (this.queueTimer) clearTimeout(this.queueTimer);
    this.send('match:leave');
  }
  public sendMatchStart(roomId: string, spawnPos?: { x: number; y: number; z: number }) {
    if (this.ws && this.isConnected) {
      this.send('match:start', { roomId, spawnPos });
    } else {
      this.pendingMatchStart = { roomId, spawnPos };
    }
  }
}
