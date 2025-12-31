// components/payroll/CompensationManager.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Save,
  X,
} from 'lucide-react';
import type {
  EmployeeAllowance,
  EmployeeDeduction,
  AllowanceType,
  DeductionType,
  TaxTreatment,
  CreateAllowanceRequest,
  CreateDeductionRequest,
} from '../../types/payroll';
import {
  getAllowanceTypeLabel,
  getDeductionTypeLabel,
  getTaxTreatmentLabel,
  formatCompensation,
  HUNGARIAN_ALLOWANCE_CONFIG,
} from '../../types/payroll';

interface CompensationManagerProps {
  payrollId: string;
  baseSalary: number;
  currency: string | undefined;
  currentUserId: string;
  onUpdate?: () => void;
}

export default function CompensationManager({
  payrollId,
  baseSalary,
  currency,
  currentUserId,
  onUpdate,
}: CompensationManagerProps) {
  const [allowances, setAllowances] = useState<EmployeeAllowance[]>([]);
  const [deductions, setDeductions] = useState<EmployeeDeduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showAllowanceModal, setShowAllowanceModal] = useState(false);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState<EmployeeAllowance | null>(null);
  const [editingDeduction, setEditingDeduction] = useState<EmployeeDeduction | null>(null);

  // Fetch data
  useEffect(() => {
    if (payrollId) {
      fetchCompensation();
    }
  }, [payrollId]);

  const fetchCompensation = async () => {
    try {
      setLoading(true);
      
      // Fetch allowances
      const allowancesRes = await fetch(`/api/payroll/allowances?payroll_id=${payrollId}`);
      if (allowancesRes.ok) {
        const allowancesData: { data: EmployeeAllowance[] } = await allowancesRes.json();
        setAllowances(allowancesData.data || []);
      }
      
      // Fetch deductions
      const deductionsRes = await fetch(`/api/payroll/deductions?payroll_id=${payrollId}`);
      if (deductionsRes.ok) {
        const deductionsData: { data: EmployeeDeduction[] } = await deductionsRes.json();
        setDeductions(deductionsData.data || []);
      }
    } catch (err) {
      console.error('Error fetching compensation:', err);
      setError('Failed to load compensation data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllowance = async (id: string) => {
    if (!confirm('Delete this allowance?')) return;
    
    try {
      const res = await fetch(`/api/payroll/allowances/${id}?current_user_id=${currentUserId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setAllowances(allowances.filter(a => a.id !== id));
        onUpdate?.();
      }
    } catch (err) {
      alert('Failed to delete allowance');
    }
  };

  const handleDeleteDeduction = async (id: string) => {
    if (!confirm('Delete this deduction?')) return;
    
    try {
      const res = await fetch(`/api/payroll/deductions/${id}?current_user_id=${currentUserId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setDeductions(deductions.filter(d => d.id !== id));
        onUpdate?.();
      }
    } catch (err) {
      alert('Failed to delete deduction');
    }
  };

  // Calculate totals
  const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
  const totalDeductions = deductions.filter(d => d.is_active).reduce((sum, d) => sum + d.amount, 0);
  const grossTotal = baseSalary + totalAllowances;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 mb-1">Base Salary</div>
          <div className="text-2xl font-bold text-blue-900">
            {formatCompensation(baseSalary, currency)}
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm text-green-700">Allowances</div>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">
            {formatCompensation(totalAllowances, currency, true)}
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm text-red-700">Deductions</div>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900">
            {formatCompensation(totalDeductions, currency)}
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm text-purple-700">Gross Total</div>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {formatCompensation(grossTotal, currency)}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Allowances Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Allowances & Benefits
          </h3>
          <button
            onClick={() => {
              setEditingAllowance(null);
              setShowAllowanceModal(true);
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Allowance
          </button>
        </div>

        {allowances.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No allowances configured</p>
            <p className="text-sm text-gray-500 mt-1">Click "Add Allowance" to get started</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allowances.map((allowance) => (
                  <tr key={allowance.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {getAllowanceTypeLabel(allowance.allowance_type)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-700">
                      {formatCompensation(allowance.amount, allowance.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded text-xs ${
                        allowance.tax_treatment === 'fully_taxable' 
                          ? 'bg-red-100 text-red-800'
                          : allowance.tax_treatment === 'non_taxable'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getTaxTreatmentLabel(allowance.tax_treatment)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {allowance.is_recurring ? (
                        <span className="text-blue-600 font-medium">Monthly</span>
                      ) : (
                        <span className="text-gray-500">
                          {allowance.effective_month}/{allowance.effective_year}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {allowance.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingAllowance(allowance);
                            setShowAllowanceModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAllowance(allowance.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deductions Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            Deductions
          </h3>
          <button
            onClick={() => {
              setEditingDeduction(null);
              setShowDeductionModal(true);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Deduction
          </button>
        </div>

        {deductions.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No deductions configured</p>
            <p className="text-sm text-gray-500 mt-1">Click "Add Deduction" to get started</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deductions.map((deduction) => (
                  <tr key={deduction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {getDeductionTypeLabel(deduction.deduction_type)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-700">
                      {formatCompensation(deduction.amount, deduction.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {deduction.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {deduction.remaining_amount ? (
                        <div>
                          <div className="font-medium">{formatCompensation(deduction.remaining_amount, deduction.currency)}</div>
                          {deduction.installments_remaining && (
                            <div className="text-xs text-gray-500">
                              {deduction.installments_remaining} months left
                            </div>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {deduction.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <button
                        onClick={() => handleDeleteDeduction(deduction.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAllowanceModal && (
        <AllowanceModal
          payrollId={payrollId}
          allowance={editingAllowance}
          currentUserId={currentUserId}
          onClose={() => {
            setShowAllowanceModal(false);
            setEditingAllowance(null);
          }}
          onSuccess={() => {
            fetchCompensation();
            onUpdate?.();
          }}
        />
      )}

      {showDeductionModal && (
        <DeductionModal
          payrollId={payrollId}
          deduction={editingDeduction}
          currentUserId={currentUserId}
          onClose={() => {
            setShowDeductionModal(false);
            setEditingDeduction(null);
          }}
          onSuccess={() => {
            fetchCompensation();
            onUpdate?.();
          }}
        />
      )}
    </div>
  );
}

/* ========== ALLOWANCE MODAL ========== */

interface AllowanceModalProps {
  payrollId: string;
  allowance: EmployeeAllowance | null;
  currentUserId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function AllowanceModal({ payrollId, allowance, currentUserId, onClose, onSuccess }: AllowanceModalProps) {
  const [formData, setFormData] = useState<CreateAllowanceRequest>({
    payroll_id: payrollId,
    allowance_type: allowance?.allowance_type || 'bonus',
    amount: allowance?.amount || 0,
    currency: allowance?.currency || 'HUF',
    tax_treatment: allowance?.tax_treatment || 'fully_taxable',
    is_recurring: allowance?.is_recurring || false,
    effective_month: allowance?.effective_month || new Date().getMonth() + 1,
    effective_year: allowance?.effective_year || new Date().getFullYear(),
    description: allowance?.description || '',
  });
  
  const [saving, setSaving] = useState(false);

  // Update tax treatment when type changes
  const handleTypeChange = (type: AllowanceType) => {
    const config = HUNGARIAN_ALLOWANCE_CONFIG[type];
    setFormData({
      ...formData,
      allowance_type: type,
      tax_treatment: config.defaultTaxTreatment,
      tax_free_limit: config.taxFreeLimit,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const url = allowance 
        ? `/api/payroll/allowances/${allowance.id}?current_user_id=${currentUserId}`
        : `/api/payroll/allowances?current_user_id=${currentUserId}`;
      
      const method = allowance ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert('Failed to save allowance');
      }
    } catch (err) {
      alert('Error saving allowance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">
            {allowance ? 'Edit Allowance' : 'Add Allowance'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.allowance_type}
                onChange={(e) => handleTypeChange(e.target.value as AllowanceType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="bonus">Bonus</option>
                <option value="remboursement">Reimbursement</option>
                <option value="cafeteria">Cafétéria</option>
                <option value="sport">Sport</option>
                <option value="cadeau">Gift / Cadeau</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                min="0"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Treatment
              </label>
              <select
                value={formData.tax_treatment}
                onChange={(e) => setFormData({ ...formData, tax_treatment: e.target.value as TaxTreatment })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="fully_taxable">Fully Taxable</option>
                <option value="non_taxable">Non-Taxable</option>
                <option value="partially_taxable">Partially Taxable</option>
                <option value="tax_free_under_limit">Tax-Free (Under Limit)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                value={formData.is_recurring ? 'recurring' : 'one-time'}
                onChange={(e) => setFormData({ ...formData, is_recurring: e.target.value === 'recurring' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="recurring">Monthly (Recurring)</option>
                <option value="one-time">One-Time</option>
              </select>
            </div>

            {!formData.is_recurring && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <select
                    value={formData.effective_month}
                    onChange={(e) => setFormData({ ...formData, effective_month: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{new Date(2024, m-1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.effective_year}
                    onChange={(e) => setFormData({ ...formData, effective_year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes about this allowance..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== DEDUCTION MODAL ========== */

interface DeductionModalProps {
  payrollId: string;
  deduction: EmployeeDeduction | null;
  currentUserId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function DeductionModal({ payrollId, deduction, currentUserId, onClose, onSuccess }: DeductionModalProps) {
  const currentDate = new Date();
  const [formData, setFormData] = useState<CreateDeductionRequest>({
    payroll_id: payrollId,
    deduction_type: deduction?.deduction_type || 'advance_on_salary',
    amount: deduction?.amount || 0,
    currency: deduction?.currency || 'HUF',
    total_amount: deduction?.total_amount,
    installment_count: deduction?.installment_count,
    start_month: deduction?.start_month || currentDate.getMonth() + 1,
    start_year: deduction?.start_year || currentDate.getFullYear(),
    description: deduction?.description || '',
  });
  
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const url = deduction 
        ? `/api/payroll/deductions/${deduction.id}?current_user_id=${currentUserId}`
        : `/api/payroll/deductions?current_user_id=${currentUserId}`;
      
      const method = deduction ? 'PUT' : 'POST';
      
      // Calculate end date if installments
      let endMonth, endYear;
      if (formData.installment_count && formData.start_month && formData.start_year) {
        const startDate = new Date(formData.start_year, formData.start_month - 1);
        const endDate = new Date(startDate.setMonth(startDate.getMonth() + formData.installment_count - 1));
        endMonth = endDate.getMonth() + 1;
        endYear = endDate.getFullYear();
      }
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          end_month: endMonth,
          end_year: endYear,
        }),
      });
      
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert('Failed to save deduction');
      }
    } catch (err) {
      alert('Error saving deduction');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">
            {deduction ? 'Edit Deduction' : 'Add Deduction'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.deduction_type}
                onChange={(e) => setFormData({ ...formData, deduction_type: e.target.value as DeductionType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="advance_on_salary">Advance on Salary</option>
                <option value="loan_repayment">Loan Repayment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                min="0"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount (if installments)
              </label>
              <input
                type="number"
                value={formData.total_amount || ''}
                onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || undefined })}
                min="0"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Months
              </label>
              <input
                type="number"
                value={formData.installment_count || ''}
                onChange={(e) => setFormData({ ...formData, installment_count: parseInt(e.target.value) || undefined })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Month
              </label>
              <select
                value={formData.start_month}
                onChange={(e) => setFormData({ ...formData, start_month: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(2024, m-1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Year
              </label>
              <input
                type="number"
                value={formData.start_year}
                onChange={(e) => setFormData({ ...formData, start_year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes about this deduction..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}