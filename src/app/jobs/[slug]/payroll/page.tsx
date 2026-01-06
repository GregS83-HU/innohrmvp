'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient, User } from '@supabase/supabase-js';
import { List, Grid } from 'lucide-react';
import PayrollList from '../../../../../components/payroll/PayrollList';
import PayrollForm from '../../../../../components/payroll/PayrollForm';
import PayrollExportModal from '../../../../../components/payroll/PayrollExportModal';
import PayrollGridView from '../../../../../components/payroll/PayrollGridView';
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

  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Existing states
  const [showForm, setShowForm] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [loading, setLoading] = useState(true);
  
  // Grid view edit state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);



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
     setIsEditModalOpen(false); 
    setRefreshKey(prev => prev + 1);
  };

  const handleExport = () => {
    if (!currentUser) {
      alert(t('payroll.verifySession'));
      return;
    }
    setShowExport(true);
  };

  // Grid view edit handler
  const handleEditEmployee = (userId: string) => {
    setEditingUserId(userId);
    setShowEditModal(true);
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
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
                {t('payroll.listView') || 'List View'}
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid className="w-4 h-4" />
                {t('payroll.gridView') || 'Grid View'}
              </button>
            </div>

            {/* Add Employee Button */}
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
      </div>

      {/* Conditional Rendering based on view mode and form state */}
      {showForm || isEditModalOpen ? (
        <PayrollForm
          payroll={selectedPayroll}
          onClose={handleCloseForm}
        />
      ) : viewMode === 'list' ? (
        <PayrollList
          key={refreshKey}
          onEdit={handleEdit}
          onExport={handleExport}
        />
      ) : (
        <PayrollGridView
          key={refreshKey}
          countryCode="HU"
          currentUserId={currentUser?.id || ''}
          periodClosed={false}
          onEditEmployee={(employee) => {
    setSelectedPayroll(employee);
    setIsEditModalOpen(true);
  }}
        />
      )}

      {/* Export Modal */}
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