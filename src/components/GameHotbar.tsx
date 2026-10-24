import React from 'react';
import { HotbarItem } from '../types/game';
import { GenericItemIcon } from './MinecraftIcons';

interface GameHotbarProps {
  hotbar: (HotbarItem | null)[];
  selectedSlot: number;
  onSelectSlot: (index: number) => void;
}

export function GameHotbar({ hotbar, selectedSlot, onSelectSlot }: GameHotbarProps) {
  const slots = Array.from({ length: 9 }).map((_, i) => hotbar[i] || null);

  return (
    <div className="relative flex items-center">
      <span className="text-white/90 text-xs font-mono font-bold mr-1 select-none drop-shadow-[1px_1px_0_#000]">
        [{selectedSlot}]
      </span>

      <div
        id="minecraft-hotbar"
        className="flex items-center bg-[#8f8f8f] p-[2px] border-2 border-black shadow-2xl rounded-[2px]"
        style={{
          borderTopColor: '#c6c6c6', borderLeftColor: '#c6c6c6',
          borderRightColor: '#373737', borderBottomColor: '#373737'
        }}
      >
        {slots.map((item, idx) => {
          const isSelected = idx === selectedSlot;
          return (
            <div key={idx} className="relative">
              <button
                id={`hotbar-slot-${idx}`}
                onClick={() => onSelectSlot(idx)}
                className="w-10 h-10 md:w-11 md:h-11 bg-[#8b8b8b] relative flex items-center justify-center cursor-pointer transition-none border-2 active:scale-95"
                style={{
                  borderTopColor: '#373737', borderLeftColor: '#373737',
                  borderRightColor: '#ffffff', borderBottomColor: '#ffffff'
                }}
              >
                {item && (
                  <div className="w-full h-full flex items-center justify-center p-1 pointer-events-none">
                    <GenericItemIcon id={item.id} name={item.name} blockType={item.blockType} />
                    {item.count > 1 && (
                      <span
                        className="absolute bottom-0.5 right-1 text-xs md:text-sm font-bold text-white select-none leading-none tracking-tighter"
                        style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 2px 0 #000' }}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </button>

              {/* Minecraft Active Slot Frame */}
              {isSelected && (
                <div
                  className="absolute -inset-1 pointer-events-none border-2 z-10"
                  style={{ borderColor: '#ffffff', boxShadow: 'inset 0 0 0 2px #555555, 0 0 0 1px #000000' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
