import { ServerPlayerData, Vector3D } from './types';

export function getSafeSetbackPos(
  player: ServerPlayerData,
  newPos: Vector3D,
  prevPos: Vector3D,
  isFalling: boolean
): Vector3D {
  const base = player.lastLegitGroundedPos || { x: prevPos.x, y: player.lastGroundY || prevPos.y, z: prevPos.z };
  return isFalling && base.y > newPos.y ? { x: base.x, y: newPos.y, z: base.z } : { ...base };
}
