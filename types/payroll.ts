// types/payroll.ts
// TypeScript types for the Payroll Module

export type EmploymentType = 
  | 'full_time' 
  | 'part_time' 
  | 'contractor' 
  | 'intern' 
  | 'temporary';

export type ContractType = 
  | 'permanent' 
  | 'fixed_term' 
  | 'probation';

export type SalaryPeriod = 
  | 'monthly' 
  | 'hourly' 
  | 'annual';

export type PaymentMethod = 
  | 'bank_transfer' 
  | 'cash' 
  | 'check';

export type ChangeType = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'terminated';

export type ExportFormat = 
  | 'generic' 
  | 'kulcs_soft' 
  | 'nexon' 
  | 'sap';

// Country-specific data for Hungary
export interface HungarianPayrollData {
  taj_number: string; // 9-digit TAJ number
  tax_id: string; // 10-digit tax ID
  tax_bracket: '1' | '2';
  family_tax_allowance?: number; // Number of children
  pension_fund?: 'government' | 'private';
  health_insurance_number?: string;
  personal_income_tax_rate: number; // Default: 15
  employee_social_contribution: number; // Default: 18.5
  employer_social_contribution: number; // Default: 13
  mothers_maiden_name?: string;
  place_of_birth?: string;
  citizenship?: string;
}

// Generic benefit structure
export interface Benefit {
  type: string; // e.g., 'meal_voucher', 'transport', 'health_insurance'
  amount: number;
  currency: string;
  description?: string;
}

// Field configuration for country-specific requirements
export interface FieldConfig {
  field_name: string;
  field_label: string;
  field_type: 'string' | 'number' | 'select' | 'date' | 'boolean';
  validation?: string; // Regex pattern
  options?: string[]; // For select fields
  default?: any;
  description?: string;
  required?: boolean;
}

export interface PayrollCountry {
  id: string;
  country_code: string;
  country_name: string;
  is_active: boolean;
  field_config: {
    required_fields: FieldConfig[];
    optional_fields: FieldConfig[];
  };
  created_at: string;
  updated_at: string;
}

// Main employee payroll record
export interface EmployeePayroll {
  id: string;
  user_id: string;
  country_code: string;
  
  // Employment Details
  employment_type: EmploymentType;
  contract_type: ContractType;
  contract_start_date: string; // ISO date
  contract_end_date?: string | null; // ISO date
  position_title: string;
  department?: string;
  work_location?: string;
  weekly_hours: number;
  
  // Compensation
  salary_amount: number;
  salary_currency: string;
  salary_period: SalaryPeriod;
  payment_method: PaymentMethod;
  bank_account_iban?: string;
  bank_name?: string;
  
  // Country-specific data (flexible JSONB)
  country_specific_data: HungarianPayrollData | Record<string, any>;
  
  // Benefits
  benefits: Benefit[];
  
  // Status
  is_active: boolean;
  termination_date?: string | null;
  termination_reason?: string | null;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;

  users?: {
    id: string;
    user_firstname: string;
    user_lastname: string;
    is_manager?: boolean;
  };
}

// Payroll history record
export interface PayrollHistory {
  id: string;
  payroll_id: string;
  user_id: string;
  change_type: ChangeType;
  change_date: string;
  effective_date: string;
  changed_by?: string;
  change_reason?: string;
  data_snapshot: EmployeePayroll;
  changed_fields?: string[];
  previous_values?: Record<string, any>;
  new_values?: Record<string, any>;
  created_at: string;
}

// Payroll export record
export interface PayrollExport {
  id: string;
  export_date: string;
  exported_by: string;
  country_code: string;
  export_month: number; // 1-12
  export_year: number;
  export_format: ExportFormat;
  export_name?: string; // NEW: Optional user-provided name
  employee_count: number;
  file_name: string;
  file_path?: string;
  export_options?: {
    include_terminated?: boolean;
    department?: string;
    employment_type?: EmploymentType[];
  };
  notes?: string;
  created_at: string;
}

// Extended user data with payroll information
export interface UserWithPayroll {
  id: string;
  user_firstname: string;
  user_lastname: string;
  is_admin: boolean;
  is_manager: boolean;
  payroll?: EmployeePayroll;
  manager_id?: string;
  employment_start_date?: string;
}

// Payroll data for export (with calculated fields)
export interface PayrollExportData {
  user_id: string;
  user_firstname: string;
  user_lastname: string;
  employment_type: EmploymentType;
  contract_type: ContractType;
  position_title: string;
  department?: string;
  salary_amount: number;
  salary_currency: string;
  bank_account_iban?: string;
  bank_name?: string;
  country_specific_data: Record<string, any>;
  benefits: Benefit[];
  weekly_hours: number;
  worked_days: number; // Calculated based on calendar and absences
  leave_days: number; // From leave_requests
  actual_worked_days: number; // worked_days - leave_days
}

