import { broadcastMatch } from './matchmaking';

export function rollbackLastPlacedBlock(roomId: string, match: any, pData: any) {
  if (!pData || !pData.recentPlacedBlocks || pData.recentPlacedBlocks.length === 0) return;
  const now = Date.now();
  const lastBlockIndex = pData.recentPlacedBlocks.length - 1;
  const lastBlock = pData.recentPlacedBlocks[lastBlockIndex];
  if (!lastBlock) return;

  // Only remove the single block if placed during the illegal movement window (last 800ms)
  if (now - lastBlock.timestamp <= 800) {
    pData.recentPlacedBlocks.splice(lastBlockIndex, 1);
    const idx = match.blocks.findIndex((b: any) => b.x === lastBlock.x && b.y === lastBlock.y && b.z === lastBlock.z);
    if (idx !== -1) {
      match.blocks.splice(idx, 1);
    }
    broadcastMatch(roomId, 'block:broken', { pos: { x: lastBlock.x, y: lastBlock.y, z: lastBlock.z } });
  }
}
