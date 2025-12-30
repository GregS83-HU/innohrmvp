// components/payroll/PayrollForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  X,
  Loader2,
  Save,
  UserPlus,
  Briefcase,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  Edit,
} from 'lucide-react';

import type {
  EmployeePayroll,
  CreatePayrollRequest,
  HungarianPayrollData,
} from '../../types/payroll';

import { useLocale } from 'i18n/LocaleProvider';
import { createClient } from '@supabase/supabase-js';

interface PayrollFormProps {
  payroll?: EmployeePayroll | null;
  onClose: () => void;
  onSuccess?: () => void;
}

// CREATE SUPABASE CLIENT OUTSIDE COMPONENT TO PREVENT RE-CREATION
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CompanyUser {
  user_id: string;
  first_name: string;
  last_name: string;
}


export default function PayrollForm({ payroll, onClose, onSuccess }: PayrollFormProps) {
  const { t } = useLocale();

  /* ------------------------------------------------------------------ */
  /* Route params                                                        */
  /* ------------------------------------------------------------------ */
  const params = useParams<{ slug: string }>();
  const companySlug = params.slug;

  /* ------------------------------------------------------------------ */
  /* State                                                               */
  /* ------------------------------------------------------------------ */
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [existingPayroll, setExistingPayroll] = useState<EmployeePayroll | null>(null);
  const [isEditMode, setIsEditMode] = useState(!!payroll);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [formData, setFormData] = useState<CreatePayrollRequest>({
    user_id: payroll?.user_id || '',
    country_code: payroll?.country_code || 'HU',
    employment_type: payroll?.employment_type || 'full_time',
    contract_type: payroll?.contract_type || 'permanent',
    contract_start_date:
      payroll?.contract_start_date || new Date().toISOString().split('T')[0],
    contract_end_date: payroll?.contract_end_date || undefined,
    position_title: payroll?.position_title || '',
    department: payroll?.department || '',
    work_location: payroll?.work_location || '',
    weekly_hours: payroll?.weekly_hours || 40,
    salary_amount: payroll?.salary_amount || 0,
    salary_currency: payroll?.salary_currency || 'HUF',
    salary_period: payroll?.salary_period || 'monthly',
    payment_method: payroll?.payment_method || 'bank_transfer',
    bank_account_iban: payroll?.bank_account_iban || '',
    bank_name: payroll?.bank_name || '',
    country_specific_data: payroll?.country_specific_data || ({
      taj_number: '',
      tax_id: '',
      tax_bracket: '1',
      personal_income_tax_rate: 15,
      employee_social_contribution: 18.5,
      employer_social_contribution: 13,
      family_tax_allowance: 0,
      pension_fund: 'government',
    } as HungarianPayrollData),
    benefits: payroll?.benefits || [],
  });

  /* ------------------------------------------------------------------ */
  /* Get current user ID                                                 */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    }
    getCurrentUser();
  }, []);

  /* ------------------------------------------------------------------ */
  /* Fetch company ID                                                    */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!companySlug) return;

    let mounted = true;

    async function fetchCompanyId() {
      try {
        console.log('Fetching company ID for slug:', companySlug);
        
        const { data, error } = await supabase
          .from('company')
          .select('id')
          .eq('slug', companySlug)
          .single();

        if (!mounted) return;

        if (error || !data?.id) {
          setError(t('companyUsers.errors.companyNotFound'));
          return;
        }

        console.log('Fetched company ID:', data.id);
        setCompanyId(data.id);
      } catch (err) {
        if (!mounted) return;
        console.error('Error fetching company ID:', err);
        setError(t('companyUsers.errors.fetchCompanyId'));
      }
    }

    fetchCompanyId();

    return () => {
      mounted = false;
    };
  }, [companySlug, t]);

  /* ------------------------------------------------------------------ */
  /* Fetch users                                                         */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!companyId) return;

    let mounted = true;

    async function fetchUsers() {
      try {
        setUsersLoading(true);
        console.log('Fetching users for company ID:', companyId);
        
        const { data, error } = await supabase.rpc('get_company_users', {
          company_id_input: companyId,
        });

        if (!mounted) return;

        if (error) {
          console.error('Error fetching users:', error);
          setError(error.message);
          return;
        }

        console.log('Fetched users:', data);
        setUsers(data || []);
      } catch (err) {
        if (!mounted) return;
        console.error('Exception fetching users:', err);
        setError(t('companyUsers.errors.fetchUsers'));
      } finally {
        if (mounted) {
          setUsersLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      mounted = false;
    };
  }, [companyId, t]);

  /* ------------------------------------------------------------------ */
  /* Check for existing payroll when user is selected                   */
  /* ------------------------------------------------------------------ */
  const checkExistingPayroll = async (userId: string) => {
    if (!userId || !currentUserId) return;

    setCheckingExisting(true);
    setError(null);
    setShowSuccessMessage(false);

    try {
      const response = await fetch(
        `/api/payroll/by-user/${userId}?current_user_id=${currentUserId}`
      );

      if (response.status === 404) {
        // No existing payroll - stay in create mode
        console.log('No existing payroll found - create mode');
        setExistingPayroll(null);
        setIsEditMode(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to check existing payroll');
      }

      const result = await response.json();

      if (result.data) {
        // Existing payroll found - switch to edit mode
        console.log('Existing payroll found:', result.data);
        setExistingPayroll(result.data);
        setIsEditMode(true);
        
        // Populate form with existing data
        setFormData({
          user_id: result.data.user_id,
          country_code: result.data.country_code,
          employment_type: result.data.employment_type,
          contract_type: result.data.contract_type,
          contract_start_date: result.data.contract_start_date,
          contract_end_date: result.data.contract_end_date || undefined,
          position_title: result.data.position_title,
          department: result.data.department || '',
          work_location: result.data.work_location || '',
          weekly_hours: result.data.weekly_hours,
          salary_amount: result.data.salary_amount,
          salary_currency: result.data.salary_currency,
          salary_period: result.data.salary_period,
          payment_method: result.data.payment_method,
          bank_account_iban: result.data.bank_account_iban || '',
          bank_name: result.data.bank_name || '',
          country_specific_data: result.data.country_specific_data,
          benefits: result.data.benefits || [],
        });

        // Show success message
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (err) {
      console.error('Error checking existing payroll:', err);
      // Don't show error to user - just stay in create mode
      setExistingPayroll(null);
      setIsEditMode(false);
    } finally {
      setCheckingExisting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Handle user selection change                                        */
  /* ------------------------------------------------------------------ */
  const handleUserChange = (userId: string) => {
    setFormData({ ...formData, user_id: userId });
    
    if (userId) {
      checkExistingPayroll(userId);
    } else {
      // Reset to create mode if user deselected
      setExistingPayroll(null);
      setIsEditMode(false);
      setShowSuccessMessage(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Handle form submission                                              */
  /* ------------------------------------------------------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let url: string;
      let method: string;

      if (isEditMode && existingPayroll) {
        // Update existing payroll
        url = `/api/payroll/${existingPayroll.id}?current_user_id=${currentUserId}`;
        method = 'PUT';
      } else if (payroll) {
        // Update mode from props (separate modal)
        url = `/api/payroll/${payroll.id}?current_user_id=${currentUserId}`;
        method = 'PUT';
      } else {
        // Create new payroll
        url = '/api/payroll';
        method = 'POST';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || t('payrollForm.errors.saveFailed')
        );
      }

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('payrollForm.errors.genericError')
      );
    } finally {
      setLoading(false);
    }
  };

  const updateCountryData = <
  K extends keyof HungarianPayrollData
>(
  field: K,
  value: HungarianPayrollData[K]
) => {
  setFormData({
    ...formData,
    country_specific_data: {
      ...(formData.country_specific_data as HungarianPayrollData),
      [field]: value,
    },
  });
};


  /* ------------------------------------------------------------------ */
  /* Get selected user name for display                                  */
  /* ------------------------------------------------------------------ */
  const getSelectedUserName = () => {
    const selectedUser = users.find(u => u.user_id === formData.user_id);
    if (selectedUser) {
      return `${selectedUser.first_name} ${selectedUser.last_name}`;
    }
    return '';
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isEditMode 
              ? 'bg-gradient-to-br from-orange-500 to-red-500' 
              : 'bg-gradient-to-br from-blue-500 to-purple-500'
          }`}>
            {isEditMode ? (
              <Edit className="w-6 h-6 text-white" />
            ) : payroll ? (
              <FileText className="w-6 h-6 text-white" />
            ) : (
              <UserPlus className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? t('payrollForm.title.edit')
                : payroll
                ? t('payrollForm.title.edit')
                : t('payrollForm.title.add')}
            </h2>
            {isEditMode && getSelectedUserName() && (
              <p className="text-sm text-gray-600">
                {getSelectedUserName()}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Success Message - Existing data loaded */}
      {showSuccessMessage && isEditMode && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-start gap-2 animate-in fade-in duration-300">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Existing payroll data loaded</p>
            <p className="text-sm text-blue-600">You&apos;re now editing this employee&apos;s payroll information</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('payrollForm.sections.employee.fields.selectEmployee')}{' '}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={formData.user_id}
              onChange={(e) => handleUserChange(e.target.value)}
              disabled={!!payroll || usersLoading || checkingExisting}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">
                {usersLoading
                  ? t('common.loading')
                  : t(
                      'payrollForm.sections.employee.placeholders.selectEmployee'
                    )}
              </option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
            
            {/* Loading indicator when checking existing payroll */}
            {checkingExisting && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              </div>
            )}
          </div>
          
          {users.length === 0 && !usersLoading && companyId && (
            <p className="mt-1 text-sm text-gray-500">
              No users available. Please add users to the company first.
            </p>
          )}
        </div>

        {/* Employment Section */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {t('payrollForm.sections.employment.title')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(
                  'payrollForm.sections.employment.fields.employmentType'
                )}{' '}
                <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.employment_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    employment_type: e.target.value as CreatePayrollRequest['employment_type'],
                  })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="full_time">
                  {t(
                    'payrollForm.sections.employment.options.fullTime'
                  )}
                </option>
                <option value="part_time">
                  {t(
                    'payrollForm.sections.employment.options.partTime'
                  )}
                </option>
                <option value="contractor">
                  {t(
                    'payrollForm.sections.employment.options.contractor'
                  )}
                </option>
                <option value="intern">
                  {t(
                    'payrollForm.sections.employment.options.intern'
                  )}
                </option>
                <option value="temporary">
                  {t(
                    'payrollForm.sections.employment.options.temporary'
                  )}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(
                  'payrollForm.sections.employment.fields.contractType'
                )}{' '}
                <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.contract_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contract_type: e.target.value as CreatePayrollRequest['contract_type'],
                  })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="permanent">
                  {t(
                    'payrollForm.sections.employment.options.permanent'
                  )}
                </option>
                <option value="fixed_term">
                  {t(
                    'payrollForm.sections.employment.options.fixedTerm'
                  )}
                </option>
                <option value="probation">
                  {t(
                    'payrollForm.sections.employment.options.probation'
                  )}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(
                  'payrollForm.sections.employment.fields.contractStartDate'
                )}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.contract_start_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contract_start_date: e.target.value,
                  })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(
                  'payrollForm.sections.employment.fields.contractEndDate'
                )}
              </label>
              <input
                type="date"
                value={formData.contract_end_date || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contract_end_date:
                      e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(
                  'payrollForm.sections.employment.fields.positionTitle'
                )}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.position_title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    position_title: e.target.value,
                  })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(
                  'payrollForm.sections.employment.fields.department'
                )}
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    department: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(
                  'payrollForm.sections.employment.fields.workLocation'
                )}
              </label>
              <input
                type="text"
                value={formData.work_location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    work_location: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(
                  'payrollForm.sections.employment.fields.weeklyHours'
                )}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.weekly_hours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weekly_hours: parseFloat(e.target.value),
                  })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Compensation Section */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {t('payrollForm.sections.compensation.title')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(
                  'payrollForm.sections.compensation.fields.grossSalary'
                )}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.salary_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salary_amount: parseFloat(e.target.value),
                  })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(
                  'payrollForm.sections.compensation.fields.currency'
                )}
              </label>
              <select
                value={formData.salary_currency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salary_currency: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="HUF">HUF</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t('payrollForm.buttons.cancel')}
          </button>

          <button
            type="submit"
            disabled={loading || checkingExisting}
            className={`px-6 py-2 text-white rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 ${
              isEditMode
                ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('payrollForm.buttons.saving')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditMode || payroll
                  ? t('payrollForm.buttons.update')
                  : t('payrollForm.buttons.create')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}