// API request/response types
export interface CreatePayrollRequest {
  user_id: string;
  country_code: string;
  employment_type: EmploymentType;
  contract_type: ContractType;
  contract_start_date: string;
  contract_end_date?: string;
  position_title: string;
  department?: string;
  work_location?: string;
  weekly_hours: number;
  salary_amount: number;
  salary_currency?: string;
  salary_period?: SalaryPeriod;
  payment_method?: PaymentMethod;
  bank_account_iban?: string;
  bank_name?: string;
  country_specific_data: Record<string, any>;
  benefits?: Benefit[];
}

export interface UpdatePayrollRequest extends Partial<CreatePayrollRequest> {
  id: string;

 // Status updates
  is_active?: boolean;
  termination_date?: string | null;
  termination_reason?: string | null;

  change_reason?: string;
  effective_date?: string; // For future-dated changes
}

export interface ExportPayrollRequest {
  country_code: string;
  export_month: number;
  export_year: number;
  export_format: ExportFormat;
  export_name?: string; // NEW: Optional user-provided name for the export
  include_terminated?: boolean;
  department?: string;
  employment_types?: EmploymentType[];
  validated_by: string;
}

export interface ExportPayrollResponse {
  success: boolean;
  export_id: string;
  file_name: string;
  file_url: string;
  employee_count: number;
  export_date: string;
}

// Validation helpers
export const HUNGARIAN_TAJ_REGEX = /^[0-9]{9}$/;
export const HUNGARIAN_TAX_ID_REGEX = /^[0-9]{10}$/;
export const IBAN_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;

// Validation functions
export function validateHungarianTAJ(taj: string): boolean {
  return HUNGARIAN_TAJ_REGEX.test(taj);
}

export function validateHungarianTaxID(taxId: string): boolean {
  return HUNGARIAN_TAX_ID_REGEX.test(taxId);
}

export function validateIBAN(iban: string): boolean {
  return IBAN_REGEX.test(iban.replace(/\s/g, ''));
}

// Hungarian payroll constants (as of 2024)
export const HUNGARIAN_PAYROLL_CONSTANTS = {
  PERSONAL_INCOME_TAX_RATE: 15, // %
  EMPLOYEE_SOCIAL_CONTRIBUTION: 18.5, // %
  EMPLOYER_SOCIAL_CONTRIBUTION: 13, // %
  EMPLOYER_VOCATIONAL_TRAINING: 1.5, // %
  MIN_WAGE_MONTHLY: 266800, // HUF (2024)
  GUARANTEED_MIN_WAGE_MONTHLY: 326000, // HUF for skilled workers (2024)
  FAMILY_TAX_ALLOWANCE: {
    1: 10000, // HUF per month per child (1 child)
    2: 20000, // HUF per month per child (2 children)
    3: 33000, // HUF per month per child (3+ children)
  }
};

// Helper function to calculate family tax allowance
export function calculateFamilyTaxAllowance(numberOfChildren: number): number {
  if (numberOfChildren === 0) return 0;
  if (numberOfChildren === 1) return HUNGARIAN_PAYROLL_CONSTANTS.FAMILY_TAX_ALLOWANCE[1];
  if (numberOfChildren === 2) return HUNGARIAN_PAYROLL_CONSTANTS.FAMILY_TAX_ALLOWANCE[2] * 2;
  return HUNGARIAN_PAYROLL_CONSTANTS.FAMILY_TAX_ALLOWANCE[3] * numberOfChildren;
}

