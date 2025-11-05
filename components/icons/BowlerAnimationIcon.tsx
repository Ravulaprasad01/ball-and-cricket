import React from 'react';

export const BowlerAnimationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 150" className={className} aria-hidden="true">
    {/* Ground line */}
    <line x1="0" y1="130" x2="200" y2="130" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />

    {/* The bowler group, handles the run-up translation */}
    <g className="animate-bowler-run-up">
      {/* Ball (animated separately) */}
      <circle className="animate-bowling-ball-release" cx="125" cy="40" r="5" fill="#EF4444" />
      
      {/* Bowler Figure */}
      <g>
        <circle cx="100" cy="40" r="10" fill="currentColor" /> {/* Head */}
        <path d="M100 50 v 40" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /> {/* Torso */}
        <path d="M100 90 l -15 30" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /> {/* Back Leg */}
        <path d="M100 90 l 15 30" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /> {/* Front Leg */}
        <path d="M100 65 l -20 -15" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /> {/* Front Arm */}
        
        {/* Bowling Arm (the one that rotates) */}
        <g style={{ transformOrigin: '100px 55px' }} className="animate-bowling-arm-swing">
          <path d="M100 55 l 20 -15" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        </g>
      </g>
    </g>
  </svg>
);