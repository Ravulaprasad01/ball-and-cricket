import React from 'react';

export const UmpireIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2C9.24 2 7 4.24 7 7c0 1.54.63 2.92 1.69 3.89L3 22h18l-5.69-11.11C16.37 9.92 17 8.54 17 7c0-2.76-2.24-5-5-5zm0 10c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
    <path d="M4.5 20.5l.5 1.5h14l.5-1.5z" />
  </svg>
);
