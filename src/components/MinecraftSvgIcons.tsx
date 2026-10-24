import React from 'react';
import { BlockType } from '../types/game';

export const WoodenSwordIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" className="w-7 h-7 md:w-8 md:h-8" style={{ imageRendering: 'pixelated' }}>
    <path d="M14 1h-2v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h-1z" fill="#000000" />
    <path d="M15 2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h1v1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h-1v-1z" fill="#26150a" />
    <path d="M13 2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1z" fill="#935b2e" />
    <path d="M12 2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1z" fill="#b97c45" />
    <path d="M6 7h1v1h2v1h-1v1h-1v-1h-1v1h-1v-1h-1v-1h1v-1h1z" fill="#583419" />
    <rect x="7" y="8" width="1" height="1" fill="#d99b5b" />
    <rect x="5" y="8" width="1" height="1" fill="#000000" />
    <rect x="9" y="8" width="1" height="1" fill="#000000" />
    <rect x="4" y="10" width="1" height="1" fill="#754823" />
    <rect x="3" y="11" width="1" height="1" fill="#583419" />
    <rect x="1" y="13" width="2" height="2" fill="#583419" />
    <rect x="0" y="13" width="1" height="2" fill="#000000" />
    <rect x="1" y="15" width="2" height="1" fill="#000000" />
  </svg>
);

export const IronIngotIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" className="w-7 h-7 md:w-8 md:h-8" style={{ imageRendering: 'pixelated' }}>
    <path d="M4 6h8v1h2v5h-1v1h-8v-1h-2v-5h1v-1z" fill="#1e293b" />
    <path d="M5 7h6v1h-1v1h-5v-1h1v-1z" fill="#ffffff" />
    <path d="M6 8h5v1h-5z" fill="#f1f5f9" />
    <path d="M4 8h2v3h-2z M6 9h6v2h-6z M12 8h1v3h-1z" fill="#cbd5e1" />
    <path d="M4 11h8v1h-8z M12 9h1v3h-1z" fill="#94a3b8" />
    <rect x="11" y="11" width="2" height="1" fill="#64748b" />
  </svg>
);

export const GoldIngotIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" className="w-7 h-7 md:w-8 md:h-8" style={{ imageRendering: 'pixelated' }}>
    <path d="M4 6h8v1h2v5h-1v1h-8v-1h-2v-5h1v-1z" fill="#451a03" />
    <path d="M5 7h6v1h-1v1h-5v-1h1v-1z" fill="#fef08a" />
    <path d="M6 8h5v1h-5z" fill="#fde047" />
    <path d="M4 8h2v3h-2z M6 9h6v2h-6z M12 8h1v3h-1z" fill="#eab308" />
    <path d="M4 11h8v1h-8z M12 9h1v3h-1z" fill="#ca8a04" />
    <rect x="11" y="11" width="2" height="1" fill="#a16207" />
  </svg>
);

export const DiamondIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" className="w-7 h-7 md:w-8 md:h-8" style={{ imageRendering: 'pixelated' }}>
    <path d="M6 3h4v1h2v2h2v4h-2v2h-2v1h-4v-1h-2v-2h-2v-4h2v-2h2v-1z" fill="#0c4a6e" />
    <path d="M6 4h4v1h2v2h-1v-1h-2v-1h-4v1h-2v1h-1v-2h2v-1h2z" fill="#bae6fd" />
    <rect x="7" y="4" width="2" height="2" fill="#ffffff" />
    <path d="M5 7h6v2h-1v1h-4v-1h-1z" fill="#38bdf8" />
    <path d="M4 9h2v2h4v-2h2v1h-2v2h-4v-2h-2z" fill="#0284c7" />
  </svg>
);

export const EmeraldIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" className="w-7 h-7 md:w-8 md:h-8" style={{ imageRendering: 'pixelated' }}>
    <path d="M5 3h6v1h2v2h1v4h-1v2h-2v1h-6v-1h-2v-2h-1v-4h1v-2h2v-1z" fill="#052e16" />
    <path d="M6 4h4v2h2v4h-2v2h-4v-2h-2v-4h2z" fill="#22c55e" />
    <rect x="6" y="5" width="3" height="3" fill="#86efac" />
    <path d="M5 9h2v2h4v-2h1v2h-2v1h-4v-1h-1z" fill="#15803d" />
  </svg>
);

export const WoolBlockIcon: React.FC<{ blockType?: BlockType }> = ({ blockType }) => {
  const isRed = blockType === BlockType.RED_WOOL;
  const isBlue = blockType === BlockType.BLUE_WOOL;
  const topColor = isRed ? '#f87171' : isBlue ? '#60a5fa' : '#ffffff';
  const sideColor = isRed ? '#dc2626' : isBlue ? '#2563eb' : '#e2e8f0';
  const shadowColor = isRed ? '#991b1b' : isBlue ? '#1d4ed8' : '#94a3b8';

  return (
    <svg viewBox="0 0 16 16" className="w-7 h-7 md:w-8 md:h-8" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="2" width="12" height="12" rx="1" fill="#18181b" />
      <rect x="3" y="3" width="10" height="4" fill={topColor} />
      <rect x="3" y="7" width="5" height="6" fill={sideColor} />
      <rect x="8" y="7" width="5" height="6" fill={shadowColor} />
      <rect x="5" y="4" width="2" height="1" fill="#ffffff" opacity={0.6} />
    </svg>
  );
};
