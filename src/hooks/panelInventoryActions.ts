import { GameEngine } from '../game/gameEngine';
import { BlockType } from '../types/game';

/**
 * Adiciona blocos de lã visuais na hotbar do jogador para teste de dessincronização.
 */
export function handleSpawnVisualWoolAction(
  engine: GameEngine | null,
  setLastLog: (s: string) => void
): void {
  if (!engine) return;
  const myTeam = engine.match.matchInfo?.myTeam || 'red';
  const blockType =
    myTeam === 'red'
      ? BlockType.RED_WOOL
      : myTeam === 'blue'
      ? BlockType.BLUE_WOOL
      : BlockType.WHITE_WOOL;
  const woolName =
    myTeam === 'red'
      ? 'Lã Vermelha'
      : myTeam === 'blue'
      ? 'Lã Azul'
      : 'Lã Branca';

  const itemToAdd = {
    id: 'wool_visual',
    name: `${woolName} (Visual)`,
    type: 'block' as const,
    blockType,
    count: 64,
  };

  const existing = engine.hotbar.find(
    (h) =>
      h &&
      h.type === 'block' &&
      (h.id === 'wool_visual' || (h.name && h.name.includes('(Visual)')))
  );

  if (existing) {
    existing.count += 64;
    const slotIdx = engine.hotbar.indexOf(existing);
    if (slotIdx !== -1) engine.selectedSlot = slotIdx;
  } else {
    engine.addItemToHotbar(itemToAdd);
  }
  engine.onSyncUI?.();
  setLastLog(
    'Gerador de Lãs Visuais (+64): Itens visuais adicionados à hotbar para teste de ghost block!'
  );
}
