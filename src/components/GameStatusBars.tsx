import React from 'react';
import { HeartIcon, ArmorIcon, HungerIcon } from './MinecraftIcons';

interface GameStatusBarsProps {
  health: number;
}

export function GameStatusBars({ health }: GameStatusBarsProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-[390px] md:max-w-[430px] px-1">
      {/* Row 1: Armor (Left) - 4 filled tunics matching screenshot */}
      <div className="w-full flex justify-start items-center gap-0.5 mb-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <ArmorIcon key={`armor-${i}`} filled={i < 4} />
        ))}
      </div>

      {/* Row 2: Hearts (Left), Level (Center), Hunger (Right) */}
      <div className="w-full flex justify-between items-center relative h-5">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 10 }).map((_, i) => {
            const hp = health - i * 2;
            return <HeartIcon key={`heart-${i}`} fillState={hp >= 2 ? 'full' : hp === 1 ? 'half' : 'empty'} />;
          })}
        </div>

        {/* XP Level Number centered right above XP bar */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-sm md:text-base font-bold text-[#80ff20] select-none tracking-tighter"
          style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 2px 0 #000' }}
        >
          725
        </div>

        <div className="flex items-center gap-0.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <HungerIcon key={`hunger-${i}`} fillState="full" />
          ))}
        </div>
      </div>

      {/* Row 3: XP Bar */}
      <div className="w-full h-1.5 bg-[#091404] border border-black flex items-center p-[1px] mt-0.5 shadow-sm">
        <div className="h-full bg-[#55ff55] w-[35%] flex">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={`xpf-${i}`} className="flex-1 border-r border-[#00aa00]/60 last:border-none" />
          ))}
        </div>
        <div className="h-full bg-[#1b3b13] flex-1 flex">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={`xpe-${i}`} className="flex-1 border-r border-black/40 last:border-none" />
          ))}
        </div>
      </div>
    </div>
  );
}
