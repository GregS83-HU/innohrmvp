// components/Header/MenuItem.tsx
import React from 'react';
import Link from 'next/link';
import { useLocale } from 'i18n/LocaleProvider';

// HappyCheckMenuItem for items that require happy check access
export const HappyCheckMenuItem = ({
  href,
  children,
  className,
  onClick,
  canAccessHappyCheck,
  isDemoExpired = false
}: {
  href: string;
  children: React.ReactNode;
  className: string;
  onClick?: () => void;
  canAccessHappyCheck: boolean | null;
  isDemoExpired?: boolean;
}) => {
  const { t } = useLocale();
  
  const isDisabled = canAccessHappyCheck === false || isDemoExpired;
  const isLoading = canAccessHappyCheck === null && !isDemoExpired;

  if (isLoading) {
    return (
      <div className={`${className.replace(/bg-\w+-\d+/, 'bg-gray-100').replace(/text-\w+-\d+/, 'text-gray-400')} cursor-wait relative`}>
        {children}
        <div className="absolute inset-0 bg-gray-200 opacity-20 rounded-xl"></div>
      </div>
    );
  }

  if (isDisabled) {
    const tooltipMessage = isDemoExpired
      ? t('menuItem.tooltips.demoExpired')
      : t('menuItem.tooltips.notAvailable');

    return (
      <div className={`${className.replace(/bg-\w+-\d+/, 'bg-gray-100').replace(/text-\w+-\d+/, 'text-gray-400')} cursor-not-allowed relative group`}>
        {children}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {tooltipMessage}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
};

// DemoAwareMenuItem for regular menu items that can be disabled during demo expiration
export const DemoAwareMenuItem = ({
  href,
  children,
  className,
  onClick,
  isDemoExpired = false,
  isContactUs = false
}: {
  href: string;
  children: React.ReactNode;
  className: string;
  onClick?: () => void;
  isDemoExpired?: boolean;
  isContactUs?: boolean;
}) => {
  const { t } = useLocale();
  
  // Contact Us is never disabled
  const isDisabled = isDemoExpired && !isContactUs;

  if (isDisabled) {
    return (
      <div className={`${className.replace(/bg-\w+-\d+/, 'bg-gray-100').replace(/text-\w+-\d+/, 'text-gray-400')} cursor-not-allowed relative group`}>
        {children}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {t('menuItem.tooltips.demoExpired')}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
};