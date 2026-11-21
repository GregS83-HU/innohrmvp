// components/Header/ForfaitBadge.tsx
import React from 'react';

interface ForfaitBadgeProps {
  companyForfait: string | null;
}

export const ForfaitBadge: React.FC<ForfaitBadgeProps> = ({ companyForfait }) => {
  switch (companyForfait) {
    case 'Free':
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-slate-200 text-slate-800 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-slate-500"></div> Free
        </span>
      );
    case 'Core':
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-brand-100 text-brand-800 shadow-md">
          <div className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></div> Core
        </span>
      );
    case 'Growth':
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-sm font-bold rounded-full bg-amber-500 text-yellow-900 shadow-sm ring-1 ring-yellow-400">
          <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse shadow-md"></div> Growth
        </span>
      );
    default:
      return null;
  }
};