// Helper to format Hungarian currency
export function formatHUF(amount: number): string {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Helper to calculate net salary (simplified - basic Hungarian calculation)
export function calculateNetSalary(
  grossSalary: number,
  familyTaxAllowance: number = 0
): {
  gross: number;
  personalIncomeTax: number;
  socialContribution: number;
  familyAllowance: number;
  net: number;
} {
  const taxableIncome = grossSalary - familyTaxAllowance;
  const personalIncomeTax = taxableIncome * (HUNGARIAN_PAYROLL_CONSTANTS.PERSONAL_INCOME_TAX_RATE / 100);
  const socialContribution = grossSalary * (HUNGARIAN_PAYROLL_CONSTANTS.EMPLOYEE_SOCIAL_CONTRIBUTION / 100);
  
  const net = grossSalary - personalIncomeTax - socialContribution;
  
  return {
    gross: grossSalary,
    personalIncomeTax,
    socialContribution,
    familyAllowance: familyTaxAllowance,
    net,
  };
}

// Status checks
export function isPayrollActive(payroll: EmployeePayroll): boolean {
  return payroll.is_active && !payroll.termination_date;
}

export function isContractExpired(payroll: EmployeePayroll): boolean {
  if (!payroll.contract_end_date) return false;
  return new Date(payroll.contract_end_date) < new Date();
}

export function getContractStatus(payroll: EmployeePayroll): 'active' | 'expired' | 'terminated' | 'probation' {
  if (payroll.termination_date) return 'terminated';
  if (payroll.contract_type === 'probation') return 'probation';
  if (isContractExpired(payroll)) return 'expired';
  return 'active';
}

// ADD THESE TO YOUR types/payroll.ts FILE

/* =====================================================
   PAYROLL VALIDATION TYPES
   ===================================================== */

export type ValidationStatus = 'running' | 'completed' | 'failed';

export type ValidationSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

// Validation run record
export interface PayrollValidationRun {
  id: string;
  country_code: string;
  year: number;
  month: number;
  export_format: ExportFormat;
  validation_name?: string; // Optional user-provided name
  has_critical_errors: boolean;
  issue_count: number;
  validation_status: ValidationStatus;
  validated_by: string; // user_id
  created_at: string;
}

// Validation issue record
export interface PayrollValidationIssue {
  id: string;
  validation_run_id: string;
  severity: ValidationSeverity;
  code: string;
  user_id?: string;
  field_name?: string;
  message: string;
  suggested_fix?: string;
  created_at: string;
}

// Request to run validation
export interface RunValidationRequest {
  country_code: string;
  year: number;
  month: number;
  export_format: ExportFormat;
  validation_name?: string; // Optional name for this validation run
  validated_by: string;
}

// Response from validation run
export interface ValidationRunResponse {
  validation_run_id: string;
  has_critical_errors: boolean;
  issue_count: number;
  validation_status: ValidationStatus;
  issues: PayrollValidationIssue[];
  created_at: string;
}

// Summary of validation runs for a period
export interface ValidationRunSummary {
  total_runs: number;
  runs_with_errors: number;
  last_run_at: string;
  last_run_status: ValidationStatus;
  last_run_had_errors: boolean;
}

// ADD THESE TO YOUR types/payroll.ts FILE

/* =====================================================
   PAYROLL PERIOD CLOSURE TYPES
   ===================================================== */

export type PeriodStatus = 'open' | 'closed' | 'reopened';

// Period closure record
export interface PayrollPeriodClosure {
  id: string;
  country_code: string;
  year: number;
  month: number;
  status: PeriodStatus;
  
  // Closure information
  closed_at?: string;
  closed_by?: string;
  closed_reason?: string;
  last_export_id?: string;
  
  // Reopening information
  reopened_at?: string;
  reopened_by?: string;
  reopen_reason?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  
  // Joined user data (when using SELECT with joins)
  closed_by_user?: {
    id: string;
    user_firstname: string;
    user_lastname: string;
  };
  reopened_by_user?: {
    id: string;
    user_firstname: string;
    user_lastname: string;
  };
}

// Request to close a period
export interface ClosePeriodRequest {
  country_code: string;
  year: number;
  month: number;
  closed_by: string; // user_id
  closed_reason?: string;
  last_export_id?: string; // Optional reference to export
}

// Request to reopen a period
export interface ReopenPeriodRequest {
  country_code: string;
  year: number;
  month: number;
  reopened_by: string; // user_id
  reopen_reason: string; // Required - must explain why reopening
}

// Response from period status check
export interface PeriodStatusResponse {
  status: PeriodStatus;
  closed_at?: string;
  closed_by?: string;
  closed_by_name?: string;
  closed_reason?: string;
  reopened_at?: string;
  reopened_by?: string;
  reopened_by_name?: string;
  reopen_reason?: string;
  last_export_id?: string;
}

// Dashboard summary of period statuses
export interface PeriodStatusSummary {
  country_code: string;
  year: number;
  month: number;
  status: PeriodStatus;
  month_name: string;
  can_export: boolean; // False if closed
  can_edit: boolean; // False if closed
}

// Helper function to check if a period is closed
export function isPeriodClosed(status: PeriodStatus): boolean {
  return status === 'closed';
}

// Helper function to check if a period can be edited
export function canEditPeriod(status: PeriodStatus): boolean {
  return status !== 'closed';
}

// Helper function to get period display name
export function getPeriodDisplayName(year: number, month: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[month - 1]} ${year}`;
}

// Helper function to get status badge color
export function getStatusBadgeColor(status: PeriodStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'closed':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
      };
    case 'reopened':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
      };
    case 'open':
    default:
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
      };
  }
}

// Helper function to get status icon
export function getStatusIcon(status: PeriodStatus): string {
  switch (status) {
    case 'closed':
      return '🔒'; // Locked
    case 'reopened':
      return '🔓'; // Unlocked (was locked)
    case 'open':
    default:
      return '✓'; // Open/Available
  }
}