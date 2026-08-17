// lib/payrollExportUtils.ts
// Client-side utilities for generating payroll Excel exports

import * as XLSX from 'xlsx';
import type { PayrollExportData, ExportFormat } from '../types/payroll';

interface ExportOptions {
  format: ExportFormat;
  month: number;
  year: number;
  data: PayrollExportData[];
}

/**
 * Generate Excel file for payroll export
 */
export function generatePayrollExcel(options: ExportOptions): Blob {
  const { format, month, year, data } = options;
  
  const workbook = XLSX.utils.book_new();
  
  switch (format) {
    case 'generic':
      addGenericSheet(workbook, data, month, year);
      break;
    case 'kulcs_soft':
      addKulcsSoftSheet(workbook, data, month, year);
      break;
    case 'nexon':
      addNexonSheet(workbook, data, month, year);
      break;
    case 'sap':
      addSAPSheet(workbook, data, month, year);
      break;
    default:
      // Add all formats
      addGenericSheet(workbook, data, month, year);
      addKulcsSoftSheet(workbook, data, month, year);
      addNexonSheet(workbook, data, month, year);
      addSAPSheet(workbook, data, month, year);
  }
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Generic format - human-readable with compensation details
 */
function addGenericSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
  const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });
  
  // Prepare data for sheet
  const sheetData : (string | number)[][] = [
    [`Payroll Export - ${monthName} ${year}`],
    [],
    [
      'Employee ID', 'Last Name', 'First Name', 'TAJ Number', 'Tax ID',
      'Position', 'Department', 'Employment Type', 'Contract Type',
      'Base Salary (HUF)', 'Total Allowances', 'Taxable Allowances', 'Non-Taxable Allowances',
      'Total Deductions', 'Gross Total', 'Net Before Tax',
      'Currency', 'Bank IBAN', 'Bank Name',
      'Worked Days', 'Leave Days', 'Actual Worked Days', 'Weekly Hours'
    ]
  ];
  
  data.forEach(emp => {
    const countryData = emp.country_specific_data || {};
    sheetData.push([
      emp.user_id,
      emp.user_lastname,
      emp.user_firstname,
      countryData.taj_number || '',
      countryData.tax_id || '',
      emp.position_title,
      emp.department || '',
      emp.employment_type,
      emp.contract_type,
      Number(emp.salary_amount) || 0,
      Number(emp.total_allowances) || 0,
      Number(emp.taxable_allowances) || 0,
      Number(emp.non_taxable_allowances) || 0,
      Number(emp.total_deductions) || 0,
      Number(emp.gross_total) || Number(emp.salary_amount) || 0,
      Number(emp.net_before_tax) || Number(emp.salary_amount) || 0,
      emp.salary_currency,
      emp.bank_account_iban || '',
      emp.bank_name || '',
      Number(emp.worked_days) || 0,
      Number(emp.leave_days) || 0,
      Number(emp.actual_worked_days) || 0,
      Number(emp.weekly_hours) || 0
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 36 }, // Employee ID
    { wch: 20 }, // Last Name
    { wch: 20 }, // First Name
    { wch: 12 }, // TAJ
    { wch: 12 }, // Tax ID
    { wch: 25 }, // Position
    { wch: 15 }, // Department
    { wch: 15 }, // Employment Type
    { wch: 15 }, // Contract Type
    { wch: 15 }, // Base Salary
    { wch: 15 }, // Total Allowances
    { wch: 15 }, // Taxable Allowances
    { wch: 18 }, // Non-Taxable Allowances
    { wch: 15 }, // Total Deductions
    { wch: 15 }, // Gross Total
    { wch: 15 }, // Net Before Tax
    { wch: 8 },  // Currency
    { wch: 30 }, // IBAN
    { wch: 20 }, // Bank
    { wch: 12 }, // Worked Days
    { wch: 12 }, // Leave Days
    { wch: 15 }, // Actual Days
    { wch: 12 }  // Hours
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, `Payroll ${month}-${year}`);
  
  // Add detailed allowances sheet if any employee has allowances
  const hasAllowances = data.some(emp => 
    emp.allowances_detail && Array.isArray(emp.allowances_detail) && emp.allowances_detail.length > 0
  );
  
  if (hasAllowances) {
    addAllowancesDetailSheet(workbook, data, month, year);
  }
  
  // Add detailed deductions sheet if any employee has deductions
  const hasDeductions = data.some(emp => 
    emp.deductions_detail && Array.isArray(emp.deductions_detail) && emp.deductions_detail.length > 0
  );
  
  if (hasDeductions) {
    addDeductionsDetailSheet(workbook, data, month, year);
  }
}

/**
 * Allowances detail sheet
 */
function addAllowancesDetailSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
  const sheetData : (string | number)[][]= [
    ['Allowances & Benefits Detail'],
    [],
    ['Employee Name', 'Employee ID', 'Type', 'Amount', 'Tax Treatment', 'Frequency', 'Description']
  ];
  
  data.forEach(emp => {
    if (emp.allowances_detail && Array.isArray(emp.allowances_detail) && emp.allowances_detail.length > 0) {
      emp.allowances_detail.forEach(allowance => {
        sheetData.push([
          `${emp.user_firstname} ${emp.user_lastname}`,
          emp.user_id,
          formatAllowanceType(allowance.type),
          Number(allowance.amount) || 0,
          formatTaxTreatment(allowance.tax_treatment),
          allowance.is_recurring ? 'Monthly' : 'One-Time',
          allowance.description || ''
        ]);
      });
    }
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet['!cols'] = [
    { wch: 25 }, // Name
    { wch: 36 }, // ID
    { wch: 20 }, // Type
    { wch: 15 }, // Amount
    { wch: 20 }, // Tax Treatment
    { wch: 15 }, // Frequency
    { wch: 40 }  // Description
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Allowances Detail');
}

/**
 * Deductions detail sheet
 */
function addDeductionsDetailSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
  const sheetData : (string | number)[][] = [
    ['Deductions Detail'],
    [],
    ['Employee Name', 'Employee ID', 'Type', 'Amount', 'Remaining', 'Installments Left', 'Description']
  ];
  
  data.forEach(emp => {
    if (emp.deductions_detail && Array.isArray(emp.deductions_detail) && emp.deductions_detail.length > 0) {
      emp.deductions_detail.forEach(deduction => {
        sheetData.push([
          `${emp.user_firstname} ${emp.user_lastname}`,
          emp.user_id,
          formatDeductionType(deduction.type),
          Number(deduction.amount) || 0,
          Number(deduction.remaining_amount) || 0,
          Number(deduction.installments_remaining) || 0,
          deduction.description || ''
        ]);
      });
    }
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet['!cols'] = [
    { wch: 25 }, // Name
    { wch: 36 }, // ID
    { wch: 20 }, // Type
    { wch: 15 }, // Amount
    { wch: 15 }, // Remaining
    { wch: 18 }, // Installments
    { wch: 40 }  // Description
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Deductions Detail');
}

/**
 * Kulcs-Soft Bérkalkulátor format with compensation
 */
function addKulcsSoftSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
  const sheetData = [
    [
      'Dolgozói azonosító', 'Vezetéknév', 'Keresztnév', 'TAJ szám', 'Adóazonosító jel',
      'Munkakör', 'Szervezeti egység', 'Foglalkoztatás típusa', 'Szerződés típusa',
      'Alapbér', 'Pótlékok összesen', 'Adóköteles pótlékok', 'Adómentes pótlékok',
      'Levonások összesen', 'Bruttó összesen', 'Nettó (adózás előtt)',
      'Fizetési időszak', 'Bankszámlaszám', 'Bank neve',
      'Ledolgozott napok', 'Szabadság napok', 'Tényleges munkanapok',
      'Adókulcs', 'Családi kedvezmény (gyerekek száma)',
      'Nyugdíjpénztár típusa', 'Egészségbiztosítási szám'
    ]
  ];
  
  const employmentTypeMap: Record<string, string> = {
    'full_time': 'Teljes munkaidő',
    'part_time': 'Részmunkaidő',
    'contractor': 'Megbízási',
    'intern': 'Gyakornok',
    'temporary': 'Ideiglenes'
  };
  
  const contractTypeMap: Record<string, string> = {
    'permanent': 'Határozatlan idejű',
    'fixed_term': 'Határozott idejű',
    'probation': 'Próbaidős'
  };
  
  data.forEach(emp => {
    const countryData = emp.country_specific_data || {};
    sheetData.push([
      emp.user_id,
      emp.user_lastname,
      emp.user_firstname,
      countryData.taj_number || '',
      countryData.tax_id || '',
      emp.position_title,
      emp.department || '',
      employmentTypeMap[emp.employment_type] || emp.employment_type,
      contractTypeMap[emp.contract_type] || emp.contract_type,
      Number(emp.salary_amount) || 0,
      Number(emp.total_allowances) || 0,
      Number(emp.taxable_allowances) || 0,
      Number(emp.non_taxable_allowances) || 0,
      Number(emp.total_deductions) || 0,
      Number(emp.gross_total) || Number(emp.salary_amount) || 0,
      Number(emp.net_before_tax) || Number(emp.salary_amount) || 0,
      'Havi',
      emp.bank_account_iban || '',
      emp.bank_name || '',
      Number(emp.worked_days) || 0,
      Number(emp.leave_days) || 0,
      Number(emp.actual_worked_days) || 0,
      countryData.tax_bracket || '1',
      Number(countryData.family_tax_allowance) || 0,
      countryData.pension_fund === 'private' ? 'Magán' : 'Állami',
      countryData.health_insurance_number || ''
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet['!cols'] = Array(26).fill({ wch: 15 });
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Kulcs-Soft Import');
}

/**
 * Nexon format with compensation
 */
function addNexonSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
  const sheetData = [
    [
      'EmpID', 'Surname', 'FirstName', 'SSN', 'TaxID',
      'JobTitle', 'OrgUnit', 'EmpType', 
      'BaseSalary', 'Allowances', 'TaxableAllow', 'NonTaxAllow',
      'Deductions', 'GrossTotal', 'NetBeforeTax',
      'Currency', 'IBAN', 
      'WorkedDays', 'AbsenceDays', 
      'TaxClass', 'FamilyAllowance', 'PensionType'
    ]
  ];
  
  data.forEach(emp => {
    const countryData = emp.country_specific_data || {};
    sheetData.push([
      emp.user_id.substring(0, 8),
      emp.user_lastname,
      emp.user_firstname,
      countryData.taj_number || '',
      countryData.tax_id || '',
      emp.position_title,
      emp.department || '',
      emp.employment_type.toUpperCase(),
      Number(emp.salary_amount) || 0,
      Number(emp.total_allowances) || 0,
      Number(emp.taxable_allowances) || 0,
      Number(emp.non_taxable_allowances) || 0,
      Number(emp.total_deductions) || 0,
      Number(emp.gross_total) || Number(emp.salary_amount) || 0,
      Number(emp.net_before_tax) || Number(emp.salary_amount) || 0,
      'HUF',
      emp.bank_account_iban || '',
      Number(emp.worked_days) || 0,
      Number(emp.leave_days) || 0,
      countryData.tax_bracket || '1',
      Number(countryData.family_tax_allowance) || 0,
      (countryData.pension_fund || 'government').toUpperCase().charAt(0)
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet['!cols'] = Array(22).fill({ wch: 12 });
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nexon Import');
}

/**
 * SAP HCM format with compensation
 */
function addSAPSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
  const sheetData = [
    [
      'Personnel Number', 'Last Name', 'First Name', 'National ID', 'Tax Number',
      'Position', 'Cost Center', 'Employee Group', 'Employee Subgroup',
      'Basic Pay', 'Total Allowances', 'Taxable Allowances', 'Non-Taxable Allowances',
      'Total Deductions', 'Gross Pay', 'Net Pay Before Tax',
      'Pay Scale Group', 'Bank Account', 'Bank Key',
      'Calendar Days', 'Absence Days', 'Payroll Days',
      'Tax Class', 'Number of Children', 'Health Insurance Fund'
    ]
  ];
  
  const employmentGroupMap: Record<string, string> = {
    'full_time': '1',
    'part_time': '2',
    'contractor': '9',
    'intern': '3',
    'temporary': '5'
  };
  
  const contractSubgroupMap: Record<string, string> = {
    'permanent': 'A1',
    'fixed_term': 'A2',
    'probation': 'A3'
  };
  
  data.forEach(emp => {
    const countryData = emp.country_specific_data || {};
    
    // Generate 8-digit personnel number (simplified)
    const personnelNumber = String(Math.abs(hashCode(emp.user_id))).padStart(8, '0').substring(0, 8);
    
    sheetData.push([
      personnelNumber,
      emp.user_lastname.toUpperCase(),
      emp.user_firstname.toUpperCase(),
      countryData.taj_number || '',
      countryData.tax_id || '',
      emp.position_title,
      emp.department || '',
      employmentGroupMap[emp.employment_type] || '1',
      contractSubgroupMap[emp.contract_type] || 'A1',
      Number(emp.salary_amount) || 0,
      Number(emp.total_allowances) || 0,
      Number(emp.taxable_allowances) || 0,
      Number(emp.non_taxable_allowances) || 0,
      Number(emp.total_deductions) || 0,
      Number(emp.gross_total) || Number(emp.salary_amount) || 0,
      Number(emp.net_before_tax) || Number(emp.salary_amount) || 0,
      'M1',
      emp.bank_account_iban || '',
      emp.bank_name || '',
      Number(emp.worked_days) || 0,
      Number(emp.leave_days) || 0,
      Number(emp.actual_worked_days) || 0,
      countryData.tax_bracket || '1',
      Number(countryData.family_tax_allowance) || 0,
      countryData.health_insurance_number || ''
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet['!cols'] = Array(25).fill({ wch: 14 });
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SAP Import');
}

/**
 * Helper: Format allowance type for display
 */
function formatAllowanceType(type: string): string {
  const typeMap: Record<string, string> = {
    'bonus': 'Bonus',
    'remboursement': 'Reimbursement',
    'cafeteria': 'Cafétéria',
    'sport': 'Sport Allowance',
    'cadeau': 'Gift/Cadeau',
    'other': 'Other'
  };
  return typeMap[type] || type;
}

/**
 * Helper: Format deduction type for display
 */
function formatDeductionType(type: string): string {
  const typeMap: Record<string, string> = {
    'advance_on_salary': 'Salary Advance',
    'loan_repayment': 'Loan Repayment',
    'other': 'Other Deduction'
  };
  return typeMap[type] || type;
}

/**
 * Helper: Format tax treatment for display
 */
function formatTaxTreatment(treatment: string): string {
  const treatmentMap: Record<string, string> = {
    'fully_taxable': 'Fully Taxable',
    'non_taxable': 'Non-Taxable',
    'partially_taxable': 'Partially Taxable',
    'tax_free_under_limit': 'Tax-Free (Under Limit)'
  };
  return treatmentMap[treatment] || treatment;
}

/**
 * Simple hash function for generating personnel numbers
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Download Excel file
 */
export function downloadPayrollExcel(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export payroll data to Excel and download
 */
export async function exportAndDownloadPayroll(options: ExportOptions) {
  const monthName = new Date(options.year, options.month - 1).toLocaleString('en-US', { month: 'long' });
  const fileName = `Payroll_HU_${monthName}_${options.year}_${options.format}.xlsx`;
  
  const blob = generatePayrollExcel(options);
  downloadPayrollExcel(blob, fileName);
}