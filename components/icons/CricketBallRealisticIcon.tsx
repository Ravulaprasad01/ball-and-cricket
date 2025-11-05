import React from 'react';

export const CricketBallRealisticIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ball-gradient" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#d63031" />
        <stop offset="100%" stopColor="#b33939" />
      </radialGradient>
      <filter id="seam-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" floodColor="#000000" floodOpacity="0.3" />
      </filter>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#ball-gradient)" />
    <path d="M 50,0 A 50,50 0 0,0 50,100" fill="none" stroke="#fff" strokeWidth="2.5" filter="url(#seam-shadow)" />
    <path d="M 50,0 A 50,50 0 0,1 50,100" fill="none" stroke="#fff" strokeWidth="2.5" filter="url(#seam-shadow)" />
    <path d="M 50,2.5 A 47.5,47.5 0 0,0 50,97.5" fill="none" stroke="#2d3436" strokeWidth="1" strokeDasharray="2 3" strokeLinecap="round" />
    <path d="M 50,2.5 A 47.5,47.5 0 0,1 50,97.5" fill="none" stroke="#2d3436" strokeWidth="1" strokeDasharray="2 3" strokeLinecap="round" />
  </svg>
);