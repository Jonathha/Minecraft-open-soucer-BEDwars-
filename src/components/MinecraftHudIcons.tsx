import React from 'react';

export const HeartIcon: React.FC<{ fillState: 'full' | 'half' | 'empty' }> = ({ fillState }) => (
  <svg viewBox="0 0 9 9" className="w-3 h-3 md:w-3.5 md:h-3.5" style={{ imageRendering: 'pixelated' }}>
    <path d="M2 0h2v1h1v-1h2v1h1v1h1v3h-1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-3h1v-1h1v-1z" fill="#000000" />
    {fillState === 'empty' && <path d="M2 1h2v1h1v-1h2v1h1v3h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-3h1v-1z" fill="#200505" />}
    {fillState === 'full' && (
      <>
        <path d="M2 1h2v1h1v-1h2v1h1v3h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-3h1v-1z" fill="#e11d48" />
        <rect x="2" y="2" width="1" height="1" fill="#ffffff" />
        <rect x="3" y="1" width="1" height="1" fill="#ff708d" />
        <rect x="6" y="1" width="1" height="1" fill="#ff708d" />
        <path d="M4 6h1v1h-1z M5 5h1v1h-1z M6 4h1v1h-1z" fill="#9f1239" />
      </>
    )}
    {fillState === 'half' && (
      <>
        <path d="M2 1h2v1h1v-1h2v1h1v3h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-3h1v-1z" fill="#200505" />
        <path d="M2 1h2v1h1v6h-1v-1h-1v-1h-1v-1h-1v-3h1v-1z" fill="#e11d48" />
        <rect x="2" y="2" width="1" height="1" fill="#ffffff" />
      </>
    )}
  </svg>
);

export const ArmorIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg viewBox="0 0 9 9" className="w-3 h-3 md:w-3.5 md:h-3.5" style={{ imageRendering: 'pixelated' }}>
    <path d="M1 0h2v1h1v1h1v-1h1v-1h2v1h1v4h-1v2h-1v1h-4v-1h-1v-2h-1v-4h1v-1z" fill="#000000" />
    {filled ? (
      <>
        <path d="M2 1h1v1h1v1h1v-1h1v-1h1v3h-1v2h-1v1h-2v-1h-1v-2h-1v-3z" fill="#cbd5e1" />
        <rect x="2" y="1" width="1" height="2" fill="#ffffff" />
        <rect x="6" y="2" width="1" height="2" fill="#94a3b8" />
        <rect x="3" y="5" width="2" height="2" fill="#f8fafc" />
        <rect x="5" y="5" width="1" height="2" fill="#64748b" />
      </>
    ) : (
      <path d="M2 1h1v1h1v1h1v-1h1v-1h1v3h-1v2h-1v1h-2v-1h-1v-2h-1v-3z" fill="#000000" />
    )}
  </svg>
);

export const HungerIcon: React.FC<{ fillState: 'full' | 'half' | 'empty' }> = ({ fillState }) => (
  <svg viewBox="0 0 9 9" className="w-3 h-3 md:w-3.5 md:h-3.5" style={{ imageRendering: 'pixelated' }}>
    <path d="M3 0h3v1h1v1h1v3h-1v1h-1v1h-1v1h-1v1h-2v-1h-1v-1h1v-1h-1v-1h1v-1h1v-2h-1v-1h1v-1z" fill="#000000" />
    {fillState === 'full' && (
      <>
        <path d="M4 1h2v1h1v3h-1v1h-1v1h-1v-1h-1v-2h1v-1h-1v-1h1v-1z" fill="#b45309" />
        <rect x="4" y="2" width="2" height="2" fill="#f59e0b" />
        <rect x="5" y="1" width="1" height="1" fill="#fde68a" />
        <rect x="2" y="6" width="1" height="1" fill="#ffffff" />
        <rect x="3" y="7" width="1" height="1" fill="#ffffff" />
      </>
    )}
    {fillState === 'empty' && <path d="M4 1h2v1h1v3h-1v1h-1v1h-1v-1h-1v-2h1v-1h-1v-1h1v-1z" fill="#1c1006" />}
  </svg>
);
