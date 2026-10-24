import React from 'react';
import { Swords, Box, ArrowUp, Hand } from 'lucide-react';

interface MobileActionButtonsProps {
  onJump: (isJumping: boolean) => void;
  onAttack: () => void;
  onAttackStart?: () => void;
  onAttackEnd?: () => void;
  onPlace: () => void;
  onInteract: () => void;
}

export function MobileActionButtons({
  onJump, onAttack, onAttackStart, onAttackEnd, onPlace, onInteract
}: MobileActionButtonsProps) {
  return (
    <div className="self-end pb-8 pr-4 flex flex-col items-end gap-3 pointer-events-auto">
      <div className="flex gap-3">
        <button
          onTouchStart={(e) => { e.stopPropagation(); onInteract(); }}
          className="w-14 h-14 rounded-full bg-amber-600/80 border-2 border-white/40 text-white flex items-center justify-center active:scale-90"
          title="Interagir"
        >
          <Hand size={24} />
        </button>
        <button
          onTouchStart={(e) => { e.stopPropagation(); onPlace(); }}
          className="w-14 h-14 rounded-full bg-blue-600/80 border-2 border-white/40 text-white flex items-center justify-center active:scale-90"
          title="Colocar Bloco"
        >
          <Box size={24} />
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onTouchStart={(e) => { e.stopPropagation(); onAttack(); onAttackStart?.(); }}
          onTouchEnd={(e) => { e.stopPropagation(); onAttackEnd?.(); }}
          onTouchCancel={(e) => { e.stopPropagation(); onAttackEnd?.(); }}
          className="w-16 h-16 rounded-full bg-red-600/80 border-2 border-white/40 text-white flex items-center justify-center active:scale-90"
          title="Atacar / Quebrar"
        >
          <Swords size={28} />
        </button>
        <button
          onTouchStart={(e) => { e.stopPropagation(); onJump(true); }}
          onTouchEnd={(e) => { e.stopPropagation(); onJump(false); }}
          className="w-16 h-16 rounded-full bg-emerald-600/80 border-2 border-white/40 text-white flex items-center justify-center active:scale-90"
          title="Pular"
        >
          <ArrowUp size={28} />
        </button>
      </div>
    </div>
  );
}
