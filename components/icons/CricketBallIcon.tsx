
import React from 'react';

export const CricketBallIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    <path d="M12.5 3.06C8.82 3.56 6 6.72 6 10.5v3c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-3c0-2.21 1.79-4 4-4 .34 0 .68.04 1 .12V3.06zM15 10.5v3c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-3c0-3.78-2.82-6.94-6.5-7.44v3.08c.32.08.66.12 1 .12 2.21 0 4 1.79 4 4z" />
  </svg>
);
