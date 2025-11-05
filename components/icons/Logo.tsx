import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className={className}
    aria-hidden="true"
  >
    <circle cx="50" cy="50" r="50" fill="currentColor" />
    <g fill="hsl(var(--background))">
      {/* Stumps */}
      <rect x="28" y="35" width="8" height="40" rx="4" />
      <rect x="46" y="35" width="8" height="40" rx="4" />
      <rect x="64" y="35" width="8" height="40" rx="4" />
      {/* Bails */}
      <rect x="28" y="30" width="26" height="7" rx="3.5" />
      <g transform="rotate(-25 69 33.5) translate(5 -10)">
        <rect x="46" y="30" width="26" height="7" rx="3.5" />
      </g>
    </g>
  </svg>
);