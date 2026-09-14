import React from 'react';

/**
 * The HRInno brand mark: same dark badge + sparkle icon + gradient
 * wordmark as the marketing site header (www.hrinno.hu). The badge carries
 * its own dark background, so it reads correctly on the app's light theme
 * without needing the app itself to go dark - see docs/product-brief.md
 * (visual branding alignment).
 */
export default function HRInnoLogoMark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-md bg-slate-950 border border-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-emerald-400 opacity-20 blur-sm" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-4 h-4 sm:w-[18px] sm:h-[18px] relative z-10 text-indigo-400"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          <circle cx="12" cy="12" r="2" className="fill-current" />
        </svg>
      </div>
      <span className="font-mono font-medium text-lg sm:text-xl tracking-tight text-gray-900 flex items-center">
        HR
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-emerald-500 font-semibold px-px">
          Inno
        </span>
      </span>
    </div>
  );
}
