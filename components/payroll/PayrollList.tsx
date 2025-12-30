// components/payroll/PayrollList.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  Loader2, 
  AlertCircle, 
  Download, 
  Eye, 
  Edit, 
  XCircle,
  Users,
  UserCheck,
  DollarSign,
  Filter
} from 'lucide-react';
import type { EmployeePayroll, UserWithPayroll } from '../../types/payroll';
import { useLocale } from 'i18n/LocaleProvider';
import PayrollEditModal from './PayrollEditModal';

interface PayrollListProps {
  onEdit?: (payroll: EmployeePayroll) => void;
  onExport?: () => void;
}

export default function PayrollList({ onEdit, onExport }: PayrollListProps) {
  const { t } = useLocale();
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string || '';
  
  const [payrolls, setPayrolls] = useState<EmployeePayroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filter, setFilter] = useState({
    country_code: '',
    is_active: 'true',
    department: ''
  });

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch current user
  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    fetchPayrolls();
  }, [filter]);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.country_code) params.append('country_code', filter.country_code);
      if (filter.is_active) params.append('is_active', filter.is_active);
      if (filter.department) params.append('department', filter.department);

      const response = await fetch(`/api/payroll?${params.toString()}`);
      if (!response.ok) {
        throw new Error(t('payrollList.errors.fetchFailed'));
      }

      const result = await response.json();
      setPayrolls(result.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('payrollList.errors.genericError'));
      console.error('Error fetching payrolls:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('payrollList.confirmations.deactivate'))) {
      return;
    }

    if (!currentUser) {
      alert(t('payrollList.errors.userNotAuthenticated'));
      return;
    }

    try {
      const response = await fetch(`/api/payroll/${id}?current_user_id=${currentUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(t('payrollList.errors.deleteFailed'));
      }

      // Refresh list
      fetchPayrolls();
    } catch (err) {
      alert(t('payrollList.errors.deleteError') + ': ' + (err instanceof Error ? err.message : t('payrollList.errors.unknown')));
    }
  };

  const handleQuickEdit = (payroll: any) => {
    setSelectedPayroll(payroll);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchPayrolls(); // Refresh the list after successful edit
  };

  const formatCurrency = (amount: number, currency: string = 'HUF') => {
    return new Intl.NumberFormat(t('payrollList.locale'), {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getEmploymentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'full_time': t('payrollList.employmentTypes.fullTime'),
      'part_time': t('payrollList.employmentTypes.partTime'),
      'contractor': t('payrollList.employmentTypes.contractor'),
      'intern': t('payrollList.employmentTypes.intern'),
      'temporary': t('payrollList.employmentTypes.temporary')
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">{t('payrollList.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">{t('payrollList.errorTitle')}</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('payrollList.title')}</h2>
        <button
          onClick={onExport}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
        >
          <Download className="w-4 h-4" />
          {t('payrollList.buttons.export')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t('payrollList.filters.title')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('payrollList.filters.country')}
            </label>
            <select
              value={filter.country_code}
              onChange={(e) => setFilter({ ...filter, country_code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('payrollList.filters.allCountries')}</option>
              <option value="HU">{t('payrollList.filters.hungary')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('payrollList.filters.status')}
            </label>
            <select
              value={filter.is_active}
              onChange={(e) => setFilter({ ...filter, is_active: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('payrollList.filters.all')}</option>
              <option value="true">{t('payrollList.filters.active')}</option>
              <option value="false">{t('payrollList.filters.inactive')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('payrollList.filters.department')}
            </label>
            <input
              type="text"
              value={filter.department}
              onChange={(e) => setFilter({ ...filter, department: e.target.value })}
              placeholder={t('payrollList.filters.departmentPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payrollList.table.headers.employee')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payrollList.table.headers.position')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payrollList.table.headers.department')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payrollList.table.headers.employmentType')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payrollList.table.headers.salary')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payrollList.table.headers.status')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payrollList.table.headers.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Users className="w-12 h-12 mb-2 text-gray-400" />
                      <p className="font-medium">{t('payrollList.table.noRecords')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll: any) => (
                  <tr key={payroll.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payroll.users?.user_firstname} {payroll.users?.user_lastname}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payroll.country_code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payroll.position_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payroll.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getEmploymentTypeLabel(payroll.employment_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(payroll.salary_amount, payroll.salary_currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payroll.is_active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {t('payrollList.table.statusLabels.active')}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {t('payrollList.table.statusLabels.inactive')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => router.push(`/jobs/${slug}/payroll/employee/${payroll.user_id}`)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 transition-colors"
                          title={t('payrollList.table.actions.viewDetails')}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">{t('payrollList.table.actions.viewDetails')}</span>
                        </button>
                        <button
                          onClick={() => handleQuickEdit(payroll)}
                          className="text-purple-600 hover:text-purple-900 flex items-center gap-1 transition-colors"
                          title={t('payrollList.table.actions.quickEdit')}
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">{t('payrollList.table.actions.quickEdit')}</span>
                        </button>
                        {payroll.is_active && (
                          <button
                            onClick={() => handleDelete(payroll.id)}
                            className="text-red-600 hover:text-red-900 flex items-center gap-1 transition-colors"
                            title={t('payrollList.table.actions.deactivate')}
                          >
                            <XCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('payrollList.table.actions.deactivate')}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('payrollList.stats.totalEmployees')}</div>
              <div className="text-2xl font-bold text-gray-900">{payrolls.length}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('payrollList.stats.activeEmployees')}</div>
              <div className="text-2xl font-bold text-gray-900">
                {payrolls.filter(p => p.is_active).length}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('payrollList.stats.totalMonthlyPayroll')}</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  payrolls
                    .filter(p => p.is_active && p.salary_period === 'monthly')
                    .reduce((sum, p) => sum + p.salary_amount, 0)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedPayroll && currentUser && (
        <PayrollEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPayroll(null);
          }}
          userId={selectedPayroll.user_id}
          userName={`${selectedPayroll.users?.user_firstname} ${selectedPayroll.users?.user_lastname}`}
          onSuccess={handleEditSuccess}
          currentUserId={currentUser.id}
        />
      )}
    </div>
  );
}