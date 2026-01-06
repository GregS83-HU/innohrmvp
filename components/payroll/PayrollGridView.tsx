// components/payroll/PayrollGridView.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lock,
  Edit2,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
//import type { EmploymentType } from '../../types/payroll';
import { formatHUF, getAllowanceTypeLabel, getDeductionTypeLabel } from '../../types/payroll';
import BulkOperationsModal from './BulkOperationsModal';
import React from 'react';
import type {
  EmploymentType,
  AllowanceType,
  DeductionType,
} from '../../types/payroll';




export interface GridEmployee {
  id: string;
  user_id: string;
  users: {
    user_firstname: string;
    user_lastname: string;
  };
  position_title: string;
  department?: string;
  employment_type: EmploymentType;
  salary_amount: number;
  salary_currency: string;
  weekly_hours: number;
  is_active: boolean;
  total_allowances: number;
  total_deductions: number;
  allowances_count: number;
  deductions_count: number;
  allowances: Array<{
  id: string;
  allowance_type: AllowanceType;
  amount: number;
  description?: string;
  is_recurring: boolean;
}>;

deductions: Array<{
  id: string;
  deduction_type: DeductionType;
  amount: number;
  description?: string;
  remaining_amount?: number;
  installments_remaining?: number;
}>;

  validation_status: 'valid' | 'warning' | 'error';
  validation_issues_count: number;
}

interface PayrollGridViewProps {
  countryCode: string;
  currentUserId: string;
  periodClosed?: boolean;
  onEditEmployee?: (employee: GridEmployee) => void;
}

