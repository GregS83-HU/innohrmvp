// components/Header/LoginModal.tsx
import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { supabase } from '../../lib/supabaseClient'; // ensure correct path

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

  const [isResetMode, setIsResetMode] = React.useState(false);
  const [resetError, setResetError] = React.useState('');
  const [resetSuccess, setResetSuccess] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);

  if (!isOpen || isDemoExpired) return null;

  // Extract slug from URL (format: app/jobs/slug)
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const slug = pathSegments[1] || '';
  const isDemoMode = slug === 'demo';

  const handleDemoLogin = (email: string, pwd: string) => {
    return () => {
      onLogin(email, pwd);
    };
  };

  // --- RESET PASSWORD HANDLER ---
  const handleResetPassword = async () => {
    setResetError('');
    setResetSuccess(false);

    if (!login) {
      setResetError(t('loginModal.messages.missingEmail'));
      return;
    }

    setIsSending(true);

    const { error } = await supabase.auth.resetPasswordForEmail(login, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    setIsSending(false);

    if (error) {
      setResetError(error.message);
    } else {
      setResetSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isResetMode ? t('loginModal.resetTitle') : t('loginModal.title')}
          </h2>
          {!isResetMode && (
            <p className="text-gray-600 mt-1">
              {isDemoMode ? t('loginModal.subtitle.demo') : t('loginModal.subtitle.normal')}
            </p>
          )}
        </div>

        {/* DEMO MODE -------------------------------------------------------- */}
        {!isResetMode && isDemoMode && (
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
        )}

        {/* NORMAL LOGIN ----------------------------------------------------- */}
        {!isResetMode && !isDemoMode && (
          <div className="p-6 space-y-4">

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('loginModal.fields.email')}
              </label>
              <input
                type="email"
                placeholder={t('loginModal.fields.emailPlaceholder')}
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('loginModal.fields.password')}
              </label>
              <input
                type="password"
                placeholder={t('loginModal.fields.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* FORGOT PASSWORD */}
            <div className="text-right">
              <button
                onClick={() => setIsResetMode(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                {t('loginModal.buttons.forgotPassword')}
              </button>
            </div>
          </div>
        )}

        {/* RESET PASSWORD MODE -------------------------------------------- */}
        {isResetMode && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              {t('loginModal.resetDescription')}
            </p>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('loginModal.fields.email')}
              </label>
              <input
                type="email"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder={t('loginModal.fields.emailPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* ERROR */}
            {resetError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{resetError}</p>
              </div>
            )}

            {/* SUCCESS */}
            {resetSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 text-sm">
                  {t('loginModal.messages.resetEmailSent')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* FOOTER ----------------------------------------------------------- */}
        <div className="p-6 border-t border-gray-200 flex gap-3">

          {/* CANCEL OR BACK */}
          <button
            onClick={() => {
              if (isResetMode) {
                setIsResetMode(false);
                setResetError('');
                setResetSuccess(false);
              } else {
                onClose();
              }
            }}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            {isResetMode
              ? t('loginModal.buttons.backToLogin')
              : t('loginModal.buttons.cancel')}
          </button>

          {/* MAIN ACTION BUTTON */}
          {!isDemoMode && (
            <>
              {!isResetMode ? (
                <button
                  onClick={() => onLogin()}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  {t('loginModal.buttons.connect')}
                </button>
              ) : (
                <button
                  onClick={handleResetPassword}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  disabled={isSending}
                >
                  {isSending
                    ? t('loginModal.buttons.sending')
                    : t('loginModal.buttons.resetPassword')}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
