// components/Header/ForfaitBadge.tsx
import React from 'react';

interface ForfaitBadgeProps {
  companyForfait: string | null;
}

export const ForfaitBadge: React.FC<ForfaitBadgeProps> = ({ companyForfait }) => {
  switch (companyForfait) {
    case 'Free':
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-gray-200 text-gray-800 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-gray-500"></div> Free
        </span>
      );
    case 'Momentum':
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 shadow-md">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div> Momentum
        </span>
      );
    case 'Infinity':
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-sm font-bold rounded-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 text-yellow-900 shadow-lg ring-1 ring-yellow-400">
          <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse shadow-md"></div> Infinity
        </span>
      );
    default:
      return null;
  }
};
