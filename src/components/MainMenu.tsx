import React from 'react';

interface MainMenuProps {
  onEnter: () => void;
  onPlay1v1?: () => void;
}

// Medidas em "u": 1u = 1px da imagem de referência (603x339), escalado para caber na tela.
const u = (n: number) => `calc(var(--u) * ${n})`;

const MenuButton: React.FC<{
  id: string;
  left: number;
  top: number;
  width: number;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ id, left, top, width, onClick, children }) => (
  <button
    id={id}
    onClick={onClick}
    className="absolute flex items-center justify-center text-white hover:text-[#ffffa0] hover:brightness-110 cursor-pointer"
    style={{
      left: u(left),
      top: u(top),
      width: u(width),
      height: u(26),
      background: '#6e6e6e',
      border: `${u(1)} solid #000`,
      boxShadow: `inset ${u(1)} ${u(1)} 0 #999999, inset ${u(-1)} ${u(-3)} 0 #555555`,
      fontFamily: 'Consolas, Menlo, "DejaVu Sans Mono", monospace',
      fontSize: u(11),
      textShadow: `${u(1)} ${u(1)} 0 #3e3e3e`,
      padding: 0,
    }}
  >
    {children}
  </button>
);

export const MainMenu: React.FC<MainMenuProps> = ({ onEnter, onPlay1v1 }) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10">
      <div
        className="absolute"
        style={{
          ['--u' as string]: 'min(calc(100vw / 603), calc(100vh / 339))',
          left: '50%',
          top: '50%',
          width: u(603),
          height: u(339),
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Logo */}
        <div
          className="absolute w-full text-center"
          style={{
            top: u(34),
            fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
            fontSize: u(72),
            lineHeight: u(66),
            letterSpacing: u(1),
            color: '#a8a8a8',
            WebkitTextStroke: `${u(3)} #000`,
            paintOrder: 'stroke fill',
            textShadow: `0 ${u(4)} 0 #3b3b3b`,
          }}
        >
          MINECRAFT
        </div>
        <div
          className="absolute w-full text-center"
          style={{
            top: u(92),
            fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
            fontSize: u(26),
            lineHeight: u(24),
            letterSpacing: u(2),
            color: '#c4c4c4',
            WebkitTextStroke: `${u(2)} #000`,
            paintOrder: 'stroke fill',
          }}
        >
          JAVA EDITION
        </div>

        {/* Splash */}
        <div
          className="absolute whitespace-nowrap font-bold"
          style={{
            left: u(473),
            top: u(85),
            transform: 'translate(-50%, -50%) rotate(-20deg)',
            fontFamily: 'Consolas, Menlo, "DejaVu Sans Mono", monospace',
            fontSize: u(18),
            color: '#ffff00',
            textShadow: `${u(1.5)} ${u(1.5)} 0 #3f3f00`,
          }}
        >
          90% bug free!
        </div>

        {/* Botões (posições e larguras medidas na referência) */}
        <div className="pointer-events-auto">
          <MenuButton id="btn-play-1v1" left={159} top={157} width={284} onClick={onPlay1v1 || onEnter}>
            Um jogador
          </MenuButton>
          <MenuButton id="btn-enter-lobby" left={159} top={191} width={284} onClick={onEnter}>
            Multijogador
          </MenuButton>
          <MenuButton id="btn-options" left={159} top={293} width={139}>
            Opções...
          </MenuButton>
          <MenuButton id="btn-quit-game" left={305} top={293} width={138} onClick={() => window.close()}>
            Sair do jogo
          </MenuButton>
        </div>
      </div>
    </div>
  );
};