export default function PayrollGridView({
  countryCode,
  currentUserId,
  periodClosed = false,
  onEditEmployee,
}: PayrollGridViewProps) {
  const [employees, setEmployees] = useState<GridEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | 'all'>('active');
  const [sortBy, setSortBy] = useState<'name' | 'salary' | 'department' | 'position'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Available filters
  const [departments, setDepartments] = useState<string[]>([]);

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Bulk operations
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Inline editing
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Fetch grid data
  const fetchGridData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        country_code: countryCode,
        page: currentPage.toString(),
        page_size: pageSize.toString(),
        status: selectedStatus,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (selectedEmploymentType) params.append('employment_type', selectedEmploymentType);

      const response = await fetch(`/api/payroll/grid?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch grid data');
      }

      const data = await response.json();
      
      setEmployees(data.data || []);
      setTotalCount(data.pagination.total_count);
      setTotalPages(data.pagination.total_pages);
      setDepartments(data.filters.departments || []);
    } catch (err) {
      console.error('Error fetching grid:', err);
      setError('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  }, [countryCode, currentPage, pageSize, searchQuery, selectedDepartment, selectedEmploymentType, selectedStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchGridData();
  }, [fetchGridData]);

  // Handle search with debounce
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setCurrentPage(1); // Reset to page 1 on search
      fetchGridData();
    }, 500);
    
    setSearchTimeout(timeout);
  };

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Select all on current page
  const toggleSelectAll = () => {
    if (selectedIds.size === employees.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(employees.map(e => e.id)));
    }
  };

  // Inline editing
  const startEditing = (id: string, field: string, currentValue: string | number) => {
    if (periodClosed) return;
    setEditingCell({ id, field });
    setEditValue(String(currentValue));
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const saveEdit = async (employeeId: string, field: string) => {
    try {
      const value = field === 'salary_amount' || field === 'weekly_hours'
        ? parseFloat(editValue)
        : editValue;

      const response = await fetch(`/api/payroll/${employeeId}?current_user_id=${currentUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        await fetchGridData();
        cancelEditing();
      } else {
        alert('Failed to save changes');
      }
    } catch (err) {
      console.error('Error saving:', err);
      alert('Error saving changes');
    }
  };

  // Validation status icon
  const getValidationIcon = (status: 'valid' | 'warning' | 'error') => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  // Handle bulk operation completion
  const handleBulkOperationComplete = () => {
    setShowBulkModal(false);
    setSelectedIds(new Set());
    fetchGridData();
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Grid View</h2>
            <span className="text-sm text-gray-500">({totalCount} employees)</span>
          </div>
          
          {periodClosed && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-lg">
              <Lock className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Period Closed</span>
            </div>
          )}
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, position..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as 'active' | 'inactive' | 'all');
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="all">All Status</option>
          </select>

          {/* Export Button */}
          <button
            onClick={() => alert('Export functionality - integrate with existing export modal')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Selection Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-900">
              {selectedIds.size} employee{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-blue-700 hover:text-blue-900 underline"
            >
              Clear selection
            </button>
          </div>
          
          <button
            onClick={() => setShowBulkModal(true)}
            disabled={periodClosed}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingUp className="w-4 h-4" />
            Bulk Actions
          </button>
        </div>
      )}

      {/* Grid Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === employees.length && employees.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </th>
                <th className="w-10 px-4 py-3"></th>
                <th className="w-10 px-4 py-3 text-center">
                  <span className="text-xs font-medium text-gray-500 uppercase">Status</span>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortBy('name');
                    setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortBy('position');
                    setSortOrder(sortBy === 'position' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Position {sortBy === 'position' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortBy('department');
                    setSortOrder(sortBy === 'department' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Department {sortBy === 'department' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortBy('salary');
                    setSortOrder(sortBy === 'salary' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Base Salary {sortBy === 'salary' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Allowances
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Deductions
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {employees.map((employee) => {
                const isExpanded = expandedRows.has(employee.id);
                const isSelected = selectedIds.has(employee.id);
                const isEditing = editingCell?.id === employee.id;

                return (
                  <React.Fragment key={employee.id}>
                    {/* Main Row */}
                    <tr
                      key={employee.id}
                      className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''} ${periodClosed ? 'opacity-60' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(employee.id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>

                      {/* Expand Button */}
                      <td className="px-4 py-3">
                        {(employee.allowances_count > 0 || employee.deductions_count > 0) && (
                          <button
                            onClick={() => toggleRowExpansion(employee.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>

                      {/* Validation Status */}
                      <td className="px-4 py-3 text-center">
                        {getValidationIcon(employee.validation_status)}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {employee.users.user_firstname} {employee.users.user_lastname}
                        </div>
                        <div className="text-xs text-gray-500">{employee.employment_type.replace('_', ' ')}</div>
                      </td>

                      {/* Position */}
                      <td className="px-4 py-3">
                        {isEditing && editingCell?.field === 'position_title' ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(employee.id, 'position_title')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(employee.id, 'position_title');
                              if (e.key === 'Escape') cancelEditing();
                            }}
                            autoFocus
                            className="w-full px-2 py-1 border border-blue-500 rounded text-sm"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(employee.id, 'position_title', employee.position_title)}
                            className="text-sm text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                          >
                            {employee.position_title}
                          </div>
                        )}
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3">
                        {isEditing && editingCell?.field === 'department' ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(employee.id, 'department')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(employee.id, 'department');
                              if (e.key === 'Escape') cancelEditing();
                            }}
                            autoFocus
                            className="w-full px-2 py-1 border border-blue-500 rounded text-sm"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(employee.id, 'department', employee.department || '')}
                            className="text-sm text-gray-600 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                          >
                            {employee.department || '-'}
                          </div>
                        )}
                      </td>

                      {/* Salary */}
                      <td className="px-4 py-3 text-right">
                        {isEditing && editingCell?.field === 'salary_amount' ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(employee.id, 'salary_amount')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(employee.id, 'salary_amount');
                              if (e.key === 'Escape') cancelEditing();
                            }}
                            autoFocus
                            className="w-full px-2 py-1 border border-blue-500 rounded text-sm text-right"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(employee.id, 'salary_amount', employee.salary_amount)}
                            className="text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                          >
                            {formatHUF(employee.salary_amount)}
                          </div>
                        )}
                      </td>

                      {/* Allowances */}
                      <td className="px-4 py-3 text-right">
                        {employee.total_allowances > 0 ? (
                          <div>
                            <div className="text-sm font-semibold text-green-700">
                              +{formatHUF(employee.total_allowances)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.allowances_count} item{employee.allowances_count !== 1 ? 's' : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* Deductions */}
                      <td className="px-4 py-3 text-right">
                        {employee.total_deductions > 0 ? (
                          <div>
                            <div className="text-sm font-semibold text-red-700">
                              -{formatHUF(employee.total_deductions)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.deductions_count} item{employee.deductions_count !== 1 ? 's' : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onEditEmployee?.(employee)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="Open full edit modal"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={10} className="px-4 py-4">
                          <div className="grid grid-cols-2 gap-6">
                            {/* Allowances Details */}
                            {employee.allowances.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  Allowances ({employee.allowances.length})
                                </h4>
                                <div className="space-y-2">
                                  {employee.allowances.map((allowance) => (
                                    <div key={allowance.id} className="bg-white border border-gray-200 rounded p-2 text-sm">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <div className="font-medium text-gray-900">
                                            {getAllowanceTypeLabel(allowance.allowance_type)}
                                          </div>
                                          {allowance.description && (
                                            <div className="text-xs text-gray-600 mt-1">{allowance.description}</div>
                                          )}
                                        </div>
                                        <div className="text-right">
                                          <div className="font-semibold text-green-700">{formatHUF(allowance.amount)}</div>
                                          <div className="text-xs text-gray-500">
                                            {allowance.is_recurring ? 'Monthly' : 'One-time'}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Deductions Details */}
                            {employee.deductions.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                                  Deductions ({employee.deductions.length})
                                </h4>
                                <div className="space-y-2">
                                  {employee.deductions.map((deduction) => (
                                    <div key={deduction.id} className="bg-white border border-gray-200 rounded p-2 text-sm">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <div className="font-medium text-gray-900">
                                            {getDeductionTypeLabel(deduction.deduction_type)}
                                          </div>
                                          {deduction.description && (
                                            <div className="text-xs text-gray-600 mt-1">{deduction.description}</div>
                                          )}
                                          {deduction.installments_remaining && (
                                            <div className="text-xs text-gray-500 mt-1">
                                              {deduction.installments_remaining} months remaining
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-right">
                                          <div className="font-semibold text-red-700">{formatHUF(deduction.amount)}</div>
                                          {deduction.remaining_amount && (
                                            <div className="text-xs text-gray-500">
                                              Remaining: {formatHUF(deduction.remaining_amount)}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} employees
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              >
                Next
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Operations Modal */}
      {showBulkModal && (
        <BulkOperationsModal
          selectedPayrollIds={Array.from(selectedIds)}
          currentUserId={currentUserId}
          onClose={() => setShowBulkModal(false)}
          onComplete={handleBulkOperationComplete}
        />
      )}

      {/* Empty State */}
      {!loading && employees.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-600">
            {searchQuery || selectedDepartment || selectedEmploymentType
              ? 'Try adjusting your filters'
              : 'Add employees to see them here'}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}