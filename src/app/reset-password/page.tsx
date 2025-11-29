'use client'

// pages/reset-password.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useLocale } from 'i18n/LocaleProvider';

export default function ResetPasswordPage() {
  const { t } = useLocale();

  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  // Handle the auth callback and establish session
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have a hash fragment with token info
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (type === 'recovery' && accessToken) {
          // Set the session using the tokens from the URL
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) {
            setError(error.message);
          } else {
            setSessionReady(true);
          }
        } else {
          // Check if there's already an active session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            setSessionReady(true);
          } else {
            setError(t('resetPage.errors.noSession') || 'No valid session found. Please request a new password reset link.');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [t]);

  const handleUpdate = async () => {
    setError('');
    setSuccess(false);

    if (!password) {
      setError(t('resetPage.errors.missingPassword'));
      return;
    }

    if (password.length < 6) {
      setError(t('resetPage.errors.passwordTooShort') || 'Password must be at least 6 characters');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">{t('resetPage.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-xl font-bold text-red-900 mb-2">
            {t('resetPage.errors.sessionError') || 'Session Error'}
          </h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
          >
            {t('resetPage.buttons.backToHome') || 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {t('resetPage.title')}
      </h1>

      <input
        type="password"
        placeholder={t('resetPage.fields.newPasswordPlaceholder')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
        className="w-full px-4 py-3 border rounded-lg mb-3"
        disabled={success}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <p className="text-green-700 text-sm">
            {t('resetPage.messages.passwordUpdated')}
          </p>
        </div>
      )}

      <button
        onClick={handleUpdate}
        disabled={success}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('resetPage.buttons.save')}
      </button>
    </div>
  );
}