import React from 'react';

export const StumpsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 300 200" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g fill="currentColor">
      {/* Stumps */}
      <g id="stump-middle" style={{ '--shatter-transform': 'translateY(40px) rotate(5deg) scale(0.8)' } as React.CSSProperties}>
        <rect x="147" y="100" width="6" height="50" rx="3" />
      </g>
      <g id="stump-left" style={{ '--shatter-transform': 'translate(-60px, 20px) rotate(-45deg)' } as React.CSSProperties}>
        <rect x="134" y="100" width="6" height="50" rx="3" />
      </g>
      <g id="stump-right" style={{ '--shatter-transform': 'translate(60px, 20px) rotate(45deg)' } as React.CSSProperties}>
        <rect x="160" y="100" width="6" height="50" rx="3" />
      </g>
      
      {/* Bails */}
      <g id="bail-left" style={{ '--shatter-transform': 'translate(-80px, -50px) rotate(-180deg) scale(0.9)' } as React.CSSProperties}>
        <rect x="134" y="96" width="19" height="5" rx="2.5" />
      </g>
      <g id="bail-right" style={{ '--shatter-transform': 'translate(80px, -50px) rotate(180deg) scale(0.9)' } as React.CSSProperties}>
        <rect x="153" y="96" width="13" height="5" rx="2.5" />
      </g>
    </g>
  </svg>
);