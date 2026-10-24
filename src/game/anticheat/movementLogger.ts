import { PlayerController } from '../player/playerController';
import { BlockPlacePacket } from './types';
import { createPlacementLogEntries } from './movementLogFormatter';
import { TelemetrySample, MovementLogEntry, recordPlayerTelemetrySample } from './telemetrySampleRecorder';

export type { TelemetrySample, MovementLogEntry };

export class MovementLogger {
  private rollingSamples: TelemetrySample[] = [];
  private maxRollingTimeMs = 10000;
  private recordedLogs: MovementLogEntry[] = [];
  private sampleTimer = 0;
  private readonly SAMPLE_INTERVAL = 0.05;
  private listener?: () => void;
  private placementCount = 0;

  public setListener(cb?: () => void) { this.listener = cb; }
  public notifyListener() { this.listener?.(); }

  public update(delta: number, player: PlayerController) {
    this.sampleTimer += delta;
    if (this.sampleTimer >= this.SAMPLE_INTERVAL) {
      this.sampleTimer = 0;
      recordPlayerTelemetrySample(player, this.rollingSamples, this.maxRollingTimeMs);
    }
  }

  public logViolation(module: string, details: string, score: number, meta?: { ping?: number; fps?: number; rttInfo?: string; playerPos?: { x: number; y: number; z: number }; blockSupport?: string; origin?: string }) {
    const now = performance.now();
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const originTag = meta?.origin ? `[${meta.origin.toUpperCase()}] ` : '';
    const perfTag = (meta?.ping !== undefined || meta?.fps !== undefined)
      ? ` | Ping: ${meta.ping ?? 0}ms | FPS: ${meta.fps ?? 60} | RTT Data Center (us-east1): ${meta.ping ?? 0}ms`
      : '';
    const supportTag = meta?.blockSupport ? ` | Apoio: ${meta.blockSupport}` : '';
    const posTag = meta?.playerPos ? ` | Pos: (${meta.playerPos.x}, ${meta.playerPos.y}, ${meta.playerPos.z})` : '';

    this.recordedLogs.push({
      id: Math.random().toString(36).substring(2),
      timestamp: now,
      formattedTime: timeStr,
      type: 'PLACEMENT_EVENT',
      category: 'PLACE_BLOCK',
      text: `🚨 ${originTag}VIOLAÇÃO [${module.toUpperCase()}]: ${details}${posTag}${supportTag}${perfTag} | VL: ${score.toFixed(1)}`
    });

    if (this.recordedLogs.length > 500) {
      this.recordedLogs = this.recordedLogs.slice(-400);
    }
    this.notifyListener();
  }

  public logPlacement(packet: BlockPlacePacket, isAllowed: boolean, reason?: string) {
    const now = performance.now();
    this.placementCount++;

    const windowStart = now - 3000;
    const prePlacementSamples = this.rollingSamples.filter(s => s.timestamp >= windowStart && s.timestamp <= now);

    const newEntries = createPlacementLogEntries(packet, isAllowed, reason, now, this.placementCount, prePlacementSamples);
    this.recordedLogs.push(...newEntries);

    if (this.recordedLogs.length > 500) {
      this.recordedLogs = this.recordedLogs.slice(-400);
    }
    this.notifyListener();
  }

  public getLogs(): MovementLogEntry[] { return this.recordedLogs; }

  public getLogsAsString(): string {
    if (this.recordedLogs.length === 0) {
      return 'Nenhum log de movimentação registrado ainda.\nColoque blocos no jogo para gravar os 3 segundos anteriores e a telemetria completa!';
    }
    return this.recordedLogs.map(l => l.text).join('\n');
  }

  public clearLogs() {
    this.recordedLogs = [];
    this.placementCount = 0;
    this.notifyListener();
  }
}
