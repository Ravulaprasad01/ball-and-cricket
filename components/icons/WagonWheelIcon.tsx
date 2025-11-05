import React from 'react';

export const WagonWheelIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.93 4.93l14.14 14.14m-14.14 0L19.07 4.93" />
  </svg>
);
