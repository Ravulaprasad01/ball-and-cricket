import React from 'react';

export const CricketLogoAnimationIcon: React.FC = () => (
  <svg viewBox="0 0 400 150" width="400" height="150">
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--secondary))', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <style>
      {`
        .logo-text {
          font-family: 'Poppins', sans-serif;
          font-weight: 900;
          font-size: 80px;
          fill: url(#logo-gradient);
          stroke: hsl(var(--foreground));
          stroke-width: 2;
          stroke-linejoin: round;
          letter-spacing: -2px;
        }
      `}
    </style>
    <text x="50%" y="50%" dy=".35em" textAnchor="middle" className="logo-text">
      Stumped!
    </text>
  </svg>
);
