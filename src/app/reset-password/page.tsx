'use client'

// pages/reset-password.tsx
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useLocale } from 'i18n/LocaleProvider';

export default function ResetPasswordPage() {
  const { t } = useLocale();

  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    setError('');
    setSuccess(false);

    if (!password) {
      setError(t('resetPage.errors.missingPassword'));
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) setError(error.message);
    else setSuccess(true);
  };

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
        className="w-full px-4 py-3 border rounded-lg mb-3"
      />

      {error && (
        <p className="text-red-600 mb-3">
          {error}
        </p>
      )}

      {success && (
        <p className="text-green-600 mb-3">
          {t('resetPage.messages.passwordUpdated')}
        </p>
      )}

      <button
        onClick={handleUpdate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
      >
        {t('resetPage.buttons.save')}
      </button>
    </div>
  );
}
