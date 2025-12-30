'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient, User } from '@supabase/supabase-js';
import PayrollList from '../../../../../components/payroll/PayrollList';
import PayrollForm from '../../../../../components/payroll/PayrollForm';
import PayrollExportModal from '../../../../../components/payroll/PayrollExportModal';
import type { EmployeePayroll } from '../../../../../types/payroll';
import { useLocale } from 'i18n/LocaleProvider';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PayrollPage() {
  const { t } = useLocale();
  const params = useParams();
  const slug = params.slug as string;

  const [showForm, setShowForm] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<EmployeePayroll | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn(t('payroll.noUser'));
        return;
      }
      setCurrentUser(user);
      console.log('User ID fetched:', user.id);
    } catch (err) {
      console.error(t('payroll.fetchError'), err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const handleEdit = (payroll: EmployeePayroll) => {
    setSelectedPayroll(payroll);
    setShowForm(true);
  };

  const handleNew = () => {
    setSelectedPayroll(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPayroll(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleExport = () => {
    if (!currentUser) {
      alert(t('payroll.verifySession'));
      return;
    }
    setShowExport(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-center">{t('payroll.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('payroll.title')}</h1>
            <p className="text-gray-600 mt-1">{t('payroll.subtitle')}</p>
          </div>
          <button
            onClick={handleNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('payroll.addEmployeePayroll')}
          </button>
        </div>
      </div>

      {showForm ? (
        <PayrollForm
          payroll={selectedPayroll}
          onClose={handleCloseForm}
        />
      ) : (
        <PayrollList
          key={refreshKey}
          onEdit={handleEdit}
          onExport={handleExport}
        />
      )}

      {showExport && currentUser && (
        <PayrollExportModal
          isOpen={showExport}
          onClose={() => setShowExport(false)}
          userId={currentUser.id}
        />
      )}
    </div>
  );
}
