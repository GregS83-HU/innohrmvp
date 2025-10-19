// components/Header/LoginModal.tsx
import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  login: string;
  setLogin: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  error: string;
  onLogin: (email?: string, pwd?: string) => void | Promise<void>;
  isDemoExpired: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  login,
  setLogin,
  password,
  setPassword,
  error,
  onLogin,
  isDemoExpired
}) => {
  const { t } = useLocale();

  if (!isOpen || isDemoExpired) return null;

  // Extract slug from URL (format: app/jobs/slug)
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const slug = pathSegments[1] || ''; // Get the third segment (index 2)
  const isDemoMode = slug === 'demo';

  const handleDemoLogin = (email: string, pwd: string) => {
    return () => {
      // Call onLogin directly with the credentials
      onLogin(email, pwd);
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{t('loginModal.title')}</h2>
          <p className="text-gray-600 mt-1">
            {isDemoMode ? t('loginModal.subtitle.demo') : t('loginModal.subtitle.normal')}
          </p>
        </div>
        
        {isDemoMode ? (
          // Demo mode: Show 3 role options
          <div className="p-6 space-y-3">
            <button
              onClick={handleDemoLogin('user@hrinno.hu', 'password')}
              className="w-full px-4 py-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-colors text-left"
            >
              <div className="font-semibold text-blue-900">{t('loginModal.demoAccounts.user')}</div>
              <div className="text-sm text-blue-700 mt-1">user@hrinno.hu</div>
            </button>
            
            <button
              onClick={handleDemoLogin('demo@hrinno.hu', 'demo')}
              className="w-full px-4 py-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-lg transition-colors text-left"
            >
              <div className="font-semibold text-green-900">{t('loginModal.demoAccounts.manager')}</div>
              <div className="text-sm text-green-700 mt-1">manager@hrinno.hu</div>
            </button>
            
            <button
              onClick={handleDemoLogin('hrmanager@hrinno.hu', 'password')}
              className="w-full px-4 py-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg transition-colors text-left"
            >
              <div className="font-semibold text-purple-900">{t('loginModal.demoAccounts.hrManager')}</div>
              <div className="text-sm text-purple-700 mt-1">hrmanager@hrinno.hu</div>
            </button>
          </div>
        ) : (
          // Normal mode: Show login form
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('loginModal.fields.email')}</label>
              <input 
                type="email" 
                placeholder={t('loginModal.fields.emailPlaceholder')}
                value={login} 
                onChange={(e) => setLogin(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('loginModal.fields.password')}</label>
              <input 
                type="password" 
                placeholder={t('loginModal.fields.passwordPlaceholder')}
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            {t('loginModal.buttons.cancel')}
          </button>
          {!isDemoMode && (
            <button 
              onClick={() => onLogin()} 
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {t('loginModal.buttons.connect')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};