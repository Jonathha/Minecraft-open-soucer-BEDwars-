export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type CheckCategory = 'FLY' | 'SPEED' | 'FAKE_LAG' | 'COMBAT' | 'PLACEMENT' | 'TELEPORT';

export interface ServerViolation {
  category: CheckCategory;
  rule: string;
  weight: number;
  details: string;
  timestamp: number;
  expiresAt?: number;
  file?: string;
  error?: string;
  cause?: string;
  playerPos?: Vector3D;
  blockSupport?: string;
  ping?: number;
  fps?: number;
  rttInfo?: string;
}

export interface CheckResult {
  allowed: boolean;
  violation?: ServerViolation;
  setbackPos?: Vector3D;
}

export interface PositionHistoryEntry {
  pos: Vector3D;
  timestamp: number;
}

export interface ServerPlayerData {
  id: string;
  lastPos: Vector3D;
  lastPosTime: number;
  lastRot: number;
  violationLevel: number;
  violations: ServerViolation[];
  
  // Position History for Anti-TP (3s rolling buffer)
  posHistory: PositionHistoryEntry[];

  // Movement & Fly tracking
  airTicks: number;
  lastGroundY: number;
  lastLegitGroundedPos?: Vector3D;
  lastIllegalFlySpot?: { x: number; y: number; z: number; timestamp: number };
  recentPlacedBlocks?: Array<{ x: number; y: number; z: number; timestamp: number }>;
  
  // Fake Lag & Timer tracking
  packetTimestamps: number[];
  suspendedDuration: number;

  // Combat tracking
  lastAttackTime: number;
  attackCountWindow: number;
  lastAttackResetTime: number;

  // Placement tracking
  lastPlaceTime: number;
  placeCountWindow: number;
  lastPlaceResetTime: number;

  // Server-Authoritative Inventory & Resources
  blockInventory: Map<number, number>;
  resources: { iron: number; gold: number; diamond: number; emerald: number };
  matchStartTime: number;
  lastResourceSyncTime: number;

  // Combat Knockback tracking
  knockbackUntil?: number;

  // Ballistic Jump Trajectory tracking
  lastDY?: number;
  hoverTicks?: number;

  // First packet bypass flag to prevent spawn teleport/speed violations
  isFirstPacket?: boolean;

  // Grace period after a server teleport/setback to prevent cascading false positives
  teleportBypassUntil?: number;

  // Streak tracking for repeated illegal movement attempts
  lastSetbackTime?: number;
  setbackStreak?: number;

  // Lag-tolerant movement violation scores
  speedViolationScore?: number;
  sneakViolationScore?: number;

  // Real-time telemetry & latency tracking
  lastPing?: number;
  lastFps?: number;
  lastClientGrounded?: boolean;

  // Server-authoritative Ender Pearl tracking
  activePearl?: { origin: Vector3D; throwTime: number; dir: Vector3D };
}
