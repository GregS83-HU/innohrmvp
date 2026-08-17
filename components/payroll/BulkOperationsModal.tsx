// components/payroll/BulkOperationsModal.tsx
'use client';

import { useState } from 'react';
import { X, TrendingUp, DollarSign, Users, Building2, Loader2 } from 'lucide-react';
import type { AllowanceType, DeductionType, TaxTreatment } from '../../types/payroll';
import { HUNGARIAN_ALLOWANCE_CONFIG, getAllowanceTypeLabel, getDeductionTypeLabel } from '../../types/payroll';

interface BulkOperationsModalProps {
  selectedPayrollIds: string[];
  currentUserId: string;
  onClose: () => void;
  onComplete: () => void;
}

type OperationType = 'salary_increase' | 'add_allowance' | 'add_deduction' | 'change_department';

export default function BulkOperationsModal({
  selectedPayrollIds,
  currentUserId,
  onClose,
  onComplete,
}: BulkOperationsModalProps) {
  const [operation, setOperation] = useState<OperationType>('salary_increase');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  // Salary increase state
  const [salaryChangeType, setSalaryChangeType] = useState<'percentage' | 'fixed'>('percentage');
  const [salaryValue, setSalaryValue] = useState<string>('');

  // Allowance state
  const [allowanceType, setAllowanceType] = useState<AllowanceType>('bonus');
  const [allowanceAmount, setAllowanceAmount] = useState<string>('');
  const [allowanceTaxTreatment, setAllowanceTaxTreatment] = useState<TaxTreatment>('fully_taxable');
  const [allowanceRecurring, setAllowanceRecurring] = useState(false);
  const [allowanceMonth, setAllowanceMonth] = useState<number>(new Date().getMonth() + 1);
  const [allowanceYear, setAllowanceYear] = useState<number>(new Date().getFullYear());
  const [allowanceDescription, setAllowanceDescription] = useState<string>('');

  // Deduction state
  const [deductionType, setDeductionType] = useState<DeductionType>('advance_on_salary');
  const [deductionAmount, setDeductionAmount] = useState<string>('');
  const [deductionTotalAmount, setDeductionTotalAmount] = useState<string>('');
  const [deductionInstallments, setDeductionInstallments] = useState<string>('');
  const [deductionStartMonth, setDeductionStartMonth] = useState<number>(new Date().getMonth() + 1);
  const [deductionStartYear, setDeductionStartYear] = useState<number>(new Date().getFullYear());
  const [deductionDescription, setDeductionDescription] = useState<string>('');

  // Department state
  const [newDepartment, setNewDepartment] = useState<string>('');

  // Handle allowance type change - auto-set tax treatment
  const handleAllowanceTypeChange = (type: AllowanceType) => {
    setAllowanceType(type);
    const config = HUNGARIAN_ALLOWANCE_CONFIG[type];
    setAllowanceTaxTreatment(config.defaultTaxTreatment);
  };

  const handleSubmit = async () => {
    try {
      setProcessing(true);
      setResult(null);

      const requestBody: Record<string, unknown> = {
        operation,
        payroll_ids: selectedPayrollIds,
        current_user_id: currentUserId,
      };

      // Build request based on operation type
      switch (operation) {
        case 'salary_increase':
          if (!salaryValue || parseFloat(salaryValue) <= 0) {
            alert('Please enter a valid value');
            return;
          }
          requestBody.salary_change = {
            type: salaryChangeType,
            value: parseFloat(salaryValue),
          };
          break;

        case 'add_allowance':
          if (!allowanceAmount || parseFloat(allowanceAmount) <= 0) {
            alert('Please enter a valid amount');
            return;
          }
          requestBody.allowance = {
            allowance_type: allowanceType,
            amount: parseFloat(allowanceAmount),
            currency: 'HUF',
            tax_treatment: allowanceTaxTreatment,
            is_recurring: allowanceRecurring,
            effective_month: allowanceRecurring ? undefined : allowanceMonth,
            effective_year: allowanceRecurring ? undefined : allowanceYear,
            description: allowanceDescription || undefined,
          };
          break;

        case 'add_deduction':
          if (!deductionAmount || parseFloat(deductionAmount) <= 0) {
            alert('Please enter a valid amount');
            return;
          }
          requestBody.deduction = {
            deduction_type: deductionType,
            amount: parseFloat(deductionAmount),
            currency: 'HUF',
            total_amount: deductionTotalAmount ? parseFloat(deductionTotalAmount) : undefined,
            installment_count: deductionInstallments ? parseInt(deductionInstallments) : undefined,
            start_month: deductionStartMonth,
            start_year: deductionStartYear,
            description: deductionDescription || undefined,
          };
          break;

        case 'change_department':
          if (!newDepartment.trim()) {
            alert('Please enter a department name');
            return;
          }
          requestBody.new_department = newDepartment.trim();
          break;
      }

      const response = await fetch('/api/payroll/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Bulk operation failed');
      }

      const data = await response.json();
      setResult({ success: data.success_count, failed: data.error_count });

      // Auto-close and refresh after success
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      console.error('Bulk operation error:', error);
      alert('Failed to perform bulk operation');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Bulk Operations</h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedPayrollIds.length} employee{selectedPayrollIds.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Operation Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Operation
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOperation('salary_increase')}
                className={`px-4 py-3 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                  operation === 'salary_increase'
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Salary Increase</span>
              </button>

              <button
                onClick={() => setOperation('add_allowance')}
                className={`px-4 py-3 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                  operation === 'add_allowance'
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Add Allowance</span>
              </button>

              <button
                onClick={() => setOperation('add_deduction')}
                className={`px-4 py-3 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                  operation === 'add_deduction'
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Add Deduction</span>
              </button>

              <button
                onClick={() => setOperation('change_department')}
                className={`px-4 py-3 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                  operation === 'change_department'
                    ? 'border-purple-500 bg-purple-50 text-purple-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="font-medium">Change Department</span>
              </button>
            </div>
          </div>

          {/* Operation-specific forms */}
          <div className="border-t pt-6">
            {operation === 'salary_increase' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Increase Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="percentage"
                        checked={salaryChangeType === 'percentage'}
                        onChange={(e) => setSalaryChangeType(e.target.value as 'percentage')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">Percentage (%)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="fixed"
                        checked={salaryChangeType === 'fixed'}
                        onChange={(e) => setSalaryChangeType(e.target.value as 'fixed')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">Fixed Amount (HUF)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {salaryChangeType === 'percentage' ? 'Percentage' : 'Amount'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={salaryValue}
                    onChange={(e) => setSalaryValue(e.target.value)}
                    placeholder={salaryChangeType === 'percentage' ? 'e.g., 5 for 5%' : 'e.g., 50000'}
                    min="0"
                    step={salaryChangeType === 'percentage' ? '0.1' : '1000'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {salaryChangeType === 'percentage' 
                      ? 'Enter percentage (e.g., 5 = 5% increase)'
                      : 'Enter fixed amount to add to current salary'}
                  </p>
                </div>
              </div>
            )}

            {operation === 'add_allowance' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={allowanceType}
                      onChange={(e) => handleAllowanceTypeChange(e.target.value as AllowanceType)}
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
                      Amount (HUF) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={allowanceAmount}
                      onChange={(e) => setAllowanceAmount(e.target.value)}
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
                      value={allowanceTaxTreatment}
                      onChange={(e) => setAllowanceTaxTreatment(e.target.value as TaxTreatment)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="fully_taxable">Fully Taxable</option>
                      <option value="non_taxable">Non-Taxable</option>
                      <option value="tax_free_under_limit">Tax-Free (Under Limit)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <select
                      value={allowanceRecurring ? 'recurring' : 'one-time'}
                      onChange={(e) => setAllowanceRecurring(e.target.value === 'recurring')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="recurring">Monthly (Recurring)</option>
                      <option value="one-time">One-Time</option>
                    </select>
                  </div>

                  {!allowanceRecurring && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Month
                        </label>
                        <select
                          value={allowanceMonth}
                          onChange={(e) => setAllowanceMonth(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>
                              {new Date(2024, m-1).toLocaleString('default', { month: 'long' })}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year
                        </label>
                        <input
                          type="number"
                          value={allowanceYear}
                          onChange={(e) => setAllowanceYear(parseInt(e.target.value))}
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
                    value={allowanceDescription}
                    onChange={(e) => setAllowanceDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional description..."
                  />
                </div>
              </div>
            )}

            {operation === 'add_deduction' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={deductionType}
                      onChange={(e) => setDeductionType(e.target.value as DeductionType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="advance_on_salary">Advance on Salary</option>
                      <option value="loan_repayment">Loan Repayment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Amount (HUF) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={deductionAmount}
                      onChange={(e) => setDeductionAmount(e.target.value)}
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
                      value={deductionTotalAmount}
                      onChange={(e) => setDeductionTotalAmount(e.target.value)}
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
                      value={deductionInstallments}
                      onChange={(e) => setDeductionInstallments(e.target.value)}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Month
                    </label>
                    <select
                      value={deductionStartMonth}
                      onChange={(e) => setDeductionStartMonth(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>
                          {new Date(2024, m-1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Year
                    </label>
                    <input
                      type="number"
                      value={deductionStartYear}
                      onChange={(e) => setDeductionStartYear(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={deductionDescription}
                    onChange={(e) => setDeductionDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional description..."
                  />
                </div>
              </div>
            )}

            {operation === 'change_department' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="e.g., Engineering, Sales, Marketing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-600 mt-2">
                  This will move all {selectedPayrollIds.length} selected employee{selectedPayrollIds.length !== 1 ? 's' : ''} to this department.
                </p>
              </div>
            )}
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-4 rounded-lg ${result.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className="text-sm font-medium">
                ✓ {result.success} succeeded
                {result.failed > 0 && `, ${result.failed} failed`}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={processing}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={processing}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                Apply to {selectedPayrollIds.length} Employee{selectedPayrollIds.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}