import React from 'react';
import { MatchInfo } from '../types/game';

interface MatchOverlayProps {
  inQueue: boolean;
  matchInfo: MatchInfo;
  isEnded: boolean;
  onCancelQueue: () => void;
  onReturnToLobby: () => void;
}

export const MatchOverlay: React.FC<MatchOverlayProps> = ({
  inQueue, matchInfo, isEnded, onCancelQueue, onReturnToLobby
}) => {
  if (inQueue) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-stone-900 border-4 border-stone-700 rounded-lg p-6 max-w-sm w-full text-center flex flex-col items-center gap-4 shadow-2xl">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <h3 className="text-xl font-black tracking-wide text-white">PROCURANDO OPONENTE</h3>
          <p className="text-stone-400 text-xs">Fila 1v1 BedWars ativa...</p>
          <button
            id="btn-cancel-queue"
            onClick={onCancelQueue}
            className="w-full py-2.5 bg-stone-700 hover:bg-stone-600 active:scale-95 text-white font-bold rounded text-sm transition cursor-pointer"
          >
            Cancelar Fila
          </button>
        </div>
      </div>
    );
  }

  if (isEnded) {
    const isWinner = matchInfo.winner === matchInfo.myTeam;
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-stone-900 border-4 border-stone-700 rounded-lg p-8 max-w-md w-full text-center flex flex-col items-center gap-5 shadow-2xl animate-fade-in">
          <h2
            className={`text-4xl md:text-5xl font-black tracking-wider uppercase drop-shadow-md ${
              isWinner ? 'text-amber-400' : 'text-red-500'
            }`}
          >
            {isWinner ? 'VITÓRIA!' : 'DERROTA!'}
          </h2>

          <div className="text-stone-300 text-sm">
            {isWinner
              ? 'Você eliminou seu adversário e venceu a partida!'
              : 'Sua cama foi destruída e você foi eliminado.'}
          </div>

          <div className="bg-stone-800/80 p-3 rounded border border-stone-700 w-full text-xs text-stone-300 flex justify-around">
            <div>
              Cama Vermelha:{' '}
              <strong className={matchInfo.redBed ? 'text-emerald-400' : 'text-red-400'}>
                {matchInfo.redBed ? 'Intacta' : 'Destruída'}
              </strong>
            </div>
            <div>
              Cama Azul:{' '}
              <strong className={matchInfo.blueBed ? 'text-emerald-400' : 'text-red-400'}>
                {matchInfo.blueBed ? 'Intacta' : 'Destruída'}
              </strong>
            </div>
          </div>

          <button
            id="btn-return-lobby"
            onClick={onReturnToLobby}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-md text-base tracking-widest uppercase transition-all shadow-lg cursor-pointer"
          >
            VOLTAR AO LOBBY
          </button>
        </div>
      </div>
    );
  }

  return null;
};
