// src/app/jobs/[slug]/payroll/employee/[employeeId]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { EmployeePayroll, PayrollHistory, HungarianPayrollData } from '../../../../../../../types/payroll';
import { useLocale } from 'i18n/LocaleProvider';
import { createClient, User } from '@supabase/supabase-js';


export default function EmployeePayrollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const employeeId = params.employeeId as string;

  const [payroll, setPayroll] = useState<any>(null);
  const [history, setHistory] = useState<PayrollHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { t } = useLocale();
  const [currentUser, setCurrentUser] = useState<User | undefined>();

  // Form state for editing
  const [formData, setFormData] = useState<any>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
    if (currentUser && employeeId) {
      fetchPayrollData();
    }
  }, [employeeId, currentUser]);

  const fetchPayrollData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Pass current_user_id as query parameter
      console.log('current user:', currentUser.id);
      const response = await fetch(`/api/payroll?user_id=${employeeId}&current_user_id=${currentUser.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payroll data');
      }

      const result = await response.json();
      if (result.data && result.data.length > 0) {
        const payrollData = result.data[0];
        setPayroll(payrollData);
        setFormData(payrollData);

        // Fetch history with current_user_id
        const historyResponse = await fetch(`/api/payroll/${payrollData.id}?current_user_id=${currentUser.id}`);
        if (historyResponse.ok) {
          const historyResult = await historyResponse.json();
          setHistory(historyResult.history || []);
        }
      } else {
        setError('No payroll data found for this employee');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!payroll || !currentUser) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/payroll/${payroll.id}?current_user_id=${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payroll');
      }

      await fetchPayrollData(); // Refresh data
      setEditMode(false);
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(payroll); // Reset to original data
    setEditMode(false);
  };

  const updateCountryData = (field: string, value: any) => {
    setFormData({
      ...formData,
      country_specific_data: {
        ...formData.country_specific_data,
        [field]: value,
      },
    });
  };

  const formatCurrency = (amount: number, currency: string = 'HUF') => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Payroll
        </button>
      </div>
    );
  }

  if (!payroll || !formData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>No payroll data available</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Payroll
        </button>
      </div>
    );
  }

  const countryData = formData.country_specific_data as HungarianPayrollData;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/jobs/${slug}/payroll`)}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Payroll
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {payroll.users?.user_firstname} {payroll.users?.user_lastname}
            </h1>
            <p className="text-gray-600 mt-1">{payroll.position_title}</p>
          </div>

          <div className="flex gap-3">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Payroll Data
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employment Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Employment Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type
                </label>
                {editMode ? (
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contractor">Contractor</option>
                    <option value="intern">Intern</option>
                    <option value="temporary">Temporary</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.employment_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Type
                </label>
                {editMode ? (
                  <select
                    value={formData.contract_type}
                    onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="permanent">Permanent</option>
                    <option value="fixed_term">Fixed Term</option>
                    <option value="probation">Probation</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.contract_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Start Date
                </label>
                {editMode ? (
                  <input
                    type="date"
                    value={formData.contract_start_date}
                    onChange={(e) => setFormData({ ...formData, contract_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formatDate(formData.contract_start_date)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract End Date
                </label>
                {editMode ? (
                  <input
                    type="date"
                    value={formData.contract_end_date || ''}
                    onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.contract_end_date ? formatDate(formData.contract_end_date) : 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.position_title}
                    onChange={(e) => setFormData({ ...formData, position_title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.position_title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.department || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weekly Hours
                </label>
                {editMode ? (
                  <input
                    type="number"
                    step="0.01"
                    value={formData.weekly_hours}
                    onChange={(e) => setFormData({ ...formData, weekly_hours: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.weekly_hours} hours</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Location
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.work_location || ''}
                    onChange={(e) => setFormData({ ...formData, work_location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.work_location || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Compensation</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gross Salary
                </label>
                {editMode ? (
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salary_amount}
                    onChange={(e) => setFormData({ ...formData, salary_amount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(formData.salary_amount, formData.salary_currency)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Period
                </label>
                {editMode ? (
                  <select
                    value={formData.salary_period}
                    onChange={(e) => setFormData({ ...formData, salary_period: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="hourly">Hourly</option>
                    <option value="annual">Annual</option>
                  </select>
                ) : (
                  <p className="text-gray-900 capitalize">{formData.salary_period}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Account (IBAN)
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.bank_account_iban || ''}
                    onChange={(e) => setFormData({ ...formData, bank_account_iban: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-mono">{formData.bank_account_iban || 'N/A'}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.bank_name || ''}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.bank_name || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Hungarian Specific Data */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Hungarian Payroll Data</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TAJ Number
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={countryData.taj_number}
                    onChange={(e) => updateCountryData('taj_number', e.target.value)}
                    pattern="[0-9]{9}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-mono">{countryData.taj_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax ID
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={countryData.tax_id}
                    onChange={(e) => updateCountryData('tax_id', e.target.value)}
                    pattern="[0-9]{10}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-mono">{countryData.tax_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Bracket
                </label>
                {editMode ? (
                  <select
                    value={countryData.tax_bracket}
                    onChange={(e) => updateCountryData('tax_bracket', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">Bracket 1</option>
                    <option value="2">Bracket 2</option>
                  </select>
                ) : (
                  <p className="text-gray-900">Bracket {countryData.tax_bracket}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Family Tax Allowance (Children)
                </label>
                {editMode ? (
                  <input
                    type="number"
                    min="0"
                    value={countryData.family_tax_allowance || 0}
                    onChange={(e) => updateCountryData('family_tax_allowance', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{countryData.family_tax_allowance || 0} children</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pension Fund
                </label>
                {editMode ? (
                  <select
                    value={countryData.pension_fund}
                    onChange={(e) => updateCountryData('pension_fund', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="government">Government</option>
                    <option value="private">Private</option>
                  </select>
                ) : (
                  <p className="text-gray-900 capitalize">{countryData.pension_fund}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Health Insurance Number
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={countryData.health_insurance_number || ''}
                    onChange={(e) => updateCountryData('health_insurance_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{countryData.health_insurance_number || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Status</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Employment Status</span>
                <p className="font-medium">
                  {formData.is_active ? (
                    <span className="text-green-600">● Active</span>
                  ) : (
                    <span className="text-red-600">● Inactive</span>
                  )}
                </p>
              </div>
              {formData.termination_date && (
                <div>
                  <span className="text-sm text-gray-600">Termination Date</span>
                  <p className="font-medium">{formatDate(formData.termination_date)}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-600">Last Updated</span>
                <p className="text-sm">{formatDate(payroll.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Change History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Change History</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-sm text-gray-500">No changes recorded</p>
              ) : (
                history.map((entry) => (
                  <div key={entry.id} className="border-l-2 border-blue-500 pl-3 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        entry.change_type === 'created' ? 'bg-green-100 text-green-800' :
                        entry.change_type === 'updated' ? 'bg-blue-100 text-blue-800' :
                        entry.change_type === 'terminated' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.change_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(entry.change_date).toLocaleString()}
                    </p>
                    {entry.changed_fields && entry.changed_fields.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Changed: {entry.changed_fields.join(', ')}
                      </p>
                    )}
                    {entry.change_reason && (
                      <p className="text-xs text-gray-600 mt-1 italic">
                        {entry.change_reason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}