import React from 'react';

export const BatsmanAnimationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 150" className={className} aria-hidden="true">
    {/* Ground line */}
    <line x1="0" y1="130" x2="200" y2="130" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />

    {/* Ball */}
    <circle className="animate-ball-fly" cx="80" cy="115" r="5" fill="#EF4444" style={{ willChange: 'transform, opacity' }} />

    {/* Batsman Figure */}
    <g className="animate-batsman-body" style={{ willChange: 'transform' }}>
      <circle cx="50" cy="40" r="10" fill="currentColor" /> {/* Head */}
      <path d="M50 50 v 40" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /> {/* Torso */}
      <path d="M50 90 l -15 30" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /> {/* Back Leg */}
      <path d="M50 90 l 20 30" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /> {/* Front Leg */}
      
      {/* Bat and Arms Group */}
      <g style={{ transformOrigin: '55px 55px' }} className="animate-bat-swing">
        {/* Arms */}
        <path d="M50 65 l 20 15" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M50 65 l 10 25" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        {/* Bat */}
        <path d="M60 85 l 25 35" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);