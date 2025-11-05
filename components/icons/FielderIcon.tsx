import React from 'react';

export const FielderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M20,60 Q30,40 50,50 T80,60" stroke="currentColor" fill="none" strokeWidth="8" strokeLinecap="round" />
    <path d="M25,70 Q35,50 50,60 T75,70" stroke="currentColor" fill="none" strokeWidth="8" strokeLinecap="round" />
  </svg>
);