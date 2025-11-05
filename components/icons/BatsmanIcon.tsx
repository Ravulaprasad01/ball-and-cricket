import React from 'react';

export const BatsmanIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M42,75 C42,83.28 35.28,90 27,90 C18.72,90 12,83.28 12,75 C12,66.72 18.72,60 27,60 C35.28,60 42,66.72 42,75 Z" />
    <path d="M60,20 L50,30 L70,50 L80,40 Z" />
    <path d="M55,35 L40,50 L45,55 L60,40 Z" />
    <rect x="25" y="40" width="4" height="25" transform="rotate(-30 27 52.5)" />
  </svg>
);