import React from 'react';

export const SortIcon: React.FC<{ direction: 'asc' | 'desc'; className?: string }> = ({ direction, className = "w-4 h-4 text-white" }) => {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {direction === 'asc' ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
      )}
    </svg>
  );
};
